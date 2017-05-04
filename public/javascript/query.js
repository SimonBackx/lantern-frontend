var boxHeight = 40;
var boxMargin = 15;
var indentWidth = 40;
var arapawa = "#1A0E64";
var whisper = "#EAE9F3";

var AND_OPERATOR = "AND";
var OR_OPERATOR = "OR";


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

function Query(name, queryAction) {
    this.name = name;
    this.createdOn = null;
    this.root = queryAction;
}

function QueryAction() {
    this.type = "empty"
    this.x = null;
    this.y = null;
    this.goalX = 0;
    this.goalY = 0;

    this.calculatedX = 0;
    this.calculatedY = 0;

    this.selected = false;
    this.moving = false;

    this.velocityX = 0;
    this.velocityY = 0;

    this.element = document.createElement("div");
    this.element.className = "empty query";
    this.parent = null;
    this.simulatedParent = null;

    this.replace = function() {};
}

QueryAction.prototype.calculatePosition = function(x, y) {

    this.goalX = x;
    this.goalY = y;

    this.calculatedX = this.goalX;
    this.calculatedY = this.goalY;

    if (this.x === null && this.y === null) {
        this.x = x;
        this.y = y;
    }
    
    return boxHeight;
}

QueryAction.prototype.hasParent = function(query) {
    if (this.parent === null) {
        return false;
    }

    if (this.parent === query) {
        return true;
    }
    return this.parent.hasParent(query);
}

QueryAction.prototype.find = function(y) {
    return this;
}

QueryAction.prototype.marshal = function() {
    return {'type': this.type};
}

QueryAction.prototype.deepCopy = function() {
    return unmarshalQueryAction(this.marshal);
}

QueryAction.prototype.isValid = function(y) {
    return false;
}

QueryAction.prototype.split = function() {
    var replace = this.replace;
    var operator = new OperatorQuery(this, new QueryAction());
    replace.call(this, operator);
}

QueryAction.prototype.removeDOM = function() {
    if (this.element)
        this.element.parentNode.removeChild(this.element);
}

QueryAction.prototype.remove = function() {
    this.replace(null);
    this.removeDOM();
}

QueryAction.prototype.replaceWith = function(query) {
    this.replace(query);
    if (this.element)
        this.element.parentNode.removeChild(this.element);
}

