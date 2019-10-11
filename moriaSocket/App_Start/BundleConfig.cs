using System.Web;
using System.Web.Optimization;

namespace moriaSocket
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-3.4.1.min.js"));

            //bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
            //            "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));
			

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js"));

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                      "~/Content/CSS/bootstrap.css",
                      "~/Content/CSS/main.css"));

            bundles.Add(new ScriptBundle("~/bundles/socketSecure")
				// JSBN
				.Include("~/Scripts/jsbn/jsbn.js")
				//.Include("~/Scripts/jsbn/jsbn2.js") // Use for client side RSA
				.Include("~/Scripts/jsbn/prng4.js")
				.Include("~/Scripts/jsbn/rng.js")
				.Include("~/Scripts/jsbn/rsa.js")
				//.Include("~/Scripts/jsbn/rsa2.js") // Use for client side RSA
				.Include("~/Scripts/jsbn/base64.js")
				// CryptoJS
				.Include("~/Scripts/crypto-js/crypto-js.js")
				// Secure Socket
				.Include("~/Scripts/socket-secure/Security.js")
				.Include("~/Scripts/socket-secure/WebSocketTLS.js")
			);

			bundles.Add(new ScriptBundle("~/viewBundles/browser")
				.Include("~/Scripts/Views/Browser/LoadingOverlay.js")
				.Include("~/Scripts/Views/Browser/FileRequest.js")
				.Include("~/Scripts/Views/Browser/Breadcrumb.js")
				.Include("~/Scripts/Views/Browser/ServerMessage.js")
				.Include("~/Scripts/Views/Browser/ClientMessage.js")
				.Include("~/Scripts/Views/Browser/Item.js")
				.Include("~/Scripts/Views/Browser/FileItem.js")
				.Include("~/Scripts/Views/Browser/DirectoryItem.js")
				.Include("~/Scripts/Views/Browser/PreviewOverlay.js")
				.Include("~/Scripts/Views/Browser/RightClickContextMenu.js")
				.Include("~/Scripts/Views/Browser/DirectoryExplorer.js")
				.Include("~/Scripts/Views/Browser/BrowserSocket.js")
				.Include("~/Scripts/Views/Browser/Main.js")
			);

		}
    }
}
