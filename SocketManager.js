function getRandomColor() {
  const colors = [0xff0000, 0x0000ff, 0x800080, 0xffffff];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

// Function to generate flower data
function generateFlowersData(numFlowers) {
  const flowers = [];
  for (let i = 0; i < numFlowers; i++) {
      const flower = {
          position: {
              x: Math.random() * 200 - 100, // Example range (-100 to 100)
              y: 0, // Set y position as needed
              z: Math.random() * 200 - 100, // Example range (-100 to 100)
          },
          rotation: {
              y: Math.random() * Math.PI * 2, // Random rotation between 0 and 360 degrees
          },
          scale: Math.random() * (10 - 4) + 2, // Random scale between 2 and 8
          color: getRandomColor(), // Implement getRandomColor function
      };
      flowers.push(flower);
  }
  return flowers;
}


const flowerdata = generateFlowersData(1000)



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

      socket.emit('message', { playerName, loc: [0, 10, 10],flowers:flowerdata });

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
