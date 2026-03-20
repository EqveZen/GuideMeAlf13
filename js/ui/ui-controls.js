const UIControls = {
    elements: {},
    callbacks: {
        onStart: null,
        onStop: null,
        onDescribe: null,
        onCalibrate: null,
        onTestVoice: null,
        onSettings: null,
        onCloseSettings: null
    },
    
    init() {
        console.log('🎮 UI Controls загружен');
        this.cacheElements();
        this.setupEventListeners();
        return this;
    },
    
    cacheElements() {
        const ids = [
            'startBtn', 'stopBtn', 'describeBtn', 'calibrateBtn',
            'testVoiceBtn', 'settingsBtn', 'closeSettingsBtn'
        ];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
            if (!this.elements[id]) {
                console.warn(`⚠️ Кнопка ${id} не найдена`);
            }
        });
        
        // Логируем результат
        const found = Object.keys(this.elements).filter(key => this.elements[key]).length;
        UICore.log(`🎮 Найдено кнопок: ${found}/${ids.length}`);
    },
    
    setupEventListeners() {
        // Назначаем обработчики
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Запустить камеру"');
                if (this.callbacks.onStart) this.callbacks.onStart();
            });
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Остановить"');
                if (this.callbacks.onStop) this.callbacks.onStop();
            });
        }
        
        if (this.elements.describeBtn) {
            this.elements.describeBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Опиши сцену"');
                if (this.callbacks.onDescribe) this.callbacks.onDescribe();
            });
        }
        
        if (this.elements.calibrateBtn) {
            this.elements.calibrateBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Калибровка"');
                if (this.callbacks.onCalibrate) this.callbacks.onCalibrate();
            });
        }
        
        if (this.elements.testVoiceBtn) {
            this.elements.testVoiceBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Тест голоса"');
                if (this.callbacks.onTestVoice) this.callbacks.onTestVoice();
            });
        }
        
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Настройки"');
                if (this.callbacks.onSettings) this.callbacks.onSettings();
            });
        }
        
        if (this.elements.closeSettingsBtn) {
            this.elements.closeSettingsBtn.addEventListener('click', () => {
                UICore.log('👆 Нажата кнопка "Закрыть настройки"');
                if (this.callbacks.onCloseSettings) this.callbacks.onCloseSettings();
            });
        }
    },
    
    
    onStart(callback) {
        this.callbacks.onStart = callback;
    },
    
    onStop(callback) {
        this.callbacks.onStop = callback;
    },
    
    onDescribe(callback) {
        this.callbacks.onDescribe = callback;
    },
    
    onCalibrate(callback) {
        this.callbacks.onCalibrate = callback;
    },
    
    onTestVoice(callback) {
        this.callbacks.onTestVoice = callback;
    },
    
    onSettings(callback) {
        this.callbacks.onSettings = callback;
    },
    
    onCloseSettings(callback) {
        this.callbacks.onCloseSettings = callback;
    },
    
    
    setButtonsState(isCameraRunning) {
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = isCameraRunning;
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !isCameraRunning;
        }
        
        if (this.elements.describeBtn) {
            this.elements.describeBtn.disabled = !isCameraRunning;
        }
        
        if (this.elements.calibrateBtn) {
            this.elements.calibrateBtn.disabled = !isCameraRunning;
        }
        
        
        UICore.log(`Состояние кнопок: ${isCameraRunning ? 'камера включена' : 'камера выключена'}`);
    },
    
    enableButton(buttonId) {
        if (this.elements[buttonId]) {
            this.elements[buttonId].disabled = false;
        }
    },
    
    disableButton(buttonId) {
        if (this.elements[buttonId]) {
            this.elements[buttonId].disabled = true;
        }
    }
};

window.UIControls = UIControls;