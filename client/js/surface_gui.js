console.log("surface_gui.js loaded")
import { game } from './game.js';
import * as THREE from './three/build/three.module.js';



function PIXEL_RATIO() {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
};

function createHiDPICanvas(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}



//-----------------------------------------------------------------------------------------------------

function surface_gui(guiname, xsize, ysize) {

    this.canvas = createHiDPICanvas(1000, 1000, 2);
    this.ctx = this.canvas.getContext("2d")
    this.texture = new THREE.Texture(this.canvas);
    this.material = [];
    this.material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    this.material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    this.material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    this.material.push(new THREE.MeshBasicMaterial({ color: 'black' }));
    this.material.push(new THREE.MeshBasicMaterial({ map: this.texture }));
    this.material.push(new THREE.MeshBasicMaterial({ color: 'black' }));

    this.geometry = new THREE.BoxGeometry(xsize, ysize, 1);
    //this.bufferGeometry = new THREE.BufferGeometry().fromGeometry(this.geometry);
    this.surfacegui = new THREE.Mesh(this.geometry, new THREE.MeshFaceMaterial(this.material));
    this.surfacegui.name = guiname;
    this.canvas.width = xsize * 4;
    this.canvas.height = ysize * 4;

    //set background color and border
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    //  this.ctx.fillStyle = 'black';
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    this.surface = this.surfacegui;
    //return this.surfacegui;

}



surface_gui.prototype.addtoscene = function () {

    game.scene.add(this.surfacegui);

}


surface_gui.prototype.set_position = function (x, y, z) {

    this.surfacegui.position.set(x, y, z);
    game.renderscene();


}



surface_gui.prototype.set_text = function (text, x, y) {
    var ctx = this.ctx
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = 'center';
    ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    this.texture.needsUpdate = true;
    game.renderscene()



}


surface_gui.prototype.basicinit = function () {

    this.set_position(0, 10, 0);
    this.set_text('hello', 100, 50);
    this.addtoscene();
    this.clickfunction();

    game.renderscene();



}


//-----------------------------------------------------------------------------------------

surface_gui.prototype.removefromscene = function () {


    for(i=0;i<6;i++){
    this.material[i].dispose();
    }
    this.geometry.dispose();
    this.texture.dispose()
    
    this.surfacegui.remove();
    game.renderscene();
    console.log('surface gui remove function')


}

//-------------------------------------------------------------------------------------------------

surface_gui.prototype.getgui = function () { return this.surfacegui; }




//-------------------------------------------------------------------------------------------------
surface_gui.prototype.clickfunction = function (fun) {

    var gui = this.surfacegui

    this.surfacegui.on('click', function(ev) {    
        console.log(gui.name+' was clicked');
        gui.visible = false;
        if(fun){fun()}
        setTimeout(function(){gui.visible=true;},500)
     });

}



//-----------------------------------------------------------------------------------------------------


surface_gui.prototype.coincap_text = function(name, symbol, movevalue, percentmove, lastprice){

    var canvas = this.canvas;
    var ctx = this.ctx;
    var txt = this.texture;

  
        
        //set background color and border
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeRect(0, 0, canvas.width, canvas.height);



        //make coin name
        var ypos = 100;
        var spacer = 60;


        function makeboldtext(text) {
            ctx.fillStyle = "blue";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, ypos);
            ypos = ypos + spacer;

        }


        function makesmalltext(text) {
            ctx.fillStyle = "blue";
            ctx.font = "18pt Arial";
            ctx.textAlign = 'center';
            ctx.fillText(text, canvas.width / 2, ypos - 30);
            ypos = ypos + spacer;



        }



        makeboldtext(name)
        makesmalltext('(' + symbol + ')')

        makeboldtext('▲ ' + movevalue)
        makeboldtext('[' + percentmove + ']');
        makeboldtext(lastprice)
        txt.needsUpdate = true;

   

    



}






export {surface_gui,createHiDPICanvas};


