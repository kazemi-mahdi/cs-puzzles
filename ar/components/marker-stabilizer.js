AFRAME.registerComponent('marker-stabilizer', {
    schema: {
        smooth: { type: 'boolean', default: true },
        smoothCount: { type: 'number', default: 10 },
        smoothTolerance: { type: 'number', default: 0.01 },
        smoothThreshold: { type: 'number', default: 5 },
        // New optimization parameters
        positionThreshold: { type: 'number', default: 0.001 },  // Minimum position change to process
        rotationThreshold: { type: 'number', default: 0.01 },   // Minimum rotation change to process
        skipFrames: { type: 'number', default: 1 }              // Process every Nth frame
    },

    init: function() {
        this.positionStabilizer = new MeanFilterQueue(this.data.smoothCount, this.data.smoothTolerance);
        this.orientationStabilizer = new MeanFilterQueue(this.data.smoothCount, this.data.smoothTolerance);
        this.lastPosition = new THREE.Vector3();
        this.lastRotation = new THREE.Euler();
        this.startTime = null;
        this.stableFor = 0;
        this.frameCount = 0;
        this.isFirstVisible = true;
    },

    tick: function() {
        // Process only every Nth frame for efficiency
        this.frameCount++;
        if (this.frameCount % this.data.skipFrames !== 0) return;
        
        const marker = document.querySelector('#marker');
        if (!marker) return;
        
        if (marker.object3D.visible) {
            if (this.startTime === null || this.isFirstVisible) {
                this.startTime = performance.now();
                this.isFirstVisible = false;
                
                // Initialize last positions on first visibility
                this.lastPosition.copy(marker.object3D.position);
                this.lastRotation.copy(marker.object3D.rotation);
            }

            const position = marker.object3D.position;
            const rotation = marker.object3D.rotation;
            
            // Check if position/rotation changed enough to process
            const posChanged = this.lastPosition.distanceTo(position) > this.data.positionThreshold;
            const rotChanged = Math.abs(this.lastRotation.x - rotation.x) > this.data.rotationThreshold || 
                               Math.abs(this.lastRotation.y - rotation.y) > this.data.rotationThreshold || 
                               Math.abs(this.lastRotation.z - rotation.z) > this.data.rotationThreshold;

            if (this.data.smooth && (posChanged || rotChanged)) {
                // Update last known values
                this.lastPosition.copy(position);
                this.lastRotation.copy(rotation);
                
                const stabilizedPosition = this.positionStabilizer.addSample(position);
                const stabilizedRotation = this.orientationStabilizer.addSample(rotation);
                
                if (stabilizedPosition && stabilizedRotation) {
                    // Use object pooling to avoid garbage collection
                    marker.object3D.position.copy(stabilizedPosition);
                    marker.object3D.rotation.copy(stabilizedRotation);
                    
                    this.stableFor++;
                    if (this.stableFor > this.data.smoothThreshold) {
                        marker.emit('stable', {}, false);
                    }
                }
            }
        } else {
            this.startTime = null;
            this.stableFor = 0;
            this.isFirstVisible = true;
        }
    }
});

// Optimized Mean Filter Implementation
class MeanFilterQueue {
    constructor(maxSize, tolerance) {
        this.queue = [];
        this.maxSize = maxSize || 10;
        this.tolerance = tolerance || 0.01;
        
        // Pre-allocate objects to avoid garbage collection
        this.resultVector = new THREE.Vector3();
        
        // Pre-allocate queue with empty vectors
        for (let i = 0; i < this.maxSize; i++) {
            this.queue.push(new THREE.Vector3());
        }
        
        this.currentIndex = 0;
        this.queueFull = false;
    }

    addSample(sample) {
        // Store the sample in our pre-allocated array
        this.queue[this.currentIndex].copy(sample);
        
        // Update index in circular buffer
        this.currentIndex = (this.currentIndex + 1) % this.maxSize;
        if (this.currentIndex === 0) this.queueFull = true;
        
        // Only stabilize when we have enough samples
        if (!this.queueFull && this.currentIndex < 3) {
            return sample;
        }
        
        // Calculate mean without creating new objects
        return this.calculateMean();
    }

    calculateMean() {
        this.resultVector.set(0, 0, 0);
        
        const count = this.queueFull ? this.maxSize : this.currentIndex;
        
        // Sum all values
        for (let i = 0; i < count; i++) {
            this.resultVector.add(this.queue[i]);
        }
        
        // Divide by number of elements
        this.resultVector.divideScalar(count);
        
        return this.resultVector;
    }
}