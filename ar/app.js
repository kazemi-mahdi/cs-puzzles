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
  
    /* ------------------------- Cached Elements ---------------------- */
    const markerEl = document.getElementById('marker');
    const enterBtn = document.getElementById('enter-site');
    const fallbackWrap = document.getElementById('fallback');
    const fallbackMsg = document.getElementById('fallback-reason');
    const trackingInfo = document.getElementById('tracking-info');
    const markerInfo = document.getElementById('marker-info');
    const cameraInfo = document.getElementById('camera-info');
  
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
    function createTimeline() {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        container.innerHTML = '';
        
        timelineEvents.forEach((event, index) => {
            const position = calculatePosition(index);
            
            // Create timeline block
            const block = createBlock(event, position);
            container.appendChild(block);

            // Create connecting line
            if (index > 0) {
                const line = createConnector(index, position);
                container.appendChild(line);
            }

            // Create text labels
            const text = createText(event, position);
            container.appendChild(text);
        });
    }

    function calculatePosition(index) {
        const startX = -(timelineEvents.length - 1) * timelineConfig.spacing / 2;
        return {
            x: startX + index * timelineConfig.spacing,
            y: 0,
            z: 0
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
        text.setAttribute('value', `${event.year}\n${event.title}\n${event.description}`);
        text.setAttribute('position', `${position.x} ${position.y + timelineConfig.textOffset} ${position.z}`);
        text.setAttribute('align', 'center');
        text.setAttribute('color', '#FFF');
        text.setAttribute('scale', '0.5 0.5 0.5');
        text.setAttribute('look-at', '[camera]');
        return text;
    }

    /* --------------------- Orientation Handling --------------------- */
    function initOrientationHandling() {
        const container = document.getElementById('timeline-container');
        if (!container) {
            console.error('Timeline container not found for orientation handling!');
            return;
        }
        let lastOrientation = null;
        let isPortrait = window.innerHeight > window.innerWidth;

        // Function to update orientation based on device orientation
        function updateOrientation(event) {
            if (!event.beta || !event.gamma) {
                console.log('No orientation data available');
                return;
            }

            const beta = event.beta;  // -180 to 180 (front/back tilt)
            const gamma = event.gamma; // -90 to 90 (left/right tilt)

            console.log(`Device orientation - Beta: ${beta}, Gamma: ${gamma}`);

            // Determine if device is in portrait or landscape
            isPortrait = window.innerHeight > window.innerWidth;

            // Calculate rotation based on device orientation
            let rotationX = 0;
            let rotationY = 0;
            let rotationZ = 0;

            if (isPortrait) {
                // Portrait mode adjustments
                rotationX = -beta; // Tilt forward/backward
                rotationY = gamma; // Tilt left/right
            } else {
                // Landscape mode adjustments
                rotationX = -gamma; // Tilt left/right
                rotationY = beta;   // Tilt forward/backward
            }

            // Apply smooth rotation
            container.setAttribute('rotation', `${rotationX} ${rotationY} ${rotationZ}`);
            console.log(`Applied rotation: ${rotationX}, ${rotationY}, ${rotationZ}`);
            lastOrientation = { beta, gamma };
        }

        // Add device orientation event listener
        window.addEventListener('deviceorientation', updateOrientation);

        // Add window resize listener to handle orientation changes
        window.addEventListener('resize', () => {
            isPortrait = window.innerHeight > window.innerWidth;
            if (lastOrientation) {
                updateOrientation(lastOrientation);
            }
        });
    }
  
    /* ------------------------- GLB Model Loading ---------------------- */
    function loadGLBModel(modelPath) {
        const marker = document.getElementById('marker');
        if (!marker) {
            console.error('Marker element not found!');
            return;
        }

        // Remove any existing model
        const existingModel = marker.querySelector('[gltf-model]');
        if (existingModel) {
            existingModel.remove();
        }

        // Create the GLB model entity
        const model = document.createElement('a-entity');
        model.setAttribute('gltf-model', modelPath);
        model.setAttribute('scale', '0.5 0.5 0.5');
        model.setAttribute('position', '0 0.5 0');
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('animation-mixer', '');

        // Add loading event listeners
        model.addEventListener('model-loaded', () => {
            console.log('Model loaded successfully:', modelPath);
            updateStatus('marker-status', 'Model loaded successfully!');
        });

        model.addEventListener('model-error', (error) => {
            console.error('Error loading model:', error);
            updateStatus('marker-status', 'Error loading model!', true);
        });

        // Add the model to the marker
        marker.appendChild(model);
        console.log(`Attempting to load GLB model from ${modelPath}`);
    }
  
    /* ------------------------- Marker Events ------------------------- */
    function initMarkerEvents() {
        const marker = document.getElementById('marker');
        if (!marker) {
            console.error('Marker element not found!');
            return;
        }

        // Load the GLB model when marker is found
        marker.addEventListener('markerFound', () => {
            updateStatus('marker-status', 'Marker found!');
            // Load the GLB model from the models directory
            loadGLBModel('models/toothbrush.glb');
        });

        marker.addEventListener('markerLost', () => {
            updateStatus('marker-status', 'Marker lost');
        });

        // Update tracking info
        function updateTrackingInfo() {
            const scene = document.querySelector('a-scene');
            if (scene && scene.systems['arjs']) {
                const arSystem = scene.systems['arjs'];
                trackingInfo.textContent = `Tracking: ${arSystem.arProfile.trackingBackend} (${arSystem.arProfile.detectionMode})`;
                console.log('AR.js tracking info updated:', arSystem.arProfile);
            }
        }

        // Initial tracking info update
        updateTrackingInfo();
    }
  
    /* -------------------- UI & Navigation Hooks -------------------- */
    function initUI() {
      enterBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  
    /* -------------------- Performance Tweaks -------------------- */
    function applyMobileOptimizations() {
        const scene = document.querySelector('a-scene');
        if (!scene) return;
        
        // Reduce render quality for mobile
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
        updateStatus('browser-info', 'Initializing AR experience...');
        initUI();
        applyMobileOptimizations();

        if (!await checkDeviceSupport()) return;

        if (document.querySelector('a-scene').systems.arjs) {
            document.querySelector('a-scene').systems.arjs.debug = false;
        }

        // Initialize test scene first
        initTestScene();
        
        // Then initialize the full timeline
        updateTimeline();
        initMarkerEvents();
        initOrientationHandling();
    });
})();
  