class WebSocketTLS extends WebSocket {

	Security = false;
	_SecurityStatus = 0;
	set SecurityStatus(val) {
		this._SecurityStatus = val;
		if (this._SecurityStatus == this.STATUS_SECURE) {
			this.onsecure();
		}
	}; 
	get SecurityStatus() {
		return this._SecurityStatus;
	};
	STATUS_UNSECURE = 0;
	STATUS_RSA_RECEIVED = 1;
	STATUS_RSA_AUTH_SENT = 2;
	STATUS_AES_SENT = 3;
	STATUS_HANDSHAKING = 4;
	STATUS_SECURE = 5;

	constructor(security, url, protocol = "") {
		super(url, protocol);
		this.Security = security;

		// WebSocket action listeners //
		this.onmessage = this.KeyExchange;
		this.onsecure = function () { }
		this.onclosed = function (event) { };

	}

	IsReady() {
		return this.readyState == this.OPEN && this.SecurityStatus == this.STATUS_SECURE;
	}

	KeyExchange(event) {
		var publicKey = JSON.parse(event.data);
		this.Security.SetRSAPublicKey(b64tohex(publicKey.modulus), b64tohex(publicKey.exponent));
		this.SecurityStatus = this.STATUS_RSA_RECEIVED;
		this.SendRSABase64(
			JSON.stringify(
				{
					key: this.Security.AesKey,
					iv: this.Security.AesIv
				}
			)
		);
		this.Security.AesKey = CryptoJS.enc.Utf8.parse(this.Security.AesKey);
		this.Security.AesIv = CryptoJS.enc.Utf8.parse(this.Security.AesIv);
		this.onmessage = this.Handshake;
		this.SendAesBase64(this.Security.AesOath, true);
		this.SecurityStatus = this.STATUS_HANDSHAKING;
	}

	Handshake(payload) {
		if (this.HandshakeAesBase64(payload) === this.Security.AesOath) {
			this.onmessage = this.ReceiveAesBase64;
			this.SecurityStatus = this.STATUS_SECURE;
		} else {
			this.onmessage = false;
			this.SecurityStatus = this.STATUS_UNSECURE;
			this.close();
		}
		
	}

	/**
	 * TODO: implement when public key authentication happens on the final server.
	 * @param {any} event
	 */
	//PublicKeyAuth(event) {
	//	var publicKey = JSON.parse(event.data);
	//	this.Security.SetRSAPublicKey(b64tohex(publicKey.modulus), b64tohex(publicKey.exponent));
	//	this.SendRSABase64(prompt("Password"));
	//	this.onmessage = this.SendAesKeysRSA;
	//}

	/**
	 * TODO: implement when public key authentication happens on the final server.
	 * @param {any} event
	 */
	//SendAesKeysRSA(event) {
	//	if (event.data == "true") {
	//		this.SendRSABase64(
	//			JSON.stringify(
	//				{
	//					key: this.Security.AesKey,
	//					iv: this.Security.AesIv
	//				}
	//			));
	//		this.Security.AesKey = CryptoJS.enc.Utf8.parse(this.Security.AesKey);
	//		this.Security.AesIv = CryptoJS.enc.Utf8.parse(this.Security.AesIv);
	//		this.onmessage = this.ReceiveAesBase64;
	//	}
	//}

	HandshakeAesBase64(event) {
		var payload = event.data;
		var message = this.Security.AesDecrypt(payload);
		return message.toString(CryptoJS.enc.Utf8);
	}

	ReceiveAesBase64(payload) {
		if (this.IsReady()) {
			var message = this.Security.AesDecrypt(payload.data);
			this.ReceiveSecure(message.toString(CryptoJS.enc.Utf8));
		} else {
			console.warn("WARNING: Not ready to receive Aes messages.");
		}
	}

	SendSecure(message) {
		this.SendAesBase64(message);
	}

	SendAesBase64(message, handshaking = false) {
		if (this.IsReady() || handshaking) {
			var payload = this.Security.AesEncrypt(message);
			this.send(payload.ciphertext.toString(CryptoJS.enc.Base64));
			return true;
		} else {
			console.warn("WARNING: Not ready to send Aes messages.");
		}
		return false;
	}

	SendRSABase64(message) {
		if (this.SecurityStatus == this.STATUS_RSA_RECEIVED) {
			this.send(
				hex2b64(
					this.Security.RSAEncrypt(
						message
					)
				)
			);
		} else {
			console.warn("WARNING: Not ready to send RSA messages.");
		}
	}

}