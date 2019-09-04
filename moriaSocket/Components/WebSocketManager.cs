using System;
using System.Collections.Generic;

namespace moriaSocket.Components
{
	public class WebSocketManager
	{
		public static int CollectionConcurrency;
		public static Dictionary<string, Browser.BrowserSocket> BrowserSockets;
		public static Random Rand;

		public const int BUFFER_SIZE = 510; // Needs to be a multiple of 3 for the base64 encoding result on the other side.

		public WebSocketManager()
		{
			WebSocketManager.CollectionConcurrency =  Environment.ProcessorCount * 2;
			WebSocketManager.BrowserSockets = new Dictionary<string, Browser.BrowserSocket>();
			WebSocketManager.Rand = new Random();
		}
		
	}
}