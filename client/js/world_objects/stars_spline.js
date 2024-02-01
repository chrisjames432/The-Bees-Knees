

import { game } from '../game.js';
import * as THREE from '../three/build/three.module.js';



var camPosIndex;
var spline;
var starsdone = false;
 function stars() {


    var stars = new THREE.Group()
    var randomPoints = [];
    for (var i = 0; i < 100; i++) {
        randomPoints.push(
            new THREE.Vector3(Math.random() * 800 - 100, Math.random() * 200 - 100, Math.random() * 800 - 100)
        );
    }

    spline = new THREE.SplineCurve3(randomPoints);
    camPosIndex = 0;



    //updatestars();

    for (var i = 0; i < 400; i++) {
        var b = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: "#EEEDDD" })
        );

        b.position.x = -1800 + Math.random() * 1800;
        b.position.y = -1800 + Math.random() * 1800;
        b.position.z = -1800 + Math.random() * 1800;

        stars.add(b);

    }

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    stars.add(cube);
    game.scene.add(stars);
    starsdone = true;
 
}




var currentLookat = new THREE.Vector3(0, 0, - 1);
var newLookat = new THREE.Vector3(0, 0, - 1);
var currentcoin = 'btc'



function set_current_coin(coin){

currentcoin = coin;


}
//-------------------------------------------------------------------------------------


function updatestars() {


    var camera = game.camera;

    camPosIndex++;
    if (camPosIndex > 10000) {
        camPosIndex = 0;
    }
    var camPos = spline.getPoint(camPosIndex / 10000);
    var camRot = spline.getTangent(camPosIndex / 10000);

    camera.position.x = camPos.x;
    camera.position.y = camPos.y;
    camera.position.z = camPos.z;

    camera.rotation.x = camRot.x;
    camera.rotation.y = camRot.y;
    camera.rotation.z = camRot.z;


    var coin = game.scene.getChildByName(currentcoin);

    if (coin) {

        currentLookat.lerp(newLookat, 0.01);
        camera.lookAt(currentLookat);

        
        
        var camPos = new THREE.Vector3(0, 0, 0); // Holds current camera position
        var targetPos = new THREE.Vector3(10, 10, -10); // Target position
        var origin = new THREE.Vector3(0, 0, 0); // Optional origin
        
        function animate(){
            // Interpolate camPos toward targetPos
            camPos.lerp(targetPos, 0.05);
        
            // Apply new camPos to your camera
            game.camera.position.copy(camPos);
        
            // (Optional) have camera look at the origin after it's been moved
            game.camera.lookAt(origin);
        
             //render();
        }
        
        
    //    animate()
        








    } else {

        camera.lookAt(spline.getPoint((camPosIndex + 1) / 10000));
    }


}



export { updatestars , set_current_coin, stars }


