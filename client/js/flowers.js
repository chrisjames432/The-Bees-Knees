import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
    if (!flowersData || !Array.isArray(flowersData) || flowersData.length === 0) {
        console.error('Invalid or empty flowers data:', flowersData);
        return;
    }
    
    console.log(`Starting to create ${flowersData.length} flowers`);
    
    const loader = new GLTFLoader();
    let maxScale = 8;
    let minScale = 2;
    let yPosition = 0;

    // Use relative path without ./client prefix
    loader.load('/client/js/glb/flower.glb', 
        // onLoad callback
        (gltf) => {
            console.log('Flower model loaded successfully');
            try {
                // Debug the structure of the loaded model
                console.log('Flower model structure:', JSON.stringify({
                    scene: gltf.scene ? 'exists' : 'missing',
                    children: gltf.scene ? gltf.scene.children.length : 0
                }));
            } catch (e) {
                console.error('Error logging model structure:', e);
            }
            
            flowersData.forEach((flowerData, index) => {
                try {
                    // Clone the model
                    const flower = gltf.scene.clone();

                    // Debug checking
                    try {
                        console.log(`Flower ${index} structure:`, 
                            flower.children ? flower.children.length : 'no children');
                        
                        if (flower.children && flower.children.length > 0) {
                            console.log('First child has:', 
                                flower.children[0].children ? flower.children[0].children.length : 'no children');
                        }
                    } catch (e) {
                        console.error('Error inspecting flower structure:', e);
                    }

                    // Try to find a suitable part to color
                    let pedal = null;
                    if (flower.children && flower.children[0] && 
                        flower.children[0].children && flower.children[0].children[0]) {
                        pedal = flower.children[0].children[0];
                    } else {
                        // Try to find meshes directly
                        flower.traverse(function(child) {
                            if (child.isMesh && !pedal) {
                                pedal = child;
                            }
                        });
                    }

                    // Set color if we found a suitable part
                    if (pedal && pedal.material) {
                        let newMaterial = pedal.material.clone();
                        newMaterial.color.setHex(flowerData.color || 0xffffff);
                        pedal.material = newMaterial;
                    }
                    
                    // Set position from server data
                    flower.position.set(
                        flowerData.position.x || 0, 
                        flowerData.position.y || 0, 
                        flowerData.position.z || 0
                    );

                    // Set rotation from server data
                    flower.rotation.set(0, flowerData.rotation.y || 0, 0);

                    // Set scale from server data
                    const scale = flowerData.scale || 5;
                    flower.scale.set(scale, scale, scale);

                    // Add the flower to the scene
                    game.scene.add(flower);
                    game.flowers.push(flower); // Store flower object
                    
                    if (index % 10 === 0 || index < 5) {
                        console.log(`Created flower at position:`, flower.position);
                    }
                } catch (error) {
                    console.error('Error creating flower:', error);
                }
            });
            
            console.log(`Successfully created ${game.flowers.length} flowers`);
        },
        // onProgress callback
        (xhr) => {
            console.log('Flower model loading:', (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        (error) => {
            console.error('Error loading flower model:', error);
        }
    );
}