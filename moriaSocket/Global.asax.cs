using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;

namespace moriaSocket
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
			moriaSocket.Components.WebSocketManager wsh = new moriaSocket.Components.WebSocketManager();
        }

		void WindowsAuthentication_OnAuthenticate(object sender, WindowsAuthenticationEventArgs e)
		{
			// ensure we have a name and made it through authentication
			if (e.Identity != null && e.Identity.IsAuthenticated)
			{
				//create your principal, pass in the identity so you know what permissions are tied to
				Components.MoriaUser opPrincipal = new Components.MoriaUser(e.Identity);
				//assign your principal to the HttpContext.Current.User, or perhaps Thread.Current
				HttpContext.Current.User = opPrincipal;
			}
		}
	}
}
