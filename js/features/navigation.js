const Navigation = {
    isActive: false,
    destination: null,
    route: [],
    
    init() {
        console.log('Navigation module загружен');
        return this;
    },
    
    startNavigation(destination) {
        this.isActive = true;
        this.destination = destination;
        this.route = [];
        Speech.speak(`Начинаю навигацию до ${destination}`);
    },
    
    stopNavigation() {
        this.isActive = false;
        this.destination = null;
        this.route = [];
        Speech.speak('Навигация завершена');
    },
    
    updatePosition(lat, lon) {
        if (!this.isActive) return;
        // Здесь будет логика навигации
    },
    
    getNextInstruction() {
        // Здесь будет генерация голосовых инструкций
        return null;
    }
};

window.Navigation = Navigation;