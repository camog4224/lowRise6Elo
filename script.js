      
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

//firebase deploy --only hosting,database,firestore

//make "past games" for each player available
//make graph of elo for players that possible overlap


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

let userDisplay = document.getElementById("userDisplay");

let personID = document.getElementById("h1");
let addIDButton = document.getElementById("subID");
addIDButton.addEventListener("click", addID);

let displayUserInfo = document.getElementById("displayInfo");

let mainButton = document.getElementById("main");
mainButton.addEventListener("click", toMain);

let visualButton = document.getElementById("visual");
visualButton.addEventListener("click", toVisual);

let mainContent = document.getElementById("mainContent");
let visualContent = document.getElementById("visualContent");

let timeButton = document.getElementById("timeSend");
timeButton.addEventListener("click", displayMatches);

let graphButton = document.getElementById("graphSend");
graphButton.addEventListener("click", plotPoints);

let clearButton = document.getElementById("clearSend");
clearButton.addEventListener("click", clearGraph);

let gamesPerson = document.getElementById("d1");

let gamesDisplay = document.getElementById("gamesDisplay");

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

async function displayMatches(){
    let info = await getPlayer(gamesPerson.value);
    let oppInfo = {};
    for(let i = 0; i < info.gamesPlayed; i++){
      if(oppInfo[info.opponents[i]] == null){
        oppInfo[info.opponents[i]] = await getPlayer(info.opponents[i]);
      }
    }
    await makePastGameTable(info, oppInfo);
    // console.log(oppInfo);
}

let canvas = document.getElementById("myCanvas");

// console.log(canvas.height);
// console.log(canvas.width);
// const originalHeight = canvas.height;
// const originalWidth = canvas.width;

let ctx = canvas.getContext("2d");
// plotPoints();
// render();
function render() {
  // console.log(canvas.clientWidth);
  // console.log(canvas.clientHeight);
  console.log(canvas.getBoundingClientRect()["width"]);
  console.log(canvas.getBoundingClientRect()["height"]);
  let dimensions = getObjectFitSize(
    true,
    canvas.clientWidth,
    canvas.clientHeight,
    canvas.width,
    canvas.height
  );
  // window.devicePixelRatio=2;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = dimensions.width * dpr;
  canvas.height = dimensions.height * dpr;

  // let ctx = canvas.getContext("2d");
  // console.log(canvas.clientWidth);
  // console.log(canvas.clientHeight);
  let ratio = Math.min(
    canvas.clientWidth / originalWidth,
    canvas.clientHeight / originalHeight
  );
  // console.log(ratio);
  // console.log(dpr);
  ctx.scale(ratio * dpr, ratio * dpr); //adjust this!

  plotPoints();
}

// adapted from: https://www.npmjs.com/package/intrinsic-scale
function getObjectFitSize(
  contains /* true = contain, false = cover */,
  containerWidth,
  containerHeight,
  width,
  height
) {
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;
  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? doRatio > cRatio : doRatio < cRatio;

  if (test) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x: (containerWidth - targetWidth) / 2,
    y: (containerHeight - targetHeight) / 2
  };
}

