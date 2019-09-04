using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Web.Routing;

namespace moriaSocket.Components
{
    public class AuthActionFilterAttribute : ActionFilterAttribute
    {
        override
        public void OnActionExecuting(ActionExecutingContext filterContext)
        {
			bool autenticated = System.Web.HttpContext.Current.User != null && System.Web.HttpContext.Current.User.Identity.IsAuthenticated;
			if (!autenticated)
			{
				filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary {
					{ "controller", "Error" },
					{ "action", "Unauthorized"}
				});
				return;
			}
		}

    }
}