class StackPuzzle {
    constructor(config) {
        this.config = config;
        this.stack = [];
        this.moves = 0;
        this.isDragging = false;
        this.draggedElement = null;
        this.initializeElements();
        this.setupEventListeners();
        this.loadPuzzle();
    }

    initializeElements() {
        this.tilesContainer = document.getElementById('tiles-container');
        this.stackElement = document.getElementById('stack');
        this.targetWordElement = document.getElementById('target-word');
        this.moveCounterElement = document.getElementById('move-counter');
        this.statusMessageElement = document.getElementById('status-message');
        this.resetButton = document.getElementById('reset-btn');
        this.nextPuzzleButton = document.getElementById('next-puzzle-btn');
    }

    setupEventListeners() {
        // Drag and drop events for tiles
        this.tilesContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.tilesContainer.addEventListener('dragend', this.handleDragEnd.bind(this));
        this.stackElement.addEventListener('dragover', this.handleDragOver.bind(this));
        this.stackElement.addEventListener('drop', this.handleDrop.bind(this));

        // Click events for stack elements
        this.stackElement.addEventListener('click', this.handleStackClick.bind(this));

        // Button events
        this.resetButton.addEventListener('click', this.resetPuzzle.bind(this));
        this.nextPuzzleButton.addEventListener('click', this.loadNextPuzzle.bind(this));
    }

    loadPuzzle() {
        // Clear existing elements
        this.tilesContainer.innerHTML = '';
        this.stackElement.innerHTML = '';
        this.stack = [];
        this.moves = 0;
        this.updateMoveCounter();

        // Set target word
        this.targetWordElement.textContent = this.config.targetWord;

        // Create tiles
        this.config.letters.forEach(letter => {
            const tile = this.createTile(letter);
            this.tilesContainer.appendChild(tile);
        });

        this.updateStatus('Start by pushing letters into the stack');
    }

    createTile(letter) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = letter;
        tile.draggable = true;
        tile.dataset.letter = letter;
        return tile;
    }

    createStackElement(letter) {
        const element = document.createElement('div');
        element.className = 'stack-element slide-in';
        element.textContent = letter;
        return element;
    }

    handleDragStart(e) {
        if (!e.target.classList.contains('tile')) return;
        
        this.isDragging = true;
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.letter);
    }

    handleDragEnd(e) {
        if (!e.target.classList.contains('tile')) return;
        
        this.isDragging = false;
        this.draggedElement = null;
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e) {
        e.preventDefault();
        if (!this.isDragging) return;

        const letter = this.draggedElement.dataset.letter;
        this.pushToStack(letter);
        this.draggedElement.remove();
    }

    handleStackClick(e) {
        if (!e.target.classList.contains('stack-element')) return;
        if (e.target !== this.stackElement.lastElementChild) return;

        this.popFromStack();
    }

    pushToStack(letter) {
        this.stack.push(letter);
        const element = this.createStackElement(letter);
        this.stackElement.appendChild(element);
        this.moves++;
        this.updateMoveCounter();
        this.checkSolution();
    }

    popFromStack() {
        if (this.stack.length === 0) return;

        const element = this.stackElement.lastElementChild;
        const letter = element.textContent;
        element.classList.add('pop-out');
        
        setTimeout(() => {
            this.stack.pop();
            element.remove();
            
            // Return the letter to the tiles container
            const tile = this.createTile(letter);
            this.tilesContainer.appendChild(tile);
            
            this.moves++;
            this.updateMoveCounter();
            this.checkSolution();
        }, 300);
    }

    checkSolution() {
        // Read the stack from top to bottom (LIFO)
        const currentWord = [...this.stack].reverse().join('');
        const targetWord = this.config.targetWord;

        if (currentWord === targetWord) {
            this.updateStatus(`Correct! You solved the puzzle! Current word: ${currentWord}`, 'success');
            this.nextPuzzleButton.disabled = false;
        } else if (currentWord.length === targetWord.length) {
            this.updateStatus(`Not quite right. Current word: ${currentWord}`, 'error');
        } else {
            this.updateStatus(`Keep going! Current word: ${currentWord || '(empty)'}`);
        }
    }

    updateStatus(message, type = '') {
        this.statusMessageElement.textContent = message;
        this.statusMessageElement.className = type;
    }

    updateMoveCounter() {
        this.moveCounterElement.textContent = this.moves;
    }

    resetPuzzle() {
        this.loadPuzzle();
    }

    loadNextPuzzle() {
        // In a real implementation, this would load the next puzzle from a collection
        this.config = {
            targetWord: 'STACK',
            letters: ['S', 'T', 'A', 'C', 'K'].sort(() => Math.random() - 0.5)
        };
        this.loadPuzzle();
    }
}

// Initialize the puzzle with a sample configuration
const puzzleConfig = {
    targetWord: 'BOOK',
    letters: ['B', 'O', 'O', 'K'].sort(() => Math.random() - 0.5)
};

// Create the puzzle instance when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StackPuzzle(puzzleConfig);
}); 