function clearGraph(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

async function plotPoints(){

  // console.log(canvas.clientWidth);
  // console.log(canvas.clientHeight);
  // console.log(canvas.getBoundingClientRect()["width"]);
  // console.log(canvas.getBoundingClientRect()["height"]);

  let info = await getPlayer(gamesPerson.value);

  let colors = ["#FF0000","#00FF00","#0000FF","#F000F0","#00F0F0"]
  let numPoints = info.gamesPlayed+1;
  let r = 5;
  let points = [];
  let x;
  let y;

  let border = .1
  let xDif = (canvas.width/numPoints)*(1-border);
  let minY = 20000;
  let maxY = 0;
  for(let i = 0; i < numPoints; i++){
    if(info.elo[i] > maxY){
      maxY = info.elo[i];
    }
    if(info.elo[i] < minY){
      minY = info.elo[i]
    }
  }
  let yScale = canvas.height*(1-border);

  for(let i = 0; i < numPoints; i++){
    // x = Math.random()*(canvas.width-r) + r;
    // y = Math.random()*(canvas.height-r) + r;
    x = i*xDif + canvas.width*border*.5;
    y = canvas.height*(1-border/2)-((info.elo[i]-minY)/(maxY-minY))*yScale;
    let c = colors[Math.floor(Math.random()*colors.length)];
    points.push([x,y,c,info.elo[i]]);
  }
  for(let i = 0; i < numPoints; i++){
    let x2 = points[i][0];
    let y2 = points[i][1];
    let c = points[i][2];
    drawCirc(x2,y2,r,c);
    drawTex(x2-r, y2-r-3,points[i][3]);
    if(i != 0){
      let x1 = points[i-1][0];
      let y1 = points[i-1][1]
      drawLin(x1,y1,x2,y2,"#000000");
    }
  }
}

function drawCirc(x,y,r,c){
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawLin(x1,y1,x2,y2,c){
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawTex(x,y,text,c){
  ctx.font = "10px Georgia";
  ctx.fillStyle = c;
  ctx.fillText(text, x, y);
}

async function makePastGameTable(info, oppInfo){
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

  for(let i = 0; i < info.gamesPlayed; i++){
    let tempRow = body.insertRow(-1);
    if(info.victories[i] == true){
      tempRow.classList.add("winRow");
    }else{
      tempRow.classList.add("loseRow");
    }
    let tempOpp = info.opponents[i];
    let oppGameIndex = oppInfo[tempOpp].readableTime.indexOf(info.readableTime[i+1]);
    
    let tempIElo = info.elo[i];
    let tempFElo = info.elo[i+1];
    let tempOIElo = oppInfo[tempOpp].elo[oppGameIndex-1];
    let tempOFElo = oppInfo[tempOpp].elo[oppGameIndex];
    let tempTime = cleanDate(info.readableTime[i+1]);
    tempRow.insertCell(0).innerHTML = tempOpp;
    tempRow.insertCell(-1).innerHTML = tempIElo;
    tempRow.insertCell(-1).innerHTML = tempOIElo;
    tempRow.insertCell(-1).innerHTML = tempFElo;
    tempRow.insertCell(-1).innerHTML = tempOFElo;
    tempRow.insertCell(-1).innerHTML = tempTime;
  }
  gamesDisplay.appendChild(tab);
}

async function findOpponentsForPlayer(){
    let name = gamesPerson.value;
    let playerInfo = await getPlayer(name);
    let opponents = [];
    // if(playerInfo.euid == null){
    //     console.log("HAS NO ID");
    //     return;
    // }
    console.log(name);
    for(let i = 1; i < playerInfo.readableTime.length; i++){

        let matchingAccounts = await queryTime(playerInfo.readableTime[i], name);
        if(matchingAccounts.length > 0){
            // console.log(matchingAccounts[0].name);
            if(matchingAccounts.length > 1){
                console.log(matchingAccounts.length);
            }
            opponents = opponents.concat([matchingAccounts[0].name]);
        }else{
            opponents = opponents.concat([playerInfo.readableTime[i]]);
            // console.log(playerInfo.time[i]);
        }
    }
    console.log(opponents);
    await updateOpponents(name, opponents);
    console.log("Completed");
}

async function queryTime(time, name){
    const ref = collection(db, "playerInfo");
    // let increment = 100;
    // const q = await query(ref, where("time", "array-contains", time), where("euid", "!=", uid));
    const q = await query(ref, where("readableTime", "array-contains", time));
    // const q = await query(ref, where("time", "<", time + increment), where("time", ">", time - increment));
    
    let temp = await getDocs(q);
    let matchingAccounts = [];
    await temp.forEach((doc) => {
      let d = doc.data();
      d.name = doc.id;
      if(d.name != name){
        matchingAccounts = matchingAccounts.concat([d]);
      }
    });
    return matchingAccounts;
}



function toVisual(){
    mainContent.style.display = "none";
    visualContent.style.display = "inline";
}

function toMain(){
    mainContent.style.display = "inline";
    visualContent.style.display = "none";
}

async function addID(){
    let name = personID.value;
    //if logged in
    if(checkAccountStatus() == false){
        console.log("no one signed in!");
        displayUserInfo.innerHTML = "no one signed in";
        return;
    }
    let curUser = auth.currentUser;
    let curMatchingUsers = await matchingAccount(curUser.uid);
    //if 
    // console.log(curMatchingUsers);
    if(curMatchingUsers.length > 0){
        console.log("Player with this email already exists");
        displayUserInfo.innerHTML = "Player with this email already exists";
        return;
    }

    let curPlayerInfo = await getPlayer(name);
    if(curPlayerInfo.euid != null){
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
            // console.log(info);
            let data = {
                euid: curUser.uid
            };
            // console.log(data);
            transaction.update(sfRef, data);
        });
        // console.log("Transaction successfully committed!");
        displayUserInfo.innerHTML = "ID ADDED";
    } catch (e) {
        // console.log("Transaction failed: ", e);
    }
}

async function checkAccountStatus(){
    let curUser = auth.currentUser;
    if(curUser !== null){
        return checkCornell(curUser.email);
    }else{
        return false;
    }
}

async function signOutUser(){
  signOut(auth).then(() => {
    // Sign-out successful.
    
    userDisplay.innerHTML = "Signed in as : ---";
  }).catch((error) => {
    // An error happened.
  });
}

async function matchingAccount(euid){
    const ref = collection(db, "playerInfo");
    const q = await query(ref, where("euid", "==", euid));
    // const q = await query(ref, orderBy("currentElo", "desc"));
    let temp = await getDocs(q);
    let matchingAccounts = [];
    await temp.forEach((doc) => {
      let d = doc.data();
      d.name = doc.id;
      matchingAccounts = matchingAccounts.concat([d]);
    });
    return matchingAccounts;
}


async function addPlayer(name, euid){
  let data = {
    euid: euid,
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

async function updateOpponents(name, opponents){
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
            opponents: opponents
          };
          // console.log(data);
          transaction.update(sfRef, data);
        });
        // console.log("Transaction successfully committed!");
      } catch (e) {
        console.log("Transaction failed: ", e);
      }
}

