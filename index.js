var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

io.on('connection', function (socket) {
    socket.on('SIGNIN', function (msg) {
        console.log(msg);
    });
    socket.on('SIGNUP', function (msg) {
        console.log(msg);
    });
    socket.on('MESSAGE', function (msg) {
        io.emit('chat message', msg);
        console.log(msg)
    });
});