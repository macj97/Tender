// settings, kept in localStorage

const SETTINGS_KEY = "tenderSettings";

// the settings you start with, 5 miles and no location
function defaultSettings() {
    return {
        distanceMiles: 5,
        lat: null,
        lon: null
    };
}


// gets your saved settings back
function getSettings() {
    let saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
        return defaultSettings();
    }

    return JSON.parse(saved);
}


// saves your settings
function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


// wipes your settings, for the reset button
function clearSettings() {
    localStorage.removeItem(SETTINGS_KEY);
}


// have we got your location yet
function haveLocation() {
    let s = getSettings();
    return s.lat !== null && s.lon !== null;
}


// asks the browser where you are
function askForLocation(onDone) {
    if (!navigator.geolocation) {
        onDone(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        let s = getSettings();
        s.lat = position.coords.latitude;
        s.lon = position.coords.longitude;
        saveSettings(s);
        onDone(true);

    }, function() {
        onDone(false);
    });
}
