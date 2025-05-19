(() => {
    'use strict';

    const CONFIG = {
        spacing: 2.2,
        blockSize: 0.8,
        textOffset: 1.5,  // Increased vertical offset
        baseHeight: 0.5,
        textScale: 0.8,
        line: { color: '#FFF', height: 0.1, depth: 0.1 }
    };

    const TIMELINE_DATA = [
        {
            year: '1843',
            title: 'Ada Lovelace',
            description: 'First Computer Program',
            color: '#FF6B6B',
            link: '/ada-lovelace'
        },
        {
            year: '1936',
            title: 'Alan Turing',
            description: 'Turing Machine',
            color: '#4ECDC4',
            link: '/alan-turing'
        },
        {
            year: '1952',
            title: 'Grace Hopper',
            description: 'First Compiler',
            color: '#45B7D1',
            link: '/grace-hopper'
        }
    ];

    const elements = {
        status: {
            browser: document.getElementById('browser-info'),
            camera: document.getElementById('camera-status'),
            marker: document.getElementById('marker-status')
        },
        scene: document.querySelector('a-scene'),
        marker: document.getElementById('marker'),
        container: document.getElementById('timeline-container')
    };

    async function initializeAR() {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                showFallback('Camera API not supported');
                return;
            }

            updateStatus('camera', 'Accessing camera...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            setupMarkerHandlers();
            setupPerformance();
            buildTimeline();

        } catch (error) {
            showFallback(`Camera error: ${error.message}`);
        }
    }

    function buildTimeline() {
        if (!elements.container) return;
        elements.container.innerHTML = '';

        TIMELINE_DATA.forEach((event, index) => {
            const position = calculatePosition(index);
            createBlock(event, position);
            createConnector(index, position);
            createTextLabel(event, position);
        });
    }

    function calculatePosition(index) {
        const startX = -(TIMELINE_DATA.length - 1) * CONFIG.spacing / 2;
        return {
            x: startX + index * CONFIG.spacing,
            y: CONFIG.baseHeight,
            z: 0
        };
    }

    function createBlock(event, position) {
        const block = document.createElement('a-box');
        block.setAttribute('position', position);
        block.setAttribute('width', CONFIG.blockSize);
        block.setAttribute('height', CONFIG.blockSize);
        block.setAttribute('depth', CONFIG.blockSize);
        block.setAttribute('color', event.color);
        block.setAttribute('class', 'timeline-block');
        block.addEventListener('click', () => navigateTo(event.link));
        elements.container.appendChild(block);
    }

    function createConnector(index, position) {
        if (index === 0) return;
        
        const prevPos = calculatePosition(index - 1);
        const line = document.createElement('a-box');
        line.setAttribute('position', {
            x: (prevPos.x + position.x) / 2,
            y: position.y,
            z: position.z
        });
        line.setAttribute('width', CONFIG.spacing - CONFIG.blockSize);
        line.setAttribute('height', CONFIG.line.height);
        line.setAttribute('depth', CONFIG.line.depth);
        line.setAttribute('color', CONFIG.line.color);
        elements.container.appendChild(line);
    }

    function createTextLabel(event, position) {
        const text = document.createElement('a-entity');
        text.setAttribute('position', {
            x: position.x,
            y: position.y + CONFIG.textOffset,
            z: position.z - 0.5  // Bring text in front of blocks
        });
        text.setAttribute('look-at', '[camera]');
        text.setAttribute('text', {
            value: `${event.year}\n${event.title}\n${event.description}`,
            align: 'center',
            color: '#FFF',
            width: 4,
            wrapCount: 20
        });
        text.setAttribute('geometry', 'primitive: plane; width: auto; height: auto');
        text.setAttribute('material', 'color: #000; opacity: 0.7; transparent: true');
        text.setAttribute('scale', CONFIG.textScale);
        elements.container.appendChild(text);
    }

    function setupMarkerHandlers() {
        if (!elements.marker) return;

        elements.marker.addEventListener('markerFound', () => {
            updateStatus('marker', 'Marker detected');
            elements.container.setAttribute('visible', 'true');
        });

        elements.marker.addEventListener('markerLost', () => {
            updateStatus('marker', 'Searching for marker...');
            elements.container.setAttribute('visible', 'false');
        });
    }

    function setupPerformance() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            elements.scene.setAttribute('renderer', 'antialias: false; precision: low');
            CONFIG.textScale = 0.6;  // Smaller text on mobile
        }
    }

    function updateStatus(type, message, isError = false) {
        if (elements.status[type]) {
            elements.status[type].textContent = message;
            elements.status[type].style.color = isError ? '#FF6B6B' : '#FFF';
        }
    }

    function showFallback(reason) {
        document.getElementById('fallback').classList.add('visible');
        document.getElementById('fallback-reason').textContent = reason;
    }

    function navigateTo(url) {
        window.location.href = url;
    }

    document.addEventListener('DOMContentLoaded', () => {
        initializeAR();
        document.getElementById('enter-site').addEventListener('click', () => {
            window.location.href = '/';
        });
    });
})();