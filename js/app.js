document.addEventListener('DOMContentLoaded', () => {
    Game.init();
    
    // Sync inputs with settings
    const st = Game.state.settings;
    UI.elements.cfgStudy.value = st.studyMinutes;
    UI.elements.cfgBreak.value = st.breakMinutes;
    UI.elements.cfgSound.checked = st.soundEnabled;
    UI.elements.cfgVol.value = st.volume;
    UI.elements.cfgAutoBreak.checked = st.autoStartBreak;
    UI.elements.cfgAutoSession.checked = st.autoStartNextSession;
    
    refreshUI();

    // Click events
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mousedown', () => AudioFX.click());
    });

    UI.elements.btnStart.addEventListener('click', startStudySession);

    UI.elements.btnStop.addEventListener('click', () => {
        if (Timer.isStudying) {
            const secondsStudied = Timer.totalDuration - Timer.timeRemaining;
            const minutesStudied = Math.floor(secondsStudied / 60);

            let msg = "Deseja abortar? " + (minutesStudied > 0 ? `\nReceberá +${minutesStudied} XP.` : "");
            UI.showModal("Abortar Missão", msg, [
                { text: "Sim", class: "danger", onClick: () => {
                    Timer.stop();
                    minutesStudied > 0 ? processRewards(minutesStudied, true) : resetToIdle();
                }},
                { text: "Não", class: "primary", onClick: () => {} }
            ]);
        } else {
            Timer.stop();
            resetToIdle();
        }
    });

    // Menus
    document.getElementById('btn-settings').addEventListener('click', () => UI.toggleSettings(true));
    document.getElementById('btn-close-settings').addEventListener('click', () => {
        Game.state.settings = {
            studyMinutes: parseInt(UI.elements.cfgStudy.value) || 25,
            breakMinutes: parseInt(UI.elements.cfgBreak.value) || 5,
            soundEnabled: UI.elements.cfgSound.checked,
            volume: parseFloat(UI.elements.cfgVol.value),
            autoStartBreak: UI.elements.cfgAutoBreak.checked,
            autoStartNextSession: UI.elements.cfgAutoSession.checked
        };
        Storage.save(Game.state);
        UI.toggleSettings(false);
        refreshTimeDisplay();
    });

    document.getElementById('btn-stats').addEventListener('click', () => {
        document.getElementById('stat-level').innerText = Game.state.level;
        document.getElementById('stat-xp').innerText = Game.state.xp;
        document.getElementById('stat-coins').innerText = Game.state.coins;
        document.getElementById('stat-minutes').innerText = Game.state.totalStudyMinutes;
        document.getElementById('stat-sessions').innerText = Game.state.sessionsCompleted;
        document.getElementById('stat-highest').innerText = Game.state.highestSession;
        UI.toggleStats(true);
    });
    document.getElementById('btn-close-stats').addEventListener('click', () => UI.toggleStats(false));

    function startStudySession() {
        Timer.isStudying = true;
        AudioFX.start();
        UI.setMode('studying');
        Timer.start(Game.state.settings.studyMinutes, 
            (time) => UI.updateTime(time), 
            () => processRewards(Game.state.settings.studyMinutes, false)
        );
    }

    function startBreakSession() {
        Timer.isStudying = false;
        UI.setMode('break');
        Timer.start(Game.state.settings.breakMinutes, 
            (time) => UI.updateTime(time),
            () => {
                AudioFX.finish();
                if (Game.state.settings.autoStartNextSession) {
                    startStudySession();
                } else {
                    UI.showModal("Fim do Descanso", "Hora de voltar!", [{ text: "Continuar", class: "primary", onClick: () => resetToIdle() }]);
                }
            }
        );
    }

    function processRewards(minutesStudied, wasAborted) {
        AudioFX.finish();
        const reward = Game.addReward(minutesStudied, !wasAborted);
        refreshUI();
        
        UI.showFloatingText(`+${reward.xpGained} XP`, 'xp');
        
        if (reward.levelUps > 0) {
            setTimeout(() => {
                AudioFX.levelUp();
                UI.triggerLevelUpAnimation();
                UI.showFloatingText(`NOVO NÍVEL!`, 'level');
                setTimeout(() => {
                    AudioFX.coin();
                    UI.showFloatingText(`+${reward.coinsGained} Moedas`, 'coin');
                }, 1000);
            }, 1000);
        }

        if (!wasAborted && Game.state.settings.autoStartBreak) {
            startBreakSession();
            return;
        }

        let title = wasAborted ? "Abortada" : "Concluída!";
        let msg = `Ganhos: ${reward.xpGained} XP.`;
        if (reward.levelUps > 0) msg += `\nLvl ${Game.state.level} alcançado! (+${reward.coinsGained} moedas)`;

        if (!wasAborted) {
            UI.showModal(title, msg, [
                { text: "Pausa", class: "primary", onClick: () => startBreakSession() },
                { text: "Pular", class: "danger", onClick: () => resetToIdle() }
            ]);
        } else {
            UI.showModal(title, msg, [{ text: "Ok", class: "primary", onClick: () => resetToIdle() }]);
        }
    }

    function resetToIdle() {
        UI.setMode('idle'); refreshUI(); refreshTimeDisplay();
    }
    function refreshUI() {
        UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
    }
    function refreshTimeDisplay() {
        UI.updateTime(Game.state.settings.studyMinutes * 60);
    }
    
    refreshTimeDisplay();
});