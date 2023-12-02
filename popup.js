document.getElementById("signin").addEventListener('click', function(){
    chrome.runtime.sendMessage("signin", resp =>{
        if (resp.message==="success")
            console.log("signed in");
    })
});