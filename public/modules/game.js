/**@type {HTMLCanvasElement}*/
let gameLeftCanvas = document.getElementById("gameLCanvas");
let gameLeftCanvasContext = gameLCanvas.getContext("2d");

/**@type {HTMLCanvasElement}*/
let gameRightCanvas = document.getElementById("gameRCanvas");
let gameRightCanvasContext = gameRCanvas.getContext("2d");

let getSelectedFoW = document.querySelector('input[name="showFow"]:checked');

class Border{
	/**
	 * @param {Vector} a - start of border
	 * @param {Vector} b - end of border
	 * @param {number} w - width of border
	 * @param {string} c - color of border
	 * @param {boolean} canSee - whether border has been seen by user
	 */
	constructor(a, b, w, c, canSee){
		this.start = a;
		this.end = b;
		this.width = w;
		this.c = c;
		this.seen = canSee;
	}

	/**
	 * returns array of x and y of intersection between this border and line between aStart and aEnd
	 * @param {Vector} aStart - start of line
	 * @param {Vector} aEnd - end of line
	 * @returns {Array<number>}
	 */
	intersects(aStart, aEnd){
		const x1 = this.start.x;
		const y1 = this.start.y;
		const x2 = this.end.x;
		const y2 = this.end.y;

		const x3 = aStart.x;
		const y3 = aStart.y;
		const x4 = aEnd.x;
		const y4 = aEnd.y;
		
		const num1 = (x1 - x3)*(y3 - y4) - (y1 - y3)*(x3 - x4);
		const den1 = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
		const t = num1/den1;
		
		const num2 = (x1 - x3)*(y1 - y2) - (y1 - y3)*(x1 - x2);
		const den2 = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
		const u = num2/den2;
		if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
			let x = (x1 + t*(x2-x1));
			let y = (y1 + t*(y2-y1));
			return [x,y];
		}else{
			return [];
		}
	}

	/**
	 * draws border based on if seen and user settings
	 * @param {*} ctx - canvas context border is displayed on
	 */
	draw(ctx){
		if(this.seen == true || getSelectedFoW.value == "fowFull"){
			drawLin(ctx, this.start.x, this.start.y, this.end.x, this.end.y, this.c, this.width);
			drawCirc(ctx, this.start.x, this.start.y, 3, "black");
			drawCirc(ctx, this.end.x, this.end.y, 3, "black");
		}
	}
}

class User{
	/**
	 * @param {number} x - x position
	 * @param {number} y - y position
	 * @param {number} numR - number of rays
	 */
	constructor(x, y, numR){
		/**@type {number}*/
		this.x = x;
		/**@type {number}*/
		this.y = y;
		/**@type {Vector}*/
		this.facing = new Vector(1, 0);
		this.speed = 25;
		this.size = 10;
		this.rayNum = numR;
		this.rays = [];
		this.makeRays(numR);
		/**
		 * array of vectors from user to Objects
		 * @type {Array<Vector>} */
		this.lookVs = [];
		/**
		 * array of colors for borders to draw
		 * @type {Array<Array>} */
		this.ObjectColors = [];
		this.fovCone;
	}

	/**
	 * turns user by angle
	 * @param {number} angle - angle to turn the user
	 */
	turn(angle){
		this.facing.rotateBy(angle);
	}

	/**
	 * draws the rays and user
	 * @param {*} ctx - canvas context to draw user onto
	 */
	draw(ctx){
		let dirLen = 50;
		// this.drawRays();
		this.drawLooks(ctx);
		drawLin(ctx, this.x, this.y, this.x + this.facing.x*dirLen, this.y + this.facing.y*dirLen, "red", 5);
		drawCirc(ctx, this.x, this.y, this.size, "black");
	}

	/**
	 * moves user by its speed in the direction its facing
	 */
	move(){
		this.x = this.x + this.facing.x * this.speed;
		this.y = this.y + this.facing.y * this.speed;
	}

