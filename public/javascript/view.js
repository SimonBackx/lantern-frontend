
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
    this.visibleView = null;
    this.stack = [];
}

var ANIMATION_RIGHT_TO_LEFT = 0;
var ANIMATION_LEFT_TO_RIGHT = 1;

ViewController.prototype.setView = function(view, animation) {
    if (arguments.length < 2) {
        animation = ANIMATION_RIGHT_TO_LEFT;
    }

    // set animation
    if (this.visibleView) {
        this.visibleView.willDisappear();
    }
    view.willAppear();

    // todo: animatie hier toevoegen
    if (this.visibleView) {
        var goal = "";
        switch(animation) {
            case ANIMATION_RIGHT_TO_LEFT:
                goal = "-100%";
                break;
            case ANIMATION_LEFT_TO_RIGHT:
                goal = "100%";
                break;
        }

        var el = this.visibleView.getElement()

        Velocity(this.visibleView.getElement(), {left: goal}, {duration: 300, complete: function() {
            el.style.display = "none";
        }});
    }

    switch(animation) {
        case ANIMATION_RIGHT_TO_LEFT:
            view.getElement().style.left = "100%";
            break;
        case ANIMATION_LEFT_TO_RIGHT:
            view.getElement().style.left = "-100%";
            break;
    }

    view.getElement().style.display = "";
    Velocity(view.getElement(), {left: 0}, {duration: 300, complete: function() {

    }});
    //.style.display = "";

    if (this.visibleView) {
        this.visibleView.didDisappear();
    }
    view.didAppear();
    
    this.visibleView = view
}

ViewController.prototype.push = function(view) {
    this.stack.push(view);
    this.setView(view);
}

ViewController.prototype.pop = function() {
    this.stack.pop();
    this.setView(this.stack[this.stack.length - 1], ANIMATION_LEFT_TO_RIGHT);
}

function createEmptyRow(text) {
    var tr = document.createElement("tr");
    tr.className = "empty";

    var column = document.createElement("td");
    column.innerText = text;

    tr.appendChild(column);

    return tr;
}