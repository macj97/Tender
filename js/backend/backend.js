// https://www.w3schools.com/html/html5_geolocation.asp
// code snippet from w3schools.com

function getLocation() {
  alert("Getting your location...");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function success(position) {
  // filler alert function
  alert("Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);
  searchNearby(position.coords.latitude, position.coords.longitude);
}

function error() {
  alert("Sorry, no position available.");
}


// end of code snippet

async function searchNearby(latitude, longitude) {
  let query = `[out:json];node['amenity'='restaurant'](around:5000.0,${latitude},${longitude});
out geom;`;

  $.ajax({
    type: 'GET',
    url: "https://overpass-api.de/api/interpreter",
    data: { data: query },
    success: function (result) {
      RestaurantInfo.length = 0;

      for(let i = 0; i < 10 && i < result.elements.length; i++) { 
        let place = result.elements[i];
        let tags = place.tags || {};

        addRestaurant(
          tags.name || "Unknown",
          "data/panera.jpeg",
          tags.cuisine || "Unknown",
          tags.opening_hours || "Unknown",
          tags["addr:city"] || "Unknown"
        );
      }
      //console.log(JSON.stringify(result, null));
      console.log(RestaurantInfo);
      sessionStorage.setItem("RestaurantInfo", JSON.stringify(RestaurantInfo));
      window.location.href = "card.html";
    },
  });

}

$(function() {

    // distance setting

    let distance = $("#distance-range-slider").val();

    // console.log("distance: ", distance);

    $("#distance-range-slider").click(function () {
        distance = $("#distance-range-slider").val()
        console.log("distance is now: ", distance);
    });


    // dietary settings

});
