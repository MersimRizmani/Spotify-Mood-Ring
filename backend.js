// Spotify parameters needed for authorization
const Client_id=""; //Enter App Client id for spotify here
const redirect_uri = ""; //enter extension link, in format "https://<extension id>.chromiumapp.org/"
const scope = "user-read-currently-playing"; //scope of api permissions, just reading current track here
const authUrl = new URL("https://accounts.spotify.com/authorize"); //spotify auth url
const show_dialog = "true"; // forces user approval everytime 
let sp_token = "";  // auth token from implicit grant will be stored here
const server_ip = "http://127.0.0.1:5000/" //Flask server link

// Random state generator, adapted from spotify api documentation
function generateRandomString(length){
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

// Pull current playing track from spotify, return in json
async function spotify_read(){
        const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            "content-type": "application/json",
            "Authorization": "Bearer "+sp_token
        }
    });
    const resp = await response.json()
    const data = resp;
    return data;
}

// API to connect back to flask to perform analysis
async function analysisFetch(song, artist){
    data = {song:song, artist: artist};
        const resp = await fetch(server_ip+"/analysis", {method: "POST", headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)});

    const output = await resp.json()
    if (output?.error){
        console.log(`err: ${output.error}`)
        throw Error;
    }

    return output["lyrics"]
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
            let params = new URLSearchParams(redirected_url);
            // checks for access denied or runtime errors
            if (chrome.runtime.lastError || redirected_url.includes("error")){
                sendResponse({message: "error"});
            }
            else{
                // verifies state to access appropriate call
                if (params.get("state")===state){
                    // saves the token locally, only valid as long as the extension session is open 
                    sp_token = redirected_url.substring(redirected_url.indexOf("access_token=")+13, redirected_url.indexOf("&", redirected_url.indexOf("access_token=")));
                    sendResponse({message: "success"});
                }
            }
        });
    }
    else if (message==="analysis"){
        // If the user is authenticated in spotify, continue
        if (sp_token===""){
            console.log("Not logged in");
            sendResponse("Not logged in");
        }
        else{
            // Series of chained api calls due to async nature and promises
            // Goes spotify -> flask (genius search -> genius song info)
            spotify_read().then((data) => analysisFetch(data.item.name, data["item"]["artists"][0]["name"]).then((out) => {
                if (out==="None"){ 
                    sendResponse("bad");
                }
                else{
                    console.log(out);
                    sendResponse("success");
                }
            }));
        }
    }
    return true;
});