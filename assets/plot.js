// Graphing functions
// ------------------
// Polluting global namespace

var colors = [
    "rgb(155, 89, 182)", // anti color
    "rgb(200, 200, 200)", // neutral color
    "rgb(52, 152, 219)" // normal color
],
    nodes,
    links = [],
    mainWidth = $("#graph").width(),
    mainHeight = window.innerHeight - 50;//$("#graph").height();

var progressCtx,
    progressWidth = $("#progress").width(),
    progressHeight = $("#progress").height(),
    progressVals = new Array(progressWidth);

// First rendering of graph
var renderGraph = function(model) {

    // Generate data
    nodes = new Array(model.N);
    links = [];
    for (var i = 0; i < model.N; i++) {
        nodes[i] = {
            "state": model.states[i]
        };

        for (var j = 0; j < model.adjacencies[i].length; j++) {
            links.push({
                "source": i,
                "target": model.adjacencies[i][j]
            });
        }
    }

    var force = d3.layout.force()
        .charge(-100)
        .linkDistance(10)
        .size([mainWidth, mainHeight]);

    d3.select("#graph canvas").remove();
    var canvas = d3.select("#graph").append("canvas")
        .attr("width", mainWidth)
        .attr("height", mainHeight);
    var context = canvas.node().getContext("2d");

    force
        .nodes(nodes)
        .links(links)
        .on("tick", function() {
            draw(context, links, nodes);
        })
        .start();

    // Bind mouse events
    canvas.node().addEventListener("click", function(evt) {
        var mousePos = getMousePos(canvas.node(), evt);
        model.toggleStates(getNearestNode(mousePos));
        updateGraph(model);
    }, false);

    var getMousePos = function(cv, evt) {
        var rect = cv.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * cv.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * cv.height
        };
    };

    // Return nearest node id
    var getNearestNode = function(point) {
        var minIdx = 0,
            minVal = distance(minIdx),
            currentVal;

        for (i = 1; i < nodes.length; i++) {
            currentVal = distance(i);
            if (currentVal < minVal) {
                minIdx = i;
                minVal = currentVal;
            }
        }

        // Give distance from the point
        function distance(idx) {
            return Math.abs(nodes[idx].x - point.x) + Math.abs(nodes[idx].y - point.y);
        };

        return minIdx;
    };

};

// Update the color of nodes
var updateGraph = function(model) {
    // Update states
    for (var i = 0; i < model.N; i++) {
        nodes[i].state = model.states[i];
    }
    var context = d3.select("canvas").node().getContext("2d");
    draw(context, links, nodes);
};

// Canvas redrawing function
function draw(context, links, nodes) {
    context.clearRect(0, 0, mainWidth, mainHeight);

    // draw links
    context.strokeStyle = "#ccc";
    context.beginPath();
    links.forEach(function(d) {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
    });
    context.stroke();

    // draw neutral nodes
    context.fillStyle = colors[1];
    context.beginPath();
    nodes.forEach(function(d) {
        if (d.state == 0) {
            context.moveTo(d.x, d.y);
            context.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
        }
    });
    context.fill();

    // draw anti nodes
    context.fillStyle = colors[0];
    context.beginPath();
    nodes.forEach(function(d) {
        if (d.state == -1) {
            context.moveTo(d.x, d.y);
            context.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
        }
    });
    context.fill();

    // draw favorable nodes
    context.fillStyle = colors[2];
    context.beginPath();
    nodes.forEach(function(d) {
        if (d.state == 1) {
            context.moveTo(d.x, d.y);
            context.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
        }
    });
    context.fill();
}



// Progress chart functions

// Initialize progress
var progressInit = function() {
    d3.select("#progress canvas").remove();
    var canvas = d3.select("#progress").append("canvas")
        .attr("width", progressWidth)
        .attr("height", progressHeight);
    progressCtx = canvas.node().getContext("2d");

    for (var i = 0; i < progressVals.length; i++) {
        progressVals[i] = 0;
    }

    // 0 line
    progressCtx.strokeStyle = "#ccc";
    progressCtx.beginPath();

    progressCtx.moveTo(0, progressHeight / 2);
    progressCtx.lineTo(progressWidth, progressHeight / 2);
    progressCtx.stroke();
};

// Update progress graph
var updateProgress = function(value) {
    progressVals.shift();
    progressVals.push(-value);

    progressCtx.clearRect(0, 0, progressWidth, progressHeight);

    // 0 line
    progressCtx.strokeStyle = "#ccc";
    progressCtx.beginPath();

    progressCtx.moveTo(0, progressHeight / 2);
    progressCtx.lineTo(progressWidth, progressHeight / 2);
    progressCtx.stroke();

    // draw lines
    progressCtx.strokeStyle = "steelblue";
    progressCtx.beginPath();

    progressCtx.moveTo(0, (progressVals[0] + 1) * progressHeight / 2);
    for (var i = 1; i < progressVals.length; i++) {
        progressCtx.lineTo(i, (progressVals[i] + 1) * progressHeight / 2);
    }
    progressCtx.stroke();
};
