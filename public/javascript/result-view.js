function ResultView(query, result) {
    View.call(this, "result-view");
    this.result = result;
    this.query = query;
    this.setResult(result);
}

ResultView.prototype = Object.create(View.prototype);
ResultView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    var request = new Request("GET", "/result/"+this.result.id);
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setResult(new Result(response));
    };

    request.onFailure = function(status, response) {
        me.setIframe("Failed to load result.");
    };

    request.send();
};

ResultView.prototype.setIframe = function(content) {
    // Remove current iframe
    var iframe = this.getElement().querySelector("iframe");
    var parent = null;
    while (iframe) {
        parent = iframe.parentElement;
        iframe.parentElement.removeChild(iframe);
        iframe = this.getElement().querySelector("iframe");
    }

    iframe = document.createElement('iframe');
    iframe.setAttribute("sandbox", "allow-same-origin");
    parent.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
    iframe.contentWindow.document.body.style.fontFamily = "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
}

ResultView.prototype.setResult = function(result) {
    this.result = result;

    var title = this.getElement().querySelector("header h1");
    title.innerText = result.title;

    title = this.getElement().querySelector("header h2");
    title.innerText = result.url;

    if (result.body) {
        this.setIframe(result.body);
    } else {
        this.setIframe("");
    }
}
