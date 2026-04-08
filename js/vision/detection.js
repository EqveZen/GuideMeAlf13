// detection.js — распознавание объектов через COCO-SSD
const Detection = {
    model: null,
    modelLoaded: false,
    confidence: 0.4,
    videoWidth: 640,
    videoHeight: 480,

    async init() {
        console.log('🔍 Detection: загрузка модели COCO-SSD...');
        try {
            this.model = await cocoSsd.load({
                base: 'mobilenet_v2'
            });
            this.modelLoaded = true;
            console.log('✅ Модель COCO-SSD загружена');
            if (UICore) {
                UICore.updateModelStatus(true);
                UICore.log('✅ Модель распознавания готова');
            }
            return true;
        } catch (error) {
            console.error('❌ Ошибка загрузки модели:', error);
            this.modelLoaded = false;
            if (UICore) {
                UICore.updateModelStatus(false);
                UICore.log('❌ Ошибка загрузки модели: ' + error.message, 'error');
            }
            return false;
        }
    },

    async detect(videoElement) {
        if (!this.modelLoaded || !this.model) return [];
        if (!videoElement || videoElement.readyState < 2) return [];
        try {
            if (videoElement.videoWidth) {
                this.videoWidth = videoElement.videoWidth;
                this.videoHeight = videoElement.videoHeight;
            }
            const predictions = await this.model.detect(videoElement);
            const filtered = predictions.filter(p => p.score >= this.confidence);
            return filtered.map(p => ({
                class: p.class,
                score: p.score,
                bbox: p.bbox
            }));
        } catch (error) {
            console.warn('Ошибка распознавания:', error);
            return [];
        }
    },

    drawBoxes(ctx, detections) {
        if (!ctx || !detections || detections.length === 0) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        detections.forEach(det => {
            const [x, y, width, height] = det.bbox;
            let color = '#4CAF50';
            if (det.class === 'person') color = '#2196F3';
            else if (['car', 'truck', 'bus', 'motorcycle'].includes(det.class)) color = '#F44336';
            else if (['dog', 'cat'].includes(det.class)) color = '#FF9800';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = color;
            ctx.font = '14px Arial';
            const text = `${det.class} ${Math.round(det.score * 100)}%`;
            const textWidth = ctx.measureText(text).width;
            ctx.fillRect(x, y - 20, textWidth + 8, 20);
            ctx.fillStyle = '#fff';
            ctx.fillText(text, x + 4, y - 6);
        });
    },

    updateSettings(settings) {
        if (settings.confidence !== undefined) this.confidence = settings.confidence;
    },

    isReady() { return this.modelLoaded && this.model !== null; }
};
window.Detection = Detection;