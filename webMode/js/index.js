//when html page is loaded with all js files
$(document).ready(()    =>  {

    //hide loadingg effect for download
    $(".loader").hide();

    $("#videoMode").on("click", ()  =>   {
        $("#subtitles").prop('disabled', false);  
        $("#audioMode").prop('checked', false);   
    })

    $("#audioMode").on("click", ()  =>   {
        $("#subtitles").prop('disabled', true);     
        $("#subtitles").prop('checked', false);   
        $("#videoMode").prop('checked', false);   
    })

    $("#subtitles").on("click", ()  =>   {
        $("#videoMode").prop('checked', true);   
    })

    $('#downloadMediaModal').on('show.bs.modal', function (e) {

        $(".btnDownloadMedia").on("click", (ev) => {
            ev.stopImmediatePropagation();

            //get link to download
            const link = $("#inputLink").val();

            if ($('div.checkbox-group :checkbox:checked').length > 0 && link.length > 0) {

                //get mode
                let mode = "";

                if ($("#videoMode").is(":checked")) {
                    mode = "video";
                } else if ($("#audioMode").is(":checked")) {
                    mode = "audio";
                }

                //get subtitles
                let subtitles = "N";
                if ($("#subtitles").is(":checked")) {
                    subtitles = "Y";
                }

                downloadMedia(link, mode, subtitles);
            } else {
                toastr.error("Please compile all fields")
            }
        })
      })
})

function downloadMedia(link, mode, subtitles)    {

    //show loading effect
    $(".loader").show();

    $.ajax({

        url : "http://localhost:8080/downloadMedia",
        type : 'POST',
        data : {link: link, mode: mode, subtitles: subtitles},
        dataType:'json',
        success : function(data) {        
            if (data.error) {
                toastr.error(data.error);
            } else {
                toastr.success(data.success);
            }      
            
            $(".loader").hide();
        }
    });
    
}