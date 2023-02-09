//firebase deploy --only hosting,database,firestore

//elo decay baed on elo

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

let userDisplay = document.getElementById("userDisplay");

let personID = document.getElementById("h1");
let addIDButton = document.getElementById("subID");
addIDButton.addEventListener("click", addID);

let displayUserInfo = document.getElementById("displayInfo");

let mainButton = document.getElementById("main");
mainButton.addEventListener("click", function () {
	showTab("mainContent");
});

let visualButton = document.getElementById("visual");
visualButton.addEventListener("click", function () {
	showTab("visualContent");
});

let movieButton = document.getElementById("movie");
movieButton.addEventListener("click", function () {
	showTab("movieContent");
});

let wormButton = document.getElementById("worms");
wormButton.addEventListener("click", function () {
	showTab("wormContent");
});

let procButton = document.getElementById("proc");
procButton.addEventListener("click", function () {
	showTab("procContent");
});

let gameButton = document.getElementById("game");
gameButton.addEventListener("click", function () {
	showTab("gameContent");
});

let mainContent = document.getElementById("mainContent");
let visualContent = document.getElementById("visualContent");
let movieContent = document.getElementById("movieContent");
let wormContent = document.getElementById("wormContent");
let procContent = document.getElementById("procContent");
let gameContent = document.getElementById("gameContent");

let timeButton = document.getElementById("timeSend");
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
	signInWithRedirect,
	getRedirectResult,
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

async function askForSignIn() {
	signInWithRedirect(auth, provider);
}

const thing =
	"244570148069-6is73a7sohagu36v3bhov3s3at1hluvp.apps.googleusercontent.com";

async function displayMovies() {
	const name = await curUser();
	let info = await allMovies();
	for (let i = 0; i < info.length; i++) {
		let movieBox = document.createElement("DIV");
        movieBox.classList.add("movieBox");

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
}

async function curUser() {
	if (checkAccountStatus() == false) {
		return;
	}
	let curUser = auth.currentUser;
	let user = await matchingAccount(curUser.uid);
	return user[0].name;
}

async function refreshMovies() {
	while (moviesDisplay.lastElementChild) {
		moviesDisplay.removeChild(moviesDisplay.lastElementChild);
	}
	await displayMovies();
}

async function voteMovie(title, voteDec) {
	//check that this player has not voted in the same way before,
	//if they voted differently, remove that vote, change score, and add new vote
	let name = await curUser();
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

function searchVoters(arr, goal) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == goal) {
			return true;
		}
	}
	return false;
}

function returnIndexVoter(arr, goal) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == goal) {
			return i;
		}
	}
}

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
		}
	}
}

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

function clearGraph(ct, canv) {
	ct.clearRect(0, 0, canv.width, canv.height);
}

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

function drawCirc(canv, x, y, r, c) {
	canv.fillStyle = c;
	canv.beginPath();
	canv.arc(x, y, r, 0, 2 * Math.PI);
	canv.fill();
}

function drawLin(ct, x1, y1, x2, y2, c, w) {
	ct.strokeStyle = c;
	ct.lineWidth = w;
	ct.lineCap = "round";
	ct.beginPath();
	ct.moveTo(x1, y1);
	ct.lineTo(x2, y2);
	ct.stroke();
}

function drawTex(ct, x, y, text, c) {
	ct.font = "12px Georgia";
	ct.fillStyle = "#000000";
	ct.fillText(text, x, y);
}

function drawSRect(canv, x, y, w, h, c) {
	canv.lineWidth = 1;
	canv.strokeStyle = c;
	canv.strokeRect(x, y, w, h);
}

function drawFRect(ct, x, y, w, h, c) {
	ct.fillStyle = c;
	ct.fillRect(x, y, w, h);
}

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

function initSpec(key) {
	if (key == "wormContent") {
		initWorms();
	} else if (key == "procContent") {
		initProc();
	} else if (key == "movieContent") {
		refreshMovies();
	}
}
function hideAll(key) {
	if (key != "wormContent") {
		hideWorms();
	}
	if (key != "procContent") {
		hideProc();
	}
}

