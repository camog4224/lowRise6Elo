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
 * @param {Object} reqBox - request box user clicked on
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
 * makes a html element from the data in info Object
 * @param {Object} info - contains the information for request box
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
 * @param {Object} startInfo - request box info for submitting games
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

