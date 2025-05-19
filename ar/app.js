(() => {
    'use strict';

    const CONFIG = {
        spacing: 2.2,
        blockSize: 0.8,
        textOffset: 1.5,
        baseHeight: 0.5,
        textScale: 0.8,
        stabilization: 0.8, // Smoothing factor for positions
        line: { color: '#FFF', height: 0.1, depth: 0.1 }
    };

    // Add cursor component to scene
    const SCENE_CONFIG = `
        cursor="rayOrigin: mouse"
        raycaster="objects: .clickable"
    `;

    // Modified initializeAR function
    async function initializeAR() {
        try {
            // Add cursor component to scene
            elements.scene.setAttribute('cursor', 'rayOrigin: mouse');
            elements.scene.setAttribute('raycaster', 'objects: .clickable');

            // Rest of initialization remains the same
            // ...
        } catch (error) {
            showFallback(`Camera error: ${error.message}`);
        }
    }

    // Updated createBlock function with stabilization
    function createBlock(event, position) {
        const block = document.createElement('a-box');
        // Add stabilization animation
        block.setAttribute('animation__pos', {
            property: 'position',
            dur: 300,
            easing: 'easeOutQuad',
            to: `${position.x} ${position.y} ${position.z}`
        });
        
        // Add click/touch handlers
        block.addEventListener('click', () => handleNavigation(event.link));
        block.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleNavigation(event.link);
        });

        // Add physics body for stability
        block.setAttribute('static-body', '');
        block.setAttribute('class', 'clickable');
        // Rest of block setup...
    }

    // New stabilization handler
    let lastPosition = null;
    function stabilizeElements() {
        if (!elements.container) return;
        
        const currentPos = elements.container.getAttribute('position');
        if (!lastPosition) {
            lastPosition = currentPos;
            return;
        }

        // Smooth position updates
        const smoothedPos = {
            x: lastPosition.x * CONFIG.stabilization + currentPos.x * (1 - CONFIG.stabilization),
            y: lastPosition.y * CONFIG.stabilization + currentPos.y * (1 - CONFIG.stabilization),
            z: lastPosition.z * CONFIG.stabilization + currentPos.z * (1 - CONFIG.stabilization)
        };

        elements.container.setAttribute('position', smoothedPos);
        lastPosition = smoothedPos;
        requestAnimationFrame(stabilizeElements);
    }

    // Updated setupMarkerHandlers
    function setupMarkerHandlers() {
        elements.marker.addEventListener('markerFound', () => {
            // Start stabilization loop
            stabilizeElements();
            // Enable interactions
            elements.container.setAttribute('interactive', 'true');
        });
    }

    // New navigation handler
    function handleNavigation(url) {
        window.location.href = url;
    }

    // Rest of the code remains similar with these key changes...
})();