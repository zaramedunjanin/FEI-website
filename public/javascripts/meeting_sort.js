$(document).ready(function(){
    $("#sort-time-asc").on("click", function(event){
        event.preventDefault();
        let sort = $("#sort-time-asc").text();
            $.ajax({
                method: "GET",
                action: "/upload",
                url: "/presenter/meetings",
                contentType: "application/json",
                data: {
                    sort: sort,
                },
                success: function (res) {
    alert(res)
                }
            })

    });
    $("#sort-time-desc").on("click", function(event){
        event.preventDefault();
        let sort = $("#sort-time-desc").text();
        $.ajax({
            method: "GET",
            url: "/presenter/meetings",
            contentType: "application/json",
            data: {
                sort: sort,
            },
            success: function (res) {
                $("#sort-time-asc").html('Njam');

            }
        })

    });
});