

console.log('game.js loaded')
import * as THREE from './three/build/three.module.js';
import { TWEEN } from './three/examples/jsm/libs/tween.module.min.js';
import { Player } from './player.js';
import { JoyStick } from './joystick.js'; 
//var THREE = THREE
var game = {};
game.socket = io();
game.player = new Player(game,game.socket)
game.three = THREE;
game.camdistance = {x:1.5, y:20, z:25}
game.animations = {};

//-----------------------------------------------------------------------------------------------

game.init = function () {


  game.scene = new THREE.Scene();
  game.scene.background = new THREE.Color(0xe0e0e0);;
  game.scene.fog = new THREE.Fog(0xe0e0e0, 100, 1000);
  game.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.clock = new THREE.Clock();
  
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


  
  game.player.createPlayer() // Create an instance of the Player
  console.log(game.player)
  game.joystick = new JoyStick({
      onMove: game.player.playerControl.bind(game.player),// game.player.playerControl, // Bind the playerControl function to the player instance
      game: game
  });

//game.player.sendPlayerData();



  makegrass();

  game.renderscene();


  window.addEventListener('resize', function () {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);

  }, false);


game.animate();

}

//-----------------------------------------------------------------------------------------------


game.animate = function () {
 
  for (var key in game.animations) {

    if (typeof game.animations[key] === "function") { game.animations[key](); }
    
  }
  TWEEN.update(); // Update all active tweens
  game.dt = game.clock.getDelta() ;

 
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

game.positionCamera =  function(camera, mesh, distanceX,distanceY,distanceZ) {
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



export { game }








