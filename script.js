//firebase deploy --only hosting,database,firestore

//elo decay baed on elo

//have swarm for every person logged into site in worms tab

let scores = document.getElementById("scores");

let s1 = document.getElementById("s1");
let s2 = document.getElementById("s2");
let sendButton = document.getElementById("subSend");
sendButton.addEventListener("click", makeMatchRequest);

let newP = document.getElementById("newPlayer");
let addButton = document.getElementById("subNewP");
addButton.addEventListener("click", requestPlayer);

let requestParent = document.getElementById("requests");

let signInButton = document.getElementById("signSend");
signInButton.addEventListener("click", tempO);

let signOutButton = document.getElementById("outSend");
signOutButton.addEventListener("click", signOutUser);

// let userDisplay = document.getElementById("userDisplay");
let userDisplayText = document.getElementById("userDisplayText");

let personID = document.getElementById("h1");
let addIDButton = document.getElementById("subID");
addIDButton.addEventListener("click", addID);

let displayUserInfo = document.getElementById("displayInfo");

// let mainButton = document.getElementById("main");
// mainButton.addEventListener("click", function () {
// 	showTab("mainContent");
// });

// let visualButton = document.getElementById("visual");
// visualButton.addEventListener("click", function () {
// 	showTab("visualContent");
// });

// let movieButton = document.getElementById("movie");
// movieButton.addEventListener("click", function () {
// 	showTab("movieContent");
// });

// let wormButton = document.getElementById("worms");
// wormButton.addEventListener("click", function () {
// 	showTab("wormContent");
// });

// let procButton = document.getElementById("proc");
// procButton.addEventListener("click", function () {
// 	showTab("procContent");
// });

// let gameButton = document.getElementById("game");
// gameButton.addEventListener("click", function () {
// 	showTab("gameContent");
// });

let mainContent = document.getElementById("mainContent");
let visualContent = document.getElementById("visualContent");
let movieContent = document.getElementById("movieContent");
let wormContent = document.getElementById("wormContent");
let procContent = document.getElementById("procContent");
let gameContent = document.getElementById("gameContent");

let timeButton = document.getElementById("gameSend");
timeButton.addEventListener("click", displayMatches);

let graphButton = document.getElementById("graphSend");
graphButton.addEventListener("click", plotPoints);

let clearButton = document.getElementById("clearSend");
clearButton.addEventListener("click", function () {
	clearGraph(ctx, canvas);
});

let gamesPerson = document.getElementById("d1");

let gamesDisplay = document.getElementById("gamesDisplay");

let moviesDisplay = document.getElementById("moviesDisplay");

let movieInput = document.getElementById("movieInput");

let movieSendButton = document.getElementById("movieSend");
movieSendButton.addEventListener("click", reqAddMovie);

