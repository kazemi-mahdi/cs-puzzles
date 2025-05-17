class Tape {
    constructor(input = '') {
        this.blank = '_';
        this.cells = new Map();
        this.position = 0;
        
        // Initialize tape with input
        for (let i = 0; i < input.length; i++) {
            this.cells.set(i, input[i]);
        }
    }

    // Read the symbol at the current position
    read() {
        return this.cells.get(this.position) || this.blank;
    }

    // Write a symbol at the current position
    write(symbol) {
        if (symbol === this.blank) {
            this.cells.delete(this.position);
        } else {
            this.cells.set(this.position, symbol);
        }
    }

    // Move the head left or right
    move(direction) {
        if (direction === 'L') {
            this.position--;
        } else if (direction === 'R') {
            this.position++;
        }
    }

    // Get the visible portion of the tape
    getVisibleCells(center = 0, width = 20) {
        const start = center - Math.floor(width / 2);
        const cells = [];
        
        for (let i = start; i < start + width; i++) {
            cells.push(this.cells.get(i) || this.blank);
        }
        
        return cells;
    }

    // Get the current position relative to the visible portion
    getRelativePosition(center = 0, width = 20) {
        return this.position - (center - Math.floor(width / 2));
    }

    // Convert tape to string representation
    toString() {
        const min = Math.min(...this.cells.keys());
        const max = Math.max(...this.cells.keys());
        let result = '';
        
        for (let i = min; i <= max; i++) {
            result += this.cells.get(i) || this.blank;
        }
        
        return result;
    }
} 