/**
 * updates all the worm constants with slider values
 */
function refreshSValues() {
	alConst = aSlider.value * alMult;
	sepConst = sSlider.value * sepMult;
	coConst = cSlider.value * coMult;
	accelConst = accSlider.value * accelMult;
	percConst = percSlider.value * percMult;

	aLabel.innerHTML = "Align : " + aSlider.value;
	sLabel.innerHTML = "Seperation : " + sSlider.value;
	cLabel.innerHTML = "Cohesion : " + cSlider.value;
	accLabel.innerHTML = "Acceleration : " + accSlider.value;
	pLabel.innerHTML = "Perception : " + percSlider.value;
}

/**
 * sets worm constants to random values
 */
function randomizeWormSpecs() {
	aSlider.value = Math.random() * (aSlider.max - aSlider.min) + aSlider.min;
	sSlider.value = Math.random() * (sSlider.max - sSlider.min) + sSlider.min;
	cSlider.value = Math.random() * (cSlider.max - cSlider.min) + cSlider.min;
	accSlider.value =
		Math.random() * (accSlider.max - accSlider.min) + accSlider.min;
	percSlider.value =
		Math.random() * (percSlider.max - percSlider.min) + percSlider.min;
}

/**
 * returns vector made from subtraction of initial from final
 * @param {Vector} final - final vector
 * @param {Vector} initial - initial vector
 * @returns {Vector}
 */
function subV(final, initial) {
	return new Vector(final.x - initial.x, final.y - initial.y);
}

/**
 * returns vector made from addition of final and initial
 * @param {Vector} i - initial vector
 * @param {Vector} f - final vector
 * @returns {Vector}
 */
function addV(i, f) {
	return new Vector(i.x + f.x, i.y + f.y);
}

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.length = this.mag();
	}

	/**
	 * rotates this vector to angle
	 * @param {number} angle - angle in radians to rotate by
	 */
	rotateTo(angle) {
		this.x = Math.cos(angle) * this.length;
		this.y = Math.sin(angle) * this.length;
	}
	
	/**
	 * rotates this vectory by angle
	 * @param {number} angle - angle in radians to rotate by
	 */
	rotateBy(angle) {
		let curAngle = Math.atan2(this.y, this.x);
		let newAngle = (curAngle + angle)%(2*Math.PI);
		this.x = Math.cos(newAngle) * this.length;
		this.y = Math.sin(newAngle) * this.length;
	}

	/**
	 * adds vector v to this vector
	 * @param {Vector} v - vector to be added
	 */
	add(v) {
		this.x = this.x + v.x;
		this.y = this.y + v.y;
		this.length = this.mag();
	}

	/**
	 * returns the length of this vector
	 * @returns {number}
	 */
	mag() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	/**
	 * sets length of this vector to len
	 * @param {number} len - length to set length to
	 */
	setMag(len) {
		this.x = (this.x * len) / this.length;
		this.y = (this.y * len) / this.length;
		if (this.length == 0) {
		}
		this.length = len;
	}

	/**
	 * multiplies length of this vector by len
	 * @param {number} len - length to multiply length by
	 */
	multMag(len) {
		this.x = this.x * len;
		this.y = this.y * len;
		this.length = this.length * len;
	}

	/**
	 * returns copy of this vector
	 * @returns {Vector}
	 */
	copy() {
		return new Vector(this.x, this.y);
	}

	/**
	 * returns normal of this vector
	 * @returns {Vector}
	 */
	normal() {
		return new Vector(this.x / this.length, this.y / this.length);
	}
}

class Segment {
	constructor() {}

	/**
	 * initializes segment with its start and end
	 * @param {Vector} pos1 - start of segment
	 * @param {Vector} pos2 - end of segment
	 * @param {number} width - width of segment
	 * @param {Object} ct - context of canvas
	 */
	init2Pos(pos1, pos2, width, ct) {
		this.ct = ct;
		this.pos1 = pos1;
		this.pos2 = pos2;
		this.dir = subV(pos2, pos1);

		this.length = this.dir.mag();
		this.width = width;
		this.angle = Math.atan2(this.dir.y, this.dir.x);
		return this;
	}
	
