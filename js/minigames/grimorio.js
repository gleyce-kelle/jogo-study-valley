window.GrimorioGame = {
    container: null,
    onComplete: null, // Callback que avisa o app.js da vitória

    selectedPieceId: null,
    gridState: [],
    placedPieces: [],

    // As 4 peças foram desenhadas milimetricamente para formar um 4x4
    piecesData: [
        { id: 1, color: '#8e44ad', symbol: 'ᛦ', shape: [[1, 1, 1, 1]] }, // Linha reta
        { id: 2, color: '#e67e22', symbol: 'ᛯ', shape: [[1, 1, 1], [0, 0, 1]] }, // L deitado
        { id: 3, color: '#2ecc71', symbol: 'ᚣ', shape: [[1, 1], [1, 1]] }, // Quadrado
        { id: 4, color: '#e74c3c', symbol: 'ᛤ', shape: [[0, 1], [0, 1], [1, 1]] } // L em pé invertido
    ],

    init: function() {
        this.container = document.getElementById('grimorio-container');
    },

    start: function(onCompleteCallback) {
        if (!this.container) this.init();
        this.onComplete = onCompleteCallback; // Salva o callback

        // Reseta o estado
        this.gridState = [
            [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]
        ];
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
        // Se clicar em uma peça já colocada, remove ela do tabuleiro
        if (this.gridState[r][c] !== 0) {
            const pieceId = this.gridState[r][c];
            this.removePiece(pieceId);
            if(window.AudioFX && window.AudioFX.click) window.AudioFX.click();
            return;
        }

        // Se tem peça selecionada, tenta encaixar
        if (this.selectedPieceId) {
            let piece = this.piecesData.find(p => p.id === this.selectedPieceId);
            if (this.canPlace(piece, r, c)) {
                this.placePiece(piece, r, c);
                this.selectedPieceId = null;
                this.render();
                this.checkWin();
            } else {
                if(window.AudioFX && window.AudioFX.error) window.AudioFX.error();
            }
        }
    },

    removePiece: function(id) {
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                if(this.gridState[i][j] === id) this.gridState[i][j] = 0;
            }
        }
        this.placedPieces = this.placedPieces.filter(pId => pId !== id);
        this.render();
    },

    canPlace: function(piece, startR, startC) {
        for(let i=0; i<piece.shape.length; i++) {
            for(let j=0; j<piece.shape[i].length; j++) {
                if(piece.shape[i][j] === 1) {
                    let targetR = startR + i;
                    let targetC = startC + j;
                    if(targetR < 0 || targetR >= 4 || targetC < 0 || targetC >= 4) return false; // Saiu da borda
                    if(this.gridState[targetR][targetC] !== 0) return false; // Sobrepôs outra peça
                }
            }
        }
        return true;
    },

    placePiece: function(piece, startR, startC) {
        for(let i=0; i<piece.shape.length; i++) {
            for(let j=0; j<piece.shape[i].length; j++) {
                if(piece.shape[i][j] === 1) {
                    this.gridState[startR + i][startC + j] = piece.id;
                }
            }
        }
        this.placedPieces.push(piece.id);
        if(window.AudioFX && window.AudioFX.coin) window.AudioFX.coin();
    },

    checkWin: function() {
        if (this.placedPieces.length === this.piecesData.length) {
            setTimeout(() => {
                if(window.AudioFX && window.AudioFX.levelUp) window.AudioFX.levelUp();
                this.showVictoryScreen();
                if (typeof this.onComplete === 'function') this.onComplete(); // Avisa o app.js
            }, 400);
        }
    },

    showVictoryScreen: function() {
        this.container.innerHTML = `
            <div class="grimorio-victory">
                <h3 style="font-size: 24px; color:#2ecc71; margin-bottom:10px;">✨ Grimório Restaurado! ✨</h3>
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
        for(let r=0; r<4; r++) {
            for(let c=0; c<4; c++) {
                let cell = document.createElement('div');
                cell.className = 'grimorio-cell';
                let val = this.gridState[r][c];
                if (val !== 0) {
                    let piece = this.piecesData.find(p => p.id === val);
                    cell.style.backgroundColor = piece.color;
                    cell.innerText = piece.symbol;
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
                    if(window.AudioFX && window.AudioFX.click) window.AudioFX.click();
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