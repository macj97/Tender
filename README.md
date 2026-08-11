# Tender

## Motivation

Everyone has had that moment, when out with friends, where your event went too long and unexpectedly you’ve run into dinnertime
and are all hungry. However, there’s no plans in place and no one can quite decide where to go. Tender was designed to solve that
problem by making groups choose a restaurant in a faster and more engaging way. 

## Project Overview

Tender is an "Food dating app" that shows users one restaurant at a time and
uses a swiping interface to help groups decide where to eat. Users can swipe right to like a restaurant or left to pass
on it. After everyone in the group has voted the app compares the group's choices and it will show the restaurants with
the most likes.

## Project Contributors

Jay Patel - jay_patel2@student.uml.edu
Joe Plummer - joseph_plummer@student.uml.edu
Hilary Stacy Jaen Rodriguez — hilary_jaenrodriguez@student.uml.edu
Riley Stevens - riley_stevens@student.uml.edu

## Project structure 

- `css/frontend.css` - Contains the custom styling for the app including swipe animations, card layout, results styling and responsive adjustments.
- `js/backend/backend.js` - it has the restaurant data retrieval and processing, OpenStreetMap search, backup API support,
and conversion of JSON results into the restaurant list used by the app.
- `js/backend/places.js` - Adds restaurant images using the Google Places API. It searches for a matching place photo, builds the image URL,
and updates each restaurant entry with a photo once all image requests are complete.
- `js/database/cloud.js` - Manages the app’s cloud group functionality using Supabase and also the groups, members, shared restaurant data, votes and live updates.
- `js/database/database.js` - Local vote storage and placeholder group data for saving likes, removing likes, clearing votes and calculating restaurant matches.
- `js/database/google-config.example.js` - Example file for setting up the Google Places API key.
- `js/database/google-config.js` - Stores the active Google Places API configuration used by the app to request restaurant photo data.
- `js/database/settings.js` - Stores and manages app settings like distance preferences and saved user location.
- `js/database/supabase-config.js` - Stores the Supabase project configuration and initializes the database client used by the app’s cloud features.
- `js/frontend/frontend.js` - Controls the app’s main user interface and swipe interactions.
- `js/frontend/pages.js` - Manages page setup and interactions throughout the app.
- `js/frontend/restaurantInfo.js` - Stores restaurant data and loads restaurant results into the app.
- `scripts/make-config.sh` - Generates the Google Places configuration file at build time by writing the API key from an environment variable into `js/database/google-config.js`.
- `card.html` - Displays the restaurant cards, swipe interface and action buttons for liking or passing restaurants.
- `groupselection.html` - Group setup page where users adjust settings, share the invite link, and start the swiping session.
- `index.html` - Home page that introduces the app, lets users enter their name and starts the Tender experience.
- `results.html` - Results page that shows the group’s top restaurant matches after everyone finishes voting.
- `settings.html` - Settings page where users share their location, adjust the search distance, and manage app preferences.
- `supabase-schema.sql` - Defines the Supabase database structure for groups, members, restaurants, votes and the access rules used by the app.
- `vercel.json` - Configures the Vercel deployment settings, it includes the build command, output folder and API header rules.
- `waiting.html` - Waiting page shown while the app checks if everyone in the group has finished voting.

## How to Run the App

- Clone the repository or download the Zip file.
- Run the project on a private server environment with your preferred IDE.
- Do not open the HTML files directly in the browser because some features require server permissions.
- Make sure the required API and database configuration files are set up.
- Start the App.

## How to Use the App

- Open the app and enter your name.
- Allow location access so Tender can find nearby restaurants.
- Go to the settings page and choose the search radius.
- Create or join a group using the shared link.
- Swipe right to like a restaurant or left to pass.
- Wait for the rest of the group to finish voting.
- View the results page to see the group’s top restaurant matches.

## Live App

- [Tender on Vercel](https://tender-dusky-omega.vercel.app/) - deployed version of the project.

## APIs and Platforms

In this project, we used the following APIs and platforms to make our features work: 
- [Overpass API / OpenStreetMap](https://wiki.openstreetmap.org/wiki/Overpass_API) - used to search for nearby restaurants based on the user’s location and selected distance radius.
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service) - used to get restaurant photo data for the restaurant cards.
- [Supabase](https://supabase.com/) - used to store shared group data, member information, restaurant lists and votes.

## Important Notes for Developers

- OpenStreetMap data requires attribution.
- Google Places content has caching and storage restrictions so restaurant photo data should be loaded dynamically instead of stored permanently.
- These services were used only to support the app’s features and have to follow their own terms and licenses.
- Loading time from the first page and when updating the settings may take several minutes due to query to OpenStreetMaps servers
