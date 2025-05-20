AFRAME.registerComponent('timeline-block', {
    schema: {
        eventId: { type: 'string' },
        year: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        color: { type: 'color' },
        mediaUrl: { type: 'string' },
        mediaType: { type: 'string' },
        position: { type: 'string' }
    },

    init: function() {
        // Set initial properties
        this.el.setAttribute('geometry', {
            primitive: 'box',
            width: 0.8,
            height: 0.8,
            depth: 0.8
        });

        this.el.setAttribute('material', {
            color: this.data.color,
            metalness: 0.5,
            roughness: 0.5
        });

        // Initially hide the element
        this.el.setAttribute('visible', false);

        // Set initial position
        const position = this.data.position.split(' ').map(Number);
        this.el.setAttribute('position', {
            x: position[0],
            y: position[1],
            z: position[2]
        });

        // Add click handler
        this.el.addEventListener('click', () => {
            this.showMedia();
        });

        // Add touch handler for mobile
        this.el.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.showMedia();
        });

        // Listen for marker found event
        const marker = document.querySelector('#marker');
        if (marker) {
            marker.addEventListener('markerFound', () => {
                // Show the element when marker is found
                this.el.setAttribute('visible', true);
            });

            marker.addEventListener('markerLost', () => {
                // Hide the element when marker is lost
                this.el.setAttribute('visible', false);
            });
        }
    },

    showMedia: function() {
        const modal = document.getElementById('media-modal');
        const modalMedia = document.getElementById('modal-media');
        const modalDescription = document.getElementById('modal-description');

        // Clear previous content
        modalMedia.innerHTML = '';
        modalDescription.innerHTML = '';

        // Add media content
        if (this.data.mediaType === 'image') {
            const img = document.createElement('img');
            img.src = this.data.mediaUrl;
            img.style.maxWidth = '100%';
            modalMedia.appendChild(img);
        }

        // Add description
        const title = document.createElement('h2');
        title.textContent = this.data.title;
        modalDescription.appendChild(title);

        const year = document.createElement('p');
        year.className = 'year';
        year.textContent = this.data.year;
        modalDescription.appendChild(year);

        const description = document.createElement('p');
        description.textContent = this.data.description;
        modalDescription.appendChild(description);

        // Show modal
        modal.style.display = 'block';

        // Add close handler
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        // Close on outside click
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };

        // Mark as visited
        this.el.classList.add('visited');
    },

    createText: function(event, position) {
        const text = document.createElement('a-text');
        text.setAttribute('value', `${event.year}\n${event.title}\n${event.description}`);
        text.setAttribute('position', {
            x: position.x,
            y: position.y + CONFIG.textOffset,
            z: -0.2
        });
        text.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        text.setAttribute('align', 'center');
        text.setAttribute('anchor', 'center');
        text.setAttribute('baseline', 'center');
        text.setAttribute('color', '#FFF');
        text.setAttribute('scale', `${CONFIG.textScale} ${CONFIG.textScale} ${CONFIG.textScale}`);
        text.setAttribute('look-at', '[camera]');
        text.setAttribute('geometry', 'primitive: plane; width: 1.2; height: 0.8');
        text.setAttribute('material', 'color: #000; opacity: 0.8; transparent: true');
        text.setAttribute('class', 'timeline-text');
        return text;
    }
}); 