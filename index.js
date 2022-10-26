
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { 
  getFirestore, collection, getDocs, query, where, doc, getDoc,
  setDoc, addDoc, updateDoc, runTransaction, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getDatabase, ref, child, push, update, set} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAuth } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";


// import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// signInWithRedirect(auth, provider);

// getRedirectResult(auth)
//   .then((result) => {
//     // This gives you a Google Access Token. You can use it to access Google APIs.
//     const credential = GoogleAuthProvider.credentialFromResult(result);
//     const token = credential.accessToken;

//     // The signed-in user info.
//     const user = result.user;
//   }).catch((error) => {
//     // Handle Errors here.
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // The email of the user's account used.
//     const email = error.customData.email;
//     // The AuthCredential type that was used.
//     const credential = GoogleAuthProvider.credentialFromError(error);
//     // ...
//   });

export async function addPlayer(name){
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

// addPlayer("Evan");
// addPlayer("Camilo");
// addPlayer("Jake");

async function updatePlayer(name, newElo, victory) {
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
        time : info.time.concat(Date.now()),
        readableTime: info.readableTime.concat("" + new Date(Date.now()))
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

export function matchUp(name1, name2, v1, elo1, elo2){
  updatePlayer(name1, elo1, v1);
  updatePlayer(name2, elo2, !v1);
}

// matchUp("Camilo", "Evan", true, 1150, 950);

async function allDocsOfPerson(name){
  const q = query(collection(db, "playerInfo"), where("name", "==", name));
  const querySnapshot = await getDocs(q);
  // console.log(querySnapshot.docs);
  return querySnapshot.docs;
}

export async function allDocs(){
  const querySnapshot = await getDocs(collection(db, "playerInfo"));
  let completeInfo = [];
  await querySnapshot.forEach((doc) => {
    let d = doc.data();
    d.name = doc.id;
    completeInfo = completeInfo.concat([d]);
  });
  return completeInfo;
}

export async function getPlayer(name){
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

export async function eloRankedDocs(){
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


