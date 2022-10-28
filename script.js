
import {eloRankedDocs, allDocs, getPlayer, matchUp, addPlayer} from "/index.js";

let elo1 = document.getElementById("1elo");
let elo2 = document.getElementById("2elo");

let E1 = document.getElementById("E1");
let E2 = document.getElementById("E2");

let Re1 = document.getElementById("Re1");
let Re2 = document.getElementById("Re2");

let button = document.getElementById("sub");
button.addEventListener("click", calculate);

var scores = document.getElementById("scores");

// let playerMatchUp = document.getElementById("matchUps");
let p1 = document.getElementById("p1");
let p2 = document.getElementById("p2");
let matchButton = document.getElementById("subMatch");
matchButton.addEventListener("click", testMatch);

let ME1 = document.getElementById("me1");
let ME2 = document.getElementById("me2");

let s1 = document.getElementById("s1");
let s2 = document.getElementById("s2");
let sendButton = document.getElementById("subSend");
sendButton.addEventListener("click", makeMatchRequest);

let newP = document.getElementById("newPlayer");
let addButton = document.getElementById("subNewP");
addButton.addEventListener("click", requestPlayer);

let requestChannel = document.getElementById("requests");


const k = 32.;
const d = 400.;

function makeMatchRequest(){
    let name1 = s1.value;
    let name2 = s2.value;
    if(name1 == name2){
        console.log("can't submit same person!");
        return;
    }
    let checkOption = document.querySelector('input[name="Rwinner"]:checked');
    let v1 = checkOption.value;

    let rBox = document.createElement("div");
    rBox.classList.add("requestBox");
    let vP = "schmuck";
    if(v1 == "aWinner"){
        vP = name1;
    }else{
        vP = name2;
    }
    rBox.innerHTML = "Please add game between " + name1 + " and " + name2 + " where " + vP + " won";
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
        // await addPlayer(name);
        makePlayerRequest(name);
    }
    // getScores();
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
    //try making request on html like popup box
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
        p1.add(tempOption);
        p2.add(tempOption.cloneNode(true));
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
    }
    // t1 = tempTable;
    scores.appendChild(tempTable);
    // scores = tempTable;
}

getScores();
loadMatchUpPlayers();