var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

app.use(express.static(path.join(__dirname, '../client/')));

var users = [];
io.on('connection', function (socket) {
	socket.on("user", function (data) {
		var user = data.username;
		if (user == null || user.length < 2 || user.length > 20 || user.indexOf("Server") != -1) {
			socket.emit("usernamereject");
		} else {
			if (users.indexOf(user) == -1) {
				socket.broadcast.emit("joined", {
					username: user
				});
			}
			users.push(user);
			socket.on("disconnect", function (data) {
				var i = users.indexOf(user);
				users.splice(i, 1);
				var unique = users.filter(function(elem, index, self) {
					return index == self.indexOf(elem);
				});
				if (unique.length < 2) {
					socket.broadcast.emit("alone");
				}
			});
			var unique = users.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			});
			var notalonebool = unique.length > 1;
			socket.emit("connected", {
				notalone: notalonebool
			});
			socket.on("message", function (data) {
				if (data.username.indexOf("Server") != -1) {
					socket.emit("message", {
						username: "Server",
						message: "Don't try to impersonate me"
					});
				} else if (data.username == null || data.username.length < 2 || data.username.length > 20) {
					socket.emit("message", {
						username: "Server",
						message: "Your username is too long or too short, your message was not delivered."
					});
				} else if (data.message == null || data.message.length < 2 || data.message.length > 100) {
					socket.emit("message", {
						username: "Server",
						message: "Your message is too long or too short, your message was not delivered."
					});
				} else {
					socket.broadcast.emit("message", data);
				}
			});
			socket.on("readmessages", function (data) {
				socket.broadcast.emit("readmessages", data);
			});
		}
	});
});

server.listen(process.env.PORT || 80);
