







///=================================================================================================================================

function makedome() {


    var sphere = new THREE.Mesh(new THREE.SphereGeometry(5000, 20, 20), new THREE.MeshBasicMaterial({ color: 'black', wireframe: true }));
    sphere.position.x = 0;
    sphere.position.z = 0;
    game.scene.add(sphere);

}


//============================================================================================


//makes a flore block-----
function makefloor() {

    var material, plane;

    material = new THREE.MeshLambertMaterial({ color: 'white' });
    plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 100, 100, 100), material);
    plane.material.side = THREE.DoubleSide;
    plane.rotation.x = - Math.PI / 2;
    game.scene.add(plane);

}












