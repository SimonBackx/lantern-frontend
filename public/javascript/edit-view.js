function EditQueryView() {
    View.call(this, "edit-query-view");
    this.query = null;
    this.builder = new QueryBuilder(new QueryAction());
}

EditQueryView.prototype = Object.create(View.prototype);

EditQueryView.prototype.setQuery = function(query) {
    this.query = query;
    this.builder.setQuery(this.query);
};

EditQueryView.prototype.newQuery = function() {
    this.query = new Query();
    this.builder.setQuery(this.query);
};

EditQueryView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    this.builder.onBecomeVisible();
};

function editQuery(query) {
    editQueryView.setQuery(query);
    viewController.setView(editQueryView);
}

function newQuery() {
    editQueryView.newQuery();
    viewController.setView(editQueryView);
}

// save query!
function saveQuery() {
    var query = editQueryView.builder.query;

    if (query.name < 3) {
        alert("Name too short");
        return;
    }

    if (!editQueryView.builder.root.isValid()) {
        alert("Invalid query.");
        return;
    }
    query.root = editQueryView.builder.root.marshal();

    var request = new Request("POST", "/query", query.stringify());
    //request.acceptJSON();
    request.onSuccess = function(status, response) {
        alert("Saving succeeded");
        viewController.setView(mainView);
    }

    request.onFailure = function(status, response) {
        alert("Saving failed: "+response);
    }
    request.send();
}
