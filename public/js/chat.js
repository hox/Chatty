var token;
var channel = "main";
var socket = io();
var prevmsg = false;

if (tokenGet() != null || tokenGet() != undefined) {
    token = tokenGet();
} else {
    window.location = "../";
}

function leaveSocket() {
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "SOCKOUT",
        "TOKEN": token
    }));
}

socket.on("connect", function () {
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "SOCKIN",
        "TOKEN": token
    }));
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "MESSAGES",
        "CHANNEL": channel
    }));
})

socket.on("MESSAGE", function (msg) {
    var data = JSON.parse(msg);
    if (data.TYPE == "MESSAGE") {
        var div = document.getElementById("messages");
        var p = document.createElement("p");
        var time = document.createElement("p");
        var username = document.createElement("span");
        var messageTxt = document.createElement("span");
        username.appendChild(document.createTextNode(data.USERNAME));
        username.setAttribute("class", "username" + ((data.ADMIN) ? " administrator" : "")); 
        messageTxt.appendChild(document.createTextNode(data.MESSAGE));
        messageTxt.setAttribute("class", "message");
        p.appendChild(username);
        p.appendChild(messageTxt);
        p.setAttribute("class", "chat-message");
        time.appendChild(document.createTextNode(data.TIMESTAMP)); // timestamp goes here
        time.setAttribute("id", "timestamp");
        p.appendChild(time);
        div.appendChild(p);
        div.scrollTop = div.scrollHeight;
        return;
    }
    if (data.TYPE == "USERS") {
        document.getElementById("users").innerHTML = null;
        data.MESSAGE.forEach(function (user) {
            document.getElementById("users").innerHTML += "<li><a" + ((user.admin) ? " class='administrator'" : "") + ">" + user.username + " - #" + user.channel + "</a></li>";
        });
    }
    if (data.TYPE == "MESSAGES") {
        if (prevmsg) return;
        data.MESSAGE.forEach(function (message) {
            var div = document.getElementById("messages");
            var p = document.createElement("p");
            var time = document.createElement("p");
            var username = document.createElement("span");
            var messageTxt = document.createElement("span");
            username.appendChild(document.createTextNode(message.username));
            username.setAttribute("class", "username" + ((message.admin) ? " administrator" : "")); 
            messageTxt.appendChild(document.createTextNode(message.message));
            messageTxt.setAttribute("class", "message");
            p.appendChild(username);
            p.appendChild(messageTxt);
            p.setAttribute("class", "chat-message");
            time.appendChild(document.createTextNode(message.timestamp)); // timestamp goes here
            time.setAttribute("id", "timestamp");
            p.appendChild(time);
            div.appendChild(p);
            div.scrollTop = div.scrollHeight;
            prevmsg = true;
        });
    }
});

function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    window.location = "../";
}

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