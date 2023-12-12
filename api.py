from flask import Flask, request, session
from bs4 import BeautifulSoup
import logging
import requests
import webbrowser
from nltk.sentiment import SentimentIntensityAnalyzer
import re

app = Flask(__name__)

ge_token = ""

def get_song_link(song, artist):
    try:
        # First request to Genius API
        search_response = requests.get("https://api.genius.com/search?q=" + song + " " + artist, headers={"Authorization": "Bearer " + ge_token})
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
        lyrics_response.raise_for_status()
        soup = BeautifulSoup(lyrics_response.text, "html.parser")

        # Remove content within square brackets to clean lyrics from Genius
        for bracketed_text in soup.find_all(text=re.compile(r'\[.*?\]')):
            bracketed_text.extract()

        lyrics_containers = soup.find_all("div", {"data-lyrics-container": "true"})
        lyrics = "\n".join(container.get_text("\n") for container in lyrics_containers) if lyrics_containers else "Lyrics not found"

        return lyrics
    except requests.exceptions.RequestException as e:
        print("Error in extract_lyrics:", e)
        return {"error": "Request failed: {}".format(e)}
    
def open_webpage(url):
    print('Opening link in browser with URL:', url)
    webbrowser.open(url)

def analyze_lyrics_sentiment(lyrics):
    sia = SentimentIntensityAnalyzer()
    sentiment_scores = sia.polarity_scores(lyrics)
    # Interpreting the overall sentiment
    if sentiment_scores['compound'] >= 0.05:
        sentiment = 'positive'
    elif sentiment_scores['compound'] <= -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'

    return {"sentiment_scores": sentiment_scores, "sentiment": sentiment}


@app.route('/analysis', methods=["GET", "POST"])
def analyze():
    try:
        song = request.get_json()["song"]
        print(song)
        artist = request.get_json()["artist"]
        print(artist)

        lyrics_link = get_song_link(song, artist)
        print(lyrics_link)

        if lyrics_link is not None and lyrics_link.startswith('/'):
            full_link = 'https://genius.com' + lyrics_link
            print('full link:' + full_link)
            # open_webpage(full_link)

        # Extract lyrics from the Genius webpage
        if lyrics_link is not None:
            lyrics = extract_lyrics(lyrics_link)
            # Analyze sentiment of the cleaned lyrics
            sentiment_result = analyze_lyrics_sentiment(lyrics)
            return {"link": lyrics_link, "lyrics": lyrics, "sentiment": sentiment_result}
        else:
            return {"error": "Failed to get lyrics link"}

    except requests.exceptions.RequestException as e:
        print("Error in analyze:", e)
        return {"error": "Request failed: {}".format(e)}

if __name__ == '__main__':
    app.run(debug=True)