	/**
	 * returns border Object in direction of angle and rayLen long
	 * @param {number} angle - angle to make ray from
	 * @param {number} rayLen - length of new ray
	 * @returns {Border}
	 */
	makeRay(angle, rayLen){
		let facV = this.facing.copy();
		facV.rotateBy(angle);
		let p1 = new Vector(this.x + facV.x*this.size, this.y + facV.y*this.size);
		let p2 = new Vector(this.x + facV.x*rayLen, this.y + facV.y*rayLen);
		return new Border(p1, p2, 3, "yellow", true);
	}

	/**
	 * makes numR rays emanating from user
	 * @param {number} [numR] - number of rays to make
	 */
	makeRays(numR = this.rayNum){
		this.rayNum = numR;
		this.rays = new Array(numR);
		const fovPerc = fovSlider.value/10;
		this.fovCone = (Math.PI)*fovPerc;
		const angleIncrement = this.fovCone/((this.rays.length-1));
		const halfRays = Math.floor(numR/2);
		for(let i = 0; i < halfRays; i++){
			let tAngle = angleIncrement*i;
			this.rays[i] = this.makeRay(tAngle, 1000);
			this.rays[halfRays+i] = this.makeRay(-tAngle, 1000);
		}
	}

	/**
	 * draws each ray
	 */
	drawRays(){
		for(let i = 0; i < this.rays.length; i++){
			this.rays[i].draw();
		}
	}

	/**
	 * draws rays that hit something
	 */
	drawLooks(ctx){
		for(let i = 0; i < this.lookVs.length; i++){
			let tempV = this.lookVs[i];
			if(getSelectedFoW.value == "fowBP"){
				drawCirc(ctx, this.x + tempV.x, this.y + tempV.y, 1, "black");
			}else{
				drawLin(ctx, this.x, this.y, this.x + tempV.x, this.y + tempV.y, "yellow", 1);
			}
		}
	}
}

let fovSlider = document.getElementById("fov");

/**
 * Object for whole game tab
 */
//consider removing "game" moniker of everything now that its inside game Object
class Game{
	/**
	 * 2d/3d game Object
	 * @param {HTMLCanvasElement} canvL - left canvas
	 * @param {*} ctL - left canvas context
	 * @param {HTMLCanvasElement} canvR - right canvas
	 * @param {*} ctR - right canvas context
	 */
	constructor(canvL, ctL, canvR, ctR){
		/**@type {User}*/
		this.user = null;
		/**@type {Array<Border>}*/
		this.bords = null;
		/**@type {Fleet}*/
		this.fleet = null;
		this.mainLoop = null;
		
		this.ctxL = ctL;
		this.canvasL = canvL;
		this.canvasLWidth = canvL.width;
		this.canvasLHeight = canvL.height;
		
		this.ctxR = ctR;
		this.canvasR = canvR;
		this.canvasRWidth = canvR.width;
		this.canvasRHeight = canvR.height;

		this.map = {};
	}

	/**
	 * initializes variables for game tab
	 */
	initGame(){
		document.addEventListener('keydown', this.keyPressEvent.bind(this));
		document.addEventListener('keyup', this.keyPressEvent.bind(this));
		this.user = new User(this.canvasLWidth/2, this.canvasLHeight/2, 150);
		this.bords = [];
		this.makeBorders();
		this.fleet = new Fleet(30, 3, this.canvasLWidth, this.canvasLHeight, this.ctxL, this.canvasL, 5);
		this.mainLoop = setInterval(this.updateGame.bind(this), 50);//idk?
	}

