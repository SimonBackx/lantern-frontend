function StatsView() {
    View.call(this, "stats-view");
    
}

StatsView.prototype = Object.create(View.prototype);
StatsView.prototype.didAppear = function() {
    var request = new Request("GET", "/stats");
    request.acceptJSON();
    
    var me = this;
    request.onSuccess = function(status, response) {
        console.log(status);
        console.log(response);
        if (response && response.length > 0) {
            me.processData(response)
        }
    };

    request.onFailure = function(status, response) {
        alert("Something went wrong while connecting to the server.");
    };

    request.send();

};

StatsView.prototype.processData = function(response) {
    var data = [];
    var workers = [];
    var domains = [];
    var timeouts = [];
    var downloadSpeed = [];
    var downloadTime = [];
    var downloadSize = [];

    for (var i = 0; i < response.length; i++) {
        var r = response[i];
        data.push({
            x: new Date(r.date),
            y: r.requests/60
        });

        workers.push({
            x: new Date(r.date),
            y: r.workers
        });

        domains.push({
            x: new Date(r.date),
            y: r.domains
        });

        timeouts.push({
            x: new Date(r.date),
            y: r.timeouts
        });

        downloadSpeed.push({
            x: new Date(r.date),
            y: r.downloadSpeed
        });
        downloadTime.push({
            x: new Date(r.date),
            y: r.downloadTime
        });
        downloadSize.push({
            x: new Date(r.date),
            y: r.downloadSize
        });
    }

    var axis = {
        type: 'time',
        time: {
            round: 'minute',
            unit: "hour",
            displayFormats: {
                hour: 'HH:mm'
            }
        }
    };

    var ctx = document.getElementById("stat1");
    var chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        datasets: [{
                label: 'Requests per second',
                borderColor: "rgba(255,248,69,1)",
                backgroundColor: "rgba(255,248,69,0.4)",
                pointBorderColor: "rgba(255,248,69,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: data
            },
            {
                label: 'Timeouts per minute',
                borderColor: "rgba(255,84,69,1)",
                backgroundColor: "rgba(255,84,69,0.4)",
                pointBorderColor: "rgba(255,84,69,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: timeouts
            }
            ]
        },
        options: {
            scales: {
                xAxes: [axis]
            }
        }
    });

    ctx = document.getElementById("stat2");
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        datasets: [{
                label: 'Download speed (KB/s)',
                borderColor: "rgba(255,182,69,1)",
                backgroundColor: "rgba(255,182,69,0.4)",
                pointBorderColor: "rgba(255,182,69,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: downloadSpeed
            },
            {
                label: 'Average page size (KB)',
                borderColor: "rgba(69,255,116,1)",
                backgroundColor: "rgba(69,255,116,0.4)",
                pointBorderColor: "rgba(69,255,116,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: downloadSize
            }]
        },
        options: {
            scales: {
                xAxes: [axis]
            }
        }
    });

    ctx = document.getElementById("stat3");
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        datasets: [{
                label: 'Download time per page (ms)',
                borderColor: "rgba(69,185,225,1)",
                backgroundColor: "rgba(69,185,225,0.4)",
                pointBorderColor: "rgba(69,185,225,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: downloadTime
            }]
        },
        options: {
            scales: {
                xAxes: [axis]
            }
        }
    });

    ctx = document.getElementById("stat4");
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
        datasets: [{
                label: 'Active workers',

                borderColor: "rgba(115,69,225,1)",
                backgroundColor: "rgba(115,69,225,0.4)",
                pointBorderColor: "rgba(115,69,225,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: workers
            },
            {
                label: 'Known domains',

                borderColor: "rgba(255,69,253,1)",
                backgroundColor: "rgba(255,69,253,0.4)",
                pointBorderColor: "rgba(255,69,253,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                pointRadius: 0,
                pointHitRadius: 10,

                data: domains
            }]
        },
        options: {
            scales: {
                xAxes: [axis]
            }
        }
    });

};