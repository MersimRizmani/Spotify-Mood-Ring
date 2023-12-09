from flask import Flask, request, session
from bs4 import BeautifulSoup
import logging
import requests
import webbrowser

app = Flask(__name__)

ge_token = ""

def get_song_link(song, artist):
    try:
        # First request to Genius API
        search_response = requests.get("https://api.genius.com/search?q=" + song, headers={"Authorization": "Bearer " + ge_token})
        search_response.raise_for_status()  # Raise HTTPError for bad responses
        search_result = search_response.json()

        # Looping through results to pull info, comparing artists to isolate
        chosen = "no hit"
        for hit in search_result["response"]["hits"]:
            if hit["result"]["primary_artist"]["name"] == artist:
                chosen = hit
                break

        if chosen != "no hit":
            # Second request to Genius API
            song_result_response = requests.get("https://api.genius.com" + chosen["result"]["api_path"], headers={"Authorization": "Bearer " + ge_token})
            song_result_response.raise_for_status()
            song_result = song_result_response.json()
            
            lyrics_link = song_result["response"]["song"]["path"]
            return lyrics_link
        else:
            return None

    except requests.exceptions.RequestException as e:
        print("Error in get_song_link:", e)
        return None

def extract_lyrics(lyrics_url):
    try:
        lyrics_response = requests.get("https://genius.com" + lyrics_url)
        print('lyrics_response:' + str(lyrics_response.text))
        lyrics_response.raise_for_status()
        soup = BeautifulSoup(lyrics_response.text, "html.parser")
        print('soup:' + str(soup))

        lyrics_containers = soup.find_all("div", {"data-lyrics-container": "true"})
        lyrics = "\n".join(container.get_text("\n") for container in lyrics_containers) if lyrics_containers else "Lyrics not found"
        print('lyrics:' + str(lyrics))

        return lyrics
    except requests.exceptions.RequestException as e:
        print("Error in extract_lyrics:", e)
        return {"error": "Request failed: {}".format(e)}
    
def open_webpage(url):
    print('Opening link in browser with URL:', url)
    webbrowser.open(url)


@app.route('/analysis', methods=["GET", "POST"])
def analyze():
    try:
        song = request.get_json()["song"]
        artist = request.get_json()["artist"]

        lyrics_link = get_song_link(song, artist)

        if lyrics_link is not None and lyrics_link.startswith('/'):
            full_link = 'https://genius.com' + lyrics_link
            print('full link:' + full_link)
            # open_webpage(full_link)

        # Extract lyrics from the Genius webpage
        if lyrics_link is not None:
            lyrics = extract_lyrics(lyrics_link)
            return {"link": lyrics_link, "lyrics": lyrics}
        else:
            return {"error": "Failed to get lyrics link"}

    except requests.exceptions.RequestException as e:
        print("Error in analyze:", e)
        return {"error": "Request failed: {}".format(e)}

if __name__ == '__main__':
    app.run(debug=True)
