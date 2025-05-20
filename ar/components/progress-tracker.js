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
        
        // Create event listeners
        document.addEventListener('progressUpdate', this.updateProgress);
        document.addEventListener('eventVisited', (event) => {
            if (event.detail && event.detail.eventId) {
                this.markVisited(event.detail.eventId);
            }
        });
        
        // Set up the progress visualization
        if (this.data.showBadge) {
            this.createProgressBadge();
        }
        
        // Initial progress check
        this.updateProgress();
    },

    createProgressBadge: function() {
        // Create or get the progress badge
        let badge = document.querySelector('.progress-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'progress-badge';
            badge.classList.add(this.data.badgePosition);
            
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

    updateProgress: function() {
        const visited = this.getVisitedEvents();
        const totalEvents = this.data.totalEvents;
        const progress = totalEvents > 0 ? (visited.length / totalEvents) * 100 : 0;
        
        // Update progress bar if it exists
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        // Update text display
        if (this.progressText) {
            const progressMessage = visited.length === totalEvents
                ? (window.I18n ? I18n.t('ui.complete') : '🎉 Timeline Complete!')
                : (window.I18n 
                   ? I18n.t('ui.progress') + `: ${Math.round(progress)}% (${visited.length}/${totalEvents})` 
                   : `Progress: ${Math.round(progress)}% (${visited.length}/${totalEvents})`);
                   
            this.progressText.textContent = progressMessage;
        }

        // Add special class for completion
        const badge = document.querySelector('.progress-badge');
        if (badge) {
            if (visited.length === totalEvents) {
                badge.classList.add('complete');
            } else {
                badge.classList.remove('complete');
            }
        }

        // Track progress in analytics
        if (window.Analytics) {
            window.Analytics.trackProgress(progress, visited.length, totalEvents);
        } else if (window.gtag) {
            gtag('event', 'progressUpdate', {
                'event_category': 'Progress',
                'event_label': `Progress: ${progress}%`
            });
            
            // Track completion
            if (visited.length === totalEvents) {
                gtag('event', 'timelineComplete', {
                    'event_category': 'Progress',
                    'event_label': 'Timeline Completion'
                });
            }
        }
        
        // Dispatch a progress event for other components
        document.dispatchEvent(new CustomEvent('progressUpdated', {
            detail: {
                progress,
                visited: visited.length,
                total: totalEvents,
                isComplete: visited.length === totalEvents
            }
        }));
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
        document.removeEventListener('progressUpdate', this.updateProgress);
        document.removeEventListener('eventVisited', this.markVisited);
    }
});