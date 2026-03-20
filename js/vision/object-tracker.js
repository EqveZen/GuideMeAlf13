const ObjectTracker = {
    objects: {},
    history: [],
    maxHistorySize: 100,
    
    init() {
        console.log('Object Tracker загружен');
        return this;
    },
    
    update(detections) {
        const now = Date.now();
        const currentObjects = {};
        
        detections.forEach(d => {
            const className = d.class;
            if (!currentObjects[className]) {
                currentObjects[className] = {
                    count: 1,
                    score: d.score,
                    bbox: d.bbox,
                    firstSeen: now,
                    lastSeen: now
                };
            } else {
                currentObjects[className].count++;
                currentObjects[className].lastSeen = now;
            }
        });
        
        const changes = {
            new: [],
            gone: [],
            changed: []
        };
        
        for (const className in currentObjects) {
            if (!this.objects[className]) {
                changes.new.push(className);
            } else if (this.objects[className].count !== currentObjects[className].count) {
                changes.changed.push(className);
            }
        }
        
        for (const className in this.objects) {
            if (!currentObjects[className]) {
                changes.gone.push(className);
            }
        }
        
        this.objects = currentObjects;
        
        this.history.push({
            timestamp: now,
            objects: { ...currentObjects },
            changes: changes
        });
        
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        
        return changes;
    },
    
    getObjectCount(className) {
        return this.objects[className]?.count || 0;
    },
    
    isStable(className, stabilityTime = 5000) {
        const obj = this.objects[className];
        if (!obj) return false;
        
        const now = Date.now();
        return (now - obj.firstSeen) > stabilityTime;
    },
    
    reset() {
        this.objects = {};
        this.history = [];
    }
};

window.ObjectTracker = ObjectTracker;