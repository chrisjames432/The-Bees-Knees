console.log('game.js loaded')
import * as THREE from 'three';
import { Tween, Easing, update as TWEENUpdate } from 'three/addons/libs/tween.module.min.js';

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
game.socket = io();
game.three = THREE;
game.animations = {};
game.localplayer = new Player(game)
game.remoteplayers = {};
game.flowers = []; // Initialize flowers array
//-----------------------------------------------------------------------------------------------

game.init = function () {
  game.scene = new THREE.Scene();
  game.scene.background = new THREE.Color(0xe0e0e0);
  game.scene.fog = new THREE.Fog(0xe0e0e0, 100, 1000);
  game.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.clock = new THREE.Clock();
  
  game.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  game.renderer.setSize(window.innerWidth, window.innerHeight);
  game.renderer.outputEncoding = THREE.sRGBEncoding;
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
  
  trees.maketrees(game, 25, 0);
  game.localplayer.createPlayer(5, 50, true); // Ensure player is created

  $('#loading_div').delay(200).fadeOut(300);
  setcam(game.camera, 5, 5, 5);
  game.renderscene();

  window.addEventListener('resize', function () {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

  game.animate();
  $('#loading_div').delay(200).fadeOut(300);
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
  flowers.createFlowers(game, data);
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
  for (let playerName in playerData) {
    if (playerData.hasOwnProperty(playerName)) {
      let playerInfo = playerData[playerName];
      if (this.remoteplayers[playerName]) {
        if (this.remoteplayers[playerName].isloaded) {
          this.remoteplayers[playerName].updatePosition(playerInfo.position, playerInfo.rotation);
        }
      } else {
        let newPlayer = new Player(game);
        newPlayer.createPlayer(5, 5 + x);
        x += 3;
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

export { game }