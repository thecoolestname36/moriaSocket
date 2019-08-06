using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.IO;
using System.Text;

namespace moriaSocket.Components
{
	public class WebSocketSecurity
	{

		private RSACryptoServiceProvider RSAProvider;
		private AesManaged AesProvider;
		private string PublicRSAKey;

		public WebSocketSecurity() {
			this.RSAProvider = new RSACryptoServiceProvider(4096);
			RSAParameters r = this.RSAProvider.ExportParameters(false);
			Dictionary<string, string> d = new Dictionary<string, string>(2)
			{
				{ "modulus", Convert.ToBase64String(r.Modulus) },
				{ "exponent", Convert.ToBase64String(r.Exponent) }
			};
			this.PublicRSAKey = System.Web.Helpers.Json.Encode(d);
			this.AesProvider = new AesManaged();
			this.AesProvider.BlockSize = 128;
			this.AesProvider.KeySize = 256;
			this.AesProvider.Mode = CipherMode.CBC;
			this.AesProvider.Padding = PaddingMode.PKCS7;
		}

		public string GetPublicRSAKey() {
			return this.PublicRSAKey;
		}

		public byte[] GetAesKey()
		{
			return this.AesProvider.Key;
		}

		public void SetAesKey(string Key)
		{
			try
			{
				byte[] b = Encoding.UTF8.GetBytes(Key);
				this.AesProvider.Key = b;
			}
			catch (Exception e) {
				string error = e.Message;
			}
		}

		public void SetAesIv(string Iv)
		{
			try
			{
				byte[] b = Encoding.UTF8.GetBytes(Iv);
				this.AesProvider.IV = b;
			}
			catch (Exception e)
			{
				string error = e.Message;
			}
		}

		public string DecryptRSAMessage(byte[] payload)
		{
			try
			{
				return ByteArrayToString(this.RSAProvider.Decrypt(payload, false));
			}
			catch (Exception e) {
				string s = e.Message;
			}
			return "";
		}

		public string ByteArrayToString(byte[] arr)
		{
			string s = "";
			for (int i = 0, max = arr.Length; i < max; i++)
			{
				s += (char)arr[i];
			}
			return s;
		}

		public string DecryptAesMessage(byte[] payload)
		{
			
			string plaintext = "";

			ICryptoTransform decryptor = this.AesProvider.CreateDecryptor();

			// Create the streams used for decryption.
			using (MemoryStream msDecrypt = new MemoryStream(payload))
			{
				using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
				{
					using (StreamReader srDecrypt = new StreamReader(csDecrypt))
					{
						try
						{
							plaintext = srDecrypt.ReadToEnd();
						}
						catch (Exception e)
						{
							string err = e.Message;
						}
					}
				}
			}
			return plaintext;
		}

		public byte[] EncryptAesMessage(string message) {

			byte[] payload;

			ICryptoTransform encryptor = this.AesProvider.CreateEncryptor();

			// Create the streams used for encryption.
			using (MemoryStream msEncrypt = new MemoryStream())
			{
				using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
				{
					using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
					{
						//Write all data to the stream.
						swEncrypt.Write(message);
					}
					payload = msEncrypt.ToArray();
				}
			}

			return payload;

		}

	}

}