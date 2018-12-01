var token;
var channel;
var prevmsg = false;

var socket = io();

if (tokenGet() != null || tokenGet() != undefined) {
    token = tokenGet();
} else {
    window.location = "../";
}

if (channelGet() == null || channelGet() == undefined) {
    channel = "main";
    document.cookie = "channel=main; path=/";
} else {
    channel = channelGet();
}

function leaveSocket() {
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "SOCKOUT",
        "TOKEN": token
    }));
}

socket.on("connect", function () {
    document.getElementById("channel").innerText = channel;
    document.getElementById("messageKey").placeholder = "Send a message to #" + channel;
    document.getElementById("chanswitcher").value = channel;
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "SOCKIN",
        "TOKEN": token,
        "CHANNEL": channel
    }));
    socket.emit("MESSAGE", JSON.stringify({
        "TYPE": "MESSAGES",
        "CHANNEL": channel
    }));
});

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
            document.getElementById("users").innerHTML += "<li><p" + ((user.admin) ? " class='administrator'" : "") + ">" + user.username + " - <a href='javascript:setChannel(`" + user.channel + "`);'>#" + user.channel + "</a></p></li>";
        });
    }
    if (data.TYPE == "MESSAGES") {
        if (prevmsg) return;
        if (data.MESSAGE.length == 0) {
            document.getElementById("messages").innerHTML += "<p class='pastmsg'>There are no past messages in this channel</p>";
        }
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
    var cookiestring = RegExp("token[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

function channelGet() {
    var cookiestring = RegExp("channel[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
}

function setChannel(channel) {
    document.cookie = "channel=" + channel + "; path=/";
    location.reload();
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