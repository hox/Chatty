var wss = new WebSocket("ws://chattyapp.xyz:35012");

if (token() != null) window.location.href = "./chat.html";

function loginSubmit() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    wss.send(JSON.stringify({
        "TYPE": "SIGNUP",
        "USERNAME": username,
        "PASSWORD": password
    }));
    setTimeout(function () {}, 1000);
}

wss.addEventListener("message", function (message) {
    var json = JSON.parse(message.data);
    if (json.TYPE == "SIGNUP") {
        if (json.MESSAGE == "USERNAME_TAKEN") {
            document.getElementById("userwrong").style = "color:red;";
        } else {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + 9999);
            var c_value = escape(json.MESSAGE) + "; expires=" + exdate.toUTCString();
            document.cookie = "token=" + c_value + "; path=/";
            window.location.href = "./chat.html";
        }
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