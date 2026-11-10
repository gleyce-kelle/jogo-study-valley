const Storage = {
    key: 'study_valley_data',
    
    defaultState: {
        level: 1,
        xp: 0,
        coins: 0,
        totalStudyMinutes: 0,
        sessionsCompleted: 0,
        highestSession: 0,
        avatarId: 1, 
        hasShield: false, // <-- Novo estado para o Escudo da Forja
        settings: {
            studyMinutes: 25,
            breakMinutes: 5,
            soundEnabled: true,
            volume: 0.5,
            autoStartBreak: false,
            autoStartNextSession: false
        },
        achievements: [],
        inventory: [],
        equippedItems: [], 
        furniturePositions: {},
        unlockedRewards: []
    },

    load: function() {
        const data = localStorage.getItem(this.key);
        if (data) {
            const parsed = JSON.parse(data);
            return {
                ...this.defaultState,
                ...parsed,
                settings: { ...this.defaultState.settings, ...(parsed.settings || {}) },
                furniturePositions: { ...this.defaultState.furniturePositions, ...(parsed.furniturePositions || {}) }
            };
        }
        return { ...this.defaultState };
    },

    save: function(gameState) {
        localStorage.setItem(this.key, JSON.stringify(gameState));
    }
};