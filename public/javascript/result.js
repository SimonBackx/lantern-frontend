function Result(obj) {
    this.id = null;

    this.lastFound = "";
    this.createdOn = "";
    this.occurrences = 0;
    this.url = "";
    this.body = "";

    if (arguments.length >= 1) {
        this.id = obj["_id"];
        this.lastFound = obj["lastFound"];
        this.createdOn = obj["createdOn"];
        this.occurrences = obj["occurrences"];
        this.url = obj["url"];
        this.body = obj["body"];
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