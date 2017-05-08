/**
 * De QueryBuilder beheert de interface die het toelaat om queries aan te passen.
 */
function QueryBuilder() {
    this.query = null;
    this.root = null;
    this.selected = null;
    this.animationInterval = null;

    this.element = document.getElementById('query-builder');
    this.menu = document.getElementById('query-builder-menu');
    this.menuType = document.getElementById('type-input');
    this.canvas = document.getElementById('query-builder-canvas');
    this.nameInput = document.getElementById('name-input');

    this.deleteButton = document.getElementById('edit-query-delete-button');

    setListener(this.nameInput, "keydown", function() {
        me.didUpdateName(this);
    });
    setListener(this.nameInput, "keyup", function() {
        me.didUpdateName(this);
    });
    setListener(this.nameInput, "change", function() {
        me.didUpdateName(this);
    });

    // todo: verwijder bestaande event listeners
    
    // Luisteren naar wijzigen van type
    var me = this;

    // Luisteren naar aanpassingen van inputs in het menu
    this.inputElements = this.menu.querySelectorAll("input,select,textarea");
    for (var i = 0; i < this.inputElements.length; i++) {
        var element = this.inputElements[i];
        setListener(element, "keydown", function() {
            me.didUpdateInput(this);
        });
        setListener(element, "keyup", function() {
            me.didUpdateInput(this);
        });
        setListener(element, "change", function() {
            me.didUpdateInput(this);
        });
    }

    // Na de loop doen, anders wordt het overschreven!
    setListener(this.menuType, "change", function() {
       me.didUpdateQueryType();
    });

    // Luisteraars voor actie knoppen
    setListener(document.getElementById('split-button'), "click", function() {
        me.splitSelectedQuery();
    });

    setListener(document.getElementById('remove-button'), "click", function() {
        me.removeSelectedQuery();
    });

    window.onresize = function() {
        me.updateCanvasSize();
        me.root.draw(me.canvas.getContext("2d"));
    };

    // Klikken / slepen luisteraars
    var mouseStartX = 0;
    var mouseStartY = 0;
    var ignoreDown = false;
    var currentMovingQuery = null;

    setListener(this.menu, "mousedown", function(event){
        ignoreDown = true;
    });

    setListener(this.element, "mousedown", function(event){
        if (ignoreDown) {
            ignoreDown = false;
            return;
        }
        if (!me.root) {
            return;
        }

        var event = window.event || event;
        var button = event.which || event.button;
        if (button != 1) {
            // ignore right click
            return;
        }

        currentMovingQuery = null;

        mouseStartX = event.pageX;
        mouseStartY = event.pageY;

        var offset = me.element.documentOffsetTop;
        var y = event.pageY - offset;

        if (y < 0) {
            return;
        }

        var query = me.root.find(y);
        me.setSelectedQuery(query);
        currentMovingQuery = query;
        currentMovingQuery.moving = true;
        me.update();
    });

    setListener(document, "mousemove", function(event){
        if (currentMovingQuery) {
            var y = event.pageY - me.element.documentOffsetTop;
            var query = me.root.find(y);

            me.root.resetSimulation();

            if (canSwitchQueries(currentMovingQuery, query)) {
                currentMovingQuery.simulatedParent = query.parent;
                query.simulatedParent = currentMovingQuery.parent;

                me.calculatePosition();
                query.setMovingOffset(currentMovingQuery.calculatedX - query.calculatedX + 20, currentMovingQuery.calculatedY - query.calculatedY);
                me.needsAnimation();
            } else {
                me.calculatePosition();
                me.needsAnimation();
            }

            currentMovingQuery.setOffset(event.pageX - mouseStartX, event.pageY - mouseStartY);
        }
    });

    setListener(document, "mouseup", function() {
        if (!me.root) {
            return;
        }

        ignoreDown = false;
        me.root.resetSimulation();
        if (currentMovingQuery) {
            var offset = me.element.documentOffsetTop;
            var y = event.pageY - offset;
            var query = me.root.find(y);
            switchQueries(currentMovingQuery, query);
            currentMovingQuery.moving = false;
        }
        currentMovingQuery = null;
        me.update();
        me.needsAnimation();
    });
};

QueryBuilder.prototype.willHide = function() {
    removeAllListeners(this.element, "mousedown");
    removeAllListeners(document, "mouseup");
    removeAllListeners(document, "mousemove");
    
    if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
    }

    // Clear existing builder
    var queries = this.element.querySelectorAll(".query");
    if (queries) {
        for (var i = 0; i < queries.length; i++) {
            var node = queries[i];
            node.parentNode.removeChild(node);
            console.log("test");
        }
    }

    this.setSelectedQuery(null);
}

