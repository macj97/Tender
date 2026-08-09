// everything that talks to supabase


// the group code rides in the url like groupselection.html?g=k4f9x2
function getGroupCode() {
    return new URLSearchParams(window.location.search).get("g");
}

function isCloudMode() {
    if (!db) {
        return false;
    }

    if (!getGroupCode()) {
        return false;
    }

    return true;
}

// 6 random letters and numbers
function makeCode() {
    return Math.random().toString(36).slice(2, 8);
}

function getMyMemberId(code) {
    return localStorage.getItem("tenderMember_" + code);
}

function setMyMemberId(code, id) {
    localStorage.setItem("tenderMember_" + code, id);
}

// the url for the invite box
function getInviteLink(code) {
    let path = window.location.pathname;

    // if somebody is on card.html or wherever, still hand out the groupselection link
    path = path.slice(0, path.lastIndexOf("/") + 1) + "groupselection.html";

    return window.location.origin + path + "?g=" + code;
}


// pulls the photo name back out of a url
function photoRefFromUrl(url) {
    if (!url) {
        return "";
    }

    let start = url.indexOf("/v1/");
    let end = url.indexOf("/media");

    if (start === -1 || end === -1) {
        return "";
    }

    return url.slice(start + 4, end);
}


// makes the group, adds me, and freezes the restaurant list
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
            // the name not the url, the url has our key on it
            photo_ref: photoRefFromUrl(place.image)
        });
    }

    await db.from("places").insert(rows);

    return code;
}


// what radius this group was searched with
async function getGroupDistance(code) {
    let result = await db.from("groups").select("distance_miles").eq("code", code).single();

    return result.data.distance_miles;
}


// somebody opened the invite link, add them to the group
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


async function loadMembers(code) {
    let result = await db.from("members")
        .select("id, name, joined")
        .eq("group_code", code)
        .order("created_at");

    return result.data;
}


// the list we froze when the group was made
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

        // rebuild the url with our own key
        let image = "data/no-image-available.jpeg";
        if (row.photo_ref) {
            image = photoUrl(row.photo_ref, 600);
        }

        addRestaurant(row.name, image, row.cuisine, row.hours, row.address);
    }

    return RestaurantInfo.length > 0;
}


// upsert so a second Like doesnt blow up on the primary key
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


// for the Back button
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


async function loadVotes(code) {
    let result = await db.from("votes")
        .select("member_id, place_name, liked")
        .eq("group_code", code);

    return result.data;
}


// counts the real votes
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


// has everybody finished?
async function everyoneIsDone(code) {
    let members = await loadMembers(code);
    let votes = await loadVotes(code);

    if (members.length === 0 || RestaurantInfo.length === 0) {
        return false;
    }

    return votes.length >= members.length * RestaurantInfo.length;
}


// realtime, so the members list updates without a refresh
function watchMembers(code, onChange) {
    db.channel("members-" + code)
        .on("postgres_changes",
            { event: "*", schema: "public", table: "members", filter: "group_code=eq." + code },
            function () {
                onChange();
            })
        .subscribe();
}
