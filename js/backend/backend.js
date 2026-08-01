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
      console.log(JSON.stringify(result, null));
    },
  });

}

$(function() {

    // distance setting

    let distance = $("#sel1").find("option:selected").val();

    console.log("distance: ", distance);

    // Source - https://stackoverflow.com/a/29858665
    // Posted by Nick Bartlett, modified by community. See post 'Timeline' for change history
    // Retrieved 2026-07-30, License - CC BY-SA 3.0
    $("#sel1").change(function () {
        distance = $(this).find("option:selected").val();

        console.log("distance (after selected): ", distance);
    });


    // dietary settings

});
