const THREE = require('three');

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
              y: -2, // Set y position as needed
              z: Math.random() * 200 - 100, // Example range (-100 to 100)
          },
          rotation: {
              y: Math.random() * Math.PI * 2, // Random rotation between 0 and 360 degrees
          },
          scale: 15, // Larger fixed scale
          color: getRandomColor(), // Implement getRandomColor function
      };
      flowers.push(flower);
  }
  return flowers;
}

// Function to generate tree data
function generateTreesData(numTrees) {
  const trees = [];
  for (let i = 0; i < numTrees; i++) {
      const tree = {
          position: {
              x: Math.random() * 500 - 250, // Example range (-250 to 250)
              y: -1, // Set y position as needed
              z: Math.random() * 500 - 250, // Example range (-250 to 250)
          },
          rotation: {
              y: Math.random() * Math.PI * 2, // Random rotation between 0 and 360 degrees
          },
          scale: Math.random() * (80 - 20) + 20, // Random scale between 20 and 80
      };
      trees.push(tree);
  }
  return trees;
}

// Generate more flowers and trees
const flowerdata = generateFlowersData(200);
const treedata = generateTreesData(50);

class SocketManager {
  constructor(io) {
    this.io = io;
    this.playerList = {};
    this.flowers = flowerdata;
    this.trees = treedata;
    this.initializeSocketEvents();
    this.setupBroadcast();
  }

  getNextPlayerId() {
    return `Player${++count}`;
  }

  setupBroadcast() {
    setInterval(() => {
      this.io.sockets.emit('playerlist', this.playerList);
    }, 1000 / 60);
  }

  initializeSocketEvents() {
    this.io.sockets.on('connection', (socket) => {
      const playerName = this.getNextPlayerId();
      this.playerList[playerName] = { score: 0 }; // Initialize score

      // Send initial data with flowers and trees
      socket.emit('message', { 
        playerName, 
        loc: [0, 10, 10], 
        flowers: this.flowers, 
        trees: this.trees,
        score: 0
      });
      
      console.log(`${playerName} joined. Sent ${this.flowers.length} flowers and ${this.trees.length} trees.`);

      socket.on('disconnect', () => {
        delete this.playerList[playerName];
        console.log(`${playerName} left the game`);
        this.io.sockets.emit('playerDisconnected', playerName);
      });

      socket.on('playerData', (data) => {
        if (this.playerList[playerName] !== undefined) {
          // Store received data with the name that was assigned during connection
          this.playerList[playerName] = { 
            name: playerName, // Ensure name is included
            position: data.position,
            rotation: data.rotation,
            score: data.score || 0
          };
        }
      });

      socket.on('flowerCollected', (data) => {
        if (data && data.index >= 0 && data.index < this.flowers.length) {
          this.flowers.splice(data.index, 1);
          socket.broadcast.emit('flowerCollected', data);
        }
      });
    });
  }
}

let count = 0;

module.exports = SocketManager;
