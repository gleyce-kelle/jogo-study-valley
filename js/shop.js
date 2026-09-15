const Shop = {
    catalog: [
        { id: 'mesa_1', name: 'Mesa de Estudo', img: 'assets/images/mesa-estudo_1.png', price: 0, type: 'furniture', layer: 'layer-base' },
        { id: 'estante_1', name: 'Estante Clássica', img: 'assets/images/estante_1.png', price: 0, type: 'furniture', layer: 'layer-base' },
        { id: 'planta_1', name: 'Planta Pequena', img: 'assets/images/planta_1.png', price: 0, type: 'furniture', layer: 'layer-surface' },
        { id: 'furniture_cama_1', name: 'Cama Confortável', img: 'assets/images/cama_1.png', price: 150, type: 'furniture', layer: 'layer-base' },
        { id: 'furniture_guarda_roupa_1', name: 'Guarda-Roupa', img: 'assets/images/guarda-roupa_1.png', price: 120, type: 'furniture', layer: 'layer-base' },
        { id: 'furniture_mesa_canto_1', name: 'Mesa de Canto', img: 'assets/images/mesa-canto_1.png', price: 40, type: 'furniture', layer: 'layer-surface' },
        { id: 'furniture_tapete_1', name: 'Tapete Felpudo', img: 'assets/images/tapete_1.png', price: 60, type: 'furniture', layer: 'layer-base' },
        { id: 'furniture_abajur_1', name: 'Abajur Clássico', img: 'assets/images/abajur_1.png', price: 35, type: 'furniture', layer: 'layer-surface' },
        { id: 'furniture_decoracao_1', name: 'Quadro Decorativo', img: 'assets/images/decoracao_1.png', price: 45, type: 'furniture', layer: 'layer-surface' }
    ],

    init: function() {
        // Inicialização segura: Apenas cria as variáveis caso elas não existam,
        // mas NÃO força nenhum salvamento prematuro que possa resetar o jogo.
        if (typeof Game !== 'undefined' && Game.state) {
            if (!Game.state.inventory) Game.state.inventory = [];
            if (!Game.state.equippedItems) Game.state.equippedItems = [];
            if (!Game.state.furniturePositions) Game.state.furniturePositions = {};
        }
    },

    renderShop: function() {
        const grid = UI.elements.shopGrid;
        if (!grid) return;
        grid.innerHTML = '';

        this.catalog.forEach(item => {
            // ⚠️ MODO DE TESTE ATIVADO: Diz para a interface que você já possui todos os itens.
            // Para voltar as compras normais, comente a linha abaixo e descomente a original.
            
            const isOwned = true; // <-- LINHA DE TESTE (Tudo liberado para uso)
            // const isOwned = Game.state.inventory.includes(item.id); // <-- LINHA ORIGINAL (Requer compra)

            // Verificação de segurança para não travar o jogo se o save ainda estiver carregando
            const isEquipped = (typeof Game !== 'undefined' && Game.state && Game.state.equippedItems) 
                ? Game.state.equippedItems.includes(item.id) 
                : false;

            const card = document.createElement('div');
            card.className = 'shop-item';
            
            let buttonHTML = '';
            if (isOwned) {
                buttonHTML = `<button class="btn-equip ${isEquipped ? 'equipped' : ''}" onclick="Shop.toggleEquip('${item.id}')">
                                ${isEquipped ? 'Equipado' : 'Usar'}
                              </button>`;
            } else {
                buttonHTML = `<button class="btn-equip" onclick="Shop.buyItem('${item.id}')">💰 ${item.price}</button>`;
            }

            card.innerHTML = `
                <div class="shop-item-icon">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="shop-item-title">${item.name}</div>
                ${buttonHTML}
            `;
            grid.appendChild(card);
        });
    },

    toggleEquip: function(itemId) {
        if (!Game || !Game.state) return;
        
        const index = Game.state.equippedItems.indexOf(itemId);
        
        if (index > -1) {
            Game.state.equippedItems.splice(index, 1); 
        } else {
            Game.state.equippedItems.push(itemId); 
            if (!Game.state.furniturePositions) Game.state.furniturePositions = {};
            if (!Game.state.furniturePositions[itemId]) {
                Game.state.furniturePositions[itemId] = { x: 50, y: 50 }; 
            }
        }
        
        Storage.save(Game.state);
        this.renderShop(); 
        
        if (typeof UI !== 'undefined' && UI.renderFurniture) {
            UI.renderFurniture(Game.state.equippedItems, this.catalog, Game.state.furniturePositions);
        }
        
        if (typeof AudioFX !== 'undefined' && AudioFX.click) {
            AudioFX.click();
        }
        
        if (UI.elements && UI.elements.btnSaveFurniture) {
            UI.elements.btnSaveFurniture.style.display = 'block';
        }
    },

    buyItem: function(itemId) {
        const item = this.catalog.find(i => i.id === itemId);
        if (!item || !Game || !Game.state) return;

        if (Game.state.coins >= item.price) {
            Game.state.coins -= item.price;
            Game.state.inventory.push(itemId);
            Storage.save(Game.state);
            if (typeof AudioFX !== 'undefined' && AudioFX.coin) AudioFX.coin();
            this.renderShop();
            if (typeof UI !== 'undefined' && UI.updateStats) {
                UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
            }
        } else {
            this.showAlert("Moedas insuficientes para comprar este item!");
        }
    },

    showAlert: function(message) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.zIndex = '9999'; 

        const box = document.createElement('div');
        box.className = 'panel modal-box';
        
        const title = document.createElement('h2');
        title.innerText = 'Aviso';
        title.style.marginBottom = '10px';
        title.style.color = '#c62828'; 
        
        const text = document.createElement('p');
        text.innerText = message;
        text.style.fontSize = '24px';
        text.style.marginBottom = '20px';
        
        const btn = document.createElement('button');
        btn.className = 'btn danger';
        btn.innerText = 'OK';
        btn.onclick = () => document.body.removeChild(overlay);
        
        box.appendChild(title);
        box.appendChild(text);
        box.appendChild(btn);
        overlay.appendChild(box);
        
        document.body.appendChild(overlay);
    }
};