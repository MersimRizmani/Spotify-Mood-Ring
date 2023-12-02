const Client_id="";
const redirect_uri = "";
const scope = "user-read-currently-playing";
const authUrl = new URL("https://accounts.spotify.com/authorize")
const show_dialog = "true"
let sp_token = ""

function generateRandomString(length){
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message==="signin"){
        let state = generateRandomString(16);
        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(Client_id);
        url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        url += '&state=' + encodeURIComponent(state);
        url += '&show_dialog=' + encodeURIComponent(show_dialog);
        console.log(url)

        chrome.identity.launchWebAuthFlow({interactive: true, url: url}, function(redirected_url){
            console.log(redirected_url)
            let params = new URLSearchParams(redirected_url)
            console.log(params)
            if (redirected_url.includes("error")){
                console.log("oops")
                sendResponse({message: "error"})
            }
            else{
                if (params.get("state")===state){
                    console.log("yay")
                    sp_token = params.get("access_token")
                    sendResponse({message: "success"})
                }
            }
        });
    }
    return true;
});