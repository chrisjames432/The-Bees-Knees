
// player.js

console.log('threemain/examples/jsm/loaders/GLTFLoader.js')
import * as THREE from 'three';
import { GLTFLoader } from 'threemain/examples/jsm/loaders/GLTFLoader.js';
import { Tween, Easing } from 'three/addons/libs/tween.module.min.js';
import { AnimationMixer } from 'threemain/src/animation/AnimationMixer.js';
import { game } from './game.js';
import { JoyStick } from './joystick.js'; 

function getRandomNumberWithTwoDecimals(x, y) {
  if (x > y) {
    [x, y] = [y, x];
  }
  const random = Math.random() * (y - x) + x;
  return parseFloat(random.toFixed(2));
}

function randomnumber(min, max) {
  return Math.random() * (max - min) + min;
}

const minZValue = -50;
const maxZValue = 50;
var zvalue = -55;   //sets the camera distance from player

function calculateIdealOffset(model) {
  const idealOffset = new THREE.Vector3(-2, 2, zvalue);
  const idealOffsetCopy = idealOffset.clone();
  const quaternion = new THREE.Quaternion().setFromEuler(model.rotation);
  idealOffsetCopy.applyQuaternion(quaternion);
  idealOffsetCopy.add(model.position);
  return idealOffsetCopy;
}

function calculateIdealLookat(model) {
  const idealLookat = new THREE.Vector3(0, 10, 50);
  const quaternion = new THREE.Quaternion();
  const idealLookatCopy = idealLookat.clone();
  quaternion.setFromEuler(model.rotation);
  idealLookatCopy.applyQuaternion(quaternion);
  idealLookatCopy.add(model.position);
  return idealLookatCopy;
}

function updateCamera(obj, camera, model, timeElapsed) {
  const idealOffset = calculateIdealOffset(model);
  const idealLookat = calculateIdealLookat(model);
  const t = 1.0 - Math.pow(0.001, timeElapsed);
  obj._currentPosition.lerp(idealOffset, t);
  obj._currentLookat.lerp(idealLookat, t);
  camera.position.copy(obj._currentPosition);
  camera.lookAt(obj._currentLookat);
}

function Player(game) {
  this.move = {};
  this.move.forward = 0;
  this.move.turn = 0;
  this.action = '';
  this.game = game;
  this.isloaded = false;
  this.position = new THREE.Vector3();
  this.rotation = new THREE.Euler(); 
  this.bee = "";
  this.socket = game.socket;
  this.camdistance = { x: 1.5, y: 25, z: 25 };
  this.mixer = '';
  this.initialY = 5;
  this.randomdt = getRandomNumberWithTwoDecimals(2, 4);
  this.local = false;
  this._currentPosition = new THREE.Vector3();
  this._currentLookat = new THREE.Vector3();
}

Player.prototype.movePlayer = function (dt) {
  if (this.isloaded == true) {
    const move = this.move;
    const speed = 16;
    const moveSpeed = speed;
    const turnSpeed = speed/20;
    const bee = this.bee;

    if (move) {
      const forwardMovement = move.forward * moveSpeed * dt;
      const turnMovement = move.turn * turnSpeed * dt;
      const pos = bee.position.clone();
      pos.x += Math.sin(bee.rotation.y) * forwardMovement;
      pos.z += Math.cos(bee.rotation.y) * forwardMovement;
      bee.position.copy(pos);
      bee.rotation.y += turnMovement;
    }
  }
};

Player.prototype.playerControl = function (forward, turn) {
  if (forward < 0) {
    turn = -turn;
    this.move.forward = forward;
    this.move.turn = turn;
  }

  if (forward > 0) {
    if (this.action !== 'walk') this.action = 'walk';
  } else {
    this.action = 'look-around';
  }

  if (forward === 0 && turn === 0) {
    this.tweencam();
    this.move.forward = 0;
    this.move.turn = 0;
  } else {
    this.move.forward = forward;
    this.move.turn = turn;
  }
};

