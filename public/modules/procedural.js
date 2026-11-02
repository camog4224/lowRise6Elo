/**
 * Initializes worm tab
 */
function initWorms() {
	wormFleet = new Fleet(300, 3, wormWidth, wormHeight, ctxW, wormCanvas, 10);
	wormRunApp = setInterval(updateWorms, 100);
	wormCounter = 0;
}

/**
 * updates worm tab
 */
function updateWorms() {
	clearGraph(ctxW, wormCanvas);
	if (treeChecked.checked) {
		wormFleet.storage.draw();
	}
	refreshSValues();
	wormCounter += 1;
	if (randomize.checked && wormCounter % (10 * 5) == 0) {
		randomizeWormSpecs();
	}
	wormFleet.update();
}

/**
 * hides worm tab
 */
function hideWorms() {
	clearInterval(wormRunApp);
	wormRunApp = null;
	wormFleet = null;
}


let procCanvas = document.getElementById("procCanvas");
let ctxP = procCanvas.getContext("2d");

let colSlider = document.getElementById("procCol");
let colSliderLabel = document.getElementById("procColLabel");

let rowSlider = document.getElementById("procRow");
let rowSliderLabel = document.getElementById("procRowLabel");

let procReset = document.getElementById("procReset");

let procPlaySwitch = document.getElementById("procPlay");

class Board{
	
	constructor(canvas, context){
		this.canvas = canvas;
		this.context = context;

		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;

		procReset.addEventListener("click", this.initProc.bind(this));

		this.cells = [];
		this.finishedIterating = false;
		this.restart = false;
		this.mainLoop = null;

		this.imgsLocation = "imgs";
		this.cellSideLength = 100;
		
		this.numCols = 10;
		this.numRows = 5;
		
		this.numMakeCols = this.canvasWidth / this.cellSideLength;

		this.cellWidth = this.canvasWidth / this.numCols;
		this.cellHeight = this.canvasHeight / this.numRows;
		
		this.tickInterval = 20;
		
		this.cellTemplateConnections = {
			end: ["111", "111", "101", "111"],
			floor: ["000", "000", "000", "000"],
			hallway: ["111", "101", "111", "101"],
			intersection: ["101", "101", "101", "101"],
			tintersection: ["111", "101", "101", "101"],
			wall: ["111", "111", "111", "111"],
			entry: ["111", "000", "111", "101"],
			diagonal: ["111", "000", "000", "111"],
			corner: ["111", "101", "101", "111"]
		};
		this.arrayTemplateConnections;
		this.cardinalDirs = ["up","right", "down", "left"];

		this.cellNames = Object.keys(this.cellTemplateConnections);
		this.numCellTypes = this.cellNames.length;
		this.cellImgs = new Array(this.numCellTypes);
	}

	/**
	 * refreshes procedural tab slider values
	 */
	refreshProcValues(){
		this.numCols = colSlider.value;
		this.numRows = rowSlider.value;
		
		// colSliderLabel.innerHTML = "Column Resolution : " + this.numCols;
		// rowSliderLabel.innerHTML = "Row Resolution : " + this.numRows;
		
		this.cellWidth = this.canvasWidth / this.numCols;
		this.cellHeight = this.canvasHeight / this.numRows;
	}

	/**
	 * Initializes chain of initial procedural image manipulations
	 */
	async firstInitProc(){
		this.loadBaseImages();
		setTimeout(this.stagger1.bind(this), 1000);
	}

	/**
	 * staggered initialized procedural
	 */
	async stagger1(){
		this.drawRotImages();
		await this.loadRotImages();
		clearGraph(this.context, this.canvas);
		this.drawIndexRotImages();
		this.makeRotConns();
	}

	/**
	 * Initializes proc tab
	 */
	async initProc() {
		this.cells = [];
		this.finishedIterating = false;
		this.restart = false;
		this.mainLoop = null;
		
		this.refreshProcValues();
		this.createMap(this.numCols, this.numRows, this.numCellTypes);
		this.mainLoop = setInterval(this.updateMap.bind(this), this.tickInterval);
		// this.procRunApp = setInterval(updateMap, loadSpeed);
	}

	/**
	 * returns the array of indexes of the cell with lowest entropy
	 * @returns {Array<number>}
	 */
	findLowestEntropy() {
		let smallestStates = 100;
		let lastI = -1;
		let lastJ = -1;
		for (let i = 0; i < this.numCols; i++) {
			for (let j = 0; j < this.numRows; j++) {
				if (
					this.cells[i][j].info.length < smallestStates &&
					this.cells[i][j].propped == false
				) {
					smallestStates = this.cells[i][j].info.length;
					lastI = i;
					lastJ = j;
				}
			}
		}
		return [lastI, lastJ];
	}

