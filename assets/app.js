// Main entry point
// ----------------

var flag = false,
    model,
    savedStates;

$(document).ready(function() {

    progressInit();
    // Generate model
    $("#generate").click(function() {
        model = new lib.Model(
            parseInt($("#population-input").val()),
            parseInt($("#hipster-slider")[0].value) / 100,
            parseInt($("#neighbor-input").val()),
            parseInt($("#rewire-slider")[0].value) / 100);
        renderGraph(model);
    });

    // Reset states to neutral
    $("#reset-states").click(function() {
        for (var i = 0; i < model.N; i++) {
            model.states[i] = 0;
        }
        updateGraph(model);
        progressInit();
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
        updateGraph(model);
        progressInit();
    });

    // Step
    $("#step").click(function() {
        model.setTendency(parseInt($("#tendency-slider")[0].value) / 100);
        model.evolve();
        updateProgress(model.counts());
        updateGraph(model);
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
                updateProgress(model.counts());
                updateGraph(model);
                if (flag) loop();
            }, 100);
        })();
    });

});
