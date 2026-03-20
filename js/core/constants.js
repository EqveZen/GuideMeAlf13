const Constants = {
    PRIORITY_CLASSES: ['person', 'car', 'truck', 'bus', 'motorcycle', 'dog', 'cat'],

    DANGEROUS_CLASSES: ['car', 'truck', 'bus', 'motorcycle'],
    
    OBJECT_SIZES: {
        'person': 0.5,
        'car': 1.8,
        'truck': 2.5,
        'bus': 2.5,
        'motorcycle': 0.8,
        'bicycle': 0.6,
        'dog': 0.3,
        'cat': 0.2,
        'chair': 0.5,
        'bench': 1.5,
        'backpack': 0.3,
        'suitcase': 0.4
    },

    DEFAULTS: {
        volume: 1,
        frequency: 5,
        confidence: 0.4,
        dangerThreshold: 1.5,
        soundEnabled: true,
        vibrationEnabled: true
    },

    TIMINGS: {
        detectionInterval: 500,
        priorityCooldown: 2000,
        changeDelay: 500,
        fullDescriptionCooldown: 8000,
        emptySceneCooldown: 15000
    }
};

window.Constants = Constants;