	/**
	 * returns array of sockets that fit with neighbor in direction dir
	 * @param {Array<number>} neighborStates - states of neighbor cell
	 * @param {number} dir - pointing from neighbor cell to origin cell
	 * @returns {Array<string>}
	 */
	getAllowedSockets(neighborStates, dir) {
		let allowedStates = [];
		for (let i = 0; i < neighborStates.length; i++) {
			let currentNeighborState = neighborStates[i];
			let currentNeighborTile = this.arrayTemplateConnections[currentNeighborState];
			let stringNeighborConnections = currentNeighborTile[dir].split("");
			let rStringNeighborConnections = stringNeighborConnections.reverse();
			let side = rStringNeighborConnections.join("");
			if (allowedStates.includes(side) == false) {
				allowedStates.push(side);
			}
		}
		return allowedStates;
	}

	/**
	 * iterates proc board recursively
	 */
	iterateBoardR(){
		let coords = this.findLowestEntropy();
		if (coords[0] == -1 || coords[1] == -1) {
			if (coords[0] == -1 && coords[1] == -1) {
				this.finishedIterating = true;
			}
			return;
		}
		let pickedCell = this.cells[coords[0]][coords[1]];
		
		pickedCell.pick();
		coords = this.findLowestEntropy();
		if (coords[0] == -1 || coords[1] == -1) {
			if (coords[0] == -1 && coords[1] == -1) {
				this.finishedIterating = true;
			}
			return;
		}
		this.iterateCell(0, coords[0], coords[1]);//find propped cell next to this one to find dir
	}

	/**
	 * recursively iterates cell at column x and row y and its neighboring cells
	 * @param {number} dir - direction parent cell came from
	 * @param {number} x - column of cell
	 * @param {number} y - row of cell
	 */
	iterateCell(dir, x, y){
		if(x < 0 || x >= this.numCols || y < 0|| y >= this.numRows){
			return;
		}
		if(this.cells[x][y].propped == true || this.restart == true){
			return;
		}
		let initialPossibleStates = this.cells[x][y].info;
		let newPossibleStates = initialPossibleStates;
		for (let k = 0; k < 4; k++) {
			let xi;
			let yi;
			if (k < 2) {
				xi = x - 1 + k * 2;
				yi = y;
			} else {
				xi = x;
				yi = y - 1 + (k - 2) * 2;
			}
			if (xi < 0 || xi >= this.numCols || yi < 0 || yi >= this.numRows) {
				continue;
			}
			
			let neighborCell = this.cells[xi][yi];
			let neighborIndex; //in direction of neighbor from main cell
			if (k == 0) {
				neighborIndex = 3;
			} else if (k == 1) {
				neighborIndex = 1;
			} else if (k == 2) {
				neighborIndex = 0;
			} else {
				neighborIndex = 2;
			}
			let lookIndex = (neighborIndex + 2) % 4; // in direction of main cell from neighbor
			let allowedSockets = this.getAllowedSockets(
				neighborCell.info,
				lookIndex
			);
			newPossibleStates = this.reducePossibleStates(
				newPossibleStates,
				allowedSockets,
				neighborIndex
			);
		}
		
		if(newPossibleStates.length == 0){
			this.restart = true;
			return;
		}
		if(newPossibleStates.length == 1){
			this.cells[x][y].propped = true;
		}
		if(compareArrays(initialPossibleStates, newPossibleStates) == true){//look into symmetrical states
			//dont recurse
			return;
		}
		this.cells[x][y].info = newPossibleStates;
		if(this.restart != true){
			this.iterateCell(2, x, y-1);
		}
		if(this.restart != true){
			this.iterateCell(3, x+1, y);
		}
		if(this.restart != true){
			this.iterateCell(0, x, y+1);
		}
		if(this.restart != true){
			this.iterateCell(1, x-1, y);
		}
	}

