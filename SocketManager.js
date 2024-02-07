class SocketManager {
  constructor(io) {
    this.io = io;
    this.playerList = {};
    this.initializeSocketEvents();
    this.setupBroadcast();
  }

  getNextPlayerId() {
    return `Player${++count}`;
  }

  setupBroadcast() {
    setInterval(() => {
      this.io.sockets.emit('playerlist', this.playerList);
      console.log(this.playerList)
    }, 1000 / 60);
  }

  initializeSocketEvents() {
    this.io.sockets.on('connection', (socket) => {
      const playerName = this.getNextPlayerId();
      this.playerList[playerName] = {};

      socket.emit('message', { playerName, loc: [0, 10, 10] });

      socket.on('disconnect', () => {
        delete this.playerList[playerName];
        console.log(`${playerName} left the game`);
        this.io.sockets.emit('playerDisconnected', playerName);
      });

      socket.on('playerData', (data) => {
        if (this.playerList[playerName] !== undefined) {
          this.playerList[playerName] = data;
        }
      });
    });
  }
}

let count = 0;

module.exports = SocketManager;
