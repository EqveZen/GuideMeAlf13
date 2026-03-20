const Speech = {
    settings: {
        volume: 1,
        rate: 0.85,        
        pitch: 1.2,        
        enabled: true
    },

    isSpeaking: false,
    lastSpokenText: '',
    lastSpokenTime: 0,
    preferredVoice: null,
    availableVoices: [],

    init() {
        console.log('🔊 Speech модуль загружен');
        
        if (!window.speechSynthesis) {
            UICore.log('❌ Синтез речи не поддерживается', 'error');
            return false;
        }
        
        this.loadVoices();
        return true;
    },

    loadVoices() {
        const loadVoicesList = () => {
            this.availableVoices = window.speechSynthesis.getVoices();
            
            this.preferredVoice = this.findBestFemaleVoice();
            
            if (this.preferredVoice) {
                UICore.log(`🎤 Выбран голос: ${this.preferredVoice.name}`);
            } else {
                UICore.log('🎤 Используется стандартный голос');
            }
        };
        
        if (window.speechSynthesis.getVoices().length) {
            loadVoicesList();
        } else {
            window.speechSynthesis.onvoiceschanged = loadVoicesList;
        }
    },

    findBestFemaleVoice() {
        const voices = this.availableVoices;
        
        const priorityList = [
            'Milena',            
            'Alena',            
            'Tatyana',          
            'Yulia',            
            'Samantha',         
            'Victoria',         
            'Google UK English 							Female',
            'Microsoft Zira'
        ];
        
        for (const name of priorityList) {
            const voice = voices.find(v => 
                v.name.includes(name) && 
                (v.lang.includes('ru') || v.lang.includes('RU'))
            );
            if (voice) return voice;
        }
        
        const russianFemale = voices.find(v => 
            v.lang.includes('ru') && 
            (v.name.toLowerCase().includes('female') || 
             v.name.toLowerCase().includes('женский'))
        );
        if (russianFemale) return russianFemale;
        
        const female = voices.find(v => 
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('victoria')
        );
        if (female) return female;
        
        const russian = voices.find(v => v.lang.includes('ru'));
        if (russian) return russian;
        
        return null;
    },

    speak(text, priority = false) {
        if (!this.settings.enabled) {
            return;
        }

        if (!window.speechSynthesis) {
            return;
        }

        // Не повторяем слишком часто можно изменить 
        const now = Date.now();
        if (text === this.lastSpokenText && now - this.lastSpokenTime < 3000) {
            return;
        }

        try {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);

            utterance.lang = 'ru-RU';
            utterance.volume = this.settings.volume;
            utterance.rate = 0.85;        
            utterance.pitch = 1.25;        
            if (text.includes(',')) {
              utterance.rate =0.8;      
            }
            
            if (text.includes('!')) {
             utterance.pitch = 1.3; 
            }
            
            if (text.includes('?')) {
            utterance.pitch = 1.35;     
             utterance.rate = 0.82;
            }
            
            if (this.preferredVoice) {
                utterance.voice = this.preferredVoice;
            }

            utterance.onstart = () => {
                this.isSpeaking = true;
                UICore.log(`🔊 ${text}`);
            };

            utterance.onend = () => {
                this.isSpeaking = false;
            };

            utterance.onerror = (e) => {
                console.warn('Ошибка речи:', e);
                this.isSpeaking = false;
            };

            window.speechSynthesis.speak(utterance);

            this.lastSpokenText = text;
            this.lastSpokenTime = now;

        } catch (error) {
            console.error('❌ Ошибка:', error);
        }
    },

    // Приветствие
    greet() {
        this.speak('Здравствуйте. Я, ЛИНА. Я буду вашим голосом и глазами. Я здесь, чтобы помочь вам видеть мир', true);
    },

    test() {
        this.speak('Привет. Я, ЛИНА, ваш голосовой помощник. Я говорю нежно, и спокойно, чтобы вам было приятно меня слушать');
    },

    warn(text) {
        // Предупреждения
        this.speak(`Осторожно, ${text}`, true);
    },

    stop() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
    },

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        UICore.log(`⚙️ Настройки голоса обновлены`);
    }
};

window.Speech = Speech;