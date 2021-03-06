var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var now = moment();

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

io.on('connection', function (socket) {
	console.log("Usuário conectou via socket.io!");

	socket.on('disconnect', function () {
		var userData = clientInfo[socket.id];

		if(typeof userData !== 'undefined') {
			socket.leave(userData.room);
			io.to(userData.room).emit('message', {
				name: 'System',
				text: userData.name + ' saiu da sala!',
				timestamp: moment.valueOf()
			});
			delete clientInfo[socket.id];
		}
	});

	socket.on('joinRoom', function (req) {
		clientInfo[socket.id] = req;

		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message', {
			name: 'System',
			text: req.name + ' entrou na sala!',
			timestamp: moment.valueOf()
		});
	});

	socket.on('message', function (message) {
		console.log("Mensagem recebida: " + message.text);

		message.timestamp = moment().valueOf();
		io.to(clientInfo[socket.id].room).emit('message', message);
	});

	socket.emit('message', {
		name: 'Sistema',
		text: 'Bem vindo ao DSO Chat!',
		timestamp: moment.valueOf()

	});
});

http.listen(PORT, function() {
	console.log("Server started!");
});