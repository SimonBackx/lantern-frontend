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

ResultView.prototype.delete = function() {
    if (!confirm("Are you sure you want to delete this result?")) {
        return
    }

    var request = new Request("DELETE", "/result/"+encodeURI(this.result.id));
    request.onSuccess = function(status, response) {
        alert("Deleting succeeded");
        viewController.pop();
    }

    request.onFailure = function(status, response) {
        alert("Deleting failed: "+response);
    }
    request.send();
};

ResultView.prototype.mark = function() {
    var category = "important";
    if (this.result.category != '') {
        category = "";
    }
    var request = new Request("POST", "/result/"+encodeURI(this.result.id)+"/set-category", category);
    request.onSuccess = function(status, response) {
        alert("Marking succeeded");
        viewController.pop();
    }

    request.onFailure = function(status, response) {
        alert("Marking failed: "+response);
    }
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

    var markingButton = this.getElement().querySelector("button.marking");
    if (this.result.category != '') {
        markingButton.innerText = 'Unmark';
    } else {
        markingButton.innerText = 'Mark';
    }

    if (result.body) {
        this.setIframe(result.body);
    } else {
        this.setIframe("");
    }
}
