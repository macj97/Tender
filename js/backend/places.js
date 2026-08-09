// google maps API

const PLACES_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";

const MAX_BIAS_METRES = 50000;


// photos
function photoUrl(photoName, width) {
    return "https://places.googleapis.com/v1/" + photoName +
        "/media?maxWidthPx=" + width + "&key=" + GOOGLE_PLACES_KEY;
}


function findPhoto(name, address, onDone) {
    if (!GOOGLE_PLACES_KEY) {
        onDone("");
        return;
    }

    let me = getSettings();

    // needs meters
    let metres = me.distanceMiles * 1609;
    if (metres > MAX_BIAS_METRES) {
        metres = MAX_BIAS_METRES;
    }

    $.ajax({
        type: "POST",
        url: PLACES_TEXT_URL,
        contentType: "application/json",
        timeout: 10000,
        headers: {
            "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
            "X-Goog-FieldMask": "places.photos"
        },
        data: JSON.stringify({
            textQuery: name + " " + address,
            maxResultCount: 1,

            locationBias: {
                circle: {
                    center: { latitude: me.lat, longitude: me.lon },
                    radius: metres
                }
            }
        }),

        success: function (result) {
            if (result.places && result.places[0] && result.places[0].photos) {
                onDone(photoUrl(result.places[0].photos[0].name, 600));
                return;
            }

            onDone("");
        },

        error: function () {
            onDone("");
        }
    });
}


function addPhotos(whenDone) {
    let waiting = RestaurantInfo.length;

    if (waiting === 0) {
        whenDone();
        return;
    }

    for (let i = 0; i < RestaurantInfo.length; i++) {
        let restaurant = RestaurantInfo[i];

        findPhoto(restaurant.Name, restaurant.Address, function (url) {
            if (url) {
                restaurant.image = url;
            }

            waiting = waiting - 1;

            if (waiting === 0) {
                whenDone();
            }
        });
    }
}
