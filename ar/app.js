// Timeline events data
const timelineEvents = [
    {
        title: "Ada Lovelace",
        year: "1843",
        description: "First Computer Program",
        link: "/puzzles/ada-lovelace.html",
        color: "#FF6B6B"
    },
    {
        title: "Alan Turing",
        year: "1936",
        description: "Turing Machine",
        link: "/puzzles/alan-turing.html",
        color: "#4ECDC4"
    },
    {
        title: "Grace Hopper",
        year: "1952",
        description: "First Compiler",
        link: "/puzzles/grace-hopper.html",
        color: "#45B7D1"
    },
    {
        title: "Tim Berners-Lee",
        year: "1989",
        description: "World Wide Web",
        link: "/puzzles/tim-berners-lee.html",
        color: "#96CEB4"
    },
    {
        title: "Quantum Computing",
        year: "2019",
        description: "Quantum Supremacy",
        link: "/puzzles/quantum-computing.html",
        color: "#FFEEAD"
    }
];

// Update status message
function updateStatus(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? '#FF6B6B' : element.style.color;
    }
}

// Check for AR support with detailed logging
async function checkARSupport() {
    updateStatus('browser-info', 'Checking browser support...');
    
    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS) {
        if (!isSafari) {
            const message = 'Please use Safari on iOS for the best AR experience';
            updateStatus('browser-info', message, true);
            document.getElementById('fallback-reason').textContent = message;
            document.body.classList.add('fallback');
            document.getElementById('fallback').classList.remove('hidden');
            return false;
        }
        updateStatus('browser-info', 'iOS Safari detected - AR should work!');
    }
    
    // Check for WebXR with more detailed feature detection
    if (!navigator.xr) {
        const message = 'WebXR not supported in this browser';
        updateStatus('browser-info', message, true);
        document.getElementById('fallback-reason').textContent = message;
        document.body.classList.add('fallback');
        document.getElementById('fallback').classList.remove('hidden');
        return false;
    }

    // Check for AR features
    try {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!isSupported) {
            const message = 'AR features not supported in this browser';
            updateStatus('browser-info', message, true);
            document.getElementById('fallback-reason').textContent = message;
            document.body.classList.add('fallback');
            document.getElementById('fallback').classList.remove('hidden');
            return false;
        }
    } catch (err) {
        console.warn('Error checking AR support:', err);
        // Continue anyway as some browsers might support AR.js without WebXR
    }
    
    // Check for getUserMedia with more specific requirements
    const hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    if (!hasMediaDevices) {
        const message = 'Camera access not supported in this browser';
        updateStatus('browser-info', message, true);
        document.getElementById('fallback-reason').textContent = message;
        document.body.classList.add('fallback');
        document.getElementById('fallback').classList.remove('hidden');
        return false;
    }
    
    try {
        updateStatus('camera-status', 'Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 960 }
            } 
        });
        
        // Stop the stream immediately as we just needed to check access
        stream.getTracks().forEach(track => track.stop());
        
        updateStatus('camera-status', 'Camera access granted!');
        return true;
    } catch (err) {
        const message = `Camera access error: ${err.message}`;
        updateStatus('camera-status', message, true);
        document.getElementById('fallback-reason').textContent = message;
        document.body.classList.add('fallback');
        document.getElementById('fallback').classList.remove('hidden');
        return false;
    }
}

// Create timeline blocks
function createTimeline() {
    const timeline = document.getElementById('timeline');
    const spacing = 1.5; // Space between blocks
    const startX = -(timelineEvents.length - 1) * spacing / 2;

    timelineEvents.forEach((event, index) => {
        const x = startX + index * spacing;
        
        // Create block
        const block = document.createElement('a-box');
        block.setAttribute('position', `${x} 0 0`);
        block.setAttribute('width', '1');
        block.setAttribute('height', '0.5');
        block.setAttribute('depth', '0.5');
        block.setAttribute('color', event.color);
        block.setAttribute('data-link', event.link);
        block.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 30000');
        block.setAttribute('cursor', 'rayOrigin: mouse');
        
        // Create title text
        const title = document.createElement('a-text');
        title.setAttribute('value', event.title);
        title.setAttribute('position', '0 0.4 0.26');
        title.setAttribute('align', 'center');
        title.setAttribute('scale', '0.5 0.5 0.5');
        block.appendChild(title);
        
        // Create year text
        const year = document.createElement('a-text');
        year.setAttribute('value', event.year);
        year.setAttribute('position', '0 0.2 0.26');
        year.setAttribute('align', 'center');
        year.setAttribute('scale', '0.4 0.4 0.4');
        block.appendChild(year);
        
        // Create description text
        const desc = document.createElement('a-text');
        desc.setAttribute('value', event.description);
        desc.setAttribute('position', '0 0 0.26');
        desc.setAttribute('align', 'center');
        desc.setAttribute('scale', '0.3 0.3 0.3');
        block.appendChild(desc);
        
        timeline.appendChild(block);
    });
}

// Initialize AR experience
document.addEventListener('DOMContentLoaded', async () => {
    const hasAR = await checkARSupport();
    
    if (hasAR) {
        createTimeline();
        
        // Add marker detection events
        const marker = document.getElementById('marker');
        if (marker) {
            marker.addEventListener('markerFound', () => {
                updateStatus('marker-status', 'Marker detected!');
            });
            
            marker.addEventListener('markerLost', () => {
                updateStatus('marker-status', 'Looking for marker...');
            });
        }
        
        // Add click handlers for timeline blocks
        document.querySelectorAll('[data-link]').forEach(el => {
            el.addEventListener('click', e => {
                window.location.href = e.target.dataset.link;
            });
        });
    }
    
    // Add click handler for fallback message
    document.getElementById('fallback').addEventListener('click', () => {
        window.location.href = '/';
    });
    
    // Add click handler for Enter Site button
    document.getElementById('enter-site').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
}); 