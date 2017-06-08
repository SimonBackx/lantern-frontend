function MarkedResultsView(query, category) {
    View.call(this, "marked-results-view");
    this.results = [];
    this.query = query;
    this.category = category;

    var title = this.getElement().querySelector("header h2");
    title.innerText = query.name;
}

MarkedResultsView.prototype = Object.create(View.prototype);
MarkedResultsView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    this.clearResults();

    var request = new Request("GET", "/results/"+encodeURI(this.query.id)+"?category="+encodeURI(this.category)+"&nogrouping=1");
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setResults(ResultsFromArray(response));
    };

    request.onFailure = function(status, response) {
        var body = document.getElementById("marked-results-table-body");
        var row = createEmptyRow("Failed to load results.");
        body.appendChild(row);
    };

    request.send();
};

MarkedResultsView.prototype.clearResults = function() {
    var body = document.getElementById("marked-results-table-body");

    // Leeg maken
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }
}

MarkedResultsView.prototype.setResults = function(results) {
    this.results = results;

    var body = document.getElementById("marked-results-table-body");
    this.clearResults();

    if (results.length == 0) {
        var row = createEmptyRow("No results");
        body.appendChild(row);
        return
    }

    // Nieuwe rijen toevoegen
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var row = resultToRow(this.query, result);
        body.appendChild(row);
    }
    
}
