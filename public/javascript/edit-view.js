function EditQueryView(query) {
    View.call(this, "edit-query-view");
    this.query = query;
    this.builder = new QueryBuilder();
    this.builder.setQuery(this.query);

    var title = this.getElement().querySelector("header h1");

    if (this.query.id) {
        title.innerText = "Edit query";
    } else {
        title.innerText = "New query";
    }
}
EditQueryView.prototype = Object.create(View.prototype);

EditQueryView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    this.builder.onBecomeVisible();
};

EditQueryView.prototype.willDisappear = function() {
    View.prototype.didAppear.call(this);
    this.builder.willHide();
};

function editQuery(query) {
    viewController.push(new EditQueryView(query));
}

function newQuery() {
    viewController.push(new EditQueryView(new Query()));
}

// save query!
function saveQuery() {
    var builder = viewController.visibleView.builder;
    var query = builder.query;

    if (query.name < 3) {
        alert("Name too short");
        return;
    }

    if (!builder.root.isValid()) {
        alert("Invalid query.");
        return;
    }
    query.root = builder.root.marshal();

    var request = new Request("POST", "/query", query.stringify());
    //request.acceptJSON();
    request.onSuccess = function(status, response) {
        alert("Saving succeeded");
        viewController.pop();
    }

    request.onFailure = function(status, response) {
        alert("Saving failed: "+response);
    }
    request.send();
}

function deleteQuery() {
    if (!confirm("Are you sure you want to delete this query?")) {
        return
    }

    var query = viewController.visibleView.builder.query;
    var request = new Request("DELETE", "/query/"+encodeURI(query.id));
    request.onSuccess = function(status, response) {
        alert("Deleting succeeded");
        viewController.pop();
    }

    request.onFailure = function(status, response) {
        alert("Deleting failed: "+response);
    }
    request.send();
}