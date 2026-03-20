const GuideMe = {
    detectionInterval: null,
    lastSpokenTime: 0,
    lastSpokenText: '',
    sceneMemory: {
        objects: {},
        lastSpokenTime: 0,
        lastChangeTime: 0,
        lastPriorityTime: 0
    },

    async init() {
        console.log('🚀 GuideMe: запуск...');
        
        UICore.init();
        UICore.log('🚀 GuideMe инициализация...');
        
        UIControls.init();
        UISettings.init();
        
        Camera.init('video', 'overlay');
        Speech.init();
        Translations.init();
        Calibration.init();  
        Safety.init();       
        ObjectTracker.init();
        
        const modelLoaded = await Detection.init();
        
        if (modelLoaded) {
            UICore.log('✅ Модель загружена');
            UICore.updateModelStatus(true);
        } else {
            UICore.log('❌ Ошибка загрузки модели', 'error');
            UICore.updateModelStatus(false);
        }
        
        this.setupCallbacks();
        
        const isCalibrated = Calibration.isCalibrated();
        UICore.updateCalibStatus(isCalibrated);
        
        UICore.log('GuideMe полностью готов!');
        UICore.updateStatus('✅ Готов к работе');
        
        setTimeout(() => {
            Speech.speak('GuideMe готов к работе. Нажмите кнопку запуска камеры.');
        }, 1500);
    },
    
    setupCallbacks() {
        UIControls.onStart(() => this.startCamera());
        UIControls.onStop(() => this.stopCamera());
        UIControls.onTestVoice(() => Speech.test());
        UIControls.onDescribe(() => {
            if (!Camera.isRunning()) {
                Speech.speak('Сначала включите камеру');
                return;
            }
            this.describeScene();
        });
        UIControls.onCalibrate(() => this.calibrateCamera());
        UIControls.onSettings(() => UISettings.togglePanel());
        UIControls.onCloseSettings(() => UISettings.togglePanel());
        
        UICore.log('Все обработчики кнопок настроены');
    },
    
    async startCamera() {
        try {
            UICore.log('Запуск камеры...');
            
            await Camera.start();
            UIControls.setButtonsState(true);
            UICore.updateStatus('Камера работает');
            
            Speech.speak('Камера запущена');
            
            if (Detection.isModelLoaded) {
                this.startDetection();
            }
            
        } catch (error) {
            UICore.log(`❌ Ошибка камеры: ${error.message}`, 'error');
        }
    },
    
    stopCamera() {
        Camera.stop();
        UIControls.setButtonsState(false);
        UICore.updateStatus('⏸ Камера остановлена');
        this.stopDetection();
        Speech.speak('Камера остановлена');
    },
    
    startDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        this.detectionInterval = setInterval(async () => {
            if (!Camera.isRunning() || !Detection.isModelLoaded) return;
            
            const detections = await Detection.detect(Camera.videoElement);
            
            Detection.drawDetections(Camera.ctx, detections);
            ObjectTracker.update(detections);
            this.updateStatus(detections);
            
            // ===== РЕЖИМ БЕЗОПАСНОСТИ =====
            const warnings = Safety.checkAllObjects(detections);
            warnings.forEach(warning => {
                Speech.speak(warning, true);
                UICore.log(`⚠️ ${warning}`);
            });
            
            this.analyzeScene(detections);
            
        }, 500);
        
        UICore.log('Детекция запущена');
    },
    
    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        if (Camera.ctx) {
            Camera.ctx.clearRect(0, 0, Camera.overlayCanvas.width, Camera.overlayCanvas.height);
        }
        
        ObjectTracker.reset();
    },
    
    updateStatus(detections) {
        if (detections.length === 0) {
            UICore.updateStatus('Ничего не вижу');
            return;
        }
        
        const names = detections.map(d => 
            `${Translations.get(d.class)} (${Math.round(d.score * 100)}%)`
        ).join(', ');
        
        UICore.updateStatus('🔍 ' + names);
    },
    
    analyzeScene(detections) {
        const now = Date.now();
        const frequency = UISettings.get('frequency') * 1000;
        
        if (now - this.sceneMemory.lastSpokenTime > frequency) {
            if (detections.length > 0) {
                const groups = Helpers.groupDetections(detections);
                const description = Helpers.createDescription(groups);
                
                if (description !== this.lastSpokenText || now - this.lastSpokenTime > 10000) {
                    Speech.speak(description);
                    this.lastSpokenText = description;
                    this.lastSpokenTime = now;
                    this.sceneMemory.lastSpokenTime = now;
                }
            } else {
                if (now - this.sceneMemory.lastSpokenTime > 15000) {
                    Speech.speak('Ничего не вижу');
                    this.sceneMemory.lastSpokenTime = now;
                }
            }
        }
    },
    
    async describeScene() {
        if (!Camera.isRunning() || !Detection.isModelLoaded) return;
        
        Speech.speak('Осматриваюсь...');
        
        setTimeout(async () => {
            const detections = await Detection.detect(Camera.videoElement);
            
            if (detections.length === 0) {
                Speech.speak('Ничего не вижу');
                return;
            }
            
            const groups = Helpers.groupDetections(detections);
            const description = Helpers.createDescription(groups);
            Speech.speak(description, true);
            
        }, 500);
    },
    
    async calibrateCamera() {
        if (!Camera.isRunning()) {
            Speech.speak('Сначала включите камеру');
            UICore.log('❌ Калибровка: камера не запущена', 'warning');
            return;
        }
        
        Speech.speak('Встаньте на расстояние один метр от камеры');
        UICore.log('Калибровка: ищу человека в кадре...');
        
        setTimeout(async () => {
            const detections = await Detection.detect(Camera.videoElement);
            const person = detections.find(d => d.class === 'person');
            
            if (person) {
                const bboxWidth = person.bbox[2];
                const focalLength = Calibration.calibrate(bboxWidth, 'person');
                
                Speech.speak('Калибровка завершена');
                UICore.log(`✅ Калибровка завершена! Фокусное расстояние = ${Math.round(focalLength)}`);
                
                
            } else {
                Speech.speak('Не вижу человека. Встаньте в кадр полностью');
                UICore.log('❌ Калибровка: человек не найден в кадре', 'error');
            }
        }, 3000);
    }
};

window.addEventListener('load', () => {
    GuideMe.init();
});