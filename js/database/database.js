$(function() {

    // keeps the votes until we have supabase

    let GroupSize = 4;

    // placeholder votes for the other 3 people
    let OtherPeopleVotes = [
        { Member: "Joseph", Liked: ["Panera Bread", "McDonald's"] },
        { Member: "Riley", Liked: ["McDonald's", "Applebee's"] },
        { Member: "Hilary", Liked: ["McDonald's"] }
    ];

    function saveLike(name) {
        let liked = getMyLikes();

        if (liked.indexOf(name) === -1) {
            liked.push(name);
        }

        sessionStorage.setItem("tenderLikes", JSON.stringify(liked));
    }

    function getMyLikes() {
        let saved = sessionStorage.getItem("tenderLikes");

        if (saved) {
            return JSON.parse(saved);
        }

        return [];
    }

    function removeLike(name) {
        let liked = getMyLikes();
        let spot = liked.indexOf(name);

        if (spot > -1) {
            liked.splice(spot, 1);
        }

        sessionStorage.setItem("tenderLikes", JSON.stringify(liked));
    }

    function clearLikes() {
        sessionStorage.removeItem("tenderLikes");
    }

    // counts the likes then sorts so the most liked is first
    function getMatches() {
        let myLikes = getMyLikes();
        let matches = [];

        for (let i = 0; i < RestaurantInfo.length; i++) {
            let place = RestaurantInfo[i];
            let likes = 0;

            if (myLikes.indexOf(place.Name) > -1) {
                likes = likes + 1;
            }

            for (let j = 0; j < OtherPeopleVotes.length; j++) {
                if (OtherPeopleVotes[j].Liked.indexOf(place.Name) > -1) {
                    likes = likes + 1;
                }
            }

                    if (likes > 0) {
                matches.push({ Place: place, Likes: likes });
            }
        }

        matches.sort(function(a, b) {
            return b.Likes - a.Likes;
        });

        return matches;
    }

});
