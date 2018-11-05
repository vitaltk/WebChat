$(function () {
    var emojiArrey = {
        ":-)": "smile",
        ":-(": "frowning",
        "&gt;:-(": "cry",
        ":-&lt;": "angry",
        "&amp;-&lt;": "teardrop",
        "&gt;:-|": "surprise"
    };

    function login() {
        $('#alert').hide();
        var name = $("#nickname").val();
        if (name.length > 0) {
            if (name.length > 20) {
                $("#nickname").val("");
                $('#alert').append('<strong>Attention</strong> Nickname longer than 20 letters!');
                $('#alert').show();
            } else {
                chat.server.connect(name);
            }
        } else {
            $('#alert').append('<strong>Attention</strong> Please enter your nickname!');
            $('#alert').show();
        }
    };

    function sendMessage() {
        chat.server.send($('#message').val());
        $('#message').val('');
    };

    var keys = Object.keys(emojiArrey);
    var regexp = [];
    for (var i = 0; i < keys.length; i++) {
        regexp.push(keys[i].replace(/\)|\(|\&|\>|\<|\|/g, "\\$&"));
    }
    var regexpkeys = regexp.join("|");

    var chat = $.connection.chatHub;
    // Init chat window
    chat.client.initChat = function (allUsers, prevMessages) {
        allUsers.forEach(DisplayUser);
        prevMessages.forEach(DisplayMessage);
    }

    // Start chat
    chat.client.onConnected = function (cunnectedUser) {
        $('#loginForm').hide();
        DisplayEmoji(emojiArrey);
        $('#inputForm').show();
        $('#welcomeLable').html('Hello, <strong>' + cunnectedUser.NickName + '</strong>');
        $('#welcomeLable').show();
    };

    // Message handler
    chat.client.addMessage = DisplayMessage;

    // Add new user to list
    chat.client.onNewUserConnected = DisplayUser;

    // Remove user from list
    chat.client.onUserDisconnected = function (user) {
        $('#' + user.ConnectionId).remove();
    };

    // Start connection
    $.connection.hub.start().done(function () {

        $('#sendMessage').click(sendMessage);

        $("#inputForm").submit(function (e) {
            e.preventDefault();
            sendMessage();
        });

        $("#btnLogin").click(login);

        $("#loginForm").submit(function (e) {
            e.preventDefault();
            login();
        });
    });

    $.fn.emoji = function () {
        return this.each(function () {
            regex = new RegExp('(\\s+)(' + regexpkeys + ')', 'g');
            $(this).html($(this).html().replace(regex, $.fn.emoji.replace));
        });
    };

    $.fn.emoji.replace = function () {
        var key = arguments[2];
        if (key == "") return "  ";
        var path = "img/";
        var extension = ".png";
        var src = path + emojiArrey[key] + extension;
        return ' <img class="emoji" width="20" height="20" align="absmiddle" src="'
            + src + '" alt="' + key + '" title="' + key + '" /> ';
    };

});

// Add emoji in bar
function DisplayEmoji(emoji) {
    Object.keys(emoji).forEach(function (element) {
        $("#emoji").append('<button type="button" class="btn btn-link" onclick="pastEmoji(\''
            + decodeHTML(element) + '\')"><img src="img/'
            + emoji[element] + '.png" width="20" /></button>');
    })
}

// Display a message
function DisplayMessage(message) {
    var text = $('<p> ' + htmlEncode(message.Text) + ' </p>').emoji().html();
    $("#messages").append('<tr><td class="pt-0 pb-0 font-weight-bold">'
        + htmlEncode(message.Sender.NickName) + '</td><td class="pt-0 pb-0 message">'
        + text + '</td></tr>');

    $("#messages").animate({ scrollTop: $("#messages").height() }, 1000);
}

function htmlEncode(value) {
    var encodedValue = $('<div />').text(value).html();
    return encodedValue;
}

function decodeHTML(html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

// Display a user
function DisplayUser(user) {
    if ($.connection.hub.id != user.ConnectionId) {
        $("#onlineUsers").append('<tr id="' + user.ConnectionId
            + '"><td class="pt-0 pb-0">' + user.NickName + '</td></tr>');
    }
}

function pastEmoji(text) {
    $("#message").val($("#message").val() + " " + text + " ")
}