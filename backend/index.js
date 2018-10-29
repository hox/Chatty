const WebSocket = require('ws');
var rtg = require('random-token-generator');
var fs = require('fs');
var SHA256 = require('js-sha256').sha256;

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

wss.on("connection", function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: ' +  message);
        var json = JSON.parse(message);
        if(json.TYPE == "CONNECTION") {
            wss.broadcast("heyo")
        } else 
        if(json.TYPE == "MESSAGE") {

        } else
        if(json.TYPE == "SIGNIN") {
            var newjson = JSON.parse(fs.readFileSync("./data/users.json"));
            newjson.users.forEach(function(element) {
                if(element.USERNAME == json.USERNAME && element.PASSWORD == SHA256(json.PASSWORD)) {
                    return ws.send(element.token);
                }
            });
            return ws.send(JSON.stringify({"TYPE": "SIGNIN", "MESSAGE": "USERDATA_INVALID"}));
        } else
        if(json.TYPE == "SIGNUP") {
            var newjson = JSON.parse(fs.readFileSync("./data/users.json"));
            newjson.users.forEach(function(element) {
                if(element.username == json.USERNAME) {
                    return ws.send({"TYPE": "SIGNUP", "MESSAGE": "USERNAME_TAKEN"});
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