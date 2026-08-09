// settings, kept in localStorage

const SETTINGS_KEY = "tenderSettings";

function defaultSettings() {
    return {
        distanceMiles: 5,
        lat: null,
        lon: null
    };
}


function getSettings() {
    let saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
        return defaultSettings();
    }

    return JSON.parse(saved);
}


function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}


function clearSettings() {
    localStorage.removeItem(SETTINGS_KEY);
}


// have we got a location
function haveLocation() {
    let s = getSettings();
    return s.lat !== null && s.lon !== null;
}


// asks the browser for the location
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
