
import { game } from '../game.js';
import * as THREE from '../three/build/three.module.js';
import { surface_gui } from './surface_gui.js';
import { makecoin } from './make_coins.js';














export function make_coincap_model(coin) {


  var coincapgroup = new THREE.Group();
  var sc =20.0;
  coincapgroup.scale.set(sc, sc, sc);
  coincapgroup.name = 'capbtc';

  //floor
  var geometry = new THREE.BoxGeometry(100, 1, 300);
  var material = new THREE.MeshBasicMaterial({ color: 'tan' });
  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0)
  cube.name = 'floor'
  coincapgroup.add(cube);


  var screenx = 70;
  var screeny = 90;
  var gui = new surface_gui("screen", 80, 100);
  gui.coincap_text()


  //gui.surface.parent=cube;
  gui.set_position(0, screeny / 2, -150)
  coincapgroup.add(gui.getgui());
  gui.coincap_text(coin.name, '# ' + coin.market_cap_rank + ' ' + coin.symbol, coin.price_change_percentage_24h + '%', coin.price_change_24h, coin.current_price);
  console.log(coin)

  //gui.addtoscene();

  var key = 'btc';
  var thecoin = makecoin('./client/images/coinpicsl/' + coin.symbol + '.png', 0, 0, -150);

  thecoin.coin.name = coin.symbol
  thecoin.coin.position.set(0, screeny + 23, -150)
  coincapgroup.add(thecoin.coin);



  var obj = coincapgroup
  obj.on('click', function(ev) {    
    console.log(obj.name+' was clicked');
    console.dir(game.camera.position );
    console.dir(obj.position);
 });
 
  game.scene.add(coincapgroup);

  return coincapgroup;

}




//========================================================================================================







export function makecoincap(coininfo) {




  function makecir(y) {

    var circleRadius = 2500;
    var centerX = 0;
    var centerZ = 0;
    var startAngle = 0;
    var mpi = Math.PI / 180;
    var startRadians = startAngle + mpi;
    var totalSpheres = Object.keys(coininfo).length;;
    var incrementAngle = 360 / totalSpheres;
    var incrementRadians = incrementAngle * mpi;
    var count = 0;
    for (var key in coininfo) {



     // if (key == 'btc' || key == 'ltc' || key == 'eth' || key == 'trx' || key == 'doge') { 

      var xp = centerX + Math.sin(startRadians) * circleRadius;
      var zp = centerZ + Math.cos(startRadians) * circleRadius;





      var o = make_coincap_model(coininfo[key]);
      o.name = 'coin' + count;
      //var sc = 1;
      //o.scale.set(sc, sc, sc);

      o.rotation.y = ((count * incrementAngle) + 181) * (Math.PI / 180.0);
      o.position.x = xp;
      o.position.z = zp;

      // gr.add(o);
      game.scene.add(o);
      game.renderscene();
      startRadians += incrementRadians;
      count++;
  //  }
  }


  game.renderscene();

}









new Promise(function (resolve, reject) {

  makecir(0);
  game.renderscene()

  resolve(1) // (*)
  console.log('cap done');
}).then(function (result) { // (**)


  game.renderscene()



});







   


 

    





    

}
