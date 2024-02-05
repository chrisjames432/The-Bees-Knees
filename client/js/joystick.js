
class JoyStick{
    
	constructor(options){
		const circle = document.createElement("div");
		circle.style.cssText = "position:absolute; bottom:45px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
		const thumb = document.createElement("div");
		thumb.style.cssText = "position: absolute; left: 18px; top: 18px; width: 40px; height: 40px; border-radius: 50%; background: #fff;";
		circle.appendChild(thumb);
		document.body.appendChild(circle);
		this.domElement = thumb;
		this.maxRadius = options.maxRadius || 30;
		this.maxRadiusSquared = this.maxRadius * this.maxRadius;
		this.onMove = options.onMove;
		this.game = options.game;
		this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
       
		
		if (this.domElement!=undefined){
			const joystick = this;
			if ('ontouchstart' in window){
				this.domElement.addEventListener('touchstart', function(evt){ joystick.tap(evt); });
			}else{
				this.domElement.addEventListener('mousedown', function(evt){ joystick.tap(evt); });
			}
		}
	}
	
	getMousePosition(evt){
		let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
		let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
		return { x:clientX, y:clientY };
	}
	
	tap(evt){
		evt = evt || window.event;
		// get the mouse cursor position at startup:
		this.offset = this.getMousePosition(evt);
		const joystick = this;
		if ('ontouchstart' in window){
			document.ontouchmove = function(evt){ joystick.move(evt); };
			document.ontouchend =  function(evt){ joystick.up(evt); };
		}else{
			document.onmousemove = function(evt){ joystick.move(evt); };
			document.onmouseup = function(evt){ joystick.up(evt); };
		}
	}
	
	move(evt) {


        let forward = 0;
        let turn = 0;
       // console.log('move event called')
        if (this.onMove != undefined) this.onMove.call(this.game, forward, turn);

    evt = evt || window.event;
    const mouse = this.getMousePosition(evt);

    // Calculate the new cursor position:
    let left = mouse.x - this.offset.x;
    let top = mouse.y - this.offset.y;

    // Constrain the movement within the max radius
    const sqMag = left * left + top * top;
    if (sqMag > this.maxRadiusSquared) {
        const magnitude = Math.sqrt(sqMag);
        left /= magnitude;
        top /= magnitude;
        left *= this.maxRadius;
        top *= this.maxRadius;
    }

    // Set the element's new position:
    this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
    this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;

    // Implement the dead zone and clamping
    const deadZone = 0.1; // Dead zone threshold, adjust as needed
    forward = -(top - this.origin.top + this.domElement.clientHeight/2) / this.maxRadius;
    turn = -(left - this.origin.left + this.domElement.clientWidth/2) / this.maxRadius;

    // Apply dead zone
    forward = Math.abs(forward) > deadZone ? forward : 0;
    turn = Math.abs(turn) > deadZone ? turn : 0;

    // Clamp the values
    forward = Math.min(Math.max(forward, -1), 1);
    turn = Math.min(Math.max(turn, -1), 1);

    // Send updated values

    // Send updated values
  
  //  console.log(this)
     if (this.onMove != undefined) this.onMove.call(this.game, forward, turn);
    }

	
	up(evt){
		if ('ontouchstart' in window){
			document.ontouchmove = null;
			document.touchend = null;
		}else{
			document.onmousemove = null;
			document.onmouseup = null;
		}
		this.domElement.style.top = `${this.origin.top}px`;
		this.domElement.style.left = `${this.origin.left}px`;
		
		this.onMove.call(this.game, 0, 0);
	}
}




export { JoyStick };