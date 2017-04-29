var boxHeight = 40;
var boxMargin = 15;
var indentWidth = 30;
var arapawa = "#1A0E64";
var whisper = "#EAE9F3";

var AND_OPERATOR = "AND";
var OR_OPERATOR = "OR";

var currentMovingQuery = null;

Object.defineProperty( Element.prototype, 'documentOffsetTop', {
    get: function () { 
        return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
    }
} );
Object.defineProperty( Element.prototype, 'documentOffsetLeft', {
    get: function () { 
        return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
    }
} );

var mouseStartX = 0;
var mouseStartY = 0;

document.addEventListener("mousedown", function(event){
    currentMovingQuery = null;

    mouseStartX = event.pageX;
    mouseStartY = event.pageY;

    var offset = queryBuilder.documentOffsetTop;
    var y = event.pageY - offset;

    if (y < 0) {
        return;
    }

    var query = rootQuery.find(y);
    currentMovingQuery = query;
    currentMovingQuery.selected = true;
    updateBuilder();
}, false);

document.addEventListener("mousemove", function(){
    if (currentMovingQuery) {
        currentMovingQuery.setOffset(event.pageX - mouseStartX, event.pageY - mouseStartY);
    }
}, false);

document.addEventListener("mouseup", function(){
    if (currentMovingQuery) {
        var offset = queryBuilder.documentOffsetTop;
        var y = event.pageY - offset;
        var query = rootQuery.find(y);
        switchQueries(currentMovingQuery, query);
        currentMovingQuery.selected = false;
    }
    currentMovingQuery = null;
    updateBuilder();
}, false);


function Query() {
    this.type = "Empty query"
    this.x = null;
    this.y = null;
    this.goalX = 0;
    this.goalY = 0;

    this.selected = false;

    this.velocityX = 0;
    this.velocityY = 0;

    this.element = document.createElement("div");
    this.element.className = "empty query";
    this.parent = null;

    this.replace = function() {};
}

Query.prototype.calculatePosition = function(x, y) {

    this.goalX = x;
    this.goalY = y;

    if (this.x === null && this.y === null) {
        this.x = x;
        this.y = y;
    } else {
        if (this.goalX != this.x || this.goalY != this.y) {
            needsAnimation();
        }
    }
    return boxHeight;
}

Query.prototype.hasParent = function(query) {
    if (this.parent === null) {
        return false;
    }

    if (this.parent === query) {
        return true;
    }
    return this.parent.hasParent(query);
}

Query.prototype.find = function(y) {
    return this;
}


Query.prototype.draw = function(ctx) {
}

Query.prototype.setOffset = function(x, y, container) {
    this.x = this.goalX + x;
    this.y = this.goalY + y;
    this.updateDOM(container);
}

Query.prototype.updateDOM = function(container) {
    if (!this.element.parentElement) {
        container.appendChild(this.element);
    }

    if (this.selected || this.simulate) {
        this.element.style.background = "red";
    } else {
        this.element.style.background = "";
    }

    this.element.style.left = this.x+"px";
    this.element.style.top = this.y+"px";
}

Query.prototype.step = function(container) {
    var k = 1
    var deltaX = this.x - this.goalX;
    var deltaY = this.y - this.goalY;

    var c = 12
    var Fx = -k * deltaX - c * this.velocityX;
    var Fy = -k * deltaY - c * this.velocityY;

    var m = 60;
    var ax = Fx / m;
    var ay = Fy / m;

    this.velocityX += ax;
    this.velocityY += ay;

    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.velocityX < 0.01 && this.velocityX > -0.01 && ax < 0.01 && ax > -0.01) {
        if (this.velocityY < 0.01 && this.velocityY > -0.01 && ay < 0.01 && ay > -0.01) {
            this.x = this.goalX;
            this.y = this.goalY;

            this.updateDOM(container);
            return false;
        }
    }

    this.updateDOM(container);

    return true;
}

Query.prototype.restoreSimulation = function() {
    this.simulate = null;
}

Query.prototype.endSimulation = function() {
    // todo: opslaan
    this.simulate = null;
}

function OperatorQuery(first, last) {
    Query.call(this);
    this.setFirst(first);
    this.setLast(last);

    this.operator = AND_OPERATOR;

    this.element.className = "operator query";
    this.element.innerHTML = this.operator;
}

OperatorQuery.prototype = Object.create(Query.prototype);

OperatorQuery.prototype.setFirst = function(query) {
    query.parent = this;
    this.first = query;

    var me = this;
    query.replace = function(q) {
        me.setFirst(q);
    };
}

OperatorQuery.prototype.setLast = function(query) {
    query.parent = this;
    this.last = query;

    var me = this;
    query.replace = function(q) {
        me.setLast(q);
    };
}

OperatorQuery.prototype.calculatePosition = function(x, y) {
    var heightFirst = this.first.calculatePosition(x + indentWidth, y);

    this.goalX = x;
    this.goalY = y + heightFirst + boxMargin;

    if (this.x === null && this.y === null) {
        this.x = this.goalX;
        this.y = this.goalY;
    } else {
        if (this.goalX != this.x || this.goalY != this.y) {
            needsAnimation();
        }
    }

    var heightLast = this.last.calculatePosition(this.goalX + indentWidth, this.goalY + boxMargin + boxHeight);
    return boxHeight + heightFirst + boxMargin*2 + heightLast;
}

OperatorQuery.prototype.draw = function(ctx) {
}

OperatorQuery.prototype.find = function(y) {
    if (y < this.goalY) {
        return this.first.find(y);
    }
    if (y > this.goalY + boxHeight) {
        return this.last.find(y);
    }
    return this;
}

OperatorQuery.prototype.setOffset = function(x, y, container) {
    this.first.setOffset(x, y,container);
    Query.prototype.setOffset.call(this, x, y, container);
    this.last.setOffset(x, y, container);
}

OperatorQuery.prototype.step = function(container) {
    var f = this.first.step(container);
    var m = Query.prototype.step.call(this, container);

    return this.last.step(container) || f || m;
}

OperatorQuery.prototype.restoreSimulation = function() {
    this.first.restoreSimulation();
    this.simulate = null;
    this.last.restoreSimulation();
}


var rootQuery = null;

/*
var canvasElement = document.getElementById('query-builder');

function updateCanvasSize() {
    canvasElement.width = canvasElement.offsetWidth;
    canvasElement.height = canvasElement.offsetHeight;
}
window.onresize = function(event) {
    updateCanvasSize();
    op.draw(canvasElement.getContext("2d"));
};
*/

var queryBuilder = document.getElementById('query-builder');

if (queryBuilder) {
    var myLeft = new Query();
    var myRight = new Query();
    var op = new OperatorQuery(myLeft, myRight);
    
    rootQuery = op;

    var extra = new OperatorQuery(new Query(), new Query());
    var extra2 = new OperatorQuery(new Query(), new Query());
    extra_op = new OperatorQuery(extra, extra2);
    rootQuery.setFirst(extra_op);



    updateBuilder();
}


function updateBuilder()  {
    rootQuery.calculatePosition(25, 10, false);
    rootQuery.step(queryBuilder);
}

var animationInterval = null;

function needsAnimation() {
    if (animationInterval === null) {
        animationInterval = setInterval(animationLoop, 5);
    }
}

function animationLoop() {
    if (!rootQuery.step(queryBuilder)) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    //rootQuery.draw(canvasElement.getContext("2d"));
}

function switchQueries(first, last) {
    if (first.hasParent(last) || last.hasParent(first)) {
        return;
    }

    var replaceFunc = last.replace;
    first.replace(last);
    replaceFunc.call(last, first);
}
