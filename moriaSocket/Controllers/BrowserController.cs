using System;
using System.Collections.Generic;
using System.Web.Mvc;
using System.Threading.Tasks;
using moriaSocket.Components;
using moriaSocket.Components.Browser;

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
					new BrowserSocket(
						WSSID,
						new BrowserDirectoryWatcher(dir)
					)
				);
				WebSocketManager.BrowserSockets.TryGetValue(WSSID, out BrowserSocket socket);
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

		[HttpPost]
		public async Task<ActionResult> FileEncryptDownload(string wssid, string payload)
		{
			if(wssid.Length < 1 || payload.Length < 1) {
				return new HttpStatusCodeResult(400, "Bad Request");
			}
			if(HttpContext.Request == null || !HttpContext.Request.IsSecureConnection) {
				return new HttpStatusCodeResult(505, "Connection must use TLS");
			}
			if(!System.Web.HttpContext.Current.User.Identity.IsAuthenticated) {
				return new HttpStatusCodeResult(401, "Not Authorized");
			}
			string dir = Environment.GetEnvironmentVariable("ASPNET_MORIA_DIRECTORY", EnvironmentVariableTarget.Machine);
			if(dir == null) {
				return new HttpStatusCodeResult(500, "System Configuration Error.");
			}
			if(!System.IO.Directory.Exists(dir)) {
				return new HttpStatusCodeResult(500, "File System Configuration Error.");
			}
			string result = "";
			if(WebSocketManager.BrowserSockets.TryGetValue(wssid, out BrowserSocket socket)) {
				Dictionary<string, string> requestJson = System.Web.Helpers.Json.Decode<Dictionary<string, string>>(socket.DecryptAes(payload));
				if(requestJson.TryGetValue("path", out string requestPath) && requestJson.TryGetValue("name", out string requestName) && requestName.Length > 0) {
					string relativePath = requestPath + System.IO.Path.DirectorySeparatorChar + requestName;
					if(Utilities.AllowedPath(dir, relativePath)) {
						string fullPath = dir + relativePath;
						if (System.IO.File.Exists(fullPath)) {
							using (FileEncryptDownload fileEncryptDownload = new FileEncryptDownload(socket, fullPath)) {
								result = await fileEncryptDownload.EncryptToString();
								fileEncryptDownload.Dispose();
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

		[HttpPost]
		public ActionResult FileDownload(Models.Browser.Download download) {

			if(download.Wssid == null || download.Wssid.Length < 1) {
				return new HttpStatusCodeResult(400, "Bad Request");
			}
			if(HttpContext.Request == null || !HttpContext.Request.IsSecureConnection) {
				return new HttpStatusCodeResult(505, "Connection must use TLS");
			}
			if(!System.Web.HttpContext.Current.User.Identity.IsAuthenticated) {
				return new HttpStatusCodeResult(401, "Not Authorized");
			}
			string dir = Environment.GetEnvironmentVariable("ASPNET_MORIA_DIRECTORY", EnvironmentVariableTarget.Machine);
			if(dir == null) {
				return new HttpStatusCodeResult(500, "System Configuration Error.");
			}
			if(!System.IO.Directory.Exists(dir)) {
				return new HttpStatusCodeResult(500, "File System Configuration Error.");
			}

			if(WebSocketManager.BrowserSockets.TryGetValue(download.Wssid, out BrowserSocket socket)) {

				Dictionary<string, string> requestJson = System.Web.Helpers.Json.Decode<Dictionary<string, string>>(socket.DecryptAes(download.Payload));
				if(requestJson.TryGetValue("path", out string requestPath) && requestJson.TryGetValue("name", out string requestName) && requestName.Length > 0) {

					string relativePath = requestPath + System.IO.Path.DirectorySeparatorChar + requestName;
					if(!Utilities.AllowedPath(dir, relativePath)) {
						return new HttpStatusCodeResult(403, "Path Not Allowed");
					}

					if(!System.IO.File.Exists(dir + System.IO.Path.DirectorySeparatorChar + relativePath)) {
						return new HttpStatusCodeResult(404, "File Not Found");
					}

					// We have full authenticationa and the file exists. Parse and serve file.
					byte[] fileBytes = System.IO.File.ReadAllBytes(dir + System.IO.Path.DirectorySeparatorChar + relativePath);
					return File(fileBytes, System.Net.Mime.MediaTypeNames.Application.Octet, requestName);
				}
				return new HttpStatusCodeResult(500, "System Configuration Error.");
			}
			return new HttpStatusCodeResult(400, "Bad request.");
		}

	}

}
