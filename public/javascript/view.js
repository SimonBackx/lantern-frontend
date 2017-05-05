
function View(id) {
    this.id = id
    this.visible = false
}
View.prototype.willAppear = function() {};
View.prototype.didAppear = function() {};
View.prototype.willDisappear = function() {};
View.prototype.didDisappear = function() {};
View.prototype.getElement = function() {
    return document.getElementById(this.id);
};

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
        this.visibleView.getElement().style.display = "none";
    }
    view.getElement().style.display = "";

    if (this.visibleView) {
        this.visibleView.didDisappear();
    }
    view.didAppear();
    
    this.visibleView = view
}
