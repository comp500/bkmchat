var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var users = [];
io.on('connection', function (socket) {
	socket.on("user", function (data) {
		var user = data.username;
		if (!users.includes(user)) {
			users.push(user);
			socket.broadcast.emit("joined", {
				username: user
			});
		}
		socket.on("disconnect", function (data) { // TODO: Fix this deleting other users, maybe link user to socket or something...?!
			var i = users.indexOf(user);
			users.splice(i, 1);
			if (users.length < 2) {
				socket.broadcast.emit("alone");
			}
		});
		socket.emit("connected", {
			notalone: users.length > 1
		});
		socket.on("message", function (data) {
			socket.broadcast.emit("message", data);
		});
	});
});
