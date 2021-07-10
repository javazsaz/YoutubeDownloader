//when html page is loaded with all js files
$(document).ready(()    =>  {

    $(".spinner-border").hide();

    //When click on login button
    $(".btnLogin").click(()  =>  {

        //show spinner loading effect
        $(".spinner-border").show();

        //Get username and password
        var username = $(".usernameField").val();
        var password = $(".passwordField").val();

        //If username and password has been inserted
        if (username && username != "" && password && password != "") {

            //call server to execute login
            $.ajax({

                url: "http://localhost:8080/login",
                type: 'POST',
                data: { username: username, password: password },
                dataType: 'json',
                success: function (res) {

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
})