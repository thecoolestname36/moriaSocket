class LoadingOverlay {

	Elem;
	OnClass = "loading";

	constructor(id) {
		this.Elem = document.getElementById(id);
	}

	Show() {
		document.getElementById(this.Elem.id).className = this.OnClass;
	}

	Hide() {
		document.getElementById(this.Elem.id).className = "";
	}

}