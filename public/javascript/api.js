var SERVER = "http://localhost:8080/api"
var api_user = null;
var api_key = null;
var api_logged_in = false;

function logout() {
    setToken();
    viewController.clear(new LoginView(), ANIMATION_LEFT_TO_RIGHT);
}

function setToken(user, key) {
    if (arguments.length == 0 || !user || !key) {
        api_user = null;
        api_key = null;
        api_logged_in = false;
        localStorage.removeItem("user");
        localStorage.removeItem("key");
    } else {
        api_user = user;
        api_key = key;
        api_logged_in = true;
        localStorage.setItem("user", user);
        localStorage.setItem("key", key);
    }
}

function loadToken() {
    var user = localStorage.getItem("user");
    var key = localStorage.getItem("key");

    if (user && key) {
        api_user = user;
        api_key = key;
        api_logged_in = true;
    }
}

// body is optional
function Request(method, url, body) {
    this.method = method;
    this.url = url;
    this.body = null;

    if (arguments.length >= 3) {
        this.body = body;
    }

    this.responseType = "text";
    this.http = new XMLHttpRequest();
    this.onSuccess = function(status, response) {};
    this.onFailure = function(status, response) {};
}

Request.prototype.acceptJSON = function() {
    this.responseType = "json";
}  

Request.prototype.send = function(){
    var http = this.http;
    var me = this;

    http.timeout = 5000;
    http.responseType = this.responseType;

    http.onreadystatechange = function() {
       if (http.readyState == 4) {
            if (http.status == 200) {
                setTimeout(function() {
                 me.onSuccess(http.status, http.response);
                }, 200);
            } else {
                if (http.status == 401) {
                    // Unauthorized
                    logout();
                } else {
                    me.onFailure(http.status, http.response);
                }
            }
       }
    }

    http.open(this.method, SERVER + this.url);

    if (api_logged_in) {
        http.setRequestHeader("X-API-USER", api_user);
        http.setRequestHeader("X-API-KEY", api_key);
    }

    if (this.body === null) {
        http.send();
    } else {
        http.send(this.body);
    }
}


/*var test = new Request("GET",s "/queries");
test.acceptJSON();
test.onSuccess = function(status, response) {
    console.log(status);
    console.log(response);
}
test.send();*/