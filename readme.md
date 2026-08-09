# Tender

Swipe through restaurants near you and see what your group agrees on.

## running it

Needs to be on a server, it wont work by just opening the file.

    python3 -m http.server

then go to http://localhost:8000

## the google key

`js/database/google-config.js` isnt on github because it has my api key in it.
Copy `js/database/google-config.example.js` to `js/database/google-config.js`
and put your own Google Places key in it.

On Vercel the key comes from the GOOGLE_PLACES_KEY environment variable instead.
