var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

queue = [];
names = {};
rooms = {};
users = {};

var findOpponent = function(socket) {
    console.log(queue);
    if(queue.length > 0) {
        var oppenent = queue.pop();
        var room = socket.id+'#'+peer.id;

        peer.join(room);
        socket.join(room);

        rooms[peer.id] = room;
        rooms[socket.id] = room;

        peer.emit('game-join', {'name' : names[socket.id], 'room' : room});
        socket.emit('game-join', {'name' : names[peer.id], 'room' : room});

    } else {
        queue.push(socket);
    }
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', function(socket) {
    socket.on('login', function(data) {
        console.log("Username: "+data.username+" : Socket: "+socket.id);

        names[socket.id] = data.username;
        users[socket.id] = socket;

        io.emit('load');

        findOpponent(socket);

    });
    socket.on('box-click', function(id) {
        io.emit('box-click', id);
    });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
