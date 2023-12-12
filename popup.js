// Button listener for log in, talks to the service worker. Console statement indicates if sign in was successful or not
var signInButton = document.getElementById("signin");
var imagePlaceholder = document.getElementById("imgPlaceHolder");
var titlePlaceholder = document.getElementById("titlePlaceholder");
var ring = document.getElementById("ring");

signInButton.addEventListener('click', function(){
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
    })
});

document.getElementById("analyze").addEventListener('click', function(){
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
        else if (resp.message==="Not logged in"){
            console.log("need to log in");
        }
        else{
            console.log("Not available");
        }
    })
});