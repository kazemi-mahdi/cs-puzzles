'use strict';

// Palindrome Checker Turing Machine
const PALINDROME_MACHINE = {
    name: 'Palindrome Checker',
    description: 'Checks if a string of a\'s and b\'s is a palindrome',
    states: ['start', 'haveA', 'haveB', 'matchA', 'matchB', 'back', 'accept', 'reject'],
    alphabet: ['a', 'b', ' '],
    transitions: {
        'start': {
            'a': { write: ' ', move: 'R', nextState: 'haveA' },
            'b': { write: ' ', move: 'R', nextState: 'haveB' },
            ' ': { write: ' ', move: 'R', nextState: 'accept' }
        },
        'haveA': {
            'a': { write: 'a', move: 'R', nextState: 'haveA' },
            'b': { write: 'b', move: 'R', nextState: 'haveA' },
            ' ': { write: ' ', move: 'L', nextState: 'matchA' }
        },
        'haveB': {
            'a': { write: 'a', move: 'R', nextState: 'haveB' },
            'b': { write: 'b', move: 'R', nextState: 'haveB' },
            ' ': { write: ' ', move: 'L', nextState: 'matchB' }
        },
        'matchA': {
            'a': { write: ' ', move: 'L', nextState: 'back' },
            'b': { write: 'b', move: 'R', nextState: 'reject' },
            ' ': { write: ' ', move: 'R', nextState: 'accept' }
        },
        'matchB': {
            'a': { write: 'a', move: 'R', nextState: 'reject' },
            'b': { write: ' ', move: 'L', nextState: 'back' },
            ' ': { write: ' ', move: 'R', nextState: 'accept' }
        },
        'back': {
            'a': { write: 'a', move: 'L', nextState: 'back' },
            'b': { write: 'b', move: 'L', nextState: 'back' },
            ' ': { write: ' ', move: 'R', nextState: 'start' }
        },
        'accept': {},
        'reject': {}
    },
    startState: 'start',
    acceptStates: ['accept'],
    testCases: [
        { input: 'abba', description: 'Simple palindrome' },
        { input: 'a', description: 'Single symbol' },
        { input: 'bb', description: 'Two same symbols' },
        { input: 'babab', description: 'Longer palindrome' },
        { input: 'ab', description: 'Non-palindrome' }
    ],
    // Fixed positions for states based on provided coordinates (relative to 800x600 viewBox)
    positions: {
        'start': { x: 400, y: 185 },
        'haveA': { x: 240, y: 185 },
        'haveB': { x: 560, y: 185 },
        'matchA': { x: 240, y: 315 },
        'matchB': { x: 560, y: 315 },
        'back': { x: 400, y: 315 },
        'accept': { x: 400, y: 55 },
        'reject': { x: 400, y: 445 }
    }
};

// Main entry point for the Turing machine visualization
let currentDocument = PALINDROME_MACHINE;
let isRunning = false;
let runInterval = null;
const RUN_SPEED = 1000; // 1 second between steps
let currentTestCaseIndex = 0;
let traceSteps = [];

// Initialize the visualization
function initTuringMachine() {
    // Create SVG containers
    const stateDiagramContainer = d3.select('#state-diagram .card-body');
    const tapeContainer = d3.select('#tape-container .card-body');

    // Initialize state visualization
    // Pass the initial positions to StateViz
    const stateViz = new StateViz(stateDiagramContainer);
    
    // Initialize tape visualization
    const tapeViz = new TapeViz(tapeContainer);

    // Set up event handlers
    setupEventHandlers(stateViz, tapeViz);

    // Initialize visualization with first test case
    loadTestCase(currentTestCaseIndex, stateViz, tapeViz);
}

