// Spotify parameters needed for authorization
const Client_id=""; //Enter App Client id for spotify here
const redirect_uri = ""; //enter extension link, in format "https://<extension id>.chromiumapp.org/"
const scope = "user-read-currently-playing"; //scope of api permissions, just reading current track here
const authUrl = new URL("https://accounts.spotify.com/authorize") //spotify auth url
const show_dialog = "true" // forces user approval everytime 
let sp_token = ""  // auth token from implicit grant will be stored here
const ge_token = "" // get client api token from genius app

// Random state generator, adapted from spotify api documentation
function generateRandomString(length){
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

// Example API call for genius
async function apiCheck(){
    const resp = await fetch("https://api.genius.com/search?q=Imagine", {
        method: "GET",
        headers: {
            "Authorization": "Bearer "+ge_token
        }
    });
    return resp.json();
}

// When sign in is clicked, the component script hits the service worker, runs this to start auth work
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message==="signin"){
        let state = generateRandomString(16);

        // Generating URL for auth with appropriate parameters for implicit grant
        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(Client_id);
        url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        url += '&state=' + encodeURIComponent(state);
        url += '&show_dialog=' + encodeURIComponent(show_dialog);

        // Allows pop up window to get user permission for api calls on there behalf
        chrome.identity.launchWebAuthFlow({interactive: true, url: url}, function(redirected_url){
            // callback from oauth2 service, saving the parameters into a dictionary style format for easy access
            let params = new URLSearchParams(redirected_url)
            // checks for access denied or runtime errors
            if (chrome.runtime.lastError || redirected_url.includes("error")){
                sendResponse({message: "error"})
            }
            else{
                // verifies state to access appropriate call
                if (params.get("state")===state){
                    // saves the token locally, only valid as long as the extension session is open 
                    sp_token = params.get("access_token")
                    sendResponse({message: "success"})
                }
            }
        });
    }
    return true;
});