const UISettings = {
    elements: {},
    panelVisible: false,
    init() {
        this.elements.volume = document.getElementById('volume');
        this.elements.settingsPanel = document.getElementById('settingsPanel');
        this.loadFromStorage();
        if (this.elements.volume) {
            this.elements.volume.addEventListener('input', () => this.saveToStorage());
        }
    },
    loadFromStorage() {
        const saved = Helpers.loadSettings();
        if (saved && this.elements.volume) {
            this.elements.volume.value = saved.volume || 1;
            if (window.Speech) Speech.updateSettings({ volume: saved.volume });
        }
    },
    saveToStorage() {
        const settings = { volume: this.elements.volume ? parseFloat(this.elements.volume.value) : 1 };
        Helpers.saveSettings(settings);
        if (window.Speech) Speech.updateSettings({ volume: settings.volume });
    },
    togglePanel() {
        if (this.elements.settingsPanel) {
            this.panelVisible = !this.panelVisible;
            if (this.panelVisible) {
                this.elements.settingsPanel.classList.remove('hidden');
            } else {
                this.elements.settingsPanel.classList.add('hidden');
            }
        }
    }
};
window.UISettings = UISettings;

//.