// Set up event handlers for controls
function setupEventHandlers(stateViz, tapeViz) {
    // Test case navigation
    document.getElementById('prev-case-btn').addEventListener('click', () => {
        if (currentTestCaseIndex > 0) {
            currentTestCaseIndex--;
            loadTestCase(currentTestCaseIndex, stateViz, tapeViz);
        }
    });

    document.getElementById('next-case-btn').addEventListener('click', () => {
        if (currentTestCaseIndex < PALINDROME_MACHINE.testCases.length - 1) {
            currentTestCaseIndex++;
            loadTestCase(currentTestCaseIndex, stateViz, tapeViz);
        }
    });

    // Execution controls
    document.getElementById('step-btn').addEventListener('click', () => {
        if (!isRunning) {
            stepExecution(stateViz, tapeViz);
        }
    });

    document.getElementById('run-btn').addEventListener('click', () => {
        if (isRunning) {
            stopExecution();
        } else {
            startExecution(stateViz, tapeViz);
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        stopExecution();
        loadTestCase(currentTestCaseIndex, stateViz, tapeViz);
    });

    // Trace controls
    document.getElementById('prev-step-btn').addEventListener('click', () => {
        if (traceSteps.length > 0) {
            const prevStep = traceSteps.pop();
            restoreStep(prevStep, stateViz, tapeViz);
        }
    });
}

// Load a test case
function loadTestCase(index, stateViz, tapeViz) {
    const testCase = PALINDROME_MACHINE.testCases[index];
    currentDocument = {
        ...PALINDROME_MACHINE,
        exampleInput: testCase.input
    };
    
    // Clear trace steps
    traceSteps = [];
    
    // Update UI
    document.getElementById('test-case-description').textContent = testCase.description;
    document.getElementById('test-case-input').textContent = currentDocument.exampleInput; // Display initial input
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = '';
    
    // Update visualization
    updateVisualization(stateViz, tapeViz);
}

// Update the visualization with current document state
function updateVisualization(stateViz, tapeViz, activeTransition = null) {
    if (!currentDocument) return;

    // Update state diagram with active transition
    stateViz.update(
        currentDocument.states,
        currentDocument.transitions,
        currentDocument.startState,
        currentDocument.acceptStates,
        currentDocument.positions,
        activeTransition
    );

    // Update tape with current head position
    const tape = new Tape(currentDocument.exampleInput);
    tapeViz.update(currentDocument.exampleInput, tape.headPosition);
}

// Execute one step of the Turing machine
function stepExecution(stateViz, tapeViz) {
    if (!currentDocument) return;

    // Create a new Tape instance for the current step based on the current input
    const tape = new Tape(currentDocument.exampleInput);
    const machine = new TuringMachine(
        currentDocument.states,
        currentDocument.alphabet,
        currentDocument.transitions,
        currentDocument.startState,
        currentDocument.acceptStates
    );

    // Set the machine's current state to the current document's state before stepping
    machine.currentState = currentDocument.startState;

    // Save current state for tracing BEFORE the step
    traceSteps.push({
        tape: tape.toString(),
        state: machine.currentState
    });

    // Get the current symbol and transition before stepping
    const currentSymbol = tape.read();
    const currentTransition = currentDocument.transitions[machine.currentState][currentSymbol];

    const result = machine.step(tape);
    
    if (result) {
        // Update current document state based on the step result
        currentDocument.exampleInput = tape.toString();
        currentDocument.startState = machine.currentState;
        
        // Update visualization with active transition
        updateVisualization(stateViz, tapeViz, {
            fromState: machine.currentState,
            symbol: currentSymbol,
            write: currentTransition.write,
            move: currentTransition.move,
            nextState: currentTransition.nextState
        });
    } else {
        // Machine has halted
        const isAccepted = machine.isAccepting();
        document.getElementById('result').textContent = 
            isAccepted ? 'Accepted: Input is a palindrome' : 'Rejected: Input is not a palindrome';
        document.getElementById('result').className = isAccepted ? 'accepted' : 'rejected';
        stopExecution();
    }
}

// Restore a previous step
function restoreStep(step, stateViz, tapeViz) {
    currentDocument.exampleInput = step.tape;
    currentDocument.startState = step.state; // Restore the state
    updateVisualization(stateViz, tapeViz);
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = '';
}

// Start continuous execution
function startExecution(stateViz, tapeViz) {
    if (!currentDocument) return;

    isRunning = true;
    document.getElementById('run-btn').textContent = 'Stop';
    document.getElementById('step-btn').disabled = true;

    // Execute the first step immediately, then set interval
    stepExecution(stateViz, tapeViz);

    runInterval = setInterval(() => {
        if (!isRunning || !currentDocument) {
            stopExecution();
            return;
        }
        stepExecution(stateViz, tapeViz);
    }, RUN_SPEED);
}

// Stop continuous execution
function stopExecution() {
    isRunning = false;
    document.getElementById('run-btn').textContent = 'Run';
    document.getElementById('step-btn').disabled = false;
    clearInterval(runInterval);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initTuringMachine); 