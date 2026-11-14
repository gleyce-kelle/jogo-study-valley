const Storage = {
    key: 'study_valley_data',
    CURRENT_VERSION: '1.0.0', // <-- Versão atual do esquema de dados do jogo
    
    defaultState: {
        version: '1.0.0',
        level: 1,
        xp: 0,
        coins: 0,
        totalStudyMinutes: 0,
        sessionsCompleted: 0,
        highestSession: 0,
        avatarId: 1, 
        hasShield: false,
        settings: {
            studyMinutes: 25,
            breakMinutes: 5,
            soundEnabled: true,
            volume: 0.5,
            autoStartBreak: false,
            autoStartNextSession: false
        },
        achievements: [],
        achievementsClaimed: [],
        inventory: [],
        equippedItems: [], 
        furniturePositions: {},
        unlockedRewards: []
    },

    // --- Sistema de Migração de Versões ---
    migrate: function(savedState) {
        if (!savedState || typeof savedState !== 'object') {
            return { ...this.defaultState };
        }

        let state = { ...savedState };
        const savedVersion = state.version || '0.9.0'; // Saves legados sem versão assumem 0.9.0

        // Pipeline preparado para upgrades futuros:
        // Se no futuro você lançar a versão 1.1.0 com novas mecânicas (ex: pets, planos premium),
        // basta adicionar as regras de conversão aqui:
        /*
        if (savedVersion === '1.0.0') {
            state.premiumStatus = false;
            state.version = '1.1.0';
        }
        */

        // Garante que todas as propriedades da versão atual existam e tenham valores válidos
        const migratedState = {
            ...this.defaultState,
            ...state,
            version: this.CURRENT_VERSION,
            settings: { ...this.defaultState.settings, ...(state.settings || {}) },
            furniturePositions: { ...this.defaultState.furniturePositions, ...(state.furniturePositions || {}) }
        };

        // Garante que os arrays essenciais existam
        if (!Array.isArray(migratedState.achievements)) migratedState.achievements = [];
        if (!Array.isArray(migratedState.achievementsClaimed)) migratedState.achievementsClaimed = [];
        if (!Array.isArray(migratedState.inventory)) migratedState.inventory = [];
        if (!Array.isArray(migratedState.equippedItems)) migratedState.equippedItems = [];
        if (!Array.isArray(migratedState.unlockedRewards)) migratedState.unlockedRewards = [];

        return migratedState;
    },

    load: function() {
        const data = localStorage.getItem(this.key);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                const migrated = this.migrate(parsed);

                // Se a versão gravada no navegador for anterior à atual, regrava atualizado
                if (!parsed.version || parsed.version !== this.CURRENT_VERSION) {
                    this.save(migrated);
                }

                return migrated;
            } catch (e) {
                console.error("Erro ao carregar dados salvos. Restaurando estado padrão seguro.", e);
                return { ...this.defaultState };
            }
        }
        return { ...this.defaultState };
    },

    save: function(gameState) {
        // Garante que ao salvar, a versão atual sempre acompanhe o arquivo
        const stateToSave = {
            ...gameState,
            version: this.CURRENT_VERSION
        };
        localStorage.setItem(this.key, JSON.stringify(stateToSave));
    },

    // --- Exportar Save para arquivo .json ---
    exportSave: function() {
        if (typeof Game !== 'undefined' && Game.state) {
            this.save(Game.state);
        }

        const dataStr = localStorage.getItem(this.key) || JSON.stringify(this.defaultState);
        let formattedData = dataStr;
        try {
            formattedData = JSON.stringify(JSON.parse(dataStr), null, 2);
        } catch (e) {
            formattedData = dataStr;
        }

        const dataBlob = new Blob([formattedData], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `study-valley-save-v${this.CURRENT_VERSION}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // --- Importar Save a partir de arquivo .json com validação de versão ---
    importSave: function(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                
                if (!parsed || typeof parsed !== 'object') {
                    throw new Error("Arquivo de save inválido.");
                }

                // Executa a migração garantindo compatibilidade entre saves de versões diferentes
                const migratedState = this.migrate(parsed);

                this.save(migratedState);
                if (typeof callback === 'function') callback(true, migratedState);
            } catch (error) {
                console.error("Erro ao importar save:", error);
                if (typeof callback === 'function') callback(false, null);
            }
        };
        reader.onerror = () => {
            if (typeof callback === 'function') callback(false, null);
        };
        reader.readAsText(file);
    }
};