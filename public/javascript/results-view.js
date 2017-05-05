function ResultsView(query) {
    View.call(this, "results-view");
    this.results = [];
    this.query = query;

    var title = this.getElement().querySelector("header h1");
    title.innerText = query.name;
}

ResultsView.prototype = Object.create(View.prototype);
ResultsView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    var request = new Request("GET", "/results/"+this.query.id);
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setResults(ResultsFromArray(response));
    }
    request.send();
};

ResultsView.prototype.setResults = function(results) {
    this.results = results;

    var body = document.getElementById("results-table-body");

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
   /* <tr>
      <th>Hidden service url</th>
      <th>Snippet</th>
      <th>Date</th>
      <th></th>
    </tr>*/
    var tr = document.createElement("tr");
    var name = document.createElement("td");
    name.innerText = result.url;

    var snippet = document.createElement("td");
    snippet.innerText = "<snippet>";

    var dateColumn = document.createElement("td");

    var date = new Date(result.lastFound);

    dateColumn.innerText = date.toLocaleString();

    tr.appendChild(name);
    tr.appendChild(snippet);
    tr.appendChild(dateColumn);
    tr.appendChild(document.createElement("td"));

    tr.addEventListener("click", function() {
        viewController.setView(new ResultView(query, result));
    });

    return tr;
}