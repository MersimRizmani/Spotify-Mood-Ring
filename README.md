# Spotify-Mood-Ring
Chrome Extension to analyze a Spotify listener’s current mood based off of the currently playing song

## Dependencies

### API Enablement
Need to have apps set up in Spotify Developer Dashboard and Genius API Client

Guide for setting up Spotify Web API app - https://developer.spotify.com/documentation/web-api/tutorials/getting-started

Guide for Genius API Client setup - https://docs.genius.com/#/getting-started-h1

### Chrome Extension
You need to set up the chrome extension

1. Go to chrome extension dashboard
2. Click "Load unpacked"
3. Choose the corresponding folder to this code

### Server

Make sure to have a terminal open which is located in your folder with the api.py file.

## Running the Application

1. Clone the repo and open it in your preferred IDE or text editor
2. Activate the virtual environment that is in the repo by opening a terminal and running the following command:

	  ```$ . .venv/bin/activate```
	
	If you have any issues, refer to the Flask installation documentation: https://flask.palletsprojects.com/en/3.0.x/installation/

3. Run the Flask server; to do this run the following command:

	```python api.py```

4. Retrieve your Client ID for the Spotify API from the app you created on the Spotify for Developers site
    1. Paste this on line 2 of backend.js in the code (should be commented //Enter App Client id for Spotify here)
5. Retrieve the Client Access Token from the app you created in Genius
    1. Paste this on Line 11 of api.py 
6. Navigate to your Chrome Extensions
    1. Select ‘Load Unpacked’
    2. Select the repo folder
    3. You can pin the extension to your Chrome toolbar for ease
7. Copy the extension ID
    1. Paste this extension ID on line 3 of backend.js (replacing the <extension-id> tag with your extension id)
    2. Take this new URL and paste it into both the Spotify and Genius Redirect URI fields on the apps you created 
    3. Reload your extension on the Chrome My Extensions page
8. Open Spotify and play a song
9. Open the extension, sign in, and analyze 
    1. Important note: a song must be currently playing when you click Analyze

## Implementation Details

### Branches

The development on this chrome extension can be seen via the branches we had created.

#### main

This branch is the main branch for our code, our final code is here. This is the main code used to run the extension.

#### js_oauth

This branch was created to handle development of oauth2 authorization for the Spotify Web API in javascript, integrating it into the extension.

#### flask_devel

This branch was created to develop the server code utilizing the Python framework Flask. This branch was also where we altered the javascript code to handle this implementation. 

#### python_development

This branch is essentially deprecated. The goal of this branch was to use a HTML/CSS & PyScript approach to developing our extension as opposed to the HTML/CSS, JavaScript, and Python (Flask) implementation we ended up using. The reason we decided to abort this approach was we were noticing some deficiencies with using PyScript for Oauth2 authorization API calls for Spotify and we saw when we ran into issues we struggled to find adequate documentation for assistance. Considering the time we had available, we decided to adopt a more traditional approach for our extension development.

### Componenets of the Extension

#### Front-End

The front end is made with HTML/CSS. We have two files here, popup.html and popup.css. This defines the structure and design of our front end for the extension.

#### JS Middleware

This is seen in the popup.js file. This is where we have our handlers to perform actions, namely connecting to the Spotify API and server. The sign in handler connects to the spotify authorization API. The analyze handler calls the Spotify Web API and the server analysis endpoint. There is also a handler on load to check for existing auth tokens. We also have a backend.js file. This file is the manifest file for our extensions, allowing permissions for what actions can be taken and what hosts can be connected to. 

#### Server

This is seen in our.venv folder and our api.py file. The .venv folder holds all the python dependencies we need to run this server, and must be activated before running the api.py file. The api.py file acts as our server file. This is where we declare the Flask app and set up the analysis endpoint to perform webscraping and perform sentiment analysis. 

## Contributions

Abhilash
- Implemented API authentication for calls to Spotify and Genius along with barebones Flask server for the backend

Mersim
- Designed user interface and connected frontend to backend in order to fetch sentiment scores and mapped the sentiment scores to a color on the mood ring. 

Vish
- Cleaned lyrics after it was scraped for the specific songs to only contain lyrics relevant to the content of the song. Used Vader NLTK for sentiment analysis to assign score based on if it was positive, neutral or negative and then finally an overall sentiment.

Sotheara
- Extracted lyrics from currently playing song using BeautifulSoup web scraping to pass along the text data to the SentimentIntensityAnalyzer 
