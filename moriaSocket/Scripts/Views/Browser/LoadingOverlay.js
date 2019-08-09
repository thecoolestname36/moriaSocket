class LoadingOverlay {

	Elem;
	MessageElem;
	Message = "";
	OnClass = "loading";
	MessageOnClass = "show";

	constructor(id) {
		this.Elem = document.getElementById(id);
		this.MessageElem = this.Elem.firstElementChild;
	}

	Show() {
		document.getElementById(this.Elem.id).className = this.OnClass;
	}

	Hide() {
		document.getElementById(this.MessageElem.id).className = "";
		document.getElementById(this.MessageElem.id).innerHTML = "";
		document.getElementById(this.Elem.id).className = "";
	}

	SetMessage(m) {
		this.Message = m;
		document.getElementById(this.MessageElem.id).innerHTML = m;
		document.getElementById(this.MessageElem.id).className = this.MessageOnClass;
	}

	ClearMessage() {
		document.getElementById(this.MessageElem.id).className = "";
		document.getElementById(this.MessageElem.id).innerHTML = "";
	}

}