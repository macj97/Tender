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