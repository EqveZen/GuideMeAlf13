const Detection = {
    model: null,
    settings: {
        confidence: 0.4
    },
    isModelLoaded: false,
    lastDetections: [],

    async init() {
        
        this.log('Detection: начинаю загрузку модели...');
        
        try {
            
            this.log('Проверка TensorFlow...');
            if (typeof tf === 'undefined') {
                this.log('TensorFlow не загружен!', 'error');
                return false;
            }
            this.log('TensorFlow загружен');

            
            this.log('Проверка COCO-SSD...');
            if (typeof cocoSsd === 'undefined') {
                this.log('❌ COCO-SSD не загружен!', 'error');
                return false;
            }
            this.log('COCO-SSD загружен');

            
            this.log('Загрузка модели COCO-SSD... (это может занять 20-30 секунд)');
            
            const startTime = Date.now();
            this.model = await cocoSsd.load();
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(1);
            
            if (this.model) {
                this.isModelLoaded = true;
                this.log(`✅ Модель успешно загружена за ${loadTime} секунд!`);
                this.log('Жду запуска камеры!');
                
                const modelStatus = document.getElementById('modelStatus');
                if (modelStatus) {
                    modelStatus.textContent = '✅ готова';
                    modelStatus.style.color = '#4CAF50';
                }
                
                return true;
            } else {
                this.log('❌ Модель не загрузилась', 'error');
                return false;
            }

        } catch (error) {
            this.log(`❌ Ошибка: ${error.message}`, 'error');
            return false;
        }
    },

    log(message, type = 'info') {
        
        if (window.UICore && UICore.log) {
            UICore.log(message, type);
        } else {
            
            const logElement = document.getElementById('log');
            if (logElement) {
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry';
                
                const time = new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                let color = '#4CAF50';
                if (type === 'error') color = '#F44336';
                if (message.includes('✅')) color = '#4CAF50';
                if (message.includes('⏳')) color = '#FFC107';
                
                logEntry.innerHTML = `<span style="color: #888">[${time}]</span> <span style="color: ${color}">${message}</span>`;
                logElement.insertBefore(logEntry, logElement.firstChild);
            }
        }
        
        console.log(message);
    },

    async detect(videoElement) {
        if (!this.isModelLoaded || !videoElement) {
            return [];
        }

        try {
            const predictions = await this.model.detect(videoElement);
            
            const filtered = predictions.filter(p => p.score >= this.settings.confidence);
            
            this.lastDetections = filtered;
            
            
            if (filtered.length > 0 && document.getElementById('status')) {
                const status = document.getElementById('status');
                const names = filtered.map(d => `${d.class} (${Math.round(d.score*100)}%)`).join(', ');
                status.textContent = '🔍 ' + names;
            }
            
            return filtered;

        } catch (error) {
            this.log(`⚠️ Ошибка при распознавании: ${error.message}`, 'warning');
            return [];
        }
    },

    drawDetections(ctx, detections) {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        detections.forEach(pred => {
            const [x, y, width, height] = pred.bbox;
            
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            ctx.fillStyle = '#4CAF50';
            ctx.font = 'bold 16px Arial';
            const text = `${pred.class} ${Math.round(pred.score * 100)}%`;
            const textWidth = ctx.measureText(text).width;
            
            ctx.fillRect(x, y - 25, textWidth + 10, 25);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(text, x + 5, y - 7);
        });
    }
};

window.Detection = Detection;