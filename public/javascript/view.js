
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



function EditQueryView() {
    View.call(this, "edit-query-view");
    this.query = null;
    this.builder = new QueryBuilder(new QueryAction());
}

EditQueryView.prototype = Object.create(View.prototype);

EditQueryView.prototype.setQuery = function(query) {
    this.query = query;
};

EditQueryView.prototype.newQuery = function() {
    this.setQuery(null);
};

EditQueryView.prototype.didAppear = function() {
    View.prototype.didAppear.call(this);
    this.builder.onBecomeVisible();
};

function editQuery(query) {
    editQueryView.setQuery(query);
    viewController.setView(editQueryView);
}

var mainView = new View("main-view");
var editQueryView = new EditQueryView();
viewController.setView(mainView);