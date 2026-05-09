using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace ImageWorkbenchDesktop
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public class MainForm : Form
    {
        private readonly WebView2 webView = new WebView2();
        private Process serverProcess;
        private string appRoot;
        private int port;

        [DllImport("dwmapi.dll")]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        public MainForm()
        {
            Text = "图像生成工作台";
            Width = 1440;
            Height = 920;
            MinimumSize = new Size(1080, 720);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(16, 17, 14);
            Icon = CreateAppIcon();

            webView.Dock = DockStyle.Fill;
            Controls.Add(webView);

            Load += async (sender, args) => await StartAsync();
            FormClosing += (sender, args) => StopServer();
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            ApplyWindowChrome();
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            ApplyWindowChrome();
        }

        private void ApplyWindowChrome()
        {
            if (!IsHandleCreated) return;

            int enabled = 1;
            DwmSetWindowAttribute(Handle, 20, ref enabled, sizeof(int));
            DwmSetWindowAttribute(Handle, 19, ref enabled, sizeof(int));

            int borderColor = ColorTranslator.ToWin32(Color.FromArgb(33, 33, 48));
            int captionColor = ColorTranslator.ToWin32(Color.FromArgb(5, 5, 6));
            int textColor = ColorTranslator.ToWin32(Color.FromArgb(255, 255, 255));
            DwmSetWindowAttribute(Handle, 34, ref borderColor, sizeof(int));
            DwmSetWindowAttribute(Handle, 35, ref captionColor, sizeof(int));
            DwmSetWindowAttribute(Handle, 36, ref textColor, sizeof(int));
        }

        private Icon CreateAppIcon()
        {
            Bitmap bitmap = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bitmap))
            using (Pen white = new Pen(Color.White, 3))
            using (Pen violet = new Pen(Color.FromArgb(143, 71, 174), 2))
            using (Brush primary = new SolidBrush(Color.FromArgb(75, 75, 160)))
            using (Brush dark = new SolidBrush(Color.FromArgb(5, 5, 6)))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                g.Clear(Color.Transparent);
                g.FillRectangle(dark, 2, 2, 28, 28);
                g.DrawRectangle(white, 7, 7, 18, 18);
                g.FillRectangle(primary, 18, 6, 7, 7);
                g.DrawRectangle(violet, 6, 19, 8, 8);
                g.DrawLine(Pens.White, 10, 22, 23, 13);
            }
            return Icon.FromHandle(bitmap.GetHicon());
        }

        private async Task StartAsync()
        {
            appRoot = AppDomain.CurrentDomain.BaseDirectory;
            Directory.CreateDirectory(Path.Combine(appRoot, "data"));
            Directory.CreateDirectory(Path.Combine(appRoot, "outputs"));

            port = FindFreePort();
            StartServer();
            await WaitForServerAsync();

            string userData = Path.Combine(appRoot, "data", "webview2");
            Directory.CreateDirectory(userData);
            CoreWebView2Environment env = await CoreWebView2Environment.CreateAsync(null, userData);
            await webView.EnsureCoreWebView2Async(env);
            webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            webView.CoreWebView2.Navigate("http://127.0.0.1:" + port + "/");
        }

        private void StartServer()
        {
            string nodePath = Path.Combine(appRoot, "runtime", "node.exe");
            if (!File.Exists(nodePath))
            {
                nodePath = "node.exe";
            }

            string serverPath = Path.Combine(appRoot, "server.mjs");
            if (!File.Exists(serverPath))
            {
                MessageBox.Show("找不到 server.mjs，程序文件不完整。", "启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
                Close();
                return;
            }

            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                FileName = nodePath,
                Arguments = "server.mjs",
                WorkingDirectory = appRoot,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            startInfo.EnvironmentVariables["PORT"] = port.ToString();

            serverProcess = Process.Start(startInfo);
        }

        private async Task WaitForServerAsync()
        {
            string url = "http://127.0.0.1:" + port + "/";
            for (int i = 0; i < 80; i++)
            {
                bool ready = false;
                try
                {
                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                    request.Timeout = 500;
                    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                    {
                        ready = (int)response.StatusCode < 500;
                    }
                }
                catch
                {
                }
                if (ready) return;
                await Task.Delay(150);
            }
            MessageBox.Show("本地服务启动超时。", "启动失败", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }

        private int FindFreePort()
        {
            TcpListener listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            int freePort = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return freePort;
        }

        private void StopServer()
        {
            try
            {
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    serverProcess.Kill();
                    serverProcess.Dispose();
                }
            }
            catch
            {
            }
        }
    }
}
