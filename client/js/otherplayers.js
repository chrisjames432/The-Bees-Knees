// player.js

import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from './three/src/animation/AnimationMixer.js';
import { game } from './game.js';




function otherplayer(game,name, gltf) {
   
  
    this.gltf = gltf
    this.game = game
    this.isloaded = false
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler(); 
    this.bee
    this.socket = game.socket
    this.name = name
    this.mixer
}



///make other players


otherplayer.prototype.createOtherPlayer = function (position,rotation) {


    // Load player model
    var loader = new GLTFLoader();

    loader.load('./client/js/beemodle.glb', (gltf) => {
        const bee = gltf.scene;
        var e = 5;
        bee.scale.set(e, e, e);
        this.initialY = 5; // Assuming 10 is the starting Y position
        bee.position.set(position.x, this.initialY, 5);
      
        this.game.scene.add(gltf.scene);
               
        this.mixer = new AnimationMixer(bee);
       // this.mixer = gltf.mixer
        // Extracting animations and storing them
        this.animations = gltf.animations
        console.log(this.animations)
        if (this.animations.length === 0) {
            console.error('No animations found in the loaded model.');
            return;
        }
              
        
        this.bee=bee
        this.isloaded=true

        this.playAnimation(['wing2Action.003', 'wing2.001Action']);
        
        

    });
};



otherplayer.prototype.playAnimation = function (names) {
    if (!Array.isArray(this.animations)) {
        console.error('this.animations is not an array:', this.animations);
        return;
    }

    names.forEach(name => {

        const clip = this.animations.find(anim => anim.name === name);
        console.log('Bee Object:', this.bee);
        if (clip) {
            const action = this.mixer.existingAction(clip) || this.mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
            console.log(clip)
            
        } else {
            console.error('Animation not found:', name);
        }
    });
};



otherplayer.prototype.updateposition = function(position, rotation) {
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



let lastElapsedTime = 0;
const animationSpeed = 1.2;
const animationHeight = 0.3;
otherplayer.prototype.update = function(dt) {

    
    const elapsedTime = game.clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    if (!!this.bee) {
            
        const oscillation = Math.sin(elapsedTime * animationSpeed) * animationHeight - 0.1;// Math.sin(dt * animationSpeed) * animationHeight;
        this.bee.position.y = this.initialY + oscillation - 0.1;
       
        
        

        if (this.mixer) {
            this.mixer.update(dt);
        }


    }


};



export { otherplayer };
