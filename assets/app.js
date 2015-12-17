// Main entry point
// ----------------

var flag = false,
    model,
    networkGraph,
    hipsterPlot,
    normalPlot,
    allPlot,
    savedStates;

$(document).ready(function() {

    // Generate model
    $("#generate").click(function() {
        model = new lib.Model(
            parseInt($("#population-input").val()),
            parseInt($("#hipster-slider")[0].value) / 100,
            parseInt($("#neighbor-input").val()),
            parseInt($("#rewire-slider")[0].value) / 100);
        networkGraph = new lib.NetworkGraph(model, "#network-graph");
        hipsterPlot = new lib.StateSpaceChart(model, -1, "#hipster-graph");
        normalPlot = new lib.StateSpaceChart(model, 1, "#normal-graph");
        allPlot = new lib.StateSpaceChart(model, 0, "#all-graph");

    });

    // Reset states to neutral
    $("#reset-states").click(function() {
        for (var i = 0; i < model.N; i++) {
            model.states[i] = 0;
        }
        networkGraph.update(model);
        hipsterPlot.update(model);
        normalPlot.update(model);
        allPlot.update(model);
    });

    // Save states
    $("#save-states").click(function() {
        savedStates = new Array(model.N);
        for (var i = 0; i < model.N; i++) {
            savedStates[i] = model.states[i];
        }
    });

    // Revert to saved states
    $("#revert-states").click(function() {
        for (var i = 0; i < model.N; i++) {
            model.states[i] = savedStates[i];
        }
        networkGraph.update(model);
        hipsterPlot.update(model);
        normalPlot.update(model);
        allPlot.update(model);
    });

    // Step
    $("#step").click(function() {
        model.setTendency(parseInt($("#tendency-slider")[0].value) / 100);
        model.evolve();
        networkGraph.update(model);
        hipsterPlot.update(model);
        normalPlot.update(model);
        allPlot.update(model);
    });

    // Play pause
    $("#run").click(function() {
        model.setTendency(parseInt($("#tendency-slider")[0].value) / 100);
        if (flag) {
            flag = false;
            $("#run").text("play");
        }
        else {
            flag = true;
            $("#run").text("pause");
        }

        (function loop () {
            setTimeout(function () {
                model.evolve();
                networkGraph.update(model);
                hipsterPlot.update(model);
                normalPlot.update(model);
                allPlot.update(model);
                if (flag) loop();
            }, 100);
        })();
    });

});
