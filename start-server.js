#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if required directories exist and create them if needed
const requiredDirs = [
  './client/audio',
  './client/js/glb'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Check if GLB files exist
const requiredFiles = [
  './client/js/glb/flower.glb',
  './client/js/glb/PineTrees.glb',
  './client/js/glb/newtrees.glb',
  './client/js/glb/beemodle.glb',
  './client/audio/nature_ambient.mp3',
  './client/audio/bump.mp3'
];

let missingFiles = false;
requiredFiles.forEach(file => {
  try {
    const stats = fs.statSync(file);
    console.log(`✓ ${file} exists (${stats.size} bytes)`);
  } catch (error) {
    console.error(`✗ ${file} is missing!`);
    
    // For audio files, create placeholder empty files
    if (file.includes('/audio/')) {
      console.log(`  Creating empty placeholder file for ${file}`);
      try {
        // Ensure directory exists
        const dir = path.dirname(file);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        // Create empty file
        fs.writeFileSync(file, '');
        console.log(`  Created placeholder for ${file} (needs real audio file)`);
      } catch (createError) {
        console.error(`  Could not create placeholder: ${createError.message}`);
      }
    } else {
      missingFiles = true;
    }
  }
});

if (missingFiles) {
  console.error('\nSome required model files are missing! Please make sure all model files are in place.\n');
  console.error('If you have new trees in "newtrees.glb", make sure to update app.js to serve them.');
} else {
  console.log('\nAll required files found. Starting server...\n');
}

// Start the server
const server = spawn('node', ['app.js'], { stdio: 'inherit' });

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

console.log('Server starting. Press Ctrl+C to stop');
