// Population model

var lib = {};

(function(mod) {
    "use strict";

    // Assertion function
    var assert = function(statement, error) {
        if (!statement) {
            throw error;
        }
    };

    // Generate initial population
    // N ->  population size
    // hratio -> ratio of anti conformists
    // neighbors -> neighbors (half on each side) for the ring network model
    // p -> probability for adding shortcuts in network
    var Model = function(N, hratio, neighbors, p) {

        // Validate values
        assert((hratio >= 0) & (hratio <= 1), "Ratio should be between 0 and 1 (inclusive)");
        assert((p >= 0) & (p <= 1), "Rewiring probability should be between 0 and 1 (inclusive)");
        assert(neighbors % 2 == 0, "Initial neighbors should be even");
        var max_neighbors = N - 1;
        if (N % 2 == 0) {
            max_neighbors -= 1;
        }
        assert(neighbors <= max_neighbors, "Max number of neighbors reached");

        this.N = N;
        this.hratio = hratio;
        this.neighbors = neighbors;
        this.p = p;

        // Generate randomly distributed population
        this.population = new Array(N);
        for (var i = 0; i < N; i++) {
            if (Math.random() < hratio) {
                this.population[i] = -1;
            }
            else {
                this.population[i] = 1;
            }
        }

        // Provide initial 0 state
        this.states = new Array(N);
        for (i = 0; i < N; i++) {
            this.states[i] = 0;
        }

        // List of adjacencies
        // Initialize ring structure and extend to small world
        this.adjacencies = new Array(N);
        for (i = 0; i < N; i++) {
            this.adjacencies[i] = new Array(neighbors);
            for (var j = 1; j <= (neighbors / 2); j++) {
                this.adjacencies[i][(neighbors / 2) - j] = ((i - j) < 0) ? (N + (i - j)) : (i - j);
                this.adjacencies[i][(neighbors / 2) + j - 1] = ((i + j) >= N) ? ((i + j) - N) : (i + j);
            }
        }

        // Randomly add shortcuts between nodes
        // Do not remove original connections
        // TODO: avoid link duplication
        var randomNode;
        for (i = 0; i < N; i++) {
            if (Math.random() < p) {
                // Take another random node
                randomNode = Math.floor(Math.random() * (N));
                if (randomNode != i) {
                    this.adjacencies[i].push(randomNode);
                }
            }
        }
    };

    // Set sharing tendency of population
    Model.prototype.setTendency = function(tend) {
        // TODO: use beta distribution (currently setting all constant)
        this.tendencies = new Array(this.N);
        for (var i = 0; i < this.N; i++) {
            this.tendencies[i] = tend;
        }
    };

    // Get influence of states for a given individual
    Model.prototype.getInfluence = function(pop) {
        var total = 0,
            influencers = this.adjacencies[pop].length;
        for (var i = 0; i < influencers; i++) {
            total += this.states[this.adjacencies[pop][i]];
        }
        // TODO: support fractional influence
        return total > 0 ? 1 : total < 0 ? -1 : 0;
    };

    // Evolve the population one step
    Model.prototype.evolve = function() {
        // Creat new states
        var newStates = new Array(this.N),
            expressProbility;

        for (var i = 0; i < this.N; i++) {
            // Use the probability of expression
            if (Math.random() < this.tendencies[i]) {
                newStates[i] = this.population[i] * this.getInfluence(i);
            }
            else {
                newStates[i] = this.states[i];
            }
        }

        // Update states
        for (i = 0; i < this.N; i++) {
            this.states[i] = newStates[i];
        }
    };


    // Return counts
    Model.prototype.counts = function() {
        var total = this.states.reduce(function(prev, current) {
            return prev + current;
        });

        return total / this.N;
    };

    // Reset states
    Model.prototype.reset = function() {
        for (var i = 0; i < this.N; i++) {
            this.states[i] = 0;
        }
    };

    // Cycle states
    Model.prototype.toggleStates = function(i) {
        this.states[i] += (this.states[i] == 1) ? -2 : 1;
    };

    mod.Model = Model;
}(lib));
