var SERVER = "http://localhost:8080"
var api_user = "secret";
var api_key = "secret";

function Request(method, url) {
    this.method = method;
    this.url = url;
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
                me.onSuccess(http.status, http.response);
            } else {
                me.onFailure(http.status, http.response);
            }
       }
    }

    http.open(this.method, SERVER + this.url);
    http.setRequestHeader("X-API-USER", api_user);
    http.setRequestHeader("X-API-KEY", api_key);
    http.send();
}


/*var test = new Request("GET", "/queries");
test.acceptJSON();
test.onSuccess = function(status, response) {
    console.log(status);
    console.log(response);
}
test.send();*/