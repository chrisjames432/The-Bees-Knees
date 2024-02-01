


//===================================================================================================================================
//This function creates a block with a image on it currently a exchange

function exchangeblock(x, y, z, xs, ys, zs) {

    var texture, material, plane;

    texture = THREE.ImageUtils.loadTexture("client/js/images/exchangepics/pol.png");

    // assuming you want the texture to repeat in both directions:
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    texture.repeat.set(1, 1);

    material = new THREE.MeshBasicMaterial({ map: texture });
    plane = new THREE.Mesh(new THREE.BoxGeometry(xs, ys, zs), material);
    plane.material.side = THREE.DoubleSide;
    plane.position.x = x;
    plane.position.y = y;
    plane.position.z = z;
    scene.add(plane);

}


//==========================================================================================================
//makes a picture block


function makepicture(pic, x, y, z) {

    var texture = new THREE.TextureLoader().load(pic);
    texture.repeat.set(1, 1);
    var geometry = new THREE.BoxGeometry(30, 15, 0.1);
    var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
    var material = [];
    material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    material.push(new THREE.MeshBasicMaterial({ map: texture }));
    material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    var cube = new THREE.Mesh(bufferGeometry, material);

    cube.position.set(x, y, z);


    return cube;

}
