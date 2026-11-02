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
			movieBox.classList.add("paper");
			movieBox.classList.add("with-shadow");
	
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
