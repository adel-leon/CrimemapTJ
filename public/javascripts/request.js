function init(){
    $.ajax({
        url: "http://ocalhost:3000/API/crimes",
        contentType: "application/json",
        type: "GET",
        success: function(response){
            console.log("Success");
        },
        error: function(error,status){
            console.error(error);
        }
    }).done(function (data) {
        console.log("Done");
    });
}

window.onload = init;