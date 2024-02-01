
console.log("make_coins.js loaded")

import { game } from '../game.js';
import * as THREE from '../three/build/three.module.js';
import { stars, updatestars } from './stars_spline.js';

var rnum = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }








var coinsymbols = ["btc", "eth",  "ltc",  "trx", "doge",];
 

 export function makecoins() {

    var data = coinsymbols
    var count = 0;
    var row = -500;
    var space = 300;
    
    for (var i = 0; i < coinsymbols.length; i++) {
        
        var xpos = count*100;
        var space = 50;       
        var x = rnum(-500,500);
        var z = rnum(-500,500);
        var coin1 = makecoin('./client/images/coinpics/' + data[i] + '.png', x  ,10,z, 10);
        //var coin1 = makecoin('./client/images/coinpics/' + data[i] + '.png',0+(i*space) ,10,0, 10);
        coin1.coin.name = data[i];

        
        if (count >= 5) {

            console.log('5----')
            row = row - space;
            count = 0
        
        }

        count++;


    };
    return coinsymbols


}




var ar = [0.001, 0.002, 0.003, 0.004, 0.005, 0.006, 0.007, 0.008, -0.008, -0.005, -0.006, -0.009, -0.002];
//===================================================================================================================================
export function makecoin(s, x, y, z, size) {

    var thecoin;


    var text1 = new THREE.TextureLoader().load(s);
    text1.wrapS = THREE.RepeatWrapping;
    text1.flipY = false;


    var materialTop = new THREE.MeshBasicMaterial({ color: 'black', side: THREE.DoubleSide });
    var materialSide = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(s) });
    var materialBottom = new THREE.MeshBasicMaterial({ map: text1 });
    var materialsArray = [];
    materialsArray.push(materialTop); //materialindex = 0
    materialsArray.push(materialSide); // materialindex = 1
    materialsArray.push(materialBottom); // materialindex = 2
    var material = new THREE.MeshFaceMaterial(materialsArray);
    var geometry = new THREE.CylinderGeometry(size, size, 2, 40, 1, false);
    var aFaces = geometry.faces.length;
    for (var i = 0; i < aFaces; i++) {
        geometry.faces[i].materialindex;
    }
    thecoin = new THREE.Mesh(geometry, material);
    //cone.rotation.x = ( Math.PI / 2);
    thecoin.rotation.y = (Math.PI / 2);
    thecoin.rotation.z = (Math.PI / 2);
    thecoin.position.set(x, y, z);
    thecoin.name = "coinname";

    var rspeed = ar[Math.floor(Math.random() * ar.length)];
    var rspeed2 = ar[Math.floor(Math.random() * ar.length)];


    
    game.scene.add(thecoin);
   
   
    /*
    thecoin.on('mouseover', function(ev) {    
           console.log(thecoin.name+' was clicked');
           thecoin.visible = false;
           setTimeout(function(){thecoin.visible=true;},500)
        });
*/



    var out = {};
    out.coin = thecoin;
    out.rotate = function () {

       // thecoin.rotation.x = thecoin.rotation.x + rspeed;
        thecoin.rotation.y = thecoin.rotation.y + rspeed2;

    };

  
    






    return out;

}

//===================================================================================================================================


