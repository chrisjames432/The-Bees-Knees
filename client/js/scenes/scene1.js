


import { game } from '../game.js';
import * as THREE from '../three/build/three.module.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { makecoins, makecoin } from '../world_objects/make_coins.js';
import { stars, updatestars,set_current_coin } from '../world_objects/stars_spline.js';


var scene1 = function (scene2) {
  console.log('------ LOADING SCENE 1 --------')


    game.scene_transition(function () {
     // game.scene.add(game.currentscene);
     // game.load_dynamic();
      //game.init_controlls();
      game.init_lights();
      makelogin()
     game.scene.background = new THREE.Color('black');;
     game.camera.position.set(-5, 40, 20);
  
      var login = $('#login');
      login.show()

      stars()
      game.animations.stars = updatestars


      var coins = makecoins();

      setInterval(function(){

        const random = Math.floor(Math.random() * coins.length);
        set_current_coin(coins[random])
        console.log(coins[random])
      },10000)
      

      $('#loading_div').delay(0).fadeOut(400)
      game.renderscene();
  
    });
  }
  








function makelogin(){



  var div = $("<div/>");
  div.addClass("logindiv");
 
  div.css('position', 'fixed')
  div.css('top','0px');
  div.css('bottom','0px');
  div.css('width','100%')
  div.css('overflow', 'auto')
  div.css('z-index','7');
  div.css('background-color','rgba(0, 0, 0, 0.1)')


  div.appendTo($('body'));
 
  $.get( "./client/html/login.html", function( data ) {
    div.html( data );
    console.log( "Load was performed." );

    var tronlink = $('#tronlink');
    var currenthtml = tronlink.html();
    tronlink.click(function(){

      tronlink.html('LOGINING IN WITH TRON')
      setTimeout(() => {
        
        tronlink.html(currenthtml)
      }, 2000);


    })





  });












}
















export{scene1};




/*
    var gui = new surface_gui("menu1", 60, 20);
    gui.surfacegui.scale.set(0.2, 0.2, 0.2)
    gui.addtoscene();
    gui.set_text('COINMO', 10, 10);
    gui.clickfunction(game.create_scene2);
    game.scene.add(game.camera);
    game.camera.add(gui.getgui());
    gui.set_position(0, 0, -50)
    var gui2 = new surface_gui("menu2", 60, 20);
    gui2.surfacegui.scale.set(0.2, 0.2, 0.2)
    gui2.addtoscene();
    gui2.set_text('COIN CAP', 10, 10);
    gui2.clickfunction(game.create_scene3);
    gui2.surface.parent = gui.surface

    game.camera.add(gui2.getgui());
    gui2.set_position(0, 30, 0)



// game.camera.position.set(0, 50, 250);
// game.camera.lookAt(gui.surface.position)




  
var loader = new GLTFLoader();
  
loader.load('./client/js/fbx/login.glb', function (gltf) {

  var model = gltf.scene;
  var kids = gltf.scene.children;
  var tron = kids[1]
  
  var e = 3;

  model.scale.set(e, e, e)

    /*       
 var newpos = new THREE.Vector3 (0,0,0);
 newpos.copy(model.position);
 //var pos = model.position.copy();
 console.log(newpos)
  game.controls.target= newpos;




  game.camera.add(gltf.scene);
  model.position.set(0, 0, -50)
  tron.on('click', function (ev) {
    
    scene2();
    tron.visible = false;
  
    
  })



})

*/
