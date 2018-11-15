//! hit or miss, i guess they never miss, huh?
var express = require('express');
var app = express();
var rtg = require('random-token-generator');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var SHA256 = require('js-sha256').sha256;
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./data/users.db');

db.run(`CREATE TABLE IF NOT EXISTS Users(USERNAME text, PASSWORD text, ADMIN text, TOKEN text)`);

/* ! REDESIGN

var lukeserverapp = express();
var lukeserverhttp = require('http').Server(lukeserverapp);
lukeserverapp.use(express.static(__dirname + '/public new'));

lukeserverapp.get('/', function (req, res) {
    res.sendFile(__dirname + "/public new/index.html")
})

lukeserverhttp.listen(81, function () {
    console.log("luke's http server now listening to port 81");
});

*/

const PORT = 80;

app.use(express.static(__dirname + '/public new'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public new/index.html');
});

http.listen(PORT, function () {
    console.log(`Now listening to * on port ${PORT}`);
});

setInterval(function () {
    io.emit("MESSAGE", JSON.stringify({
        "TYPE": "PING"
    }));
    current_alive = [];
    setTimeout(function () {}, 3000);
    io.emit("MESSAGE", JSON.stringify({
        "TYPE": "USERS",
        "MESSAGE": current_alive
    }));
}, 10000);

io.on('connection', function (socket) {
    socket.on('MESSAGE', function (msg) {
        var json = {};
        try {
            json = JSON.parse(msg);
        } catch (e) {
            console.log(e);
            return;
        }
        if (json.TYPE == "UPDATE") {
            if (json.TOKEN == "") return;
            db.all(`SELECT * from Users`, [], (err, rows) => {
                if (err) {
                    throw err;
                }
                rows.forEach(function (element) {

                });
            });
        }
        if (json.TYPE == "MESSAGE") {
            var newmessage = json.MESSAGE.replaceAll("<", "&lt").replaceAll(">", "&gt;").trim();
            refreshDb();
            db.all(`SELECT * from Users`, [], function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.forEach(function (element) {
                    if (element.TOKEN == json.TOKEN) {
                        io.emit("MESSAGE", JSON.stringify({
                            "TYPE": "MESSAGE",
                            "USERNAME": element.USERNAME,
                            "MESSAGE": newmessage,
                            "CHANNEL": json.CHANNEL
                        }));
                        writeMessage(element.USERNAME, json.MESSAGE, json.CHANNEL);
                    }
                });
            });

        }
        if (json.TYPE == "SIGNIN") {
            var oof = false;
            db.all(`SELECT * from Users`, [], function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.forEach(function (element) {
                    if (element.USERNAME == json.USERNAME && element.PASSWORD == SHA256(json.PASSWORD)) {
                        socket.emit("MESSAGE", JSON.stringify({
                            "TYPE": "SIGNIN",
                            "MESSAGE": element.TOKEN
                        }));
                        oof = true;
                    }
                });
            });
            if (!oof)
                return socket.emit("MESSAGE", JSON.stringify({
                    "TYPE": "SIGNIN",
                    "MESSAGE": "USERDATA_INVALID"
                }));

        }
        if (json.TYPE == "SIGNUP") {
            db.all("select * from Users", [], function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.forEach(function (element) {
                    if (element.USERNAME == json.USERNAME) {
                        socket.emit("MESSAGE", JSON.stringify({
                            "TYPE": "SIGNUP",
                            "MESSAGE": "USERNAME_TAKEN"
                        }));
                        return;
                    }
                });
                rtg.generateKey({
                    len: 32,
                    string: true,
                    strong: true,
                    retry: true
                }, function (err, key) {
                    db.run(`insert into Users values('${json.USERNAME}', '${SHA256(json.PASSWORD)}', false, '${key}')`);
                });
            });
        }
        if (json.TYPE == "MESSAGES") {
            var channel = json.CHANNEL;
            if (channel == "") return;
            var msgarray = [];
            fs.readdir("./data/logs/", function (err, filename) {
                if (filename == channel + ".json") {
                    fs.readFile("./data/logs/" + filename, "utf8", function (err, data) {
                        var json = JSON.parse(data);
                        for (i = 0; i < 10; i++) {
                            var message = json.logs[i];
                            msgarray.unshift(message);
                        }
                        socket.emit("MESSAGE", JSON.stringify({
                            "TYPE": "MESSAGES",
                            "MESSAGE": msgarray
                        }));
                    });
                }
            });
        }
    });
});