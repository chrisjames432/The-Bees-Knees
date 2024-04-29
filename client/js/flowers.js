import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';

function getRandomColor() {
    const colors = [0xff0000, // Red
                    0x0000ff, // Blue
                    0x800080, // Purple
                    0xffffff]; // White
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

function randomnumber(min, max) {
    return Math.random() * (max - min) + min;
}
export function createFlowers(game, flowersData) {
    const loader = new GLTFLoader();
    let maxScale=8;
    let minScale=2;

    loader.load('./client/js/flower.glb', (gltf) => {
        flowersData.forEach(flowerData => {
            // Clone the model
            const flower = gltf.scene.clone();

            let pedal = flower.children[0].children[0];

            // Clone the material and set the color
            let newMaterial = pedal.material.clone();
            newMaterial.color.setHex(flowerData.color);
            pedal.material = newMaterial;
            
            // Set a random position for each flower
            const randomXPosition = randomnumber(-100, 100);
            const randomZPosition = randomnumber(-100, 100);
            flower.position.set(randomXPosition, yPosition, randomZPosition);

            // Set random rotation
            const randomYRotation = Math.random() * Math.PI * 2; // Random rotation between 0 and 360 degrees
            flower.rotation.set(0, randomYRotation, 0);

            // Set random scale in x
            const randomXScale = Math.random() * (maxScale - minScale) + minScale; // Random scale between minScale and maxScale
            const e = 8; // randomXScale;
            flower.scale.set(e, e, e);

            // Add the flower to the scene
            game.scene.add(flower);
        });
    });
}