QueryAction.prototype.draw = function(ctx) {
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

QueryAction.prototype.setOffset = function(x, y, container) {
    this.x = this.calculatedX + x;
    this.y = this.calculatedY + y;
    this.updateDOM(container);
}

QueryAction.prototype.setMovingOffset = function(x, y, container) {
    this.goalX = this.calculatedX + x;
    this.goalY = this.calculatedY + y;
}

QueryAction.prototype.updateDOM = function(container) {
    if (!this.element.parentElement) {
        container.appendChild(this.element);
    }

    this.element.style.left = this.x+"px";
    this.element.style.top = this.y+"px";

    if (this.selected || this.moving) {
        this.element.className = this.type+" query selected";
    } else {
        this.element.className = this.type+" query";
    }
}

QueryAction.prototype.step = function(container) {
    if (this.moving) {
        this.updateDOM(container);
        return false;
    }

    var k = 2
    var deltaX = this.x - this.goalX;
    var deltaY = this.y - this.goalY;

    var c = 10
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

QueryAction.prototype.resetSimulation = function() {
    this.simulatedParent = null;
}

QueryAction.prototype.resetSelected = function() {
    this.selected = false;
}

/**
 * @param QueryAction first    
 * @param QueryAction last
 * @param optional string operator = "AND"
 */
function OperatorQuery(first, last, operator) {
    QueryAction.call(this);
    this.setFirst(first);
    this.setLast(last);
    this.firstHeight = 0;
    this.lastHeight = 0;
    this.type = "operator"

    if (arguments.length < 3) {
        this.operator = AND_OPERATOR;
    } else {
        this.operator = operator;
    }

    this.element.className = "operator query";
}

function OperatorQueryFromJson(json) {
    var first = unmarshalQueryAction(json.first);
    var last = unmarshalQueryAction(json.last);
    if (json.operator) {
        return new OperatorQuery(first, last, json.operator);
    }
    
    return new OperatorQuery(first, last);
}

OperatorQuery.prototype = Object.create(QueryAction.prototype);

OperatorQuery.prototype.setFirst = function(query) {
    query.parent = this;
    this.first = query;

    var me = this;
    query.replace = function(q) {
        if (q === null) {
            me.replaceWith(me.last);
            return;
        }
        me.setFirst(q);
    };
}

OperatorQuery.prototype.setLast = function(query) {
    query.parent = this;
    this.last = query;

    var me = this;
    query.replace = function(q) {
        if (q === null) {
            me.replaceWith(me.first);
            return;
        }
        me.setLast(q);
    };
}

RegexpQuery.prototype.isValid = function() {
    return this.first.isValid() && this.last.isValid();
}

OperatorQuery.prototype.marshal = function() {
    var obj = QueryAction.prototype.marshal.call(this);
    obj['first'] = this.first.marshal();
    obj['last'] = this.last.marshal();
    obj['operator'] = this.operator;
    return obj;
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
    }

    this.lastHeight = this.last.calculatePosition(this.goalX + indentWidth, this.goalY + boxMargin + boxHeight);
    return boxHeight + this.firstHeight + boxMargin*2 + this.lastHeight;
}

OperatorQuery.prototype.draw = function(ctx) {
    this.first.draw(ctx);
    QueryAction.prototype.draw.call(this, ctx);
    this.last.draw(ctx);
}

OperatorQuery.prototype.removeDOM = function() {
    this.first.removeDOM();
    QueryAction.prototype.removeDOM.call(this);
    this.last.removeDOM();
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
    QueryAction.prototype.setOffset.call(this, x, y, container);
    this.last.setOffset(x, y, container);
}

OperatorQuery.prototype.setMovingOffset = function(x, y, container) {
    this.first.setMovingOffset(x, y,container);
    QueryAction.prototype.setMovingOffset.call(this, x, y, container);
    this.last.setMovingOffset(x, y, container);
}

OperatorQuery.prototype.step = function(container) {
    if (this.moving) {
        return QueryAction.prototype.step.call(this, container);
    }

    var f = this.first.step(container);
    var m = QueryAction.prototype.step.call(this, container);

    return this.last.step(container) || f || m;
}

OperatorQuery.prototype.resetSimulation = function() {
    this.first.resetSimulation();
    QueryAction.prototype.resetSimulation.call(this);
    this.last.resetSimulation();
}

OperatorQuery.prototype.resetSelected = function() {
    this.first.resetSelected();
    QueryAction.prototype.resetSelected.call(this);
    this.last.resetSelected();
}

OperatorQuery.prototype.updateDOM = function(container) {
    QueryAction.prototype.updateDOM.call(this, container);

    this.element.innerText = this.operator;
}

function RegexpQuery(json) {
    QueryAction.call(this);
    this.type = "regexp";

    if (arguments.length == 0 || !json.regexp) {
        this.regexp = "";
    } else {
        this.regexp = json.regexp;
    }
}
RegexpQuery.prototype = Object.create(QueryAction.prototype);

RegexpQuery.prototype.isValid = function() {
    // todo: regexp verificatie
    return true;
}

RegexpQuery.prototype.marshal = function() {
    var obj = QueryAction.prototype.marshal.call(this);
    obj['regexp'] = this.regexp;
    return obj;
}

RegexpQuery.prototype.updateDOM = function(container) {
    QueryAction.prototype.updateDOM.call(this, container);

    this.element.innerText = this.regexp;
}

function TextQuery(json) {
    QueryAction.call(this);
    this.type = "text";

    if (arguments.length == 0 || !json.text) {
        this.text = "";
    } else {
        this.text = json.text;
    }
}
TextQuery.prototype = Object.create(QueryAction.prototype);

TextQuery.prototype.isValid = function() {
    return this.text.length > 0;
}

TextQuery.prototype.marshal = function() {
    var obj = QueryAction.prototype.marshal.call(this);
    obj['text'] = this.text;
    return obj;
}

TextQuery.prototype.updateDOM = function(container) {
    QueryAction.prototype.updateDOM.call(this, container);

    this.element.innerText = this.text;
}

function ListQuery(json) {
    QueryAction.call(this);
    this.type = "list";

    if (arguments.length == 0 || !json.list) {
        this.list = [];
    } else {
        this.list = json.list;
    }
}
ListQuery.prototype = Object.create(QueryAction.prototype);

ListQuery.prototype.isValid = function() {
    return this.list.length > 0;
}

ListQuery.prototype.marshal = function() {
    var obj = QueryAction.prototype.marshal.call(this);

    // Deep copy van list maken
    obj['list'] = this.list.slice();
    return obj;
}

ListQuery.prototype.updateDOM = function(container) {
    QueryAction.prototype.updateDOM.call(this, container);

    this.element.innerText = "List["+this.list.length+"]";
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

function unmarshalQueryAction(obj) {
    if (!obj.type) {
        return QueryAction();
    }

    switch(obj.type) {
        case "regexp":
            return new RegexpQuery(obj);
        case "text":
            return new TextQuery(obj);
        case "list":
            return new ListQuery(obj);
        case "operator":
            return OperatorQueryFromJson(obj);
    }
    return new QueryAction();
}
