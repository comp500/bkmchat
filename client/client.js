var socket = io.connect('http://localhost');
document.write("<div id=\"bkmChat\"></div>");
var chatDiv = document.getElementById("bkmChat");
chatDiv.style.position = "absolute";
chatDiv.style.bottom = "0";
chatDiv.style.right = "0";
chatDiv.style.width = "5px";
chatDiv.style.height = "5px";
chatDiv.style.backgroundColor = "#FF3B2C";
chatDiv.style.zIndex = "1000";
chatDiv.style.color = "#000000";

var user; // because i hate you = "test1" + new Date().getSeconds()
var newmessages = [];
var allmessages = [];
var chatOpen = false;
var status = "disconnected";

var setColour = function () {
	if (chatOpen == true) {
		chatDiv.style.backgroundColor = "#FFFFFF";
	} else {
		switch (status) {
			case "good":
				chatDiv.style.backgroundColor = "#25B236";
				break;
			case "alone":
				chatDiv.style.backgroundColor = "#FFB324";
				break;
			case "newmessage":
				chatDiv.style.backgroundColor = "#0263CC";
				break;
			default:
				chatDiv.style.backgroundColor = "#FF3B2C";
		}
	}
}

socket.on("connected", function (data) {
	console.log("connected!");
	status = data.notalone ? "good" : "alone";
	setColour();
});

socket.on("joined", function (data) {
	console.log("i'm not alone!");
	var status = "good";
	setColour();
});

socket.on("alone", function (data) {
	console.log("i'm alone");
	var status = "alone";
	setColour();
});

socket.on("message", function (data){
	if (data.username != user) {
		newmessages.push(data);
		var status = "newmessage";
		setColour();
	}
	allmessages.push(data);
	console.log(data.username + ": " + data.message);
});

var message = function (msg) {
	socket.emit("message", {
		username: user,
		message: msg
	});
	allmessages.push({
		username: user,
		message: msg
	});
}

socket.on("connect", function () {
	user = prompt("Username");
	socket.emit("user", {"username": user});
});

chatDiv.addEventListener("mouseenter", function(event) {
	chatOpen = true;
	chatDiv.style.width = "30px";
	chatDiv.style.height = "30px";
	chatDiv.style.backgroundColor = "#FFFFFF";
	chatDiv.style.border = "1px solid black";
}, false);

chatDiv.addEventListener("mouseleave", function(event) {
	chatOpen = false;
	chatDiv.style.width = "5px";
	chatDiv.innerHTML = "";
	chatDiv.style.border = "none";
	status = (status == "newmessage") ? "good" : status;
	setColour();
}, false);