const k = 32;
const d = 400;

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
	getFirestore,
	collection,
	getDocs,
	query,
	where,
	doc,
	getDoc,
	deleteDoc,
	setDoc,
	addDoc,
	updateDoc,
	runTransaction,
	orderBy,
	onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import {
	getDatabase,
	ref,
	child,
	push,
	update,
	set,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";
import {
	GoogleAuthProvider,
	// signInWithRedirect,
	signInWithPopup,
	// getRedirectResult,
	getAuth,
	signOut,
	onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

//firebase deploy --only hosting,database,firestore

const firebaseConfig = {
	apiKey: "AIzaSyA1RIrA-DJxWj3yzc-RqQqXTTLnW0bXSKM",
	authDomain: "lr6elo.firebaseapp.com",
	projectId: "lr6elo",
	storageBucket: "lr6elo.appspot.com",
	messagingSenderId: "244570148069",
	appId: "1:244570148069:web:82659bdde22e85f18cd80c",
	measurementId: "G-5JSRB6JR91",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const auth = getAuth();


/**
 * asks user with popup to sign in
 */
async function askForSignIn() {
	// await signInWithRedirect(auth, provider);
	await signInWithPopup(auth, provider);
	// alert("tried to sign in");
	// const tempRes = await getRedirectResult(auth);
	// await reauthenticateWithRedirect(tempRes.user, provider);
	// const authRes = await getRedirectResult(auth);
	// if (authRes) {
	// 	// This is the signed-in user
	// 	alert("successful sign in");
	// }else{
	// 	alert("failed sign in");
	// }
}

const thing =
	"244570148069-6is73a7sohagu36v3bhov3s3at1hluvp.apps.googleusercontent.com";

/**
 * displays all movies in database in movies tab
 */
async function displayMovies() {
	const name = await curUser();
	let info = await allMovies();
	if(name != null){
		for (let i = 0; i < info.length; i++) {
			let movieBox = document.createElement("DIV");
			movieBox.classList.add("movieBox");
			movieBox.classList.add("paper");
			movieBox.classList.add("with-shadow");
	
			let sup = searchVoters(info[i].supporters, name);
			let crit = searchVoters(info[i].critics, name);
			let voted = sup || crit;
	
			let movieTitle = document.createElement("DIV");
			movieTitle.innerHTML = info[i].title;
			movieTitle.classList.add("movieTitle");
	
			let upVote = document.createElement("img");
			if(sup == true){
				upVote.src = "/imgs/upFull.png";
			}else{
				upVote.src = "/imgs/upEmpty.png";
			}
			upVote.classList.add("movieVote");
			upVote.addEventListener("click", function () {
				voteMovie(info[i].title, true);
			});
			let downVote = document.createElement("img");
			if(crit == true){
				downVote.src = "/imgs/downFull.png";
			}else{
				downVote.src = "/imgs/downEmpty.png";
			}
			downVote.classList.add("movieVote");
	
			downVote.addEventListener("click", function () {
				voteMovie(info[i].title, false);
			});
			let scoreBox = document.createElement("DIV");
			scoreBox.innerHTML = info[i].score;
			scoreBox.classList.add("movieScore");
			
			movieBox.appendChild(movieTitle);
			movieBox.appendChild(upVote);
			movieBox.appendChild(scoreBox);
			movieBox.appendChild(downVote);
			moviesDisplay.appendChild(movieBox);
		}
	}else{
		for (let i = 0; i < info.length; i++) {
			let movieBox = document.createElement("DIV");
			movieBox.classList.add("movieBox");
	
			let movieTitle = document.createElement("DIV");
			movieTitle.innerHTML = info[i].title;
			movieTitle.classList.add("movieTitle");
			
			let scoreBox = document.createElement("DIV");
			scoreBox.innerHTML = info[i].score;
			scoreBox.classList.add("movieScore");
			
			movieBox.appendChild(movieTitle);
			movieBox.appendChild(scoreBox);
			moviesDisplay.appendChild(movieBox);
		}
	}
}


/**
 * returns currently logged in user's name
 * @returns {string}
 */
async function curUser() {
	if (checkAccountStatus() == false) {
		return null;
	}
	let curUser = auth.currentUser;
	let user = await matchingAccount(curUser.uid);
	return user[0].name;
}

/**
 * refreshes movies on movies tab to latest info in database
 */
async function refreshMovies() {
	while (moviesDisplay.lastElementChild) {
		moviesDisplay.removeChild(moviesDisplay.lastElementChild);
	}
	await displayMovies();
}

/**
 * handles all vote actions can do with movies
 * @param {string} title - title of movie being voted on
 * @param {boolean} voteDec - whether vote is an upvote
 */
async function voteMovie(title, voteDec) {
	//check that this player has not voted in the same way before,
	//if they voted differently, remove that vote, change score, and add new vote
	let name = await curUser();
	if(name == null){
		alert("sign in to vote");
		return;
	}
	let movieArr = await matchingMovies(title);
	let movie = movieArr[0];
	let supVote = searchVoters(movie.supporters, name);
	let critVote = searchVoters(movie.critics, name);
	let voted = Boolean(supVote || critVote);
	const refreshTime = 500;
	if (voted == false) {
		await newMovieVote(title, voteDec, name);
		setTimeout(refreshMovies, refreshTime);
	} else {
        let index;
        let newSupporters = movie.supporters;
        let newCritics = movie.critics;
		if (supVote != voteDec) {
			//switch votes
			if (voteDec == false) {
				index = returnIndexVoter(movie.supporters, name);
				newSupporters = movie.supporters.splice(index, 1);
				movie.critics = movie.critics.concat([name]);
			} else {
				index = returnIndexVoter(movie.critics, name);
				newCritics = movie.critics.splice(index, 1);
				movie.supporters = movie.supporters.concat([name]);
			}
			await swapMovieVote(title, movie.supporters, movie.critics);
			setTimeout(refreshMovies, refreshTime);
		} else {
            //remove original vote
            if (voteDec == false) {
				index = returnIndexVoter(movie.critics, name);
				newCritics = movie.critics.splice(index, 1);
            } else {
				index = returnIndexVoter(movie.supporters, name);
				newSupporters = movie.supporters.splice(index, 1);
			}
            await swapMovieVote(title, movie.supporters, movie.critics);
			setTimeout(refreshMovies, refreshTime);
		}
	}
}

/**
 * returns if voter is in list
 * @param {Array<string>} arr - array of voters
 * @param {string} goal - voter
 * @returns {boolean}
 */
function searchVoters(arr, goal) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == goal) {
			return true;
		}
	}
	return false;
}

