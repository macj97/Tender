//page wiring

$(function() {

    const GroupCode = getGroupCode();
    const inGroup = isCloudMode();

    function withCode(page) {
        if (!GroupCode) {
            return page;
        }

        return page + "?g=" + GroupCode;
    }


    // index.html

    //makes the group first
    $("#hungry-btn").on("click", function(event) {
        if (!db) {
            return;
        }

        event.preventDefault();

        let myName = $("#my-name").val().trim();

        if (!myName) {
            $("#name-error").removeClass("d-none");
            $("#my-name").focus();
            return;
        }

        $("#name-error").addClass("d-none");

        function showProblem(message) {
            $("#name-error").text(message).removeClass("d-none");
            $("#hungry-btn").text("I'm hungry");
        }

        function goSearch() {
            $("#hungry-btn").text("Finding places near you...");

            loadRestaurants(function(ok) {
                if (!ok) {
                    showProblem("Couldnt find anywhere near you, try a bigger distance.");
                    return;
                }

                $("#hungry-btn").text("Setting up your group...");

                createGroup(myName).then(function(code) {
                    if (!code) {
                        showProblem("Couldnt set up the group, try again.");
                        return;
                    }

                    window.location.href = "groupselection.html?g=" + code;
                });
            });
        }

        if (haveLocation()) {
            goSearch();
            return;
        }

        $("#hungry-btn").text("Asking for your location...");

        askForLocation(function(gotIt) {
            if (!gotIt) {
                showProblem("Tender needs your location. Turn it on in settings.");
                return;
            }

            goSearch();
        });
    });

    //enter submits
    $("#my-name").on("keypress", function(event) {
        if (event.which === 13) {
            $("#hungry-btn").trigger("click");
        }
    });

    $("#join-name").on("keypress", function(event) {
        if (event.which === 13) {
            $("#join-btn").trigger("click");
        }
    });


    // groupselection.html

    //the members list
    function showMembers() {
        let people = GroupMembers;

        if (inGroup) {
            loadMembers(GroupCode).then(function(rows) {
                let out = [];

                for (let i = 0; i < rows.length; i++) {
                    out.push({ Name: rows[i].name, Joined: rows[i].joined });
                }

                drawMembers(out);
            });
            return;
        }

        drawMembers(people);
    }

    function drawMembers(people) {
        $("#member-list").empty();

        for (let i = 0; i < people.length; i++) {
            let member = people[i];

            let dotColor = "text-secondary";
            let label = ' <span class="fs-6 text-secondary">invited</span>';

            if (member.Joined) {
                dotColor = "text-success";
                label = "";
            }

            //first one made the group
            if (i === 0) {
                label = ' <span class="fs-6 text-secondary">group leader</span>';
            }

            //px-0 lines them up
            $("#member-list").append('<li class="list-group-item px-0 py-1 border-0 border-bottom">'+
                '<i class="bi bi-circle-fill '+dotColor+'"></i> '+
                member.Name+label+'</li>');
        }
    }

    //new person off an invite link
    function showJoinBox() {
        let joinModal = new bootstrap.Modal(document.getElementById("join-modal"), {
            backdrop: "static",
            keyboard: false
        });

        joinModal.show();
        $("#join-name").focus();

        $("#join-btn").on("click", function() {
            let myName = $("#join-name").val().trim();

            if (!myName) {
                $("#join-error").removeClass("d-none");
                return;
            }

            $("#join-error").addClass("d-none");
            $("#join-btn").prop("disabled", true).text("Joining...");

            joinGroup(GroupCode, myName).then(function() {
                joinModal.hide();
                showMembers();
                watchMembers(GroupCode, showMembers);
            });
        });
    }

    if ($("#member-list").length > 0) {
        if (GroupCode) {
            $("#link").text(getInviteLink(GroupCode));
            $("#button").attr("href", withCode("card.html"));
        }

        //what radius this group used
        if (inGroup) {
            getGroupDistance(GroupCode).then(function(miles) {
                if (miles) {
                    $("#group-distance").text("Searching in a " + miles +
                        " mile radius of the group owner");
                }
            });
        }

        if (inGroup && !getMyMemberId(GroupCode)) {
            showJoinBox();
        } else {
            showMembers();

            if (inGroup) {
                watchMembers(GroupCode, showMembers);
            }
        }
    }

    //copy the invite link
    $("#copy").on("click", function() {
        navigator.clipboard.writeText($("#link").text());
        $("#copy").html(" Copied!");

        //put it back
        setTimeout(function() {
            $("#copy").html(" Copy");
        }, 2000);
    });


    // waiting.html
    //waits for the group

    if ($("#waiting-spinner").length > 0) {
        if (inGroup) {
            loadGroupPlaces(GroupCode).then(function() {
                let check = setInterval(function() {
                    everyoneIsDone(GroupCode).then(function(done) {
                        if (done) {
                            clearInterval(check);
                            window.location.href = withCode("results.html");
                        }
                    });
                }, 2000);
            });
        } else {
            setTimeout(function() {
                window.location.href = "results.html";
            }, 3000);
        }
    }


    // settings.html
    //saves on change

    function flashSaved() {
        $("#saved-note").removeClass("d-none");

        setTimeout(function() {
            $("#saved-note").addClass("d-none");
        }, 1500);
    }

    function showLocationStatus() {
        let settings = getSettings();

        if (haveLocation()) {
            $("#location-status").removeClass("text-secondary text-danger").addClass("text-success fw-bold")
                .text("shared (" + settings.lat.toFixed(3) + ", " + settings.lon.toFixed(3) + ")");
            $("#use-location").text("Update my location");
        } else {
            $("#location-status").removeClass("text-success text-danger fw-bold").addClass("text-secondary")
                .text("not shared yet");
            $("#use-location").text("Share my location");
        }
    }

    if ($("#reset-settings").length > 0) {
        let mine = getSettings();
        $("#distance-range-slider").val(mine.distanceMiles);
        $("#miles-bubble").text(mine.distanceMiles);
        showLocationStatus();

        //input, not click
        $("#distance-range-slider").on("input", function() {
            let settings = getSettings();
            settings.distanceMiles = Number($("#distance-range-slider").val());
            saveSettings(settings);

            $("#miles-bubble").text(settings.distanceMiles);
            flashSaved();
        });

        $("#reset-settings").on("click", function() {
            clearSettings();

            let fresh = defaultSettings();
            $("#distance-range-slider").val(fresh.distanceMiles);
            $("#miles-bubble").text(fresh.distanceMiles);
            showLocationStatus();
            flashSaved();
        });

        $("#use-location").on("click", function() {
            $("#use-location").prop("disabled", true).text("Asking your browser...");

            askForLocation(function(gotIt) {
                $("#use-location").prop("disabled", false);
                showLocationStatus();

                if (gotIt) {
                    flashSaved();
                } else {
                    $("#location-status").removeClass("text-secondary text-success fw-bold")
                        .addClass("text-danger")
                        .text("couldnt get it, Tender cant find places without it");
                }
            });
        });
    }

});
