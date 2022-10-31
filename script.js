
// import {eloRankedDocs, allDocs, getPlayer, matchUp, addPlayer, 
//     addGameRequest, removeGameRequest, requestDocs, getRequest, 
//     askForSignIn, signInResults, signOutUser} from "/index.js";
      

// let elo1 = document.getElementById("1elo");
// let elo2 = document.getElementById("2elo");

// let E1 = document.getElementById("E1");
// let E2 = document.getElementById("E2");

// let Re1 = document.getElementById("Re1");
// let Re2 = document.getElementById("Re2");

// let button = document.getElementById("sub");
// button.addEventListener("click", calculate);


// let playerMatchUp = document.getElementById("matchUps");
// let p1 = document.getElementById("p1");
// let p2 = document.getElementById("p2");
// let matchButton = document.getElementById("subMatch");
// matchButton.addEventListener("click", testMatch);

let scores = document.getElementById("scores");

let ME1 = document.getElementById("me1");
let ME2 = document.getElementById("me2");

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

let signResultButton = document.getElementById("resultSend");
signResultButton.addEventListener("click", signInResults);

let userDisplay = document.getElementById("userDisplay");



const k = 32.;
const d = 400.;


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { 
  getFirestore, collection, getDocs, query, where, doc, getDoc, deleteDoc,
  setDoc, addDoc, updateDoc, runTransaction, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getDatabase, ref, child, push, update, set} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAuth,
  signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

//firebase deploy --only hosting,database,firestore


const firebaseConfig = {
  apiKey: "AIzaSyA1RIrA-DJxWj3yzc-RqQqXTTLnW0bXSKM",
  authDomain: "lr6elo.firebaseapp.com",
  projectId: "lr6elo",
  storageBucket: "lr6elo.appspot.com",
  messagingSenderId: "244570148069",
  appId: "1:244570148069:web:82659bdde22e85f18cd80c",
  measurementId: "G-5JSRB6JR91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const auth = getAuth();

async function askForSignIn(){
  signInWithRedirect(auth, provider);
}

const thing = "244570148069-6is73a7sohagu36v3bhov3s3at1hluvp.apps.googleusercontent.com";

async function signInResults(){
  console.log("running get results");
    
}

async function signOutUser(){
  signOut(auth).then(() => {
    // Sign-out successful.
    console.log("signed out");
    userDisplay.innerHTML = "Signed in as : ---";
  }).catch((error) => {
    // An error happened.
  });
}


async function addPlayer(name){
  let data = {
    elo: [1000],
    currentElo: 1000,
    victories: [],
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    time : [Date.now()],
    readableTime: ["" + new Date(Date.now())]
  };
  await setDoc(doc(db, "playerInfo", name), data);
  // await setDoc(collection(db, "playerInfo", name), );
}

async function addGameRequest(info){

  // await setDoc(doc(db, "pendingGames", "UNIQUE ID"), info);

  const docRef = await addDoc(collection(db, "pendingGames"),info);

  return docRef.id;
}

async function removeGameRequest(id){

  await deleteDoc(doc(db, "pendingGames", id));
  
}

async function requestDocs(){
  const querySnapshot = await getDocs(collection(db, "pendingGames"));
  let completeInfo = [];
  await querySnapshot.forEach((doc) => {
    let d = doc.data();
    d.id = doc.id;
    completeInfo = completeInfo.concat([d]);
  });
  return completeInfo;
}

async function getRequest(id){
  const docRef = doc(db, "pendingGames", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());
    return await docSnap.data();
  } else {
  // doc.data() will be undefined in this case
  // console.log("No such document!");
  return -1;
  }
}

async function updatePlayer(name, newElo, victory, t, rt) {
  const sfRef = doc(db, "playerInfo", name);
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfRef);
      let info = await sfDoc.data();
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }
      // console.log(info);
      let data = {
        elo: info.elo.concat(newElo),
        currentElo: newElo,
        victories: info.victories.concat(victory),
        wins: info.wins + Boolean(victory),
        losses: info.losses + 1-Boolean(victory),
        gamesPlayed: info.gamesPlayed + 1,
        time : info.time.concat(t),
        readableTime: info.readableTime.concat(rt)
      };
      // console.log(data);
      transaction.update(sfRef, data);
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

