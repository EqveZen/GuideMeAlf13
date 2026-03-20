const Calibration = {
    focalLength: null,
    
    objectSizes: {
        'person': 0.5,
        'car': 1.8,
        'truck': 2.5,
        'bus': 2.5,
        'motorcycle': 0.8,
        'bicycle': 0.6,
        'dog': 0.3,
        'cat': 0.2
    },
    
    init() {
        console.log('📏 Calibration загружен');
        
        const saved = localStorage.getItem('focalLength');
        if (saved) {
            this.focalLength = parseFloat(saved);
            UICore.log(`📏 Загружена калибровка: ${this.focalLength}`);
            UICore.updateCalibStatus(true);
        } else {
            UICore.updateCalibStatus(false);
        }
        return this;
    },
    
    calibrate(bboxWidth, objectType = 'person') {
        const realWidth = this.objectSizes[objectType] || 0.5;
        this.focalLength = (bboxWidth * 1) / realWidth;

        localStorage.setItem('focalLength', this.focalLength);

        UICore.updateCalibStatus(true);
        UICore.log(`📏 Калибровка завершена! Фокусное расстояние = ${Math.round(this.focalLength)}`);
        
        return this.focalLength;
    },
    
    estimateDistance(bboxWidth, objectType) {
        
        if (!this.focalLength) {
            return null;
        }
        
        const realWidth = this.objectSizes[objectType] || 0.5;
        
        if (!bboxWidth || bboxWidth === 0) return 999;
        
        const distance = (realWidth * this.focalLength) / bboxWidth;
        const rounded = Math.round(distance * 10) / 10;
        
        return rounded;
    },
    
    getDirection(bboxX, bboxWidth, frameWidth) {
        if (!frameWidth) return 'прямо';
        
        const center = frameWidth / 2;
        const objectCenter = bboxX + (bboxWidth / 2);
        const diff = objectCenter - center;
        const threshold = frameWidth * 0.15;
        
        if (Math.abs(diff) < threshold) return 'прямо';
        if (diff < 0) return 'слева';
        return 'справа';
    },
    
    formatMessage(objectType, distance, direction) {
        const name = Translations ? Translations.get(objectType) : objectType;
        
        if (distance === null) {
            return name;
        }
        
        if (distance < 1.5) {
            return `${name} очень близко ${direction}`;
        } else if (distance < 3) {
            return `${name} в ${distance} метрах ${direction}`;
        } else {
            return `${name} ${direction}`;
        }
    },

    isCalibrated() {
        return this.focalLength !== null;
    }
};

window.Calibration = Calibration;