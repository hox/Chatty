var wss = new WebSocket("ws://localhost:35012");

function loginSubmit() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    wss.send(JSON.stringify({ "TYPE": "SIGNUP", "USERNAME": username, "PASSWORD": password }));
    setTimeout(function () { }, 1000);
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