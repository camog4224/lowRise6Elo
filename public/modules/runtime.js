//firebase deploy --only hosting,database,firestore

//elo decay baed on elo

//have swarm for every person logged into site in worms tab

let scores = document.getElementById("scores");

let s1 = document.getElementById("s1");
let s2 = document.getElementById("s2");
let sendButton = document.getElementById("subSend");

let newP = document.getElementById("newPlayer");
let addButton = document.getElementById("subNewP");

let requestParent = document.getElementById("requests");

let signInButton = document.getElementById("signSend");

let signOutButton = document.getElementById("outSend");

// let userDisplay = document.getElementById("userDisplay");
let userDisplayText = document.getElementById("userDisplayText");

let personID = document.getElementById("h1");
let addIDButton = document.getElementById("subID");

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

let graphButton = document.getElementById("graphSend");

let clearButton = document.getElementById("clearSend");

let gamesPerson = document.getElementById("d1");

let gamesDisplay = document.getElementById("gamesDisplay");

let moviesDisplay = document.getElementById("moviesDisplay");

let movieInput = document.getElementById("movieInput");

let movieSendButton = document.getElementById("movieSend");

const k = 32;
const d = 400;

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
	getFirestore,
	connectFirestoreEmulator,
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

const isLocalhost =
	location.hostname === "localhost" ||
	location.hostname === "127.0.0.1";

if (isLocalhost) {
	connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

const provider = new GoogleAuthProvider();

const auth = getAuth();

window.PingEloRuntime = {
	scores,
	s1,
	s2,
	sendButton,
	newP,
	addButton,
	requestParent,
	signInButton,
	signOutButton,
	userDisplayText,
	personID,
	addIDButton,
	displayUserInfo,
	mainContent,
	visualContent,
	movieContent,
	wormContent,
	procContent,
	gameContent,
	timeButton,
	graphButton,
	clearButton,
	gamesPerson,
	gamesDisplay,
	moviesDisplay,
	movieInput,
	movieSendButton,
	k,
	d,
	d3,
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
	GoogleAuthProvider,
	signInWithPopup,
	getAuth,
	signOut,
	onAuthStateChanged,
	db,
	provider,
	auth,
};

const featureScripts = [
	"shared-state.js",
	"movies.js",
	"charts.js",
	"players.js",
	"matches.js",
	"worms.js",
	"procedural.js",
	"game.js",
	"init.js",
];

for (const scriptName of featureScripts) {
	await new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = `/modules/${scriptName}`;
		script.onload = resolve;
		script.onerror = () => reject(new Error(`Unable to load ${scriptName}`));
		document.head.appendChild(script);
	});
}