// updatePlayer("Evan", 1100, true);

function matchUp(name1, name2, v1, elo1, elo2, t, tr){
  updatePlayer(name1, elo1, v1, t, tr);
  updatePlayer(name2, elo2, !v1, t, tr);
}

// matchUp("Camilo", "Evan", true, 1150, 950);

async function allDocsOfPerson(name){
  const q = query(collection(db, "playerInfo"), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  // console.log(querySnapshot.docs);
  return querySnapshot.docs;
}

async function allDocs(){
  const querySnapshot = await getDocs(collection(db, "playerInfo"));
  let completeInfo = [];
  await querySnapshot.forEach((doc) => {
    let d = doc.data();
    d.name = doc.id;
    completeInfo = completeInfo.concat([d]);
  });
  return completeInfo;
}

async function getPlayer(name){
  const docRef = doc(db, "playerInfo", name);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());
    return await docSnap.data();
  } else {
  // doc.data() will be undefined in this case
  // console.log("No such document!");
  return -1;
  }
}

// getPlayer("Camilo");

async function eloRankedDocs(){
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

//maybe use this
// function toggleSignIn() {
//     if (!firebase.auth().currentUser) {
//       var provider = new firebase.auth.FacebookAuthProvider();
//       provider.addScope('user_likes');
//       firebase.auth().signInWithRedirect(provider);
//     } else {
//       firebase.auth().signOut();
//     }
//     document.getElementById('quickstart-sign-in').disabled = true;
// }


onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
    //   console.log("ligma");
      const uid = user.uid;
      console.log(user);
      console.log(uid);
      userDisplay.innerHTML = "Signed in as : " + user.displayName;
      // ...
    } else {
      // User is signed out
      // ...
      console.log("Bye!");
    }
  }
);

async function tempO(){
    await askForSignIn();
}


async function makeMatchRequest(){
    // let requestChannel = document.getElementById("requests");
    let name1 = s1.value;
    let name2 = s2.value;
    
    if(name1 == name2){
        console.log("can't submit same person!");
        return;
    }

    console.log("ask to sign in");
    await askForSignIn();
    console.log("between");
    let signedInUser = await signInResults();
    // console.log(signedInUser);
    if(checkCornell(signedInUser.email) == false){
        console.log("NOT CORNELL, FUCKING CRINGE")
        return;
    }else{
        //check that signed in email is the same as one of the people requesting match
        if((signedInUser.displayName == name1 || signedInUser.displayName == name2) == false){
            console.log("requester is not one of the players!");
            return;
        }
    }

    let checkOption = document.querySelector('input[name="Rwinner"]:checked');
    let v1 = checkOption.value;

    // let rBox = document.createElement("div");
    // rBox.classList.add("requestBox");
    let vP = "schmuck";
    if(v1 == "aWinner"){
        v1 = true;
        vP = name1;
    }else{
        v1 = false;
        vP = name2;
    }


    // rBox.innerHTML = "Please add game between " + name1 + " and " + name2 + " where " + vP + " won";
    let dbInfo = {
        "requester" : name1,
        "opponent" : name2,
        "time" : Date.now(),
        "readableTime" : "" + new Date(Date.now()),
        "requesterWin" : v1
    }
    let requestId = await addGameRequest(dbInfo);
    let boxInfo = {
        "name1" : name1,
        "name2" : name2,
        "v1" : v1,
        "readableTime" : "" + new Date(Date.now()),
        "requestId" : requestId
    }
    makeHTMLRequestBox(boxInfo);
    getRequests();
    signOutUser();
}

function checkCornell(emailString){
    return Boolean(emailString.indexOf("@cornell.edu") > -1)
}