async function addID() {
	let name = personID.value;
	//if logged in
	if (checkAccountStatus() == false) {
		displayUserInfo.innerHTML = "no one signed in";
		return;
	}
	let curUser = auth.currentUser;
	let curMatchingUsers = await matchingAccount(curUser.uid);

	if (curMatchingUsers.length > 0) {
		displayUserInfo.innerHTML = "Player with this email already exists";
		return;
	}

	let curPlayerInfo = await getPlayer(name);
	if (curPlayerInfo.euid != null) {
		displayUserInfo.innerHTML = "Player already has associated email";
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
	} catch (e) {}
}

async function checkAccountStatus() {
	let curUser = auth.currentUser;
	if (curUser !== null) {
		return checkCornell(curUser.email);
	} else {
		return false;
	}
}

async function signOutUser() {
	signOut(auth)
		.then(() => {
			// Sign-out successful.

			userDisplay.innerHTML = "Signed in as : ---";
		})
		.catch((error) => {
			// An error happened.
		});
}

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

async function addGameRequest(info) {
	const docRef = await addDoc(collection(db, "pendingGames"), info);

	return docRef.id;
}

async function removeGameRequest(id) {
	await deleteDoc(doc(db, "pendingGames", id));
}

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

// async function updateOpponents(name, opponents){
//     const sfRef = doc(db, "playerInfo", name);
//     try {
//         await runTransaction(db, async (transaction) => {
//           const sfDoc = await transaction.get(sfRef);
//           let info = await sfDoc.data();
//           if (!sfDoc.exists()) {
//             throw "Document does not exist!";
//           }

//           let data = {
//             opponents: opponents
//           };

//           transaction.update(sfRef, data);
//         });

//       } catch (e) {

//       }
// }

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

function matchUp(name1, name2, v1, elo1, elo2, t, tr) {
	updatePlayer(name1, elo1, v1, t, tr, name2);
	updatePlayer(name2, elo2, !v1, t, tr, name1);
}

// async function allDocsOfPerson(name){
//   const q = query(collection(db, "playerInfo"), where("name", "==", name));
//   const querySnapshot = await getDocs(q);

//   return querySnapshot.docs;
// }

// async function allDocs(){
//   const querySnapshot = await getDocs(collection(db, "playerInfo"));
//   let completeInfo = [];
//   await querySnapshot.forEach((doc) => {
//     let d = doc.data();
//     d.name = doc.id;
//     completeInfo = completeInfo.concat([d]);
//   });
//   return completeInfo;
// }

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

		const uid = user.uid;
		signInButton.style.display = "none";
		signOutButton.style.display = "inline";

		userDisplay.innerHTML = "Signed in as : " + user.displayName;
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

	let checkOption = document.querySelector('input[name="Rwinner"]:checked');
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

function checkCornell(emailString) {
	return Boolean(emailString.indexOf("@cornell.edu") > -1);
}

async function resolveMatchRequest(reqBox, approve) {
	let reqInfo = await getRequest(reqBox.dataset.id);
	if (checkAccountStatus() == false) {
		displayUserInfo.innerHTML = "log in to resolve request";
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
		}
		// getRequests();
	}
}

function makeHTMLRequestBox(info) {
	let requestChannel = document.getElementById("inputRequests");
	let rBox = document.createElement("div");
	rBox.classList.add("requestBox");
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

// function makePlayerRequest(name){
//     let rBox = document.createElement("div");
//     rBox.classList.add("requestBox");
//     rBox.dataset.name = name;
//     rBox.innerHTML = "Please add : " + name;
//     requestChannel.append(rBox);
// }

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
			}
		} else {
			displayUserInfo.innerHTML = "player with this name already exists";
		}
	} else {
		displayUserInfo.innerHTML = "NOT SIGNED IN, LOG IN TO JOIN";
	}
}

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

// async function requestMatch(){
//     let p1Info = await getPlayer(s1.value);
//     let p2Info = await getPlayer(s2.value);

//     let ra = p1Info.currentElo * 1.0;;
//     let rb = p2Info.currentElo * 1.0;

//     let qa = 10. ** (ra/d);
//     let qb = 10. ** (rb/d);

//     let ea = qa / (qa + qb);
//     E1.innerHTML = Math.round(1000*ea)/10. + "%";
//     let eb = qb / (qa + qb);
//     E2.innerHTML = Math.round(1000*eb)/10. + "%";
//     let checkOption = document.querySelector('input[name="Rwinner"]:checked');

//     let winner = checkOption.value;
//     let sa;
//     let sb;

//     let winBool;
//     if(winner == "aWinner"){
//         winBool = true;
//     } else{
//         winBool = false;
//     }

