// following tutorial at http://socket.io/get-started/chat/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected (waiting for nickname)');

  socket.on('init nickname', function(nickname) {
    socket.nickname = nickname;
    console.log(nickname + ' connected');
    io.emit('user connect', nickname);
  });

  socket.on('chat message', function(msg) {
    console.log(socket.nickname + ': ' + msg);
    io.emit('chat message', socket.nickname + ': ' + msg);
  });

  socket.on('disconnect', function() {
    console.log(socket.nickname + ' disconnected');
    io.emit('user disconnect', socket.nickname);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
