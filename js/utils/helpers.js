const Helpers = {
    formatTime(date = new Date()) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    groupDetections(predictions) {
        const groups = {};
        predictions.forEach(p => {
            const className = p.class;
            if (!groups[className]) {
                groups[className] = {
                    count: 1,
                    maxScore: p.score,
                    instances: [p]
                };
            } else {
                groups[className].count++;
                groups[className].maxScore = Math.max(groups[className].maxScore, p.score);
                groups[className].instances.push(p);
            }
        });
        return groups;
    },
    

    createDescription(groups) {
        const parts = [];
        for (const [className, data] of Object.entries(groups)) {
            const rusName = Translations ? Translations.get(className) : className;
            if (data.count > 1) {
                parts.push(`${data.count} ${rusName}`);
            } else {
                parts.push(rusName);
            }
        }
        return parts.join(', ');
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
    
    saveSettings(settings) {
        try {
            localStorage.setItem('guideMe_settings', JSON.stringify(settings));
            return true;
        } catch (e) {
            return false;
        }
    },
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('guideMe_settings');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    
    // Проверка на мобильное устройство
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Проверка на iOS
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
};

window.Helpers = Helpers;