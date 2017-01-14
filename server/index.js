var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.use(express.static(__dirname + '../client/'));

var users = [];
io.on('connection', function (socket) {
	socket.on("user", function (data) {
		var user = data.username;
		if (!users.includes(user)) {
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
			socket.broadcast.emit("message", data);
		});
	});
});
