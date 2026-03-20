const Utils = {
    // Сохранение настроек
    saveSettings(settings) {
        try {
            localStorage.setItem('guideMe_settings', JSON.stringify(settings));
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить настройки');
            return false;
        }
    },
    
    // Загрузка настроек
    loadSettings() {
        try {
            const saved = localStorage.getItem('guideMe_settings');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    
    // Проверка поддержки браузера
    checkBrowserSupport() {
        const issues = [];
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            issues.push('Камера не поддерживается');
        }
        
        if (!window.speechSynthesis) {
            issues.push('Синтез речи не поддерживается');
        }
        
        return {
            supported: issues.length === 0,
            issues: issues
        };
    },
    
    // Форматирование времени
    formatTime(date = new Date()) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    // Группировка объектов
    groupObjects(detections) {
        const groups = {};
        detections.forEach(d => {
            const name = d.class;
            groups[name] = (groups[name] || 0) + 1;
        });
        return groups;
    }
};

window.Utils = Utils;