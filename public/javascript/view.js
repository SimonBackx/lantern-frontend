
function View(id) {
    this.id = id
    this.visible = false
}
View.prototype.willAppear = function() {};
View.prototype.didAppear = function() {};
View.prototype.willDisappear = function() {};
View.prototype.didDisappear = function() {};


var viewController = new ViewController();

function ViewController() {
    this.visibleView = null
}

ViewController.prototype.setView = function(view) {
    // set animation
    if (this.visibleView) {
        this.visibleView.willDisappear();
    }
    view.willAppear();

    // todo: animatie hier toevoegen
    if (this.visibleView) {
        document.getElementById(this.visibleView.id).style.display = "none";
    }
    document.getElementById(view.id).style.display = "";

    if (this.visibleView) {
        this.visibleView.didDisappear();
    }
    view.didAppear();
    
    this.visibleView = view
}

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

    // todo: view updaten...
}

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

var mainView = new MainView();
var editQueryView = new EditQueryView();
viewController.setView(mainView);