const Camera = {
    videoElement: null,
    overlayCanvas: null,
    ctx: null,
    stream: null,
    isActive: false,

    init(videoId, overlayId) {
        console.log('📷 Camera: инициализация...');
        
        
        this.videoElement = document.getElementById(videoId);
        this.overlayCanvas = document.getElementById(overlayId);
        
        
        if (!this.videoElement) {
            console.error('❌ Camera: видео элемент не найден');
            return false;
        }
        
        if (!this.overlayCanvas) {
            console.error('❌ Camera: canvas элемент не найден');
            return false;
        }
        
        // Получаем контекст canvas
        this.ctx = this.overlayCanvas.getContext('2d');
        
        console.log('Camera: инициализация завершена');
        return true;
    },

    async start() {
        console.log('Camera: запрос доступа...');
        
        try {

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Camera: доступ получен');
            
            
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                console.log('Camera: поток подключен');
            } else {
                throw new Error('videoElement не найден');
            }
            
            
            await new Promise((resolve, reject) => {
                if (!this.videoElement) {
                    reject(new Error('videoElement не найден'));
                    return;
                }
                
                this.videoElement.onloadedmetadata = () => {

                    if (this.overlayCanvas) {
                        this.overlayCanvas.width = this.videoElement.videoWidth;
                        this.overlayCanvas.height = this.videoElement.videoHeight;
                        console.log(`Camera: размер видео ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
                    }
                    resolve();
                };
                 
                setTimeout(() => reject(new Error('Таймаут загрузки видео')), 5000);
            });
            
            await this.videoElement.play();
            
            this.isActive = true;
            console.log('Camera: запущена');
            return true;
            
        } catch (error) {
            console.error('❌ Camera ошибка:', error);
            throw error;
        }
    },

    stop() {
        console.log('Camera: остановка...');
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log(`Трек ${track.kind} остановлен`);
            });
            this.stream = null;
        }
        
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        
        if (this.ctx && this.overlayCanvas) {
            this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }
        
        this.isActive = false;
        console.log('Camera: остановлена');
    },

    isRunning() {
        return this.isActive && 
               this.videoElement && 
               this.videoElement.readyState >= 2;
    }
};

window.Camera = Camera;