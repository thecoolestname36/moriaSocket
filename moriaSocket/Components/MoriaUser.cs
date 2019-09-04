using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;


namespace moriaSocket.Components
{
	public class MoriaUser : WindowsPrincipal
	{
		

		private bool IsFullyAuthenticated = false;

		public MoriaUser(WindowsIdentity ntIdentity) : base(ntIdentity)
		{

		}

		public bool FullyAuthenticate(string message) {
			if (this.Identity.IsAuthenticated)
			{
				string username = this.Identity.Name;
				try
				{
					this.IsFullyAuthenticated = System.Web.Security.Membership.ValidateUser(this.Identity.Name, message);
				}
				catch (Exception e) {
					string err = e.Message;
				}
			}
			return this.IsFullyAuthenticated;
		}

		public bool GetIsFullyAuthenticated() {
			return this.IsFullyAuthenticated && this.Identity.IsAuthenticated;
		}
	}
}