//when html page is loaded with all js files
$(document).ready(()    =>  {

    //hide loadingg effect for download
    $(".loader").hide();

    //When video mode is clicked
    $("#videoMode").on("click", ()  =>   {
        $("#subtitles").prop('disabled', false);  //enable subtitles
        $("#audioMode").prop('checked', false);   //delete previous check on audio 
    })
    
    //if click on audioMode
    $("#audioMode").on("click", ()  =>   {
        $("#subtitles").prop('disabled', true);    //disable subtitles  
        $("#subtitles").prop('checked', false);    // delete previous check on subtitles
        $("#videoMode").prop('checked', false);    // delete previous check on video
    })


    //when click on logs voice on navbar
    $('#logsModal').on('show.bs.modal', function (e) {

        //require logs at server and load on modal
        getLogs();
    })
    

    //when click on download button for download media
    $('#downloadMediaModal').on('show.bs.modal', function (e) {

        //When click on "Download" button
        $(".btnDownloadMedia").on("click", (ev) => {
            ev.stopImmediatePropagation();

            //get link to download
            const link = $("#inputLink").val();

            //if all fields are compiled
            if ($('div.checkbox-group :checkbox:checked').length > 0 && link.length > 0) {

                //get mode
                let mode = "";

                //check mode selected
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

/**
 * Download media
 * @param link -> link to download 
 * @param mode -> mode: audio or video
 * @param subtitles -> subtitles: Y or N
 */
function downloadMedia(link, mode, subtitles)    {

    //show loading effect
    $(".loader").show();

    //show block container for downloading
    $(".blockDuringDownload").show();

    $.ajax({

        url : "http://localhost:8080/downloadMedia",
        type : 'POST',
        data : {link: link, mode: mode, subtitles: subtitles},
        dataType:'json',
        success : function(res) {        
            if (res.error) {
                toastr.error(res.error);
            } else {
                toastr.success(res.message);
            }      

            $(".loader").hide();

            //hide block container for downloading
            $(".blockDuringDownload").hide();
        }
    });
    
}

/**
 * require logs at server and compile logs modal
 */
function getLogs()    {

    $.ajax({
        url : "http://localhost:8080/getLogs",
        type : 'GET',
        success : function(data) {        
            if (data.error) {
                toastr.error(data.error);
            } else {
                $(".logsModalBody").html(data.success)
            }      
        }
    });
    
}