//     if(winBool == true){
//         sa = 1.;
//         sb = 0.;

//     }else{
//         sa = 0.;
//         sb = 1.;

//     }
//     let rea = Math.round(ra + (k * (sa - ea)));
//     let reb = Math.round(rb + k * (sb - eb));

//     matchUp(s1.value, s2.value, winBool, rea, reb);
//     getScores();

// }

// async function testMatch(){

//     let p1Info = await getPlayer(p1.value);
//     let p2Info = await getPlayer(p2.value);

//     let ra = p1Info.currentElo * 1.0;
//     let rb = p2Info.currentElo * 1.0;

//     let qa = 10. ** (ra/d);
//     let qb = 10. ** (rb/d);

//     let ea = qa / (qa + qb);
//     ME1.innerHTML = Math.round(1000*ea)/10. + "%";
//     let eb = qb / (qa + qb);
//     ME2.innerHTML = Math.round(1000*eb)/10. + "%";

// }

async function loadMatchUpPlayers() {
	let allPlayerInfo = await eloRankedDocs();
	let numPlayers = allPlayerInfo.length;
	for (let i = 0; i < numPlayers; i++) {
		let tempOption = document.createElement("option");
		tempOption.text = allPlayerInfo[i].name;
		// p1.add(tempOption);
		// p2.add(tempOption.cloneNode(true));
		s1.add(tempOption.cloneNode(true));
		s2.add(tempOption.cloneNode(true));
		personID.add(tempOption.cloneNode(true));
		gamesPerson.add(tempOption.cloneNode(true));
	}
}

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
	firstRow.insertCell(-1).innerHTML = "Total Games";
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
		tempRow.insertCell(-1).innerHTML =
			"" +
			Math.floor(100 * (tempPlayer.wins / tempPlayer.gamesPlayed)) +
			"%";
		tempRow.insertCell(-1).innerHTML = tempPlayer.gamesPlayed;

		tempRow.insertCell(-1).innerHTML = cleanDate(
			tempPlayer.readableTime[tempPlayer.readableTime.length - 1]
		);
	}
	// t1 = tempTable;
	scores.appendChild(tempTable);
	// scores = tempTable;
}

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

function cleanDate(dateString) {
	let i = dateString.indexOf("GMT");
	return dateString.slice(0, i - 1);
}

let wormRunApp = null;
let wormFleet;
let root;

let wormCanvas = document.getElementById("wormCanvas");
let ctxW = wormCanvas.getContext("2d");
const wormWidth = wormCanvas.width;
const wormHeight = wormCanvas.height;

let wormCounter = 0;

let randomize = document.getElementById("randomSpecs");

let aLabel = document.getElementById("alignLabel");
let aSlider = document.getElementById("align");
const alMult = 0.1;
let alConst = aSlider.value * alMult;

let sLabel = document.getElementById("sepLabel");
let sSlider = document.getElementById("seperate");
const sepMult = 0.1;
let sepConst = sSlider.value * sepMult;

let cLabel = document.getElementById("cohesLabel");
let cSlider = document.getElementById("cohes");
const coMult = 0.1;
let coConst = cSlider.value * coMult;

let accLabel = document.getElementById("accelLabel");
let accSlider = document.getElementById("accel");
const accelMult = 0.15;
let accelConst = accSlider.value * accelMult;

let pLabel = document.getElementById("percLabel");
let percSlider = document.getElementById("rangeRange");
const percMult = 4;
let percConst = percSlider.value * percMult;

let percChecked = document.getElementById("rangeCheck");
let treeChecked = document.getElementById("qTree");

function refreshSValues() {
	alConst = aSlider.value * alMult;
	sepConst = sSlider.value * sepMult;
	coConst = cSlider.value * coMult;
	accelConst = accSlider.value * accelMult;
	percConst = percSlider.value * percMult;

	aLabel.innerHTML = "Align : " + aSlider.value;
	sLabel.innerHTML = "Seperation : " + sSlider.value;
	cLabel.innerHTML = "Cohesion : " + cSlider.value;
	accelLabel.innerHTML = "Acceleration : " + accSlider.value;
	percLabel.innerHTML = "Perception : " + percSlider.value;
}

