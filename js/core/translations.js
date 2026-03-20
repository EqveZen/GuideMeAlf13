const Translations = {
    dict: {
        'person': 'человек',
        'car': 'машина',
        'truck': 'грузовик',
        'bus': 'автобус',
        'motorcycle': 'мотоцикл',
        'bicycle': 'велосипед',
        'stop sign': 'знак стоп',
        'traffic light': 'светофор',
        'fire hydrant': 'пожарный гидрант',
        'bench': 'скамейка',
        'dog': 'собака',
        'cat': 'кошка',
        'bird': 'птица',
        'bottle': 'бутылка',
        'cup': 'чашка',
        'cell phone': 'телефон',
        'book': 'книга',
        'chair': 'стул',
        'couch': 'диван',
        'bed': 'кровать',
        'backpack': 'рюкзак',
        'umbrella': 'зонт',
        'handbag': 'сумка',
        'tv': 'телевизор',
        'laptop': 'ноутбук',
        'keyboard': 'клавиатура',
        'mouse': 'мышь',
        'remote': 'пульт',
        'microwave': 'микроволновка',
        'oven': 'духовка',
        'sink': 'раковина',
        'refrigerator': 'холодильник',
        'clock': 'часы',
        'vase': 'ваза',
        'scissors': 'ножницы',
        'teddy bear': 'плюшевый мишка',
        'toothbrush': 'зубная щетка',
        'potted plant': 'растение в горшке',
        'dining table': 'обеденный стол',
        'toilet': 'унитаз',
        'sports ball': 'мяч',
        'skateboard': 'скейтборд',
        'surfboard': 'серф'
    },
    
    init() {
        if (window.UICore) {
            UICore.log(`📖 Загружено переводов: ${Object.keys(this.dict).length}`);
        }
        console.log(`📖 Translations: ${Object.keys(this.dict).length} слов`);
    },
    
    get(className) {
        return this.dict[className] || className;
    }
};

window.Translations = Translations;