async function updatePlayer(name, newElo, victory, t, rt, opponent) {
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
        readableTime: info.readableTime.concat(rt),
        opponents: info.opponents.concat(opponent)
      };
      // console.log(data);
      transaction.update(sfRef, data);
    });
    // console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

function matchUp(name1, name2, v1, elo1, elo2, t, tr){
  updatePlayer(name1, elo1, v1, t, tr, name2);
  updatePlayer(name2, elo2, !v1, t, tr, name1);
}

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


onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User

      const uid = user.uid;
      signInButton.style.display = "none";
      signOutButton.style.display = "inline";
      
    //   console.log(user);
    //   console.log(uid);
      userDisplay.innerHTML = "Signed in as : " + user.displayName;
      // ...
    } else {
        signInButton.style.display = "inline";
        signOutButton.style.display = "none";

      // User is signed out
      // ...
    //   console.log("Bye!");
    }
  }
);

async function tempO(){
    await askForSignIn();
}


async function makeMatchRequest(){
    //fix this, shouldn't determine requester and opponent off of selection boxes
    let name1 = s1.value;
    let name2 = s2.value;
    
    if(name1 == name2){
        console.log("can't submit same person!");
        return;
    }
    let curUser = auth.currentUser;
    // console.log(curUser);

    if(checkAccountStatus() == false){
        return;
    }
    let tempPlayer1 = await getPlayer(name1);
    let tempPlayer2 = await getPlayer(name2);

    if((curUser.uid == tempPlayer1.euid || curUser.uid == tempPlayer2.euid) == false){
        console.log("requester is not one of the players");
        return;
    }

    let checkOption = document.querySelector('input[name="Rwinner"]:checked');
    let v1 = checkOption.value;

    let vP = "schmuck";

    if(curUser.uid == tempPlayer1.euid){
        if(v1 == "aWinner"){
            v1 = true;
            vP = name1;
        }else{
            v1 = false;
            vP = name2;
        }
    }else{
        //if person who is signed in and requesting a game is the second person in the selection boxes, do :
        name1 = s2.value;
        name2 = s1.value;

        if(v1 == "aWinner"){
            v1 = false;
            vP = name1;
        }else{
            v1 = true;
            vP = name2;
        }
        // v1 = !v1;
    }

    //make the requester and opponent values actually reflect requester and opponent
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
    // signOutUser();
}

function checkCornell(emailString){
    return Boolean(emailString.indexOf("@cornell.edu") > -1)
}

async function resolveMatchRequest(reqBox, approve){
    // console.log("resolve Request Called");
    let reqInfo = await getRequest(reqBox.dataset.id);
    if(checkAccountStatus() == false){
        displayUserInfo.innerHTML = "log in to resolve request";
        console.log("log in to resolve request");
        return;
    }
    let curUser = auth.currentUser;
    //if approving game then person must be opponent
    if(approve == true){
        // let p1Info = await getPlayer(reqInfo.requester);
        let p2Info = await getPlayer(reqInfo.opponent);
        // console.log(p2Info.euid);
        // console.log(curUser.uid);
        if(p2Info.euid == curUser.uid){
            await formalizeMatch(reqInfo);
            await removeGameRequest(reqBox.dataset.id);
            reqBox.remove();
        }else{
            console.log("need to be opponent to accept");
            displayUserInfo.innerHTML = "need to be opponent to accept";
            return;
        }
    }else{//if disapproving game then person can only be either opponent or requester
        let p1Info = await getPlayer(reqInfo.requester);
        let p2Info = await getPlayer(reqInfo.opponent);
        if(p1Info.euid == curUser.uid || p2Info.euid == curUser.uid){
            await removeGameRequest(reqBox.dataset.id);
            reqBox.remove();
        }else{
            console.log(p1Info.euid, p2Info.euid, curUser.uid);
            console.log("need to be either opponent or requester to reject request");
            displayUserInfo.innerHTML = "need to be either opponent or requester to reject request";
        }
        // getRequests();
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
    let curUser = auth.currentUser;
    if (curUser !== null) {

        let euid = curUser.uid;
        if(await getPlayer(name) == -1){
            let matchingAccounts = await matchingAccount(euid);
            if( matchingAccounts.length == 0){
                await addPlayer(name, euid);
                getScores();
            }else{
                console.log("account with this email already exists!");
                displayUserInfo.innerHTML = "account with this email already exists";
            }
            
        }else{
            console.log("player with this name already exists!");
            displayUserInfo.innerHTML = "player with this name already exists";
        }
    }else{
        console.log("NOT SIGNED IN, LOG IN TO JOIN");
        displayUserInfo.innerHTML = "NOT SIGNED IN, LOG IN TO JOIN";
    }
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
        personID.add(tempOption.cloneNode(true));
        gamesPerson.add(tempOption.cloneNode(true));
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