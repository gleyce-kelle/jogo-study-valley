const Storage = {
    key: 'study_valley_data',
    
    load: function() {
        const data = localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data);
        }
        // Estado inicial
        return {
            level: 1,
            xp: 0,
            coins: 0
        };
    },

    save: function(gameState) {
        localStorage.setItem(this.key, JSON.stringify(gameState));
    }
};