using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace moriaSocket.Components.Browser
{
	public static class Utilities
	{

		public static string Idify(string s) {
			s = s.Replace(' ', '_');
			return s;
		}

	}
}