/**
 * returns index of voter in list
 * @param {Array} arr - array of voters
 * @param {string} goal - voter
 * @returns {number}
 */
function returnIndexVoter(arr, goal) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == goal) {
			return i;
		}
	}
}

/**
 * updates database when user decides to flip vote on a movie with new supporters and critics
 * @param {string} movTitle - title of movie
 * @param {Array<string>} newSup - array of new supporters for movie
 * @param {Array<string>} newCrit - array of new critics for movie
 */
async function swapMovieVote(movTitle, newSup, newCrit) {
	const sfRef = doc(db, "movies", movTitle);
	try {
		await runTransaction(db, async (transaction) => {
			const sfDoc = await transaction.get(sfRef);
			let info = await sfDoc.data();
			if (!sfDoc.exists()) {
				throw "Document does not exist!";
			}
			let data = {
				euid: info.euid,
				title: info.title,
				supporters: newSup,
				critics: newCrit,
				readableTime: info.readableTime,
				score: newSup.length - newCrit.length,
			};
			transaction.update(sfRef, data);
		});
	} catch (e) {}
}

/**
 * updates database when user decides to newly vote for some movie
 * @param {string} movTitle - title of movie
 * @param {boolean} victory - whether vote is upvote
 * @param {string} name - name of user voting on movie
 */
async function newMovieVote(movTitle, victory, name) {
	const sfRef = doc(db, "movies", movTitle);
	try {
		await runTransaction(db, async (transaction) => {
			const sfDoc = await transaction.get(sfRef);
			let info = await sfDoc.data();
			if (!sfDoc.exists()) {
				throw "Document does not exist!";
			}
			let data = {
				euid: info.euid,
				title: info.title,
				supporters: info.supporters,
				critics: info.critics,
				readableTime: info.readableTime,
				score: info.score + Number(victory) * 2 - 1,
			};
			if (victory == true) {
				data.supporters = info.supporters.concat([name]);
			} else {
				data.critics = info.critics.concat([name]);
			}
			transaction.update(sfRef, data);
		});
	} catch (e) {}
}

/**
 * requests to add a new movie to database
 */
async function reqAddMovie() {
	if (checkAccountStatus() == false) {
		return;
	}
	let curUser = auth.currentUser;
	let user = await matchingAccount(curUser.uid);
	if (user.length == 0) {
		alert("not signed in");
	} else if (user.length == 1) {
		let name = user[0].name;
		let movTitle = movieInput.value;
		let movs = await matchingMovies(movTitle);
		if (movs.length == 0) {
			await addMovie(name, curUser.uid);
			await refreshMovies();
		}
	}
}

/**
 * returns array of all movies in database with matching title
 * @param {string} movTitle - title of movie
 * @returns {Array}
 */
async function matchingMovies(title) {
	const ref = collection(db, "movies");
	const q = await query(ref, where("title", "==", title));
	let temp = await getDocs(q);
	let matchingMovies = [];
	await temp.forEach((doc) => {
		let d = doc.data();
		matchingMovies = matchingMovies.concat([d]);
	});
	return matchingMovies;
}

/**
 * adds movie to database
 * @param {string} name - name of user who added movie
 * @param {string} euid - uid of user who added movie
 */
async function addMovie(name, euid) {
	let movTitle = movieInput.value;
	let data = {
		euid: euid,
		title: movTitle,
		supporters: [name],
		critics: [],
		readableTime: "" + new Date(Date.now()),
		score: 1,
	};
	await setDoc(doc(db, "movies", movTitle), data);
}

/**
 * returns array of all movies in database
 * @returns {Array}
 */
async function allMovies() {
	const ref = collection(db, "movies");
	const q = await query(ref, orderBy("score", "desc"));
	const querySnapshot = await getDocs(q);

	let completeInfo = [];
	await querySnapshot.forEach((doc) => {
		let d = doc.data();
		completeInfo = completeInfo.concat([d]);
	});
	return completeInfo;
}

