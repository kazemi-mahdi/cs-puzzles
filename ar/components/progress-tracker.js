AFRAME.registerComponent('progress-tracker', {
    schema: {
        totalEvents: { type: 'number', default: 0 },
        storageKey: { type: 'string', default: 'cs-timeline-visited' },
        showBadge: { type: 'boolean', default: true },
        badgePosition: { type: 'string', default: 'top-right' }
    },

    init: function() {
        this.updateProgress = this.updateProgress.bind(this);
        this.markVisited = this.markVisited.bind(this);
        this.onMarkerFound = this.onMarkerFound.bind(this);
        this.onMarkerLost = this.onMarkerLost.bind(this);
        
        // Create event listeners
        document.addEventListener('progressUpdate', this.updateProgress);
        document.addEventListener('eventVisited', (event) => {
            if (event.detail && event.detail.eventId) {
                this.markVisited(event.detail.eventId);
            }
        });
        
        // Listen for marker found/lost events
        const marker = document.querySelector('#marker');
        if (marker) {
            marker.addEventListener('markerFound', this.onMarkerFound);
            marker.addEventListener('markerLost', this.onMarkerLost);
        }
        
        // Set up the progress visualization but don't show it yet
        if (this.data.showBadge) {
            this.createProgressBadge();
        }
        
        // Prepare data, but don't show UI yet
        this.isBadgeVisible = false;
        this.updateProgressData();
    },

    onMarkerFound: function() {
        // Show the progress badge when marker is found
        console.log('Marker found, showing progress badge');
        this.showProgressBadge();
        this.updateProgress(); // Show the visual progress
    },
    
    onMarkerLost: function() {
        // Hide the progress badge when marker is lost
        console.log('Marker lost, hiding progress badge');
        this.hideProgressBadge();
    },
    
    createProgressBadge: function() {
        // Create or get the progress badge
        let badge = document.querySelector('.progress-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'progress-badge';
            badge.classList.add(this.data.badgePosition);
            // Initially hidden
            badge.style.display = 'none';
            
            // Create progress bar within badge
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            badge.appendChild(progressBar);
            
            // Create text container
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            badge.appendChild(progressText);
            
            document.body.appendChild(badge);
            this.progressBar = progressBar;
            this.progressText = progressText;
            this.badge = badge;
        } else {
            this.badge = badge;
            this.progressBar = badge.querySelector('.progress-bar');
            this.progressText = badge.querySelector('.progress-text');
            this.badge.style.display = 'none';
        }
    },
    
    showProgressBadge: function() {
        if (this.badge && !this.isBadgeVisible) {
            this.badge.style.display = 'block';
            this.isBadgeVisible = true;
        }
    },
    
    hideProgressBadge: function() {
        if (this.badge && this.isBadgeVisible) {
            this.badge.style.display = 'none';
            this.isBadgeVisible = false;
        }
    },

    markVisited: function(eventId) {
        const visited = this.getVisitedEvents();
        
        // Check if already visited
        if (visited.includes(eventId)) {
            return false;
        }
        
        // Add to visited events
        visited.push(eventId);
        
        // Store in localStorage with better error handling
        try {
            localStorage.setItem(this.data.storageKey, JSON.stringify(visited));
        } catch (e) {
            console.error('Failed to save progress:', e);
            if (window.Analytics) {
                window.Analytics.trackError('storageError', e.message);
            }
        }
        
        // Update progress UI
        this.updateProgress();
        
        // Mark the block visually as visited
        const block = document.querySelector(`#block-${eventId}`);
        if (block) {
            block.setAttribute('visited', true);
            
            // Add visual checkmark
            if (!block.querySelector('.checkmark')) {
                const checkEntity = document.createElement('a-entity');
                checkEntity.setAttribute('geometry', {
                    primitive: 'plane',
                    width: 0.3,
                    height: 0.3
                });
                checkEntity.setAttribute('material', {
                    src: '#checkmark-texture',
                    transparent: true,
                    opacity: 0.9
                });
                checkEntity.setAttribute('position', '0 0.41 0.41');
                checkEntity.setAttribute('class', 'checkmark');
                block.appendChild(checkEntity);
            }
        }
        
        return true;
    },

    getVisitedEvents: function() {
        try {
            const visited = JSON.parse(localStorage.getItem(this.data.storageKey)) || [];
            return Array.isArray(visited) ? visited : [];
        } catch (e) {
            console.error('Failed to retrieve progress:', e);
            return [];
        }
    },

    // Update data without updating UI
    updateProgressData: function() {
        const visited = this.getVisitedEvents();
        const totalEvents = this.data.totalEvents;
        this.progress = totalEvents > 0 ? (visited.length / totalEvents) * 100 : 0;
        this.visitedCount = visited.length;
        this.isComplete = visited.length === totalEvents;
        
        // Track progress in analytics without visual updates
        if (window.Analytics) {
            window.Analytics.trackProgress(this.progress, visited.length, totalEvents);
        } else if (window.gtag) {
            gtag('event', 'progressUpdate', {
                'event_category': 'Progress',
                'event_label': `Progress: ${this.progress}%`
            });
            
            // Track completion
            if (this.isComplete) {
                gtag('event', 'timelineComplete', {
                    'event_category': 'Progress',
                    'event_label': 'Timeline Completion'
                });
            }
        }
        
        // Dispatch a progress event for other components
        document.dispatchEvent(new CustomEvent('progressUpdated', {
            detail: {
                progress: this.progress,
                visited: visited.length,
                total: totalEvents,
                isComplete: this.isComplete
            }
        }));
    },
    
    // Update both data and UI
    updateProgress: function() {
        // First update the data
        this.updateProgressData();
        
        // Only update UI if badge is visible
        if (!this.isBadgeVisible) return;
        
        // Update progress bar if it exists
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
        }
        
        // Update text display
        if (this.progressText) {
            const progressMessage = this.isComplete
                ? (window.I18n ? I18n.t('ui.complete') : '🎉 Timeline Complete!')
                : (window.I18n 
                   ? I18n.t('ui.progress') + `: ${Math.round(this.progress)}% (${this.visitedCount}/${this.data.totalEvents})` 
                   : `Progress: ${Math.round(this.progress)}% (${this.visitedCount}/${this.data.totalEvents})`);
                   
            this.progressText.textContent = progressMessage;
        }

        // Add special class for completion
        if (this.badge) {
            if (this.isComplete) {
                this.badge.classList.add('complete');
            } else {
                this.badge.classList.remove('complete');
            }
        }
    },

    resetProgress: function() {
        try {
            localStorage.removeItem(this.data.storageKey);
            
            // Remove visual indicators
            document.querySelectorAll('.checkmark').forEach(el => {
                el.parentNode.removeChild(el);
            });
            
            document.querySelectorAll('[visited="true"]').forEach(el => {
                el.setAttribute('visited', false);
            });
            
            this.updateProgress();
            return true;
        } catch (e) {
            console.error('Failed to reset progress:', e);
            return false;
        }
    },

    remove: function() {
        // Remove document event listeners
        document.removeEventListener('progressUpdate', this.updateProgress);
        document.removeEventListener('eventVisited', this.markVisited);
        
        // Remove marker event listeners
        const marker = document.querySelector('#marker');
        if (marker) {
            marker.removeEventListener('markerFound', this.onMarkerFound);
            marker.removeEventListener('markerLost', this.onMarkerLost);
        }
        
        // Remove badge from DOM if created by this component
        if (this.badge && this.badge.parentNode) {
            this.badge.parentNode.removeChild(this.badge);
        }
    }
});