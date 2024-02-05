
import * as THREE from './three/build/three.module.js';

import { game } from './game.js';



export function make_text(size, tval, xpos, ypos, zpos, ry) {

    var loader = new THREE.FontLoader();
    loader.load('./client/js/fonts/helvetiker_regular.typeface.json', function (font) {

        var xMid, text;
        var textShape = new THREE.BufferGeometry();
        var color = 'black';
        var matLite = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        var message = tval;
        var shapes = font.generateShapes(message, size, 1);
        var geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();
        //console.log(geometry.boundingBox);
        xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        geometry.translate(xMid, 0, 0);
        // make shape ( N.B. edge view not visible )
        textShape.fromGeometry(geometry);
        text = new THREE.Mesh(textShape, matLite);
        text.position.x = xpos;
        text.position.y = ypos;
        text.position.z = zpos;
        text.rotation.x = ry;


        text.on('click', function(ev) {    
            console.log('text was clicked');
            text.visible = false;
            setTimeout(function(){text.visible=true;},500)
         });

        game.scene.add(text);

    });




}








//-----------------------------------------------------------------------
