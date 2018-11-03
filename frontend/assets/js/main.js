var wss = new WebSocket("ws://localhost:35012");
var token;

if (token() != null) {
    token = token();
} else {
    window.location = "./";
}

function sendMessage() {
    var message = document.getElementById("messageId").value;
    var channel = "main";
    wss.send(JSON.stringify({ "TYPE": "MESSAGE", "TOKEN": token, "MESSAGE": message, "CHANNEL": channel }))
    document.getElementById("messageId").value = null;
}

wss.addEventListener("message", function (message) {
    var data = JSON.parse(message.data);
    if (data.TYPE == "MESSAGE") {
        document.getElementById("messages").innerHTML += "<p><span class='username'>" + data.USERNAME + "</span> <span class='message'>" + data.MESSAGE + "</span></p>";
        var scroller = document.getElementById('messages');
        scroller.scrollTop = scroller.scrollHeight;
        return;
    }
    if (data.TYPE == "USERS") {
        data.MESSAGE.forEach(function (username) {
            document.getElementById("usersonline").innerHTML += "<li><a>" + username + "</a></li>"
        });
    }
    if (data.TYPE == "PING") {
        wss.send(JSON.stringify({ "TYPE": "UPDATE", "TOKEN": token }));
    }
});

function token() {
    var name = "token";
    var url = window.location.href + "?" + document.cookie;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}