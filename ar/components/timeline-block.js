AFRAME.registerComponent('timeline-block', {
    schema: {
        eventId: { type: 'string' },
        year: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        details: { type: 'string', default: '' },
        color: { type: 'color', default: '#4285F4' },
        mediaUrl: { type: 'string', default: '' },
        mediaType: { type: 'string', default: 'image' },
        position: { type: 'vec3' },
        size: { type: 'number', default: 0.8 },
        hoverAnimation: { type: 'boolean', default: true },
        entranceAnimation: { type: 'boolean', default: true },
        language: { type: 'string', default: 'en' }
    },

    init: function() {
        // Store references
        this.blockSize = this.data.size;
        this.isHovering = false;
        this.isVisited = false;
        this.isVisible = false;
        this.onMarkerFound = this.onMarkerFound.bind(this);
        this.onMarkerLost = this.onMarkerLost.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onHover = this.onHover.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.checkVisitedStatus = this.checkVisitedStatus.bind(this);
        
        // Set unique ID for the element
        this.el.id = `block-${this.data.eventId}`;
        
        // Set geometry
        this.el.setAttribute('geometry', {
            primitive: 'box',
            width: this.blockSize,
            height: this.blockSize,
            depth: this.blockSize
        });

        // Set material with improved visual properties
        this.el.setAttribute('material', {
            color: this.data.color,
            metalness: 0.3,
            roughness: 0.7,
            shader: 'standard',
            side: 'double'
        });

        // Add class for interactivity and raycasting
        this.el.setAttribute('class', 'timeline-block clickable');
        
        // Add shadow
        this.el.setAttribute('shadow', 'cast: true; receive: true');

        // Set position
        this.el.setAttribute('position', this.data.position);
        
        // Initially hide but keep in scene graph for faster showing
        this.el.setAttribute('visible', false);
        
        // Create text display
        this.createText();
        
        // Add event listeners
        this.el.addEventListener('click', this.onClick);
        this.el.addEventListener('mouseenter', this.onHover);
        this.el.addEventListener('mouseleave', this.onLeave);
        this.el.addEventListener('raycaster-intersected', this.onHover);
        this.el.addEventListener('raycaster-intersected-cleared', this.onLeave);
        this.el.addEventListener('touchstart', (evt) => {
            evt.preventDefault();
            this.onClick();
        });
        
        // Listen for marker events
        const marker = document.querySelector('#marker');
        if (marker) {
            marker.addEventListener('markerFound', this.onMarkerFound);
            marker.addEventListener('markerLost', this.onMarkerLost);
        }
        
        // Listen for language changes
        document.addEventListener('languageChanged', (evt) => {
            if (evt.detail && evt.detail.language) {
                this.updateLanguage(evt.detail.language);
            }
        });
        
        // Check if this event has been visited before
        this.checkVisitedStatus();
        
        // Listen for progress changes
        document.addEventListener('progressUpdated', this.checkVisitedStatus);
    },

    updateLanguage: function(language) {
        // Update displayed text based on language
        if (this.textElement) {
            this.textElement.setAttribute('value', `${this.data.year}\n${this.data.title}\n${this.data.description}`);
        }
    },
    
    onMarkerFound: function() {
        // When marker is found, show the block with animation if enabled
        if (!this.isVisible) {
            this.isVisible = true;
            
            // Make visible immediately
            this.el.setAttribute('visible', true);
            
            if (this.textEntity) {
                this.textEntity.setAttribute('visible', true);
            }
            
            // Add entrance animation if enabled
            if (this.data.entranceAnimation) {
                const currentPosition = this.el.getAttribute('position');
                
                // Create the animation: block rises from below
                this.el.setAttribute('animation__entrance', {
                    property: 'position',
                    from: `${currentPosition.x} ${currentPosition.y - 2} ${currentPosition.z}`,
                    to: `${currentPosition.x} ${currentPosition.y} ${currentPosition.z}`,
                    dur: 1200 + (Math.random() * 500), // Randomize slightly for organic feel
                    easing: 'easeOutElastic',
                    delay: 100 * parseInt(this.data.year) % 500 // Stagger based on year
                });
            }
        }
    },
    
    onMarkerLost: function() {
        // When marker is lost, hide the block
        this.isVisible = false;
        this.el.setAttribute('visible', false);
        
        if (this.textEntity) {
            this.textEntity.setAttribute('visible', false);
        }
        
        // Stop any running animations
        this.el.removeAttribute('animation__entrance');
        this.el.removeAttribute('animation__hover');
    },
    
    onClick: function() {
        // Show media and details when clicked
        this.showMedia();
        
        // Mark as visited
        this.markVisited();
        
        // Track interaction
        if (window.Analytics) {
            window.Analytics.trackTimelineInteraction(this.data.eventId, 'blockClick');
        }
    },
    
    onHover: function() {
        if (!this.isHovering && this.data.hoverAnimation) {
            this.isHovering = true;
            
            // Add hover animation
            this.el.setAttribute('animation__hover', {
                property: 'scale',
                from: '1 1 1',
                to: '1.1 1.1 1.1',
                dur: 300,
                easing: 'easeOutQuad'
            });
            
            // Show text info
            if (this.textEntity) {
                this.textEntity.setAttribute('visible', true);
                this.textEntity.setAttribute('animation__fade', {
                    property: 'opacity',
                    from: 0,
                    to: 1,
                    dur: 300,
                    easing: 'easeOutQuad'
                });
            }
        }
    },
    
    onLeave: function() {
        if (this.isHovering && this.data.hoverAnimation) {
            this.isHovering = false;
            
            // Remove hover animation
            this.el.setAttribute('animation__hover', {
                property: 'scale',
                from: '1.1 1.1 1.1',
                to: '1 1 1',
                dur: 300,
                easing: 'easeOutQuad'
            });
            
            // Hide text unless we're hovering
            if (this.textEntity) {
                this.textEntity.setAttribute('animation__fade', {
                    property: 'opacity',
                    from: 1,
                    to: 0,
                    dur: 300,
                    easing: 'easeOutQuad'
                });
            }
        }
    },

    createText: function() {
        // Create a text entity that floats above the block
        this.textEntity = document.createElement('a-entity');
        
        // Create background plane for better legibility
        const backgroundPlane = document.createElement('a-plane');
        backgroundPlane.setAttribute('color', '#000000');
        backgroundPlane.setAttribute('opacity', 0.6);
        backgroundPlane.setAttribute('width', 1.6);
        backgroundPlane.setAttribute('height', 1);
        backgroundPlane.setAttribute('position', '0 0 0.01');
        backgroundPlane.setAttribute('material', {
            transparent: true,
            shader: 'flat',
            side: 'double'
        });
        this.textEntity.appendChild(backgroundPlane);
        
        // Create the text element
        this.textElement = document.createElement('a-text');
        this.textElement.setAttribute('value', `${this.data.year}\n${this.data.title}\n${this.data.description}`);
        this.textElement.setAttribute('align', 'center');
        this.textElement.setAttribute('width', 2.5);
        this.textElement.setAttribute('color', '#FFFFFF');
        this.textElement.setAttribute('position', '0 0 0.02');
        this.textElement.setAttribute('font', 'roboto');
        this.textEntity.appendChild(this.textElement);
        
        // Position above the block
        this.textEntity.setAttribute('position', {
            x: 0,
            y: this.blockSize + 0.2,
            z: 0
        });
        
        this.textEntity.setAttribute('rotation', '-90 0 0');
        this.textEntity.setAttribute('visible', false); // Start hidden
        
        // Add to the scene
        this.el.appendChild(this.textEntity);
    },

    markVisited: function() {
        // Mark this block as visited
        this.isVisited = true;
        this.el.setAttribute('visited', true);
        
        // Apply visual indicator (partial transparency)
        this.el.setAttribute('material', {
            opacity: 0.8,
            color: this.data.color
        });
        
        // Trigger event for progress tracker
        document.dispatchEvent(new CustomEvent('eventVisited', {
            detail: { eventId: this.data.eventId }
        }));
    },
    
    checkVisitedStatus: function() {
        // Check localStorage to see if this event has been visited
        const storageKey = 'cs-timeline-visited'; // Should match progress-tracker storage key
        try {
            const visited = JSON.parse(localStorage.getItem(storageKey)) || [];
            if (visited.includes(this.data.eventId)) {
                this.markVisited();
            }
        } catch (e) {
            console.warn('Failed to check visited status:', e);
        }
    },

    showMedia: function() {
        const modal = document.getElementById('media-modal');
        const modalMedia = document.getElementById('modal-media');
        const modalDescription = document.getElementById('modal-description');

        // Clear previous content
        modalMedia.innerHTML = '';
        modalDescription.innerHTML = '';

        // Add media content based on type
        if (this.data.mediaType === 'image' && this.data.mediaUrl) {
            const img = document.createElement('img');
            img.src = this.data.mediaUrl;
            img.alt = this.data.title;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '4px';
            modalMedia.appendChild(img);
        } else if (this.data.mediaType === 'video' && this.data.mediaUrl) {
            const video = document.createElement('video');
            video.src = this.data.mediaUrl;
            video.controls = true;
            video.autoplay = true;
            video.style.maxWidth = '100%';
            video.style.borderRadius = '4px';
            modalMedia.appendChild(video);
        }

        // Add detailed information
        const title = document.createElement('h2');
        title.textContent = this.data.title;
        title.style.margin = '0.5em 0';
        modalDescription.appendChild(title);

        const year = document.createElement('p');
        year.className = 'year';
        year.textContent = this.data.year;
        year.style.fontWeight = 'bold';
        year.style.color = this.data.color;
        modalDescription.appendChild(year);

        const description = document.createElement('p');
        description.textContent = this.data.details || this.data.description;
        description.style.lineHeight = '1.5';
        modalDescription.appendChild(description);

        // Show modal with animation
        modal.style.display = 'block';
        modal.classList.add('modal-active');

        // Add close handler
        const closeBtn = modal.querySelector('.close');
        closeBtn.textContent = window.I18n ? I18n.t('ui.close') : 'Close';
        closeBtn.onclick = () => {
            modal.classList.remove('modal-active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match transition time in CSS
        };

        // Close on outside click
        window.onclick = (event) => {
            if (event.target === modal) {
                closeBtn.onclick();
            }
        };
    },
    
    update: function(oldData) {
        // Handle property updates
        if (oldData.color !== this.data.color) {
            this.el.setAttribute('material', 'color', this.data.color);
        }
        
        if (oldData.size !== this.data.size) {
            this.blockSize = this.data.size;
            this.el.setAttribute('geometry', {
                width: this.blockSize,
                height: this.blockSize,
                depth: this.blockSize
            });
            
            // Update text position
            if (this.textEntity) {
                this.textEntity.setAttribute('position', {
                    x: 0,
                    y: this.blockSize + 0.2,
                    z: 0
                });
            }
        }
        
        if (oldData.language !== this.data.language) {
            this.updateLanguage(this.data.language);
        }
    },
    
    remove: function() {
        // Clean up event listeners
        this.el.removeEventListener('click', this.onClick);
        this.el.removeEventListener('mouseenter', this.onHover);
        this.el.removeEventListener('mouseleave', this.onLeave);
        this.el.removeEventListener('raycaster-intersected', this.onHover);
        this.el.removeEventListener('raycaster-intersected-cleared', this.onLeave);
        
        // Remove marker event listeners
        const marker = document.querySelector('#marker');
        if (marker) {
            marker.removeEventListener('markerFound', this.onMarkerFound);
            marker.removeEventListener('markerLost', this.onMarkerLost);
        }
        
        // Remove progress event listener
        document.removeEventListener('progressUpdated', this.checkVisitedStatus);
    }
}); 