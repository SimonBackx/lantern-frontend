function Result(obj) {
    this.id = null;

    this.lastFound = "";
    this.createdOn = "";
    this.occurrences = 0;
    this.url = "";
    this.body = "";
    this.title = "";
    this.host = "";
    this.snippet = "";

    if (arguments.length >= 1) {
        this.id = obj["_id"];
        this.lastFound = obj["lastFound"];
        this.createdOn = obj["createdOn"];
        this.occurrences = obj["occurrences"];
        this.url = obj["url"];
        this.body = obj["body"];
        this.title = obj["title"];
        this.host = obj["host"];
        this.snippet = obj["snippet"];

        // Fix non cricital html redirect in Safari
        if (this.body) {
            this.body = this.body.replace("http-equiv=\"refresh\"", "");
        }
    }
}

function ResultsFromArray(json) {
    if (!Array.isArray(json)) {
        console.log("empty results");
        return [];
    } 
    var arr = [];
    for (var i = 0; i < json.length; i++) {
        var queryJson = json[i];
        arr.push(new Result(queryJson));
    }
    return arr;
}

function AggregatedResult(obj) {
    this.host = null;
    this.lastFound = "";
    this.count = 0;

    if (arguments.length >= 1) {
        this.host = obj["_id"];
        this.lastFound = obj["lastFound"];
        this.count = obj["count"];
    }
}

function AggregatedResultsFromArray(json) {
    if (!Array.isArray(json)) {
        console.log("empty results");
        return [];
    } 
    var arr = [];
    for (var i = 0; i < json.length; i++) {
        var queryJson = json[i];
        arr.push(new AggregatedResult(queryJson));
    }
    return arr;
}