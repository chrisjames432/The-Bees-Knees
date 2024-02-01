
//character creation class
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import * as THREE from '../three/build/three.module.js';
import { AnimationMixer } from '../three/src/animation/AnimationMixer.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js';
import { game } from '../game.js';


export function make_character() {

	this.mixer;
	this.actions;
	this.activeAction;
	this.previousAction;
	this.model;
	this.moveplayer = 0;
	this.turn = 0;
	this.api = { state: 'idle' };
	this.scale = 1
	this.playername = ""
	this.lookloc = { x: 0, y: 1, z: 0 };



}



make_character.prototype.init = function () {


	var loader = new GLTFLoader();
	var main = this;
	loader.load('./client/js/fbx/player.gltf', function (gltf) {

		main.model = gltf.scene;
		main.model.name = 'player1'
		var animations = gltf.animations;
		main.model.position.set(0, 0, 0)
		gltf.scene.scale.set(main.scale, main.scale, main.scale)
		game.scene.add(gltf.scene);

		game.currentObject = main.model

		/*
		gltf.scene.traverse(function (child) {
			if (child.isMesh) {
				//console.log(child)
				//		child.material.flatShading = false;
				child.material.color.set('red');
				//child.material.emissive = child.material.color;
				//child.material.emissiveMap = child.material.map;
				child.castShadow = true;
				child.receiveShadow = true;

			}
		})
*/



		var states = ['idle', 'walk', 'walkback', 'looking1', 'looking2', 'thankful', 'Thoughtful Head Shake', 'chearing'];

		main.mixer = new AnimationMixer(main.model);

		main.actions = {};

		for (var i = 0; i < animations.length; i++) {

			var clip = animations[i];
			var action = main.mixer.clipAction(clip);
			main.actions[clip.name] = action;


		}

		main.activeAction = main.actions['looking1'];
		main.activeAction.play();


	}, undefined, function (e) {

		console.error(e);

	});



}


//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------


make_character.prototype.setaction = function (newaction) {


	if (newaction != this.activeAction._clip.name) {


		this.fadeToAction(newaction, 0.5)


	}


}


//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------

make_character.prototype.updateloc = function (dt) {


	//-----player movements  ----------------------------------------------------------------
	if (this.model) {
		if (this.moveplayer > 0) this.model.translateZ(dt * (1.8 * this.scale));
		if (this.moveplayer < 0) this.model.translateZ(dt * (-1.8 * this.scale));
		this.model.rotation.y += (this.turn * dt) * 3;
	}


}


//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------


make_character.prototype.add_controls = function () {

	var main = this

	document.addEventListener("keydown", function (evt) {
		if (true) {
		//	console.log(evt.key)
			if (evt.key === 'd') { main.turn = -1; }	//d
			else if (evt.key === 's') { main.setaction('walkback'); main.moveplayer = -1; }
			else if (evt.key === 'a') { main.turn = 1 } //a
			else if (evt.key === 'w') { main.setaction('walk'); main.moveplayer = 1 }  //w

		}
	});

	//---------------------------------------------------------------------------------------------
	document.addEventListener("keyup", function (evt) {
		if (true) {

			if (evt.key === 'd') { main.turn = 0 }  //d 
			else if (evt.key === 's') { main.setaction('idle'); main.moveplayer = 0; }  //s
			else if (evt.key === 'a') { main.turn = 0 }//a
			else if (evt.key === 'w') { main.setaction('idle'); main.moveplayer = 0; } //w

		}
	});

}


//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------


make_character.prototype.fadeToAction = function (name, duration) {

	this.previousAction = this.activeAction;
	this.activeAction = this.actions[name];

	if (this.previousAction !== this.activeAction) {

		this.previousAction.fadeOut(duration);

	}

	this.activeAction
		.reset()
		.setEffectiveTimeScale(1)
		.setEffectiveWeight(1)
		.fadeIn(duration)
		.play();

}

//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------



make_character.prototype.run = function () {

	this.add_controls();
	var main = this
	var dt = game.dt;
	game.animations['player'] = function () {

		if (main.mixer) {

			main.mixer.update(dt);
			main.updateloc(dt)
			main.set_camera();

		}

	}


}



//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------



make_character.prototype.set_camera = function () {


	var relativeCameraOffset = new THREE.Vector3(0, 2, -3);
	var camera = game.camera;
	var cameraOffset = relativeCameraOffset.applyMatrix4(this.model.matrixWorld);
	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;
	var pos = this.model.position.clone().add(new THREE.Vector3(this.lookloc.x, this.lookloc.y, this.lookloc.z))
	camera.lookAt(pos);


};







//---------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------


