var SERVER = "http://localhost:8080/api"
var api_user = "secret";
var api_key = "secret";

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
                }, 300);
            } else {
                me.onFailure(http.status, http.response);
            }
       }
    }

    http.open(this.method, SERVER + this.url);
    http.setRequestHeader("X-API-USER", api_user);
    http.setRequestHeader("X-API-KEY", api_key);

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