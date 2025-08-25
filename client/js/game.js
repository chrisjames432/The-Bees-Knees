console.log('game.js loaded')
import * as THREE from 'three';
import { Tween, Easing, update as TWEENUpdate } from 'three/addons/libs/tween.module.js';
import { audioManager } from './audio.js';

import { Player } from './player.js';
import * as flowers from './flowers.js'; 
import * as trees from './trees.js'; 

function setcam(camera, distanceX, distanceY, distanceZ) {
  camera.position.set(5 + distanceX, 5 + distanceY, 5 + distanceZ);

  var offset = new THREE.Vector3(0, 1, 0);
  var newPosition = camera.position.clone();
  newPosition.add(offset);
  camera.lookAt(offset);
};

var game = {};
// Use window location for dynamic socket connection
game.socket = io.connect(window.location.origin);
console.log('Connecting to socket at:', window.location.origin);
game.three = THREE;
game.animations = {};
game.localplayer = new Player(game)
game.remoteplayers = {};
game.flowers = []; // Initialize flowers array
game.trees = []; // Initialize trees array
game.debugMode = false; // Add debug mode flag (can be toggled with key)
//-----------------------------------------------------------------------------------------------

game.init = function () {
  game.scene = new THREE.Scene();
  game.scene.background = new THREE.Color(0xe0e0e0);
  game.scene.fog = new THREE.Fog(0xe0e0e0, 100, 1000);
  game.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.clock = new THREE.Clock();
  
  game.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  game.renderer.setSize(window.innerWidth, window.innerHeight);
  game.renderer.outputColorSpace = THREE.SRGBColorSpace;
  game.renderer.setPixelRatio(window.devicePixelRatio);
  game.scene.background = new THREE.Color(0xe0e0e0);
  document.getElementById('mainscene').appendChild(game.renderer.domElement);
  
  // lights
  var light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 20, 0);
  game.scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 20, 10);
  game.scene.add(light);

  var grid = new THREE.GridHelper(200, 20, 0x000000, 0x000000);
  grid.material.opacity = 0.5;
  grid.material.transparent = true;
  // game.scene.add(grid);

  var axesHelper = new THREE.AxesHelper(5);
  game.scene.add(axesHelper);

  makegrass();
  
  game.localplayer.createPlayer(5, 50, true); // Ensure player is created

  // Hide loading div with vanilla JS
  const loadingDiv = document.getElementById('loading_div');
  if (loadingDiv) {
    setTimeout(() => {
      loadingDiv.style.opacity = '0';
      setTimeout(() => {
        loadingDiv.style.display = 'none';
      }, 300);
    }, 200);
  }
  setcam(game.camera, 5, 5, 5);
  game.renderscene();

  window.addEventListener('resize', function () {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

  // Initialize audio
  audioManager.init();
  
  // Play background sound when user starts the game
  document.getElementById('startbutton').addEventListener('click', function() {
    audioManager.playBackground();
  }, { once: true });
  
  // Add audio controls event listener
  window.addEventListener('keydown', function(event) {
    if (event.key === 'b') { // 'b' for debug
      game.debugMode = !game.debugMode;
      console.log('Debug mode:', game.debugMode ? 'enabled' : 'disabled');
      
      // When debug mode is enabled, show all tree collision radiuses
      if (game.debugMode) {
        showTreeCollisionBoundaries(game);
      } else {
        hideTreeCollisionBoundaries(game);
      }
    } else if (event.key === 'm') { // 'm' for mute
      const muted = audioManager.toggleMute();
      console.log('Audio:', muted ? 'muted' : 'unmuted');
    }
  });

  game.animate();
  // Hide loading div with vanilla JS
  const loadingDiv2 = document.getElementById('loading_div');
  if (loadingDiv2) {
    setTimeout(() => {
      loadingDiv2.style.opacity = '0';
      setTimeout(() => {
        loadingDiv2.style.display = 'none';
      }, 300);
    }, 200);
  }
}

//-----------------------------------------------------------------------------------------------

function updateScore(score) {
  document.getElementById('score').innerText = `Score: ${score}`;
}

//-----------------------------------------------------------------------------------------------

game.animate = function () {
  for (var key in game.animations) {
    if (typeof game.animations[key] === "function") { game.animations[key](); }
  }

  TWEENUpdate(); // Update all active tweens
  var dt = game.clock.getDelta();

  if (game.localplayer && game.localplayer.isloaded) {
    game.localplayer.update(dt);
    game.localplayer.sendPlayerData();
    updateScore(game.localplayer.score); // Update score display
  }

  game.forEachRemotePlayer((player, dt) => {
    player.update(dt);
  }, dt); 

  game.renderscene();
  requestAnimationFrame(game.animate); 
}

//-----------------------------------------------------------------------------------------------

game.makeflowers = function(data){
  console.log("Creating flowers:", data ? data.length : 0);
  flowers.createFlowers(game, data);
}

//-----------------------------------------------------------------------------------------------

// Update the maketrees function to specify we're now using the new tree models
game.maketrees = function(data){
  console.log("Creating trees with new tree models:", data ? data.length : 0);
  trees.createTrees(game, data);
}

//-----------------------------------------------------------------------------------------------

game.renderscene = function () {
  game.renderer.render(game.scene, game.camera);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

function createGrassyGround(width, length, widthSegments, lengthSegments) {
  const groundGeometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments);
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

function makegrass(){
  const width = 500;
  const length = 500;
  const widthSegments = 200;
  const lengthSegments = 200;
  const ground = createGrassyGround(width, length, widthSegments, lengthSegments);
  game.scene.add(ground);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

game.positionCamera = function(camera, mesh, distanceX, distanceY, distanceZ) {
  camera.position.set(mesh.position.x + distanceX, mesh.position.y + distanceY, mesh.position.z + distanceZ);
  var offset = new THREE.Vector3(0, 1, 0);
  var newPosition = mesh.position.clone();
  newPosition.add(offset);
  camera.lookAt(newPosition);
}

let x = 0;
//-------------------------------------------------------------------------------------------------------------------------------------------------
game.managePlayers = function(playerData) {
  console.log("Managing players:", playerData);
  
  // First, identify players that have been removed
  const currentPlayerNames = Object.keys(playerData);
  for (let playerName in this.remoteplayers) {
    if (!currentPlayerNames.includes(playerName)) {
      this.removePlayer(playerName);
    }
  }
  
  // Now update or add players
  for (let playerName in playerData) {
    if (playerData.hasOwnProperty(playerName)) {
      let playerInfo = playerData[playerName];
      
      // Skip if this is the local player
      if (this.localplayer && this.localplayer.name === playerName) {
        continue;
      }
      
      if (this.remoteplayers[playerName]) {
        if (this.remoteplayers[playerName].isloaded) {
          this.remoteplayers[playerName].updatePosition(playerInfo.position, playerInfo.rotation);
        }
      } else {
        console.log(`Creating new remote player: ${playerName}`);
        let newPlayer = new Player(this);
        newPlayer.name = playerName; // Set the player name
        
        // Position the player at their actual position if available
        const initialX = playerInfo.position ? playerInfo.position.x : 5;
        const initialZ = playerInfo.position ? playerInfo.position.z : 5;
        
        newPlayer.createPlayer(initialX, initialZ);
        this.remoteplayers[playerName] = newPlayer;
      }
    }
  }
};

game.forEachRemotePlayer = function(action, dt) {
  for (let playerName in this.remoteplayers) {
    if (this.remoteplayers.hasOwnProperty(playerName)) {
      let player = this.remoteplayers[playerName];
      if (player.isloaded) {
        action(player, dt);
      }
    }
  }
};

game.removePlayer = function(playerName) {
  if (this.remoteplayers[playerName]) {
    let player = this.remoteplayers[playerName];
    if (player.bee) {
      this.scene.remove(player.bee);
    }
    delete this.remoteplayers[playerName];
  }
};

game.socket.on('playerDisconnected', function(playerName) {
  game.removePlayer(playerName);
});

game.socket.on('flowerCollected', function(data) {
  const flower = game.flowers[data.index];
  if (flower) {
    game.scene.remove(flower);
    game.flowers.splice(data.index, 1);
  }
});

game.socket.on('treeCollision', function(data) {
  if (data.playerName === game.localplayer.name) {
    // Handle tree collision for local player - already handled in player.js
  } else {
    // Handle remote player collisions
    const remotePlayer = game.remoteplayers[data.playerName];
    if (remotePlayer && remotePlayer.isloaded) {
      // Make remote player show collision effect too
      remotePlayer.showCollisionFeedback();
    }
  }
});

game.socket.on('message', function (data) {
  console.log("Received data from server:", data);
  if (data.flowers && Array.isArray(data.flowers)) {
    game.makeflowers(data.flowers);
    console.log(`Processed ${data.flowers.length} flowers`);
  }
  if (data.trees && Array.isArray(data.trees)) {
    game.maketrees(data.trees);
    console.log(`Processed ${data.trees.length} trees`);
  }
});

// New functions for visualizing tree collisions in debug mode
function showTreeCollisionBoundaries(game) {
    if (!game.collisionHelpers) {
        game.collisionHelpers = [];
    }
    
    // Remove existing helpers
    hideTreeCollisionBoundaries(game);
    
    // Create helpers for each tree's collision shapes
    game.trees.forEach((tree, index) => {
        if (!tree || !tree.userData || !tree.userData.collisionData) return;
        
        const collisionData = tree.userData.collisionData;
        
        if (collisionData.shapes && Array.isArray(collisionData.shapes)) {
            collisionData.shapes.forEach((shape) => {
                if (shape.type === 'cylinder') {
                    // Create a cylinder to visualize this collision shape
                    const geometry = new THREE.CylinderGeometry(shape.radius, shape.radius, shape.height, 16);
                    const material = new THREE.MeshBasicMaterial({
                        color: 0xff0000,
                        wireframe: true,
                        transparent: true,
                        opacity: 0.35
                    });
                    
                    const helper = new THREE.Mesh(geometry, material);
                    
                    // Position this helper at the shape's position relative to the tree
                    const shapePosition = new THREE.Vector3().copy(shape.position);
                    shapePosition.applyMatrix4(tree.matrixWorld);
                    helper.position.copy(shapePosition);
                    
                    game.scene.add(helper);
                    game.collisionHelpers.push(helper);
                }
            });
        } else {
            // Fallback if detailed collision shapes aren't available
            const defaultRadius = tree.userData.collisionRadius || 2.0;
            const geometry = new THREE.CylinderGeometry(defaultRadius, defaultRadius, 10, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff8800, // Different color for default shapes
                wireframe: true,
                transparent: true,
                opacity: 0.35
            });
            
            const helper = new THREE.Mesh(geometry, material);
            helper.position.copy(tree.position);
            helper.position.y = 5; // Position at middle height of cylinder
            
            game.scene.add(helper);
            game.collisionHelpers.push(helper);
        }
    });
    
    console.log(`Created ${game.collisionHelpers.length} collision visualizers for ${game.trees.length} trees`);
}

function hideTreeCollisionBoundaries(game) {
  if (game.collisionHelpers && game.collisionHelpers.length > 0) {
    game.collisionHelpers.forEach(helper => {
      game.scene.remove(helper);
    });
    
    game.collisionHelpers = [];
  }
}

export { game }