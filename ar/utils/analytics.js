// Analytics Module
const Analytics = (function() {
    'use strict';
    
    // Analytics configuration
    const config = {
        enabled: true,
        trackerId: 'G-XXXXXXXXXX', // Replace with your actual Google Analytics ID
        debugMode: false,
        anonymizeIp: true
    };
    
    // Event categories
    const categories = {
        INTERACTION: 'Interaction',
        PROGRESS: 'Progress',
        ERROR: 'Error',
        PERFORMANCE: 'Performance',
        SETTINGS: 'Settings',
        NAVIGATION: 'Navigation'
    };
    
    // Initialize analytics
    function init(options = {}) {
        if (!window.gtag) {
            console.warn('Google Analytics not found. Loading script...');
            loadAnalyticsScript();
        }
        
        // Apply any custom configuration
        Object.assign(config, options);
        
        // Configure Google Analytics
        if (window.gtag) {
            window.gtag('config', config.trackerId, {
                anonymize_ip: config.anonymizeIp,
                debug_mode: config.debugMode
            });
            
            // Track initial page view
            trackPageView();
        }
    }
    
    // Load the analytics script dynamically
    function loadAnalyticsScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.trackerId}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
    }
    
    // Track a custom event
    function trackEvent(category, action, label, value) {
        if (!config.enabled || !window.gtag) return;
        
        window.gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
        
        if (config.debugMode) {
            console.log(`[Analytics] Event: ${category} - ${action} - ${label} - ${value}`);
        }
    }
    
    // Track page view
    function trackPageView(pagePath, pageTitle) {
        if (!config.enabled || !window.gtag) return;
        
        window.gtag('event', 'page_view', {
            'page_path': pagePath || window.location.pathname,
            'page_title': pageTitle || document.title
        });
    }
    
    // Track user interaction with timeline block
    function trackTimelineInteraction(eventId, actionType) {
        trackEvent(
            categories.INTERACTION,
            actionType || 'blockClick',
            eventId
        );
    }
    
    // Track user progress
    function trackProgress(progressPercent, eventsViewed, totalEvents) {
        trackEvent(
            categories.PROGRESS,
            'progressUpdate',
            'Progress',
            Math.round(progressPercent)
        );
        
        // Track milestone completions
        if (progressPercent === 100) {
            trackEvent(
                categories.PROGRESS,
                'timelineComplete',
                'Timeline Completion'
            );
        } else if (progressPercent >= 75 && progressPercent < 80) {
            trackEvent(
                categories.PROGRESS,
                'milestone',
                '75% Complete'
            );
        } else if (progressPercent >= 50 && progressPercent < 55) {
            trackEvent(
                categories.PROGRESS,
                'milestone',
                '50% Complete'
            );
        } else if (progressPercent >= 25 && progressPercent < 30) {
            trackEvent(
                categories.PROGRESS,
                'milestone',
                '25% Complete'
            );
        }
    }
    
    // Track errors
    function trackError(errorCategory, errorMessage) {
        trackEvent(
            categories.ERROR,
            errorCategory,
            errorMessage
        );
    }
    
    // Track performance metrics
    function trackPerformance(fps, deviceInfo) {
        trackEvent(
            categories.PERFORMANCE,
            'performanceMetric',
            deviceInfo || navigator.userAgent,
            Math.round(fps)
        );
    }
    
    // Track language change
    function trackLanguageChange(language) {
        trackEvent(
            categories.SETTINGS,
            'languageChange',
            language
        );
    }
    
    // Public API
    return {
        init,
        trackEvent,
        trackPageView,
        trackTimelineInteraction,
        trackProgress,
        trackError,
        trackPerformance,
        trackLanguageChange,
        categories
    };
})();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
