var wss = new WebSocket("ws://localhost:35012");
var token = "";
function signinFormSubmit() {
    var username = document.getElementById("signinFormUser").value;
    var password = document.getElementById("signinFormPass").value;
    wss.send(JSON.stringify({"TYPE": "SIGNIN", "USERNAME": username, "PASSWORD": password}));
    setTimeout(function() {}, 3000);
}

function signupFormSubmit() {
    var username = document.getElementById("signupformUser").value;
    var password = document.getElementById("signupformPass").value;
    wss.send(JSON.stringify({"TYPE": "SIGNUP", "USERNAME": username, "PASSWORD": password}));
    setTimeout(function() {}, 3000);
}

function sendMessage() {
    var message = document.getElementById("messageId").value;
    var channel = "main";
    wss.send(JSON.stringify({"TYPE": "MESSAGE", "TOKEN": token, "MESSAGE": message, "CHANNEL": channel}))
}

wss.addEventListener("message", function(message) {
    var data = JSON.parse(message.data);
    if(data.TYPE == "MESSAGE") {
        document.getElementById("messages").innerHTML += "<p><span class='username'>" + data.username + "</span> <span class='message'>" + data.message + "</span></p>";
        var scroller = document.getElementById('messages');
        scroller.scrollTop = theDiv.scrollHeight;
        return;
    } else
    if(data.TYPE == "SIGNIN") {
        if(data.MESSAGE == "USERDATA_INVALID") {
            window.location.href = window.location.href + "./userdata_invalid.html"
        } else {
            token = data.TOKEN;
            $('#exampleModalCenter').modal('hide');
        }
    } else
    if(data.TYPE == "SIGNUP") {
        if(data.MESSAGE == "USERNAME_TAKEN") {
            window.location.href = window.location.href + "username_taken.html"
        } else {
            token = data.TOKEN;
            $('#signup').modal('hide');
        }
    }
});