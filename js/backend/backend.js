// build address by housenumber, street, and city
function osmAddress(tags) {
    let address = "";

    if (tags["addr:housenumber"]) {
        address = tags["addr:housenumber"];
    }
    if (tags["addr:street"]) {
        if (address) {
            address += " ";
        }
        address += tags["addr:street"];
    }
    if (tags["addr:city"]) {
        if (address) {
            address += ", ";
        }
        address += tags["addr:city"];
    }

    return address;
}


// the main overpass server goes down a lot so theres backups
// "https://overpass-api.de/api/interpreter" was the first listed
const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter"
];

// goes and finds the resturants near you
function searchNearbyOSM(latitude, longitude, onDone, which) {
    if (!which) {
        which = 0;
    }

    let miles = getSettings().distanceMiles;

    // needs meters
    let metres = miles * 1609;

    let query = "[out:json];node['amenity'='restaurant'](around:" + metres + "," +
        latitude + "," + longitude + ");out geom;";

    $.ajax({
        type: "GET",
        url: OVERPASS_URLS[which],
        crossDomain: true,
        data: { data: query },
        
        success: function (result) {
            onDone(true, result.elements);
        },

        error: function () {
            if (which + 1 < OVERPASS_URLS.length) {
                console.log("that overpass server didnt work, trying the next one");
                searchNearbyOSM(latitude, longitude, onDone, which + 1);
                return;
            }

            onDone(false);
        }
    });
}


// turn json into our restaurant list
function fillFromOSM(elements) {
    RestaurantInfo.length = 0;

    // for 2 places with the same name
    let seenNames = [];

    for (let i = 0; i < elements.length; i++) {
        if (RestaurantInfo.length === 10) { // TO-DO: '10' should be a variable
            break;
        }

        let place = elements[i];
        let tags = place.tags || {};
        let name = tags.name || "Name Unknown";

        if (seenNames.indexOf(name) > -1) {
            continue;
        }

        seenNames.push(name);

        // default to "No image available" for the restaurant pic
        addRestaurant(
            name,
            "data/no-image-available.jpeg",
            tags.cuisine || "Cuisine Unknown",
            tags.opening_hours || "Hours Unknown",
            osmAddress(tags)
        );
    }

    console.log("loaded restaurants: ", RestaurantInfo.length);
}
