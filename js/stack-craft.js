class StackCraft {
    constructor() {
        this.currentLevel = 1;
        this.levels = [];
        this.gameState = {
            moves: 0,
            stacks: [],
            availableItems: [],
            isFirstTime: true,
            score: 0,
            timeRemaining: 0,
            timer: null,
            powerups: [],
            combo: 0,
            lastMove: null,
            undoStack: [],
            hints: 3
        };
        this.initializeElements();
        this.setupEventListeners();
        this.loadLevels();
    }

    initializeElements() {
        this.gameContainer = document.getElementById('game-container');
        this.stacksContainer = document.getElementById('stacks-container');
        this.itemsContainer = document.getElementById('items-container');
        this.levelInfo = document.getElementById('level-info');
        this.moveCounter = document.getElementById('move-counter');
        this.tutorialButton = document.getElementById('tutorial-btn');
        this.submitButton = document.getElementById('submit-btn');
        this.resetButton = document.getElementById('reset-btn');
        this.nextLevelButton = document.getElementById('next-level-btn');
    }

    setupEventListeners() {
        // Tutorial and game controls
        this.tutorialButton.addEventListener('click', () => this.showTutorial());
        this.submitButton.addEventListener('click', () => this.checkSolution());
        this.resetButton.addEventListener('click', () => this.resetLevel());
        this.nextLevelButton.addEventListener('click', () => this.loadNextLevel());

        // Drag and drop setup
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        this.itemsContainer.addEventListener('dragstart', (e) => {
            if (!e.target.classList.contains('item')) return;
            e.dataTransfer.setData('text/plain', e.target.dataset.value);
            e.target.classList.add('dragging');
        });

        this.itemsContainer.addEventListener('dragend', (e) => {
            if (!e.target.classList.contains('item')) return;
            e.target.classList.remove('dragging');
        });

        this.stacksContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const stack = e.target.closest('.stack');
            if (stack) {
                stack.classList.add('drag-over');
            }
        });

        this.stacksContainer.addEventListener('dragleave', (e) => {
            const stack = e.target.closest('.stack');
            if (stack) {
                stack.classList.remove('drag-over');
            }
        });

        this.stacksContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const stack = e.target.closest('.stack');
            if (!stack) return;

            stack.classList.remove('drag-over');
            const value = e.dataTransfer.getData('text/plain');
            this.pushToStack(stack.dataset.stackId, value);
        });
    }

    loadLevels() {
        this.levels = [
            {
                id: 1,
                title: "Basic Stack Operations",
                description: "Learn how stacks work by spelling 'DOG' from 'GOD'",
                input: ["G", "O", "D"],
                targetOutput: ["D", "O", "G"],
                maxOps: 10,
                rules: {
                    allowDrag: true,
                    allowMultiStack: false,
                    maxStackSize: 5
                }
            },
            {
                id: 2,
                title: "Optimization Challenge",
                description: "Spell 'BOOK' using only 5 operations",
                input: ["O", "K", "B", "O"],
                targetOutput: ["B", "O", "O", "K"],
                maxOps: 5,
                rules: {
                    allowDrag: true,
                    allowMultiStack: false,
                    maxStackSize: 4
                }
            },
            {
                id: 3,
                title: "Dual Stack Challenge",
                description: "Use two stacks to create 'HELLO' from 'OLLEH'. Stack 1 must contain vowels, Stack 2 must contain consonants.",
                input: ["O", "L", "L", "E", "H"],
                targetOutput: ["H", "E", "L", "L", "O"],
                maxOps: 15,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 5,
                    stackRules: [
                        { type: "vowel", description: "Vowels only" },
                        { type: "consonant", description: "Consonants only" }
                    ]
                }
            },
            {
                id: 4,
                title: "Palindrome Builder",
                description: "Create a palindrome using two stacks. The final word must read the same forwards and backwards.",
                input: ["R", "A", "C", "E", "C", "A", "R"],
                targetOutput: ["R", "A", "C", "E", "C", "A", "R"],
                maxOps: 20,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 7,
                    stackRules: [
                        { type: "mirror", description: "First half" },
                        { type: "mirror", description: "Second half" }
                    ]
                }
            },
            {
                id: 5,
                title: "Memory Challenge",
                description: "Remember and reconstruct a sequence using two stacks. Stack 1 for input, Stack 2 for output.",
                input: ["A", "B", "C", "D", "E"],
                targetOutput: ["E", "D", "C", "B", "A"],
                maxOps: 25,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 5,
                    stackRules: [
                        { type: "memory", description: "Input stack" },
                        { type: "memory", description: "Output stack" }
                    ]
                }
            },
            {
                id: 6,
                title: "Stack Fusion",
                description: "Merge two stacks to create a new stack with alternating elements. Use the fusion powerup!",
                input: ["A", "B", "C", "1", "2", "3"],
                targetOutput: ["A", "1", "B", "2", "C", "3"],
                maxOps: 20,
                timeLimit: 60,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 6,
                    stackRules: [
                        { type: "letters", description: "Letters only" },
                        { type: "numbers", description: "Numbers only" }
                    ],
                    powerups: ["fusion", "swap", "reverse"]
                }
            },
            {
                id: 7,
                title: "Stack Battle",
                description: "Battle against the AI! Each stack has special abilities. Use powerups to win!",
                input: ["⚔️", "🛡️", "⚡", "💥", "🌟", "🎯"],
                targetOutput: ["⚔️", "🛡️", "⚡", "💥", "🌟", "🎯"],
                maxOps: 25,
                timeLimit: 90,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 6,
                    stackRules: [
                        { type: "attack", description: "Attack stack", ability: "damage" },
                        { type: "defense", description: "Defense stack", ability: "shield" },
                        { type: "special", description: "Special stack", ability: "ultimate" }
                    ],
                    powerups: ["attack", "defend", "special"],
                    hasAI: true
                }
            },
            {
                id: 8,
                title: "Stack Portal",
                description: "Create portals between stacks! Items can teleport between connected stacks.",
                input: ["🔵", "🔴", "🟡", "🟢", "🟣", "⚪"],
                targetOutput: ["🔵", "🔴", "🟡", "🟢", "🟣", "⚪"],
                maxOps: 30,
                timeLimit: 120,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 6,
                    stackRules: [
                        { type: "portal", description: "Portal 1", connectedTo: 1 },
                        { type: "portal", description: "Portal 2", connectedTo: 0 }
                    ],
                    powerups: ["portal", "teleport", "clone"],
                    hasPortals: true
                }
            },
            {
                id: 9,
                title: "Stack Evolution",
                description: "Evolve your stacks! Combine items to create more powerful elements.",
                input: ["🌱", "💧", "🔥", "🌪️", "⚡", "💫"],
                targetOutput: ["🌳", "🌊", "🔥", "🌪️", "⚡", "💫"],
                maxOps: 35,
                timeLimit: 150,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 6,
                    stackRules: [
                        { type: "evolution", description: "Evolution stack", canEvolve: true },
                        { type: "storage", description: "Storage stack" }
                    ],
                    powerups: ["evolve", "combine", "transform"],
                    hasEvolution: true
                }
            },
            {
                id: 10,
                title: "Stack Dimensions",
                description: "Navigate through multiple dimensions! Each stack exists in a different dimension.",
                input: ["1D", "2D", "3D", "4D", "5D", "6D"],
                targetOutput: ["6D", "5D", "4D", "3D", "2D", "1D"],
                maxOps: 40,
                timeLimit: 180,
                rules: {
                    allowDrag: true,
                    allowMultiStack: true,
                    maxStackSize: 6,
                    stackRules: [
                        { type: "dimension", description: "Dimension 1", dimension: 1 },
                        { type: "dimension", description: "Dimension 2", dimension: 2 },
                        { type: "dimension", description: "Dimension 3", dimension: 3 }
                    ],
                    powerups: ["dimension", "merge", "split"],
                    hasDimensions: true
                }
            }
        ];

        this.loadLevel(this.currentLevel);
    }

    loadLevel(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        if (!level) return;

        this.currentLevel = levelId;
        this.gameState = {
            moves: 0,
            stacks: Array(level.rules.allowMultiStack ? (level.rules.stackRules?.length || 2) : 1).fill().map(() => []),
            availableItems: [...level.input],
            isFirstTime: this.gameState.isFirstTime,
            score: this.gameState.score,
            timeRemaining: level.timeLimit || 0,
            timer: null
        };

        this.renderLevel(level);
        if (this.gameState.isFirstTime) {
            this.showTutorial();
            this.gameState.isFirstTime = false;
        }

        if (level.timeLimit) {
            this.startTimer(level.timeLimit);
        }
    }

    renderLevel(level) {
        // Update level info
        this.levelInfo.innerHTML = `
            <h2>Level ${level.id}: ${level.title}</h2>
            <p>${level.description}</p>
            <p>Target: ${level.targetOutput.join('')}</p>
            <p>Moves remaining: ${level.maxOps - this.gameState.moves}</p>
            ${level.rules.stackRules ? `
                <div class="stack-rules">
                    ${level.rules.stackRules.map((rule, index) => 
                        `<p>Stack ${index + 1}: ${rule.description}</p>`
                    ).join('')}
                </div>
            ` : ''}
        `;

        // Render stacks
        this.stacksContainer.innerHTML = '';
        this.gameState.stacks.forEach((stack, index) => {
            const stackElement = document.createElement('div');
            stackElement.className = 'stack';
            stackElement.dataset.stackId = index;
            const rule = level.rules.stackRules?.[index];
            stackElement.innerHTML = `
                <div class="stack-header">
                    <h3>Stack ${index + 1}</h3>
                    ${rule ? `<span class="stack-rule">${rule.description}</span>` : ''}
                </div>
                <div class="stack-items">
                    ${stack.map(item => `<div class="stack-item">${item}</div>`).join('')}
                </div>
                <div class="stack-top"></div>
            `;
            this.stacksContainer.appendChild(stackElement);
        });

        // Render available items
        this.itemsContainer.innerHTML = '';
        this.gameState.availableItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.draggable = true;
            itemElement.dataset.value = item;
            itemElement.textContent = item;
            this.itemsContainer.appendChild(itemElement);
        });

        // Update move counter
        this.moveCounter.textContent = this.gameState.moves;
    }

    startTimer(duration) {
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }

        this.gameState.timeRemaining = duration;
        this.updateTimerDisplay();

        this.gameState.timer = setInterval(() => {
            this.gameState.timeRemaining--;
            this.updateTimerDisplay();

            if (this.gameState.timeRemaining <= 0) {
                clearInterval(this.gameState.timer);
                this.showMessage("Time's up!", 'error');
                this.resetLevel();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.gameState.timeRemaining / 60);
        const seconds = this.gameState.timeRemaining % 60;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    pushToStack(stackId, value) {
        const level = this.levels.find(l => l.id === this.currentLevel);
        if (this.gameState.moves >= level.maxOps) {
            this.showMessage("Maximum moves reached!");
            return;
        }

        const stack = this.gameState.stacks[stackId];
        if (stack.length >= level.rules.maxStackSize) {
            this.showMessage("Stack is full!");
            return;
        }

        // Check for portal connection
        if (this.gameState.portals && 
            (stackId === this.gameState.portals.from || stackId === this.gameState.portals.to)) {
            const targetStack = this.gameState.stacks[this.gameState.portals.to];
            if (targetStack.length < level.rules.maxStackSize) {
                targetStack.push(value);
                this.gameState.availableItems = this.gameState.availableItems.filter(v => v !== value);
                this.gameState.moves++;
                this.renderLevel(level);
                return;
            }
        }

        // Check for evolution
        if (level.rules.hasEvolution && stackId === 0) {
            const evolutionMap = {
                "🌱": "🌳",
                "💧": "🌊"
            };
            value = evolutionMap[value] || value;
        }

        // Save state for undo
        this.saveState();

        // Animate the push
        this.animatePush(stackId, value, () => {
            stack.push(value);
            this.gameState.availableItems = this.gameState.availableItems.filter(v => v !== value);
            this.gameState.moves++;
            this.updateCombo();
            this.renderLevel(level);
        });
    }

    saveState() {
        this.gameState.undoStack.push({
            stacks: JSON.parse(JSON.stringify(this.gameState.stacks)),
            availableItems: [...this.gameState.availableItems],
            moves: this.gameState.moves
        });
    }

    undo() {
        if (this.gameState.undoStack.length === 0) return;
        
        const previousState = this.gameState.undoStack.pop();
        this.gameState.stacks = previousState.stacks;
        this.gameState.availableItems = previousState.availableItems;
        this.gameState.moves = previousState.moves;
        
        this.renderLevel(this.levels.find(l => l.id === this.currentLevel));
    }

    updateCombo() {
        if (this.gameState.lastMove === 'push') {
            this.gameState.combo++;
            if (this.gameState.combo >= 3) {
                this.showMessage(`Combo x${this.gameState.combo}!`, 'success');
            }
        } else {
            this.gameState.combo = 1;
        }
        this.gameState.lastMove = 'push';
    }

    animatePush(stackId, value, callback) {
        const item = document.querySelector(`[data-value="${value}"]`);
        const stack = document.querySelector(`[data-stack-id="${stackId}"]`);
        
        if (!item || !stack) return;

        const itemRect = item.getBoundingClientRect();
        const stackRect = stack.getBoundingClientRect();
        
        const clone = item.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = `${itemRect.top}px`;
        clone.style.left = `${itemRect.left}px`;
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            clone.style.transition = 'all 0.5s ease-out';
            clone.style.top = `${stackRect.top + stackRect.height - 50}px`;
            clone.style.left = `${stackRect.left + stackRect.width/2 - 25}px`;
            clone.style.transform = 'scale(0.8)';
            clone.style.opacity = '0';
        });

        setTimeout(() => {
            clone.remove();
            callback();
        }, 500);
    }

    popFromStack(stackId) {
        const level = this.levels.find(l => l.id === this.currentLevel);
        if (this.gameState.moves >= level.maxOps) {
            this.showMessage("Maximum moves reached!");
            return;
        }

        const stack = this.gameState.stacks[stackId];
        if (stack.length === 0) {
            this.showMessage("Stack is empty!");
            return;
        }

        // Animate the pop
        this.animatePop(stackId, () => {
            const value = stack.pop();
            this.gameState.availableItems.push(value);
            this.gameState.moves++;
            this.renderLevel(level);
        });
    }

    animatePop(stackId, callback) {
        const stack = document.querySelector(`[data-stack-id="${stackId}"]`);
        const topItem = stack.querySelector('.stack-item:last-child');
        
        if (!topItem) return;

        topItem.style.transition = 'all 0.5s ease-out';
        topItem.style.transform = 'translateY(-20px) scale(0.8)';
        topItem.style.opacity = '0';

        setTimeout(() => {
            callback();
        }, 500);
    }

    checkSolution() {
        const level = this.levels.find(l => l.id === this.currentLevel);
        let currentOutput;
        let isValid = true;

        if (level.rules.allowMultiStack) {
            switch (level.id) {
                case 6: // Stack Fusion
                    currentOutput = this.checkStackFusion();
                    break;
                case 7: // Stack Battle
                    currentOutput = this.checkStackBattle();
                    break;
                case 8: // Stack Portal
                    currentOutput = this.checkStackPortal();
                    break;
                case 9: // Stack Evolution
                    currentOutput = this.checkStackEvolution();
                    break;
                case 10: // Stack Dimensions
                    currentOutput = this.checkStackDimensions();
                    break;
                default:
                    currentOutput = [...this.gameState.stacks[0], ...this.gameState.stacks[1]];
            }
        } else {
            currentOutput = [...this.gameState.stacks[0]].reverse();
        }

        if (currentOutput.join('') === level.targetOutput.join('')) {
            const timeBonus = Math.floor(this.gameState.timeRemaining * 10);
            const moveBonus = Math.floor((level.maxOps - this.gameState.moves) * 5);
            const levelScore = 1000 + timeBonus + moveBonus;
            this.gameState.score += levelScore;

            this.showMessage(`Correct! Level completed! Score: ${levelScore}`, 'success');
            this.nextLevelButton.disabled = false;
        } else {
            this.showMessage("Not quite right. Try again!", 'error');
        }
    }

    // Special level solution checkers
    checkStackFusion() {
        const stack1 = this.gameState.stacks[0];
        const stack2 = this.gameState.stacks[1];
        if (stack1.length !== stack2.length) return null;

        const fusedStack = [];
        for (let i = 0; i < stack1.length; i++) {
            fusedStack.push(stack1[i], stack2[i]);
        }

        return fusedStack;
    }

    checkStackBattle() {
        // Implementation needed
        return null;
    }

    checkStackPortal() {
        // Implementation needed
        return null;
    }

    checkStackEvolution() {
        // Implementation needed
        return null;
    }

    checkStackDimensions() {
        // Implementation needed
        return null;
    }

    showMessage(message, type = '') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        this.gameContainer.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 3000);
    }

    showTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'tutorial';
        tutorial.innerHTML = `
            <div class="tutorial-content">
                <h2>How to Play</h2>
                <p>Welcome to StackCraft! Here's how stacks work:</p>
                <ul>
                    <li>Stacks follow LIFO (Last In, First Out) order</li>
                    <li>Drag items to push them onto the stack</li>
                    <li>Click the top item to pop it from the stack</li>
                    <li>Your goal is to arrange the items in the correct order</li>
                </ul>
                <button class="close-tutorial">Got it!</button>
            </div>
        `;
        this.gameContainer.appendChild(tutorial);
        tutorial.querySelector('.close-tutorial').addEventListener('click', () => tutorial.remove());
    }

    resetLevel() {
        this.loadLevel(this.currentLevel);
    }

    loadNextLevel() {
        this.currentLevel++;
        if (this.currentLevel <= this.levels.length) {
            this.loadLevel(this.currentLevel);
        } else {
            this.showMessage("Congratulations! You've completed all levels!", 'success');
        }
    }

    // New methods for unique features
    usePowerup(powerupType) {
        const level = this.levels.find(l => l.id === this.currentLevel);
        if (!level.rules.powerups.includes(powerupType)) return;

        switch (powerupType) {
            case "fusion":
                this.fuseStacks();
                break;
            case "swap":
                this.swapStacks();
                break;
            case "reverse":
                this.reverseStack();
                break;
            case "portal":
                this.createPortal();
                break;
            case "evolve":
                this.evolveItems();
                break;
            case "dimension":
                this.switchDimension();
                break;
        }
    }

    fuseStacks() {
        const stack1 = this.gameState.stacks[0];
        const stack2 = this.gameState.stacks[1];
        if (stack1.length !== stack2.length) return;

        const fusedStack = [];
        for (let i = 0; i < stack1.length; i++) {
            fusedStack.push(stack1[i], stack2[i]);
        }

        this.gameState.stacks[0] = fusedStack;
        this.gameState.stacks[1] = [];
        this.renderLevel(this.levels.find(l => l.id === this.currentLevel));
    }

    createPortal() {
        const level = this.levels.find(l => l.id === this.currentLevel);
        if (!level.rules.hasPortals) return;

        const portal1 = document.querySelector('[data-stack-id="0"]');
        const portal2 = document.querySelector('[data-stack-id="1"]');
        
        portal1.classList.add('portal-active');
        portal2.classList.add('portal-active');

        // Portal connection logic
        this.gameState.portals = {
            from: 0,
            to: 1
        };
    }

    evolveItems() {
        const level = this.levels.find(l => l.id === this.currentLevel);
        if (!level.rules.hasEvolution) return;

        const evolutionMap = {
            "🌱": "🌳",
            "💧": "🌊",
            "🔥": "🔥",
            "🌪️": "🌪️",
            "⚡": "⚡",
            "💫": "💫"
        };

        this.gameState.stacks[0] = this.gameState.stacks[0].map(item => 
            evolutionMap[item] || item
        );

        this.renderLevel(level);
    }

    switchDimension() {
        const level = this.levels.find(l => l.id === this.currentLevel);
        if (!level.rules.hasDimensions) return;

        // Dimension switching logic
        this.gameState.currentDimension = (this.gameState.currentDimension + 1) % 3;
        this.renderLevel(level);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StackCraft();
}); 