	/**
	 * checks intersections between rays and all Objects on screen
	 */
	checkIntersections(){
		this.user.lookVs = [];
		this.user.ObjectColors = [];
		for(let i = 0; i < this.bords.length; i++){
			this.bords[i].seen = !getSelectedFoW.value == "fowSB";
		}
		//for every ray
		for(let i = 0; i < this.user.rays.length; i++){
			let tempRay = this.user.rays[i];
			let intersectingPoints = [];
			// let intersectingObjects = [];
			//for every wall
			// for(let j = 0; j < this.bords.length; j++){//include worm segments in this for loop
			// 	let cords = this.bords[j].intersects(tempRay.start, tempRay.end);
			// 	if(cords.length > 0){
			// 		intersectingPoints.push([cords, j]);
			// 		intersectingObjects.push([cords, this.bords[j]]);//tracks where thing was hit, and what it is
			// 	}
			// }
			//for every worm
			for(let j = 0; j < this.fleet.storage.elements.length; j++){
				let tempApp = this.fleet.storage.elements[j];
				//for every worm segment
				for(let k = 0; k < tempApp.segments.length; k++){
					let tempSeg = tempApp.segments[k];
					let cords = tempRay.intersects(tempSeg.pos1, tempSeg.pos2);
					if(cords.length > 0){
						intersectingPoints.push([cords, j, k, tempApp.color]);
						// intersectingObjects.push([cords, k, tempApp]);
					}
				}
			}
			let closestIndex = 0;
			let closestDist = 10000;
			let bordIndex = 0;
			let seenApp = false;//if closest thing is an app
			for(let j = 0; j < intersectingPoints.length; j++){
				//if one of the segments in an appendage is seen, draw the whole
				//worm, but not muliple times
				let tempCords = intersectingPoints[j][0];
				let tempV = new Vector(this.x - tempCords[0], this.y - tempCords[1]);
				if(tempV.length < closestDist){
					closestIndex = j;
					closestDist = tempV.length;
					if(intersectingPoints[j].length != 4){//not appendage
						bordIndex = intersectingPoints[j][1];
						seenApp = false;
					}else{
						seenApp = true;
					}
				}
			}
			if(intersectingPoints.length > 0){
				let tempCords = intersectingPoints[closestIndex][0];
				let newV = new Vector(tempCords[0] - this.user.x, tempCords[1] - this.user.y);
				if(seenApp == false && this.bords.length > 0){
					this.bords[bordIndex].seen = true;
				}
				this.user.lookVs.push(newV);
				this.user.ObjectColors.push(intersectingPoints[closestIndex][3]);
			}

			// for(let j = 0; j < intersectingObjects.length; j++){
			// 	//if one of the segments in an appendage is seen, draw the whole
			// 	//worm, but not muliple times
			// 	let tempCords = intersectingObjects[j][0];
			// 	let tempV = new Vector(this.gameUser.x - tempCords[0], this.gameUser.y - tempCords[1]);
			// 	if(tempV.length < closestDist){
			// 		closestIndex = j;
			// 		closestDist = tempV.length;
			// 		if(intersectingObjects[j].length == 2){//wall
			// 			let tempWall = intersectingObjects[j][1];
			// 		}else{//worm segment
			// 			let tempApp = intersectingObjects[j][2];
			// 		}
			// 	}
			// }

		}
		
	}

	/**
	 * updates game tab
	 */
	updateGame(){
		clearGraph(this.ctxL, this.canvasL);
		clearGraph(this.ctxR, this.canvasR);
		this.fleet.update(false);
		if(getSelectedFoW.value == "fowFull" || getSelectedFoW.value == "fowSB"){
			this.drawBorders();
		}
		this.updateFow();
		this.checkIntersections();
		this.user.draw(this.ctxL);
		this.drawRenderRects();
	}

	/**
	 * hides variables in game tab
	 */
	hideGame(){
		clearInterval(this.mainLoop);
		this.mainLoop = null;
		this.user = null;
		this.bords = null;
		this.fleet = null;
	}

	/**
	 * draws rectangles on right game canvas corresponding to Object hit on left game screen
	 */	
	drawRenderRects(){
		for(let i = 0; i < this.user.lookVs.length; i++){
			let curLookV = this.user.lookVs[i];
			let angleBetween = Math.atan2(curLookV.y*this.user.facing.x - curLookV.x*this.user.facing.y, this.user.facing.x * curLookV.x + this.user.facing.y * curLookV.y);
			//angleBetween from -fov -> fov
			let angleRange = this.user.fovCone/2; // max +- angleBetween can be
			let numRange = ((angleBetween/angleRange) + 1)/2.;
			let x = numRange*this.canvasRWidth;
			let w = this.canvasRWidth/this.user.rayNum;
			let h = Math.min(30*this.canvasRHeight/curLookV.length, this.canvasRHeight);
			let hDif = this.canvasRHeight - h;
	
			let rectColor = this.user.ObjectColors[i];
			let tempC = rgbToHSV(rectColor);
			let brightPercent = h/this.canvasRHeight;
			let brightOffset = 1-brightPercent;
			brightPercent = brightPercent + brightOffset/2;
	
			tempC = [tempC[0], tempC[1], tempC[2]*brightPercent];
			let finalC = hsvToRGB(tempC);
			let colorString = "rgb(" + finalC[0] + ", " + finalC[1] + ", " + finalC[2] + ")";
			drawFRect(this.ctxR, x, hDif/2, w, h, colorString);
		}
	}

