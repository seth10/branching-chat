var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + "/"));

io.on("connection", function(socket){
    console.log("a user connected (waiting for nickname)");

    socket.on("introduction", function(nickname) {
        socket.nickname = nickname;
        console.log(nickname + " joined.");
        io.emit("introduction", nickname);
    });

    const timeFormat = {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    };

    socket.on("new topic", function(topic){
        let data = {
            topic: topic,
            timestamp: (new Date()).toLocaleString("en-US", timeFormat)
        }
        console.log(data);
        io.emit("new topic", data);
    });

    socket.on("chat message", function(dataIn){
        let data = {
            message: dataIn.message,
            topic: dataIn.topic,
            nickname: socket.nickname,
            timestamp: (new Date()).toLocaleString("en-US", timeFormat)
        };
        console.log(data);
        io.emit("chat message", data);
    });

    socket.on("disconnect", function(){
        console.log(socket.nickname + " disconnected");
        io.emit("disconnect", socket.nickname);
    });
});

http.listen(3000, function(){
    console.log("listening on *:3000");
});
