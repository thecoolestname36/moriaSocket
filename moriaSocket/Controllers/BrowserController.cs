using System;
using System.Web.Mvc;
using moriaSocket.Components;
namespace moriaSocket.Controllers
{
	[AuthActionFilterAttribute]
	public class BrowserController : Controller
    {

		// GET: Browser
        public ActionResult Index()
        {
			if (System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
			{
				return View();
			}
			else
			{
				return new HttpStatusCodeResult(401, "Not Authorized");
			}
		}

		public ActionResult OpenBrowser()
		{
			// Early return if the request is not a web socket request
			if (!HttpContext.IsWebSocketRequest) // HttpContext.IsWebSocketRequestUpgrading
			{
				return new HttpStatusCodeResult(400, "Bad Request");
			}
			if (HttpContext.Request == null || !HttpContext.Request.IsSecureConnection)
			{
				return new HttpStatusCodeResult(505, "Connection must use TLS");
			}
			if (!System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
			{
				return new HttpStatusCodeResult(401, "Not Authorized");
			}
				
			try
			{
				string dir = Environment.GetEnvironmentVariable("ASPNET_MORIA_DIRECTORY", EnvironmentVariableTarget.Machine);
				if (dir == null)
				{
					return new HttpStatusCodeResult(500, "System Configuration Error.");
				}
				if (!System.IO.Directory.Exists(dir))
				{
					return new HttpStatusCodeResult(500, "File System Configuration Error.");
				}

				string WSSID = System.Web.HttpContext.Current.User.Identity.Name + "_" + (Guid.NewGuid()).ToString();
				WebSocketManager.BrowserSockets.Add(
					WSSID, 
					new Components.Browser.BrowserSocket(
						WSSID,
						new Components.Browser.BrowserDirectoryWatcher(dir)
					)
				);
				WebSocketManager.BrowserSockets.TryGetValue(WSSID, out Components.Browser.BrowserSocket socket);
				HttpContext.AcceptWebSocketRequest(
					socket.HandleSocket,
					socket.WebSocketOptions
				);

			}
			catch (Exception e)
			{
				return new HttpStatusCodeResult(500, "Internal Server Error: " + e.Message);
			}
			return new HttpStatusCodeResult(101, "Switching Protocol");

		}

		public async System.Threading.Tasks.Task<ActionResult> FileDownload(string wssid, string payload)
		{
			if (wssid.Length < 1 || payload.Length < 1)
			{
				return new HttpStatusCodeResult(400, "Bad Request");
			}
			if (HttpContext.Request == null || !HttpContext.Request.IsSecureConnection)
			{
				return new HttpStatusCodeResult(505, "Connection must use TLS");
			}
			if (!System.Web.HttpContext.Current.User.Identity.IsAuthenticated)
			{
				return new HttpStatusCodeResult(401, "Not Authorized");
			}
			string dir = Environment.GetEnvironmentVariable("ASPNET_MORIA_DIRECTORY", EnvironmentVariableTarget.Machine);
			if (dir == null)
			{
				return new HttpStatusCodeResult(500, "System Configuration Error.");
			}
			if (!System.IO.Directory.Exists(dir))
			{
				return new HttpStatusCodeResult(500, "File System Configuration Error.");
			}
			string result = "";
			if (WebSocketManager.BrowserSockets.TryGetValue(wssid, out Components.Browser.BrowserSocket socket)) {
				System.Collections.Generic.Dictionary<string, string> requestJson = System.Web.Helpers.Json.Decode<System.Collections.Generic.Dictionary<string, string>>(socket.DecryptAes(payload));
				if (requestJson.TryGetValue("path", out string requestPath) && requestJson.TryGetValue("name", out string requestName) && requestName.Length > 0)
				{
					string relativePath = requestPath + System.IO.Path.DirectorySeparatorChar + requestName;
					if (Components.Browser.FileDownload.AllowedPath(dir, relativePath))
					{
						string fullPath = dir + relativePath;
						if (System.IO.File.Exists(fullPath))
						{
							using (Components.Browser.FileDownload fileDownload = new Components.Browser.FileDownload(socket, fullPath))
							{
								result = await fileDownload.EncryptToString();
								fileDownload.Dispose();
							}
						} else {
							return new HttpStatusCodeResult(404, "File Not Found");
						}
					} else {
						return new HttpStatusCodeResult(403, "Path Not Allowed");
					}
				} else {
					return new HttpStatusCodeResult(400, "Bad Request");
				}
			}



			return Content(result);
		}

	}

}