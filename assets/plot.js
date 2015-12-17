// Graphing functions
// ------------------

var lib = lib || {};

(function(glob) {
    "use strict";

    // Global color var
    var colors = [
        "rgb(155, 89, 182)", // Color one
        "rgb(200, 200, 200)", // Neutral
        "rgb(52, 152, 219)" // Color two
    ];

    // Population Network plotting
    // model -> Model to be initially plotted
    // divSelector -> Working div
    var NetworkGraph = function(model, divSelector) {
        // Initialize variables
        this.nodes = new Array(model.N);
        this.links = [];
        this.width = $(divSelector).width(),
        this.height = $(divSelector).height();

        // Generate data
        for (var i = 0; i < model.N; i++) {
            this.nodes[i] = {
                "state": -model.states[i]
            };

            for (var j = 0; j < model.adjacencies[i].length; j++) {
                this.links.push({
                    "source": i,
                    "target": model.adjacencies[i][j]
                });
            }
        }

        this.force = d3.layout.force()
            .charge(-100)
            .linkDistance(10)
            .size([this.width, this.height]);

        // Clear old plot
        d3.select(divSelector + " canvas").remove();
        this.canvas = d3.select(divSelector).append("canvas")
            .attr("width", this.width)
            .attr("height", this.height);
        this.context = this.canvas.node().getContext("2d");

        var that = this; // Oh yeah !

        that.force
            .nodes(that.nodes)
            .links(that.links)
            .on("tick", function() {
                that.draw();
            })
            .start();

        // Bind mouse events
        that.canvas.node().addEventListener("click", function(evt) {
            var mousePos = getMousePos(this, evt);
            model.toggleStates(getNearestNode(mousePos));
            that.update(model);
        }, false);

        function getMousePos(cv, evt) {
            var rect = cv.getBoundingClientRect();
            return {
                x: (evt.clientX - rect.left) / (rect.right - rect.left) * cv.width,
                y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * cv.height
            };
        };

        // Return nearest node id
        function getNearestNode(point) {
            var minIdx = 0,
                minVal = distance(minIdx),
                currentVal;

            for (i = 1; i < that.nodes.length; i++) {
                currentVal = distance(i);
                if (currentVal < minVal) {
                    minIdx = i;
                    minVal = currentVal;
                }
            }

            function distance(idx) {
                return Math.abs(that.nodes[idx].x - point.x) +
                    Math.abs(that.nodes[idx].y - point.y);
            };

            return minIdx;
        };
    };

    // Update the colors of nodes
    NetworkGraph.prototype.update = function(model) {
        for (var i = 0; i < model.N; i++) {
            this.nodes[i].state = model.states[i];
        }
        this.draw();
    };

    // Actual drawing
    NetworkGraph.prototype.draw = function() {
        var ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw links
        ctx.strokeStyle = "#ccc";
        ctx.beginPath();
        this.links.forEach(function(d) {
            ctx.moveTo(d.source.x, d.source.y);
            ctx.lineTo(d.target.x, d.target.y);
        });
        ctx.stroke();

        // Draw neutral nodes
        ctx.fillStyle = colors[1];
        ctx.beginPath();
        this.nodes.forEach(function(d) {
            if (d.state == 0) {
                ctx.moveTo(d.x, d.y);
                ctx.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
            }
        });
        ctx.fill();

        // Draw color 1 nodes
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        this.nodes.forEach(function(d) {
            if (d.state == -1) {
                ctx.moveTo(d.x, d.y);
                ctx.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
            }
        });
        ctx.fill();

        // Draw color 2 nodes
        ctx.fillStyle = colors[2];
        ctx.beginPath();
        this.nodes.forEach(function(d) {
            if (d.state == 1) {
                ctx.moveTo(d.x, d.y);
                ctx.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
            }
        });
        ctx.fill();
    };

    // State space plots
    // ------------------

    // Initialize statespace plots in given div
    // model -> population model
    // watch -> which individuals to watch [-1, 1, 0 (for all)]
    // divSelector -> div to place canvas in
    var StateSpaceChart = function(model, watch, divSelector) {
        this.watch = watch;
        this.width = $(divSelector).width();
        this.height = $(divSelector).height();

        // Setup canvas
        d3.select(divSelector + " canvas").remove();
        this.canvas = d3.select(divSelector).append("canvas")
            .attr("width", this.width)
            .attr("height", this.height);
        this.context = this.canvas.node().getContext("2d");

        var views,
            viewsx;
        // Set stuff
        if (this.watch == 0) {
            this.len = model.N;
            views = model.views(-1);
            viewsx = model.views(1);
            this.prevPoint = {
                x: views[0] + viewsx[0],
                y: views[1] + viewsx[1]
            };
        }
        else {
            this.len = model.population.filter(function(e) {
                return e == watch;
            }).length;
            views = model.views(this.watch);
            this.prevPoint = {
                x: views[0],
                y: views[1]
            };
        }
        this.currentPoint = this.prevPoint;

        // Setup scale
        this.xScale = d3.scale.linear()
            .domain([0, this.len])
            .range([0, this.width]);
        this.yScale = d3.scale.linear()
            .domain([0, this.len])
            .range([0, this.height]);
    };

    // Update the new values
    StateSpaceChart.prototype.update = function(model) {
        var views,
            viewsx;
        if (this.watch == 0) {
            views = model.views(-1);
            viewsx = model.views(1);
            this.currentPoint = {
                x: views[0] + viewsx[0],
                y: views[1] + viewsx[1]
            };
        }
        else {
            views = model.views(this.watch);
            this.currentPoint = {
                x: views[0],
                y: views[1]
            };
        }

        // Draw
        this.context.strokeStyle = "rgba(20, 20, 20, 0.6)";
        this.context.beginPath();
        this.context.moveTo(
            this.xScale(this.prevPoint.x),
            this.yScale(this.prevPoint.y)
        );
        this.context.lineTo(
            this.xScale(this.currentPoint.x),
            this.yScale(this.currentPoint.y)
        );
        this.context.stroke();

        // Update tracker
        this.prevPoint = this.currentPoint;
    };

    glob.NetworkGraph = NetworkGraph;
    glob.StateSpaceChart = StateSpaceChart;

}(lib));
