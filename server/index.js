var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var allClients = [];
io.on('connection', function (socket) {
	allClients.push(socket);
	socket.emit("connected", {
		alone: allClients.length > 1
	});
	socket.broadcast.emit("joined");
	socket.on("disconnect", function (data) {
		var i = allClients.indexOf(socket);
		allClients.splice(i, 1);
		if (allClients.length < 2) {
			socket.broadcast.emit("alone");
		}
	});
	socket.on("message", function (data) {
		socket.broadcast.emit("message", data);
	});
});
