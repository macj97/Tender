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


// finds the restaurants near you and puts pictures on them
function loadRestaurants(whenDone) {
    if (!haveLocation()) {
        whenDone(false);
        return;
    }

    let settings = getSettings();

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
            whenDone(true);
        });
    });
}
