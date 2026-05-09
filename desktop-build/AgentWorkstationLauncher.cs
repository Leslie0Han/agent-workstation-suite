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

namespace AgentWorkstationDesktop
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
            Text = "Agent 工作站";
            Width = 1500;
            Height = 940;
            MinimumSize = new Size(1120, 720);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(245, 243, 238);
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

            int borderColor = ColorTranslator.ToWin32(Color.FromArgb(218, 224, 238));
            int captionColor = ColorTranslator.ToWin32(Color.FromArgb(247, 248, 252));
            int textColor = ColorTranslator.ToWin32(Color.FromArgb(32, 42, 64));
            DwmSetWindowAttribute(Handle, 34, ref borderColor, sizeof(int));
            DwmSetWindowAttribute(Handle, 35, ref captionColor, sizeof(int));
            DwmSetWindowAttribute(Handle, 36, ref textColor, sizeof(int));
        }

        private Icon CreateAppIcon()
        {
            Bitmap bitmap = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bitmap))
            using (Brush bg = new SolidBrush(Color.FromArgb(37, 44, 72)))
            using (Brush card = new SolidBrush(Color.FromArgb(246, 248, 255)))
            using (Brush green = new SolidBrush(Color.FromArgb(91, 184, 122)))
            using (Brush blue = new SolidBrush(Color.FromArgb(75, 112, 217)))
            using (Pen line = new Pen(Color.FromArgb(166, 180, 220), 2))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                g.Clear(Color.Transparent);
                g.FillRectangle(bg, 3, 3, 26, 26);
                g.FillRectangle(card, 8, 7, 16, 6);
                g.FillEllipse(green, 7, 18, 8, 8);
                g.FillEllipse(blue, 18, 18, 8, 8);
                g.DrawLine(line, 15, 22, 18, 22);
            }
            return Icon.FromHandle(bitmap.GetHicon());
        }

        private async Task StartAsync()
        {
            appRoot = AppDomain.CurrentDomain.BaseDirectory;
            Directory.CreateDirectory(Path.Combine(appRoot, "data"));

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
