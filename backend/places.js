// google maps API

const PLACES_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";


// makes the link for a restaurant picture
function photoUrl(photoName, width) {
    return "https://places.googleapis.com/v1/" + photoName +
        "/media?maxWidthPx=" + width + "&key=" + GOOGLE_PLACES_KEY;
}


// finds a picture for one restaurant
// AI: used AI to work out how to ask google for only the photo and nothing else
function findPhoto(name, address, onDone) {
    let me = getSettings();

    // needs meters
    let metres = me.distanceMiles * 1609;

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


// puts a picture on every restaurant
function addPhotos(whenDone) {
    let i = 0;

    function doNext() {
        if (i >= RestaurantInfo.length) {
            whenDone();
            return;
        }

        let restaurant = RestaurantInfo[i];

        findPhoto(restaurant.Name, restaurant.Address, function (url) {
            if (url) {
                restaurant.image = url;
            }

            i = i + 1;
            doNext();
        });
    }

    doNext();
}
