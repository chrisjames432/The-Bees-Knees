import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


function randomnumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function maketrees(game, numFlowers, yPosition) {
    const loader = new GLTFLoader();
    let maxScale=80;
    let minScale=20;

    loader.load('./client/js/glb/PineTrees.glb', (gltf) => {
        for (let i = 0; i < numFlowers; i++) {
            // Clone the model
            const tree = gltf.scene.clone();

        
            
            // Set a random position for each flower
            const randomXPosition = randomnumber(-250, 250);
            const randomZPosition = randomnumber(-250, 250);
            tree.position.set(randomXPosition, yPosition, randomZPosition);

            // Set random rotationwa
            const randomYRotation = Math.random() * Math.PI * 2; // Random rotation between 0 and 360 degrees
            tree.rotation.set(0, randomYRotation, 0);

            // Set random scale in x
            const randomXScale = Math.random() * (maxScale - minScale) + minScale; // Random scale between minScale and maxScale
            const e = randomnumber(40,160); // randomXScale;
            tree.scale.set(e, e, e);

            // Add the flower to the scene
            game.scene.add(tree);
        }
    });
}
