// player.js

import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from './three/examples/jsm/libs/tween.module.min.js';
import { AnimationMixer } from './three/src/animation/AnimationMixer.js';
import { game } from './game.js';

function Player(game,socket) {
    this.move = {};
    this.move.forward=0;
    this.move.turn=0;
    this.action = '';
    this.game = game
    this.isloaded = false
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler(); 
    this.bee=""
    this.socket = socket
}

Player.prototype.movePlayer = function (dt) {
 
    if (this.isloaded==true) {
   
        const move = this.move;
        const speed =6;
        const moveSpeed = speed;
        const turnSpeed = speed;
        const bee = this.bee;
    
        if (move) {
            const forwardMovement = move.forward * moveSpeed * dt;
            const turnMovement = move.turn * turnSpeed * dt;

            const pos = bee.position.clone();
            //pos.y += 0;
            pos.x += Math.sin(bee.rotation.y) * forwardMovement;
            pos.z += Math.cos(bee.rotation.y) * forwardMovement;

            bee.position.copy(pos);
            bee.rotation.y += turnMovement;
        }
    }
};




Player.prototype.playerControl = function (forward, turn) {
    
    //console.log('Player Control - Forward:', forward);
    //console.log('Player Control - Turn:', turn);
    if (forward < 0) {
        turn = -turn;
        //this.move = { forward, turn };
        this.move.forward=forward
        this.move.turn=turn
    }

    if (forward > 0) {
        if (this.action !== 'walk') this.action = 'walk';
    } else {
        this.action = 'look-around';
    }

    if (forward === 0 && turn === 0) {
      this.tweencam();
      this.move.forward=0
      this.move.turn=0
    } else {
    
        this.move.forward=forward
        this.move.turn=turn
    }
};

Player.prototype.tweencam = function () {
    const currentCameraPosition = this.game.camera.position.clone();
    const distance = this.game.camdistance;
    const targetCameraPosition = new THREE.Vector3(
        this.bee.position.x + distance.x,
        this.bee.position.y + distance.y,
        this.bee.position.z + distance.z
    );

    const tweenDuration = 2000;
    new TWEEN.Tween(currentCameraPosition)
        .to(targetCameraPosition, tweenDuration)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate(() => {
            
            this.game.camera.position.copy(currentCameraPosition);
        })
        .start();
};




Player.prototype.createPlayer = function () {
   
    let lastElapsedTime = 0;
    const animationSpeed = 1.5;
    const animationHeight = 0.2;

    // Load player model
    var loader = new GLTFLoader();

    loader.load('./client/js/beemodle.glb', (gltf) => {
        var model = gltf.scene;
        var bee = model;
        var e = 5;
        console.log(bee)
        model.scale.set(e, e, e);
        this.initialY = 10; // Assuming 10 is the starting Y position
        bee.position.set(0, this.initialY, 0);
        bee.position.set(0, 10, 0); 
        this.game.scene.add(gltf.scene);
       
        var distance = this.game.camdistance;
        this.positionCamera(this.game.camera, gltf.scene, distance.x, distance.y, distance.z);
        this.game.player = bee;


        this.mixer = new AnimationMixer(bee);

        // Extracting animations and storing them
        this.animations = gltf.animations
        console.log(gltf.animations)
      



        this.game.animations.updown = () => {
            const dt = game.clock.getDelta();
          
        
            if (!!bee) {
                const oscillation = Math.sin(dt * animationSpeed) * animationHeight;
                bee.position.y = this.initialY + oscillation - 0.1;
               
                this.movePlayer(dt);
                this.update(dt);
            }
        };

        
           
           
        
        this.bee=bee
        this.isloaded=true

        $('#loading_div').delay(200).fadeOut(300);
        let plr = this
        setTimeout(function(){
            plr.playAnimation(['wing2Action.003', 'wing2.001Action']);
            
            
        
        
            setInterval(function(){plr.sendPlayerData()}  ,1000/60);
        
        
        
        },1000);

    });
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

Player.prototype.update = function (delta) {
    // Update the mixer on each frame
    if (this.mixer) {
        this.mixer.update(delta);
    }
};




// Function to send player data to the server
Player.prototype.sendPlayerData = function() {
    if (!this.bee || !this.socket) {
        console.error('Player data or socket is not available');
        return;
    }

    // Extract position and rotation data
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

    // Emit the data to the server
    this.socket.emit('playerData', playerData);
 

};










///make other players


Player.prototype.createOtherPlayer = function (position,rotation) {
   
   
    const animationSpeed = 1.5;
    const animationHeight = 0.2;

    // Load player model
    var loader = new GLTFLoader();

    loader.load('./client/js/beemodle.glb', (gltf) => {
        var model = gltf.scene;
        var bee = model;
        var e = 5;
        //console.log(bee)
        model.scale.set(e, e, e);
        this.initialY = 10; // Assuming 10 is the starting Y position
        let pos = position;
        let rot = rotation
        bee.position.set(pos.x, this.initialY, pos.z);
        bee.rotation.set(rot.x, rot.y,rot.z); 
       
      //  this.updateposition(position,rotation)
       this.game.scene.add(gltf.scene);


        this.mixer = new AnimationMixer(bee);

        // Extracting animations and storing them
        this.animations = gltf.animations
//        console.log(gltf.animations)
      



        this.game.animations.updown = () => {
            const dt = game.clock.getDelta();
          
        
            if (!!bee) {
                const oscillation = Math.sin(dt * animationSpeed) * animationHeight;
                bee.position.y = this.initialY + oscillation - 0.1;
               
               this.update(dt);
            }
        };

        
           
           
        
        this.bee=bee
        this.isloaded=true

  
        let plr = this
        setTimeout(function(){
            plr.playAnimation(['wing2Action.003', 'wing2.001Action']);
            //setInterval(function(){plr.updateposition(position,rotation)}  ,1000/60);
        
        
        
        },1000);

    });
};




Player.prototype.updateposition = function(position, rotation) {
    if (!this.bee) {
        console.error('Bee object does not exist');
        return;
    }

    // Update position
    if (position) {
        this.bee.position.set(position.x, position.y, position.z);
    }

    // Update rotation
    if (rotation) {
        this.bee.rotation.set(rotation.x, rotation.y, rotation.z);
    }
};



export { Player };
