function ResultsView(query) {
    View.call(this, "results-view");
    this.results = [];
    this.query = query;

    var title = this.getElement().querySelector("header h2");
    title.innerText = query.name;
}

ResultsView.prototype = Object.create(View.prototype);
ResultsView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    this.clearResults();

    var request = new Request("GET", "/results/"+this.query.id);
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setResults(AggregatedResultsFromArray(response));
    }
    request.send();
};

ResultsView.prototype.clearResults = function() {
    var body = document.getElementById("results-table-body");

    // Leeg maken
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }
}

ResultsView.prototype.setResults = function(results) {
    this.results = results;

    var body = document.getElementById("results-table-body");
    this.clearResults();

    if (results.length == 0) {
        var row = createEmptyRow("No results");
        body.appendChild(row);
        return
    }

    // Nieuwe rijen toevoegen
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var row = aggregatedResultToRow(this.query, result);
        body.appendChild(row);
    }
    
}

ResultsView.prototype.deleteAll = function() {
    if (!confirm("Are you sure you want to delete all results?")) {
        return
    }

    var request = new Request("DELETE", "/results/"+encodeURI(this.query.id));
    request.onSuccess = function(status, response) {
        alert("Deleting succeeded");
        viewController.pop();
    }

    request.onFailure = function(status, response) {
        alert("Deleting failed: "+response);
    }
    request.send();
};


function aggregatedResultToRow(query, result) {
    var tr = document.createElement("tr");
    var hostColumn = document.createElement("td");
    hostColumn.innerText = result.host;

    var countColumn = document.createElement("td");
    countColumn.innerText = result.count;

    var dateColumn = document.createElement("td");

    var date = new Date(result.lastFound);

    dateColumn.innerText = date.toLocaleString();

    tr.appendChild(hostColumn);
    tr.appendChild(countColumn);
    tr.appendChild(dateColumn);
    tr.appendChild(document.createElement("td"));

    tr.addEventListener("click", function() {
        viewController.push(new HostResultsView(query, result.host));
    });

    return tr;
}