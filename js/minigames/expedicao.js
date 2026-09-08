const ExpedicaoGame = {
    isActive: false,
    hp: 3,
    maxHp: 3,
    loot: 0,
    step: 1,
    maxSteps: 5,
    
    events: [
        {
            text: "Seu familiar encontrou uma bifurcação escura na masmorra.",
            choices: [
                { label: "Porta de Madeira", action: () => ExpedicaoGame.resolveEvent("Seguro", 1, 0, "A sala estava vazia, mas havia uma moeda no chão.") },
                { label: "Porta de Ferro (Risco)", action: () => ExpedicaoGame.resolveRisk(3, 1, "Um baú escondido!", "Era uma armadilha de flechas!") }
            ]
        },
        {
            text: "Um Goblin dormindo abraçado a um pequeno saco de ouro.",
            choices: [
                { label: "Furtar (Risco)", action: () => ExpedicaoGame.resolveRisk(2, 1, "Você pegou o ouro sem acordá-lo.", "O Goblin acordou assustado e atacou!") },
                { label: "Passar de fininho", action: () => ExpedicaoGame.resolveEvent("Seguro", 0, 0, "O familiar passou sem fazer barulho. Melhor não arriscar.") }
            ]
        },
        {
            text: "No centro da sala, há uma fonte brilhante e um altar sombrio.",
            choices: [
                { label: "Beber da Fonte", action: () => ExpedicaoGame.heal(1, "A água mágica curou as feridas do seu familiar!") },
                { label: "Saquear Altar", action: () => ExpedicaoGame.resolveEvent("Dano", 3, 1, "O altar tinha moedas, mas uma energia sombria machucou seu familiar.") }
            ]
        },
        {
            text: "Um baú luxuoso com um formato estranhamente orgânico...",
            choices: [
                { label: "Tentar Abrir", action: () => ExpedicaoGame.resolveRisk(4, 1, "Era apenas um baú comum cheio de moedas!", "Era um Mímico! Ele mordeu seu familiar.") },
                { label: "Ignorar", action: () => ExpedicaoGame.resolveEvent("Seguro", 0, 0, "Seu familiar desconfiou e seguiu em frente.") }
            ]
        }
    ],

    init: function() {
        const modalHtml = `
        <div id="modal-expedicao" class="modal-overlay" style="display: none; z-index: 150;">
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h2>Expedição do Familiar</h2>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; color: #2c3e50;">
                    <span id="exp-hp">HP: 3/3</span>
                    <span id="exp-loot">Saque: 0</span>
                    <span id="exp-step">Sala: 1/5</span>
                </div>
                <div id="exp-log" style="background: #34495e; color: #ecf0f1; padding: 15px; border-radius: 5px; min-height: 80px; margin-bottom: 15px; text-align: left; font-size: 1.1rem;">
                    O seu familiar está pronto para a aventura!
                </div>
                <div id="exp-choices" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                    <!-- Botões injetados via JS -->
                </div>
                <div style="display: flex; gap: 10px; flex-direction: column;">
                    <button id="btn-exp-return" class="btn warning" style="width: 100%;">RETORNAR COM O SAQUE</button>
                    <button id="close-expedicao-btn" class="btn danger" style="width: 100%;">SAIR DA EXPEDIÇÃO</button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        this.ui = {
            modal: document.getElementById('modal-expedicao'),
            hp: document.getElementById('exp-hp'),
            loot: document.getElementById('exp-loot'),
            step: document.getElementById('exp-step'),
            log: document.getElementById('exp-log'),
            choices: document.getElementById('exp-choices'),
            btnReturn: document.getElementById('btn-exp-return'),
            btnClose: document.getElementById('close-expedicao-btn')
        };

        this.ui.btnClose.addEventListener('click', () => {
            this.stop();
            const menuModal = document.getElementById('modal-minigames-menu');
            if (menuModal) menuModal.style.display = 'flex';
        });

        this.ui.btnReturn.addEventListener('click', () => {
            if (this.isActive && this.loot > 0) {
                this.endGame('fled');
            }
        });
    },

    start: function() {
        this.isActive = true;
        this.maxHp = 3;
        this.hp = this.maxHp;
        this.loot = 0;
        this.step = 1;
        
        this.ui.btnReturn.style.display = 'block';
        this.updateUI();
        this.setLog("Seu familiar adentra a escuridão da masmorra. O que aguarda lá dentro?");
        
        setTimeout(() => this.nextEncounter(), 1500);
    },

    stop: function() {
        this.isActive = false;
        if(this.ui && this.ui.modal) {
            this.ui.modal.style.display = 'none';
        }
    },

    updateUI: function() {
        this.ui.hp.innerText = `HP: ${this.hp}/${this.maxHp}`;
        this.ui.loot.innerText = `Saque: ${this.loot}`;
        this.ui.step.innerText = `Sala: ${this.step}/${this.maxSteps}`;
    },

    setLog: function(text) {
        this.ui.log.innerHTML = text;
        this.ui.choices.innerHTML = '';
    },

    nextEncounter: function() {
        if (!this.isActive) return;

        if (this.step > this.maxSteps) {
            this.endGame('cleared');
            return;
        }

        const evt = this.events[Math.floor(Math.random() * this.events.length)];
        this.setLog(`<strong>Sala ${this.step}:</strong><br><br>${evt.text}`);

        evt.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'btn primary';
            btn.innerText = choice.label;
            btn.onclick = () => {
                if (window.AudioFX) AudioFX.click();
                choice.action();
            };
            this.ui.choices.appendChild(btn);
        });
    },

    resolveEvent: function(type, rewardCoins, damageTaken, message) {
        this.loot += rewardCoins;
        this.hp -= damageTaken;
        this.processOutcome(message);
    },

    resolveRisk: function(rewardCoins, damageTaken, successMsg, failMsg) {
        const isSuccess = Math.random() > 0.5;
        if (isSuccess) {
            this.loot += rewardCoins;
            if (window.AudioFX) AudioFX.coin();
            this.processOutcome(`Sucesso! ${successMsg} (+${rewardCoins} moedas)`);
        } else {
            this.hp -= damageTaken;
            if (window.AudioFX) AudioFX.playTone(200, 'sawtooth', 0.2, 0.5);
            this.processOutcome(`Cuidado! ${failMsg} (-${damageTaken} HP)`);
        }
    },

    heal: function(amount, message) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        if (window.AudioFX) AudioFX.playTone(600, 'sine', 0.1, 0.5);
        this.processOutcome(message);
    },

    processOutcome: function(message) {
        this.updateUI();
        this.setLog(message);
        
        if (this.hp <= 0) {
            setTimeout(() => this.endGame('fainted'), 2000);
            return;
        }

        this.step++;
        setTimeout(() => this.nextEncounter(), 2000);
    },

    endGame: function(reason) {
        this.isActive = false;
        this.ui.btnReturn.style.display = 'none';

        if (reason === 'fainted') {
            this.setLog("<strong>Seu familiar desmaiou!</strong><br>Ele fugiu da masmorra derrubando todo o saque no caminho. Recompensa perdida.");
            this.loot = 0; 
            if (window.AudioFX) AudioFX.playTone(150, 'sawtooth', 0.5, 0.8);
        } else {
            let msg = reason === 'cleared' ? "<strong>Masmorra Concluída!</strong>" : "<strong>Retirada Estratégica!</strong>";
            this.setLog(`${msg}<br>Seu familiar voltou em segurança trazendo ${this.loot} moedas.`);
            if (window.AudioFX) AudioFX.levelUp();
            
            if (window.Game && window.Storage && window.UI && this.loot > 0) {
                Game.state.coins += this.loot;
                Storage.save(Game.state);
                UI.showFloatingText(`+${this.loot} Moedas`, 'coin');
                UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
            }
        }

        const btnPlayAgain = document.createElement('button');
        btnPlayAgain.className = 'btn primary';
        btnPlayAgain.innerText = 'NOVA EXPEDIÇÃO';
        btnPlayAgain.onclick = () => this.start();
        this.ui.choices.appendChild(btnPlayAgain);
    }
};

window.ExpedicaoGame = ExpedicaoGame;

document.addEventListener('DOMContentLoaded', () => {
    ExpedicaoGame.init();
});