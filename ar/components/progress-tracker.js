AFRAME.registerComponent('progress-tracker', {
    schema: {
        totalEvents: { type: 'number', default: 0 }
    },

    init: function() {
        this.updateProgress = this.updateProgress.bind(this);
        document.addEventListener('progressUpdate', this.updateProgress);
        
        // Initial progress check
        this.updateProgress();
    },

    updateProgress: function() {
        const visited = JSON.parse(localStorage.getItem('visited')) || [];
        const progress = (visited.length / this.data.totalEvents) * 100;
        
        // Create or update progress badge
        let badge = document.querySelector('.progress-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'progress-badge';
            document.body.appendChild(badge);
        }

        // Update badge content
        badge.textContent = `Progress: ${Math.round(progress)}% (${visited.length}/${this.data.totalEvents})`;

        // Show completion message if all events visited
        if (visited.length === this.data.totalEvents) {
            badge.textContent = '🎉 Timeline Complete!';
            badge.style.background = 'rgba(46, 204, 113, 0.9)';
            
            // Track completion
            if (window.gtag) {
                gtag('event', 'timelineComplete', {
                    'event_category': 'Progress',
                    'event_label': 'Timeline Completion'
                });
            }
        }

        // Store progress in analytics
        if (window.gtag) {
            gtag('event', 'progressUpdate', {
                'event_category': 'Progress',
                'event_label': `Progress: ${progress}%`
            });
        }
    },

    remove: function() {
        document.removeEventListener('progressUpdate', this.updateProgress);
    }
}); 