	/**
	 * initializes segment with its start and a vector to place end with reference to
	 * @param {Vector} pos1 - start of segment
	 * @param {Vector} dir - direction of segment
	 * @param {number} width - width of segment
	 */
	initDir(pos1, dir, width) {
		this.pos1 = pos1;
		this.dir = dir;
		this.pos2 = addV(pos1, dir);

		this.width = width;
		this.angle = Math.atan2(this.dir.y, this.dir.x);
		this.length = dir.mag();
		return this;
	}

	/**
	 * initializes segment with its start and length, and angle
	 * @param {Vector} pos1 - start of segment
	 * @param {number} length - length segment
	 * @param {number} angle - angle of segment
	 * @param {number} width - width of segment
	 */
	initAng(pos1, length, angle, width) {
		this.pos1 = pos1;
		this.dir = new Vector(
			Math.cos(angle) * length,
			Math.sin(angle) * length
		);
		this.pos2 = addV(pos1, this.dir);

		this.length = length;
		this.angle = angle;
		this.width = width;
		return this;
	}

	/**
	 * rotates segment about its first position to angle
	 * @param {number} angle - angle in radians to rotate
	 */
	rotate(angle) {
		this.dir.rotateTo(angle);
		this.angle = Math.atan2(this.dir.y, this.dir.x);
		this.pos2 = addV(this.pos1, this.dir);
	}

	/**
	 * moves segment so first position is at endPos
	 * @param {Vector} endPos - end position of tail
	 */
	moveT(endPos) {
		this.pos1 = endPos;
		this.pos2 = addV(this.pos1, this.dir);
	}

	/**
	 * moves segment so second position is at endPos
	 * @param {Vector} endPos - end position of head
	 */
	moveH(endPos) {
		this.pos2 = endPos;
		this.pos1 = subV(this.pos2, this.dir);
	}

	/**
	 * moves segment such that it points in the direction from first position to targetpos, and the head of the segment is at targetpos
	 * @param {Vector} targetPos - position to follow
	 */
	follow(targetPos) {
		let temp = subV(targetPos, this.pos1);
		let angle = Math.atan2(temp.y, temp.x);
		this.rotate(angle);

		this.moveH(targetPos);
	}

	/**
	 * draws segment as line from its two positions
	 */
	draw() {
		drawLin(
			this.ct,
			this.pos1.x,
			this.pos1.y,
			this.pos2.x,
			this.pos2.y,
			"#000000",
			this.width
		);
	}
}

class Appendage {
	/**
	 * initializies appendage with number of segments and bounds
	 * @param {number} numSegs - number of segments
	 * @param {number} maxW - max width appendage can travel before wrapping around
	 * @param {number} maxH - max height appendage can travel before wrapping around
	 * @param {Object} ct - context of canvas to draw appendage to
	 * @param {number} sp - speed of appendage
	 * @param {string} col - color of appendage
	 */
	constructor(numSegs, maxW, maxH, ct, sp, col) {
		this.seenPart = false;
		this.color = col;
		this.speed = sp;
		this.seen = false;
		this.ct = ct;
		this.maxWidth = maxW;
		this.maxHeight = maxH;
		this.segments = [];
		this.velocity = new Vector(
			Math.random() * 2 - 1,
			Math.random() * 2 - 1
		);
		this.velocity.multMag(3);
		this.acceleration = new Vector(0, 0);
		let segLen = 10;
		this.fullLen = numSegs * segLen * 1.3;
		for (let i = 0; i < numSegs; i++) {
			let x = 0.1 * this.maxWidth + Math.random() * this.maxWidth * 0.8;
			// let x = Width/2;
			let y = 0.1 * this.maxHeight + Math.random() * this.maxHeight * 0.8;
			// let y = Height/2;
			let posT = new Vector(x, y);
			let posH = new Vector(x + segLen, y + segLen);
			this.segments.push(new Segment().init2Pos(posT, posH, i / 2 + 2, this.ct));
		}
		this.head = this.segments[this.segments.length - 1];
	}

