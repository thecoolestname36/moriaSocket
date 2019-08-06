class ServerMessage {

	Command;
	Content;
	Contents;

	constructor(jsonObj) {
		this.Command = jsonObj.Command;
		this.Content = jsonObj.Content;
		this.Contents = jsonObj.Contents;
	}

}