

console.log('game.js loaded')
import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from './three/examples/jsm/libs/tween.module.min.js';


//var THREE = THREE
var game = {};
game.animations = {};
game.player = ''
game.three = THREE;
game.camdistance = {x:1.5, y:20, z:25}

//-----------------------------------------------------------------------------------------------

game.init = function () {


  game.scene = new THREE.Scene();
  game.scene.background = new THREE.Color(0xe0e0e0);;
  game.scene.fog = new THREE.Fog(0xe0e0e0, 100, 1000);
  game.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.clock = new THREE.Clock();
  game.player = ''
  game.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
  game.renderer.setSize(window.innerWidth, window.innerHeight);
  game.renderer.outputEncoding = THREE.sRGBEncoding;
  game.renderer.setPixelRatio(window.devicePixelRatio);
  game.scene.background = new THREE.Color(0xe0e0e0);;
  

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
  game.scene.add(grid);

  var axesHelper = new THREE.AxesHelper(5);
  game.scene.add(axesHelper);

  game.joystick = new JoyStick({
    onMove: game.playerControl,
    game: game
  });


  game.renderscene()
  makegrass();
  loadglb();
  game.renderscene();


  window.addEventListener('resize', function () {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);

  }, false);




}

//-----------------------------------------------------------------------------------------------


game.animate = function () {
 
  for (var key in game.animations) {

    if (typeof game.animations[key] === "function") { game.animations[key](); }

  }
  TWEEN.update(); // Update all active tweens
  game.dt = game.clock.getDelta() ;

    // Call movePlayer function here
    game.movePlayer(game.dt);

    game.renderscene();
    requestAnimationFrame(game.animate); 

}


//-----------------------------------------------------------------------------------------------


game.renderscene = function () {
  game.renderer.render(game.scene, game.camera);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------


function createGrassyGround(width, length, widthSegments, lengthSegments) {
  // Create a geometry for the ground
  const groundGeometry = new THREE.PlaneGeometry(width, length, widthSegments, lengthSegments);

  // Create a green material for the ground
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 }); // Dark green color

  // Create the ground mesh
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);

  // Set the rotation to make the plane horizontal (lying flat)
  ground.rotation.x = -Math.PI / 2;
  return ground;
}


//-------------------------------------------------------------------------------------------------------------------------------------------------


function makegrass(){
// Usage example:
const width = 200; // Set the width of the ground
const length = 200; // Set the length of the ground
const widthSegments = 200; // Set the number of width segments
const lengthSegments = 200; // Set the number of length segments
const ground = createGrassyGround(width, length, widthSegments, lengthSegments);
// Add the ground to the scene
game.scene.add(ground);


}

//-------------------------------------------------------------------------------------------------------------------------------------------------

