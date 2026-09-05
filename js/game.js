// Configuração central da progressão de níveis
const LEVEL_CONFIG = {
    baseXP: 100,
    increment: 50 // O acréscimo de XP exigido a cada novo nível
};

const Game = {
    state: {},

    init: function() {
        this.state = Storage.load();
    },

    // Calcula o TOTAL acumulado de XP necessário para chegar em um nível específico
    getTotalXPForLevel: function(level) {
        if (level <= 1) return 0; // Nível 1 começa com 0 XP
        
        let totalXP = 0;
        for (let i = 2; i <= level; i++) {
            totalXP += LEVEL_CONFIG.baseXP + ((i - 2) * LEVEL_CONFIG.increment);
        }
        return totalXP;
    },

    // Retorna quanto XP total é necessário para o PRÓXIMO nível
    getXPForNextLevel: function() {
        return this.getTotalXPForLevel(this.state.level + 1);
    },

    addReward: function(minutesStudied) {
        // Regra: 1 minuto completo = 1 XP
        const xpGained = Math.floor(minutesStudied); 
        
        if (xpGained <= 0) {
            return { xpGained: 0, levelUps: 0 };
        }

        this.state.xp += xpGained;

        const levelUps = this.checkLevelUp();
        Storage.save(this.state); // O XP é persistido aqui mesmo fechando a página
        
        return { xpGained, levelUps };
    },

    checkLevelUp: function() {
        let levelsGained = 0;
        let nextLevelXP = this.getXPForNextLevel();
        
        // Verifica se subiu múltiplos níveis de uma vez (caso acumule muito XP)
        while (this.state.xp >= nextLevelXP) {
            this.state.level++;
            levelsGained++;
            
            // Recompensa futura: Dar moedas ao subir de nível
            this.state.coins += this.state.level * 5; 
            
            nextLevelXP = this.getXPForNextLevel();
        }
        
        return levelsGained;
    }
};