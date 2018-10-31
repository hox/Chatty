const WebSocket = require('ws');
var rtg = require('random-token-generator');
var fs = require('fs');
var SHA256 = require('js-sha256').sha256;
const { format } = require('json-string-formatter');

const wss = new WebSocket.Server({
    port: 35012,
    perMessageDeflate: {
            zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true, 
        serverMaxWindowBits: 10,      
        concurrencyLimit: 10,          
        threshold: 1024,
    }
});

var current_alive = [];

wss.on("connection", function connection(ws) {
    ws.on('message', function incoming(message) {
        var json = JSON.parse(message);
        if(json.TYPE == "UPDATE") {
            if(json.TOKEN == "") return;
            var newjson = JSON.parse(fs.readFileSync("./data/users.json"));
            newjson.users.forEach(function(element) {
                if(element.TOKEN == json.TOKEN) {
                    var oof = false;
                    current_alive.forEach(function(newele) {
                        if(newele == element.USERNAME) {
                            oof = true;
                        }
                    });
                    if(!oof) current_alive.push(element.USERNAME);
                }
            }); 
            wss.broadcast(JSON.stringify({"TYPE": "USERS", "MESSAGE": current_alive}));
        } else 
        if(json.TYPE == "MESSAGE") {
            json.MESSAGE.replaceAll("<", "&lt").replaceAll(">", "&gt;").trim();
            var username = "";
            var newjson = JSON.parse(fs.readFileSync("./data/users.json"));
            newjson.users.forEach(function(element) {
                if(element.TOKEN == json.TOKEN) {
                    username = element.USERNAME;
                }
            });
            if(username == "") return;
            wss.broadcast(JSON.stringify({"TYPE": "MESSAGE", "USERNAME": username, "MESSAGE": json.MESSAGE, "CHANNEL": json.CHANNEL}));
        } else
        if(json.TYPE == "SIGNIN") {
            var newjson = JSON.parse(fs.readFileSync("./data/users.json"));
            var oof = false;
            newjson.users.forEach(function(element) {
                if(element.USERNAME == json.USERNAME && element.PASSWORD == SHA256(json.PASSWORD)) {
                    ws.send(JSON.stringify({"TYPE": "SIGNIN", "MESSAGE": element.TOKEN}));
                    oof = true;
                }
            });
            if(!oof)
                return ws.send(JSON.stringify({"TYPE": "SIGNIN", "MESSAGE": "USERDATA_INVALID"}));
        } else
        if(json.TYPE == "SIGNUP") {
            var newjson = JSON.parse(fs.readFileSync("./data/users.json"));
            newjson.users.forEach(function(element) {
                if(element.username == json.USERNAME) {
                    ws.send({"TYPE": "SIGNUP", "MESSAGE": "USERNAME_TAKEN"});
                    return;
                }
            });
            rtg.generateKey({
                len: 32, 
                string: true, 
                strong: true, 
                retry: true
            }, function(err, key) {
                newjson.users.push({"USERNAME": json.USERNAME, "PASSWORD": SHA256(json.PASSWORD), "ADMIN": false, "TOKEN": key});
                fs.writeFileSync( "./data/users.json", JSON.stringify(newjson)); 
            });
        }
    });
});

wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
     });
 };

 String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

setInterval(function() {
    console.log(current_alive);
}, 1000);