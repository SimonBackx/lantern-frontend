function MainView() {
    View.call(this, "main-view");
    this.queries = [];
}

MainView.prototype = Object.create(View.prototype);
MainView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    var request = new Request("GET", "/queries");
    request.acceptJSON();
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        me.setQueries(QueriesFromArray(response));
    }
    request.send();
};

MainView.prototype.setQueries = function(queries) {
    this.queries = queries;

    var body = document.getElementById("main-table-body");

    // Leeg maken
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }

    // Nieuwe rijen toevoegen
    for (var i = 0; i < queries.length; i++) {
        var query = queries[i];
        var row = queryToRow(query);
        body.appendChild(row);
    }
    
}


function queryToRow(query) {
   /* <tr>
      <td>Email addresses</td>
      <td>13 (+2 new)</td>
      <td>3 days</td>
      <td></td>
    </tr>*/
    var tr = document.createElement("tr");
    var name = document.createElement("td");
    name.innerText = query.name;

    var results = document.createElement("td");
    results.innerText = "0 results";

    var days = document.createElement("td");

    var date = new Date(query.createdOn);
    var now = new Date();

    var seconds = Math.round(Math.max(0, (now.getTime() - date.getTime()) / 1000) );
    if (seconds > 1 || seconds == 0) {
        days.innerText = Math.round(seconds)+" seconds";
    } else {
        days.innerText = Math.round(seconds)+" second";
    }   

    seconds /= 60;
    if (seconds >= 1) {
        var months = Math.round(seconds);
        if (months > 1) {
            days.innerText = months+" minutes";
        } else {
            days.innerText = months+" minute";
        }
    }

    seconds /= 60;
    if (seconds >= 1) {
        var months = Math.round(seconds);
        if (months > 1) {
            days.innerText = months+" hours";
        } else {
            days.innerText = months+" hour";
        } 
    }

    seconds /= 24;
    if (seconds >= 1) {
        var months = Math.round(seconds);
        if (months > 1) {
            days.innerText = months+" days";
        } else {
            days.innerText = months+" day";
        }       
    }

    seconds /= 7;
    if (seconds >= 1) {
        var months = Math.round(seconds);
        if (months > 1) {
            days.innerText = months+" weeks";
        } else {
            days.innerText = months+" week";
        }   
    }

    seconds /= 4;
    if (seconds >= 1) {
        var months = Math.round(seconds);
        if (months > 1) {
            days.innerText = months+" months";
        } else {
            days.innerText = months+" month";
        }
    }


    tr.appendChild(name);
    tr.appendChild(results);
    tr.appendChild(days);
    tr.appendChild(document.createElement("td"));

    tr.addEventListener("click", function() {
        viewController.push(new ResultsView(query));
        //editQuery(query);
    })

    return tr;
}