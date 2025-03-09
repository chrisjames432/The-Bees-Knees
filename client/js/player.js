// player.js

console.log('threemain/examples/jsm/loaders/GLTFLoader.js')
import * as THREE from 'three';
import { GLTFLoader } from 'threemain/examples/jsm/loaders/GLTFLoader.js';
import { Tween, Easing } from 'three/addons/libs/tween.module.min.js';
import { AnimationMixer } from 'threemain/src/animation/AnimationMixer.js';
import { game } from './game.js';
import { JoyStick } from './joystick.js'; 
import { audioManager } from './audio.js';

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
var zvalue = -10;   //sets the camera distance from player

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
  this.camdistance = { x: 1.5, y: 25, z: 10 };
  this.mixer = '';
  this.initialY = 3;
  this.randomdt = getRandomNumberWithTwoDecimals(2, 4);
  this.local = false;
  this._currentPosition = new THREE.Vector3();
  this._currentLookat = new THREE.Vector3();
  this.score = 0; // Add score property
  this.lastCollisionTime = 0;
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
      
      // Store the current position before moving
      const currentPosition = bee.position.clone();
      
      // Calculate the new position
      const pos = currentPosition.clone();
      pos.x += Math.sin(bee.rotation.y) * forwardMovement;
      pos.z += Math.cos(bee.rotation.y) * forwardMovement;
      
      // Update bee position temporarily
      bee.position.copy(pos);
      
      // Check for tree collisions
      if (this.checkTreeCollision()) {
        // Collision detected, revert to previous position
        bee.position.copy(currentPosition);
        // Add slight bounce effect (optional)
        if (this.lastCollisionTime === undefined || 
            game.clock.getElapsedTime() - this.lastCollisionTime > 0.5) {
          this.showCollisionFeedback();
        }
      }
      
      // Apply rotation regardless of collision
      bee.rotation.y += turnMovement;
    }
  }
};

Player.prototype.showCollisionFeedback = function() {
  // Store collision time to prevent feedback spam
  this.lastCollisionTime = game.clock.getElapsedTime();
  
  // Visual feedback - slight shake or flash
  if (this.bee) {
    // Create a short camera shake effect
    const originalY = this.bee.position.y;
    const shakeAmount = 0.2;
    
    // Simple shake animation using tweens
    new Tween(this.bee.position)
      .to({ y: originalY + shakeAmount }, 50)
      .yoyo(true)
      .repeat(3)
      .start();
      
    // Send collision event to server
    if (this.socket) {
      this.socket.emit('treeCollision', { 
        playerName: this.name,
        position: {
          x: this.bee.position.x,
          y: this.bee.position.y,
          z: this.bee.position.z
        }
      });
    }
    
    // Play collision sound
    audioManager.playSound('bump');
  }
};

