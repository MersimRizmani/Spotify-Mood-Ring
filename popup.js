// Button listener for log in, talks to the service worker. Console statement indicates if sign in was successful or not
document.getElementById("signin").addEventListener('click', function(){
    chrome.runtime.sendMessage("signin", resp =>{
        if (resp.message==="success"){
            console.log("Signed in");
        }
        else{
            console.log("Sign in unsuccessful, try again")
        }
    })
});