	/**
	 * creates 
	 */
	makeBorders(){
		for(let i = 0; i < this.bords.length; i++){
			let start = new Vector(Math.random()*this.canvasLWidth, Math.random()*this.canvasLHeight);
			let end = new Vector(Math.random()*this.canvasLWidth, Math.random()*this.canvasLHeight);
			this.bords[i] = new Border(start, end, 5, "black", getSelectedFoW.value == "fowSB");
		}
	}

	/**
	 * display borders
	 */
	drawBorders(){
		for(let i = 0; i < this.bords.length; i++){
			this.bords[i].draw();
		}
	}

	/**
	 * updates field of view of user to current slider value
	 */
	updateFow(){
		getSelectedFoW = document.querySelector('input[name="showFow"]:checked');
	}

	/**
	 * takes in key press inputs to allow multiple simultaneous accurate keypresses
	 * @param {Event} e - keypress event
	 */
	keyPressEvent(e){
		let turnFactor = .2;
		if(e.type == "keydown"){
			this.map[e.key] = true;
		}else{
			this.map[e.key] = false;
		}
		
		if(this.map["a"] || this.map["ArrowLeft"]){//left
			this.user.turn(-turnFactor);
			this.user.makeRays();
		}
		if(this.map["d"] || this.map["ArrowRight"]){//right
			this.user.turn(turnFactor);
			this.user.makeRays();
		}
		if(this.map["w"] || this.map["ArrowUp"]){//up
			this.user.move();
			this.user.makeRays();
		}
		if(this.map[" "]){//space
	
		}
	}
}


/**
 * returns array of corresponding hsv values for given rgb color
 * @param {Array<number>} rgb - array of color component number of rgb color
 * @returns {Array<number>}
 */
function rgbToHSV(rgb){
	let r = rgb[0];
	let g = rgb[1];
	let b = rgb[2];

	let rP = r/255;
	let gP = g/255;
	let bP = b/255;
	let cMax = Math.max(rP, gP, bP);
	let cMin = Math.min(rP, gP, bP);
	let delta = cMax - cMin;
	let h;
	if(delta == 0){
		h = 0;
	}else if(cMax == rP){
		h = 60 * (((gP-bP)/delta)%6);
	}else if(cMax == gP){
		h = 60 * (((bP-rP)/delta)+2);
	}else if(cMax == bP){
		h = 60 * (((rP-gP)/delta)+4);
	}
	let s;
	if(cMax == 0){
		s = 0;
	}else{
		s = delta/cMax;
	}
	let v = cMax;
	return [h, s, v];
}

/**
 * returns array of corresponding rgb values for given hsv color
 * @param {Array<number>} hsv - array of color component number of hsv color
 * @returns {Array<number>}
 */
function hsvToRGB(hsv){
	let h = hsv[0];
	let s = hsv[1];
	let v = hsv[2];

	let c = v*s;
	let x = c * (1 - Math.abs(((h/60)%2)-1));
	let m = v - c;

	let rP;
	let gP;
	let bP;
	if(0 <= h && h < 60){
		rP = c;
		gP = x;
		bP = 0;
	}else if(60 <= h && h < 120){
		rP = x;
		gP = c;
		bP = 0;
	}else if(120 <= h && h < 180){
		rP = 0;
		gP = c;
		bP = x;
	}else if(180 <= h && h < 240){
		rP = 0;
		gP = x;
		bP = c;
	}else if(240 <= h && h < 300){
		rP = x;
		gP = 0;
		bP = c;
	}else if(300 <= h && h < 360){
		rP = c;
		gP = 0;
		bP = x;
	}
	let r = (rP + m)*255;
	let g = (gP + m)*255;
	let b = (bP + m)*255;
	return [r, g, b];
}