	/**
	 * iterates proc board iteritively
	 */
	iterateBoard() {//probably mixed up xy ij row/column
		
		let coords = this.findLowestEntropy();
		if (coords[0] == -1 || coords[1] == -1) {
			if (coords[0] == -1 && coords[1] == -1) {
				this.finishedIterating = true;
			}
			return;
		}

		let nextBoard = new Array(this.numCols);
		for (let i = 0; i < this.numCols; i++) {
			nextBoard[i] = new Array(this.numRows);
		}

		let pickedCell = this.cells[coords[0]][coords[1]];

		pickedCell.pick();

		for (let i = 0; i < this.numCols; i++) {
			for (let j = 0; j < this.numRows; j++) {
				let mainCell = this.cells[i][j];
				if (mainCell.propped == true) {
					nextBoard[i][j] = this.cells[i][j];
				} else {
					//look at neighbors
					let finalStates = mainCell.info;
					for (let k = 0; k < 4; k++) {
						let x;
						let y;
						if (k < 2) {
							x = i - 1 + k * 2;
							y = j;
						} else {
							x = i;
							y = j - 1 + (k - 2) * 2;
						}
						if (x < 0 || x >= this.numCols || y < 0 || y >= this.numRows) {
							continue;
						}
						
						let neighborCell = this.cells[x][y];
						let neighborIndex; //in direction of neighbor
						if (k == 0) {
							neighborIndex = 3;
						} else if (k == 1) {
							neighborIndex = 1;
						} else if (k == 2) {
							neighborIndex = 0;
						} else {
							neighborIndex = 2;
						}
						let lookIndex = (neighborIndex + 2) % 4; // in direction of main cell
						let allowedSockets = this.getAllowedSockets(
							neighborCell.info,
							lookIndex
						);
						finalStates = this.reducePossibleStates(
							finalStates,
							allowedSockets,
							neighborIndex
						);
						if (finalStates.length < 1) {
							this.restart = true;
							break;
						}
					}
					nextBoard[i][j] = new Cell(finalStates);
				}
			}
		}
		this.cells = nextBoard;
	}

	/**
	 * returns array of states currentStates has to be reduced to by which side adjSide givenSockets connects with
	 * @param {Array<number>} currentStates - initial states of a cell
	 * @param {Array<string>} givenSockets - tile containing all 4 sets of sockets to reduce currentStates with
	 * @param {number} adjSide - index with with choose which set of sockets in givenSockets to reduce currentStates with
	 * @returns {Array<number>}
	 */
	reducePossibleStates(currentStates, givenSockets, adjSide) {
		let newStates = [];
		for (let i = 0; i < currentStates.length; i++) {
			let curState = currentStates[i];
			let curConn = this.arrayTemplateConnections[curState];//does this makes sense
			let singleSide = curConn[adjSide];
			if (givenSockets.includes(singleSide)) {
				newStates.push(curState);
			}
		}
		return newStates;
	}

	/**
	 * draws the collapsed states of cells or heat map depending on how many possible states a cell has left
	 */
	drawMap() {
		for (let i = 0; i < this.cells.length; i++) {
			for (let j = 0; j < this.cells[i].length; j++) {
				let x = i * this.cellWidth;
				let y = j * this.cellHeight;
				if (this.cells[i][j].info.length == 1) {
					this.context.drawImage(this.cellImgs[this.cells[i][j].info[0]], x, y, this.cellWidth, this.cellHeight);
				} else {
					// drawDetailedCell(cells[i][j], x, y, boxWidth, boxHeight);
					drawFRect(this.context, x, y, this.cellWidth, this.cellHeight, colorSMap[this.cells[i][j].info.length-1]);
				}
			}
		}
	}

	/**
	 * draws all current states of curCell within the borders of width w and height h at x and y
	 * @param {Cell} curCell - cell
	 * @param {number} x - x value of topleft of cell
	 * @param {number} y - y value of topleft of cell
	 * @param {number} w - width of cell
	 * @param {number} h - height of cell
	 */
	drawDetailedCell(curCell, x, y, w, h){
		const innerW = w/6;
		const innerH = h/6;
		for(let i = 0; i < curCell.info.length; i++){
			let stateNum = curCell.info[i];
			let innerX = x + (stateNum%6)*innerW;
			let innerY = y + Math.floor(stateNum/6)*innerH;
			this.context.drawImage(this.cellImgs[curCell.info[i]], innerX, innerY, innerW, innerH);
		}
	}

	/**
	 * initializes template cell images into Image Objects
	 */
	async loadBaseImages() {
		for (let i = 0; i < this.numCellTypes; i++) {
			let temp = new Image(this.cellSideLength, this.cellSideLength);
			temp.src = "/" + this.imgsLocation + "/" + this.cellNames[i] + ".png";
			this.cellImgs[i] = temp;
		}
	}

