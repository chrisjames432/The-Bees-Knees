import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

// Build JavaScript bundle
await build({
  entryPoints: ['client/js/game.js'],
  bundle: true,
  format: 'iife',
  globalName: 'GameBundle',
  minify: true,
  sourcemap: true,
  outfile: 'temp_build.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: {
    '.glsl': 'text', // if we import shaders later
  },
});

console.log('✓ Built temp_build.js');

// Now create the final HTML file with everything inlined
const htmlTemplate = fs.readFileSync('client/index.html', 'utf8');
const bundledJS = fs.readFileSync('temp_build.js', 'utf8');

// Process CSS - updated for your project structure
let combinedCSS = '';
const cssPath = 'client/styles.css';
if (fs.existsSync(cssPath)) {
    combinedCSS = fs.readFileSync(cssPath, 'utf8');
    console.log('✓ Loaded styles.css');
} else {
    console.log('⚠️  styles.css not found, skipping CSS injection');
}

// Create final HTML
let finalHTML = htmlTemplate;

// Remove existing script tags and import maps, but preserve socket.io
finalHTML = finalHTML.replace(/<script[^>]*type=["']?importmap["']?[^>]*>[\s\S]*?<\/script>/gi, '');
finalHTML = finalHTML.replace(/<script[^>]*type=["']?module["']?[^>]*>[\s\S]*?<\/script>/gi, '');
// Remove all script tags except socket.io
finalHTML = finalHTML.replace(/<script(?![^>]*socket\.io)[^>]*src=[^>]*><\/script>/gi, '');
finalHTML = finalHTML.replace(/<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi, '');

// Inject CSS
finalHTML = finalHTML.replace('</head>', `    <style>${combinedCSS}</style>\n</head>`);

// Inject bundled JS with proper escaping
const gameInitCode = `
// Make game available globally
window.game = GameBundle.game;

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 The Bee\\'s Knees initializing...');
    
    if (typeof window.game !== 'undefined' && window.game.init) {
        await window.game.init();
        console.log('✅ Game initialized');
    } else {
        console.error('❌ Game module not found', GameBundle);
    }
});
`;

// Properly inject the bundled JavaScript before closing body tag
const closingBodyTag = '</body>';
const lastBodyIndex = finalHTML.lastIndexOf(closingBodyTag);
if (lastBodyIndex !== -1) {
    finalHTML = finalHTML.substring(0, lastBodyIndex) + 
        `    <script>\n${bundledJS}\n${gameInitCode}\n    </script>\n` + 
        finalHTML.substring(lastBodyIndex);
} else {
    // Fallback if no closing body tag found
    finalHTML += `\n<script>\n${bundledJS}\n${gameInitCode}\n</script>\n</body>\n</html>`;
}

// Ensure output directory exists
if (!fs.existsSync('live_server')) {
    fs.mkdirSync('live_server', { recursive: true });
}

// Write final HTML
fs.writeFileSync('live_server/index.html', finalHTML);

// Clean up temporary files
if (fs.existsSync('temp_build.js')) {
    fs.unlinkSync('temp_build.js');
}
if (fs.existsSync('temp_build.js.map')) {
    fs.unlinkSync('temp_build.js.map');
}

// Remove dist folder if it exists and is empty
if (fs.existsSync('dist')) {
    try {
        fs.rmdirSync('dist');
    } catch (e) {
        // Folder not empty or other error, ignore
    }
}

const finalSize = (fs.statSync('live_server/index.html').size / 1024).toFixed(2);

console.log('🎉 SUCCESS!');
console.log(`   📁 Output: live_server/index.html`);
console.log(`   📊 Size: ${finalSize}KB`);
console.log(`   🎯 Professional bundling with esbuild + Three.js npm package`);
console.log(`   🧹 Cleaned up intermediate files`);