window.GrimorioGame = {
    container: null,
    onComplete: null,

    selectedPieceId: null,
    gridState: [],
    placedPieces: [],
    gridSize: 8,

    // Nova paleta de cores: "Cozy RPG Gemstones & Earth Tones"
    piecesData: [
        { id: 1, color: '#593c7a', symbol: 'ᛦ', shape: [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]] }, // Ametista (Roxo rústico)
        { id: 2, color: '#a23b3c', symbol: 'ᛯ', shape: [[1,1],[1,1],[1,1],[1,1]] },               // Rubi Envelhecido (Vermelho escuro)
        { id: 3, color: '#2d5a27', symbol: 'ᚣ', shape: [[1,1],[1,1],[1,1],[1,1]] },               // Musgo da Floresta (Verde profundo)
        { id: 4, color: '#c96f41', symbol: 'ᛤ', shape: [[1,1],[1,1]] },                           // Cobre (Laranja terroso)
        { id: 5, color: '#34627d', symbol: 'ᛥ', shape: [[1,1,1],[1,0,0],[1,0,0]] },               // Água Profunda (Azul pálido)
        { id: 6, color: '#227068', symbol: 'ᛨ', shape: [[1,0,0,0],[1,1,1,1]] },                   // Malaquita (Verde-azulado escuro)
        { id: 7, color: '#474f63', symbol: 'ᛩ', shape: [[1,1,1,1]] },                             // Ardósia (Cinza chumbo)
        { id: 8, color: '#c49c3b', symbol: 'ᛪ', shape: [[1,1,1,1]] },                             // Ouro Velho (Mostarda)
        { id: 9, color: '#7c2a39', symbol: '᛫', shape: [[1,1,1,1,1],[1,1,1,1,1]] }                // Vinho/Bordô
    ],

    init: function() {
        this.container = document.getElementById('grimorio-container');
    },

    start: function(onCompleteCallback) {
        if (!this.container) this.init();
        this.onComplete = onCompleteCallback; 

        this.gridState = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        
        this.placedPieces = [];
        this.selectedPieceId = null;

        this.render();
    },

    stop: function() {
        if (this.container) this.container.innerHTML = '';
        this.gridState = [];
        this.placedPieces = [];
        this.selectedPieceId = null;
        this.onComplete = null;
    },

    clickCell: function(r, c) {
        if (this.gridState[r][c] !== 0) {
            const pieceId = this.gridState[r][c];
            this.removePiece(pieceId);
            if (typeof AudioFX !== 'undefined' && typeof AudioFX.click === 'function') {
                AudioFX.click();
            }
            return;
        }

        if (this.selectedPieceId) {
            let piece = this.piecesData.find(p => p.id === this.selectedPieceId);
            if (this.canPlace(piece, r, c)) {
                this.placePiece(piece, r, c);
                this.selectedPieceId = null;
                this.render();
                this.checkWin();
            } else {
                if (typeof AudioFX !== 'undefined' && typeof AudioFX.error === 'function') {
                    AudioFX.error();
                }
            }
        }
    },

    removePiece: function(id) {
        for(let i = 0; i < this.gridSize; i++) {
            for(let j = 0; j < this.gridSize; j++) {
                if(this.gridState[i][j] === id) this.gridState[i][j] = 0;
            }
        }
        this.placedPieces = this.placedPieces.filter(pId => pId !== id);
        this.render();
    },

    canPlace: function(piece, startR, startC) {
        for(let i = 0; i < piece.shape.length; i++) {
            for(let j = 0; j < piece.shape[i].length; j++) {
                if(piece.shape[i][j] === 1) {
                    let targetR = startR + i;
                    let targetC = startC + j;
                    if(targetR < 0 || targetR >= this.gridSize || targetC < 0 || targetC >= this.gridSize) return false; 
                    if(this.gridState[targetR][targetC] !== 0) return false; 
                }
            }
        }
        return true;
    },

    placePiece: function(piece, startR, startC) {
        for(let i = 0; i < piece.shape.length; i++) {
            for(let j = 0; j < piece.shape[i].length; j++) {
                if(piece.shape[i][j] === 1) {
                    this.gridState[startR + i][startC + j] = piece.id;
                }
            }
        }
        this.placedPieces.push(piece.id);
        if (typeof AudioFX !== 'undefined' && typeof AudioFX.coin === 'function') {
            AudioFX.coin();
        }
    },

    checkWin: function() {
        if (this.placedPieces.length === this.piecesData.length) {
            setTimeout(() => {
                if (typeof AudioFX !== 'undefined' && typeof AudioFX.levelUp === 'function') {
                    AudioFX.levelUp();
                }
                this.showVictoryScreen();
                if (typeof this.onComplete === 'function') this.onComplete(); 
            }, 400);
        }
    },

    showVictoryScreen: function() {
        this.container.innerHTML = `
            <div class="grimorio-victory">
                <h3 style="font-size: 24px; color:#2ecc71; margin-bottom:10px;"> Grimório Restaurado! </h3>
                <p style="color: #fff; font-size: 16px;">Você conjurou o <strong style="color:#f1c40f;">Feitiço da Mente Clara</strong>!</p>
                <p style="font-size: 14px; color:#bdc3c7; margin-top:10px;">A próxima sessão renderá +20% de XP.</p>
            </div>
        `;
    },

    render: function() {
        let html = `<div class="grimorio-game-area">
                        <div class="grimorio-board" id="g-board"></div>
                        <div class="grimorio-tray" id="g-tray"></div>
                    </div>`;
        this.container.innerHTML = html;
        
        const boardEl = document.getElementById('g-board');
        for(let r = 0; r < this.gridSize; r++) {
            for(let c = 0; c < this.gridSize; c++) {
                let cell = document.createElement('div');
                cell.className = 'grimorio-cell';
                let val = this.gridState[r][c];
                if (val !== 0) {
                    let piece = this.piecesData.find(p => p.id === val);
                    cell.style.backgroundColor = piece.color;
                    cell.innerText = piece.symbol;
                    cell.style.borderColor = "transparent";
                }
                cell.onclick = () => this.clickCell(r, c);
                boardEl.appendChild(cell);
            }
        }

        const trayEl = document.getElementById('g-tray');
        this.piecesData.forEach(piece => {
            if (!this.placedPieces.includes(piece.id)) {
                let pEl = document.createElement('div');
                pEl.className = 'grimorio-piece ' + (this.selectedPieceId === piece.id ? 'selected' : '');
                pEl.onclick = () => {
                    this.selectedPieceId = (this.selectedPieceId === piece.id) ? null : piece.id;
                    this.render();
                    if (typeof AudioFX !== 'undefined' && typeof AudioFX.click === 'function') {
                        AudioFX.click();
                    }
                };
                
                piece.shape.forEach(row => {
                    let rowEl = document.createElement('div');
                    rowEl.className = 'grimorio-piece-row';
                    row.forEach(val => {
                        let cEl = document.createElement('div');
                        cEl.className = 'grimorio-piece-cell ' + (val ? '' : 'empty');
                        if(val) {
                            cEl.style.backgroundColor = piece.color;
                            cEl.innerText = piece.symbol;
                        }
                        rowEl.appendChild(cEl);
                    });
                    pEl.appendChild(rowEl);
                });
                trayEl.appendChild(pEl);
            }
        });
    }
};