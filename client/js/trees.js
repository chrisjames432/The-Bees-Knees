import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

function randomnumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function createTrees(game, treesData) {
    if (!treesData || !Array.isArray(treesData) || treesData.length === 0) {
        console.error('Invalid or empty trees data:', treesData);
        return;
    }
    
    console.log(`Starting to create ${treesData.length} trees`);
    
    const loader = new GLTFLoader();

    // Use the new trees file with multiple variations
    loader.load('/client/js/glb/newtrees.glb', 
        // onLoad callback
        (gltf) => {
            console.log('New tree models loaded successfully');
            try {
                // Debug the structure of the loaded model
                console.log('Tree model structure:', JSON.stringify({
                    scene: gltf.scene ? 'exists' : 'missing',
                    children: gltf.scene ? gltf.scene.children.length : 0
                }));
                
                // Find the three tree variations and store them
                const treeVariations = [];
                let foundTrees = 0;
                
                gltf.scene.traverse((object) => {
                    // Look for the three main tree objects
                    if (object.name && (object.name.includes('tree1') || 
                                       object.name.includes('tree2') || 
                                       object.name.includes('tree3'))) {
                        treeVariations.push(object);
                        foundTrees++;
                        console.log(`Found tree variation: ${object.name}`);
                    }
                });
                
                if (foundTrees === 0) {
                    console.warn("No specific tree variations found, using the entire model instead");
                    treeVariations.push(gltf.scene);
                }
                
                // Debug visualize dimensions
                treeVariations.forEach((tree, idx) => {
                    const box = new THREE.Box3().setFromObject(tree);
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    console.log(`Tree variation ${idx+1} size:`, size);
                });
                
                // Analyze each tree variation for better collision detection
                const treeInfos = treeVariations.map((tree, index) => {
                    const info = analyzeTrunkDimensions(tree);
                    console.log(`Tree${index + 1} dimensions:`, info);
                    return info;
                });
                
                treesData.forEach((treeData, index) => {
                    try {
                        // Randomly select one of the tree variations
                        const variationIndex = Math.floor(Math.random() * treeVariations.length);
                        const selectedTree = treeVariations[variationIndex].clone();
                        const selectedInfo = treeInfos[variationIndex];
                        
                        // Get the scale from server data
                        const scale = treeData.scale || 1;
                        
                        // Set position from server data
                        selectedTree.position.set(
                            treeData.position.x || 0, 
                            0, // Force trees to be at ground level
                            treeData.position.z || 0
                        );

                        // Set rotation from server data
                        selectedTree.rotation.set(0, treeData.rotation.y || 0, 0);
                        
                        // Apply the scale
                        selectedTree.scale.set(scale, scale, scale);
                        
                        // Generate precise collision data for this specific tree
                        const collisionData = generateCollisionData(selectedTree, variationIndex, selectedInfo, scale);
                        
                        // Store collision data with the tree
                        selectedTree.userData = {
                            collisionData: collisionData,
                            treeVariation: variationIndex + 1,
                            treeIndex: index
                        };

                        // Add the tree to the scene
                        game.scene.add(selectedTree);
                        game.trees.push(selectedTree); // Store tree object
                        
                        console.log(`Created tree${variationIndex + 1} at position: (${selectedTree.position.x}, ${selectedTree.position.y}, ${selectedTree.position.z}) with scale ${scale}`);
                    } catch (error) {
                        console.error('Error creating tree:', error);
                    }
                });
                
                console.log(`Successfully created ${game.trees.length} trees using ${foundTrees} variations`);
            } catch (e) {
                console.error('Error setting up trees:', e);
                // Fall back to loading the old tree model if there's an error
                fallbackToOldTreeModel(game, treesData);
            }
        },
        // onProgress callback
        (xhr) => {
            console.log('Tree models loading:', (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        (error) => {
            console.error('Error loading new tree models:', error);
            // Fallback to old model if loading fails
            fallbackToOldTreeModel(game, treesData);
        }
    );
}

// Fallback function to use the old tree model if the new one fails
function fallbackToOldTreeModel(game, treesData) {
    console.log("Falling back to old tree model");
    const loader = new GLTFLoader();
    
    loader.load('/client/js/glb/PineTrees.glb', 
        (gltf) => {
            treesData.forEach((treeData, index) => {
                try {
                    const tree = gltf.scene.clone();
                    tree.position.set(
                        treeData.position.x || 0, 
                        treeData.position.y || 0, 
                        treeData.position.z || 0
                    );
                    tree.rotation.set(0, treeData.rotation.y || 0, 0);
                    const scale = treeData.scale || 50;
                    tree.scale.set(scale, scale, scale);
                    tree.userData.collisionRadius = 1.2 * scale;
                    game.scene.add(tree);
                    game.trees.push(tree);
                } catch (error) {
                    console.error('Error creating fallback tree:', error);
                }
            });
        },
        null,
        (error) => console.error('Error loading fallback tree model:', error)
    );
}

// Helper function to analyze the dimensions of the tree trunk
function analyzeTrunkDimensions(treeModel) {
    const trunkInfo = {
        height: 0,
        radius: 0,
        found: false
    };
    
    try {
        // For better analysis, first get the bounding box of the entire tree
        const treeBoundingBox = new THREE.Box3().setFromObject(treeModel);
        const treeSize = new THREE.Vector3();
        treeBoundingBox.getSize(treeSize);
        
        // Look for the trunk mesh in the tree model
        let trunkMesh = null;
        
        treeModel.traverse((object) => {
            if (object.isMesh) {
                // Look for trunk in the name or check if it's in the lower part of the tree
                if (object.name.toLowerCase().includes('trunk') || 
                    (object.geometry && object.position.y < treeSize.y * 0.3)) {
                    
                    // If multiple trunk parts, choose the lowest one (main trunk)
                    if (!trunkMesh || object.position.y < trunkMesh.position.y) {
                        trunkMesh = object;
                    }
                }
            }
        });
        
        // If no specific trunk mesh was found, approximate from the bottom third of the tree
        if (trunkMesh) {
            // Get the bounding box of the trunk
            const box = new THREE.Box3().setFromObject(trunkMesh);
            const size = new THREE.Vector3();
            box.getSize(size);
            
            // Calculate trunk dimensions
            trunkInfo.height = size.y;
            trunkInfo.radius = Math.max(size.x, size.z) / 2;
            trunkInfo.found = true;
        } else {
            // Approximate trunk from bottom part of tree
            trunkInfo.height = treeSize.y * 0.3;
            trunkInfo.radius = Math.max(treeSize.x, treeSize.z) * 0.15; // Better estimation for trunk width
            trunkInfo.found = true;
        }
        
        // Ensure minimum radius
        trunkInfo.radius = Math.max(1.0, trunkInfo.radius);
    } catch (error) {
        console.warn('Could not analyze trunk dimensions:', error);
        // Use default values
        trunkInfo.height = 10;
        trunkInfo.radius = 2; // Increased default radius
    }
    
    return trunkInfo;
}

// New function to generate precise collision data for each tree
function generateCollisionData(tree, variationIndex, baseInfo, scale) {
    // Create a compound collision shape using multiple cylinders if needed
    let collisionShapes = [];
    
    // Get the bounding box to help with calculations
    const treeBoundingBox = new THREE.Box3().setFromObject(tree);
    const treeSize = new THREE.Vector3();
    treeBoundingBox.getSize(treeSize);
    
    // For different tree variations, create appropriate collision shapes
    switch(variationIndex) {
        case 0: // tree1 - usually thinner
            // Main trunk
            collisionShapes.push({
                type: 'cylinder',
                radius: Math.max(1.0, (baseInfo && baseInfo.found) ? baseInfo.radius * scale : treeSize.x * 0.06),
                height: treeSize.y * 0.4,
                position: new THREE.Vector3(0, treeSize.y * 0.2, 0)
            });
            break;
            
        case 1: // tree2 - typically wider base
            // Main trunk (wider)
            collisionShapes.push({
                type: 'cylinder',
                radius: Math.max(1.0, (baseInfo && baseInfo.found) ? baseInfo.radius * 1.2 * scale : treeSize.x * 0.08),
                height: treeSize.y * 0.3,
                position: new THREE.Vector3(0, treeSize.y * 0.15, 0)
            });
            break;
            
        case 2: // tree3 - might have multiple trunks or branches
            // Main trunk
            collisionShapes.push({
                type: 'cylinder',
                radius: Math.max(1.0, (baseInfo && baseInfo.found) ? baseInfo.radius * scale : treeSize.x * 0.075),
                height: treeSize.y * 0.35,
                position: new THREE.Vector3(0, treeSize.y * 0.175, 0)
            });
            
            // Optional second trunk or major branch if this tree type has one
            if (Math.random() > 0.5) {
                const angleOffset = Math.random() * Math.PI * 2;
                const distanceOffset = treeSize.x * 0.1;
                
                collisionShapes.push({
                    type: 'cylinder',
                    radius: Math.max(0.5, (baseInfo && baseInfo.found) ? baseInfo.radius * 0.7 * scale : treeSize.x * 0.04),
                    height: treeSize.y * 0.25,
                    position: new THREE.Vector3(
                        Math.cos(angleOffset) * distanceOffset,
                        treeSize.y * 0.2,
                        Math.sin(angleOffset) * distanceOffset
                    )
                });
            }
            break;
            
        default:
            // Default collision shape when we can't determine the type
            collisionShapes.push({
                type: 'cylinder',
                radius: Math.max(1.0, (baseInfo && baseInfo.found) ? baseInfo.radius * scale : treeSize.x * 0.07),
                height: treeSize.y * 0.4,
                position: new THREE.Vector3(0, treeSize.y * 0.2, 0)
            });
    }
    
    return {
        shapes: collisionShapes,
        // Store the overall collision bounds for quick rejection tests
        bounds: {
            width: treeSize.x,
            height: treeSize.y,
            depth: treeSize.z
        }
    };
}
