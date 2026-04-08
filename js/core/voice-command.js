// ============================================
// voice-command.js — GuideMe 1.8 (расширенные команды)
// ============================================

const VoiceCommand = {
    recognition: null,
    isListening: false,
    isInitialized: false,

    async init() {
        console.log('🎤 VoiceCommand 1.8 загружен');

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Распознавание речи не поддерживается');
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ Микрофон разрешён');
        } catch (e) {
            console.warn('❌ Нет доступа к микрофону:', e);
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ru-RU';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event) => {
            const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log('🎤 Распознано:', text);

            if (text.includes('лина')) {
                if (navigator.vibrate) navigator.vibrate(100);
                if (window.Speech) Speech.speak('activemic');

                const command = text.replace('лина', '').trim();
                this.processCommand(command);
            }
        };

        this.recognition.onerror = (e) => console.warn('Ошибка распознавания:', e.error);
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.isInitialized) {
                setTimeout(() => this.start(), 500);
            }
        };

        this.isInitialized = true;
        this.start();
        if (window.UICore) UICore.log('🎤 Голосовые команды 1.8 активны. Скажите "Лина"', 'success');
        return true;
    },

    start() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
                console.log('🎤 Слушаю...');
            } catch (e) {
                console.warn('Ошибка старта:', e);
            }
        }
    },

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    },

    processCommand(command) {
        if (!command) return;
        console.log('Команда:', command);

        // --- Существующие команды ---
        if (command.includes('что видишь') || command.includes('описание')) {
            if (window.GuideMe && GuideMe.describeScene) GuideMe.describeScene();
        }
        else if (command.includes('калибровка')) {
            if (window.GuideMe && GuideMe.calibrate) GuideMe.calibrate();
        }
        else if (command.includes('стоп') || command.includes('останови')) {
            if (window.GuideMe && GuideMe.stopCamera) GuideMe.stopCamera();
        }
        else if (command.includes('старт') || command.includes('запусти')) {
            if (window.GuideMe && GuideMe.startCamera) GuideMe.startCamera();
        }
        else if (command.includes('помощь')) {
            this.sayHelp();
        }
        
        // --- Управление громкостью (числовое) ---
        else if (command.includes('громкость')) {
            const match = command.match(/(\d+)(?:\s*процент)?/);
            if (match) {
                let val = parseInt(match[1]) / 100;
                val = Math.min(1, Math.max(0, val));
                this.setVolume(val);
            } else if (command.includes('громче')) {
                this.adjustVolume(+0.1);
            } else if (command.includes('тише')) {
                this.adjustVolume(-0.1);
            } else {
                Speech.speak('скажите громкость в процентах');
            }
        }
        
        // --- Частота подсказок ---
        else if (command.includes('частота') || command.includes('интервал')) {
            const match = command.match(/(\d+)(?:\s*секунд?)?/);
            if (match) {
                let freq = parseInt(match[1]);
                freq = Math.min(10, Math.max(3, freq));
                this.setFrequency(freq);
            } else {
                Speech.speak('скажите интервал от 3 до 10 секунд');
            }
        }
        
        // --- Уверенность распознавания ---
        else if (command.includes('уверенность')) {
            const match = command.match(/(0?\.\d+|\d+)/);
            if (match) {
                let conf = parseFloat(match[1]);
                if (conf >= 1) conf = conf / 100;
                conf = Math.min(0.9, Math.max(0.3, conf));
                this.setConfidence(conf);
            } else {
                Speech.speak('скажите уверенность от 0.3 до 0.9');
            }
        }
        
        // --- Порог опасности ---
        else if (command.includes('опасность') || command.includes('порог')) {
            const match = command.match(/(\d+(?:\.\d+)?)(?:\s*метр)?/);
            if (match) {
                let danger = parseFloat(match[1]);
                danger = Math.min(3, Math.max(0.5, danger));
                this.setDangerThreshold(danger);
            } else {
                Speech.speak('скажите порог в метрах, от 0.5 до 3');
            }
        }
        
        // --- Звук вкл/выкл ---
        else if (command.includes('тихий режим') || (command.includes('звук') && command.includes('выключить'))) {
            this.setSoundEnabled(false);
        }
        else if ((command.includes('звук') && command.includes('включить'))) {
            this.setSoundEnabled(true);
        }
        
        // --- Вибрация вкл/выкл ---
        else if (command.includes('вибрация') && command.includes('выключить')) {
            this.setVibrationEnabled(false);
        }
        else if (command.includes('вибрация') && command.includes('включить')) {
            this.setVibrationEnabled(true);
        }
        
        // --- Статус настроек ---
        else if (command.includes('статус') || command.includes('что настроено')) {
            this.sayStatus();
        }
        
        // --- Остановка речи ---
        else if (command.includes('замолчи') || command.includes('стоп аудио')) {
            if (window.Speech) Speech.clearQueue();
            Speech.speak('речь остановлена');
        }
        
        else {
            Speech.speak('команда не распознана');
        }
    },

    // Вспомогательные функции для изменения настроек
    setVolume(value) {
        const volumeInput = document.getElementById('volume');
        if (volumeInput) {
            volumeInput.value = value;
            volumeInput.dispatchEvent(new Event('input'));
            Speech.speak(`громкость ${Math.round(value * 100)} процентов`);
        }
    },

    adjustVolume(delta) {
        const volumeInput = document.getElementById('volume');
        if (volumeInput) {
            let newVal = parseFloat(volumeInput.value) + delta;
            newVal = Math.min(1, Math.max(0, newVal));
            this.setVolume(newVal);
        }
    },

    setFrequency(seconds) {
        const freqInput = document.getElementById('frequency');
        if (freqInput) {
            freqInput.value = seconds;
            freqInput.dispatchEvent(new Event('input'));
            Speech.speak(`частота подсказок ${seconds} секунд`);
        }
    },

    setConfidence(value) {
        const confInput = document.getElementById('confidence');
        if (confInput) {
            confInput.value = value;
            confInput.dispatchEvent(new Event('input'));
            Speech.speak(`уверенность ${value}`);
        }
    },

    setDangerThreshold(value) {
        const dangerInput = document.getElementById('dangerThreshold');
        if (dangerInput) {
            dangerInput.value = value;
            dangerInput.dispatchEvent(new Event('input'));
            Speech.speak(`порог опасности ${value} метров`);
        }
    },

    setSoundEnabled(enabled) {
        const soundCheckbox = document.getElementById('soundEnabled');
        if (soundCheckbox) {
            soundCheckbox.checked = enabled;
            soundCheckbox.dispatchEvent(new Event('change'));
            Speech.speak(enabled ? 'звук включён' : 'звук выключен');
        }
    },

    setVibrationEnabled(enabled) {
        const vibroCheckbox = document.getElementById('vibrationEnabled');
        if (vibroCheckbox) {
            vibroCheckbox.checked = enabled;
            vibroCheckbox.dispatchEvent(new Event('change'));
            Speech.speak(enabled ? 'вибрация включена' : 'вибрация выключена');
        }
    },

    sayStatus() {
        const volume = document.getElementById('volume')?.value || 1;
        const frequency = document.getElementById('frequency')?.value || 5;
        const confidence = document.getElementById('confidence')?.value || 0.4;
        const danger = document.getElementById('dangerThreshold')?.value || 1.5;
        const sound = document.getElementById('soundEnabled')?.checked ? 'включён' : 'выключен';
        const vibration = document.getElementById('vibrationEnabled')?.checked ? 'включена' : 'выключена';
        
        const statusText = `громкость ${Math.round(volume*100)} процентов, частота ${frequency} секунд, уверенность ${confidence}, порог опасности ${danger} метров, звук ${sound}, вибрация ${vibration}`;
        Speech.speak(statusText);
    },

    sayHelp() {
        const helpText = 'доступные команды: что видишь, калибровка, стоп, старт, громкость 50, частота 3, уверенность 0.5, опасность 1 метр, тихий режим, вибрация выключить, статус, замолчи, помощь';
        Speech.speak(helpText);
        if (window.UICore) UICore.log(`Команды: ${helpText}`);
    }
};

window.VoiceCommand = VoiceCommand;