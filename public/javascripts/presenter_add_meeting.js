$(document).ready(function(){
    $("#addMeeting").on("submit", function(event){
        event.preventDefault();
        let code = $("#inputCode").val();
        let name = $("#inputName").val();
        let cover = $("#inputCover");
        let repeat = $("#inputRepeat option:selected").val();
        let date = $("#inputDate").val();

        const reader = new FileReader();
        if(cover[0].files[0] != null) {
            reader.addEventListener("load", () => {
                $.ajax({
                    method: "POST",
                    action: "/upload",
                    url: "/presenter/meetings/add",
                    contentType: "application/json",
                    data: JSON.stringify({
                        code: code,
                        name: name,
                        date: date,
                        repeat: repeat,
                        cover: reader.result
                    }),
                    success: function (res) {
                        if (res.valid)
                            window.location.href = "/meeting/"+code+"/presenter";
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
                url: "/presenter/meetings/add",
                contentType: "application/json",
                data: JSON.stringify({
                    code: code,
                    name: name,
                    date: date,
                    repeat: repeat,
                    cover: reader.result
                }),
                success: function (res) {
                    if (res.valid)
                        window.location.href = "/meeting/"+code+"/presenter";
                    else
                        $("#error").show();
                }
            })
        }
        if(cover[0].files[0] != null)
            reader.readAsDataURL(cover[0].files[0]);
    });
});