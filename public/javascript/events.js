var _eventHandlers = {}; 

function setListener(node, event, handler) {
    removeAllListeners(node, event);
    addListener(node, event, handler);
}

function addListener(node, event, handler) {
    if(!(node in _eventHandlers)) {
        // _eventHandlers stores references to nodes
        _eventHandlers[node] = {};
    }
    if(!(event in _eventHandlers[node])) {
        // each entry contains another entry for each event type
        _eventHandlers[node][event] = [];
    }
    // capture reference
    _eventHandlers[node][event].push(handler);
    node.addEventListener(event, handler);
 }

function removeAllListeners(node, event) {
    if(node in _eventHandlers) {
        var handlers = _eventHandlers[node];

        if (arguments.length >= 1) {
            if(event in handlers) {
                var eventHandlers = handlers[event];
                for(var i = eventHandlers.length; i--;) {
                    var handler = eventHandlers[i];
                    node.removeEventListener(event, handler);
                }
            }
            //delete _eventHandlers[node][event]; 
        } else {
            for (var event in handlers) {
                var eventHandlers = handlers[event];
                for(var i = eventHandlers.length; i--;) {
                    var handler = eventHandlers[i];
                    node.removeEventListener(event, handler);
                }
            }
            //delete _eventHandlers[node]; 
        }
    }
}