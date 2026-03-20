
const UISettings = {
    elements: {},
    panelVisible: false,
    
    init() {
        console.log('UI Settings загружен');
        this.cacheElements();
        this.loadFromStorage();
        this.setupListeners();
        return this;
    },
    
    cacheElements() {
        const ids = [
            'settingsPanel', 'volume', 'frequency', 'confidence',
            'dangerThreshold', 'soundEnabled', 'vibrationEnabled'
        ];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    },
    
    loadFromStorage() {
        const saved = Helpers.loadSettings();
        if (saved) {
            if (this.elements.volume) this.elements.volume.value = saved.volume || 1;
            if (this.elements.frequency) this.elements.frequency.value = saved.frequency || 5;
            if (this.elements.confidence) this.elements.confidence.value = saved.confidence || 0.4;
            if (this.elements.dangerThreshold) this.elements.dangerThreshold.value = saved.dangerThreshold || 1.5;
            if (this.elements.soundEnabled) this.elements.soundEnabled.checked = saved.soundEnabled !== false;
            if (this.elements.vibrationEnabled) this.elements.vibrationEnabled.checked = saved.vibrationEnabled !== false;
        }
    },
    
    saveToStorage() {
        const settings = {
            volume: this.elements.volume ? parseFloat(this.elements.volume.value) : 1,
            frequency: this.elements.frequency ? parseInt(this.elements.frequency.value) : 5,
            confidence: this.elements.confidence ? parseFloat(this.elements.confidence.value) : 0.4,
            dangerThreshold: this.elements.dangerThreshold ? parseFloat(this.elements.dangerThreshold.value) : 1.5,
            soundEnabled: this.elements.soundEnabled ? this.elements.soundEnabled.checked : true,
            vibrationEnabled: this.elements.vibrationEnabled ? this.elements.vibrationEnabled.checked : true
        };
        
        Helpers.saveSettings(settings);
        
        // Применяем настройки
        if (window.Speech) {
            Speech.updateSettings({ 
                volume: settings.volume,
                enabled: settings.soundEnabled
            });
        }
        
        if (window.Detection) {
            Detection.updateSettings({ confidence: settings.confidence });
        }
        
        UICore.log('Настройки сохранены');
    },
    
    setupListeners() {
        if (this.elements.volume) {
            this.elements.volume.addEventListener('input', () => this.saveToStorage());
        }
        
        if (this.elements.frequency) {
            this.elements.frequency.addEventListener('input', () => this.saveToStorage());
        }
        
        if (this.elements.confidence) {
            this.elements.confidence.addEventListener('input', () => this.saveToStorage());
        }
        
        if (this.elements.dangerThreshold) {
            this.elements.dangerThreshold.addEventListener('input', () => this.saveToStorage());
        }
        
        if (this.elements.soundEnabled) {
            this.elements.soundEnabled.addEventListener('change', () => this.saveToStorage());
        }
        
        if (this.elements.vibrationEnabled) {
            this.elements.vibrationEnabled.addEventListener('change', () => this.saveToStorage());
        }
    },
    
    togglePanel() {
        if (this.elements.settingsPanel) {
            this.panelVisible = !this.panelVisible;
            this.elements.settingsPanel.classList.toggle('hidden');
            UICore.log(`Панель настроек ${this.panelVisible ? 'открыта' : 'закрыта'}`);
        }
    },
    
    get(key) {
        const saved = Helpers.loadSettings();
        if (saved && saved[key] !== undefined) {
            return saved[key];
        }
        return Constants.DEFAULTS[key];
    }
};

window.UISettings = UISettings;