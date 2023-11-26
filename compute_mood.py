# import nltk 
# import bs4
# from js import document
# from pyodide.ffi import create_proxy
# from pyodide.http import pyfetch
from pyscript import when
#from spotify_auth import auth

@when("click", "#signin")
def spotify_creds(event):
    # bearer_token = auth()
    # response = await pyfetch(url="https://api.spotify.com/v1/me/player/currently-playing", headers={"Authorization": f"Bearer {bearer_token}"}).json()
    # return (response["item"]["name"], response["item"]["artists"][0]["name"])
    display("INNN")

# async def genius_link(spotify_out):
#     bearer_token = auth()
#     response = await pyfetch(url=f"https://api.genius.com/search?q={spotify_out[0]}", headers={"Authorization": f"Bearer {bearer_token}"}).json()
     
#     return response["item"]["name"]

def lyrics_scrape():
    return

# function_prox = create_proxy(spotify_creds)
# document.getElementById("signin").addEventListener("click", function_prox)
