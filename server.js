var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path').join(__dirname, '/public');

app.use(express.static(path));

queue = [];
names = {};
rooms = {};
symbols = {};

var findOpponent = function(socket) {
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

        io.emit('load');

        oppenent.emit('game-join', {'name' : names[socket.id], 'room_id' : room_id});
        socket.emit('game-join', {'name' : names[oppenent.id], 'room_id' : room_id});

    } else {
        queue.push(socket);
    }
}

var checkForWin = function(blocks) {
    for(var i = 0; i < 9; i += 3) {
        if(blocks[0+i] == blocks[1+i] && blocks[1+i] == blocks[2+i]) {
            return blocks[0+i];
        }
    }
    for(var i = 0; i < 3; i++) {
        if(blocks[0+i] == blocks[3+i] && blocks[3+i] == blocks[6+i]) {
            return blocks[0+i];
        }
    }
    if(blocks[0] == blocks[4] && blocks[4] == blocks[8]) {
        return blocks[4];
    }
    else if(blocks[2] == blocks[4] && blocks[4] == blocks[6]) {
        return blocks[4];
    }

    return false;

}

app.get('/', function(req, res) {
    res.sendFile('game.html', {root: path});
});

io.on('connection', function(socket) {
    socket.on('login', function(data) {
        console.log("Username: "+data.username+" : Socket: "+socket.id);

        names[socket.id] = data.username;

        findOpponent(socket);
    });
    socket.on('box-click', function(data) {
        console.log("Box has been clicked : "+data.box_id);
        var tempRoom = rooms[data.room_id];
        // If it's the player's turn
        if(socket.id == tempRoom.active_player) {
            // If box has not been clicked yet
            if(tempRoom.blocks[data.box_id-1] == 0) {
                // Set box selection to the active player
                tempRoom.blocks[data.box_id-1] = symbols[socket.id];
                // Change active player
                rooms[data.room_id].active_player = data.room_id.replace(socket.id, '').replace('#', '');
                // Update box in clients
                io.to(data.room_id).emit('box-click', {'box_id' : data.box_id, 'symbol' : symbols[socket.id]});
                // Check for win
                var result = checkForWin(tempRoom.blocks);
                if(result == symbols[socket.id]) {
                    io.to(data.room_id).emit('game-win', {'winner' : socket.id });
                }
            }
        }

    });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
