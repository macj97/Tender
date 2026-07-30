$(function() {
    let currentIndex = 0;  //Keeps track of which restaurant we are on
    let startX = 0;      // saves where the drag started
    let isSwiping = false;    //checks if the user is dragging
    let isAnimating = false;  //stops multiple swipes during the animation
    const swipeThreshold = 80;  //minimun drag distance to count as swipe

    function generateCard() {
        //if no cards left jumps to waiting.html
        if (currentIndex >= RestaurantInfo.length) {
            window.location.href = "waiting.html";
            return;
        }

        const restaurant = RestaurantInfo[currentIndex];

        let $card_container = $('<div id="card-container" class="container row"><div class="card col-10 col-md-6 col-lg-8 m-auto " id="restaurant-card">'+
            '<p class="card-title fs-2 fw-bold m-3 position-absolute">'+
            restaurant["Name"]+
            '</p><p class="card-text fs-5 text-secondary float-end text-end m-4 ">'+
            //  filler because it is not implemented in data structure yet
            (currentIndex+1)+' of '+RestaurantInfo.length+
            '</p><div class="card-body position-relative">'+
            '<div id="like-badge" class="swipe-badge like-badge">LIKE</div>'+
            '<div id="dislike-badge" class="swipe-badge dislike-badge">NOPE</div>'+ //added badges so the user can see a visual like/dislike 
            //'<img class="card-img-top img-fluid mx-auto border-bottom border-1 pb-4" '
            '<img class="card-img-top img-fluid mx-auto border-bottom border-1 pb-4" draggable="false" '+
            'src="'+restaurant["image"]+
            '" alt="Card image"><p class="card-text fw-bold fs-3 mt-2">'+
            restaurant["Cuisine"]+
            '</p><p class="card-text">'+
            restaurant["Hours"]+
            '</p><p class="card-text">'+
            restaurant["Rating"]+' out of 5 stars, '+restaurant["Price"]+
            '</p><p class="card-text text-success fw-bold float-start">'+
            restaurant["Address"]+
            '</p><p class="card-text text-secondary fw-bold float-end text-end">'+
            restaurant["Distance"]+
            '</p></div> </div>'+
            '<div class="d-flex justify-content-center gap-3 mt-3">'+
            '<button id="back-btn" class="btn btn-outline-secondary">Back</button>'+
            '<button id="left-btn" class="btn btn-outline-danger">Pass</button>'+
            '<button id="right-btn" class="btn btn-danger">Like</button>'+
            '</div>'+
            '<p class="text-center text-secondary mt-2">Drag the card or use the buttons. Left is pass, right is like.</p>'+
            '</div>');

        $("#card-root").html($card_container);

        $("#left-btn").on("click", function() {
            animateSwipe("dislike");  //clicking left, shows the animation
        });

        $("#right-btn").on("click", function() {
            animateSwipe("like");  //clicking right, shows the animation
        });

        $("#back-btn").on("click", function() {
            goBack();
        });

        if (currentIndex === 0) {
            $("#back-btn").prop("disabled", true);
        }
        //added backup buttons to the cards so they can still be tested without dragging
        addSwipeEvents();
    }
    //goes back one card
    function goBack() {
        if (isAnimating || currentIndex === 0) {
            return;
        }

        currentIndex = currentIndex - 1;
        removeLike(RestaurantInfo[currentIndex].Name);
        generateCard();
    }
    //this function handles the visual swipe effect before moving to the next card
    function animateSwipe(voteType) {
        if (isAnimating) {
            return;    
        }

        isAnimating = true;
        const $card = $("#restaurant-card");

        if (voteType === "like") {
            saveLike(RestaurantInfo[currentIndex].Name);

            $card.addClass("show-like");      //Show the LIKE badge and moves to the right
            setTimeout(function() {
                $card.addClass("swipe-right");
            }, 30);
        } else {
            $card.addClass("show-dislike"); // ELSE dislike/NOPE
            setTimeout(function() {
                $card.addClass("swipe-left");
            }, 30);
        }

        setTimeout(function() {
            goToNextCard();   //loads the next card
        }, 700);
    }
    function goToNextCard() {
        currentIndex = currentIndex + 1;
        isAnimating = false;
        generateCard();
    }
    //Here we are using drag, mouse, touch events from W3school
    function addSwipeEvents() {
        const $card = $("#restaurant-card");

        $card.off(".swipe");
        $(document).off(".swipe");

        $card.on("dragstart.swipe", function(event) {
            event.preventDefault();
        });
        //Starts tracking the drag when the user clicks or touches the card
        $card.on("mousedown.swipe touchstart.swipe", function(event) {
            if (isAnimating) {
                return;
            }
            isSwiping = true;
            if (event.type === "touchstart") {
                startX = event.originalEvent.touches[0].clientX;
            } else {
                startX = event.clientX;
            }
        });
        //checks where the drag ended to decide if it was left or right swipe
        $(document).on("mouseup.swipe touchend.swipe", function(event) {
            if (!isSwiping || isAnimating) {
                return;
            }

            isSwiping = false;

            let endX = startX;

            if (event.type === "touchend") {
                endX = event.originalEvent.changedTouches[0].clientX;
            } else {
                endX = event.clientX;
            }

            const difference = endX - startX;
            //right swipe = like, left swipe = dislike
            //uses the difference to see if it was a swipe left or right
        
            if (difference > swipeThreshold) {
                animateSwipe("like");
            } else if (difference < -swipeThreshold) {
                animateSwipe("dislike");
            }
        });
    }
    //builds the results rows
    function showResults() {
        let matches = getMatches();

        if (matches.length === 0) {
            $("#results-list").append('<li class="list-group-item fs-4 my-2">Nobody liked anything yet, try swiping again.</li>');
        }

        for (let i = 0; i < matches.length; i++) {
            let place = matches[i].Place;
            let likes = matches[i].Likes;

            //green dot for the winner, grey for the rest
            let dotColor = "text-secondary";
            if (i === 0) {
                dotColor = "text-success";
            }

            let mapsLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place.Address);

            let $row = $('<li class="list-group-item fs-3 my-2 border-bottom">'+
                '<i class="bi bi-circle-fill '+dotColor+'"></i> '+
                (i + 1)+'. '+place.Name+
                '<a class="btn btn-sm btn-outline-danger float-end" target="_blank" href="'+mapsLink+'">Directions</a>'+
                '<br><span class="fs-6 text-secondary">'+likes+' of '+GroupSize+' people liked this, '+place.Cuisine+'</span>'+
                '</li>');

            $("#results-list").append($row);
        }
        //ask before it clears the votes
        $("#button").on("click", function(event) {
            let sure = confirm("Start over? This clears what the group picked.");

            if (!sure) {
                event.preventDefault();
                return;
            }

            clearLikes();
        });
    }

    //check which page we are on
    if ($("#card-root").length > 0) {
        generateCard();
    }

    if ($("#results-list").length > 0) {
        showResults();
    }
});
/*
$(function() {

    function generateCard() {

        let current = 1;
        let total = 4;

        let $card_container = $('<div class="card ">'+
            '<p class="card-title fs-2 fw-bold m-3 position-absolute">'+
            RestaurantInfo["Name"]+
            '</p><p class="card-text fs-5 text-secondary float-end text-end m-4 ">'+
            //  filler because it is not implemented in data structure yet
            current+' of '+total+
            '</p><div class="card-body"><img class="card-img-top img-fluid mx-auto border-bottom border-1 pb-4" '+
            'src='+RestaurantInfo["image"]+
            ' alt="Card image"><p class="card-text fw-bold fs-3 mt-2">'+
            RestaurantInfo["Cuisine"]+
            '</p><p class="card-text">'+
            RestaurantInfo["Hours"]+
            '</p><p class="card-text text-success fw-bold float-start">'+
            RestaurantInfo["Address"]+
            '</p><p class="card-text text-danger fw-bold float-end text-end">'+
            RestaurantInfo["Distance"]+
            '</p></div></div>');

        $("#cardfront").append($card_container);
    }
    generateCard();
});*/