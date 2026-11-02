/**
 * draws circle of given size, color, and position to given canvas
 * @param {Object} ct - context of canvas to draw circle to
 * @param {number} x - x position of center of circle
 * @param {number} y - y position of center of circle
 * @param {number} r - radius of circle
 * @param {string} c - color of circle
 */
function drawCirc(ct, x, y, r, c) {
	ct.fillStyle = c;
	ct.beginPath();
	ct.arc(x, y, r, 0, 2 * Math.PI);
	ct.fill();
}

/**
 * draws line of given size, color, and position to given canvas
 * @param {Object} ct - context of canvas to draw line to
 * @param {number} x1 - x position of first point of line
 * @param {number} y1 - y position of first point of line
 * @param {number} x2 - x position of second point of line
 * @param {number} y2 - y position of second point of line
 * @param {string} c - color of line
 * @param {number} w - width of line
 */
function drawLin(ct, x1, y1, x2, y2, c, w) {
	ct.strokeStyle = c;
	ct.lineWidth = w;
	ct.lineCap = "round";
	ct.beginPath();
	ct.moveTo(x1, y1);
	ct.lineTo(x2, y2);
	ct.stroke();
}

/**
 * draws text of given size, color, and position to given canvas
 * @param {Object} ct - context of canvas to draw text to
 * @param {number} x - x position top-left corner of text
 * @param {number} y - y position top-left corner of text
 * @param {number} text - string to be displayed
 * @param {string} c - color of text
 */
function drawTex(ct, x, y, text, c) {
	ct.font = "12px Georgia";
	ct.fillStyle = "#000000";
	ct.fillText(text, x, y);
}

/**
 * draws empty rectangle of given size, color, and position to given canvas
 * @param {Object} canvas - canvas to draw rectangle to
 * @param {number} x - x position top-left corner of rectangle
 * @param {number} y - y position top-left corner of rectangle
 * @param {number} w - width of rectangle
 * @param {number} h - height of rectangle
 * @param {string} c - color of rectangle
 */
function drawSRect(canv, x, y, w, h, c) {
	canv.lineWidth = 1;
	canv.strokeStyle = c;
	canv.strokeRect(x, y, w, h);
}

/**
 * draws filed rectangle of given size, color, and position to given canvas
 * @param {Object} ct - context of canvas to draw rectangle to
 * @param {number} x - x position top-left corner of rectangle
 * @param {number} y - y position top-left corner of rectangle
 * @param {number} w - width of rectangle
 * @param {number} h - height of rectangle
 * @param {string} c - color of rectangle
 */
function drawFRect(ct, x, y, w, h, c) {
	ct.fillStyle = c;
	ct.fillRect(x, y, w, h);
}

/**
 * populates game table with information of selected player's games
 * @param {Object} info - all information about selected player's games
 * @param {Array} oppInfo - array of each opponent selected player played against 
 */
async function makePastGameTable(info, oppInfo) {
	let curTab = document.getElementById("gamesTable");
	curTab.remove();
	let tab = document.createElement("table");
	tab.id = "gamesTable";
	let header = tab.createTHead();
	let firstRow = header.insertRow(0);

	firstRow.insertCell(0).innerHTML = "Opponent";
	firstRow.insertCell(-1).innerHTML = "Initial Elo";
	firstRow.insertCell(-1).innerHTML = "Opponent's Initial Elo";
	firstRow.insertCell(-1).innerHTML = "Final Elo";
	firstRow.insertCell(-1).innerHTML = "Opponent's Final Elo";
	firstRow.insertCell(-1).innerHTML = "When Game Was Played";

	let body = tab.createTBody();
	// let firstRow = body.insertRow(0);

	for (let i = 0; i < info.gamesPlayed; i++) {
		let tempRow = body.insertRow(-1);
		if (info.victories[i] == true) {
			tempRow.classList.add("winRow");
		} else {
			tempRow.classList.add("loseRow");
		}
		let tempOpp = info.opponents[i];
		let oppGameIndex = oppInfo[tempOpp].readableTime.indexOf(
			info.readableTime[i + 1]
		);

		let tempIElo = info.elo[i];
		let tempFElo = info.elo[i + 1];
		let tempOIElo = oppInfo[tempOpp].elo[oppGameIndex - 1];
		let tempOFElo = oppInfo[tempOpp].elo[oppGameIndex];
		let tempTime = cleanDate(info.readableTime[i + 1]);
		tempRow.insertCell(0).innerHTML = tempOpp;
		tempRow.insertCell(-1).innerHTML = tempIElo;
		tempRow.insertCell(-1).innerHTML = tempOIElo;
		tempRow.insertCell(-1).innerHTML = tempFElo;
		tempRow.insertCell(-1).innerHTML = tempOFElo;
		tempRow.insertCell(-1).innerHTML = tempTime;
	}
	gamesDisplay.appendChild(tab);
}

