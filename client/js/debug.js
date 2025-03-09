/**
 * Debug utility functions
 */

export function logModelStructure(model, name = 'Model', level = 0) {
    const indent = ' '.repeat(level * 2);
    console.log(`${indent}${name} [${model.type}]`);
    
    if (model.children && model.children.length > 0) {
        console.log(`${indent}Children: ${model.children.length}`);
        model.children.forEach((child, index) => {
            logModelStructure(child, `Child[${index}]`, level + 1);
        });
    } else {
        console.log(`${indent}No children`);
    }
    
    if (model.material) {
        console.log(`${indent}Material: ${model.material.type}`);
    }
    
    if (model.geometry) {
        console.log(`${indent}Geometry: ${model.geometry.type}`);
    }
}

export function checkGLBFile(path, callback) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                console.error(`Error loading GLB file: ${path}`, response.status, response.statusText);
                return null;
            }
            return response.arrayBuffer();
        })
        .then(buffer => {
            if (buffer) {
                console.log(`GLB file exists: ${path}`, 'Size:', buffer.byteLength, 'bytes');
                if (typeof callback === 'function') {
                    callback(true, buffer.byteLength);
                }
            } else {
                if (typeof callback === 'function') {
                    callback(false);
                }
            }
        })
        .catch(error => {
            console.error(`Error checking GLB file: ${path}`, error);
            if (typeof callback === 'function') {
                callback(false, error);
            }
        });
}