QueryBuilder.prototype.setQuery = function(query) {
    var queryAction = unmarshalQueryAction(query.root);
    this.setRootQuery(queryAction);

    this.query = query;
    this.nameInput.value = query.name;
    this.update();

    if (query.isNew()) {
        this.deleteButton.style.display = "none";
    } else {
        this.deleteButton.style.display = "";
    }
};

QueryBuilder.prototype.didUpdateName = function(input) {
    if (!this.query) {
        return;
    }
    this.query.name = input.value;
};

QueryBuilder.prototype.onBecomeVisible = function() {
    this.updateCanvasSize();
    this.redraw();
}

QueryBuilder.prototype.updateCanvasSize = function() {
    this.canvas.width = this.element.offsetWidth;
    this.canvas.height = this.element.offsetHeight;
    this.canvas.style.width = this.element.offsetWidth + "px";
    this.canvas.style.height = this.element.offsetHeight + "px";
};

QueryBuilder.prototype.calculatePosition = function() {
    this.root.calculatePosition(25, 10);
};

QueryBuilder.prototype.update = function() {
    this.calculatePosition();
    this.root.step(this.element);
    this.redraw();
    console.log("update builder");
}

QueryBuilder.prototype.splitSelectedQuery = function() {
    if (!this.selected) {
        return;
    }
    this.selected.split();
    this.setSelectedQuery(this.selected.parent);
    this.update();
};

QueryBuilder.prototype.removeSelectedQuery = function() {
    if (!this.selected) {
        return;
    }
    this.selected.remove();
    this.setSelectedQuery(null);
    this.update();
};

QueryBuilder.prototype.didUpdateInput = function(input) {
    var prop = input.getAttribute("data-property");
    if (!prop || !this.selected) {
        return;
    }

    var type = input.getAttribute("data-type");
    if (type && type == "array") {
        var value = input.value;
        this.selected[prop] = value.replace("\n\r", "\n").split("\n");
    } else {
        this.selected[prop] = input.value;
    }
    this.update();
};

QueryBuilder.prototype.didUpdateQueryType = function() {
    if (this.selected === null || this.selected.type == "operator") {
        return;
    }

    // Type aanpassen
    var type = this.menuType.value;
    this.menu.className = type+"-selected";

    var replaceWith = this.selected;
    switch(type) {
        case "empty":
            replaceWith = new Query();
            break;
        case "regexp":
            replaceWith = new RegexpQuery();
            break;
        case "text":
            replaceWith = new TextQuery();
            break;
        case "list":
            replaceWith = new ListQuery();
            break;
    }

    if (this.selected.element)
        this.selected.element.parentNode.removeChild(this.selected.element);
    this.selected.replace(replaceWith);
    
    this.setSelectedQuery(replaceWith);

    this.update();
}

QueryBuilder.prototype.setSelectedQuery = function(query) {
    this.root.resetSelected();

    if (query === null) {
        // Menu verbergen
        this.menu.style.display = "none";
        return;
    }
    query.selected = true;

    // Menu zichtbaar maken
    this.menu.style.display = "";
    this.selected = query;
    
    // Type aanpassen
    if (query.type != "operator") {
        this.menuType.value = query.type;
    }

    // Inputs zichtbaar maken voor dit type query
    this.menu.className = query.type+"-selected";
    
    // Values aanpassen van alle menu inputs
    for (var i = 0; i < this.inputElements.length; i++) {
        var element = this.inputElements[i];
        
        var prop = element.getAttribute("data-property");
        if (!prop) {
            // deze input is niet verbonden aan een query property
            continue;
        }

        if (!query[prop]) {
            // de query maakt geen gebruik van deze property
            // we maken het leeg
            element.value = "";
            continue;
        }


        var type = element.getAttribute("data-type");
        if (type && type == "array") {
            // Als het een array is converteren we de array naar tekst
            element.value = query[prop].join("\n");
        } else {
            element.value = query[prop];
        }
    }
};

QueryBuilder.prototype.replaceRoot = function(query) {
    this.root.remove();
    this.setRootQuery(query);
    this.setSelectedQuery(null);
};

QueryBuilder.prototype.setRootQuery = function(query) {
    var builder = this;
    query.replace = function(q) {
        if (q === null) {
            return;
        }
        builder.setRootQuery(q);
    };

    query.parent = null;
    this.root = query;
};

QueryBuilder.prototype.needsAnimation = function() {
    if (this.animationInterval === null) {

        var builder = this;
        this.animationInterval = setInterval(function() {
            builder.animationLoop();
        }, 5);
    }
};

QueryBuilder.prototype.animationLoop = function() {

    if (!this.root.step(this.element)) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
    }
    this.redraw();
};

QueryBuilder.prototype.redraw = function() {
    this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.root.draw(this.canvas.getContext("2d"));
};
