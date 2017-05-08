function LoginView() {
    View.call(this, "login-view");
    
    var form = this.getElement().querySelector("form");
    var me = this;

    setListener(form, "submit", function(event) {
        me.submit();
        event.preventDefault();
        return false
    });
}

LoginView.prototype = Object.create(View.prototype);
LoginView.prototype.didAppear = function() {
};

LoginView.prototype.submit = function() {
    var username = document.getElementById("username-input");
    var password = document.getElementById("password-input");

    if (username.value.length > 0 && password.value.length > 0) {
        var obj = {"username": username.value, "password": password.value};
        var request = new Request("POST", "/login", JSON.stringify(obj));
        request.acceptJSON();
        var me = this;
        request.onSuccess = function(status, response) {
            console.log(status);
            console.log(response);
            if (response && response.key && response.user) {
                username.value = "";
                password.value = "";
                setToken(response.user, response.key);
                viewController.clear(new MainView(), ANIMATION_RIGHT_TO_LEFT);
            } else {
                alert("Something went wrong while parsing the servers response.");
            }
        };

        request.onFailure = function(status, response) {
            if (status == 400) {
                alert("Invalid username or password");
            } else {
                alert("Something went wrong while connecting to the server.");
            }
        };

        request.send();
    }

};