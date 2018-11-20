var token;
var channel = "main";
var socket = io();
var prevmsg = false;

if (tokenGet() != null || tokenGet() != "undefined") {
    token = tokenGet();
} else {
    window.location = "../";
}

socket.on("connect", function () {
    /*socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "CHECKTOKEN",
        "MESSAGE": token
    }))
    setTimeout(function () {}, 3000);*/
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "MESSAGES",
        "CHANNEL": channel
    }));
})

socket.on("MESSAGE", function (msg) {
    var data = JSON.parse(msg);
    if (data.TYPE == "MESSAGE") {
        if (data.ADMIN) {
            document.getElementById("messages").innerHTML += "<p><span class='username'>⚒ " + data.USERNAME + "</span> <span class='message'>" + data.MESSAGE + "</span></p>";
        } else {
            document.getElementById("messages").innerHTML += "<p><span class='username'>" + data.USERNAME + "</span> <span class='message'>" + data.MESSAGE + "</span></p>";
        }
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
        socket.emit("MESSAGE", JSON.stringify({
            "TYPE": "UPDATE",
            "TOKEN": token
        }));
    }
    if (data.TYPE == "MESSAGES") {
        if (prevmsg) return;
        data.MESSAGE.forEach(function (message) {
            document.getElementById("messages").innerHTML += "<p><span class='username'>" + message.username + "</span> <span class='message'>" + message.message + "</span></p>";
            var scroller = document.getElementById('messages');
            scroller.scrollTop = scroller.scrollHeight;
            prevmsg = true;
            return;
        });
    }
    if (data.TYPE == "CHECKTOKEN") {
        if (data.MESSAGE == "OK") {
            return;
        } else {
            document.cookie = "token=" + ";path=/" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
    }
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

    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "MESSAGE",
        "MESSAGE": message,
        "TOKEN": token,
        "CHANNEL": channel
    }));

    document.getElementById("messageKey").value = null;
}