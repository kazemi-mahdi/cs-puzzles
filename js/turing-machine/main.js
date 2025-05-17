'use strict';

// Initialize the Turing machine visualization
function initTuringMachine() {
    // Create SVG containers
    var stateDiagram = d3.select('#state-diagram');
    var tapeContainer = d3.select('#tape-container');

    // Initialize tape visualization
    var tape = new TapeViz(tapeContainer, 10, '_', '');

    // Example Turing machine definition - Binary to Unary Converter
    var exampleTM = {
        states: ['q0', 'q1', 'q2', 'q3'],
        alphabet: ['0', '1', '_', 'X'],
        transitions: [
            // Read first digit
            { from: 'q0', read: '0', to: 'q1', write: 'X', move: MoveHead.right },
            { from: 'q0', read: '1', to: 'q2', write: 'X', move: MoveHead.right },
            // Process 0
            { from: 'q1', read: '0', to: 'q1', write: '0', move: MoveHead.right },
            { from: 'q1', read: '1', to: 'q1', write: '1', move: MoveHead.right },
            { from: 'q1', read: '_', to: 'q3', write: '0', move: MoveHead.right },
            // Process 1
            { from: 'q2', read: '0', to: 'q2', write: '0', move: MoveHead.right },
            { from: 'q2', read: '1', to: 'q2', write: '1', move: MoveHead.right },
            { from: 'q2', read: '_', to: 'q3', write: '1', move: MoveHead.right },
            // Final state
            { from: 'q3', read: '0', to: 'q3', write: '0', move: MoveHead.right },
            { from: 'q3', read: '1', to: 'q3', write: '1', move: MoveHead.right }
        ],
        startState: 'q0',
        acceptStates: ['q3']
    };

    // Create state diagram visualization
    var nodes = exampleTM.states.map(function(state) {
        return { label: state };
    });

    var links = exampleTM.transitions.map(function(t) {
        return {
            source: nodes.find(n => n.label === t.from),
            target: nodes.find(n => n.label === t.to),
            label: t.read + '/' + t.write + ',' + t.move
        };
    });

    var stateViz = new StateViz(stateDiagram, nodes, links);

    // Create Turing machine instance
    function createTransitionFunction() {
        return function(state, symbol) {
            var transition = exampleTM.transitions.find(function(t) {
                return t.from === state && t.read === symbol;
            });
            if (!transition) return null;
            return {
                state: transition.to,
                symbol: transition.write,
                move: transition.move
            };
        };
    }

    var tm = new TuringMachine(createTransitionFunction(), exampleTM.startState, tape);
    var running = false;
    var runInterval = null;

    // Button event handlers
    document.getElementById('step-btn').addEventListener('click', function() {
        if (!tm.isHalted && !running) {
            tm.step();
            updateVisualization();
        }
    });

    document.getElementById('run-btn').addEventListener('click', function() {
        if (!tm.isHalted && !running) {
            running = true;
            this.textContent = 'Stop';
            runInterval = setInterval(function() {
                if (tm.isHalted) {
                    stopRunning();
                } else {
                    tm.step();
                    updateVisualization();
                }
            }, 500);
        } else {
            stopRunning();
        }
    });

    function stopRunning() {
        running = false;
        clearInterval(runInterval);
        document.getElementById('run-btn').textContent = 'Run';
    }

    document.getElementById('reset-btn').addEventListener('click', function() {
        stopRunning();
        tm = new TuringMachine(createTransitionFunction(), exampleTM.startState, new TapeViz(tapeContainer, 10, '_', ''));
        updateVisualization();
    });

    document.getElementById('load-input-btn').addEventListener('click', function() {
        stopRunning();
        var input = document.getElementById('input-string').value;
        if (!/^[01]*$/.test(input)) {
            alert('Please enter a binary string (only 0s and 1s)');
            return;
        }
        tm = new TuringMachine(createTransitionFunction(), exampleTM.startState, new TapeViz(tapeContainer, 10, '_', input));
        updateVisualization();
    });

    document.getElementById('load-example-btn').addEventListener('click', function() {
        document.getElementById('input-string').value = '101';
        document.getElementById('load-input-btn').click();
    });

    // Update visualization
    function updateVisualization() {
        // Update state diagram
        stateViz.node.selectAll('circle')
            .classed('active', function(d) { return d.label === tm.state; });

        // Update tape
        tapeContainer.selectAll('.tape-cell')
            .classed('active', function(d, i) { return i === 10; });

        // Update button states
        document.getElementById('step-btn').disabled = tm.isHalted || running;
        document.getElementById('run-btn').disabled = tm.isHalted;
    }

    // Initial visualization update
    updateVisualization();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initTuringMachine); 