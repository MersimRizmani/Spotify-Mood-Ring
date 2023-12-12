// Button listener for log in, talks to the service worker. Console statement indicates if sign in was successful or not
var signInButton = document.getElementById("signin");
var imagePlaceholder = document.getElementById("imgPlaceHolder");
var titlePlaceholder = document.getElementById("titlePlaceholder");
var ring = document.getElementById("ring");

// Listener on extension launch, checks to see if there is an active token cached
chrome.runtime.sendMessage("popup", resp =>{
    if (resp.message==="token"){
        console.log("Signed in");
        signInButton.disabled = true;
        signInButton.style.backgroundColor = '#176901';
    }
});

// function that handles sign in by interfacing with backend.js via message, disables sign in button on success
function signin_event(){
    chrome.runtime.sendMessage("signin", resp =>{
        if (resp.message==="success"){
            console.log("Signed in");
            signInButton.disabled = true;
            signInButton.style.backgroundColor = '#176901';
        }
        else{
            console.log("Sign in unsuccessful, try again")
            signInButton.disabled = false;
        }
    });
}

// Listener for sign in button
signInButton.addEventListener('click', signin_event);

// Listener for analyze button, sends message to backend.js to pull song and perform sentiment analysis
document.getElementById("analyze").addEventListener('click', function(){
    titlePlaceholder.innerText = "Analyzing...";
    // Couple of different responses
    // success - Song is found and the extension is updated with album cover, song name, and sentiment
    // Song not running - song is not running on spotify, nothing can be done
    // Not logged in - not logged in on spotify, nothing can be done
    // Not available - song is not available on genius, nothing can be done
    chrome.runtime.sendMessage("analysis", resp =>{
        if (resp.message==="success"){
            console.log("Got it");
            var img = resp.respData["item"]["album"]["images"][0]["url"];
            var name = resp.respData.item.name;
            var artist = resp.respData["item"]["artists"][0]["name"];
            imagePlaceholder.src = img;
            titlePlaceholder.innerText = name + " by " + artist;
            ring.style.borderColor = mapSentimentToColor(resp.score.compound);
        }
        else if (resp.message==="Song not running"){
            console.log("song not running");
            imagePlaceholder.src = "https://via.placeholder.com/150";
            titlePlaceholder.innerText = "Song needs to be running";
        }
        else if (resp.message==="Not logged in"){
            console.log("need to log in");
            imagePlaceholder.src = "https://via.placeholder.com/150";
            titlePlaceholder.innerText = "Need to Log In";
        }
        else if (resp.message==="Not available"){
            console.log("Not available");
            imagePlaceholder.src = "https://via.placeholder.com/150";
            titlePlaceholder.innerText = "Song not found, please try another song";
        }
    })
});