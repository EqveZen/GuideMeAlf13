const Speech = {
    settings: {
        volume: 1,
        enabled: true
    },
    
    audioCache: {},
    isPlaying: false,
    audioQueue: [],
    isLoaded: false,
    loadingProgress: 0,
    totalFiles: 0,
    loadedFiles: 0,
    missingFiles: [],
    processedFiles: new Set(),
    firstSpeakAllowed: false,  // флаг разрешения первого звука
    
    init() {
        console.log('🔊 Speech module загружен');
        this.loadAudioFiles();
        return true;
    },
    
    loadAudioFiles() {
        // ТОЛЬКО РЕАЛЬНО СУЩЕСТВУЮЩИЕ ФАЙЛЫ (настройте под вашу папку audio/)
        const audioFiles = [
            'я_готова',
            'человек', 'машина', 'грузовик', 'автобус',
            'собака',
            'слева', 'справа', 'прямо',
            'в_метре', 'в_двух_метрах',
            'очень_близко', 'вплотную',
            'камера_запущена', 'камера_остановлена',
            'встаньте_на_метр', 'не_вижу_человека',
            'осматриваюсь', 'ничего_не_вижу',
            'человек_очень_близко', 'activemic'
        ];
        
        this.totalFiles = audioFiles.length;
        this.loadedFiles = 0;
        this.loadingProgress = 0;
        this.missingFiles = [];
        this.processedFiles.clear();
        
        if (UICore && UICore.log) {
            UICore.log(`📦 Загрузка ${this.totalFiles} аудио файлов...`);
        }
        this.updateProgress(0);
        
        audioFiles.forEach(name => {
            const audio = new Audio(`audio/${name}.mp3`);
            audio.preload = 'auto';
            
            let processed = false;
            let timeout = setTimeout(() => {
                if (!processed) {
                    processed = true;
                    this.handleFileError(name);
                }
            }, 5000);
            
            audio.addEventListener('canplaythrough', () => {
                if (!processed) {
                    clearTimeout(timeout);
                    processed = true;
                    this.handleFileSuccess(name);
                }
            });
            
            audio.addEventListener('error', () => {
                if (!processed) {
                    clearTimeout(timeout);
                    processed = true;
                    this.handleFileError(name);
                }
            });
            
            this.audioCache[name] = audio;
        });
    },
    
    handleFileSuccess(name) {
        if (this.processedFiles.has(name)) return;
        this.processedFiles.add(name);
        
        this.loadedFiles++;
        let percent = Math.min(Math.floor((this.loadedFiles / this.totalFiles) * 100), 100);
        this.loadingProgress = percent;
        this.updateProgress(percent);
        
        if (this.loadedFiles === this.totalFiles) {
            this.onAllAudioLoaded();
        }
    },
    
    handleFileError(name) {
        if (this.processedFiles.has(name)) return;
        this.processedFiles.add(name);
        
        this.loadedFiles++;
        this.missingFiles.push(name);
        
        let percent = Math.min(Math.floor((this.loadedFiles / this.totalFiles) * 100), 100);
        this.loadingProgress = percent;
        this.updateProgress(percent);
        
        console.warn(`⚠️ Файл не найден: ${name}.mp3`);
        
        if (this.loadedFiles === this.totalFiles) {
            this.onAllAudioLoaded();
        }
    },
    
    updateProgress(percent) {
        percent = Math.min(Math.max(percent, 0), 100);
        
        if (UICore && UICore.updateAudioProgress) {
            UICore.updateAudioProgress(percent);
        }
        
        if (UICore && UICore.log && percent % 10 === 0 && percent !== this.lastLoggedProgress) {
            UICore.log(`🎵 Аудио: ${percent}% загружено (${this.loadedFiles}/${this.totalFiles})`);
            this.lastLoggedProgress = percent;
        }
    },
    
    onAllAudioLoaded() {
        if (this.isLoaded) return;
        
        this.isLoaded = true;
        
        if (this.missingFiles.length > 0 && UICore && UICore.log) {
            UICore.log(`⚠️ Отсутствует ${this.missingFiles.length} аудио файлов`, 'warning');
        }
        
        let loadedCount = this.loadedFiles - this.missingFiles.length;
        if (UICore && UICore.log) {
            UICore.log(`✅ Загружено ${loadedCount} из ${this.totalFiles} аудио файлов`);
        }
        if (UICore && UICore.updateStatus) {
            UICore.updateStatus('✅ Аудио готово');
        }
        
        // НЕ ИГРАЕМ АВТОМАТИЧЕСКИ — ждём действия пользователя
        console.log('🔇 Аудио загружено, ожидание первого взаимодействия');
    },
    
    play(name) {
        if (!this.settings.enabled) return;
        if (!this.isLoaded) {
            setTimeout(() => this.play(name), 500);
            return;
        }
        
        
        const audio = this.audioCache[name];
        if (audio) {
            audio.volume = this.settings.volume;
            audio.currentTime = 0;
            audio.play().catch(e => console.warn(`Ошибка ${name}:`, e));
        }
    },
    
    speak(text, priority = false) {
        if (!this.settings.enabled) return;
        if (!this.isLoaded) {
            setTimeout(() => this.speak(text, priority), 1000);
            return;
        }
        const parts = this.splitText(text);
        parts.forEach(part => this.audioQueue.push(part));
        this.playQueue();
    },
    
    splitText(text) {
        const parts = [];
        const map = {
            'человек': 'человек',
            'машина': 'машина',
            'грузовик': 'грузовик',
            'автобус': 'автобус',
            'собака': 'собака',
            'слева': 'слева',
            'справа': 'справа',
            'прямо': 'прямо',
            'в метре': 'в_метре',
            'в двух метрах': 'в_двух_метрах',
            'очень близко': 'очень_близко',
            'вплотную': 'вплотную',
            'камера запущена': 'камера_запущена',
            'камера остановлена': 'камера_остановлена',
            'калибровка завершена': 'калибровка_завершена',
            'встаньте на метр': 'встаньте_на_метр',
            'не вижу человека': 'не_вижу_человека',
            'осматриваюсь': 'осматриваюсь',
            'ничего не вижу': 'ничего_не_вижу',
            'я готова': 'я_готова',
            'человек очень близко': 'человек_очень_близко', 'activemic' : 'activemic'
        };
        
        let remaining = text;
        while (remaining.length > 0) {
            let found = false;
            for (let [phrase, fileName] of Object.entries(map)) {
                if (remaining.startsWith(phrase)) {
                    parts.push(fileName);
                    remaining = remaining.slice(phrase.length).trim();
                    found = true;
                    break;
                }
            }
            if (!found) {
                const spaceIndex = remaining.indexOf(' ');
                if (spaceIndex > 0) {
                    remaining = remaining.slice(spaceIndex + 1);
                } else {
                    break;
                }
            }
        }
        return parts;
    },
    
    playQueue() {
        if (this.isPlaying || this.audioQueue.length === 0) return;
        this.isPlaying = true;
        this.playNext();
    },
    
    playNext() {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }
        
        const fileName = this.audioQueue.shift();
        const audio = this.audioCache[fileName];
        
        if (audio) {
            audio.volume = this.settings.volume;
            audio.currentTime = 0;
            audio.onended = () => this.playNext();
            audio.play().catch(e => {
                console.warn(`Ошибка: ${fileName}`, e);
                this.playNext();
            });
        } else {
            this.playNext();
        }
    },
    
    clearQueue() {
        this.audioQueue = [];
        this.isPlaying = false;
        Object.values(this.audioCache).forEach(audio => {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        console.log('🗑️ Очередь аудио очищена');
    },
    
    stop() {
        this.clearQueue();
    },
    
    test() {
        if (this.firstSpeakAllowed) {
            this.play('я_готова');
        } else {
            console.log('Сначала разрешите аудио через кнопку');
        }
    },
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        Object.values(this.audioCache).forEach(audio => {
            audio.volume = this.settings.volume;
        });
    }
};

window.Speech = Speech;
