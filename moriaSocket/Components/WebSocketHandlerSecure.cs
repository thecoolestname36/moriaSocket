using System;
using System.Threading.Tasks;
using System.Web.WebSockets;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Collections.Generic;

namespace moriaSocket.Components
{
	public abstract class WebSocketHandlerSecure
	{

		public bool HandshakeComplete = false;
		public AspNetWebSocketContext Context;
		private WebSocketSecurity SecurityInstance = new WebSocketSecurity();
		public AspNetWebSocketOptions WebSocketOptions;


		public bool IsOpen() {
			return this.Context.WebSocket.State == WebSocketState.Open;
		}

		public bool IsReady() {
			return this.HandshakeComplete == true;
		}

		public async Task HandleSocket(AspNetWebSocketContext socketContext)
		{
			//System.Web.Security.Membership.Vali
			//((BrowserUser)this.Context.User).GetIsFullyAuthenticated();

			this.Context = socketContext;
			
			SpinWait.SpinUntil(() => this.IsOpen());

			// Sends the public key to client
			await this.Send(Encoding.UTF8.GetBytes(this.SecurityInstance.GetPublicRSAKey()), WebSocketMessageType.Text);

			//// Maybe use this to fully authenticate a user with a provided password
			//string password = this.SecurityInstance.DecryptRSAMessage(Convert.FromBase64String(this.GetMessage()));
			//((BrowserUser)this.Context.User).FullyAuthenticate(password);
			//if (((BrowserUser)this.Context.User).GetIsFullyAuthenticated())
			//{
			//	await this.Send(Encoding.UTF8.GetBytes("true"), WebSocketMessageType.Text);
			//}


			string message = this.SecurityInstance.DecryptRSAMessage(Convert.FromBase64String(this.GetMessage()));
			if (message.Length > 0) {
				Dictionary<string, string> Aes = System.Web.Helpers.Json.Decode<Dictionary<string, string>>(message);
				if (Aes.TryGetValue("key", out string key)) {
					this.SecurityInstance.SetAesKey(key);
					if (Aes.TryGetValue("iv", out string iv)) {
						this.SecurityInstance.SetAesIv(iv);

						// Key Exchange success, start repeat AesOath back to client...
						string aesOath = this.GetMessageSecure();
						await Task.Run(() => this.SendAes(aesOath));

						// If connection is still established here, the handshake is a success, and we can start transmissions!
						this.HandshakeComplete = true;
						await Task.Run(() => this.ReceiveAesBase64Thread());

					}
				}
			}

			System.Diagnostics.Debug.WriteLine("Transmissions complete, end thread");
			// Transmissions complete, end thread
		}


		public string GetMessage() {
			bool complete = false;
			string message = "";
			while (!complete && this.IsOpen()) {
				ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[WebSocketManager.BUFFER_SIZE]);
				Task<WebSocketReceiveResult> result = this.Context.WebSocket.ReceiveAsync(buffer, CancellationToken.None);
				result.Wait();
				if (this.IsOpen())
				{
					for (int i = 0, max = WebSocketManager.BUFFER_SIZE; i < max; i++)
					{
						byte b = buffer.Array[i];
						if (b > 0)
						{
							message += (char)buffer.Array[i];
						}
					}
				}
				complete = result.Result.EndOfMessage;
			}
			return message;
		}
		

		public string GetMessageSecure() {
			string payload = this.GetMessage();
			string message = "";
			if (payload.Length > 0)
			{
				message = this.SecurityInstance.DecryptAesMessage(
					Convert.FromBase64String(payload)
				);
			}
			return message;

		}

		public abstract void ReceiveAesBase64Thread();

		public Task Send(byte[] message, WebSocketMessageType type, bool endOfMessage = true)
		{
			ArraySegment<byte> messageSegment = new ArraySegment<byte>(message);
			return this.Context.WebSocket.SendAsync(
				messageSegment,
				type,
				endOfMessage,
				CancellationToken.None
			);
		}

		public async void SendAes(string message, bool endOfMessage = true) {
			byte[] payload = this.SecurityInstance.EncryptAesMessage(message);
			if (payload.Length == 0)
			{
				throw new Exception("AES Encryption error: Encryption failed or no message provided");
			}
			await this.Send(Encoding.UTF8.GetBytes(Convert.ToBase64String(payload).ToCharArray()), WebSocketMessageType.Text, endOfMessage);
		}

		public string DecryptAes(string payload)
		{
			string message = "";
			if (payload.Length > 0)
			{
				message = this.SecurityInstance.DecryptAesMessage(
					Convert.FromBase64String(payload)
				);
			}
			return message;
		}

		public byte[] EncryptAes(string message)
		{
			return this.SecurityInstance.EncryptAesMessage(message);
		}

	}
}