// Remove the old playCollisionSound method
// Player.prototype.playCollisionSound = function() { ... }

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

  // Use relative path without ./client prefix
  loader.load('/client/js/glb/beemodle.glb', (gltf) => {
    console.log('Bee model loaded successfully');
    const bee = gltf.scene;
    var e = 5;
    bee.scale.set(e, e, e);
    bee.position.set(x, this.initialY, z);
    this.game.scene.add(gltf.scene);
    this.mixer = new AnimationMixer(bee);
    this.animations = gltf.animations;
    this.bee = bee;
    this.isloaded = true;
    
    try {
      this.playAnimation(['wing2Action.003', 'wing2.001Action']);
    } catch (e) {
      console.error('Error playing animation:', e);
    }

    if (local) {
      this.local = true;
      this.cameraMode = 'third-person'; // Default camera mode
      var distance = this.camdistance;
      this.positionCamera(this.game.camera, gltf.scene, distance.x, distance.y, distance.z);
      this.setupKeyControls();
      this.setupCameraToggle();
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
    if (this.local) {
      if (this.cameraMode === 'third-person') {
        updateCamera(this, this.game.camera, this.bee, dt); // Update camera for third-person view
      } else {
        // Top-down view - directly position camera
        this.positionCamera(
          this.game.camera,
          this.bee,
          this.camdistance.x,
          this.camdistance.y,
          this.camdistance.z
        );
      }
    }
    
    if (game.flowers && game.flowers.length > 0) {
      this.checkFlowerCollision(); // Check for flower collision
    }

    if (this.local) this.movePlayer(dt); // Only move local player
    if (this.mixer) { this.mixer.update(dt * this.randomdt); }
  }
};

Player.prototype.checkFlowerCollision = function() {
  if (!this.bee) return;
  if (!game.flowers || !Array.isArray(game.flowers)) {
    console.warn('Flowers array is not properly initialized');
    return;
  }
  
  const beeBox = new THREE.Box3().setFromObject(this.bee);
  
  // Use for loop in reverse to safely handle array splicing
  for (let i = game.flowers.length - 1; i >= 0; i--) {
    const flower = game.flowers[i];
    if (!flower) continue;
    
    const flowerBox = new THREE.Box3().setFromObject(flower);
    if (beeBox.intersectsBox(flowerBox)) {
      game.scene.remove(flower);
      game.flowers.splice(i, 1);
      this.score++;
      
      if (this.socket) {
        this.socket.emit('flowerCollected', { index: i });
        this.sendPlayerData(); // Send updated score to server
      }
      
      updateScore(this.score); // Update score display on the client side
    }
  }
};

Player.prototype.checkTreeCollision = function() {
    if (!this.bee || !game.trees || !Array.isArray(game.trees)) return false;
    
    // Get bee position for distance calculations
    const beePosition = new THREE.Vector3();
    this.bee.getWorldPosition(beePosition);
    
    // Create a tighter bounding sphere for the bee
    const beeRadius = 1.0; // Approximate radius of the bee's body
    
    let collided = false;
    let collisionTree = null;
    let collisionPoint = null;
    
    for (let i = 0; i < game.trees.length; i++) {
        const tree = game.trees[i];
        // Skip invalid trees
        if (!tree || !tree.userData) continue;
        
        // Get tree position
        const treePosition = new THREE.Vector3();
        tree.getWorldPosition(treePosition);
        
        // Calculate rough distance between bee and tree for quick rejection test
        const roughDistance = beePosition.distanceTo(treePosition);
        
        // Get tree collision data
        let collisionData = tree.userData.collisionData;
        
        if (!collisionData || !collisionData.shapes || collisionData.shapes.length === 0) {
            // Fallback if proper collision data is missing
            const defaultRadius = 2.0;
            if (roughDistance < defaultRadius + beeRadius) {
                collided = true;
                collisionTree = tree;
                break;
            }
            continue;
        }
        
        // Quick rejection test based on bounds
        if (collisionData.bounds) {
            const maxBoundsRadius = Math.max(collisionData.bounds.width, collisionData.bounds.depth) / 2;
            if (roughDistance > maxBoundsRadius + beeRadius + 2) { // Add some margin
                continue; // Tree is too far away for collision
            }
        }
        
        // Check each collision shape of this tree
        for (const shape of collisionData.shapes) {
            if (shape.type === 'cylinder') {
                // Calculate the shape's world position
                const shapePosition = new THREE.Vector3().copy(shape.position);
                shapePosition.applyMatrix4(tree.matrixWorld);
                
                // Calculate horizontal distance only (ignore Y)
                const horizontalDistanceVector = new THREE.Vector3(
                    beePosition.x - shapePosition.x,
                    0,
                    beePosition.z - shapePosition.z
                );
                
                const horizontalDistance = horizontalDistanceVector.length();
                
                // If horizontal distance is less than cylinder radius + bee radius, we have a collision
                if (horizontalDistance < shape.radius + beeRadius) {
                    collided = true;
                    collisionTree = tree;
                    collisionPoint = shapePosition;
                    
                    // Debug visualization if needed
                    if (this.local && game.debugMode) {
                        this.visualizeCollision(shapePosition, shape.radius);
                    }
                    
                    break; // No need to check other shapes once we found a collision
                }
            }
        }
        
        if (collided) break; // Exit loop once collision is found
    }
    
    // If collided and we're the local player, calculate bounce direction for more realistic collision response
    if (collided && this.local && collisionPoint) {
        this.lastCollisionDirection = new THREE.Vector3(
            beePosition.x - collisionPoint.x,
            0,
            beePosition.z - collisionPoint.z
        ).normalize();
    }
    
    return collided;
};

// Enhanced visualization to show all collision shapes of trees
Player.prototype.visualizeCollision = function(position, radius) {
    // Check if we already have a debug cylinder
    if (!this.debugCylinder) {
        const geometry = new THREE.CylinderGeometry(1, 1, 20, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        this.debugCylinder = new THREE.Mesh(geometry, material);
        game.scene.add(this.debugCylinder);
    }
    
    // Update the cylinder position and scale
    this.debugCylinder.position.copy(position);
    this.debugCylinder.scale.set(radius, 1, radius);
    this.debugCylinder.visible = true;
    
    // Hide the debug cylinder after a short time
    clearTimeout(this.debugTimer);
    this.debugTimer = setTimeout(() => {
        if (this.debugCylinder) this.debugCylinder.visible = false;
    }, 1000);
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
    },
    score: this.score // Include score in player data
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

Player.prototype.setupCameraToggle = function() {
  const cameraToggleBtn = document.getElementById('camera-toggle-btn');
  if (cameraToggleBtn) {
    cameraToggleBtn.addEventListener('click', () => {
      this.toggleCameraView();
    });
  }
};

Player.prototype.toggleCameraView = function() {
  if (this.cameraMode === 'third-person') {
    // Switch to top-down view
    this.cameraMode = 'top-down';
    this.camdistance = { x: 0, y: 50, z: 0 }; // Higher y, zero x and z for top-down
    console.log('Switched to top-down view');
  } else {
    // Switch back to third-person view
    this.cameraMode = 'third-person';
    this.camdistance = { x: 1.5, y: 25, z: 10 }; // Original third-person camera values
    console.log('Switched to third-person view');
  }
  
  // Update camera position immediately
  if (this.bee) {
    this.positionCamera(
      this.game.camera, 
      this.bee, 
      this.camdistance.x, 
      this.camdistance.y, 
      this.camdistance.z
    );
  }
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

function updateScore(score) {
  document.getElementById('score').innerText = `Score: ${score}`;
}

export { Player };