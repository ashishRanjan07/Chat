const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = 3000;

io.on('connection', socket => {
  console.log('New client connected');

  socket.on('join', username => {
    socket.username = username;
    socket.broadcast.emit('userJoined', username);
  });

  socket.on('message', message => {
    // Broadcast to everyone except sender
    socket.broadcast.emit('message', {
      username: socket.username,
      text: message,
    });
  });
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userLeft', socket.username);
      console.log(`${socket.username} disconnected`);
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
