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
        Address: address,
        //Distance: distance,
        //Rating: rating,
        //Price: price
    });
}


// Fills RestaurantInfo from data/test.json
// whenDone() runs after the file is read
function loadTestRestaurants(whenDone) {

    $.getJSON('data/test.json', function (result) {
    RestaurantInfo.length = 0

    // same first 10 that searchNearby() takes
    for (let i = 0; i < 10 && i < result.elements.length; i++) {
        let place = result.elements[i]
        let tags = place.tags || {}
        let address = ''
        if (tags['addr:housenumber']) {
            address = tags['addr:housenumber']
        }
        if (tags['addr:street']) {
            if (address) {
                address += ' '
            }
            address += tags['addr:street']
        }
        if (tags['addr:city']) {
            if (address) {
                address += ', '
            }
            address += tags['addr:city']
        }

        addRestaurant (
            tags.name || 'Name Unknown',
            'data/no-image-available.jpeg',
            tags.cuisine || 'Cuisine Unknown',
            tags.opening_hours || 'Hours Unknown',
            address
        )
    }

    console.log('loaded test restaurants: ', RestaurantInfo.length)

    whenDone()

    }).fail(function () {
        // without this a missing or broken test.json just leaves a blank page
        console.error('could not read data/test.json, no restaurants to show')
        whenDone()
    })
}
    