async function resolveMatchRequest(reqBox, approve){
    console.log("resolve Request Called");
    let reqInfo = await getRequest(reqBox.dataset.id);
    await removeGameRequest(reqBox.dataset.id);
    reqBox.remove();
    getRequests();
    if(approve == true){
        await formalizeMatch(reqInfo);
    }
}

function makeHTMLRequestBox(info){
    let requestChannel = document.getElementById("inputRequests");
    let rBox = document.createElement("div");
    rBox.classList.add("requestBox");
    let vP;
    if(info.v1 == true){
        vP = info.name1;
    }else{
        vP = info.name2;
    }
    rBox.innerHTML = "Request to add game between " + info.name1 + " and " + info.name2 + " where " + vP + " won on : " + info.readableTime;
    rBox.dataset.id = info.requestId;

    let tempBigDiv = document.createElement("div");

    let accept = document.createElement("div");
    accept.classList.add("acceptButton");
    accept.innerHTML = "ACCEPT"
    
    //make accept button
    accept.addEventListener("click", function(){
        resolveMatchRequest(rBox, true);
    });
    tempBigDiv.append(accept);
    
    let reject = document.createElement("div");
    reject.classList.add("rejectButton");
    reject.innerHTML = "REJECT"
   
    //make reject button
    reject.addEventListener("click", function(){
        resolveMatchRequest(rBox, false);
    });
    
    tempBigDiv.append(reject);
    tempBigDiv.classList.add("buttonGroup")
    
    rBox.append(tempBigDiv);

    requestChannel.append(rBox);
    
}

function makePlayerRequest(name){
    let rBox = document.createElement("div");
    rBox.classList.add("requestBox");
    rBox.dataset.name = name;
    rBox.innerHTML = "Please add : " + name;
    requestChannel.append(rBox);
}

async function requestPlayer(){
    let name = newP.value;
    if(await getPlayer(name) == -1){
        await addPlayer(name);
        
    }
    getScores();
}

async function formalizeMatch(startInfo){
    let p1Info = await getPlayer(startInfo.requester);
    let p2Info = await getPlayer(startInfo.opponent);

    let ra = p1Info.currentElo * 1.0;
    let rb = p2Info.currentElo * 1.0;

    let qa = 10. ** (ra/d);
    let qb = 10. ** (rb/d);

    let ea = qa / (qa + qb);
    let eb = qb / (qa + qb);

    let sa;
    let sb;
    
    if(startInfo.requesterWin == true){
        sa = 1.;
        sb = 0.;
        
    }else{
        sa = 0.;
        sb = 1.;
        
    }
    let rea = Math.round(ra + (k * (sa - ea)));
    let reb = Math.round(rb + k * (sb - eb));
    
    matchUp(startInfo.requester, startInfo.opponent, startInfo.requesterWin, rea, reb, startInfo.time, startInfo.readableTime);
    getScores();
}

async function requestMatch(){
    let p1Info = await getPlayer(s1.value);
    let p2Info = await getPlayer(s2.value);

    let ra = p1Info.currentElo * 1.0;;
    let rb = p2Info.currentElo * 1.0;

    let qa = 10. ** (ra/d);
    let qb = 10. ** (rb/d);

    let ea = qa / (qa + qb);
    E1.innerHTML = Math.round(1000*ea)/10. + "%";
    let eb = qb / (qa + qb);
    E2.innerHTML = Math.round(1000*eb)/10. + "%";
    let checkOption = document.querySelector('input[name="Rwinner"]:checked');

    let winner = checkOption.value;
    let sa;
    let sb;

    let winBool;
    if(winner == "aWinner"){
        winBool = true;
    } else{
        winBool = false;
    }
    
    if(winBool == true){
        sa = 1.;
        sb = 0.;
        
    }else{
        sa = 0.;
        sb = 1.;
        
    }
    let rea = Math.round(ra + (k * (sa - ea)));
    let reb = Math.round(rb + k * (sb - eb));
    
    matchUp(s1.value, s2.value, winBool, rea, reb);
    getScores();
    
}

