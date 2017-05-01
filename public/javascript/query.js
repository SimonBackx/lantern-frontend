var boxHeight = 40;
var boxMargin = 15;
var indentWidth = 40;
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

function Query() {
    this.type = "empty"
    this.x = null;
    this.y = null;
    this.goalX = 0;
    this.goalY = 0;

    this.calculatedX = 0;
    this.calculatedY = 0;

    this.selected = false;

    this.velocityX = 0;
    this.velocityY = 0;

    this.element = document.createElement("div");
    this.element.className = "empty query";
    this.parent = null;
    this.simulatedParent = null;

    this.replace = function() {};
}

Query.prototype.calculatePosition = function(x, y) {

    this.goalX = x;
    this.goalY = y;

    this.calculatedX = this.goalX;
    this.calculatedY = this.goalY;

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
    ctx.strokeStyle = whisper;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y + boxHeight/2);

    if (this.simulatedParent === null) {
        if (this.parent === null) {
            ctx.lineTo(0, this.y + boxHeight/2);
        } else {
            ctx.lineTo(this.parent.x + indentWidth, this.parent.y + boxHeight/2);
        }
    } else {
        ctx.lineTo(this.simulatedParent.x + indentWidth, this.simulatedParent.y + boxHeight/2);
    }

    ctx.stroke();
    ctx.closePath();
}

Query.prototype.setOffset = function(x, y, container) {
    this.x = this.calculatedX + x;
    this.y = this.calculatedY + y;
    this.updateDOM(container);
}

Query.prototype.setMovingOffset = function(x, y, container) {
    this.goalX = this.calculatedX + x;
    this.goalY = this.calculatedY + y;
}

Query.prototype.updateDOM = function(container) {
    if (!this.element.parentElement) {
        container.appendChild(this.element);
    }

    this.element.style.left = this.x+"px";
    this.element.style.top = this.y+"px";

    if (this === selectedQuery) {
        this.element.className = this.type+" query selected";
    } else {
        this.element.className = this.type+" query";
    }
}

