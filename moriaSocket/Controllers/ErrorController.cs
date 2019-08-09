using System.Web.Mvc;

namespace moriaSocket.Controllers
{
    public class ErrorController : Controller
    {

		public ActionResult Unauthorized()
		{
			ViewBag.Code = 401;
			ViewBag.Message = "Unautorized";
			return View("Error");
		}

		public ActionResult Timeout()
		{
			if (HttpContext.User.Identity.IsAuthenticated)
			{
				return new RedirectResult("https://"+HttpContext.Request.Url.Host);
			}
			else {
				return new HttpUnauthorizedResult("Timeout.");
			}
		}

		public ActionResult BadRequest() {
			ViewBag.Code = 400;
			ViewBag.Message = "Bad Request";
			return View("Error");
		}
    }
}