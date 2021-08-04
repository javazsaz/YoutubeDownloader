//when html page is loaded with all js files
$(document).ready(function () {
    //control if user has been logged
    controlIsLogged().then(function (res) {
        //is logged
        if (res.isLogged && !res.offlineMode) {
            setVersion(); // set current version
        }
        if (res.offlineMode) {
            $(".navbarOnlineInfo").hide();
        }
        //hide loadingg effect for download
        $(".loader").hide();
        //when click on logs voice on navbar
        $('#logsModal').on('show.bs.modal', function (e) {
            //require logs at server and load on modal
            getLogs();
        });
        //when click on download button for download media
        $('#downloadMediaModal').on('show.bs.modal', function (e) {
            $("#previewMode").prop("disabled", true); //disable previewMode  
            //When video mode is clicked
            $("#videoMode").on("click", function () {
                if ($("#videoMode").is(":checked")) {
                    $("#previewMode").prop("disabled", false); //enable preview mode  
                    $("#audioMode").prop('checked', false); //delete previous check on audio 
                }
                else {
                    $("#previewMode").prop("disabled", true); //disable preview mode  
                    $("#audioMode").prop('checked', false); //delete previous check on audio 
                    $("#previewMode").prop('checked', false); //delete previous check on previewMode 
                    //delete last preview video
                    $("#previewVideo").html("");
                }
            });
            //if click on audioMode
            $("#audioMode").on("click", function () {
                $("#previewMode").prop("disabled", true); //disable previewMode  
                $("#videoMode").prop('checked', false); // delete previous check on video
                $("#previewMode").prop('checked', false); // delete previous check on previewMode
                //delete last preview video
                $("#previewVideo").html("");
            });
            //delete last link
            $("#inputLink").val("");
            //delete last preview video
            $("#previewVideo").html("");
            //Delete previous check
            $("#previewMode").prop('checked', false);
            //when link is pasted or is changed
            $("#inputLink").on("keydown paste", function () {
                //only if previewMode is checked
                if ($("#previewMode").is(":checked")) {
                    $("#previewMode").trigger("click");
                }
            });
            //when click on previewMode
            $("#previewMode").on("click", function () {
                setPreviewVideo();
            });
            //When click on "Download" button
            $(".btnDownloadMedia").on("click", function (ev) {
                ev.stopImmediatePropagation();
                //get link to download
                var link = $("#inputLink").val();
                //if all fields are compiled
                if ($('div.checkbox-group :checkbox:checked').length > 0 && link !== "") {
                    //get mode
                    var mode = "";
                    //check mode selected
                    if ($("#videoMode").is(":checked")) {
                        mode = "video";
                    }
                    else if ($("#audioMode").is(":checked")) {
                        mode = "audio";
                    }
                    downloadMedia(link, mode);
                }
                else {
                    toastr.error("Please compile all fields");
                }
            });
        });
    });
});
/**
 * Check isLogged = false on server
 */
function logout() {
    $.ajax({
        url: "http://localhost:8080/logout",
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function (res) {
            //close navbar
            $("[data-target='#navbarToggleExternalContent']").trigger("click");
            toastr.success(res.msg);
            //return on login
            setTimeout(function () {
                window.location.href = "http://localhost:8080/";
            }, 2000);
        }
    });
}
/**
 * Download media
 * @param link -> link to download
 * @param mode -> mode: audio or video
 */
function downloadMedia(link, mode) {
    //show loading effect
    $(".loader").show();
    //show block container for downloading
    $(".blockDuringDownload").show();
    //Prepare object that contain media info
    var data = { link: link, mode: mode };
    $.ajax({
        url: "http://localhost:8080/downloadMedia",
        type: 'POST',
        data: data,
        dataType: 'json',
        success: function (res) {
            if (res.error) {
                toastr.error(res.error);
            }
            else {
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
function getLogs() {
    $.ajax({
        url: "http://localhost:8080/getLogs",
        type: 'GET',
        success: function (data) {
            if (data.error) {
                toastr.error(data.error);
            }
            else {
                $(".logsModalBody").html(data.success);
            }
        }
    });
}
/**
 * Set preview video
 */
function setPreviewVideo() {
    if ($("#previewMode").is(":checked")) {
        //delete last preview video
        $("#previewVideo").html("");
        //get current link
        var currentLink = $("#inputLink").val();
        var embedCodeFromLink = getEmbedCode(currentLink);
        //try to load video
        $("#previewVideo").html(embedCodeFromLink);
    }
    else {
        //delete last preview video
        $("#previewVideo").html("");
    }
}
/**
 * Get embed code from youtube video
 * @param {*} link -> youtube link
 * @returns
 */
function getEmbedCode(link) {
    var id = "";
    //complex format
    if (link.indexOf("&") != -1) {
        //get only id of link - you can download audio to get id
        id = link.substring(link.indexOf("v=") + 2, link.indexOf("&"));
        //simple format
    }
    else {
        //get only id of link - you can download audio to get id
        id = link.substring(link.indexOf("v=") + 2, link.length);
    }
    if (id != "") {
        return '<iframe style="position:relative" width="360" height="315" src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>';
    }
    else {
        return "";
    }
}
/**
 * Set version on control panel
 */
function setVersion() {
    $.ajax({
        url: "http://localhost:8080/getVersion",
        type: 'GET',
        success: function (data) {
            if (data.error) {
                toastr.error(data.error);
            }
            else {
                $(".infoModalBody").append("<div><p>Youtube Downloader</p><p>Version: " + data + "</p><p>Author: Morris Penasso</p></div>");
            }
        }
    });
}
/**
 * Control on server if user is logged
 */
function controlIsLogged() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "http://localhost:8080/controlLogged",
            type: 'GET',
            success: function (res) {
                if (!res.isLogged && !res.offlineMode) {
                    window.location.href = "http://localhost:8080/403.html";
                }
                resolve(res);
            }
        });
    });
}
//# sourceMappingURL=dashboard.js.map