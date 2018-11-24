var socket = io();

if (token() != null) window.location.href = "../chat/";

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

function signupSubmit() {
    var usernamekey = document.getElementById("usernamekey").value;
    var passwordkey = document.getElementById("passwordkey").value;
    socket.emit('MESSAGE', JSON.stringify({
        "TYPE": "SIGNUP",
        "USERNAME": usernamekey,
        "PASSWORD": passwordkey
    }));
    setTimeout(function () {}, 2000);
}

socket.on('MESSAGE', function (msg) {
    var json = JSON.parse(msg);
    if (json.TYPE == "SIGNUP") {
        if (json.MESSAGE == "USERNAME_TAKEN") {
            document.getElementById("userwrong").style = "";
        } else {
            var c_value = escape(json.MESSAGE) + "; 0";
            document.cookie = "token=" + c_value + "; path=/";
            window.location.href = "./chat/";
        }
    }
});