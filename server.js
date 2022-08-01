const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/utils');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();

const server = http.createServer(app);

// creating our socket:
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatChord Bot';

// runs when client connects:
io.on('connection', (socket) => {
  // when user joins:
  socket.on('userJoin', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    // join the user to his room:
    socket.join(user.room);

    // Welcome the user:
    socket.emit('message', formatMessage(botName, `Welcome to ChatChord!!`));

    // Broadcast to the same room when user joins:
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${username} has joined the chat!`)
      );

    //send room users:
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //   when user sends a message show only to that chat room!
  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, message));
  });

  // Broadcast to room when user leaves:
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(user.username, `${user.username} has left the chat!`)
      );

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(3000, () => {
  console.log(`Listening on port ${PORT}!`);
});
