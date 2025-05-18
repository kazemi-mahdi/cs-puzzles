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
        },
        {
            year: '1989',
            title: 'Tim Berners-Lee',
            description: 'World Wide Web',
            color: '#96CEB4',
            link: '/puzzles/tim-berners-lee.html'
        },
        {
            year: '2019',
            title: 'Quantum Computing',
            description: 'Quantum Supremacy',
            color: '#FFEEAD',
            link: '/puzzles/quantum-computing.html'
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
      // Check for iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS && !isSafari) {
        showFallback('Please use Safari on iOS for the best AR experience');
        return false;
      }

      // Check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showFallback('Camera API not supported on this device.');
        return false;
      }

      try {
        updateStatus('camera-status', 'Requesting camera access...');
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        // Get camera capabilities
        const videoTrack = testStream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        cameraInfo.textContent = `Camera: ${capabilities.width.max}x${capabilities.height.max}`;
        
        testStream.getTracks().forEach(t => t.stop());
        updateStatus('camera-status', 'Camera access granted!');
        return true;
      } catch (err) {
        showFallback(`Unable to access the camera: ${err.message}`);
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
        element.style.color = isError ? '#FF6B6B' : element.style.color;
      }
    }

    /* -------------------------- Timeline ---------------------------- */
    function createTimelineBlock(data, index) {
        const container = document.getElementById('timeline-container');
        const spacing = 1.5; // Space between blocks
        const startX = -(timelineEvents.length - 1) * spacing / 2;
        const x = startX + index * spacing;

        // Create block
        const block = document.createElement('a-box');
        block.setAttribute('position', `${x} 0.5 0`); // Raised up slightly
        block.setAttribute('width', '1');
        block.setAttribute('height', '0.5');
        block.setAttribute('depth', '0.5');
        block.setAttribute('color', data.color);
        block.setAttribute('data-link', data.link);
        block.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 30000');
        block.setAttribute('cursor', 'rayOrigin: mouse');
        block.classList.add('linkable');
        
        // Create title text
        const title = document.createElement('a-text');
        title.setAttribute('value', data.title);
        title.setAttribute('position', '0 0.4 0.26');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#FFFFFF');
        title.setAttribute('scale', '0.5 0.5 0.5');
        title.setAttribute('look-at', '[camera]');
        block.appendChild(title);
        
        // Create year text
        const year = document.createElement('a-text');
        year.setAttribute('value', data.year);
        year.setAttribute('position', '0 0.2 0.26');
        year.setAttribute('align', 'center');
        year.setAttribute('color', '#FFFFFF');
        year.setAttribute('scale', '0.4 0.4 0.4');
        year.setAttribute('look-at', '[camera]');
        block.appendChild(year);
        
        // Create description text
        const desc = document.createElement('a-text');
        desc.setAttribute('value', data.description);
        desc.setAttribute('position', '0 0 0.26');
        desc.setAttribute('align', 'center');
        desc.setAttribute('color', '#FFFFFF');
        desc.setAttribute('scale', '0.3 0.3 0.3');
        desc.setAttribute('look-at', '[camera]');
        block.appendChild(desc);

        // Add click handler
        block.addEventListener('click', () => {
            window.location.href = data.link;
        });

        container.appendChild(block);
        console.log(`Created block for ${data.title} at position (${x}, 0.5, 0)`);
    }

    function buildTimeline() {
        const container = document.getElementById('timeline-container');
        if (!container) {
            console.error('Timeline container not found!');
            return;
        }
        console.log('Building timeline with', timelineEvents.length, 'events');
        timelineEvents.forEach((event, index) => {
            createTimelineBlock(event, index);
        });
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
  
    /* --------------------- Marker‑specific Events ------------------- */
    function initMarkerEvents() {
        let markerFoundCount = 0;
        let markerLostCount = 0;
        let lastMarkerUpdate = Date.now();

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

        markerEl.addEventListener('markerFound', () => {
            markerFoundCount++;
            const now = Date.now();
            if (now - lastMarkerUpdate > 1000) {
                console.log('Marker found!', { count: markerFoundCount });
                updateStatus('marker-status', `Marker detected! (Found: ${markerFoundCount} times)`);
                markerInfo.textContent = `Marker: Found (${markerFoundCount} times)`;
                lastMarkerUpdate = now;
            }
        });
        
        markerEl.addEventListener('markerLost', () => {
            markerLostCount++;
            const now = Date.now();
            if (now - lastMarkerUpdate > 1000) {
                console.log('Marker lost!', { count: markerLostCount });
                updateStatus('marker-status', `Looking for marker... (Lost: ${markerLostCount} times)`);
                markerInfo.textContent = `Marker: Lost (${markerLostCount} times)`;
                lastMarkerUpdate = now;
            }
        });
    }
  
    /* -------------------- UI & Navigation Hooks -------------------- */
    function initUI() {
      enterBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  
    /* --------------------------- Boot ------------------------------ */
    document.addEventListener('DOMContentLoaded', async () => {
      updateStatus('browser-info', 'Initializing AR experience...');
      initUI();
  
      if (!await checkDeviceSupport()) return;
  
      buildTimeline();
      initMarkerEvents();
      initOrientationHandling(); // Initialize orientation handling
    });
})();
  