/**
 * displays table of matches selected player has played in visual tab
 */
async function displayMatches() {
	let info = await getPlayer(gamesPerson.value);
	let oppInfo = {};
	for (let i = 0; i < info.gamesPlayed; i++) {
		if (oppInfo[info.opponents[i]] == null) {
			oppInfo[info.opponents[i]] = await getPlayer(info.opponents[i]);
		}
	}
	await makePastGameTable(info, oppInfo);
}

let canvas = document.getElementById("myCanvas");

let ctx = canvas.getContext("2d");

/**
 * clears the context of the canvas inputed
 * @param {object} ct - canvas context to clear
 * @param {object} canv - canvas to clear
 */
function clearGraph(ct, canv) {
	ct.clearRect(0, 0, canv.width, canv.height);
}

/**
 * plots the points of the selected player's elo over their games played
 */
async function plotPoints() {
	let info = await getPlayer(gamesPerson.value);

	let colors = ["#FF0000", "#00FF00", "#0000FF", "#F000F0", "#00F0F0"];
	let numPoints = info.gamesPlayed + 1;
	let r = 5;
	let points = [];
	let x;
	let y;

	let border = 0.1;
	let xDif = (canvas.width / numPoints) * (1 - border);
	let minY = 20000;
	let maxY = 0;
	for (let i = 0; i < numPoints; i++) {
		if (info.elo[i] > maxY) {
			maxY = info.elo[i];
		}
		if (info.elo[i] < minY) {
			minY = info.elo[i];
		}
	}
	let yScale = canvas.height * (1 - border);

	for (let i = 0; i < numPoints; i++) {
		// x = Math.random()*(canvas.width-r) + r;
		// y = Math.random()*(canvas.height-r) + r;
		x = i * xDif + canvas.width * border * 0.5;
		y =
			canvas.height * (1 - border / 2) -
			((info.elo[i] - minY) / (maxY - minY)) * yScale;
		let c = colors[Math.floor(Math.random() * colors.length)];
		points.push([x, y, c, info.elo[i]]);
	}
	//drawing lines
	for (let i = 1; i < numPoints; i++) {
		let x2 = points[i][0];
		let y2 = points[i][1];
		let x1 = points[i - 1][0];
		let y1 = points[i - 1][1];
		drawLin(ctx, x1, y1, x2, y2, "#000000", 5);
	}
	//drawing circles/text
	for (let i = 0; i < numPoints; i++) {
		let x2 = points[i][0];
		let y2 = points[i][1];
		let c = points[i][2];
		drawTex(ctx, x2 - 2 * r, y2 - 2 * r, points[i][3]);
		drawCirc(ctx, x2, y2, r, c);
	}
}

/**
 * draws circle of given size, color, and position to given canvas
 * @param {object} ct - context of canvas to draw circle to
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
 * @param {object} ct - context of canvas to draw line to
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
 * @param {object} ct - context of canvas to draw text to
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
 * @param {object} canvas - canvas to draw rectangle to
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
 * @param {object} ct - context of canvas to draw rectangle to
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
 * @param {object} info - all information about selected player's games
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
			userDisplayText.innerHTML = "Signed in as : ---";
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
 * @param {object} info - information of a pending game
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
 * @returns {object}
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
 * @returns {object}
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

/**
 * returns array of every player's info in descending order of elo
 * @returns {object}
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

/**
 * add a match request to the database based off of the selections
 */
