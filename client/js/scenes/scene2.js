


import { game } from '../game.js';
import * as THREE from '../three/build/three.module.js';
import { makecoins, makecoin } from '../world_objects/make_coins.js';


var scene2 = function () {



    game.scene_transition(function () {
     
      //game.init_controlls();
      game.init_lights();
      game.camera.position.set(-20, 73, 50);
  
  
    
   
      makecoins();
   
      game.renderscene();
  
    });
  }
  

export{scene2};




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

*/


// game.camera.position.set(0, 50, 250);
// game.camera.lookAt(gui.surface.position)




