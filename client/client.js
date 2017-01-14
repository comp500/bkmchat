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

socket.on("connected", function (data) {
	console.log("connected!");
	chatDiv.style.backgroundColor = data.notalone ? "#25B236" : "#FFB324";
	status = data.notalone ? "good" : "alone";
});

socket.on("joined", function (data) {
	console.log("i'm not alone!");
	chatDiv.style.backgroundColor = "#25B236";
	var status = "good";
});

socket.on("alone", function (data) {
	console.log("i'm alone");
	chatDiv.style.backgroundColor = "#FFB324";
	var status = "alone";
});

socket.on("message", function (data){
	if (data.username != user) {
		newmessages.push(data);
		chatDiv.style.backgroundColor = "#0263CC";
	}
	allmessages.push(data);
	console.log(data.username + ": " + data.message);
	var status = "newmessage";
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

chatDiv.addEventListener("mouseenter", function( event ) {
	chatOpen = true;
	chatDiv.style.width = "20px";
	chatDiv.style.backgroundColor = "#FFFFFF";
}, false);

chatDiv.addEventListener("mouseleave", function( event ) {
	chatOpen = false;
	chatDiv.style.width = "5px";
	chatDiv.innerHTML = "";
	status = (status == "newmessage") ? "good" : status;
}, false);