async function makeMatchRequest() {
	//fix this, shouldn't determine requester and opponent off of selection boxes
	let name1 = s1.value;
	let name2 = s2.value;

	if (name1 == name2) {
		return;
	}
	let curUser = auth.currentUser;

	if (checkAccountStatus() == false) {
		return;
	}
	let tempPlayer1 = await getPlayer(name1);
	let tempPlayer2 = await getPlayer(name2);

	if (
		(curUser.uid == tempPlayer1.euid || curUser.uid == tempPlayer2.euid) ==
		false
	) {
		return;
	}

	let checkOption = document.querySelector('input[name="Rwinner"]:checked');//update with name of person
	let v1 = checkOption.value;

	let vP = "schmuck";

	if (curUser.uid == tempPlayer1.euid) {
		if (v1 == "aWinner") {
			v1 = true;
			vP = name1;
		} else {
			v1 = false;
			vP = name2;
		}
	} else {
		//if person who is signed in and requesting a game is the second person in the selection boxes, do :
		name1 = s2.value;
		name2 = s1.value;

		if (v1 == "aWinner") {
			v1 = false;
			vP = name1;
		} else {
			v1 = true;
			vP = name2;
		}
		// v1 = !v1;
	}

	//make the requester and opponent values actually reflect requester and opponent
	let dbInfo = {
		requester: name1,
		opponent: name2,
		time: Date.now(),
		readableTime: "" + new Date(Date.now()),
		requesterWin: v1,
	};
	let requestId = await addGameRequest(dbInfo);
	let boxInfo = {
		name1: name1,
		name2: name2,
		v1: v1,
		readableTime: "" + new Date(Date.now()),
		requestId: requestId,
	};
	makeHTMLRequestBox(boxInfo);
	getRequests();
	// signOutUser();
}

/**
 * returns whether emailString is a cornell email
 * @param {string} emailString - string of email 
 * @returns {boolean}
 */
function checkCornell(emailString) {
	return Boolean(emailString.indexOf("@cornell.edu") > -1);
}

/**
 * resolves match request
 * @param {object} reqBox - request box user clicked on
 * @param {boolean} approve - whether user accepted request
 */
async function resolveMatchRequest(reqBox, approve) {
	let reqInfo = await getRequest(reqBox.dataset.id);
	if (checkAccountStatus() == false) {
		displayUserInfo.innerHTML = "log in to resolve request";
		alert("log in to resolve request");
		return;
	}
	let curUser = auth.currentUser;
	//if approving game then person must be opponent
	if (approve == true) {
		// let p1Info = await getPlayer(reqInfo.requester);
		let p2Info = await getPlayer(reqInfo.opponent);
		if (p2Info.euid == curUser.uid) {
			await formalizeMatch(reqInfo);
			await removeGameRequest(reqBox.dataset.id);
			reqBox.remove();
		} else {
			displayUserInfo.innerHTML = "need to be opponent to accept";
			alert("need to be opponent to accept");
			return;
		}
	} else {
		//if disapproving game then person can only be either opponent or requester
		let p1Info = await getPlayer(reqInfo.requester);
		let p2Info = await getPlayer(reqInfo.opponent);
		if (p1Info.euid == curUser.uid || p2Info.euid == curUser.uid) {
			await removeGameRequest(reqBox.dataset.id);
			reqBox.remove();
		} else {
			displayUserInfo.innerHTML =
				"need to be either opponent or requester to reject request";
			alert("need to be either opponent or requester to reject request")
		}
		// getRequests();
	}
}

/**
 * makes a html element from the data in info object
 * @param {object} info - contains the information for request box
 */
function makeHTMLRequestBox(info) {
	let requestChannel = document.getElementById("inputRequests");
	let rBox = document.createElement("div");
	rBox.classList.add("requestBox", "paper");
	let vP;
	if (info.v1 == true) {
		vP = info.name1;
	} else {
		vP = info.name2;
	}
	rBox.innerHTML =
		"Request to add game between " +
		info.name1 +
		" and " +
		info.name2 +
		" where " +
		vP +
		" won on : " +
		info.readableTime;
	rBox.dataset.id = info.requestId;

	rBox.append(document.createElement("br"));

	let tempBigDiv = document.createElement("div");

	let accept = document.createElement("div");
	accept.classList.add("acceptButton");
	accept.innerHTML = "ACCEPT";

	//make accept button
	accept.addEventListener("click", function () {
		resolveMatchRequest(rBox, true);
	});
	tempBigDiv.append(accept);

	let reject = document.createElement("div");
	reject.classList.add("rejectButton");
	reject.innerHTML = "REJECT";

	//make reject button
	reject.addEventListener("click", function () {
		resolveMatchRequest(rBox, false);
	});

	tempBigDiv.append(reject);
	tempBigDiv.classList.add("buttonGroup");


	rBox.append(tempBigDiv);

	requestChannel.append(rBox);
}

/**
 * adds new player to database
 */
