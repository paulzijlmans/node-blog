const { Server } = require('socket.io');
const { throwError } = require('./util/error-handler');

let io;

module.exports = {
  init: httpServer => {
    io = new Server(httpServer, {
      cors: {
        origin: '*'
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throwError('Socket.io is not initialized!', 500);
    }
    return io;
  }
};