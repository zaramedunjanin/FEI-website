$(document).ready(function(){
    $("#editMeeting").on("submit", function(event){
        event.preventDefault();
        let id = parseInt($("#meeting-id").text());
        let code = $("#inputCode").val();
        let name = $("#inputName").val();
        let cover = $("#inputCover");
        let repeat = $("#inputRepeat option:selected").val();
        let date = $("#inputDate").val();
        if(date === '')
            date = $("#inputDate").attr("value");
        const reader = new FileReader();
        if(cover[0].files[0] != null) {
            reader.addEventListener("load", () => {
                $.ajax({
                    method: "POST",
                    action: "/upload",
                    url: "/presenter/meetings/update",
                    contentType: "application/json",
                    data: JSON.stringify({
                        id:id,
                        code: code,
                        name: name,
                        date: date,
                        repeat: repeat,
                        cover: reader.result
                    }),
                    success: function (res) {
                        if (res.valid)
                            window.location.href = "/presenter/meetings";
                        else
                            $("#error").show();
                    }
                })
            })
        }
        else{
            $.ajax({
                method: "POST",
                action: "/upload",
                url: "/presenter/meetings/update",
                contentType: "application/json",
                data: JSON.stringify({
                    id:id,
                    code: code,
                    name: name,
                    date: date,
                    repeat: repeat,
                    cover: reader.result
                }),
                success: function (res) {
                    if (res.valid)
                        window.location.href = "/presenter/meetings";
                    else
                        $("#error").show();
                }
            })
        }
        if(cover[0].files[0] != null)
            reader.readAsDataURL(cover[0].files[0]);
    });
});