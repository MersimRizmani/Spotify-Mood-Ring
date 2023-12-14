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

### JS Middleware

