class TapeViz {
    constructor(container) {
        this.container = container;
        this.svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 800 80')
            .attr('preserveAspectRatio', 'xMidYMid meet');

        this.cellSize = 50;
        this.visibleCells = Math.floor(800 / this.cellSize);
        this.tapeGroup = this.svg.append('g')
            .attr('class', 'tape-group')
            .attr('transform', 'translate(0, 10)'); // Add some padding at the top

        // Add tape head indicator
        this.head = this.svg.append('polygon')
            .attr('points', '0,0 10,20 -10,20')
            .attr('fill', '#f44336')
            .attr('stroke', '#b71c1c')
            .attr('stroke-width', 1)
            .attr('class', 'tape-head');
    }

    update(tapeString, headPosition) {
        // Create tape data
        const tapeData = tapeString.split('').map((symbol, index) => ({
            symbol: symbol,
            index: index
        }));

        // Calculate visible range
        const cellsBefore = Math.floor((this.visibleCells - 1) / 2);
        const startIndex = Math.max(0, headPosition - cellsBefore);
        const endIndex = startIndex + this.visibleCells;

        // Create visible tape data
        const visibleTapeData = [];
        for (let i = startIndex; i < endIndex; i++) {
            const cellData = tapeData.find(d => d.index === i);
            visibleTapeData.push({
                symbol: cellData ? cellData.symbol : ' ',
                index: i,
                isHead: i === headPosition
            });
        }

        // Update tape cells
        const cells = this.tapeGroup.selectAll('.tape-cell')
            .data(visibleTapeData, d => d.index);

        // Enter new cells
        const enterCells = cells.enter().append('g')
            .attr('class', 'tape-cell')
            .attr('transform', (d, i) => `translate(${i * this.cellSize}, 0)`);

        enterCells.append('rect')
            .attr('width', this.cellSize)
            .attr('height', this.cellSize)
            .attr('class', 'tape-cell');

        enterCells.append('text')
            .attr('x', this.cellSize / 2)
            .attr('y', this.cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text(d => d.symbol);

        // Update existing cells
        cells.select('rect')
            .attr('class', d => `tape-cell ${d.isHead ? 'current' : ''}`);

        cells.select('text')
            .text(d => d.symbol);

        // Exit old cells
        cells.exit().remove();

        // Update tape head position
        const headX = (headPosition - startIndex) * this.cellSize + this.cellSize / 2;
        this.head.transition()
            .duration(300)
            .attr('transform', `translate(${headX}, ${this.cellSize + 5})`);
    }
} 