Player.prototype.tweencam = function () {
  const currentCameraPosition = this.game.camera.position.clone();
  const distance = this.camdistance;
  const targetCameraPosition = new THREE.Vector3(
    this.bee.position.x + distance.x,
    this.bee.position.y + distance.y,
    this.bee.position.z + distance.z
  );

  const tweenDuration = 2000;
  new Tween(currentCameraPosition)
    .to(targetCameraPosition, tweenDuration)
    .easing(Easing.Quadratic.In)
    .onUpdate(() => {
      this.game.camera.position.copy(currentCameraPosition);
    })
    .start();
};

Player.prototype.createPlayer = function (x, z, local = false) {
  var loader = new GLTFLoader();

  loader.load('./client/js/glb/beemodle.glb', (gltf) => {
    const bee = gltf.scene;
    var e = 5;
    bee.scale.set(e, e, e);
    bee.position.set(x, this.initialY, z);
    this.game.scene.add(gltf.scene);
    this.mixer = new AnimationMixer(bee);
    this.animations = gltf.animations;
    this.bee = bee;
    this.isloaded = true;
    this.playAnimation(['wing2Action.003', 'wing2.001Action']);

    if (local) {
      this.local = true;
      var distance = this.camdistance;
      this.positionCamera(this.game.camera, gltf.scene, distance.x, distance.y, distance.z);
      game.localplayer.setupKeyControls();
      let localpl = this;
      this.joystick = new JoyStick({
        onMove: this.playerControl.bind(localpl),
        game: game
      });
    }
  });
};

let lastElapsedTime = 0;
const animationSpeed = 1.2;
const animationHeight = 0.3;

Player.prototype.update = function (dt) {
  const elapsedTime = game.clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  if (!!this.bee) {
    const oscillation = Math.sin(elapsedTime * animationSpeed) * animationHeight - 0.1;
    this.bee.position.y = this.initialY + oscillation - 0.1;
    updateCamera(this, this.game.camera, this.bee, dt);

    if (this.local) this.movePlayer(dt);
    if (this.mixer) { this.mixer.update(dt * this.randomdt); }
  }
};

Player.prototype.positionCamera = function (camera, mesh, distanceX, distanceY, distanceZ) {
  camera.position.set(mesh.position.x + distanceX, mesh.position.y + distanceY, mesh.position.z + distanceZ);
  var offset = new THREE.Vector3(0, 1, 0);
  var newPosition = mesh.position.clone();
  newPosition.add(offset);
  camera.lookAt(newPosition);
};

Player.prototype.playAnimation = function (names) {
  if (!Array.isArray(this.animations)) {
    console.error('this.animations is not an array:', this.animations);
    return;
  }

  names.forEach(name => {
    const clip = this.animations.find(anim => anim.name === name);
    if (clip) {
      const action = this.mixer.existingAction(clip) || this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    } else {
      console.error('Animation not found:', name);
    }
  });
};

Player.prototype.sendPlayerData = function() {
  if (!this.bee || !this.socket) {
    console.error('Player data or socket is not available');
    return;
  }
  const playerData = {
    position: {
      x: this.bee.position.x,
      y: this.bee.position.y,
      z: this.bee.position.z
    },
    rotation: {
      x: this.bee.rotation.x,
      y: this.bee.rotation.y,
      z: this.bee.rotation.z
    }
  };
  this.socket.emit('playerData', playerData);
};

Player.prototype.setupKeyControls = function () {
  const keyState = { w: false, s: false, a: false, d: false };

  const updateMovement = () => {
    let forward = 0;
    let turn = 0;

    if (keyState.w) forward += 1;
    if (keyState.s) forward -= 1;
    if (keyState.a) turn += 1;
    if (keyState.d) turn -= 1;

    this.playerControl(forward, turn);
  };

  window.addEventListener('keydown', (event) => {
    if (['w', 's', 'a', 'd'].includes(event.key)) {
      keyState[event.key] = true;
      updateMovement();
    }
  });

  window.addEventListener('keyup', (event) => {
    if (['w', 's', 'a', 'd'].includes(event.key)) {
      keyState[event.key] = false;
      updateMovement();
    }
  });
};

Player.prototype.updatePosition = function(position, rotation) {
  if (!this.bee) {
    console.error('Bee object does not exist');
    return;
  }
  if (position) {
    this.bee.position.set(position.x, position.y, position.z);
  }
  if (rotation) {
    this.bee.rotation.set(rotation.x, rotation.y, rotation.z);
  }
};

export { Player };