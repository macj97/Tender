// To be used to store the information gathered about restaurants
// I created these 3 just to see if the swipping animation works
// still to do: dietary, delivery, menu link
let RestaurantInfo = [];

function addRestaurant(name, image, cuisine, hours, address) {
    RestaurantInfo.push({
        Name: name,
        image: image,
        Cuisine: cuisine,
        Hours: hours,
        Address: address
    });
}


// Fills RestaurantInfo from openstreetmap
function loadRestaurants(whenDone) {
    if (!haveLocation()) {
        whenDone(false);
        return;
    }

    let settings = getSettings();

    // dont search twice for the same thing
    let saved = getSavedSearch(settings.lat, settings.lon, settings.distanceMiles);

    if (saved) {
        RestaurantInfo.length = 0;

        for (let i = 0; i < saved.places.length; i++) {
            let place = saved.places[i];
            addRestaurant(place.Name, place.image, place.Cuisine, place.Hours, place.Address);
        }

        whenDone(true);
        return;
    }

    searchNearbyOSM(settings.lat, settings.lon, function (ok, elements) {
        if (!ok) {
            whenDone(false);
            return;
        }

        fillFromOSM(elements);

        if (RestaurantInfo.length === 0) {
            whenDone(false);
            return;
        }

        addPhotos(function () {
            saveSearch(settings.lat, settings.lon, settings.distanceMiles, RestaurantInfo);
            whenDone(true);
        });
    });
}


// keeps the last search
const SEARCH_KEY = 'tenderLastSearch'
const SEARCH_MINUTES = 10

// rounded off
function searchKeyFor(lat, lon, miles) {
    return lat.toFixed(3) + ',' + lon.toFixed(3) + ',' + miles
}

function getSavedSearch(lat, lon, miles) {
    let raw = localStorage.getItem(SEARCH_KEY)

    if (!raw) {
        return null
    }

    let saved = JSON.parse(raw)

    if (saved.key !== searchKeyFor(lat, lon, miles)) {
        return null
    }

    if (new Date().getTime() - saved.when > SEARCH_MINUTES * 60 * 1000) {
        return null
    }

    return saved
}

function saveSearch(lat, lon, miles, places) {
    localStorage.setItem(SEARCH_KEY, JSON.stringify({
        key: searchKeyFor(lat, lon, miles),
        when: new Date().getTime(),
        places: places
    }))
}