	/**
	 * repositions appendage to wrap around the borders of canvas
	 */
	collision() {
		let end = this.segments[this.segments.length - 1];
		if (end.pos2.x > this.maxWidth + this.fullLen) {
			end.moveH(new Vector(-this.fullLen, end.pos2.y));
		} else if (end.pos2.x < -this.fullLen) {
			end.moveH(new Vector(this.maxWidth + this.fullLen, end.pos2.y));
		}

		if (end.pos2.y > this.maxHeight + this.fullLen) {
			end.moveH(new Vector(end.pos2.x, -this.fullLen));
		} else if (end.pos2.y < -this.fullLen) {
			end.moveH(new Vector(end.pos2.x, this.maxHeight + this.fullLen));
		}
	}

	/**
	 * applies force vector to this appendage's acceleration
	 * @param {Vector} force - force vector
	 */
	applyForce(force) {
		this.acceleration = addV(this.acceleration, force);
		if (this.acceleration.length > accelConst*this.speed) {
			this.acceleration.setMag(accelConst);
		}
	}

	/**
	 * updates velocity with current acceleration, and moves appendage in direction of velocity
	 */
	trail() {
		let minSpeed = this.speed;
		let maxSpeed = this.speed*2;
		this.velocity = addV(this.velocity, this.acceleration);
		if (this.velocity.length > maxSpeed) {
			this.velocity.setMag(maxSpeed);
		} else if (this.velocity.length < minSpeed) {
			this.velocity.setMag(minSpeed);
		}
		let nextPos = addV(
			this.segments[this.segments.length - 1].pos2,
			this.velocity
		);
		this.follow(nextPos);
	}
	
	/**
	 * aligns and moves appendage so the head is at targetPos
	 * @param {Vector} targetPos - position the whole appendage follows
	 */
	follow(targetPos) {
		let pos = targetPos;
		for (let i = this.segments.length - 1; i >= 0; i--) {
			this.segments[i].follow(pos);
			pos = this.segments[i].pos1.copy();
		}
	}

	/**
	 * draws appendage by drawing every segment
	 */
	draw() {
		for (let i = 0; i < this.segments.length; i++) {
			this.segments[i].draw();
		}
	}

	/**
	 * updates and draws appendage by calling collision trail and draw
	 * @param {boolean} draw - whether or not appendage is drawn
	 */
	update(draw = true) {
		this.collision();
		this.trail();
		if(draw){
			this.draw();
		}
	}
}

class Fleet {
	/**
	 * initializes fleet
	 * @param {number} numAgents - number of appendages
	 * @param {number} numSegs - number of segments per appendages
	 * @param {number} maxW - max width any appendage can travel before wrapping around
	 * @param {number} maxH - max height any appendage can travel before wrapping around
	 * @param {Object} ct - context for canvas for drawing appendages
	 * @param {Object} canv - canvas for drawing appendages
	 * @param {number} sp - speed of each appendage
	 */
	constructor(numAgents, numSegs, maxW, maxH, ct, canv, sp) {
		this.ct = ct;
		this.canv = canv;
		
		/** @type {Array<Appendage>}*/
		this.Apps = [];
		
		/**@type {Quad} */
		this.storage = new Quad("root", null, this.Apps, maxW, maxH, this.ct);
		
		this.maxWidth = maxW;
		this.maxHeight = maxH;
		this.speed = sp;
		
		for (let i = 0; i < numAgents; i++) {
			let tempCol = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
			this.Apps.push(new Appendage(numSegs, maxW, maxH, this.ct, this.speed, tempCol));
		}
	}

	/**
	 * generates new quadtree
	 */
	updateQuad(){
		this.storage = new Quad("root", null, this.Apps, this.maxWidth, this.maxHeight, this.ct);
	}

	/**
	 * returns an array of vectors of the heads of every appendage 
	 * @returns {Array<Vector>}
	 */
	returnPoints() {
		let els = [];
		for (let i = 0; i < this.Apps.length; i++) {
			els.push(this.Apps[i].head.pos2);
		}
		return els;
	}