function randomizeWormSpecs() {
	aSlider.value = Math.random() * (aSlider.max - aSlider.min) + aSlider.min;
	sSlider.value = Math.random() * (sSlider.max - sSlider.min) + sSlider.min;
	cSlider.value = Math.random() * (cSlider.max - cSlider.min) + cSlider.min;
	accSlider.value =
		Math.random() * (accSlider.max - accSlider.min) + accSlider.min;
	percSlider.value =
		Math.random() * (percSlider.max - percSlider.min) + percSlider.min;
}

function subV(final, initial) {
	return new Vector(final.x - initial.x, final.y - initial.y);
}

function addV(i, f) {
	return new Vector(i.x + f.x, i.y + f.y);
}

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.length = this.mag();
	}

	rotateTo(angle) {
		this.x = Math.cos(angle) * this.length;
		this.y = Math.sin(angle) * this.length;
	}

	rotateBy(angle) {
		this.x = Math.cos(angle) * this.length;
		this.y = Math.sin(angle) * this.length;
	}

	add(v) {
		this.x = this.x + v.x;
		this.y = this.y + v.y;
		this.length = this.mag();
	}

	mag() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	setMag(len) {
		this.x = (this.x * len) / this.length;
		this.y = (this.y * len) / this.length;
		if (this.length == 0) {
		}
		this.length = len;
	}

	multMag(len) {
		this.x = this.x * len;
		this.y = this.y * len;
		this.length = this.length * len;
	}

	copy() {
		return new Vector(this.x, this.y);
	}

	normal() {
		return new Vector(this.x / this.length, this.y / this.length);
	}
}

class Segment {
	constructor() {}

	init2Pos(pos1, pos2, width) {
		this.pos1 = pos1;
		this.pos2 = pos2;
		this.dir = subV(pos2, pos1);

		this.length = this.dir.mag();
		this.width = width;
		this.angle = Math.atan2(this.dir.y, this.dir.x);
		return this;
	}

	initDir(pos1, dir, width) {
		this.pos1 = pos1;
		this.dir = dir;
		this.pos2 = addV(pos1, dir);

		this.width = width;
		this.angle = Math.atan2(this.dir.y, this.dir.x);
		this.length = dir.mag();
		return this;
	}

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

	rotate(angle) {
		this.dir.rotateTo(angle);
		this.angle = Math.atan2(this.dir.y, this.dir.x);
		this.pos2 = addV(this.pos1, this.dir);
	}

	moveT(endPos) {
		this.pos1 = endPos;
		this.pos2 = addV(this.pos1, this.dir);
	}
	moveH(endPos) {
		this.pos2 = endPos;
		this.pos1 = subV(this.pos2, this.dir);
	}

	follow(targetPos) {
		let temp = subV(targetPos, this.pos1);
		let angle = Math.atan2(temp.y, temp.x);
		this.rotate(angle);

		this.moveH(targetPos);
	}

