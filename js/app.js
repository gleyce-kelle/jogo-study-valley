document.addEventListener('DOMContentLoaded', () => {
    Game.init();
    
    Shop.init();
    UI.renderFurniture(Game.state.equippedItems, Shop.catalog, Game.state.furniturePositions);

    if (UI.elements.btnSaveFurniture) {
        UI.elements.btnSaveFurniture.addEventListener('click', () => {
            const items = document.querySelectorAll('.furniture-item');
            if (!Game.state.furniturePositions) Game.state.furniturePositions = {};
            
            items.forEach(el => {
                const id = el.dataset.itemId;
                if (id) {
                    Game.state.furniturePositions[id] = {
                        x: parseFloat(el.style.left) || 0,
                        y: parseFloat(el.style.top) || 0
                    };
                }
            });
            
            Storage.save(Game.state);
            UI.elements.btnSaveFurniture.style.display = 'none';
            UI.showFloatingText('Decoracao salva!', 'xp');
            AudioFX.coin(); 
        });
    }

    if (!Game.state.achievementsClaimed) Game.state.achievementsClaimed = [];

    const st = Game.state.settings;
    UI.elements.cfgStudy.value = st.studyMinutes;
    UI.elements.cfgBreak.value = st.breakMinutes;
    UI.elements.cfgSound.checked = st.soundEnabled;
    UI.elements.cfgVol.value = st.volume;
    UI.elements.cfgAutoBreak.checked = st.autoStartBreak;
    UI.elements.cfgAutoSession.checked = st.autoStartNextSession;
    
    refreshUI();

    let tempAvatarId = Game.state.avatarId;

    // --- Sistema Universal de Sons para Todos os Botões (Desktop & Mobile) ---
    document.addEventListener('pointerdown', (e) => {
        if (typeof AudioFX !== 'undefined' && typeof AudioFX.init === 'function') {
            AudioFX.init();
        }
        const btn = e.target.closest('button, .icon-btn, .opt-btn');
        if (btn && typeof AudioFX !== 'undefined' && typeof AudioFX.click === 'function') {
            AudioFX.click();
        }
    });

    UI.elements.btnStart.addEventListener('click', startStudySession);

    UI.elements.btnPauseResume.addEventListener('click', () => {
        if (Timer.isPaused) {
            Timer.resume();
            UI.setMode('studying');
            AudioFX.start();
        } else {
            Timer.pause();
            UI.setMode('paused');
            // Chamada redundante de AudioFX.click() removida
        }
    });

    UI.elements.btnStop.addEventListener('click', () => {
        if (Timer.isStudying) {
            const secondsStudied = Timer.totalDuration - Timer.timeRemaining;
            const minutesStudied = Math.floor(secondsStudied / 60);

            let msg = "Deseja abortar? " + (minutesStudied > 0 ? `\nRecebera +${minutesStudied} XP.` : "");
            UI.showModal("Abortar Missao", msg, [
                { text: "Sim", class: "danger", onClick: () => {
                    Timer.stop();
                    minutesStudied > 0 ? processRewards(minutesStudied, true) : resetToIdle();
                }},
                { text: "Nao", class: "primary", onClick: () => {} }
            ]);
        } else {
            Timer.stop();
            resetToIdle();
        }
    });

    const menuModal = document.getElementById('modal-minigames-menu');
    
    UI.elements.btnMiniGames.addEventListener('click', () => {
        if (menuModal) menuModal.style.display = 'flex';
    });

    document.getElementById('close-minigames-menu-btn').addEventListener('click', () => {
        if (menuModal) menuModal.style.display = 'none';
    });

    document.getElementById('btn-select-forja').addEventListener('click', () => {
        if (menuModal) menuModal.style.display = 'none';
        document.getElementById('modal-forja').style.display = 'flex';
    });

    document.getElementById('close-forja-btn').addEventListener('click', () => {
        document.getElementById('modal-forja').style.display = 'none';
        if (window.ForjaGame && typeof window.ForjaGame.stop === 'function') {
            window.ForjaGame.stop();
        }
        if (menuModal) menuModal.style.display = 'flex';
    });
    
    const btnSelectExpedicao = document.getElementById('btn-select-expedicao');
    if (btnSelectExpedicao) {
        btnSelectExpedicao.addEventListener('click', () => {
            if (menuModal) menuModal.style.display = 'none';
            const expModal = document.getElementById('modal-expedicao');
            if (expModal) expModal.style.display = 'flex';
        });
    }

    const btnStartExpedicao = document.getElementById('btn-start-expedicao');
    if (btnStartExpedicao) {
        btnStartExpedicao.addEventListener('click', () => {
            if (window.ExpedicaoGame && typeof window.ExpedicaoGame.start === 'function') {
                window.ExpedicaoGame.start();
            }
        });
    }

    const closeExpedicaoBtn = document.getElementById('close-expedicao-btn');
    if (closeExpedicaoBtn) {
        closeExpedicaoBtn.addEventListener('click', () => {
            const expModal = document.getElementById('modal-expedicao');
            if (expModal) expModal.style.display = 'none';
            
            if (window.ExpedicaoGame && typeof window.ExpedicaoGame.stop === 'function') {
                window.ExpedicaoGame.stop();
            }
            if (menuModal) menuModal.style.display = 'flex';
        });
    }
    
    const btnSelectGrimorio = document.getElementById('btn-select-grimorio');
    const modalGrimorio = document.getElementById('modal-grimorio');
    const btnStartGrimorio = document.getElementById('btn-start-grimorio');
    const closeGrimorioBtn = document.getElementById('close-grimorio-btn');

    if (btnSelectGrimorio) {
        btnSelectGrimorio.addEventListener('click', () => {
            if (menuModal) menuModal.style.display = 'none';
            if (modalGrimorio) modalGrimorio.style.display = 'flex';
            
            if (Game.state.xpMultiplier > 1) {
                btnStartGrimorio.innerText = 'FEITICO ATIVO';
                btnStartGrimorio.disabled = true;
                btnStartGrimorio.style.opacity = '0.5';
                btnStartGrimorio.style.cursor = 'not-allowed';
            } else {
                btnStartGrimorio.innerText = 'INICIAR RESTAURACAO';
                btnStartGrimorio.disabled = false;
                btnStartGrimorio.style.opacity = '1';
                btnStartGrimorio.style.cursor = 'pointer';
            }
        });
    }

    if (btnStartGrimorio) {
        btnStartGrimorio.addEventListener('click', () => {
            if (Game.state.xpMultiplier > 1) return; 

            if (window.GrimorioGame && typeof window.GrimorioGame.start === 'function') {
                btnStartGrimorio.style.display = 'none'; 
                window.GrimorioGame.start(() => {
                    Game.state.xpMultiplier = 1.2; 
                    Storage.save(Game.state); 
                    setTimeout(() => {
                        btnStartGrimorio.style.display = 'block';
                        btnStartGrimorio.innerText = 'FEITICO ATIVO';
                        btnStartGrimorio.disabled = true;
                        btnStartGrimorio.style.opacity = '0.5';
                        btnStartGrimorio.style.cursor = 'not-allowed';
                    }, 2000);
                });
            }
        });
    }

    if (closeGrimorioBtn) {
        closeGrimorioBtn.addEventListener('click', () => {
            if (modalGrimorio) modalGrimorio.style.display = 'none';
            if (window.GrimorioGame && typeof window.GrimorioGame.stop === 'function') {
                window.GrimorioGame.stop();
            }
            if (btnStartGrimorio) {
                btnStartGrimorio.style.display = 'block';
            }
            if (menuModal) menuModal.style.display = 'flex';
        });
    }

    document.getElementById('btn-profile').addEventListener('click', () => {
        tempAvatarId = Game.state.avatarId;
        updateProfileModalUI();
        UI.toggleProfile(true);
    });

    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            tempAvatarId = parseInt(e.target.getAttribute('data-value'));
            updateProfileModalUI();
        });
    });

    document.getElementById('btn-save-profile').addEventListener('click', () => {
        Game.state.avatarId = tempAvatarId;
        Storage.save(Game.state);
        refreshUI();
        UI.toggleProfile(false);
    });

    function updateProfileModalUI() {
        UI.renderAvatar(UI.elements.avatarPreview, tempAvatarId);
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            const value = parseInt(btn.getAttribute('data-value'));
            if (tempAvatarId === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.getElementById('btn-shop').addEventListener('click', () => {
        Shop.renderShop(); 
        UI.toggleShop(true);
    });
    
    document.getElementById('btn-close-shop').addEventListener('click', () => {
        UI.toggleShop(false);
    });

    document.getElementById('btn-achievements').addEventListener('click', () => UI.toggleAchievements(true, Game.state));
    document.getElementById('btn-close-achievements').addEventListener('click', () => UI.toggleAchievements(false));

    // Conexão do botão Sobre e Modal
    if (UI.elements.btnAbout) {
        UI.elements.btnAbout.addEventListener('click', () => UI.toggleAbout(true));
    }
    const btnCloseAbout = document.getElementById('btn-close-about');
    if (btnCloseAbout) {
        btnCloseAbout.addEventListener('click', () => UI.toggleAbout(false));
    }

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

    // --- Lógica de Backup (Exportar / Importar Save) ---
    const btnExportSave = document.getElementById('btn-export-save');
    if (btnExportSave) {
        btnExportSave.addEventListener('click', () => {
            Storage.exportSave();
            UI.showFloatingText('Save exportado!', 'xp');
            if (typeof AudioFX !== 'undefined') AudioFX.coin();
        });
    }

    const btnImportSave = document.getElementById('btn-import-save');
    const fileImportSave = document.getElementById('file-import-save');
    if (btnImportSave && fileImportSave) {
        btnImportSave.addEventListener('click', () => {
            fileImportSave.value = '';
            fileImportSave.click();
        });

        fileImportSave.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                Storage.importSave(file, (success) => {
                    if (success) {
                        alert("Save importado com sucesso! O Study Valley será recarregado.");
                        window.location.reload();
                    } else {
                        alert("Erro ao importar save. Verifique se o arquivo JSON selecionado é válido.");
                    }
                });
            }
        });
    }

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
                
                if (menuModal) menuModal.style.display = 'none';
                document.getElementById('modal-forja').style.display = 'none';
                document.getElementById('modal-expedicao').style.display = 'none';
                if (modalGrimorio) modalGrimorio.style.display = 'none';
                
                if (window.ForjaGame && typeof window.ForjaGame.stop === 'function') {
                    window.ForjaGame.stop();
                }
                
                if (window.ExpedicaoGame && typeof window.ExpedicaoGame.stop === 'function') {
                    if (window.ExpedicaoGame.isActive && window.ExpedicaoGame.hp > 0) {
                        window.ExpedicaoGame.endGame('cleared'); 
                    }
                    window.ExpedicaoGame.stop();
                }

                if (window.GrimorioGame && typeof window.GrimorioGame.stop === 'function') {
                    window.GrimorioGame.stop();
                }

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
                UI.showFloatingText(`NOVO NIVEL!`, 'level');
                setTimeout(() => {
                    AudioFX.coin();
                    UI.showFloatingText(`+${reward.coinsGained} Moedas`, 'coin');
                }, 1000);
            }, 1000);
        }

        checkAchievements();

        if (!wasAborted && Game.state.settings.autoStartBreak) {
            startBreakSession();
            return;
        }

        let title = wasAborted ? "Abortada" : "Concluida!";
        let msg = `Ganhos: ${reward.xpGained} XP.`;
        
        if (reward.bonusXP > 0) {
            msg += `\n(Bonus Mente Clara: +${reward.bonusXP} XP)`;
        }
        
        if (reward.levelUps > 0) msg += `\nLvl ${Game.state.level} alcancado! (+${reward.coinsGained} moedas)`;

        if (!wasAborted) {
            UI.showModal(title, msg, [
                { text: "Pausa", class: "primary", onClick: () => startBreakSession() },
                { text: "Pular", class: "danger", onClick: () => resetToIdle() }
            ]);
        } else {
            UI.showModal(title, msg, [{ text: "Ok", class: "primary", onClick: () => resetToIdle() }]);
        }
    }

    let achievementQueue = [];
    let isShowingAchievement = false;

    function checkAchievements() {
        UI.achievementsData.forEach(ach => {
            if (ach.check(Game.state) && !Game.state.achievementsClaimed.includes(ach.id) && !achievementQueue.includes(ach)) {
                achievementQueue.push(ach);
            }
        });
        processAchievementQueue();
    }

    function processAchievementQueue() {
        if (isShowingAchievement || achievementQueue.length === 0) return;
        
        isShowingAchievement = true;
        const ach = achievementQueue.shift(); 
        
        UI.elements.unlockedAchName.innerText = `"${ach.title}"`;
        UI.elements.unlockedAchXp.innerText = ach.rewardXP;
        UI.elements.unlockedAchCoins.innerText = ach.rewardCoins;
        
        const achModalContent = UI.elements.achievementUnlockedModal.querySelector('.modal-content');
        if (achModalContent) {
            achModalContent.removeAttribute('style'); 
            achModalContent.className = 'modal-content'; 
        }

        UI.elements.achievementUnlockedModal.style.display = 'flex';
        
        const btnCollect = UI.elements.btnCollectAch;
        const newBtn = btnCollect.cloneNode(true);
        btnCollect.parentNode.replaceChild(newBtn, btnCollect);
        UI.elements.btnCollectAch = newBtn; 

        newBtn.addEventListener('click', () => {
            AudioFX.coin(); 
            
            Game.state.xp += ach.rewardXP;
            Game.state.coins += ach.rewardCoins;
            Game.state.achievementsClaimed.push(ach.id);
            
            while (Game.state.xp >= Game.getXPForNextLevel()) {
                Game.state.level++;
            }

            Storage.save(Game.state);
            refreshUI();
            
            UI.elements.achievementUnlockedModal.style.display = 'none';
            isShowingAchievement = false;
            
            checkAchievements(); 
            processAchievementQueue();
        });
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
    
    checkAchievements();
    refreshTimeDisplay();
});