let tabs = {
	mainContent: mainContent,
	movieContent: movieContent,
	visualContent: visualContent,
	wormContent: wormContent,
	procContent: procContent,
	gameContent: gameContent,
};

/**
 * displays selected tab and hides all content on other tabs
 * @param {string} key - selected tab's name
 */
function showTab(key) {
	let allKeys = Object.keys(tabs);
	for (let i = 0; i < allKeys.length; i++) {
		if (allKeys[i] == key) {
			tabs[allKeys[i]].style.display = "inline";
		} else {
			tabs[allKeys[i]].style.display = "none";
		}
	}
	initSpec(key);
	hideAll(key);
}

function addNavButtonEvents(){
	let navButtons = document.getElementsByName("navOptions");
	for(let i = 0; i < navButtons.length; i++){
		navButtons[i].addEventListener("change", function (){
			showTab(this.value);
		});
	}
}

addNavButtonEvents();

/**
 * initializes selected tab's functions
 * @param {string} key - selected tab's name
 */
function initSpec(key) {
	if (key == "wormContent") {
		initWorms();
	} else if (key == "procContent") {
		procBoard.initProc();
	} else if (key == "movieContent") {
		refreshMovies();
	} else if (key == "gameContent") {
		game.initGame();
	}
}

/**
 * deactivates content on all tabs other than selected tab
 * @param {string} key - selected tab's name
 */
function hideAll(key) {
	if (key != "wormContent") {
		hideWorms();
	}
	if (key != "procContent") {
		procBoard.hideProc();
	}
	if (key != "gameContent") {
		if(game != null){
			game.hideGame();
		}
	}
}

/**
 * adds user's euid to database
 */
async function addID() {
	let name = personID.value;
	//if logged in
	if (checkAccountStatus() == false) {
		displayUserInfo.innerHTML = "no one signed in";
		alert("no one signed in");
		return;
	}
	let curUser = auth.currentUser;
	let curMatchingUsers = await matchingAccount(curUser.uid);

	if (curMatchingUsers.length > 0) {
		displayUserInfo.innerHTML = "Player with this email already exists";
		alert("Player with this email already exists");
		return;
	}

	let curPlayerInfo = await getPlayer(name);
	if (curPlayerInfo.euid != null) {
		displayUserInfo.innerHTML = "Player already has associated email";
		alert("Player already has associated email");
		return;
	}

	const sfRef = doc(db, "playerInfo", name);
	try {
		await runTransaction(db, async (transaction) => {
			const sfDoc = await transaction.get(sfRef);
			let info = await sfDoc.data();
			if (!sfDoc.exists()) {
				throw "Document does not exist!";
			}

			let data = {
				euid: curUser.uid,
			};

			transaction.update(sfRef, data);
		});

		displayUserInfo.innerHTML = "ID ADDED";
		alert("ID ADDED")
	} catch (e) {}
}

/**
 * returns whether or not user is correctly signed in
 * @returns {boolean}
 */
function checkAccountStatus() {
	let curUser = auth.currentUser;
	if (curUser !== null) {
		return checkCornell(curUser.email);
	} else {
		return false;
	}
}

/**
 * signs out user
 */
async function signOutUser() {
	signOut(auth)
		.then(() => {
			// Sign-out successful.
			userDisplayText.innerHTML = "Not Signed In";
		})
		.catch((error) => {
			// An error happened.
		});
}

/**
 * returns array of all accounts in database matching given euid
 * @param {string} euid - an accounts euid to compare with
 * @returns {Array}
 */
async function matchingAccount(euid) {
	const ref = collection(db, "playerInfo");
	const q = await query(ref, where("euid", "==", euid));
	let temp = await getDocs(q);
	let matchingAccounts = [];
	await temp.forEach((doc) => {
		let d = doc.data();
		d.name = doc.id;
		matchingAccounts = matchingAccounts.concat([d]);
	});
	return matchingAccounts;
}

/**
 * adds new player
 * @param {string} name - name of player
 * @param {string} euid - euid of player
 */
async function addPlayer(name, euid) {
	let data = {
		euid: euid,
		elo: [1000],
		currentElo: 1000,
		victories: [],
		wins: 0,
		losses: 0,
		gamesPlayed: 0,
		time: [Date.now()],
		readableTime: ["" + new Date(Date.now())],
	};
	await setDoc(doc(db, "playerInfo", name), data);
}

/**
 * returns id of game request document in database
 * @param {Object} info - information of a pending game
 * @returns {string}
 */
