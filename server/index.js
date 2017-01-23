var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var request = require('request');

app.use(express.static(path.join(__dirname, '../client/')));

var users = [];
io.on('connection', function (socket) {
	socket.on("user", function (data) {
		if (typeof(data.username) != "string") {
			socket.emit("usernamereject");
			return true;
		}
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
			var motd = "Welcome to bkmchat, users currently online: ";
			for (var i = 0; i < users.length; i++) {
				motd += users[i];
				if (i != (users.length - 1)) {
					motd += ", ";
				}
			}
			socket.emit("message", {
				username: "Server",
				message: motd
			});
			socket.on("message", function (data) {
				if (typeof(data.username) != "string" || typeof(data.message) != "string") {
					return true;
				}
				if (data.username.indexOf("Server") != -1) {
					socket.emit("message", {
						username: "Server",
						message: "Don't try to impersonate me"
					});
				} else if (data.username == null || data.username.length < 2 || data.username.length > 20) {
					socket.emit("message", {
						username: "Server",
						message: "Your username is too long or too short, it was not delivered."
					});
				} else if (data.message == null || data.message.length < 2 || data.message.length > 2000) {
					socket.emit("message", {
						username: "Server",
						message: "Your message is too long or too short, it was not delivered."
					});
				} else if (data.message.split(" ")[0].toLowerCase() == "/help") {
					socket.emit("message", {
						username: "Server",
						message: "Commands: /list - lists users"
					});
				} else if (data.message.split(" ")[0].toLowerCase() == "/list") {
					var list = "Users currently online: ";
					for (var i = 0; i < users.length; i++) {
						list += users[i];
						if (i != (users.length - 1)) {
							list += ", ";
						}
					}
					socket.emit("message", {
						username: "Server",
						message: list
					});
				} else {
					socket.broadcast.emit("message", data);
					if (process.env.WEBHOOK) {
						if (data.username.indexOf("†") == -1) {
							request.post(process.env.WEBHOOK, {form: {
								content: data.message,
								username: data.username
							}});
						}
					}
				}
			});
			socket.on("readmessages", function (data) {
				socket.broadcast.emit("readmessages", data);
			});
		}
	});
});

server.listen(process.env.PORT || 80);
