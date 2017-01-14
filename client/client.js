var socket = io.connect('http://localhost');
document.write("<div id=\"bkmChat\"></div>");
var chatDiv = document.getElementById("bkmChat");
chatDiv.style.position = "absolute";
chatDiv.style.bottom = "0";
chatDiv.style.right = "0";
chatDiv.style.width = "5px";
chatDiv.style.height = "5px";
chatDiv.style.backgroundColor = "red";
chatDiv.style.zIndex = "1000";

var user = "test1" + new Date().getSeconds(); // because i hate you

socket.on("connected", function (data) {
	console.log("connected!");
	chatDiv.style.backgroundColor = data.notalone ? "green" : "orange";
});

socket.on("joined", function (data) {
	console.log("i'm not alone!");
	chatDiv.style.backgroundColor = "green";
});

socket.on("alone", function (data) {
	console.log("i'm alone");
	chatDiv.style.backgroundColor = "orange";
});

socket.on("message", function (data){
	if (data.username != user) {
		console.log(data.username + ": " + data.message);
	}
});

var message = function (msg) {
	socket.emit("message", {
		username: user,
		message: msg
	});
}

socket.on("connect", function () {
	socket.emit("user", {"username": user});
});