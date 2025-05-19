// app.js – Computer Science Timeline AR Experience
(() => {
    'use strict';
  
    /* ---------------------------- Config ---------------------------- */
    const timelineEvents = [
        {
            year: '1843',
            title: 'Ada Lovelace',
            description: 'First Computer Program',
            color: '#FF6B6B',
            link: '/puzzles/ada-lovelace.html'
        },
        {
            year: '1936',
            title: 'Alan Turing',
            description: 'Turing Machine',
            color: '#4ECDC4',
            link: '/puzzles/alan-turing.html'
        },
        {
            year: '1952',
            title: 'Grace Hopper',
            description: 'First Compiler',
            color: '#45B7D1',
            link: '/puzzles/grace-hopper.html'
        }
    ];
  
    const timelineConfig = {
        spacing: 2.2,
        blockSize: 0.8,
        textOffset: 1.2,
        baseHeight: 0.5,  // Increased for better visibility
        line: {
            color: '#FFFFFF',
            height: 0.1,
            depth: 0.1
        }
    };
  
    /* ------------------------- Cached Elements ---------------------- */
    const markerEl = document.getElementById('marker');
    const enterBtn = document.getElementById('enter-site');
    const fallbackWrap = document.getElementById('fallback');
    const fallbackMsg = document.getElementById('fallback-reason');
    const scene = document.querySelector('a-scene');
  
    /* ------------------------ Support Check ------------------------- */
    async function checkDeviceSupport() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('browser-info', 'Camera API not supported on this device.', true);
        return false;
      }

      try {
        updateStatus('camera-status', 'Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        stream.getTracks().forEach(t => t.stop());
        updateStatus('camera-status', 'Camera access granted!');
        return true;
      } catch (err) {
        updateStatus('browser-info', `Unable to access the camera: ${err.message}`, true);
        return false;
      }
    }
  
    function showFallback(reason) {
      document.body.classList.add('fallback');
      fallbackMsg.textContent = reason;
      fallbackWrap.classList.remove('hidden');
      updateStatus('browser-info', reason, true);
    }

    function updateStatus(elementId, message, isError = false) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = message;
        element.style.color = isError ? '#FF6B6B' : '#FFFFFF';
      }
    }

    /* -------------------------- Timeline ---------------------------- */
    function rebuildTimeline() {
        console.log('Rebuilding timeline...');
        const container = document.getElementById('timeline-container');
        if (!container) {
            console.error('Timeline container not found!');
            return;
        }

        // Clear existing content
        container.innerHTML = '';
        
        // Create timeline elements
        timelineEvents.forEach((event, index) => {
            const position = calculatePosition(index);
            console.log(`Creating element at position:`, position);
            
            // Create block
            const block = createBlock(event, position);
            container.appendChild(block);

            // Create connector (except for first element)
            if (index > 0) {
                const line = createConnector(index, position);
                container.appendChild(line);
            }

            // Create text
            const text = createText(event, position);
            container.appendChild(text);
        });

        console.log('Timeline rebuilt successfully');
    }

    function calculatePosition(index) {
        const startX = -(timelineEvents.length - 1) * timelineConfig.spacing / 2;
        return {
            x: startX + index * timelineConfig.spacing,
            y: timelineConfig.baseHeight,
            z: -1 // Move timeline slightly in front of marker
        };
    }

    function createBlock(event, position) {
        const block = document.createElement('a-box');
        block.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
        block.setAttribute('width', timelineConfig.blockSize);
        block.setAttribute('height', timelineConfig.blockSize);
        block.setAttribute('depth', timelineConfig.blockSize);
        block.setAttribute('color', event.color);
        block.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 15000');
        block.setAttribute('class', 'clickable');
        block.addEventListener('click', () => window.location = event.link);
        return block;
    }

    function createConnector(index, position) {
        const prevPosition = calculatePosition(index - 1);
        const lineLength = timelineConfig.spacing - timelineConfig.blockSize;
        const centerX = (prevPosition.x + position.x) / 2;
        
        const line = document.createElement('a-box');
        line.setAttribute('position', `${centerX} ${position.y} ${position.z}`);
        line.setAttribute('width', lineLength);
        line.setAttribute('height', timelineConfig.line.height);
        line.setAttribute('depth', timelineConfig.line.depth);
        line.setAttribute('color', timelineConfig.line.color);
        return line;
    }

    function createText(event, position) {
        const text = document.createElement('a-text');
        text.setAttribute('value', `${event.year}\\n${event.title}\\n${event.description}`);
        text.setAttribute('position', `${position.x} ${position.y + timelineConfig.textOffset} ${position.z}`);
        text.setAttribute('align', 'center');
        text.setAttribute('color', '#FFF');
        text.setAttribute('scale', '0.5 0.5 0.5');
        text.setAttribute('look-at', '[camera]');
        return text;
    }

    /* --------------------- Orientation Handling --------------------- */
    let currentBeta = 0;
    let currentGamma = 0;

    function updateOrientation(event) {
        if (event.beta !== undefined) currentBeta = event.beta;
        if (event.gamma !== undefined) currentGamma = event.gamma;

        const container = document.getElementById('timeline-container');
        if (!container) return;

        const isPortrait = window.matchMedia('(orientation: portrait)').matches;
        let rotationX = 0, rotationY = 0, rotationZ = 0;

        if (isPortrait) {
            rotationX = -currentBeta;
            rotationY = currentGamma;
        } else {
            rotationX = -currentGamma;
            rotationY = currentBeta;
        }

        container.setAttribute('rotation', `${rotationX} ${rotationY} ${rotationZ}`);
    }

    function initOrientationHandling() {
        window.addEventListener('deviceorientation', updateOrientation);
        window.addEventListener('resize', () => {
            updateOrientation({ beta: currentBeta, gamma: currentGamma });
        });
    }
  
    /* -------------------- UI & Navigation Hooks -------------------- */
    function initUI() {
      if (enterBtn) {
        enterBtn.addEventListener('click', () => {
          window.location.href = '/';
        });
      }
    }
  
    /* -------------------- Performance Tweaks -------------------- */
    function applyMobileOptimizations() {
        if (!scene) return;
        
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            scene.setAttribute('renderer', 'antialias: false; precision: low');
        }
    }

    /* -------------------- Test Scene -------------------- */
    function loadTestModel() {
        const model = document.createElement('a-entity');
        model.setAttribute('gltf-model', 'models/toothbrush.glb');
        model.setAttribute('scale', '0.5 0.5 0.5');
        model.setAttribute('position', '0 0 0');
        model.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 30000');
        document.querySelector('a-scene').appendChild(model);
    }

    async function initTestScene() {
        if (!await checkDeviceSupport()) return;
        loadTestModel();
        updateStatus('browser-info', 'Test model loaded - Scan Hiro marker');
    }

    /* ---------------------------- Config ---------------------------- */
    const timelineConfig = {
        spacing: 2.2,
        blockSize: 0.8,
        textOffset: 1.2,
        baseHeight: 0.5,  // Increased for better visibility
        line: {
            color: '#FFFFFF',
            height: 0.1,
            depth: 0.1
        }
    };

    /* ---------------------- Timeline Management -------------------- */
    function clearTimeline() {
        const container = document.getElementById('timeline-container');
        if (!container) return;
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    function calculateLayoutPositions(itemCount) {
        return Array.from({ length: itemCount }, (_, i) => {
            return -((itemCount - 1) * timelineConfig.spacing) / 2 + i * timelineConfig.spacing;
        });
    }

    function updateTimeline() {
        clearTimeline();
        const positions = calculateLayoutPositions(timelineEvents.length);
        
        timelineEvents.forEach((event, index) => {
            createTimelineBlock(event, {
                x: positions[index],
                y: timelineConfig.baseHeight,
                z: 0
            });
        });
    }

    /* --------------------------- Boot ------------------------------ */
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('Initializing AR experience...');
        updateStatus('browser-info', 'Initializing AR experience...');
        
        initUI();
        applyMobileOptimizations();

        if (!await checkDeviceSupport()) return;

        if (scene && scene.systems.arjs) {
            scene.systems.arjs.debug = false;
        }

        initMarkerEvents();
        initOrientationHandling();
        
        // Initial timeline build
        rebuildTimeline();
    });
})();
  