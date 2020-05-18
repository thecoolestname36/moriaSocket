class RightClickContextMenu {

	Hidden = true;
	Elem;
	Divider;
	EncryptDownloadRow;
	RenameRow;
	ChangeFileExtensionRow;
	DeleteRow;
	TargetID;
	_PosX;
	get PosX() {
		return "left:"+this._PosX+"px;";
	}
	set PosX(x) {
		this._PosX = x;
	};
	_PosY;
	get PosY() {
		return "top:" + this._PosY + "px;";
	}
	set PosY(y) {
		this._PosY = y;
	};
	
	constructor(id) {
		this._PosX = 0;
		this._PosY = 0;

		this.Elem = document.getElementById(id);
		this.Elem.className = "";

		this.Divider = document.createElement("div");
		this.Divider.className = "row divider";
		this.Divider.innerHTML - "";

		this.EncryptDownloadRow = document.createElement("div");
		this.EncryptDownloadRow.className = "row file-item";
		this.EncryptDownloadRow.appendChild(document.createElement("button"));
		this.EncryptDownloadRow.firstElementChild.className = "menubar-button button-glass";
		this.EncryptDownloadRow.firstElementChild.setAttribute("onclick", "document.RightClickContextMenu.ActionEncryptDownload(event, this)");
		this.EncryptDownloadRow.firstElementChild.innerText = "Encrypt & Download";

		this.RenameRow = document.createElement("div");
		this.RenameRow.className = "row";
		this.RenameRow.appendChild(document.createElement("button"));
		this.RenameRow.firstElementChild.className = "menubar-button button-glass";
		this.RenameRow.firstElementChild.setAttribute("onclick", "document.RightClickContextMenu.ActionRename(event, this)");
		this.RenameRow.firstElementChild.innerText = "Rename";

		this.DeleteRow = document.createElement("div");
		this.DeleteRow.className = "row";
		this.DeleteRow.appendChild(document.createElement("button"));
		this.DeleteRow.firstElementChild.className = "menubar-button button-glass";
		this.DeleteRow.firstElementChild.setAttribute("onclick", "document.RightClickContextMenu.ActionDelete(event, this)");
		this.DeleteRow.firstElementChild.innerText = "Delete";

		this.ChangeFileExtensionRow = document.createElement("div");
		this.ChangeFileExtensionRow.className = "row file-item";
		this.ChangeFileExtensionRow.appendChild(document.createElement("button"));
		this.ChangeFileExtensionRow.firstElementChild.className = "menubar-button button-glass";
		this.ChangeFileExtensionRow.firstElementChild.setAttribute("onclick", "document.RightClickContextMenu.ActionChangeFileExtension(event, this)");
		this.ChangeFileExtensionRow.firstElementChild.innerText = "Change File Extension";
	}

	ActionHideContextMenu() {
		if (!this.Hidden) {
			this.Hide();
		}
	}

	ShowDirectory(id, x, y) {
		this.Hidden = false;
		this.TargetID = id;
		this.PosX = x;
		this.PosY = y;
		this.Elem.setAttribute("style", this.PosX + this.PosY);
		this.Elem.firstElementChild.appendChild(this.RenameRow);
		this.Elem.firstElementChild.appendChild(this.DeleteRow);
		this.Elem.className = "show";
	}

	ShowFile(id, x, y) {
		this.Hidden = false;
		this.TargetID = id;
		this.PosX = x;
		this.PosY = y;
		this.Elem.setAttribute("style", this.PosX + this.PosY);
		this.Elem.firstElementChild.appendChild(this.EncryptDownloadRow);
		this.Elem.firstElementChild.appendChild(this.ChangeFileExtensionRow);
		this.Elem.firstElementChild.appendChild(this.Divider);
		this.Elem.firstElementChild.appendChild(this.RenameRow);
		this.Elem.firstElementChild.appendChild(this.DeleteRow);
		this.Elem.className = "show";
	}

	Hide() {
		this.Hidden = true;
		this.Elem.className = "";
		for (var i = 0, max = this.Elem.firstElementChild.childElementCount; i < max; i++) {
			this.Elem.firstElementChild.removeChild(this.Elem.firstElementChild.lastChild);
		}	
	}

	ActionEncryptDownload(event, elem) {
		document.DirectoryExplorer.EncryptDownload(this.TargetID);
		this.Hide();
	}

	ActionRename(event, elem) {
		var ext = document.DirectoryExplorer.Contents[this.TargetID].Extension;
		var oldName = document.DirectoryExplorer.Contents[this.TargetID].ShortName;
		var newName = prompt("Rename '" + oldName + "'");
		if (newName != null && newName != false && newName.length > 0 && oldName != newName) {
			document.Socket.SendRename(oldName + ext, newName + ext);
		}
		this.Hide();

	}

	ActionChangeFileExtension(event, elem) {
		var ext = document.DirectoryExplorer.Contents[this.TargetID].Extension;
		var oldName = document.DirectoryExplorer.Contents[this.TargetID].ShortName;
		var newExt = prompt("Change File Extension '" + oldName + ext + "'");
		if (newExt != null && newExt != false && newExt.length > 0 && ext != newExt) {
			document.Socket.SendRename(oldName + ext, oldName + newExt);
		}
		this.Hide();

	}

	ActionDelete(event, elem) {
		document.Socket.SendDelete(document.DirectoryExplorer.Contents[this.TargetID].Name);
		this.Hide();
	}


}
