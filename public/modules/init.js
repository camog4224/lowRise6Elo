sendButton.addEventListener("click", makeMatchRequest);
addButton.addEventListener("click", requestPlayer);
signInButton.addEventListener("click", tempO);
signOutButton.addEventListener("click", signOutUser);
addIDButton.addEventListener("click", addID);
timeButton.addEventListener("click", displayMatches);
graphButton.addEventListener("click", showVisuals);
movieSendButton.addEventListener("click", reqAddMovie);

/**@type {Game}*/
let game = new Game(gameLeftCanvas, gameLeftCanvasContext, 
	gameRightCanvas, gameRightCanvasContext);

getScores();
getRequests();
loadMatchUpPlayers();

procBoard.firstInitProc();
