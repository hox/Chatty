//! hit or miss, i guess they never miss, huh?
var fs = require('fs');
var express = require('express');
var app = express();
var rtg = require('random-token-generator');

// ! HTTP ROUTING
var http = express();
http.get('*', function (req, res) {
    res.redirect('https://' + req.headers.host + req.url);
});
// ! HTTP ROUTING

var https = require('https');
var privateKey = fs.readFileSync('./data/key.pem', 'utf8');
var certificate = fs.readFileSync('./data/cert.pem', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};
var httpsServer = https.createServer(credentials, app);
var io = require('socket.io').listen(httpsServer);
var SHA256 = require('js-sha256').sha256;
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./data/users.db');

db.run(`CREATE TABLE IF NOT EXISTS Users(USERNAME text, PASSWORD text, ADMIN text, TOKEN text)`);

const PORT = 443;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

httpsServer.listen(PORT, function () {
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
        if (json.TYPE == "CHECKTOKEN") {
            var goodToken = false;
            db.all(`SELECT * from Users`, [], function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.forEach(function (element) {
                    if (element.TOKEN == json.TOKEN) {
                        goodToken = true;
                    }
                });
            });
            if (goodToken) {
                socket.emit("MESSAGE", JSON.stringify({
                    "TYPE": "CHECKTOKEN",
                    "MESSAGE": "OK"
                }));
            } else {
                socket.emit("MESSAGE", JSON.stringify({
                    "TYPE": "CHECKTOKEN",
                    "MESSAGE": "INVALID"
                }));
            }
        }
        if (json.TYPE == "MESSAGE") {
            var newmessage = json.MESSAGE.replaceAll("<", "&lt").replaceAll(">", "&gt;").trim();
            if (!checkMsg(newmessage)) return;
            refreshDb();
            db.all(`SELECT * from Users`, [], function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.forEach(function (element) {
                    if (element.TOKEN == json.TOKEN) {
                        var admin = element.ADMIN == 'true';
                        io.emit("MESSAGE", JSON.stringify({
                            "TYPE": "MESSAGE",
                            "USERNAME": element.USERNAME,
                            "MESSAGE": newmessage,
                            "CHANNEL": json.CHANNEL,
                            "ADMIN": admin
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
            var done = false;
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
                        done = true;
                        return;
                    }
                });
                rtg.generateKey({
                    len: 32,
                    string: true,
                    strong: true,
                    retry: true
                }, function (err, key) {
                    if (done) return;
                    console.log("inserting into", json.USERNAME)
                    db.run(`insert into Users values('${json.USERNAME}', '${SHA256(json.PASSWORD)}', 'false', '${key}')`);
                    socket.emit("MESSAGE", JSON.stringify({
                        "TYPE": "SIGNUP",
                        "MESSAGE": key
                    }))
                });
            });
        }
        if (json.TYPE == "MESSAGES") {
            var channel = json.CHANNEL;
            if (channel == "") return;
            var msgarray = [];
            /*fs.readdir("./data/logs/", function (err, filename) {
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
            });*/
            fs.readFile("./data/logs/" + channel + ".txt", "utf-8", function (err, data) {
                var lines = data.split("\n").reverse();
                for (let i = 0; i < 10; i++) {
                    var newary = lines[i].split(" >> ");
                    var message = {
                        "username": newary[0],
                        "message": newary[1]
                    };
                    msgarray.unshift(message);
                }
                socket.emit("MESSAGE", JSON.stringify({
                    "TYPE": "MESSAGES",
                    "MESSAGE": msgarray
                }));
            });
        }
    });
});

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var msgqueue = [];

function writeMessage(username, message, channel) {
    /*msgqueue.push({
        "username": username,
        "message": message,
        "channel": channel
    });*/
    fs.appendFile("./data/logs/" + channel + ".txt", "\n" + username + " >> " + message, function () {});
}

//startMessageFlow(); TODO: GET MESSAGES WORKING
async function startMessageFlow() {
    console.log("flow started");
    for (let i = 1; i < 2;) {
        if (msgqueue.length > 0) {
            console.log("check complete")
            var obj = msgqueue[0];
            var username = obj.username;
            var message = obj.message;
            var channel = obj.channel;
            fs.readdir("./data/logs", function (err, files) {
                files.forEach(function (logname) {
                    if (logname == channel + ".json") {
                        fs.readFile("./data/logs/" + logname, "utf8", function (err, data) {
                            var json = JSON.parse(data);
                            json.logs.unshift({
                                "username": username,
                                "message": message
                            });
                            console.log("Writing Messages");
                            fs.writeFile("./data/logs/" + logname, JSON.stringify(json), function (callback) {});
                        });
                    }
                });
            });
        } else {
            continue;
        }
    }
}

function refreshDb() {
    db.close();
    db = new sqlite3.Database('./data/users.db');
}

function checkMsg(msg) {
    return true;
}