var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

// ! REDESIGN

var lukeserverapp = express();
var lukeserverhttp = require('http').Server(lukeserverapp);
lukeserverapp.use(express.static(__dirname + '/public new'));

lukeserverapp.get('/', function (req, res) {
    res.sendFile(__dirname + "/public new/index.html")
})

lukeserverhttp.listen(81, function () {
    console.log("lukeserverhttp now listening to port 81");
});

// ! REDESIGN

const PORT = 80;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(PORT, function () {
    console.log(`Now listening to * on port ${PORT}`);
});

io.on('connection', function (socket) {
    socket.on('MESSAGE', function (msg) {
        var json = {};
        try {
            json = JSON.parse(msg);
        } catch (e) {
            return;
        }
        console.log(msg);
    });
});