	/**
	 * applies flocking algorithm to make nearby appendages move in the same direction, and maintain a distance from one another
	 */
	flock() {
		for (let i = 0; i < this.Apps.length; i++) {
			let curApp = this.Apps[i];
			let nearbyApps = this.getNearby(curApp);
			if (nearbyApps.length == 0) {
				continue;
			}

			let avPos = new Vector(0, 0);
			let avDir = new Vector(0, 0);
			let avDir1 = new Vector(0, 0);

			for (let j = 0; j < nearbyApps.length; j++) {
				let tempApp = nearbyApps[j];

				avPos.add(tempApp.head.pos2); //cohesion
				let connect = subV(curApp.head.pos2, tempApp.head.pos2);
				connect.multMag(1 / connect.length);
				avDir.add(connect); //seperation
				avDir1.add(tempApp.head.dir.normal()); //align
			}

			let totalForce = new Vector(0, 0);

			avDir.multMag(sepConst);//use consts or .9
			let sepSteer = subV(avDir, curApp.velocity);

			totalForce.add(sepSteer);

			avPos.multMag(1 / nearbyApps.length);

			let coh = subV(avPos, curApp.head.pos2);
			coh.multMag(coConst);//use consts or .3
			let cohSteer = subV(coh, curApp.velocity);

			totalForce.add(cohSteer);

			avDir1 = avDir1.normal();
			let temp = curApp.velocity.normal(); // maybe change to dir
			let align = subV(avDir1, temp);

			align.multMag(alConst);//use consts or 5

			let alignSteer = subV(align, curApp.velocity);

			totalForce.add(alignSteer);

			curApp.applyForce(totalForce);
		}
	}

	/**
	 * returns an array of appendages that are with range of app
	 * @param {Appendage} app - chosen appendage to check about
	 * @returns {Array<Appendage>}
	 */
	getNearby(app) {
		let nearby = [];
		let range = percConst;//use consts or this
		if(this.storage == null){
			console.log("ERROR");
			return [];
		}
		let tempRoot = this.storage.search(app.head.pos2);
		if (tempRoot == null) {
			return [];
		}

		let pos = new Vector(app.head.pos2.x - range, app.head.pos2.y - range);
		if (percChecked.checked) {
			drawSRect(ctxW, pos.x, pos.y, 2 * range, 2 * range, "#0000ff");
		}

		let nearbyPossibleApps = tempRoot.getCloseby(pos, 2 * range, 2 * range);

		// for(let i = 0; i < this.Apps.length; i++){
		for (let i = 0; i < nearbyPossibleApps.length; i++) {
			// let tempApp = this.Apps[i];
			let tempApp = nearbyPossibleApps[i];
			if (tempApp.id == app.id) {
				continue;
			}

			let dist = subV(
				app.segments[app.segments.length - 1].pos2,
				tempApp.segments[tempApp.segments.length - 1].pos2
			).length;
			if (dist < range) {
				nearby.push(tempApp);
			}
		}
		return nearby;
	}

	/**
	 * updates Fleet by updating quadTree, then flocking the appendages, then moving the appendages
	 * @param {boolean} [draw] - whether or not the appendages are drawn
	 */
	update(draw = true) {
		this.updateQuad();
		this.flock();
		for (let i = 0; i < this.Apps.length; i++) {
			let a = this.Apps[i];
			a.update(draw);
		}
	}
}

class Quad {
	/**
	 * creates Quadtree Object
	 * @param {Object} par - parent of quadTree
	 * @param {number} index - index of which of quadrants this quadtree inhabits
	 * @param {Array<Appendage>} els - array of appendages inside this quadtree
	 * @param {number} maxWidth - width of biggest parent quadTree
	 * @param {number} maxHeight - height of biggest parent quadTree
	 * @param {Object} ct - context of canvas to draw quadTree on
	 */
	constructor(par, index, els, maxWidth, maxHeight, ct) {
		this.ct = ct;
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
		if (par == "root") {//replace with null, simplifies type of "par"
			this.parent = null;
			this.corner = new Vector(0, 0);
			this.width = maxWidth;
			this.height = maxHeight;
		} else {
			this.parent = par;
			this.width = par.width / 2;
			this.height = par.height / 2;
			let x = (index % 2) * this.width;
			let y = Math.floor(index / 2) * this.height;

			let newX = par.corner.x + x;
			let newY = par.corner.y + y;
			this.corner = new Vector(newX, newY);
		}
		this.elements = els;
		this.kids = [];
		if (this.elements.length > 1) {
			this.allocate();
		}
	}

