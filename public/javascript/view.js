
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
var ANIMATION_NONE = 2;

ViewController.prototype.setView = function(view, animation) {
    if (arguments.length < 2) {
        animation = ANIMATION_NONE;
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
        if (animation == ANIMATION_NONE) {
            el.style.display = "none";
        } else {
            Velocity(this.visibleView.getElement(), {left: goal}, {duration: 300, complete: function() {
                el.style.display = "none";
            }});
        }
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

    if (animation != ANIMATION_NONE) {
        Velocity(view.getElement(), {left: 0}, {duration: 300});
    }

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
    this.setView(this.stack[this.stack.length - 1]);
}

ViewController.prototype.clear = function(view, animation) {
    this.stack = [view];
    this.setView(view, animation);
}

function createEmptyRow(text) {
    var tr = document.createElement("tr");
    tr.className = "empty";

    var column = document.createElement("td");
    column.innerText = text;

    tr.appendChild(column);

    return tr;
}


// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    var minute = date.getMinutes();
    var hour = date.getHours();

    if (minute < 10) {
        minute = "0"+minute;
    }

    var today = new Date();
    var days = dateDiffInDays(date, today)

    if (days == 0) {
        return 'Today, '+hour+':'+minute;
    }

    if (days == 1) {
        return 'Yesterday, '+hour+':'+minute;
    }
    return day + ' ' + monthNames[monthIndex] + ' ' + year+', '+hour+':'+minute;
}