async function requestPlayer() {
	let name = newP.value;
	let curUser = auth.currentUser;
	if (curUser !== null) {
		let euid = curUser.uid;
		if ((await getPlayer(name)) == -1) {
			let matchingAccounts = await matchingAccount(euid);
			if (matchingAccounts.length == 0) {
				await addPlayer(name, euid);
				getScores();
			} else {
				displayUserInfo.innerHTML =
					"account with this email already exists";
				alert("account with this email already exists");
			}
		} else {
			displayUserInfo.innerHTML = "player with this name already exists";
			alert("player with this name already exists");
		}
	} else {
		displayUserInfo.innerHTML = "NOT SIGNED IN, LOG IN TO JOIN";
		alert("NOT SIGNED IN, LOG IN TO JOIN");
	}
}

/**
 * turns match request into official match
 * @param {object} startInfo - request box info for submitting games
 */
async function formalizeMatch(startInfo) {
	let p1Info = await getPlayer(startInfo.requester);
	let p2Info = await getPlayer(startInfo.opponent);

	let ra = p1Info.currentElo * 1.0;
	let rb = p2Info.currentElo * 1.0;

	let qa = 10 ** (ra / d);
	let qb = 10 ** (rb / d);

	let ea = qa / (qa + qb);
	let eb = qb / (qa + qb);

	let sa;
	let sb;

	if (startInfo.requesterWin == true) {
		sa = 1;
		sb = 0;
	} else {
		sa = 0;
		sb = 1;
	}
	let rea = Math.round(ra + k * (sa - ea));
	let reb = Math.round(rb + k * (sb - eb));

	matchUp(
		startInfo.requester,
		startInfo.opponent,
		startInfo.requesterWin,
		rea,
		reb,
		startInfo.time,
		startInfo.readableTime
	);
	getScores();
}

/**
 * loads all player options into selecting options
 */
async function loadMatchUpPlayers() {
	let allPlayerInfo = await eloRankedDocs();
	let numPlayers = allPlayerInfo.length;
	for (let i = 0; i < numPlayers; i++) {
		let tempOption = document.createElement("option");
		tempOption.text = allPlayerInfo[i].name;
		s1.add(tempOption.cloneNode(true));
		s2.add(tempOption.cloneNode(true));
		personID.add(tempOption.cloneNode(true));
		gamesPerson.add(tempOption.cloneNode(true));
	}
}

/**
 * fill table with scores of all players in descending elo order
 */
async function getScores() {
	let t1 = document.getElementById("scoreTable");
	t1.remove();
	let tempTable = document.createElement("TABLE");
	tempTable.id = "scoreTable";
	let header = tempTable.createTHead();
	let firstRow = header.insertRow(0);
	firstRow.insertCell(0).innerHTML = "Name";
	firstRow.insertCell(-1).innerHTML = "Elo";
	firstRow.insertCell(0).innerHTML = "Rank";
	firstRow.insertCell(-1).innerHTML = "Win %";
	firstRow.insertCell(-1).innerHTML = "Total Games    ";
	firstRow.insertCell(-1).innerHTML = "Last Game";

	let allPlayerInfo = await eloRankedDocs();
	let numPlayers = allPlayerInfo.length;

	for (let i = 0; i < numPlayers; i++) {
		let tempRow = tempTable.insertRow(-1);
		let tempPlayer = allPlayerInfo[i];
		let tempName = tempPlayer.name;
		let tempElo = tempPlayer.currentElo;
		tempRow.insertCell(0).innerHTML = tempName;
		tempRow.insertCell(-1).innerHTML = "" + tempElo;
		tempRow.insertCell(0).innerHTML = i + 1;
		if(tempPlayer.gamesPlayed > 0){
			tempRow.insertCell(-1).innerHTML =
				"" +
				Math.floor(100 * (tempPlayer.wins / tempPlayer.gamesPlayed)) +
				"%";
		}else{
			tempRow.insertCell(-1).innerHTML = "---";
		}
		tempRow.insertCell(-1).innerHTML = tempPlayer.gamesPlayed;

		tempRow.insertCell(-1).innerHTML = cleanDate(
			tempPlayer.readableTime[tempPlayer.readableTime.length - 1]
		);
	}
	scores.appendChild(tempTable);
}

/**
 * make htmlRequestBoxes for each gameRequest in database
 */
async function getRequests() {
	let requestChannel = document.getElementById("inputRequests");
	requestChannel.remove();

	let tempChannel = document.createElement("DIV");
	tempChannel.id = "inputRequests";
	requestParent.append(tempChannel);

	let allRequestInfo = await requestDocs();

	let numRequests = allRequestInfo.length;

	for (let i = 0; i < numRequests; i++) {
		let simpleInfo = {
			name1: allRequestInfo[i].requester,
			name2: allRequestInfo[i].opponent,
			v1: allRequestInfo[i].requesterWin,
			readableTime: cleanDate(allRequestInfo[i].readableTime),
			requestId: allRequestInfo[i].id,
		};
		makeHTMLRequestBox(simpleInfo);
	}
}

