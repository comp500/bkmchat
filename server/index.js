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
		users.push(user);
		socket.broadcast.emit("joined", {
			username: user
		});
		socket.on("disconnect", function (data) {
			console.log(users); // test
			var i = users.indexOf(user);
			users.splice(i, 1);
			var unique = users.filter(function(elem, index, self) {
				return index == self.indexOf(elem);
			});
			if (unique.length < 2) {
				socket.broadcast.emit("alone");
			}
			console.log(users); // test
		});
		var notalone = users.filter(function(elem, index, self) {
			return index == self.indexOf(elem);
		}).length > 1;
		socket.emit("connected", {
			notalone: notalone
		});
		socket.on("message", function (data) {
			socket.broadcast.emit("message", data);
		});
	});
});
