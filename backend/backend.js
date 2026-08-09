// puts the address together out of the bits we get back
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


const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// goes and finds the restaurants near you
function searchNearbyOSM(latitude, longitude, onDone) {
    let miles = getSettings().distanceMiles;

    // needs meters
    let metres = miles * 1609;

    let query = "[out:json];node['amenity'='restaurant'](around:" + metres + "," +
        latitude + "," + longitude + ");out geom;";

    $.ajax({
        type: "GET",
        url: OVERPASS_URL,
        data: { data: query },
        timeout: 20000,

        success: function (result) {
            onDone(true, result.elements);
        },

        error: function () {
            onDone(false);
        }
    });
}


// puts what came back into our restaurant list
function fillFromOSM(elements) {
    RestaurantInfo.length = 0;

    // for 2 places with the same name
    let seenNames = [];

    for (let i = 0; i < elements.length; i++) {
        if (RestaurantInfo.length === 10) {
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
