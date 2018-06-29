var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

queue = [];
names = {};
rooms = {};
symbols = {};

var findOpponent = function(socket) {
    //console.log(queue);
    if(queue.length > 0) {
        var oppenent = queue.pop();
        var blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        var room_id = socket.id+'#'+oppenent.id;
        var room = {'blocks' : blocks, 'active_player' : oppenent.id};

        oppenent.join(room_id);
        socket.join(room_id);

        rooms[room_id] = room;
        rooms[room_id] = room;

        symbols[oppenent.id] = 1;
        symbols[socket.id] = 2;

        oppenent.emit('game-join', {'name' : names[socket.id], 'room_id' : room_id});
        socket.emit('game-join', {'name' : names[oppenent.id], 'room_id' : room_id});

    } else {
        queue.push(socket);
    }
}

var checkForWin = function() {

}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/game.html');
});

io.on('connection', function(socket) {
    socket.on('login', function(data) {
        console.log("Username: "+data.username+" : Socket: "+socket.id);

        names[socket.id] = data.username;

        io.emit('load');

        findOpponent(socket);
    });
    socket.on('box-click', function(data) {
        console.log("Box has been clicked : "+data.box_id);
        var tempRoom = rooms[data.room_id];
        if(socket.id == tempRoom.active_player) {
            if(tempRoom.blocks[data.box_id-1] == 0) {
                tempRoom.blocks[data.box_id-1] = symbols[socket.id];
                rooms[data.room_id].active_player = data.room_id.replace(socket.id, '').replace('#', '');
                io.to(data.room_id).emit('box-click', {'box_id' : data.box_id, 'symbol' : symbols[socket.id]});
                checkForWin();
            }
        }

    });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