	/**
	 * draws template cell images to proc canvas
	 */
	drawBaseImages(){
		for(let i = 0; i < this.numCellTypes; i++){
			let x = (i % this.numMakeCols) * this.cellSideLength;
			let y = Math.floor(i / this.numMakeCols) * this.cellSideLength;
			this.context.drawImage(this.cellImgs[i], x, y, this.cellWidth, this.cellHeight);
		}
	}

	/**
	 * draws template cell images and their 3 other rotations in order to proc canvas
	 */
	async drawRotImages() {
		for (let i = 0; i < this.numCellTypes * 4; i++) {
			let x = (i % this.numMakeCols) * this.cellSideLength;
			let y = Math.floor(i / this.numMakeCols) * this.cellSideLength;
			let rotX = x + this.cellSideLength / 2;
			let rotY = y + this.cellSideLength / 2;
			let degs = ((i % 4) * Math.PI) / 2;
			this.context.save();
			this.context.translate(rotX, rotY);
			this.context.rotate(degs);
			this.context.drawImage(this.cellImgs[Math.floor(i / 4)], -this.cellSideLength / 2, -this.cellSideLength / 2);
			this.context.restore();
		}
	}

	/**
	 * takes images drawn on proc canvas and stores them as ImageBitmaps to imgs array
	 */
	async loadRotImages() {
		let newImgs = new Array(this.numCellTypes * 4);

		for (let i = 0; i < this.numCellTypes * 4; i++) {
			let x = (i % this.numMakeCols) * this.cellSideLength;
			let y = Math.floor(i / this.numMakeCols) * this.cellSideLength;
			newImgs[i] = await createImageBitmap(this.canvas, x, y, this.cellSideLength, this.cellSideLength);
		}
		this.cellImgs = newImgs;
		this.numCellTypes = this.cellImgs.length;
	}

	/**
	 * draws all cell images to proc canvas
	 */
	drawIndexRotImages() {
		for (let i = 0; i < this.cellImgs.length; i++) {
			let x = (i % this.numMakeCols) * 100;
			let y = Math.floor(i / this.numMakeCols) * 100;
			this.context.drawImage(this.cellImgs[i], x, y);
		}
	}

	/**
	 * generate sockets for each rotated version of template cell image
	 */
	makeRotConns() {
		let tempConns = {};
		let keys = Object.keys(this.cellTemplateConnections);
		let tempArrConns = new Array(keys.length * 4);
		for (let i = 0; i < keys.length; i++) {
			for (let j = 0; j < 4; j++) {
				let newKey = "" + keys[i] + "" + j;
				let index = 4 - j;
				let curSides = this.cellTemplateConnections[keys[i]];
				let back = curSides.slice(index, 4);
				let front = curSides.slice(0, index);
				let newSides = back.concat(front);
				tempConns[newKey] = newSides;
				tempArrConns[i * 4 + j] = newSides;
			}
		}
		this.cellTemplateConnections = tempConns;
		this.arrayTemplateConnections = tempArrConns;
	}

	/**
	 * @param {number} w - number of columns
	 * @param {number} h - number of rows
	 * @param {number} s - number of states a cell can be
	 */
	createMap(w, h, s) {
		let temp = new Array(w);
		for (let i = 0; i < w; i++) {
			let tempCol = new Array(h);
			let numTempStates = s;
			for (let j = 0; j < h; j++) {
				let tempArr = [];
				for (let k = 0; k < numTempStates; k++) {
					tempArr.push(k);
				}
				let tempCell = new Cell(tempArr);
				tempCol[j] = tempCell;
			}
			temp[i] = tempCol;
		}
		this.cells = temp;
	}

	/**
	 * updates proc board
	 */
	updateMap() {
		if(procPlaySwitch.checked == false){
			return;
		}
		if (this.finishedIterating == false) {
			if (this.restart == true) {
				this.restart = false;
				this.refreshProcValues();
				this.createMap(this.numCols, this.numRows, this.numCellTypes);
			}
			// clearGraph(ctxP, procCanvas);
			colSliderLabel.innerHTML = "Column Resolution : " + colSlider.value;
			rowSliderLabel.innerHTML = "Row Resolution : " + rowSlider.value;
			//make iterative vs recursive a toggle button
			this.iterateBoardR();
			// this.iterateBoard();

			this.drawMap();
		} else {
			// checkConnections();
			// clearInterval(procRunApp);
			// procRunApp = null;
		}
	}

