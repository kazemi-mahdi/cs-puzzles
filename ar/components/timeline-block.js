AFRAME.registerComponent('timeline-block', {
    schema: {
        eventId: { type: 'string' },
        year: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        color: { type: 'color' },
        mediaUrl: { type: 'string' },
        mediaType: { type: 'string' },
        position: { type: 'vec3' }
    },

    init: function() {
        this.el.setAttribute('class', 'timeline-block clickable');
        this.el.setAttribute('static-body', '');
        
        // Add entrance animation
        this.el.setAttribute('animation__enter', {
            property: 'position',
            from: `${this.data.position.x} ${this.data.position.y - 2} ${this.data.position.z}`,
            to: `${this.data.position.x} ${this.data.position.y} ${this.data.position.z}`,
            dur: 1200,
            easing: 'easeOutElastic'
        });

        // Add hover animation
        this.el.setAttribute('animation__hover', {
            property: 'scale',
            startEvents: 'mouseenter',
            from: '1 1 1',
            to: '1.1 1.1 1.1',
            dur: 300,
            easing: 'easeOutQuad'
        });

        this.el.setAttribute('animation__hoverout', {
            property: 'scale',
            startEvents: 'mouseleave',
            from: '1.1 1.1 1.1',
            to: '1 1 1',
            dur: 300,
            easing: 'easeOutQuad'
        });

        // Add click handler
        this.el.addEventListener('click', () => this.handleClick());
        this.el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick();
        });

        // Check if visited
        this.checkVisited();
    },

    checkVisited: function() {
        const visited = JSON.parse(localStorage.getItem('visited')) || [];
        if (visited.includes(this.data.eventId)) {
            this.el.classList.add('visited');
        }
    },

    handleClick: function() {
        // Track analytics
        if (window.gtag) {
            gtag('event', 'cubeClick', {
                'event_category': 'Interaction',
                'event_label': this.data.title
            });
        }

        // Mark as visited
        const visited = JSON.parse(localStorage.getItem('visited')) || [];
        if (!visited.includes(this.data.eventId)) {
            visited.push(this.data.eventId);
            localStorage.setItem('visited', JSON.stringify(visited));
            this.el.classList.add('visited');
            
            // Dispatch progress update event
            document.dispatchEvent(new CustomEvent('progressUpdate'));
        }

        // Show media modal
        const modal = document.getElementById('media-modal');
        const modalMedia = document.getElementById('modal-media');
        const modalDescription = document.getElementById('modal-description');

        if (this.data.mediaType === 'image') {
            modalMedia.innerHTML = `<img src="${this.data.mediaUrl}" alt="${this.data.title}">`;
        } else if (this.data.mediaType === 'video') {
            modalMedia.innerHTML = `<video src="${this.data.mediaUrl}" controls></video>`;
        }

        modalDescription.innerHTML = `
            <h2>${this.data.title}</h2>
            <p>${this.data.description}</p>
            <p class="year">${this.data.year}</p>
        `;

        modal.style.display = 'block';

        // Close modal handler
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}); 