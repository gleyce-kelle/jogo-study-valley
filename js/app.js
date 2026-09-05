document.addEventListener('DOMContentLoaded', () => {
    Game.init();
    refreshUI();

    UI.elements.btnStart.addEventListener('click', () => {
        startStudySession();
    });

    UI.elements.btnStop.addEventListener('click', () => {
        if (Timer.isStudying) {
            // Se abortar, calcula quantos minutos inteiros foram efetivamente focados antes de parar
            const secondsStudied = Timer.totalDuration - Timer.timeRemaining;
            const minutesStudied = Math.floor(secondsStudied / 60);

            let message = "Tem certeza que deseja abortar a missão?";
            if (minutesStudied > 0) {
                message += `\nVocê focou por ${minutesStudied} minuto(s) completos e receberá ${minutesStudied} XP por isso.`;
            } else {
                message += "\nComo você não completou nem 1 minuto, nenhum XP será ganho.";
            }

            UI.showModal("Abortar Missão", message, [
                { text: "Sim, abortar", class: "danger", onClick: () => {
                    Timer.stop();
                    
                    // Se estudou pelo menos 1 min, entrega a recompensa
                    if (minutesStudied > 0) {
                        const reward = Game.addReward(minutesStudied);
                        
                        if (reward.levelUps > 0) {
                            UI.showModal(
                                "Level Up!", 
                                `Sessão abortada, mas você ganhou ${reward.xpGained} XP e subiu de Nível!`, 
                                [{ text: "Ok", class: "primary", onClick: () => resetToIdle() }]
                            );
                            return; // Retorna para não chamar resetToIdle duas vezes
                        }
                    }
                    resetToIdle();
                }},
                { text: "Continuar foco", class: "primary", onClick: () => {} } // Apenas fecha o modal
            ]);
        } else {
            // Se estiver na pausa e apertar o botão, apenas pula a pausa (Pausa não dá XP)
            Timer.stop();
            resetToIdle();
        }
    });

    // Se o usuário mexer no tempo do input, atualiza o relógio na tela
    UI.elements.studyTimeInput.addEventListener('change', refreshTimeDisplay);

    function startStudySession() {
        Timer.isStudying = true;
        const currentStudyMinutes = parseInt(UI.elements.studyTimeInput.value) || 25;
        
        UI.setMode('studying');
        
        Timer.start(currentStudyMinutes, 
            (timeRemaining) => UI.updateTime(timeRemaining),
            () => handleSessionComplete(currentStudyMinutes)
        );
    }

    function startBreakSession() {
        Timer.isStudying = false;
        const breakMinutes = parseInt(UI.elements.breakTimeInput.value) || 5;
        
        UI.setMode('break');
        
        Timer.start(breakMinutes, 
            (timeRemaining) => UI.updateTime(timeRemaining),
            () => handleBreakComplete()
        );
    }

    function handleSessionComplete(minutesStudied) {
        const reward = Game.addReward(minutesStudied);
        refreshUI();
        
        let message = `Missão cumprida! Você ganhou ${reward.xpGained} XP.`;
        if (reward.levelUps > 0) {
            message += `\nIncrível! Você subiu de nível e ganhou moedas!`;
        }
        message += `\nDeseja descansar na fogueira (iniciar pausa)?`;

        UI.showModal("Sucesso!", message, [
            { text: "Iniciar Pausa", class: "primary", onClick: () => startBreakSession() },
            { text: "Pular Pausa", class: "danger", onClick: () => resetToIdle() }
        ]);
    }

    function handleBreakComplete() {
        UI.showModal(
            "Fim do Descanso",
            "O fogo da fogueira apagou. Hora de voltar à sua jornada de estudos!",
            [{ text: "Continuar", class: "primary", onClick: () => resetToIdle() }]
        );
    }

    function resetToIdle() {
        UI.setMode('idle');
        refreshUI();
        refreshTimeDisplay();
    }

    function refreshUI() {
        UI.updateStats(
            Game.state, 
            Game.getXPForNextLevel(), 
            Game.getTotalXPForLevel(Game.state.level)
        );
    }

    function refreshTimeDisplay() {
        const mins = parseInt(UI.elements.studyTimeInput.value) || 25;
        UI.updateTime(mins * 60);
    }
    
    // Configura o timer inicial ao carregar a página
    refreshTimeDisplay();
});