// To be used to store the information gathered about restaurants
// I created these 3 just to see if the swipping animation works
// still to do: dietary, delivery, menu link
let RestaurantInfo = [];

funtion addRestaurant(name, image, cuisine, hours, address, distance, rating, price) {
RestaurantInfo.push({
    Name: name,
    image: image,
    Cuisine: cuisine,
    Hours: hours,
    Address: address,
    Distance: distance,
    Rating: rating,
    Price: price
});
}
    