async function addGameRequest(info) {
	const docRef = await addDoc(collection(db, "pendingGames"), info);

	return docRef.id;
}

/**
 * removes gamerequest with id from database
 * @param {string} id - id of game to be removed
 */
async function removeGameRequest(id) {
	await deleteDoc(doc(db, "pendingGames", id));
}

/**
 * returns array of all pending game requests in database
 * @returns {Array}
 */
async function requestDocs() {
	const querySnapshot = await getDocs(collection(db, "pendingGames"));
	let completeInfo = [];
	await querySnapshot.forEach((doc) => {
		let d = doc.data();
		d.id = doc.id;
		completeInfo = completeInfo.concat([d]);
	});
	return completeInfo;
}

/**
 * returns game request document of id in database
 * @param {string} id - id of requested game request
 * @returns {Object}
 */
async function getRequest(id) {
	const docRef = doc(db, "pendingGames", id);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		return await docSnap.data();
	} else {
		// doc.data() will be undefined in this case
		return -1;
	}
}

/**
 * updates player of name, with new info
 * @param {string} name - name of player to update
 * @param {number} newElo - new elo of player
 * @param {boolean} victory - whether player won
 * @param {string} t - time of new game
 * @param {string} rt - readable time of new game
 * @param {string} opponent - name of opponent of new game
 */
async function updatePlayer(name, newElo, victory, t, rt, opponent) {
	const sfRef = doc(db, "playerInfo", name);
	try {
		await runTransaction(db, async (transaction) => {
			const sfDoc = await transaction.get(sfRef);
			let info = await sfDoc.data();
			if (!sfDoc.exists()) {
				throw "Document does not exist!";
			}

			let data = {
				elo: info.elo.concat(newElo),
				currentElo: newElo,
				victories: info.victories.concat(victory),
				wins: info.wins + Boolean(victory),
				losses: info.losses + 1 - Boolean(victory),
				gamesPlayed: info.gamesPlayed + 1,
				time: info.time.concat(t),
				readableTime: info.readableTime.concat(rt),
				opponents: info.opponents.concat(opponent),
			};

			transaction.update(sfRef, data);
		});
	} catch (e) {}
}

/**
 * returns game request document of id in database
 * @param {string} name1 - name of player 1
 * @param {string} name2 - name of player 2
 * @param {boolean} v1 - whether player 1 won
 * @param {number} elo1 - new elo of player 1
 * @param {number} elo2 - new elo of player 2
 * @param {string} t - time of new game between players
 * @param {string} tr - readable time of new game between players
 */
function matchUp(name1, name2, v1, elo1, elo2, t, tr) {
	updatePlayer(name1, elo1, v1, t, tr, name2);
	updatePlayer(name2, elo2, !v1, t, tr, name1);
}

/**
 * returns info of player with name
 * @param {string} name - name of player
 * @returns {Object}
 */
async function getPlayer(name) {
	const docRef = doc(db, "playerInfo", name);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		return await docSnap.data();
	} else {
		// doc.data() will be undefined in this case

		return -1;
	}
}
// firstRow.insertCell(0).innerHTML = "Name";
// 	firstRow.insertCell(-1).innerHTML = "Elo";
// 	firstRow.insertCell(0).innerHTML = "Rank";
// 	firstRow.insertCell(-1).innerHTML = "Win %";
// 	firstRow.insertCell(-1).innerHTML = "Total Games    ";
// 	firstRow.insertCell(-1).innerHTML = "Last Game";

/**
 * returns array of every player's info in descending order of elo
 * @returns {{
 * name: String, 
 * currentElo: number, 
 * elo: number[],
 * euid: String,
 * gamesPlayed: number, 
 * losses: number,
 * opponents: String[],
 * readableTime: String[],
 * time: number[],
 * victories: boolean[],
 * wins: number
 * }[]}
 */
async function eloRankedDocs() {
	const ref = collection(db, "playerInfo");
	const q = await query(ref, orderBy("currentElo", "desc"));
	let temp = await getDocs(q);
	let rankedElos = [];
	await temp.forEach((doc) => {
		let d = doc.data();
		d.name = doc.id;
		rankedElos = rankedElos.concat([d]);
	});
	return rankedElos;
}

onAuthStateChanged(auth, (user) => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/firebase.User

		// const uid = user.uid;
		signInButton.style.display = "none";
		signOutButton.style.display = "inline";

		userDisplayText.innerHTML = "Signed in as : " + user.displayName;
		// ...
	} else {
		signInButton.style.display = "inline";
		signOutButton.style.display = "none";

		// User is signed out
		// ...
	}
});

async function tempO() {
	await askForSignIn();
}

