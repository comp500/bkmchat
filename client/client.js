var socket = io.connect('http://localhost');
document.write("<div id=\"bkmChat\"><div id=\"bkmallmessages\"></div><div id=\"bkmnewmessages\"></div></div>");
var chatDiv = document.getElementById("bkmChat");
var allmessages = document.getElementById("bkmallmessages");
var newmessages = document.getElementById("bkmnewmessages");
chatDiv.style.position = "absolute";
chatDiv.style.bottom = "0";
chatDiv.style.right = "0";
chatDiv.style.width = "5px";
chatDiv.style.height = "5px";
chatDiv.style.backgroundColor = "#FF3B2C";
chatDiv.style.zIndex = "1000";
chatDiv.style.color = "#000000";
chatDiv.style.fontFamily = "Arial";
chatDiv.style.fontSize = "10px";
newmessages.style.fontWeight = "bold";
newmessages.style.display = "none";
allmessages.style.display = "none";

var user; // because i hate you = "test1" + new Date().getSeconds()
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
		newmessages.innerText += data.username + ": " + data.message;
		newmessages.innerHTML += "<br>";
		var status = "newmessage";
		setColour();
	} else {
		allmessages.innerText += data.username + ": " + data.message;
		allmessages.innerHTML += "<br>";
	}
	console.log(data.username + ": " + data.message);
});

var message = function (msg) {
	socket.emit("message", {
		username: user,
		message: msg
	});
	if (newmessages.innerHTML.length > 3) {
		allmessages.innerHTML += newmessages.innerHTML;
		newmessages.innerHTML = "";
	}
	allmessages.innerText += user + ": " + msg;
	allmessages.innerHTML += "<br>";
}

socket.on("connect", function () {
	user = prompt("Username");
	socket.emit("user", {"username": user});
});

chatDiv.addEventListener("mouseenter", function(event) {
	chatOpen = true;
	chatDiv.style.width = "auto";
	chatDiv.style.minWidth = "30px";
	chatDiv.style.height = "auto";
	chatDiv.style.minHeight = "30px";
	newmessages.style.display = "block";
	allmessages.style.display = "block";
	chatDiv.style.backgroundColor = "#FFFFFF";
	chatDiv.style.border = "1px solid black";
}, false);

chatDiv.addEventListener("mouseleave", function(event) {
	chatOpen = false;
	chatDiv.style.width = "5px";
	chatDiv.style.minWidth = "0";
	chatDiv.style.height = "5px";
	chatDiv.style.minHeight = "0";
	newmessages.style.display = "none";
	allmessages.style.display = "none";
	chatDiv.style.border = "none";
	status = (status == "newmessage") ? "good" : status;
	setColour();
}, false);
