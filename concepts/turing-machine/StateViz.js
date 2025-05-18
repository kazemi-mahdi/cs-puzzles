class StateViz {
    constructor(container) {
        this.container = container;
        // No fixed width/height here, let D3 handle responsiveness via viewBox
        
        // Create SVG with viewBox for responsive scaling
        this.svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 800 600') // Default viewBox, can adjust if needed
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create zoom container
        this.zoomContainer = this.svg.append('g')
            .attr('class', 'zoom-container');

        // Define arrow marker
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');

        // Initialize force simulation (will only be used if positions are not provided)
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(400, 300)) // Center within the viewBox
            .force('collision', d3.forceCollide().radius(35))
            .alphaDecay(0.05);

        this.linkElements = null;
        this.nodeElements = null;
    }

    update(states, transitions, currentState, acceptStates, positions, activeTransition = null) {
        // Clear previous visualization
        this.zoomContainer.select('.links').remove();
        this.zoomContainer.select('.nodes').remove();

        // Create nodes data
        const nodesData = states.map(state => ({
            id: state,
            label: state,
            isStart: state === currentState,
            isAccept: acceptStates.includes(state),
            x: positions ? positions[state]?.x : undefined,
            y: positions ? positions[state]?.y : undefined
        }));

        // Create links data
        const linksData = [];
        for (const [from, stateTransitions] of Object.entries(transitions)) {
            for (const [symbol, transition] of Object.entries(stateTransitions)) {
                linksData.push({
                    source: from,
                    target: transition.nextState,
                    label: `${symbol}/${transition.write},${transition.move}`,
                    key: `${from}-${symbol}`,
                    isActive: activeTransition && 
                             activeTransition.fromState === from && 
                             activeTransition.symbol === symbol &&
                             activeTransition.nextState === transition.nextState
                });
            }
        }
        
        // Create link group
        const linkGroup = this.zoomContainer.append('g').attr('class', 'links');

        // Create node group
        const nodeGroup = this.zoomContainer.append('g').attr('class', 'nodes');

        // Create links
        this.linkElements = linkGroup.selectAll('.link')
            .data(linksData)
            .enter()
            .append('path')
            .attr('class', d => `link ${d.isActive ? 'active-link' : ''}`)
            .attr('marker-end', 'url(#arrowhead)');

        // Add link labels
        const linkLabels = linkGroup.selectAll('.link-label')
            .data(linksData)
            .enter()
            .append('text')
            .attr('class', 'link-label')
            .attr('dy', -5)
            .text(d => d.label);

        // Create nodes
        this.nodeElements = nodeGroup.selectAll('.node')
            .data(nodesData)
            .enter()
            .append('g')
            .attr('class', 'node');
            // Add drag behavior later if needed

        // Add node circles
        this.nodeElements.append('circle')
            .attr('r', 20)
            .attr('class', d => {
                let classes = ['node-circle'];
                if (d.id === currentState) classes.push('current');
                if (d.isAccept) classes.push('accept');
                return classes.join(' ');
            });

        // Add node labels
        this.nodeElements.append('text')
            .attr('dy', 4)
            .attr('text-anchor', 'middle')
            .text(d => d.label);

        // Add double circle for accept states
        this.nodeElements.filter(d => d.isAccept)
            .append('circle')
            .attr('r', 15)
            .attr('class', 'accept-circle');

        // Update positions and links
        if (positions) {
            this.simulation.stop();
            this.nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
            
            // Update link paths
            this.linkElements.attr('d', d => {
                const sourceNode = nodesData.find(node => node.id === d.source);
                const targetNode = nodesData.find(node => node.id === d.target);
                if (!sourceNode || !targetNode) return '';

                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                
                // Adjust target position to end before the node circle
                const targetX = targetNode.x - (dx * 20) / dr;
                const targetY = targetNode.y - (dy * 20) / dr;

                return `M${sourceNode.x},${sourceNode.y} 
                        C${sourceNode.x + dx/3},${sourceNode.y} 
                         ${targetNode.x - dx/3},${targetNode.y} 
                         ${targetX},${targetY}`;
            });

            // Update link label positions
            linkLabels.attr('transform', d => {
                const sourceNode = nodesData.find(node => node.id === d.source);
                const targetNode = nodesData.find(node => node.id === d.target);
                if (!sourceNode || !targetNode) return '';

                const x = (sourceNode.x + targetNode.x) / 2;
                const y = (sourceNode.y + targetNode.y) / 2;

                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                return `translate(${x},${y}) rotate(${angle})`;
            });
        } else {
            this.simulation.nodes(nodesData);
            this.simulation.force('link').links(linksData);
            this.simulation.alpha(1).restart();
        }
    }
} 