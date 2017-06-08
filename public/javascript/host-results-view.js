function HostResultsView(query, host) {
    View.call(this, "host-results-view");
    this.results = [];
    this.query = query;
    this.host = host;

    var title = this.getElement().querySelector("header h2");
    title.innerText = host;
}

HostResultsView.prototype = Object.create(View.prototype);
HostResultsView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    this.clearResults();
    var request = new Request("GET", "/results/"+this.query.id+"?host="+encodeURI(this.host));
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setResults(ResultsFromArray(response));
    };

    request.onFailure = function(status, response) {
        var body = document.getElementById("host-results-table-body");
        var row = createEmptyRow("Failed to load results.");
        body.appendChild(row);
    };

    request.send();
};

HostResultsView.prototype.clearResults = function() {
    var body = document.getElementById("host-results-table-body");

    // Leeg maken
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }
}

HostResultsView.prototype.setResults = function(results) {
    this.results = results;

    var body = document.getElementById("host-results-table-body");
    this.clearResults();

    // Nieuwe rijen toevoegen
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var row = resultToRow(this.query, result);
        body.appendChild(row);
    }
}

HostResultsView.prototype.deleteAll = function() {
    if (!confirm("Are you sure you want to delete all results?")) {
        return
    }

    var request = new Request("DELETE", "/results/"+encodeURI(this.query.id)+"?host="+encodeURI(this.host));
    request.onSuccess = function(status, response) {
        alert("Deleting succeeded");
        viewController.pop();
    }

    request.onFailure = function(status, response) {
        alert("Deleting failed: "+response);
    }
    request.send();
};

function resultToRow(query, result) {

    var tr = document.createElement("tr");
    var resultsColumn = document.createElement("td");

    var title = document.createElement("h2");
    title.innerText = result.title;

    if (result.category != "") {
        title.title = result.category;
        title.className = "marked";
    }

    var url = document.createElement("p");
    url.innerText = result.url;
    url.className = "url";
    var snippet = document.createElement("p");
    snippet.innerText = result.snippet;

    resultsColumn.appendChild(title);
    resultsColumn.appendChild(url);
    resultsColumn.appendChild(snippet);

    var dateColumn = document.createElement("td");

    var date = new Date(result.lastFound);

    dateColumn.innerText = formatDate(date);

    tr.appendChild(resultsColumn);
    tr.appendChild(dateColumn);
    tr.appendChild(document.createElement("td"));

    tr.addEventListener("click", function() {
        viewController.push(new ResultView(query, result));
    });

    return tr;
}