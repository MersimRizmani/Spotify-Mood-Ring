from pyodide import nltk 
from pyodide import bs4
from pyodide.http import pyfetch
from spotify_auth import auth

async def spotify_creds():
    bearer_token = auth()
    response = await pyfetch(url="https://api.spotify.com/v1/me/player/currently-playing", headers={"Authorization": f"Bearer {bearer_token}"}).json()
    return (response["item"]["name"], response["item"]["artists"][0]["name"])

async def genius_link(spotify_out):
    bearer_token = auth()
    response = await pyfetch(url=f"https://api.genius.com/search?q={spotify_out[0]}", headers={"Authorization": f"Bearer {bearer_token}"}).json()
     
    return response["item"]["name"]

def lyrics_scrape():