/**
 * returns cleaned date string
 * @param {string} dateString - string of date 
 * @returns {string}
 */
function cleanDate(dateString) {
	let i = dateString.indexOf("GMT");
	return dateString.slice(0, i - 1);
}

let wormRunApp = null;
let wormFleet = null;

let wormCanvas = document.getElementById("wormCanvas");
let ctxW = wormCanvas.getContext("2d");
const wormWidth = wormCanvas.width;
const wormHeight = wormCanvas.height;

let wormCounter = 0;

let randomize = document.getElementById("randomSpecs");

let aLabel = document.getElementById("alignLabel");
let aSlider = document.getElementById("align");
const alMult = 0.5;
let alConst = aSlider.value * alMult;

let sLabel = document.getElementById("sepLabel");
let sSlider = document.getElementById("seperate");
const sepMult = 0.01;
let sepConst = sSlider.value * sepMult;

let cLabel = document.getElementById("cohesLabel");
let cSlider = document.getElementById("cohes");
const coMult = 0.01;
let coConst = cSlider.value * coMult;

let accLabel = document.getElementById("accelLabel");
let accSlider = document.getElementById("accel");
const accelMult = 0.075;
let accelConst = accSlider.value * accelMult;

let pLabel = document.getElementById("percLabel");
let percSlider = document.getElementById("rangeRange");
const percMult = 4;
let percConst = percSlider.value * percMult;

let percChecked = document.getElementById("rangeCheck");
let treeChecked = document.getElementById("qTree");

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
	 * @param {object} ct - context of canvas
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
	 * @param {object} ct - context of canvas to draw appendage to
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
	 * @param {object} ct - context for canvas for drawing appendages
	 * @param {object} canv - canvas for drawing appendages
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
	 * creates Quadtree object
	 * @param {object} par - parent of quadTree
	 * @param {number} index - index of which of quadrants this quadtree inhabits
	 * @param {Array<Appendage>} els - array of appendages inside this quadtree
	 * @param {number} maxWidth - width of biggest parent quadTree
	 * @param {number} maxHeight - height of biggest parent quadTree
	 * @param {object} ct - context of canvas to draw quadTree on
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
			// console.log(currentNeighborState);
			// console.log(this.arrayTemplateConnections);
			let currentNeighborTile = this.arrayTemplateConnections[currentNeighborState];
			// console.log(currentNeighborTile);
			let stringNeighborConnections = currentNeighborTile[dir].split("");
			// console.log(stringNeighborConnections);
			let rStringNeighborConnections = stringNeighborConnections.reverse();
			// console.log(rStringNeighborConnections);
			let side = rStringNeighborConnections.join("");
			// console.log(side);
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
			// console.log(adjSide);
			let curState = currentStates[i];
			// console.log(curState);//1
			let curConn = this.arrayTemplateConnections[curState];//does this makes sense
			// console.log(curConn);//['111', '111', '111', '101']
			let singleSide = curConn[adjSide];
			// console.log(singleSide);//"101"
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
	 * initializes template cell images into Image objects
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
		 * array of vectors from user to objects
		 * @type {Array<Vector>} */
		this.lookVs = [];
		/**
		 * array of colors for borders to draw
		 * @type {Array<Array>} */
		this.objectColors = [];
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
	 * returns border object in direction of angle and rayLen long
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
 * object for whole game tab
 */
//consider removing "game" moniker of everything now that its inside game object
class Game{
	/**
	 * 2d/3d game object
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
	 * checks intersections between rays and all objects on screen
	 */
	checkIntersections(){
		this.user.lookVs = [];
		this.user.objectColors = [];
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
				this.user.objectColors.push(intersectingPoints[closestIndex][3]);
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
	 * draws rectangles on right game canvas corresponding to object hit on left game screen
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
	
			let rectColor = this.user.objectColors[i];
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

/**@type {Game}*/
let game = new Game(gameLeftCanvas, gameLeftCanvasContext, 
	gameRightCanvas, gameRightCanvasContext);

getScores();
getRequests();
loadMatchUpPlayers();

procBoard.firstInitProc();
