class WebSocketTLS extends WebSocket {

	ReconnectTimeout = false;
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
		this.onopen = function (event) {
			document.getElementById("wss-connection").innerHTML = "Open - Unsecure";
		};
		this.onclose = function (event) {
			document.getElementById("wss-connection").innerHTML = "Closed";
			this.ReconnectTimeout = setTimeout(function () {
				document.Main();
			}, 3000);
			this.onclosed(event);
		};
		this.onmessage = this.KeyExchange;

		this.onerror = function (event) {
			document.getElementById("wss-connection").innerHTML = "Error Observed ( see console log )";
			console.error("WebSocket error observed:", event);
		};

		this.onsecure = function () { }
		this.onclosed = function (event) { };

	}

	IsReady() {
		return this.readyState == this.OPEN && this.SecurityStatus == this.STATUS_SECURE;
	}

	KeyExchange(event) {
		document.getElementById("wss-connection").innerHTML = "Open - Handshaking...";
		var publicKey = JSON.parse(event.data);
		document.Socket.Security.SetRSAPublicKey(b64tohex(publicKey.modulus), b64tohex(publicKey.exponent));
		document.Socket.SecurityStatus = document.Socket.STATUS_RSA_RECEIVED;
		document.Socket.SendRSABase64(
			JSON.stringify(
				{
					key: document.Socket.Security.AesKey,
					iv: document.Socket.Security.AesIv
				}
			)
		);
		document.Socket.Security.AesKey = CryptoJS.enc.Utf8.parse(document.Socket.Security.AesKey);
		document.Socket.Security.AesIv = CryptoJS.enc.Utf8.parse(document.Socket.Security.AesIv);
		document.getElementById("wss-connection").innerHTML = "Open - Key Exchange Complete...";
		document.Socket.onmessage = document.Socket.Handshake;
		document.Socket.SendAesBase64(document.Socket.Security.AesOath, true);
		document.Socket.SecurityStatus = document.Socket.STATUS_HANDSHAKING;
	}

	Handshake(payload) {
		if (document.Socket.HandshakeAesBase64(payload) === document.Socket.Security.AesOath) {
			document.getElementById("wss-connection").innerHTML = "Open - Handshake Complete";
			document.Socket.onmessage = document.Socket.ReceiveAesBase64;
			document.Socket.SecurityStatus = document.Socket.STATUS_SECURE;
		} else {
			document.Socket.onmessage = false;
			document.Socket.SecurityStatus = document.Socket.STATUS_UNSECURE;
			document.getElementById("wss-connection").innerHTML = "Handshake Failed! Restarting...";
			document.Socket.close();
		}
		
	}

	/**
	 * TODO: implement when public key authentication happens on the final server.
	 * @param {any} event
	 */
	//PublicKeyAuth(event) {
	//	var publicKey = JSON.parse(event.data);
	//	document.Socket.Security.SetRSAPublicKey(b64tohex(publicKey.modulus), b64tohex(publicKey.exponent));
	//	document.Socket.SendRSABase64(prompt("Password"));
	//	document.Socket.onmessage = document.Socket.SendAesKeysRSA;
	//}

	/**
	 * TODO: implement when public key authentication happens on the final server.
	 * @param {any} event
	 */
	//SendAesKeysRSA(event) {
	//	if (event.data == "true") {
	//		document.Socket.SendRSABase64(
	//			JSON.stringify(
	//				{
	//					key: document.Socket.Security.AesKey,
	//					iv: document.Socket.Security.AesIv
	//				}
	//			));
	//		document.Socket.Security.AesKey = CryptoJS.enc.Utf8.parse(document.Socket.Security.AesKey);
	//		document.Socket.Security.AesIv = CryptoJS.enc.Utf8.parse(document.Socket.Security.AesIv);
	//		document.Socket.onmessage = document.Socket.ReceiveAesBase64;
	//	}
	//}

	HandshakeAesBase64(event) {
		var payload = event.data;
		var message = document.Socket.Security.AesDecrypt(payload);
		return message.toString(CryptoJS.enc.Utf8);
	}

	ReceiveAesBase64(payload) {
		if (document.Socket.IsReady()) {
			var message = document.Socket.Security.AesDecrypt(payload.data);
			document.Socket.ReceiveSecure(message.toString(CryptoJS.enc.Utf8));
		} else {
			console.log("WARNING: Not ready to receive Aes messages.");
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
			console.log("WARNING: Not ready to send Aes messages.");
		}
		return false;
	}

	SendRSABase64(message) {
		if (this.SecurityStatus == this.STATUS_RSA_RECEIVED) {
			document.Socket.send(
				hex2b64(
					document.Socket.Security.RSAEncrypt(
						message
					)
				)
			);
		} else {
			console.log("WARNING: Not ready to send RSA messages.");
		}
	}

}