async function testMatch(){

    let p1Info = await getPlayer(p1.value);
    let p2Info = await getPlayer(p2.value);

    let ra = p1Info.currentElo * 1.0;
    let rb = p2Info.currentElo * 1.0;

    let qa = 10. ** (ra/d);
    let qb = 10. ** (rb/d);

    let ea = qa / (qa + qb);
    ME1.innerHTML = Math.round(1000*ea)/10. + "%";
    let eb = qb / (qa + qb);
    ME2.innerHTML = Math.round(1000*eb)/10. + "%";

}

function calculate(){
    let ra = parseFloat(elo1.value);
    let rb = parseFloat(elo2.value);

    let qa = 10. ** (ra/d);
    let qb = 10. ** (rb/d);

    let ea = qa / (qa + qb);
    E1.innerHTML = Math.round(1000*ea)/10. + "%";
    let eb = qb / (qa + qb);
    E2.innerHTML = Math.round(1000*eb)/10. + "%";
    let checkOption = document.querySelector('input[name="winner"]:checked');

    let winner = checkOption.value;
    let sa;
    let sb;
    if(winner == "aWinner"){
        sa = 1.;
        sb = 0.;
        
    }else{
        sa = 0.;
        sb = 1.;
        
    }
    // console.log(ra, rb);
    let rea = Math.round(ra + (k * (sa - ea)));
    Re1.innerHTML = "" + rea;
    let reb = Math.round(rb + k * (sb - eb));
    Re2.innerHTML = "" + reb;
    // console.log(rea, reb);

    
};

async function loadMatchUpPlayers(){
    
    let allPlayerInfo = await eloRankedDocs();
    let numPlayers = allPlayerInfo.length;
    for(let i = 0; i < numPlayers; i++){
        let tempOption = document.createElement("option");
        tempOption.text = allPlayerInfo[i].name;
        // p1.add(tempOption);
        // p2.add(tempOption.cloneNode(true));
        s1.add(tempOption.cloneNode(true));
        s2.add(tempOption.cloneNode(true));
    }

}

async function getScores(){
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
    // console.log(allPlayerInfo[0].elo);
    for(let i = 0; i < numPlayers; i++){
        let tempRow = tempTable.insertRow(-1);
        let tempPlayer = allPlayerInfo[i];
        let tempName = tempPlayer.name;
        let tempElo = tempPlayer.currentElo;
        tempRow.insertCell(0).innerHTML = tempName;
        tempRow.insertCell(-1).innerHTML = "" + tempElo;
        tempRow.insertCell(0).innerHTML = i+1;
        tempRow.insertCell(-1).innerHTML = "" + Math.floor(100*(tempPlayer.wins / tempPlayer.gamesPlayed)) + "%";
        tempRow.insertCell(-1).innerHTML = tempPlayer.gamesPlayed;
        // console.log(tempPlayer.readableTime[-]);
        tempRow.insertCell(-1).innerHTML = cleanDate(tempPlayer.readableTime[tempPlayer.readableTime.length-1]);
    }
    // t1 = tempTable;
    scores.appendChild(tempTable);
    // scores = tempTable;
}

async function getRequests(){
    let requestChannel = document.getElementById("inputRequests");
    requestChannel.remove();
    
    let tempChannel = document.createElement("DIV");
    tempChannel.id = "inputRequests";
    requestParent.append(tempChannel);

    let allRequestInfo = await requestDocs();
    // console.log(allRequestInfo);
    let numRequests = allRequestInfo.length;
    
    for(let i = 0; i < numRequests; i++){
        let simpleInfo = {
            "name1" : allRequestInfo[i].requester,
            "name2" : allRequestInfo[i].opponent,
            "v1" : allRequestInfo[i].requesterWin,
            "readableTime" : cleanDate(allRequestInfo[i].readableTime),
            "requestId" : allRequestInfo[i].id
        }
        makeHTMLRequestBox(simpleInfo);
    }


}

function cleanDate(dateString){
    let i = dateString.indexOf("GMT");
    return dateString.slice(0, i-1);
}

getScores();
getRequests();
loadMatchUpPlayers();