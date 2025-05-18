// app.js – rewritten with modular timeline, click navigation, and robust fallback
(() => {
    'use strict';
  
    /* ---------------------------- Config ---------------------------- */
    // Timeline data – replace / add events or colors as you like
    const timelineData = [
      { year: '1936', title: 'Turing Machine', color: '#FFC65D', link: '/puzzles/turing.html' },
      { year: '1956', title: 'Dartmouth Workshop', color: '#7BC8A4', link: '/puzzles/dartmouth.html' },
      { year: '1969', title: 'ARPANET', color: '#4CC3D9', link: '/puzzles/arpanet.html' },
      { year: '1997', title: 'Deep Blue vs Kasparov', color: '#FF6B6B', link: '/puzzles/deepblue.html' },
      { year: '2012', title: 'AlexNet Breakthrough', color: '#A27CE6', link: '/puzzles/alexnet.html' }
    ];
  
    /* ------------------------- Cached Elements ---------------------- */
    const markerEl       = document.getElementById('marker');     // <a-marker>
    const timelineParent = document.getElementById('timeline');   // <a-entity>
    const enterBtn       = document.getElementById('enter-site'); // bottom button
    const fallbackWrap   = document.getElementById('fallback');   // fallback overlay
    const fallbackMsg    = document.getElementById('fallback-reason');
    const statusContainer = document.getElementById('status-messages');
  
    /* ------------------------ Support Check ------------------------- */
    async function checkDeviceSupport() {
      // Check for iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS && !isSafari) {
        showFallback('Please use Safari on iOS for the best AR experience');
        return false;
      }

      // Check for WebXR support
      if (!navigator.xr) {
        console.warn('WebXR not supported, falling back to AR.js');
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
            width: { ideal: 1280 },
            height: { ideal: 960 }
          } 
        });
        testStream.getTracks().forEach(t => t.stop()); // close test stream
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
    function createTimelineBlock(data, idx) {
      const offset = idx * 1.2; // spacing along X
  
      // Box (could be replaced with <a-gltf-model> later)
      const box = document.createElement('a-box');
      box.setAttribute('position', `${offset} 0.35 0`);
      box.setAttribute('depth', 0.3);
      box.setAttribute('height', 0.7);
      box.setAttribute('width', 1.1);
      box.setAttribute('color', data.color);
      box.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear');
      box.setAttribute('cursor', 'rayOrigin: mouse');
      box.dataset.link = data.link;
  
      // Text label (faces camera)
      const label = document.createElement('a-text');
      label.setAttribute('value', `${data.year}\n${data.title}`);
      label.setAttribute('align', 'center');
      label.setAttribute('color', '#FFFFFF');
      label.setAttribute('position', `${offset} 1.15 0`);
      label.setAttribute('scale', '0.45 0.45 0.45');
      label.setAttribute('look-at', '[camera]');
      label.setAttribute('cursor', 'rayOrigin: mouse');
      label.dataset.link = data.link;
  
      // Click listener for both box & label
      [box, label].forEach(el => {
        el.classList.add('linkable');
        el.addEventListener('click', e => {
          const target = e.currentTarget.dataset.link;
          if (target) {
            updateStatus('marker-status', 'Navigating to puzzle...');
            window.location.href = target;
          }
        });
      });
  
      timelineParent.appendChild(box);
      timelineParent.appendChild(label);
    }
  
    function buildTimeline() {
      timelineData.forEach(createTimelineBlock);
    }
  
    /* --------------------- Marker‑specific Events ------------------- */
    function initMarkerEvents() {
      markerEl.addEventListener('markerFound', () => {
        updateStatus('marker-status', 'Marker detected!');
        console.log('Marker found ✔');
      });
      
      markerEl.addEventListener('markerLost', () => {
        updateStatus('marker-status', 'Looking for marker...');
        console.log('Marker lost ✖');
      });
    }
  
    /* -------------------- UI & Navigation Hooks -------------------- */
    function initUI() {
      enterBtn.addEventListener('click', () => {
        window.location.href = '/';
      });

      // Add touch feedback
      document.querySelectorAll('.linkable').forEach(el => {
        el.addEventListener('touchstart', () => {
          el.setAttribute('scale', '1.1 1.1 1.1');
        });
        el.addEventListener('touchend', () => {
          el.setAttribute('scale', '1 1 1');
        });
      });
    }
  
    /* ----------------- Optional Compass / Arrow -------------------- */
    function addCompassArrow() {
      const arrow = document.createElement('a-gltf-model');
      arrow.setAttribute('src', '#arrowModel');
      arrow.setAttribute('scale', '0.3 0.3 0.3');
      arrow.setAttribute('position', '0 0.4 -1');
      arrow.setAttribute('look-at', '[camera]');
      arrow.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000; easing: linear');
      document.querySelector('a-scene').appendChild(arrow);
    }
  
    /* --------------------------- Boot ------------------------------ */
    document.addEventListener('DOMContentLoaded', async () => {
      updateStatus('browser-info', 'Initializing AR experience...');
      initUI();
  
      if (!await checkDeviceSupport()) return; // stop if unsupported
  
      buildTimeline();
      initMarkerEvents();
  
      // Uncomment once you have an arrow GLB referenced as #arrowModel
      // addCompassArrow();
    });
})();
  