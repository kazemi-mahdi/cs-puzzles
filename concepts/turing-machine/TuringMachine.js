'use strict';
/**
 * Construct a Turing machine.
 * @param {(state, symbol) -> ?{state: state, symbol: symbol, move: direction}}
 *   transition
 *   A transition function that, given *only* the current state and symbol,
 *   returns an object with the following properties: symbol, move, and state.
 *   Returning null/undefined halts the machine (no transition defined).
 * @param {state} startState  The state to start in.
 * @param         tape        The tape to use.
 */

// Constants for tape movement
const MoveHead = Object.freeze({
    left: 'L',
    right: 'R'
});

class TuringMachine {
    constructor(states, alphabet, transitions, startState, acceptStates) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        this.currentState = startState;
        this.acceptStates = acceptStates;
        this.isHalted = false;
    }

    step(tape) {
        if (this.isHalted) return false;

        const currentSymbol = tape.read();
        const transition = this.transitions[this.currentState]?.[currentSymbol];

        if (!transition) {
            this.isHalted = true;
            return false;
        }

        // Execute transition
        tape.write(transition.write);
        tape.move(transition.move);
        this.currentState = transition.nextState;

        return true;
    }

    isAccepting() {
        return this.isHalted && this.acceptStates.includes(this.currentState);
    }

    reset() {
        this.currentState = this.startState;
        this.isHalted = false;
    }

    toString() {
        return `${this.currentState}\n${this.tape}`;
    }
}

/**
 * Step to the next configuration according to the transition function.
 * @return {boolean} true if successful (the transition is defined),
 *   false otherwise (machine halted)
 */
TuringMachine.prototype.step = function () {
  var instruct = this.nextInstruction;
  if (instruct == null) { return false; }

  this.tape.write(instruct.symbol);
  move(this.tape, instruct.move);
  this.state = instruct.state;

  return true;
};

Object.defineProperties(TuringMachine.prototype, {
  nextInstruction: {
    get: function () { return this.transition(this.state, this.tape.read()); },
    enumerable: true
  },
  isHalted: {
    get: function () { return this.nextInstruction == null; },
    enumerable: true
  }
});

// Allows for both notational conventions of moving the head or moving the tape
function move(tape, direction) {
  switch (direction) {
    case MoveHead.right: tape.headRight(); break;
    case MoveHead.left:  tape.headLeft();  break;
    default: throw new TypeError('not a valid tape movement: ' + String(direction));
  }
}

var MoveTape = Object.freeze({left: MoveHead.right, right: MoveHead.left});

// Export for use in other modules
window.TuringMachine = TuringMachine;
window.MoveHead = MoveHead;
window.MoveTape = MoveTape; 