const Safety = {
    dangerThresholds: {
        'person': 1.5,
        'car': 2.0,
        'truck': 2.0,
        'bus': 2.0,
        'motorcycle': 1.8,
        'bicycle': 1.5,
        'dog': 1.0,
        'cat': 1.0,
        'default': 0.8
    },
    
    vibrationPatterns: {
        'person': { pattern: 200, intensity: 'light' },
        'car': { pattern: [200, 100, 200], intensity: 'heavy' },
        'truck': { pattern: [200, 100, 200], intensity: 'heavy' },
        'bus': { pattern: [200, 100, 200], intensity: 'heavy' },
        'motorcycle': { pattern: [200, 100, 200], intensity: 'heavy' },
        'bicycle': { pattern: 150, intensity: 'medium' },
        'dog': { pattern: 100, intensity: 'light' },
        'cat': { pattern: 100, intensity: 'light' },
        'default': { pattern: 100, intensity: 'light' }
    },
    
    lastWarningTime: 0,
    warningCooldown: 3000, // 3 секунды между предупреждениями
    
    init() {
        console.log('🛡️ Safety загружен');
        return this;
    },
    
    getDangerThreshold(objectType) {
        return this.dangerThresholds[objectType] || this.dangerThresholds.default;
    },
    
    checkObject(obj, distance, direction) {
        if (distance === null) return null;
        
        const threshold = this.getDangerThreshold(obj.class);
        const isDangerous = distance < threshold;
        
        if (isDangerous && Date.now() - this.lastWarningTime > this.warningCooldown) {
            this.lastWarningTime = Date.now();
            return this.getWarningMessage(obj.class, distance, direction);
        }
        
        return null;
    },
    
    getWarningMessage(objectType, distance, direction) {
        const name = Translations ? Translations.get(objectType) : objectType;
        // настройка дистанции
        if (objectType === 'person') {
            if (distance < 0.8) {
                return `человек вплотную ${direction}!`;
            }
            return `человек очень близко ${direction}`;
        } 
        else if (['car', 'truck', 'bus', 'motorcycle'].includes(objectType)) {
            if (distance < 1.2) {
                return `машина прямо перед вами ${direction}!`;
            }
            return `машина очень близко ${direction}`;
        }
        else if (objectType === 'bicycle') {
            return `велосипед близко ${direction}`;
        }
        else if (objectType === 'dog') {
            return `собака рядом ${direction}`;
        }
        else if (objectType === 'cat') {
            return `кошка рядом ${direction}`;
        }
        else {
            return `осторожно, ${name} рядом ${direction}`;
        }
    },
    
    // Вибрация с разными паттернами
    vibrate(objectType, intensity = 'normal') {
        const vibrationEnabled = UISettings ? UISettings.get('vibrationEnabled') : true;
        
        if (!vibrationEnabled || !navigator.vibrate) return;
        
        const patternData = this.vibrationPatterns[objectType] || this.vibrationPatterns.default;
        let pattern = patternData.pattern;
        let vibIntensity = patternData.intensity;
        
        
        if (typeof intensity !== 'string') {
            pattern = intensity;
        }
        
        try {
            navigator.vibrate(pattern);
            UICore.log(`📳 Вибрация: ${vibIntensity} (${objectType})`);
        } catch(e) {
            console.warn('Вибрация не поддерживается');
        }
    },
    
    checkAllObjects(detections) {
        const warnings = [];
        
        if (!detections || detections.length === 0) return warnings;
        
        detections.forEach(obj => {
            
            if (!Calibration.isCalibrated()) return;
            
            const distance = Calibration.estimateDistance(obj.bbox[2], obj.class);
            if (distance === null) return;
            
            const direction = Calibration.getDirection(
                obj.bbox[0], 
                obj.bbox[2], 
                window.Camera?.overlayCanvas?.width || 640
            );
            
            const warning = this.checkObject(obj, distance, direction);
            if (warning) {
                warnings.push(warning);
                
                this.vibrate(obj.class);
            }
        });
        
        return warnings;
    },
    
    
    updateThreshold(objectType, newThreshold) {
        this.dangerThresholds[objectType] = newThreshold;
        UICore.log(`⚠️ Порог опасности для ${objectType}: ${newThreshold} метров`);
    }
};

window.Safety = Safety;