	draw() {
		drawLin(
			ctxW,
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
	constructor(numSegs, id) {
		this.segments = [];
		this.velocity = new Vector(
			Math.random() * 2 - 1,
			Math.random() * 2 - 1
		);
		this.velocity.multMag(3);
		this.acceleration = new Vector(0, 0);
		let segLen = 10;
		this.fullLen = numSegs * segLen * 1.3;
		this.id = id;
		for (let i = 0; i < numSegs; i++) {
			let x = 0.1 * wormWidth + Math.random() * wormWidth * 0.8;
			// let x = Width/2;
			let y = 0.1 * wormHeight + Math.random() * wormHeight * 0.8;
			// let y = Height/2;
			let posT = new Vector(x, y);
			let posH = new Vector(x + segLen, y + segLen);
			this.segments.push(new Segment().init2Pos(posT, posH, i / 2 + 2));
		}
		this.head = this.segments[this.segments.length - 1];
	}

	collision() {
		let end = this.segments[this.segments.length - 1];
		if (end.pos2.x > wormWidth + this.fullLen) {
			end.moveH(new Vector(-this.fullLen, end.pos2.y));
		} else if (end.pos2.x < -this.fullLen) {
			end.moveH(new Vector(wormWidth + this.fullLen, end.pos2.y));
		}

		if (end.pos2.y > wormHeight + this.fullLen) {
			end.moveH(new Vector(end.pos2.x, -this.fullLen));
		} else if (end.pos2.y < -this.fullLen) {
			end.moveH(new Vector(end.pos2.x, wormHeight + this.fullLen));
		}
	}

	applyForce(force) {
		this.acceleration = addV(this.acceleration, force);
		if (this.acceleration.length > accelConst) {
			this.acceleration.setMag(accelConst);
		}
	}

	trail() {
		let maxSpeed = 20;
		let minSpeed = 10;
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

	follow(targetPos) {
		let pos = targetPos;
		for (let i = this.segments.length - 1; i >= 0; i--) {
			this.segments[i].follow(pos);
			pos = this.segments[i].pos1.copy();
		}
	}

	draw() {
		//redudant since joints for each segment are drawn twice
		//also change all segments[segments.length-1] with .head

		for (let i = 0; i < this.segments.length; i++) {
			this.segments[i].draw();
		}
	}

	update() {
		this.collision();
		this.trail();
		this.draw();
	}
}

class Fleet {
	constructor(numAgents, numSegs) {
		this.Apps = [];
		for (let i = 0; i < numAgents; i++) {
			this.Apps.push(new Appendage(numSegs, i));
		}
	}

	returnPoints() {
		let els = [];
		for (let i = 0; i < this.Apps.length; i++) {
			els.push(this.Apps[i].head.pos2);
		}
		return els;
	}

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

			avDir.multMag(sepConst);
			let sepSteer = subV(avDir, curApp.velocity);

			let drawAvDir = addV(curApp.head.pos2, avDir);

			totalForce.add(sepSteer);

			avPos.multMag(1 / nearbyApps.length);

			let coh = subV(avPos, curApp.head.pos2);
			coh.multMag(coConst);
			let cohSteer = subV(coh, curApp.velocity);

			let drawCoh = addV(curApp.head.pos2, coh);

			totalForce.add(cohSteer);

			avDir1 = avDir1.normal();
			let temp = curApp.velocity.normal(); // maybe change to dir
			let align = subV(avDir1, temp);

			align.multMag(alConst);

			let alignSteer = subV(align, curApp.velocity);
			let drawAlign = addV(curApp.head.pos2, align);

			totalForce.add(alignSteer);

			curApp.applyForce(totalForce);
		}
	}

	getNearby(app) {
		let nearby = [];
		let range = percConst;

		let tempRoot = root.search(app.head.pos2);
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

	update() {
		this.flock();
		for (let i = 0; i < this.Apps.length; i++) {
			let a = this.Apps[i];
			a.update();
		}
	}
}

class Quad {
	constructor(par, index, els) {
		if (par == "root") {
			this.parent = null;
			this.corner = new Vector(0, 0);
			this.width = wormWidth;
			this.height = wormHeight;
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

	//returns smallest quad tree with point in it
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

	draw() {
		drawSRect(
			ctxW,
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

	allocate() {
		let els = [[], [], [], []];
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
			this.kids.push(new Quad(this, i, els[i]));
		}
	}

	checkInside(p) {
		return (
			p.x > this.corner.x &&
			p.x < this.corner.x + this.width &&
			p.y > this.corner.y &&
			p.y < this.corner.y + this.height
		);
	}

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
	//if square intersects this quad
	intersect(pos, w, h) {
		return !(
			this.corner.x > pos.x + w ||
			this.corner.x + this.width < pos.x ||
			this.corner.y > pos.y + h ||
			this.corner.y + this.height < pos.y
		);
	}
	//if rect is completely within quad
	totallyWithin(corner, w, h) {
		return (
			corner.x > this.corner.x &&
			corner.x + w < this.corner.x + this.width &&
			corner.y > this.corner.y &&
			corner.y + h < this.corner.y + this.height
		);
	}

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

function initWorms() {
	wormRunApp = setInterval(updateWorms, 100);
	wormFleet = new Fleet(300, 5);
	root = new Quad("root", null, wormFleet.Apps);
	wormCounter = 0;
}

function updateWorms() {
	clearGraph(ctxW, wormCanvas);
	root = new Quad("root", null, wormFleet.Apps);
	if (treeChecked.checked) {
		root.draw();
	}
	refreshSValues();
	wormCounter += 1;
	if (randomize.checked && wormCounter % (10 * 5) == 0) {
		randomizeWormSpecs();
	}
	wormFleet.update();
}

function hideWorms() {
	clearInterval(wormRunApp);
	wormRunApp = null;
	wormFleet = null;
	root = null;
}

let procCanvas = document.getElementById("procCanvas");
let ctxP = procCanvas.getContext("2d");
const procWidth = procCanvas.width;
const procHeight = procCanvas.height;

let colSlider = document.getElementById("procCol");
let colSliderLabel = document.getElementById("procColLabel");

let rowSlider = document.getElementById("procRow");
let rowSliderLabel = document.getElementById("procRowLabel");

let procReset = document.getElementById("procReset");
procReset.addEventListener("click", initProc);

let conns1 = {
	end: ["111", "111", "101", "111"],
	floor: ["000", "000", "000", "000"],
	hallway: ["111", "101", "101", "101"],
	intersection: ["101", "101", "101", "101"],
	tintersection: ["111", "101", "101", "101"],
	wall: ["111", "111", "111", "111"],
	entry: ["111", "000", "111", "101"],
	diagonal: ["111", "000", "000", "111"],
	corner: ["111", "101", "101", "111"]
};

let cells = [];
let finished = false;
let restart = false;
let imgNames = Object.keys(conns1);
let numImgs = imgNames.length;
let imgs = new Array(numImgs);
let imgsLocation = "imgs";
let procRunApp = null;
const imgSize = 100;
let connectionArr;
const numMakeCols = procWidth / imgSize;
// const numMakeRows = procHeight / imgSize;

let numCols = 50;
let numRows = 25;

let boxWidth = procWidth / numCols;
let boxHeight = procHeight / numRows;
const loadSpeed = 50;

function refreshProcValues(){
	numCols = colSlider.value;
	numRows = rowSlider.value;
	
	colSliderLabel.innerHTML = "Column Resolution : " + numCols;
	rowSliderLabel.innerHTML = "Row Resolution : " + numRows;
	boxWidth = procWidth / numCols;
	boxHeight = procHeight / numRows;
}

async function firstInitProc(){
	loadBaseImages();
	setTimeout(stagger1, 1000);
}

async function stagger1(){
	drawRotImages();
	await loadRotImages();
	clearGraph(ctxP, procCanvas);
	drawIndexRotImages();
	makeRotConns();
}

async function initProc() {
	// await firstInitProc();
	cells = [];
	finished = false;
	restart = false;
	procRunApp = null;
	refreshProcValues();
	createMap(numCols, numRows, numImgs);
	procRunApp = setInterval(updateMap, loadSpeed);
}

function hideProc() {
	clearInterval(procRunApp);
	procRunApp = null;
	cells = [];
}

function createMap(w, h, s) {
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
	cells = temp;
}

class Cell {
	constructor(s) {
		this.info = s;
		if (s.length == 1) {
			this.propped = true;
		} else if (s.length == 0) {
		} else {
			this.propped = false;
		}
	}

	pick() {
		let index = Math.floor(Math.random() * this.info.length);
		this.info = [this.info[index]];
	}
}

function findLowestEntropy() {
	let smallestStates = 100;
	let lastI = -1;
	let lastJ = -1;
	for (let i = 0; i < numCols; i++) {
		for (let j = 0; j < numRows; j++) {
			if (
				cells[i][j].info.length < smallestStates &&
				cells[i][j].propped == false
			) {
				smallestStates = cells[i][j].info.length;
				lastI = i;
				lastJ = j;
			}
		}
	}
	return [lastI, lastJ];
}

function getAllowedSockets(neighborStates, dir) {
	//dir is index direction that is connecting to main cell, 0-3
	let allowedStates = [];
	for (let i = 0; i < neighborStates.length; i++) {
		let connectionIndex = neighborStates[i];
		let cons = connectionArr[connectionIndex];
		let side = cons[dir].split("").reverse().join("");
		if (allowedStates.includes(side) == false) {
			allowedStates.push(side);
		}
	}
	return allowedStates;
}

function iterateBoard() {
	let coords = findLowestEntropy();
	if (coords[0] == -1 || coords[1] == -1) {
		if (coords[0] == -1 && coords[1] == -1) {
			finished = true;
		}
		return;
	}

	let nextBoard = new Array(numCols);
	for (let i = 0; i < numCols; i++) {
		nextBoard[i] = new Array(numRows);
	}

	let pickedCell = cells[coords[0]][coords[1]];

	pickedCell.pick();
	pickedCell.propped = true;

	for (let i = 0; i < numCols; i++) {
		for (let j = 0; j < numRows; j++) {
			let mainCell = cells[i][j];
			if (mainCell.propped == true) {
				nextBoard[i][j] = cells[i][j];
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
					if (x < 0 || x >= numCols || y < 0 || y >= numRows) {
						continue;
					}
					let neighborCell = cells[x][y];
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
					let allowedSockets = getAllowedSockets(
						neighborCell.info,
						lookIndex
					);
					if (allowedSockets.length != 2) {
					}
					finalStates = reducePossibleStates(
						finalStates,
						allowedSockets,
						neighborIndex
					);
					if (finalStates.length < 1) {
						restart = true;
						break;
					}
				}
				nextBoard[i][j] = new Cell(finalStates);
			}
		}
	}
	cells = nextBoard;
}

function reducePossibleStates(currentStates, givenSockets, adjSide) {
	let newStates = [];
	for (let i = 0; i < currentStates.length; i++) {
		let curState = currentStates[i];
		let curConn = connectionArr[curState];
		let singleSide = curConn[adjSide];
		if (givenSockets.includes(singleSide)) {
			newStates.push(curState);
		}
	}
	return newStates;
}
const colors = [
	"red",
	"orange",
	"yellow",
	"blue",
	"purple",
	"green",
	"brown",
];

function drawMap() {
	for (let i = 0; i < cells.length; i++) {
		for (let j = 0; j < cells[i].length; j++) {
			let x = i * boxWidth;
			let y = j * boxHeight;
			if (cells[i][j].info.length == 1) {
				ctxP.drawImage(imgs[cells[i][j].info[0]], x, y, boxWidth, boxHeight);
			} else {
				drawFRect(ctxP, x, y, boxWidth, boxHeight, colors[(cells[i][j].info.length-1)%colors.length]);
			}
		}
	}
}

async function loadBaseImages() {
	for (let i = 0; i < numImgs; i++) {
		let temp = new Image(imgSize, imgSize);
		temp.src = "/" + imgsLocation + "/" + imgNames[i] + ".png";
		imgs[i] = temp;
	}
}

function drawBaseImages(){
	for(let i = 0; i < numImgs; i++){
		let x = (i % numMakeCols) * imgSize;
		let y = Math.floor(i / numMakeCols) * imgSize;
		ctxP.drawImage(imgs[i], x, y, boxWidth, boxHeight);
	}
}

async function drawRotImages() {
	for (let i = 0; i < numImgs * 4; i++) {
		let x = (i % numMakeCols) * imgSize;
		let y = Math.floor(i / numMakeCols) * imgSize;
		let rotX = x + imgSize / 2;
		let rotY = y + imgSize / 2;
		let degs = ((i % 4) * Math.PI) / 2;
		ctxP.save();
		ctxP.translate(rotX, rotY);
		ctxP.rotate(degs);
		ctxP.drawImage(imgs[Math.floor(i / 4)], -imgSize / 2, -imgSize / 2);
		ctxP.restore();
	}
}
async function loadRotImages() {
	let newImgs = new Array(numImgs * 4);

	for (let i = 0; i < numImgs * 4; i++) {
		let x = (i % numMakeCols) * imgSize;
		let y = Math.floor(i / numMakeCols) * imgSize;
		newImgs[i] = await createImageBitmap(procCanvas, x, y, imgSize, imgSize);
	}
	imgs = newImgs;
	numImgs = imgs.length;
}

function drawIndexRotImages() {
	for (let i = 0; i < imgs.length; i++) {
		let x = (i % numMakeCols) * 100;
		let y = Math.floor(i / numMakeCols) * 100;
		ctxP.drawImage(imgs[i], x, y);
	}
}

function makeRotConns() {
	let tempConns = {};
	let keys = Object.keys(conns1);
	let tempArrConns = new Array(keys.length * 4);
	for (let i = 0; i < keys.length; i++) {
		for (let j = 0; j < 4; j++) {
			let newKey = "" + keys[i] + j;
			let index = 4 - j;
			let curSides = conns1[keys[i]];
			let back = curSides.slice(index, 4);
			let front = curSides.slice(0, index);
			let newSides = back.concat(front);
			tempConns[newKey] = newSides;
			tempArrConns[i * 4 + j] = newSides;
		}
	}
	conns1 = tempConns;
	connectionArr = tempArrConns;
}

function updateMap() {
	if (finished == false) {
		if (restart == true) {
			restart = false;
			refreshProcValues();
			createMap(numCols, numRows, numImgs);
		}
		clearGraph(ctxP, procCanvas);
		iterateBoard();
		drawMap();
	} else {
	}
}

getScores();
getRequests();
loadMatchUpPlayers();

firstInitProc();
