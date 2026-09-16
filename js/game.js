const LEVEL_CONFIG = {
    baseXP: 100, increment: 50, baseCoins: 5, coinIncrement: 5     
};

const Game = {
    state: {},

    init: function() { this.state = Storage.load(); },

    getTotalXPForLevel: function(level) {
        if (level <= 1) return 0;
        let totalXP = 0;
        for (let i = 2; i <= level; i++) totalXP += LEVEL_CONFIG.baseXP + ((i - 2) * LEVEL_CONFIG.increment);
        return totalXP;
    },

    getXPForNextLevel: function() { return this.getTotalXPForLevel(this.state.level + 1); },
    getCoinsForLevel: function(newLevel) { return LEVEL_CONFIG.baseCoins + ((newLevel - 1) * LEVEL_CONFIG.coinIncrement); },

    addReward: function(minutesStudied, isCompletedSession) {
        let xpGained = Math.floor(minutesStudied); 
        let bonusXP = 0;
        
        if (isCompletedSession && this.state.xpMultiplier > 1) {
            bonusXP = Math.ceil(xpGained * (this.state.xpMultiplier - 1));
            xpGained += bonusXP;
            
            this.state.xpMultiplier = 1;
        }
        
        if (xpGained > 0) {
            this.state.xp += xpGained;
            this.state.totalStudyMinutes += xpGained;
            if (xpGained > this.state.highestSession) this.state.highestSession = xpGained;
        }

        if (isCompletedSession) this.state.sessionsCompleted += 1;

        const levelUpData = this.checkLevelUp();
        Storage.save(this.state); 
        
        return { 
            xpGained, 
            bonusXP, 
            levelUps: levelUpData.levelsGained, 
            coinsGained: levelUpData.coinsGained 
        };
    },

    checkLevelUp: function() {
        let levelsGained = 0, coinsGained = 0;
        let nextLevelXP = this.getXPForNextLevel();
        
        while (this.state.xp >= nextLevelXP) {
            this.state.level++; levelsGained++;
            const coinsForThisLevel = this.getCoinsForLevel(this.state.level);
            this.state.coins += coinsForThisLevel; coinsGained += coinsForThisLevel;
            nextLevelXP = this.getXPForNextLevel();
        }
        return { levelsGained, coinsGained };
    }
};