Query.prototype.step = function(container) {
    if (this.selected) {
        this.updateDOM(container);
        return false;
    }

    var k = 1
    var deltaX = this.x - this.goalX;
    var deltaY = this.y - this.goalY;

    var c = 6
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

Query.prototype.resetSimulation = function() {
    this.simulatedParent = null;
}

function OperatorQuery(first, last) {
    Query.call(this);
    this.setFirst(first);
    this.setLast(last);
    this.firstHeight = 0;
    this.lastHeight = 0;
    this.type = "operator"

    this.operator = AND_OPERATOR;

    this.element.className = "operator query";
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
    this.firstHeight = this.first.calculatePosition(x + indentWidth, y);

    this.goalX = x;
    this.goalY = y + this.firstHeight + boxMargin;

    this.calculatedX = this.goalX;
    this.calculatedY = this.goalY;

    if (this.x === null && this.y === null) {
        this.x = this.goalX;
        this.y = this.goalY;
    } else {
        if (this.goalX != this.x || this.goalY != this.y) {
            needsAnimation();
        }
    }

    this.lastHeight = this.last.calculatePosition(this.goalX + indentWidth, this.goalY + boxMargin + boxHeight);
    return boxHeight + this.firstHeight + boxMargin*2 + this.lastHeight;
}

OperatorQuery.prototype.draw = function(ctx) {
    this.first.draw(ctx);
    Query.prototype.draw.call(this, ctx);
    this.last.draw(ctx);
}

OperatorQuery.prototype.find = function(y) {
    if (y < this.calculatedY) {
        return this.first.find(y);
    }
    if (y > this.calculatedY + boxHeight) {
        return this.last.find(y);
    }
    return this;
}

OperatorQuery.prototype.setOffset = function(x, y, container) {
    this.first.setOffset(x, y,container);
    Query.prototype.setOffset.call(this, x, y, container);
    this.last.setOffset(x, y, container);
}

OperatorQuery.prototype.setMovingOffset = function(x, y, container) {
    this.first.setMovingOffset(x, y,container);
    Query.prototype.setMovingOffset.call(this, x, y, container);
    this.last.setMovingOffset(x, y, container);
}

OperatorQuery.prototype.step = function(container) {
    if (this.selected) {
        return Query.prototype.step.call(this, container);
    }

    var f = this.first.step(container);
    var m = Query.prototype.step.call(this, container);

    return this.last.step(container) || f || m;
}

OperatorQuery.prototype.resetSimulation = function() {
    this.first.resetSimulation();
    Query.prototype.resetSimulation.call(this);
    this.last.resetSimulation();
}

OperatorQuery.prototype.updateDOM = function(container) {
    Query.prototype.updateDOM.call(this, container);

    this.element.innerText = this.operator;
}

function RegexpQuery() {
    Query.call(this);
    this.type = "regexp";
    this.regexp = "";

    this.element.className = "regexp query";
    this.element.innerText = this.regexp;
}

RegexpQuery.prototype = Object.create(Query.prototype);
RegexpQuery.prototype.updateDOM = function(container) {
    Query.prototype.updateDOM.call(this, container);

    this.element.innerText = this.regexp;
}

var rootQuery = null;
var selectedQuery = null;

var queryBuilder = document.getElementById('query-builder');
var queryBuilderMenu = document.getElementById('query-builder-menu');
var queryBuilderMenuType = document.getElementById('type-input');
queryBuilderMenuType.addEventListener("change", function() {
    if (selectedQuery === null || selectedQuery.type == "operator") {
        return;
    }

    // Type aanpassen
    var type = queryBuilderMenuType.value;
    queryBuilderMenu.className = type+"-selected";

    var replaceWith = selectedQuery;

    switch(type) {
        case "empty":
            replaceWith = new Query();
            break;
        case "regexp":
            replaceWith = new RegexpQuery();
            break;
        case "text":
            //selectedQuery.replace(new Query());
            break;
        case "list":
            //selectedQuery.replace(new Query());
            break;
    }

    if (selectedQuery.element)
        selectedQuery.element.parentNode.removeChild(selectedQuery.element);
    selectedQuery.replace(replaceWith);
    
    setSelectedQuery(replaceWith);

    updateBuilder();
});

var updateInputElement = function() {
    var prop = this.getAttribute("data-property");
    if (!prop || !selectedQuery) {
        return;
    }
    selectedQuery[prop] = this.value;
    updateBuilder();
};

var inputElements = queryBuilderMenu.querySelectorAll("input,select");
var i;
for (i = 0; i < inputElements.length; i++) {
    var element = inputElements[i];
    element.addEventListener("keydown", function() {
        updateInputElement.call(this);
    });
    element.addEventListener("keyup", function() {
        updateInputElement.call(this);
    });
    element.addEventListener("change", function() {
        updateInputElement.call(this);
    });
}

function setSelectedQuery(query) {
    selectedQuery = query;
    queryBuilderMenuType.value = query.type;
    queryBuilderMenu.className = query.type+"-selected";

    for (i = 0; i < inputElements.length; i++) {
        var element = inputElements[i];
        var prop = element.getAttribute("data-property");
        if (!prop) {
            continue;
        }
        element.value = query[prop];
    }
}

var mouseStartX = 0;
var mouseStartY = 0;

var ignoreDown = false;

queryBuilderMenu.addEventListener("mousedown", function(event){
    ignoreDown = true;
});
queryBuilder.addEventListener("mousedown", function(event){
    if (ignoreDown) {
        ignoreDown = false;
        return;
    }

    currentMovingQuery = null;

    mouseStartX = event.pageX;
    mouseStartY = event.pageY;

    var offset = queryBuilder.documentOffsetTop;
    var y = event.pageY - offset;

    if (y < 0) {
        return;
    }

    var query = rootQuery.find(y);
    setSelectedQuery(query);
    currentMovingQuery = query;
    currentMovingQuery.selected = true;
    updateBuilder();
}, false);

document.addEventListener("mousemove", function(){
    if (currentMovingQuery) {
        var y = event.pageY - queryBuilder.documentOffsetTop;
        var query = rootQuery.find(y);

        rootQuery.resetSimulation();

        if (canSwitchQueries(currentMovingQuery, query)) {
            currentMovingQuery.simulatedParent = query.parent;
            query.simulatedParent = currentMovingQuery.parent;

            rootQuery.calculatePosition(25, 10, false);
            query.setMovingOffset(currentMovingQuery.calculatedX - query.calculatedX + 20, currentMovingQuery.calculatedY - query.calculatedY);
            needsAnimation();
        } else {
            rootQuery.calculatePosition(25, 10, false);
            needsAnimation();
        }

        currentMovingQuery.setOffset(event.pageX - mouseStartX, event.pageY - mouseStartY);
    }
}, false);

document.addEventListener("mouseup", function() {
    ignoreDown = false;
    rootQuery.resetSimulation();
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



if (queryBuilder) {
    var queryBuilderCanvas = document.getElementById('query-builder-canvas');
    function updateCanvasSize() {
        queryBuilderCanvas.width = queryBuilder.offsetWidth;
        queryBuilderCanvas.height = queryBuilder.offsetHeight;
        queryBuilderCanvas.style.width = queryBuilder.offsetWidth;
        queryBuilderCanvas.style.height = queryBuilder.offsetHeight;
    }
    updateCanvasSize();

    window.onresize = function(event) {
        updateCanvasSize();
        rootQuery.draw(queryBuilderCanvas.getContext("2d"));
    };

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
    rootQuery.draw(queryBuilderCanvas.getContext("2d"));
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
    queryBuilderCanvas.getContext("2d").clearRect(0, 0, queryBuilderCanvas.width, queryBuilderCanvas.height);
    rootQuery.draw(queryBuilderCanvas.getContext("2d"));
}

function canSwitchQueries(first, last) {
    if (first.hasParent(last) || last.hasParent(first)) {
        return false;
    }
    return true;
}

function switchQueries(first, last) {
    if (!canSwitchQueries(first, last)) {
        return;
    }

    var replaceFunc = last.replace;
    first.replace(last);
    replaceFunc.call(last, first);
}
