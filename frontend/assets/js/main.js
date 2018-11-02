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
    document.getElementById("messageId").value = null;
}

wss.addEventListener("message", function(message) {
    return false;
    var data = JSON.parse(message.data);
    if(data.TYPE == "MESSAGE") {
        document.getElementById("messages").innerHTML += "<p><span class='username'>" + data.USERNAME + "</span> <span class='message'>" + data.MESSAGE + "</span></p>";
        var scroller = document.getElementById('messages');
        scroller.scrollTop = scroller.scrollHeight;
        return;
    } else
    if(data.TYPE == "SIGNIN") {
        if(data.MESSAGE == "USERDATA_INVALID") {
            window.location.href = "./userdata_invalid.html"
        } else {
            token = data.MESSAGE;
            $('#exampleModalCenter').modal('hide');
        }
    } else
    if(data.TYPE == "SIGNUP") {
        if(data.MESSAGE == "USERNAME_TAKEN") {
            window.location.href = "./username_taken.html"
        } else {
            token = data.MESSAGE;
            $('#signup').modal('hide');
        }
    } else
    if(data.TYPE == "USERS") {
        document.getElementById("usersonline").innerText = data.MESSAGE.join("<br>");
    } else
    if(data.TYPE == "PING") {
        wss.send(JSON.stringify({"TYPE": "UPDATE", "TOKEN": token}));
    }
});