	/**
	 * returns smallest quad tree with point p in it
	 * @param {Vector} p - point to check if in quadTree
	 * @returns {Quad}
	 */
	search(p) {
		if (this.checkInside(p) == false) {
			return null;
		}
		if (this.elements.length == 1) {
			return this;
		}
		for (let i = 0; i < this.kids.length; i++) {
			if (this.kids[i].checkInside(p) == true) {
				return this.kids[i].search(p);
			}
		}
	}

	/**
	 * draws quadTree as empty rectangle
	 */
	draw() {
		drawSRect(
			this.ct,
			this.corner.x,
			this.corner.y,
			this.width,
			this.height,
			"#000000"
		);
		for (let i = 0; i < this.kids.length; i++) {
			this.kids[i].draw();
		}
	}

	/**
	 * creates child quadTrees containing partitions of appendages from this quadTree
	 */
	allocate() {
		let els = [[], [], [], []];//shadowing variables maybe change
		for (let i = 0; i < this.elements.length; i++) {
			for (let j = 0; j < 4; j++) {
				if (
					this.checkInsideSub(j, this.elements[i].head.pos2) == true
				) {
					els[j].push(this.elements[i]);
					break;
				}
			}
		}
		for (let i = 0; i < 4; i++) {
			this.kids.push(new Quad(this, i, els[i], this.maxWidth, this.maxHeight, this.ct));
		}
	}

	/**
	 * returns if point p is inside this quadTree
	 * @param {Vector} p - point to check if in quadTree
	 * @returns {boolean}
	 */
	checkInside(p) {
		return (
			p.x > this.corner.x &&
			p.x < this.corner.x + this.width &&
			p.y > this.corner.y &&
			p.y < this.corner.y + this.height
		);
	}

	/**
	 * returns if child quadTree i should house point p
	 * @param {number} i - index of child quadTree
	 * @param {Vector} p - point to check if in child quadTree
	 * @returns {boolean}
	 */
	checkInsideSub(i, p) {
		let x = this.corner.x + ((i % 2) * this.width) / 2;
		let y = this.corner.y + (Math.floor(i / 2) * this.height) / 2;
		return (
			p.x > x &&
			p.x < x + this.width / 2 &&
			p.y > y &&
			p.y < y + this.height / 2
		);
	}

	/**
	 * returns if rectangle at pos with width w and h intersects this quadTree
	 * @param {Vector} pos - top left corner of rectangle
	 * @param {number} w - width of rectangle
	 * @param {number} h - height of rectangle
	 * @returns {boolean}
	 */
	intersect(pos, w, h) {
		return !(
			this.corner.x > pos.x + w ||
			this.corner.x + this.width < pos.x ||
			this.corner.y > pos.y + h ||
			this.corner.y + this.height < pos.y
		);
	}

	/**
	 * returns if rectangle at corner with width w and h is completely within quad
	 * @param {Vector} corner - top left corner of rectangle
	 * @param {number} w - width of rectangle
	 * @param {number} h - height of rectangle
	 * @returns {boolean}
	 */
	totallyWithin(corner, w, h) {
		return (
			corner.x > this.corner.x &&
			corner.x + w < this.corner.x + this.width &&
			corner.y > this.corner.y &&
			corner.y + h < this.corner.y + this.height
		);
	}

	/**
	 * returns array of appendages that are within this quadTree, and within rectangle at pos with width w and h
	 * @param {Vector} pos - top left corner of rectangle
	 * @param {number} w - width of rectangle
	 * @param {number} h - height of rectangle
	 * @returns {Array<Appendage>}
	 */
	getCloseby(pos, w, h) {
		// let found = [];
		if (!this.intersect(pos, w, h)) {
			// return found;
			return [];
		}
		//also check if range goes past borders
		if (this.totallyWithin(pos, w, h) == false) {
			if (this.parent == null) {
				return this.elements;
			}
			return this.parent.getCloseby(pos, w, h);
		} else {
			return this.elements;
		}
	}
}

