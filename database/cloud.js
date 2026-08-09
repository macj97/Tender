// everything that talks to supabase


// gets the group code off the end of the address
function getGroupCode() {
    return new URLSearchParams(window.location.search).get("g");
}

// are we in a group or on our own
function isCloudMode() {
    if (!db) {
        return false;
    }

    if (!getGroupCode()) {
        return false;
    }

    return true;
}

// makes a random code for a new group
function makeCode() {
    return Math.random().toString(36).slice(2, 8);
}

// which person in the group am i
function getMyMemberId(code) {
    return localStorage.getItem("tenderMember_" + code);
}

// remembers which person in the group i am
function setMyMemberId(code, id) {
    localStorage.setItem("tenderMember_" + code, id);
}

// makes the invite link you send your friends
function getInviteLink(code) {
    let path = window.location.pathname;

    // if somebody is on card.html or wherever, still hand out the groupselection link
    path = path.slice(0, path.lastIndexOf("/") + 1) + "groupselection.html";

    return window.location.origin + path + "?g=" + code;
}


// makes a new group and saves the restaurant list for it
// AI: used AI to help me work out how to copy the restaurant list onto the group when its made
async function createGroup(myName) {
    let code = makeCode();

    let madeGroup = await db.from("groups")
        .insert({ code: code, distance_miles: getSettings().distanceMiles })
        .select()
        .single();

    if (madeGroup.error) {
        return null;
    }

    let me = await db.from("members")
        .insert({ group_code: code, name: myName, joined: true })
        .select()
        .single();

    if (me.error) {
        return null;
    }

    setMyMemberId(code, me.data.id);

    // copy whatever is in RestaurantInfo into the places table for this group
    let rows = [];

    for (let i = 0; i < RestaurantInfo.length; i++) {
        let place = RestaurantInfo[i];

        rows.push({
            group_code: code,
            position: i,
            name: place.Name,
            cuisine: place.Cuisine,
            hours: place.Hours,
            address: place.Address,
            photo_ref: place.image
        });
    }

    await db.from("places").insert(rows);

    return code;
}


// how far the group is searching
async function getGroupDistance(code) {
    let result = await db.from("groups").select("distance_miles").eq("code", code).single();

    return result.data.distance_miles;
}


// adds somebody to the group
async function joinGroup(code, name) {
    let me = await db.from("members")
        .insert({ group_code: code, name: name, joined: true })
        .select()
        .single();

    if (me.error) {
        return null;
    }

    setMyMemberId(code, me.data.id);

    return me.data.id;
}


// gets everybody in the group
async function loadMembers(code) {
    let result = await db.from("members")
        .select("id, name, joined")
        .eq("group_code", code)
        .order("created_at");

    return result.data;
}


// gets the groups restaurant list back
async function loadGroupPlaces(code) {
    let result = await db.from("places")
        .select("name, cuisine, hours, address, photo_ref")
        .eq("group_code", code)
        .order("position");

    if (result.error) {
        return false;
    }

    RestaurantInfo.length = 0;

    // repeats overwrite each others votes
    let seenNames = [];

    for (let i = 0; i < result.data.length; i++) {
        let row = result.data[i];

        if (seenNames.indexOf(row.name) > -1) {
            continue;
        }

        seenNames.push(row.name);

        let image = "data/no-image-available.jpeg";
        if (row.photo_ref) {
            image = row.photo_ref;
        }

        addRestaurant(row.name, image, row.cuisine, row.hours, row.address);
    }

    return RestaurantInfo.length > 0;
}


// saves a like or a pass
async function saveVote(code, placeName, liked) {
    let memberId = getMyMemberId(code);

    if (!memberId) {
        return;
    }

    await db.from("votes").upsert({
        group_code: code,
        member_id: memberId,
        place_name: placeName,
        liked: liked
    });
}


// takes a vote back off, for the back button
async function deleteVote(code, placeName) {
    let memberId = getMyMemberId(code);

    if (!memberId) {
        return;
    }

    await db.from("votes")
        .delete()
        .eq("group_code", code)
        .eq("member_id", memberId)
        .eq("place_name", placeName);
}


// gets all the votes for the group
async function loadVotes(code) {
    let result = await db.from("votes")
        .select("member_id, place_name, liked")
        .eq("group_code", code);

    return result.data;
}


// counts the likes and puts the best one first
async function getCloudMatches(code) {
    let votes = await loadVotes(code);
    let matches = [];

    for (let i = 0; i < RestaurantInfo.length; i++) {
        let place = RestaurantInfo[i];
        let likes = 0;

        for (let j = 0; j < votes.length; j++) {
            if (votes[j].place_name === place.Name && votes[j].liked) {
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


// has everybody finished swiping yet
async function everyoneIsDone(code) {
    let members = await loadMembers(code);
    let votes = await loadVotes(code);

    if (members.length === 0 || RestaurantInfo.length === 0) {
        return false;
    }

    return votes.length >= members.length * RestaurantInfo.length;
}


// keeps the list of people up to date
// AI: used AI to get the members list updating on its own without a refresh
function watchMembers(code, onChange) {
    db.channel("members-" + code)
        .on("postgres_changes",
            { event: "*", schema: "public", table: "members", filter: "group_code=eq." + code },
            function () {
                onChange();
            })
        .subscribe();
}
