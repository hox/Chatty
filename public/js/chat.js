var token;
var channel = "main";
var socket = io();

if (tokenGet() != null) {
    token = tokenGet();
} else {
    window.location = "../";
}

socket.on("CONNECT", function (msg) {
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "MESSAGES",
        "CHANNEL": channel
    }));
    console.log("ok");
})

socket.on("MESSAGE", function (msg) {
    var json = JSON.parse(msg);
})

function tokenGet() {
    var name = "token";
    var url = window.location.href + "?" + document.cookie;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function sendMsg() {
    var message = document.getElementById("messageKey").value;
    
    // code to send message

    document.getElementById("messageKey").value = null;
}

//#region 
/*var wss = new WebSocket("ws://127.0.0.1");



wss.addEventListener("open", function () {
    
});

function sendMessage() {
    var message = document.getElementById("messageId").value;
    wss.send(JSON.stringify({
        "TYPE": "MESSAGE",
        "TOKEN": token,
        "MESSAGE": message,
        "CHANNEL": channel
    }))
    document.getElementById("messageId").value = null;
}

wss.addEventListener("message", function (message) {
    var data = JSON.parse(message.data);
    if (data.TYPE == "MESSAGE") {
        console.log(data.USERNAME + " | " + data.MESSAGE);
        document.getElementById("messages").innerHTML += "<p><span class='username'>" + data.USERNAME + "</span> <span class='message'>" + data.MESSAGE + "</span></p>";
        var scroller = document.getElementById('messages');
        scroller.scrollTop = scroller.scrollHeight;
        return;
    }
    if (data.TYPE == "USERS") {
        data.MESSAGE.forEach(function (username) {
            document.getElementById("usersonline").innerHTML += "<li><a>" + username + "</a></li>";
        });
    }
    if (data.TYPE == "PING") {
        wss.send(JSON.stringify({
            "TYPE": "UPDATE",
            "TOKEN": token
        }));
    }
    if (data.TYPE == "MESSAGES") {
        data.MESSAGE.forEach(function (message) {
            document.getElementById("messages").innerHTML += "<p><span class='username'>" + message.username + "</span> <span class='message'>" + message.message + "</span></p>";
            var scroller = document.getElementById('messages');
            scroller.scrollTop = scroller.scrollHeight;
            return;
        });
    }
});
*/

//#endregion