	/**
	 * clears all board state
	 */
	hideProc() {
		clearInterval(this.mainLoop);
		this.mainLoop = null;
		this.cells = [];
	}
}

class Cell {
	/**
	 * Initializes cell with possible states s it can be
	 * @param {Array<number>} s - possible states cell can be
	 */
	constructor(s) {
		this.info = s;
		if (s.length == 1) {
			this.propped = true;
		} else if (s.length == 0) {
		} else {
			this.propped = false;
		}
	}

	/**
	 * Picks a states from possible states at random
	 */
	pick() {//maybe of instead collapsing, just removing some of the states randomly
		let index = Math.floor(Math.random() * this.info.length);
		
		this.info.splice(index, 1);
		// this.info = [this.info[index]];
		if(this.info.length == 1){
			this.propped = true;
		}
	}
}

let procBoard = new Board(procCanvas, ctxP);

/**
 * returns whether array s1 and array s2 contain the same elements
 * @param {Array<number>} s1 - array 1
 * @param {Array<number>} s2 - array 2
 * @returns {boolean}
 */
function compareArrays(s1, s2){
	for(let i = 0; i < s1.length; i++){
		if(s2.includes(s1[i]) == false){
			return false;
		}
	}
	return true;
}


class Point {
	/**
	 * @param {number} x - x value of point
	 * @param {number} y - y value of point
	 * @param {number} z - z value of point
	 */
	constructor(x, y, z){
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * lengthens this points distance from the origin by m
	 * @param {number} m - multiplying factor
	 */
	mult(m){
		this.x = this.x*m;
		this.y = this.y*m;
		this.z = this.z*m;
	}

	/**
	 * adds point p to this point
	 * @param {Point} p - point to add
	 */
	sum(p){
		this.x = this.x + p.x;
		this.y = this.y + p.y;
		this.z = this.z + p.z;
	}

	/**
	 * returns a point with this points distance from the origin m longer
	 * @param {number} m - multiplying factor
	 * @returns {Point}
	 */
	rMult(m){
		return new Point(this.x*m, this.y*m, this.z*m);
	}

	/**
	 * returns a point from the addition of this point and point p
	 * @param {Point} p - point p
	 * @returns {Point}
	 */
	rSum(p){
		return new Point(this.x + p.x, this.y + p.y, this.z + p.z);
	}

	/**
	 * @param {number} s1 - this point's multiplier
	 * @param {Point} p2 - other point
	 * @param {number} s2 - other point's multiplier
	 * @returns {Point}
	 */
	rBigSum(s1, p2, s2){
		let tempS = this.rMult(s1);
		let tempS2 = p2.rMult(s2);
		return tempS.rSum(tempS2);
	}

	/**
	 * floors the x y z values of this Point
	 */
	clean(){
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
	}
}

/**
 * returns array of Points that a linearly interpolated between the given array of colors
 * @param {Array<string>} colors - array of colors for spline to interpolate between
 * @param {number} numPoints - number of points for spline
 * @returns {Array<Point>}
 */
function makeColorSpline(colors, numPoints){
	const numColors  = colors.length;
	let tInterval = (numColors-1)/numPoints;
	let cSpline = new Array(numPoints);
	for(let i = 0; i < numPoints; i++){
		let curT = tInterval * i;
		let curColorIndex = Math.floor(curT);
		let partT = curT - curColorIndex;
		let a = interpLine(colors[curColorIndex], colors[curColorIndex+1], partT);
		a.clean();
		cSpline[i] = a;
	}
	return cSpline;
}

/**
 * returns Point at a percentage t between point p1 and p2
 * @param {Point} p1 - first point
 * @param {Point} p2 - second point
 * @param {number} t - percent between first and second point
 * @returns {Point}
 */
function interpLine(p1, p2, t){
	let a = new Point(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
	a.mult(t);
	a.sum(p1);
	return a;
}

/**
 * returns array of colors in string format
 * @param {Array<Point>} s - array of points
 * @return {Array<String>}
 */
function convSplineToString(s){
	let arr = new Array(s.length);
	for(let i = 0; i < arr.length; i++){
		arr[i] = "rgb(" + s[i].x + ", " + s[i].y + ", " + s[i].z + ")";
	}
	return arr;
}

let colorMap = makeColorSpline([new Point(230, 0, 0), new Point(100, 240, 30), new Point(50, 50, 230), new Point(20, 20, 70)], 36);
let colorSMap = convSplineToString(colorMap);

