var socket = io();

if (token() != null) window.location.href = "./chat/";

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

function loginSubmit() {
    var usernamekey = document.getElementById("usernamekey").value;
    var passwordkey = document.getElementById("passwordkey").value;
    socket.emit('MESSAGE', JSON.stringify({
        "TYPE": "SIGNIN",
        "USERNAME": usernamekey,
        "PASSWORD": passwordkey
    }));
    setTimeout(function () {}, 2000);
}

socket.on('MESSAGE', function (msg) {
    var json = JSON.parse(msg);
    if (json.TYPE == "SIGNIN") {
        if (json.MESSAGE == "USERDATA_INVALID") {
            document.getElementById("userwrong").style = "";
        } else {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + 1440);
            var c_value = escape(json.MESSAGE) + ((1440 == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = "token=" + c_value + "; path=/";
            window.location.href = "./chat/";
        }
    }
});