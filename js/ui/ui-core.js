const UICore = {
    elements: {},
    
    init() {
        console.log('🎨 UI Core загружен');
        this.cacheElements();
        return this;
    },
    
    cacheElements() {
        const ids = [
            'video', 'overlay', 'status', 'log', 'modelStatus', 'fps', 'calibStatus',
            'startBtn', 'stopBtn', 'describeBtn', 'calibrateBtn', 'testVoiceBtn',
            'settingsBtn', 'closeSettingsBtn', 'settingsPanel',
            'volume', 'frequency', 'confidence', 'dangerThreshold', 'soundEnabled', 'vibrationEnabled'
        ];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    },

updateAudioProgress(percent) {
    if (this.elements.audioStatus) {
        if (percent === 100) {
            this.elements.audioStatus.textContent = '✅ готова';
            this.elements.audioStatus.style.color = '#4CAF50';
        } else {
            this.elements.audioStatus.textContent = `🎵 ${percent}%`;
            this.elements.audioStatus.style.color = '#FFC107';
        }
    }
},
    
    updateStatus(text) {
        if (this.elements.status) {
            this.elements.status.textContent = text;
        }
        this.log(`📋 Статус: ${text}`);
    },
    
    updateModelStatus(isLoaded) {
        if (!this.elements.modelStatus) return;
        
        if (isLoaded) {
            this.elements.modelStatus.textContent = '✅ готова';
            this.elements.modelStatus.style.color = '#4CAF50';
        } else {
            this.elements.modelStatus.textContent = '❌ ошибка';
            this.elements.modelStatus.style.color = '#F44336';
        }
    },
    
    updateCalibStatus(isCalibrated) {
        if (!this.elements.calibStatus) {
            console.warn('Элемент calibStatus не найден');
            return;
        }
        
        if (isCalibrated) {
            this.elements.calibStatus.textContent = '✅ выполнена';
            this.elements.calibStatus.style.color = '#4CAF50';
            this.log('Статус калибровки: выполнена');
        } else {
            this.elements.calibStatus.textContent = '❌ не выполнена';
            this.elements.calibStatus.style.color = '#F44336';
            this.log('Статус калибровки: не выполнена');
        }
    },
    
    updateFPS(fps) {
        if (this.elements.fps) {
            this.elements.fps.textContent = fps;
        }
    },
    
    log(message, type = 'info') {
        const logElement = this.elements.log;
        if (!logElement) {
            console.log('LOG:', message);
            return;
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const time = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let color = '#4CAF50';
        let prefix = '📌';
        
        if (type === 'error' || message.includes('❌')) {
            color = '#F44336';
            prefix = '❌';
        } else if (type === 'warning' || message.includes('⚠️')) {
            color = '#FFC107';
            prefix = '⚠️';
        } else if (message.includes('✅')) {
            color = '#4CAF50';
            prefix = '✅';
        } else if (message.includes('📏')) {
            color = '#2196F3';
            prefix = '📏';
        } else if (message.includes('🔊')) {
            color = '#4CAF50';
            prefix = '🔊';
        } else if (message.includes('📷')) {
            color = '#2196F3';
            prefix = '📷';
        }
        
        logEntry.innerHTML = `<span style="color: #888">[${time}]</span> <span style="color: ${color}">${prefix} ${message}</span>`;
        logElement.insertBefore(logEntry, logElement.firstChild);
        
        while (logElement.children.length > 20) {
            logElement.removeChild(logElement.lastChild);
        }
        
        console.log(`[${time}] ${message}`);
    },
    
    clearLog() {
        if (this.elements.log) {
            this.elements.log.innerHTML = '';
            this.log('Журнал очищен');
        }
    }
};

window.UICore = UICore;