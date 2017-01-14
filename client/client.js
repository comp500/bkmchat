var socket = io.connect('http://node.infra.link');
document.write('<div id="bkmChat"><div id="bkmscroll"><div id="bkmallmessages"></div><div id="bkmnewmessages"></div></div><input type="text" id="bkmbox"></div>');
var chatDiv = document.getElementById("bkmChat");
var allmessages = document.getElementById("bkmallmessages");
var newmessages = document.getElementById("bkmnewmessages");
var textbox = document.getElementById("bkmbox");
var scroll = document.getElementById("bkmscroll");
chatDiv.style.position = "absolute";
chatDiv.style.bottom = "0";
chatDiv.style.right = "0";
chatDiv.style.width = "10px";
scroll.style.maxWidth = "150px";
chatDiv.style.height = "10px";
scroll.style.maxHeight = "200px";
chatDiv.style.backgroundColor = "#FF3B2C";
chatDiv.style.zIndex = "1000";
chatDiv.style.color = "#000000";
chatDiv.style.fontFamily = "Arial";
chatDiv.style.fontSize = "10px";
chatDiv.style.overflow = "hidden";
scroll.style.overflowY = "scroll";
scroll.style.overflowX = "hidden";
scroll.style.wordBreak = "break-all";
scroll.style.overflowWrap = "break-word";
newmessages.style.fontWeight = "bold";
scroll.style.display = "none";
textbox.style.display = "none";
scroll.style.minWidth = "50px";
scroll.style.minHeight = "50px";

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

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

socket.on("connected", function (data) {
	console.log("connected!");
	status = data.notalone ? "good" : "alone";
	setColour();
	chatDiv.addEventListener("mouseenter", function(event) {
		chatOpen = true;
		setColour();
		chatDiv.style.width = "auto";
		chatDiv.style.height = "auto";
		scroll.style.display = "block";
		textbox.style.display = "block";
		chatDiv.style.border = "1px solid black";
		scroll.scrollTop = scroll.scrollHeight;
	}, false);

	chatDiv.addEventListener("mouseleave", function(event) {
		chatOpen = false;
		chatDiv.style.width = "10px";
		chatDiv.style.height = "10px";
		scroll.style.display = "none";
		textbox.style.display = "none";
		chatDiv.style.border = "none";
		status = (status == "newmessage") ? "good" : status;
		setColour();
		if (newmessages.innerHTML.length > 4) {
			allmessages.innerHTML += newmessages.innerHTML;
			newmessages.innerHTML = "";
		}
	}, false);

	textbox.addEventListener("keydown", function(event) {
		if (event.keyCode == 13 && textbox.value.length > 0) {
			socket.emit("message", {
				username: user,
				message: textbox.value
			});
			if (newmessages.innerHTML.length > 4) {
				allmessages.innerHTML += newmessages.innerHTML;
				newmessages.innerHTML = "";
			}
			allmessages.innerHTML += escapeHtml(user + ": " + textbox.value) + "<br>";
			textbox.value = "";
			scroll.scrollTop = scroll.scrollHeight;
		}
	}, false);
});

socket.on("joined", function (data) {
	console.log("i'm not alone!");
	status = "good";
	setColour();
});

socket.on("alone", function (data) {
	console.log("i'm alone");
	status = "alone";
	setColour();
});

socket.on("message", function (data){
	if (data.username != user) {
		newmessages.innerHTML += escapeHtml(data.username + ": " + data.message) + "<br>";
		status = "newmessage";
		setColour();
	} else {
		allmessages.innerHTML += escapeHtml(data.username + ": " + data.message) + "<br>";
	}
	console.log(data.username + ": " + data.message);
});

socket.on("connect", function () {
	user = prompt("Username");
	socket.emit("user", {"username": user});
});

socket.on("disconnect", function () {
	status = "disconnected";
	setColour();
});
