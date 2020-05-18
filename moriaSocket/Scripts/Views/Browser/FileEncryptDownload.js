class FileEncryptDownload {

	/**
	 * Static method to keep the id unique
	 */
	static _FileEncryptDownloadID = -1;
	static MakeFileEncryptDownloadID() {
		this._FileEncryptDownloadID++;
		return 'file-encrypt-download-' + this._FileEncryptDownloadID.toString();
	}

	Elem;
	Label;
	Progress;
	ProgressBar;
	CWD;
	Name;
	Ajax;

	constructor(id, cwd, name)
	{
		this.CWD = cwd;
		this.Name = name;
		this.Elem = document.createElement("div");
		this.Elem.className = "row";
		this.Elem.id = id;
		this.Label = document.createElement("div");
		this.Label.innerText = this.Name;
		this.Label.className = "file-download-label"
		this.Elem.appendChild(this.Label);
		this.ProgressBar = document.createElement("div");
		this.ProgressBar.id = this.Elem.id + "-progress-bar";
		this.ProgressBar.className = "progress-bar";
		this.ProgressBar.innerText = "0%";
		this.ProgressBar.setAttribute("role","progressbar");
		this.ProgressBar.setAttribute("aria-valuenow","0");
		this.ProgressBar.setAttribute("aria-valuemin","0");
		this.ProgressBar.setAttribute("aria-valuemax","100");
		this.ProgressBar.setAttribute("style", "width:0%");
		this.Progress = document.createElement("div");
		this.Progress.className = "progress";
		this.Progress.appendChild(this.ProgressBar);
		this.Elem.appendChild(this.ProgressBar);

		var that = this;
		var ajaxData = {
			wssid: document.Socket.WSSID,
			payload: document.Socket.Security.AesEncrypt(JSON.stringify({
				path: this.CWD,
				name: this.Name,
				noise: Security.GenerateHexString(Number.parseInt(Math.random() * 128))
			})).ciphertext.toString(CryptoJS.enc.Base64)
		};
		this.Ajax = {
			parent: that,
			async: true,
			cache: false,
			method: "POST",
			url: window.location.pathname + "Browser/FileEncryptDownload",
			data: ajaxData,
			beforeSend: function (jqXHR, settings) {
				this.parent.SetProgressBarText("Downloading");
				this.parent.SetProgressBarValue("25");
			},
			success: function (data, textStatus, jqXHR) {

				that.SetProgressBarText("Decrypting");
				that.SetProgressBarValue("50");
				document.LoadingOverlay.SetMessage("Decrypting...");
				document.LoadingOverlay.Show();

				setTimeout(FileEncryptDownload.ParseDownload, 200, this.parent, data);
			},
			complete: function (jqXHR, textStatus) { },
			error: function (jqXHR, textStatus, errorThrown) {
				console.error(jqXHR, textStatus, errorThrown);
				this.parent.FailedDownload(errorThrown);
			}
		};

	}

	SetProgressBarValue(value)
	{
		this.ProgressBar.setAttribute("aria-valuenow", value);
		this.ProgressBar.style.width = value + "%";
	}

	SetProgressBarText(text)
	{
		this.ProgressBar.innerText = text;
	}

	AjaxGet()
	{
		$.ajax(this.Ajax);
	}

	static ParseDownload(that, data)
	{
		data = data.split(',');
		var length = 0;
		for (var i = 0, iMax = data.length; i < iMax; i++) {
			if (data[i].length > 0) {
				data[i] = atob(atob(document.Socket.Security.AesDecrypt(data[i]).toString(CryptoJS.enc.Base64)));
				length += data[i].length;
			}
		}

		document.LoadingOverlay.Hide();

		that.SetProgressBarText("Saving");
		that.SetProgressBarValue("75");

		var ab = new ArrayBuffer(length);
		var ia = new Uint8Array(ab);

		var count = 0;
		for (var i = 0, iMax = data.length; i < iMax; i++)
		{
			for (var j = 0, jMax = data[i].length; j < jMax; j++)
			{
				ia[count] = data[i].charCodeAt(j);
				count++;
			}
			delete data[i];
		}

		var a = document.createElement("a");
		a.setAttribute("download", that.Name);
		a.href = window.URL.createObjectURL(new Blob([ab], { type: '' }));
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		that.SetProgressBarText("Complete");
		that.SetProgressBarValue("100");

		$(that.Elem).slideUp(400, function () {
			document.getElementById("EncryptDownloads").removeChild(this);
		});
	}

	FailedDownload(errorThrown)
	{
		this.ProgressBar.classList.add("progress-bar-danger");
		this.ProgressBar.innerText = "Failed! " + errorThrown;
		setTimeout(function (that) {
			$(that.Elem).slideUp(400, function () {
				document.getElementById("EncryptDownloads").removeChild(this);
			});
		}, 3000, this);

	}


}
