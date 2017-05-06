function HostResultsView(query, host) {
    View.call(this, "host-results-view");
    this.results = [];
    this.query = query;
    this.host = host;

    var title = this.getElement().querySelector("header h1");
    title.innerText = query.name;
}

HostResultsView.prototype = Object.create(View.prototype);
HostResultsView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    var request = new Request("GET", "/results/"+this.query.id+"?host="+encodeURI(this.host));
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setResults(ResultsFromArray(response));
    }
    request.send();
};

HostResultsView.prototype.setResults = function(results) {
    this.results = results;

    var body = document.getElementById("host-results-table-body");

    // Leeg maken
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }

    // Nieuwe rijen toevoegen
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var row = resultToRow(this.query, result);
        body.appendChild(row);
    }
}

function resultToRow(query, result) {

    var tr = document.createElement("tr");
    var urlColumn = document.createElement("td");
    urlColumn.innerText = result.url;

    var snippetColumn = document.createElement("td");
    snippetColumn.innerText = result.snippet;

    var dateColumn = document.createElement("td");
    var date = new Date(result.lastFound);
    dateColumn.innerText = date.toLocaleString();

    tr.appendChild(snippetColumn);
    tr.appendChild(urlColumn);
    tr.appendChild(dateColumn);
    tr.appendChild(document.createElement("td"));

    tr.addEventListener("click", function() {
        viewController.push(new ResultView(query, result));
    });

    return tr;
}