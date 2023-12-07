from flask import Flask, request, session
import logging
import requests

app = Flask(__name__)

ge_token = "Vo44AC8nubL2zS5Vsth3pNN49y2phHbG5Vg-iL7WCVUJo4Ordeq3Ex7cdooR3xFd"

@app.route('/analysis', methods=["GET", "POST"])
def analyze():
    song = request.get_json()["song"]
    artist = request.get_json()["artist"]
    search_result = requests.get("https://api.genius.com/search?q="+song, headers={"Authorization": "Bearer "+ ge_token}).json()
    chosen = "no hit"
    # Looping through results to pull info, comparing artists to isolate
    for hit in search_result["response"]["hits"]:
        if (hit["result"]["primary_artist"]["name"]==artist):
            chosen = hit
            break
    
    if chosen != "no hit":
        song_result = requests.get("https://api.genius.com"+chosen["result"]["api_path"], headers={"Authorization": "Bearer "+ge_token}).json()
        lyrics_link = song_result["response"]["song"]["path"]
        return {"link": lyrics_link}
    else:
        return {"link": "None"}

if __name__=='__main__':
    app.run(debug=True)
