// Spotify parameters needed for authorization
const Client_id=""; //Enter App Client id for spotify here
const redirect_uri = "https://<extension-id>.chromiumapp.org/"; //enter extension link, in format "https://<extension id>.chromiumapp.org/"
const scope = "user-read-currently-playing"; //scope of api permissions, just reading current track here
const authUrl = new URL("https://accounts.spotify.com/authorize"); //spotify auth url
const show_dialog = "true"; // forces user approval everytime 
let sp_token = "";  // auth token from implicit grant will be stored here
const server_ip = "http://127.0.0.1:5000/" //Flask server link

function mapSentimentToColor(sentiment) {
    // Ensure sentiment is within the range of -1 to 1
    sentiment = Math.max(-1, Math.min(1, sentiment));
  
    // Map sentiment to a value between 0 and 1
    const mappedValue = (sentiment + 1) / 2;
  
    // Interpolate between red (#ff0000) and green (#00ff00)
    const red = Math.round((1 - mappedValue) * 255);
    const green = Math.round(mappedValue * 255);
    const blue = 0;

    // Convert RGB values to a CSS color string
    const color = `rgb(${red}, ${green}, ${blue})`;
  
    return color;
  }

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
async function analysisFetch(song, artist) {
    const data = {song: song, artist: artist};
    const resp = await fetch(server_ip + "/analysis", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const output = await resp.json();
    if (output?.error) {
        console.log(`Error: ${output.error}`);
        throw Error;
    } else {
        // Display sentiment analysis results and cleaned lyrics
        console.log("Sentiment Scores:", output.sentiment.sentiment_scores);
        console.log("Sentiment:", output.sentiment.sentiment);
        console.log("Cleaned Lyrics:", output.lyrics);

        return output.sentiment.sentiment_scores; // To be updated in the pop-up for UI
    }
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
        else {
            // Series of chained API calls due to async nature and promises
            // Goes Spotify -> Flask (Genius search -> Genius song info)
            spotify_read().then((data) =>
                analysisFetch(data.item.name, data["item"]["artists"][0]["name"]).then((output) => {
                    if (output["error"]) {
                        console.log(`Error: ${output.error}`);
                        sendResponse({message: "bad"});
                    } else {
                        sendResponse(
                            {
                                message: "success",
                                respData: data,
                                score: output
                            });
                    }
                })
            );
        }
    }
    return true;
});