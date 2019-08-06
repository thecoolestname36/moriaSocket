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
			try
			{
				//((BrowserUser)System.Web.HttpContext.Current.User).BrowserDir = new BrowserDirectory(
				//	@"C:\inetpub\moriaSocket\directories",
				//	new BrowserSocketHandler()
				//);
				//HttpContext.AcceptWebSocketRequest(
				//	((BrowserUser)System.Web.HttpContext.Current.User).BrowserDir.BrowserSocket.HandleSocket, 
				//	new AspNetWebSocketOptions() {
				//		SubProtocol = "browser",
				//		RequireSameOrigin = true
				//	}
				//);

				string key = System.Web.HttpContext.Current.User.Identity.Name + "_" + (Guid.NewGuid()).ToString();
				WebSocketManager.BrowserSockets.Add(
					key, 
					new Components.Browser.BrowserSocket(
						key, 
						new Components.Browser.BrowserDirectoryWatcher(@"M:\inetpub\Moria")
					)
				);
				WebSocketManager.BrowserSockets.TryGetValue(key, out Components.Browser.BrowserSocket socket);
				HttpContext.AcceptWebSocketRequest(
					socket.HandleSocket,
					socket.WebSocketOptions
				);

				//((BrowserUser)System.Web.HttpContext.Current.User).BrowserSocket = new BrowserSocket(
				//	System.Web.HttpContext.Current.User.Identity.Name
				//	@"C:\inetpub\moriaSocket\directories");
				//HttpContext.AcceptWebSocketRequest(
				//	((BrowserUser)System.Web.HttpContext.Current.User).BrowserSocket.HandleSocket,
				//	new AspNetWebSocketOptions()
				//	{
				//		SubProtocol = "browser",
				//		RequireSameOrigin = true
				//	}
				//);


			}
			catch (Exception e)
			{
				return new HttpStatusCodeResult(500, "Internal Server Error: " + e.Message);
			}
			return new HttpStatusCodeResult(101, "Switching Protocol");
		}

	}

}