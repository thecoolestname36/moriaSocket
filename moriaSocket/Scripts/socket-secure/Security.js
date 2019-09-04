class Security {

	RSAPublicKey = false;
	AesKey = false;
	AesIv = false;
	AesKeySize;
	AesIvSize;
	Hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	_AesOath = false;
	get AesOath() {
		var oath = this._AesOath;
		if (oath == false) {
			this._AesOath = this.GenerateHexKey(this.AesKeySize);
			return this._AesOath;
		}
		this._AesOath = false;
		return oath;
	}

	constructor(keySize, ivSize) {
		this.AesKeySize = keySize;
		this.AesIvSize = ivSize;
		this.AesKey = this.GenerateHexKey(this.AesKeySize);
		this.AesIv = this.GenerateHexKey(this.AesIvSize);
	}

	GenerateHexKey(bytes) {
		bytes = bytes / 8;
		var random = "";
		var length = this.Hex.length;
		for (var i = 0; i < bytes; i++) {
			random += this.Hex[Number.parseInt(Math.random() * length)];
		}
		return random;
	}

	/**
	 * Uses http://www-cs-students.stanford.edu/~tjw/jsbn/rsa.html
	 * @param JSON publicKey
	 */
	SetRSAPublicKey(modulus, exponent) {
		this.RSAPublicKey = new RSAKey();
		this.RSAPublicKey.setPublic(modulus, exponent);
	}

	RSAEncrypt(message) {
		return this.RSAPublicKey.encrypt(message);
	}

	AesEncrypt(message) {
		return CryptoJS.AES.encrypt(
			message,
			this.AesKey,
			{
				keySize: this.AesKeySize / 8,
				iv: this.AesIv,
				padding: CryptoJS.pad.Pkcs7,
				mode: CryptoJS.mode.CBC
			}
		);
	}

	AesDecrypt(payload) {
		return CryptoJS.AES.decrypt(
			payload,
			this.AesKey,
			{
				keySize: this.AesKeySize / 8,
				iv: this.AesIv,
				padding: CryptoJS.pad.Pkcs7,
				mode: CryptoJS.mode.CBC
			}
		);
	}


}
