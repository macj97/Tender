$(function() {

    //the ?g= code off the url
    const GroupCode = getGroupCode();
    const inGroup = isCloudMode();

    //keeps the group code on the url
    function withCode(page) {
        if (!GroupCode) {
            return page;
        }

        return page + "?g=" + GroupCode;
    }

    function cardImage(restaurant) {
        return '<img class="card-img-top" draggable="false" src="'+restaurant.image+
            '" alt="Card image">';
    }

    //message where the card goes
    function showCardMessage(title, text, linkText, linkHref) {
        $("#card-root").html('<div class="row"><div class="card col-11 col-md-8 col-lg-5 m-auto">'+
            '<div class="card-body text-center">'+
            '<p class="fs-4 fw-bold mt-2">'+title+'</p>'+
            '<p class="text-secondary">'+text+'</p>'+
            '<a href="'+linkHref+'" class="btn fw-bold text-white bg-danger mb-2">'+linkText+'</a>'+
            '</div></div></div>');
    }

    let currentIndex = 0;  //Keeps track of which restaurant we are on
    let startX = 0;      // saves where the drag started
    let currentX = 0;    // how far weve dragged
    let isSwiping = false;    //checks if the user is dragging
    let isAnimating = false;  //stops multiple swipes during the animation
    const swipeThreshold = 80;  //minimun drag distance to count as swipe

    function generateCard() {
        //nothing came back
        if (RestaurantInfo.length === 0) {
            showCardMessage("Nothing to swipe",
                "We didnt find anywhere near you. Try turning the distance up.",
                "Open settings", "settings.html");
            return;
        }

        //if no cards left jumps to waiting.html
        if (currentIndex >= RestaurantInfo.length) {
            window.location.href = withCode("waiting.html");
            return;
        }

        const restaurant = RestaurantInfo[currentIndex];

        //was off centre with container and row both on
        let $card_container = $('<div id="card-container" class="row"><div class="card col-11 col-md-8 col-lg-5 m-auto" id="restaurant-card">'+
            '<div class="card-body position-relative">'+
            '<div id="like-badge" class="swipe-badge like-badge">LIKE</div>'+
            '<div id="dislike-badge" class="swipe-badge dislike-badge">NOPE</div>'+ //added badges so the user can see a visual like/dislike 
            //the name used to sit on top of the counter
            '<div class="d-flex justify-content-between align-items-center mb-3">'+
            '<p class="card-title fs-4 fw-bold mb-0">'+
            restaurant["Name"]+
            '</p><p class="card-text fs-6 text-secondary mb-0 ms-2 text-nowrap">'+
            (currentIndex+1)+' of '+RestaurantInfo.length+
            '</p></div>'+
            cardImage(restaurant)+
            '<p class="card-text fw-bold fs-5 mt-3 mb-1">'+
            restaurant["Cuisine"]+
            '</p><p class="card-text">'+
            restaurant["Hours"]+
            '</p><p class="card-text text-success fw-bold">'+
            restaurant["Address"]+
            '</p>'+
            '</div> </div>'+
            '<div class="col-12 text-center mt-3">'+
            '<div class="d-flex justify-content-center gap-3">'+
            '<button id="back-btn" class="btn btn-outline-secondary">Back</button>'+
            //red and green like the badges
            '<button id="left-btn" class="btn btn-danger">Pass</button>'+
            '<button id="right-btn" class="btn btn-success">Like</button>'+
            '</div>'+
            '<p class="text-secondary small mt-2 mb-0">Drag the card, or use the buttons.</p>'+
            '</div>'+
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

        if (inGroup) {
            deleteVote(GroupCode, RestaurantInfo[currentIndex].Name);
        }

        generateCard();
    }

    //this function handles the visual swipe effect before moving to the next card
    function animateSwipe(voteType) {
        if (isAnimating) {
            return;    
        }

        isAnimating = true;
        const $card = $("#restaurant-card");

        //clear the drag transform first
        $card.removeClass("dragging");
        $card.css("transform", "");

        //passes too, thats how we know youre done
        if (inGroup) {
            saveVote(GroupCode, RestaurantInfo[currentIndex].Name, voteType === "like");
        }

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
        }, 300);
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
            currentX = 0;
            $card.addClass("dragging");
            if (event.type === "touchstart") {
                startX = event.originalEvent.touches[0].clientX;
            } else {
                startX = event.clientX;
            }
        });

        //follows your finger
        $(document).on("mousemove.swipe touchmove.swipe", function(event) {
            if (!isSwiping || isAnimating) {
                return;
            }

            if (event.type === "touchmove") {
                currentX = event.originalEvent.touches[0].clientX - startX;
            } else {
                currentX = event.clientX - startX;
            }

            $card.css("transform", "translateX("+currentX+"px) rotate("+(currentX / 20)+"deg)");

            //badge once youve dragged far enough
            $card.removeClass("show-like show-dislike");
            if (currentX > swipeThreshold) {
                $card.addClass("show-like");
            } else if (currentX < -swipeThreshold) {
                $card.addClass("show-dislike");
            }
        });
        //checks where the drag ended to decide if it was left or right swipe
        $(document).on("mouseup.swipe touchend.swipe", function(event) {
            if (!isSwiping || isAnimating) {
                return;
            }

            isSwiping = false;
            $card.removeClass("dragging");

            //right swipe = like, left swipe = dislike
            //uses the difference to see if it was a swipe left or right
        
            if (currentX > swipeThreshold) {
                animateSwipe("like");
            } else if (currentX < -swipeThreshold) {
                animateSwipe("dislike");
            } else {
                //snap back
                $card.removeClass("show-like show-dislike");
                $card.css("transform", "");
            }
        });
    }

    //builds the results rows
    async function showResults() {
        let matches = getMatches();
        let groupSize = GroupSize;

        //real votes in a group
        if (inGroup) {
            matches = await getCloudMatches(GroupCode);
            groupSize = (await loadMembers(GroupCode)).length;
        }

        if (matches.length === 0) {
            $("#results-list").append('<li class="list-group-item fs-4 my-2">Nobody liked anything yet, try swiping again.</li>');
        }

        for (let i = 0; i < matches.length; i++) {
            let place = matches[i].Place;
            let likes = matches[i].Likes;

            //a box for the top 3
            let boxClass = "";
            if (i === 0) {
                boxClass = "result-1";
            } else if (i === 1) {
                boxClass = "result-2";
            } else if (i === 2) {
                boxClass = "result-3";
            }

            //name goes in the search too
            let mapsLink = "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(place.Name + ", " + place.Address);

            let $row = $('<li class="list-group-item px-0 border-0 mb-2 rounded-3 '+boxClass+'">'+
                '<div class="d-flex align-items-center gap-3 p-2">'+
                '<div class="flex-grow-1 result-text">'+
                '<p class="fs-5 fw-bold mb-0 result-name">'+(i + 1)+'. '+place.Name+'</p>'+
                '<p class="fs-6 text-secondary mb-0">'+likes+' of '+groupSize+
                ' liked this, '+place.Cuisine+'</p>'+
                '</div>'+
                '<a class="btn btn-sm btn-outline-danger text-nowrap" target="_blank" href="'+
                mapsLink+'">Directions</a>'+
                '</div>'+
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
        if (inGroup) {
            //the frozen list
            loadGroupPlaces(GroupCode).then(function(gotThem) {
                if (gotThem) {
                    generateCard();
                } else {
                    showCardMessage("This group has no places saved",
                        "Whoever started it needs to set it up again.",
                        "Start over", "index.html");
                }
            });
        } else {
            showCardMessage("Finding places near you", "One second.", "Settings", "settings.html");

            loadRestaurants(function(ok) {
                if (!ok) {
                    showCardMessage("Couldnt find anywhere",
                        "Check your location is on and try turning the distance up.",
                        "Open settings", "settings.html");
                    return;
                }

                generateCard();
            });
        }
    }

    if ($("#results-list").length > 0) {
        if (inGroup) {
            loadGroupPlaces(GroupCode).then(function() {
                showResults();
            });
        } else {
            loadRestaurants(function() {
                showResults();
            });
        }
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