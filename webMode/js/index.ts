//when html page is loaded with all js files
$(document).ready(()    =>  {

    $(".spinner-border").hide();

    //When click on login button
    $(".btnLogin").on("click", ()  =>  {

        //show spinner loading effect
        $(".spinner-border").show();

        //Get username and password
        let username: any = $(".usernameField").val();
        let password: any = $(".passwordField").val();

        //If username and password has been inserted
        if (username && username != "" && password && password != "") {

            //Prepare object that contain login info
            const data: YTDownloader.ILoginInfo = { username: username, password: password };

            //call server to execute login
            $.ajax({

                url: "http://localhost:8080/login",
                type: 'POST',
                data: data,
                dataType: 'json',
                success: function (res: any) {

                    //hide spinner
                    $(".spinner-border").hide();
                    if (res.err) {
                        toastr.error("Login failed: " + res.err.codeName + " - Error code: " + res.err.code);
                    } else {
                        toastr.success(res.msg);

                        setTimeout(() => {
                            //load dashboard
                            window.location.href = "http://localhost:8080/dashboard.html";
                        }, 2000)
                    }
                }
            });
        } else  {
            //hide spinner loading effect
            $(".spinner-border").hide();
            toastr.error("Please enter the correct username and password");
        }
    })

    //Click on Offline Mode
    $(".offlineMode").on("click", () => {

        //call server to execute login
        $.ajax({

            url: "http://localhost:8080/offlineMode",
            type: 'POST',
            data: {},
            dataType: 'json',
            success: function (res: any) {

                    //load dashboard
                    window.location.href = "http://localhost:8080/dashboard.html";
       

            }
        });
    })
})