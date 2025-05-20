// Asset Loader Utility
const AssetLoader = (function() {
    'use strict';
    
    // Asset registry
    const assets = {
        images: {},
        models: {},
        videos: {},
        audio: {}
    };
    
    // Loading states
    const LoadState = {
        PENDING: 'pending',
        LOADING: 'loading',
        LOADED: 'loaded',
        ERROR: 'error'
    };
    
    // Track overall loading progress
    let totalAssets = 0;
    let loadedAssets = 0;
    
    // Callbacks
    const callbacks = {
        onProgress: null,
        onComplete: null,
        onError: null
    };
    
    // Preload a single image
    function preloadImage(id, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                assets.images[id] = {
                    element: img,
                    url: url,
                    state: LoadState.LOADED
                };
                loadedAssets++;
                updateProgress();
                resolve(img);
            };
            
            img.onerror = (err) => {
                assets.images[id] = {
                    url: url,
                    state: LoadState.ERROR,
                    error: err
                };
                updateProgress();
                reject(err);
            };
            
            // Set loading state before starting load
            assets.images[id] = {
                url: url,
                state: LoadState.LOADING
            };
            
            // Start loading
            img.src = url;
        });
    }
    
    // Preload a 3D model
    function preloadModel(id, url) {
        return new Promise((resolve, reject) => {
            // Set loading state
            assets.models[id] = {
                url: url,
                state: LoadState.LOADING
            };
            
            // Use THREE.GLTFLoader if available, otherwise use a placeholder
            if (window.THREE && window.THREE.GLTFLoader) {
                const loader = new THREE.GLTFLoader();
                
                loader.load(
                    url,
                    (gltf) => {
                        assets.models[id] = {
                            data: gltf,
                            url: url,
                            state: LoadState.LOADED
                        };
                        loadedAssets++;
                        updateProgress();
                        resolve(gltf);
                    },
                    (xhr) => {
                        // Progress event - not incrementing loadedAssets here
                        if (callbacks.onProgress) {
                            callbacks.onProgress({
                                id: id,
                                loaded: xhr.loaded,
                                total: xhr.total,
                                type: 'model'
                            });
                        }
                    },
                    (err) => {
                        assets.models[id] = {
                            url: url,
                            state: LoadState.ERROR,
                            error: err
                        };
                        updateProgress();
                        reject(err);
                    }
                );
            } else {
                // Fallback if THREE.js loader not available
                const fakeLoad = setTimeout(() => {
                    assets.models[id] = {
                        url: url,
                        state: LoadState.LOADED,
                        data: null
                    };
                    loadedAssets++;
                    updateProgress();
                    resolve(null);
                }, 500);
            }
        });
    }
    
    // Update progress and trigger callbacks
    function updateProgress() {
        const progress = totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 0;
        
        if (callbacks.onProgress) {
            callbacks.onProgress({
                loaded: loadedAssets,
                total: totalAssets,
                progress: progress
            });
        }
        
        // Check if all assets are loaded
        if (loadedAssets === totalAssets && callbacks.onComplete) {
            callbacks.onComplete();
        }
    }
    
    // Preload all assets from a manifest
    function preloadAssets(manifest) {
        return new Promise((resolve, reject) => {
            // Reset counters
            totalAssets = 0;
            loadedAssets = 0;
            
            const loadPromises = [];
            
            // Count total assets and create promises
            if (manifest.images) {
                totalAssets += Object.keys(manifest.images).length;
                for (const [id, url] of Object.entries(manifest.images)) {
                    loadPromises.push(preloadImage(id, url));
                }
            }
            
            if (manifest.models) {
                totalAssets += Object.keys(manifest.models).length;
                for (const [id, url] of Object.entries(manifest.models)) {
                    loadPromises.push(preloadModel(id, url));
                }
            }
            
            // Handle videos and audio if needed (similar pattern)
            
            if (loadPromises.length === 0) {
                // No assets to load
                if (callbacks.onComplete) {
                    callbacks.onComplete();
                }
                resolve(assets);
                return;
            }
            
            // Wait for all assets to load
            Promise.all(loadPromises.map(p => p.catch(e => e)))
                .then((results) => {
                    const errors = results.filter(result => result instanceof Error);
                    
                    if (errors.length > 0 && callbacks.onError) {
                        callbacks.onError(errors);
                    }
                    
                    resolve(assets);
                })
                .catch(reject);
        });
    }
    
    // Get a loaded asset by ID
    function getAsset(type, id) {
        if (assets[type] && assets[type][id]) {
            return assets[type][id].state === LoadState.LOADED ? 
                (type === 'images' ? assets[type][id].element : assets[type][id].data) : 
                null;
        }
        return null;
    }
    
    // Set callback handlers
    function setCallbacks(handlers) {
        if (handlers.onProgress) callbacks.onProgress = handlers.onProgress;
        if (handlers.onComplete) callbacks.onComplete = handlers.onComplete;
        if (handlers.onError) callbacks.onError = handlers.onError;
    }
    
    // Public API
    return {
        preloadAssets,
        getAsset,
        setCallbacks,
        get progress() {
            return totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 0;
        }
    };
})();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssetLoader;
}
