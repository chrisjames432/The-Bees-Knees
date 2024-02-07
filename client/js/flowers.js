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
    loader.load('./client/js/flower.glb', (gltf) => {
        flowersData.forEach(flowerData => {
            // Clone the model
            const flower = gltf.scene.clone();

            let pedal = flower.children[0].children[0];

            // Clone the material and set the color
            let newMaterial = pedal.material.clone();
            newMaterial.color.setHex(flowerData.color);
            pedal.material = newMaterial;

            // Set position, rotation, and scale from flower data
            flower.position.set(flowerData.position.x, flowerData.position.y, flowerData.position.z);
            flower.rotation.set(0, flowerData.rotation.y, 0);
            flowerData.scale=flowerData.scale*2
            flower.scale.set(flowerData.scale, flowerData.scale, flowerData.scale);

            // Add the flower to the scene
            game.scene.add(flower);
        });
    });
}