function positionCamera(camera, mesh, distanceX,distanceY,distanceZ) {
  camera.position.set(mesh.position.x + distanceX, mesh.position.y+distanceY , mesh.position.z + distanceZ);

  // Create a Vector3 to represent the offset
var offset = new THREE.Vector3(0,1, 0); // Adjust the values as needed

// Clone the current position of the mesh
var newPosition = mesh.position.clone();

// Add the offset to the cloned position
newPosition.add(offset);
  camera.lookAt(newPosition);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Initialize a variable to store the previous time
let prevTime = performance.now();

function tweencam() {
  // Player has stopped moving
  // Tween camera position and look-at target to the same XYZ distances
  const currentCameraPosition = game.camera.position.clone();
  const distance = game.camdistance;

  const targetCameraPosition = new THREE.Vector3(
    game.player.position.x + distance.x,
    game.player.position.y + distance.y,
    game.player.position.z + distance.z
  );


  const tweenDuration = 2000; // Set the duration of the tween in milliseconds

  // Create a tween for camera position
  new TWEEN.Tween(currentCameraPosition)
    .to(targetCameraPosition, tweenDuration)
    .easing(TWEEN.Easing.Quadratic.In) // You can choose a different easing function
    .onUpdate(() => {
      game.camera.position.copy(currentCameraPosition);
    })
    .start();


}



game.playerControl = function (forward, turn) {
  // Flip the forward direction when pushing down
  console.log('forward in: ',forward)
  if (forward < 0) {
    turn = -turn;
    // Keep the forward value negative for backward movement
    game.player.move = { forward, turn };
  }
  if (forward > 0) {
      // If moving forward, set the action to 'walk' or 'run' as needed
      if (game.player.action !== 'walk') game.player.action = 'walk';
  } else {
      // If not moving forward, set the action to 'look-around'
      game.player.action = 'look-around';
  }

  if (forward === 0 && turn === 0) {
      // If no forward or turn input, delete the player move
    
      tweencam();
      delete game.player.move;
     
    
    //  console.log('forward === 0 && turn === 0')
  } else {
    
      // Otherwise, set the player move with the modified values
      console.log("Turn value:", turn);
      game.player.move = { forward, turn };
  }
};







game.movePlayer = function (dt) {
  if (game.player) {
      const player = game.player;
      const move = player.move;
      //console.log(move)
      const speed = 3
      const moveSpeed = speed;
      const turnSpeed = speed;
     
      if (move) {
     
        console.log("Turn value in move: ", move.turn);
        //console.log(move.forward,"  ---in move player")
       // console.log('move forward: ',move.forward)
          // Calculate the forward and turning movements
          const forwardMovement = move.forward * moveSpeed * dt;
          const turnMovement = move.turn * turnSpeed * dt; // Adjust the sign here



          // Update the player's position
          const pos = player.position.clone();
          pos.y += 0.1; // Adjust as needed
          pos.x += Math.sin(player.rotation.y) * forwardMovement;
          pos.z += Math.cos(player.rotation.y) * forwardMovement;

          // Set the new player position
          player.position.copy(pos);

          // Rotate the player around its Y-axis for turning
          player.rotation.y += turnMovement; // Adjusted the sign here
      }
  }
};






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const clock = new THREE.Clock();
let lastElapsedTime = 0;
const animationSpeed = 1.5; // Adjust the speed as needed
const animationHeight = 0.2; // Adjust the height as needed

function loadglb(){


   //LOAD GAME SCENE -----------------------------------------------  
   var loader = new GLTFLoader();

   loader.load('./client/js/beemodle.glb', function (gltf) {

     var model = gltf.scene;
     var bee =  model;
     var e =5;
     model.scale.set(e, e, e)
     game.scene.add(gltf.scene);
     var distance = game.camdistance
     game.positionCamera(game.camera,gltf.scene,distance.x,distance.y,distance.z);
    game.player=bee;


    game.animations.updown=function(){

      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - lastElapsedTime
      lastElapsedTime = elapsedTime

      if(!!bee){
        bee.position.y = Math.sin(elapsedTime * animationSpeed) * animationHeight - 0.1;
        console.log(bee.position)
      }

    }

    $('#loading_div').delay(400).fadeOut(400);

   })
}



class JoyStick{
	constructor(options){
		const circle = document.createElement("div");
		circle.style.cssText = "position:absolute; bottom:45px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
		const thumb = document.createElement("div");
		thumb.style.cssText = "position: absolute; left: 18px; top: 18px; width: 40px; height: 40px; border-radius: 50%; background: #fff;";
		circle.appendChild(thumb);
		document.body.appendChild(circle);
		this.domElement = thumb;
		this.maxRadius = options.maxRadius || 30;
		this.maxRadiusSquared = this.maxRadius * this.maxRadius;
		this.onMove = options.onMove;
		this.game = options.game;
		this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
		
		if (this.domElement!=undefined){
			const joystick = this;
			if ('ontouchstart' in window){
				this.domElement.addEventListener('touchstart', function(evt){ joystick.tap(evt); });
			}else{
				this.domElement.addEventListener('mousedown', function(evt){ joystick.tap(evt); });
			}
		}
	}
	
	getMousePosition(evt){
		let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
		let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
		return { x:clientX, y:clientY };
	}
	
	tap(evt){
		evt = evt || window.event;
		// get the mouse cursor position at startup:
		this.offset = this.getMousePosition(evt);
		const joystick = this;
		if ('ontouchstart' in window){
			document.ontouchmove = function(evt){ joystick.move(evt); };
			document.ontouchend =  function(evt){ joystick.up(evt); };
		}else{
			document.onmousemove = function(evt){ joystick.move(evt); };
			document.onmouseup = function(evt){ joystick.up(evt); };
		}
	}
	
	move(evt) {
    evt = evt || window.event;
    const mouse = this.getMousePosition(evt);

    // Calculate the new cursor position:
    let left = mouse.x - this.offset.x;
    let top = mouse.y - this.offset.y;

    // Constrain the movement within the max radius
    const sqMag = left * left + top * top;
    if (sqMag > this.maxRadiusSquared) {
        const magnitude = Math.sqrt(sqMag);
        left /= magnitude;
        top /= magnitude;
        left *= this.maxRadius;
        top *= this.maxRadius;
    }

    // Set the element's new position:
    this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
    this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;

    // Implement the dead zone and clamping
    const deadZone = 0.1; // Dead zone threshold, adjust as needed
    let forward = -(top - this.origin.top + this.domElement.clientHeight/2) / this.maxRadius;
    let turn = -(left - this.origin.left + this.domElement.clientWidth/2) / this.maxRadius;

    // Apply dead zone
    forward = Math.abs(forward) > deadZone ? forward : 0;
    turn = Math.abs(turn) > deadZone ? turn : 0;

    // Clamp the values
    forward = Math.min(Math.max(forward, -1), 1);
    turn = Math.min(Math.max(turn, -1), 1);

    // Send updated values
     // Send updated values
     if (this.onMove != undefined) this.onMove.call(this.game, forward, turn);
    }

	
	up(evt){
		if ('ontouchstart' in window){
			document.ontouchmove = null;
			document.touchend = null;
		}else{
			document.onmousemove = null;
			document.onmouseup = null;
		}
		this.domElement.style.top = `${this.origin.top}px`;
		this.domElement.style.left = `${this.origin.left}px`;
		
		this.onMove.call(this.game, 0, 0);
	}
}


export { game }








