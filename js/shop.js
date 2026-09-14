const Shop = {
    catalog: [
        { id: 'mesa_1', name: 'Mesa de Estudo', img: 'assets/images/mesa-estudo_1.png', price: 0, type: 'furniture', layer: 'layer-base' },
        { id: 'estante_1', name: 'Estante Clássica', img: 'assets/images/estante_1.png', price: 0, type: 'furniture', layer: 'layer-base' },
        { id: 'planta_1', name: 'Planta Pequena', img: 'assets/images/planta_1.png', price: 0, type: 'furniture', layer: 'layer-surface' }
    ],

    init: function() {
        if (!Game.state.inventory) Game.state.inventory = [];
        if (!Game.state.equippedItems) Game.state.equippedItems = [];
        if (!Game.state.furniturePositions) Game.state.furniturePositions = {};
        
        this.catalog.forEach(item => {
            if (item.price === 0 && !Game.state.inventory.includes(item.id)) {
                Game.state.inventory.push(item.id);
            }
        });
        Storage.save(Game.state);
    },

    renderShop: function() {
        const grid = UI.elements.shopGrid;
        if (!grid) return;
        grid.innerHTML = '';

        this.catalog.forEach(item => {
            const isOwned = Game.state.inventory.includes(item.id);
            const isEquipped = Game.state.equippedItems.includes(item.id);

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
        const index = Game.state.equippedItems.indexOf(itemId);
        
        if (index > -1) {
            Game.state.equippedItems.splice(index, 1); 
        } else {
            Game.state.equippedItems.push(itemId); 
            if (!Game.state.furniturePositions[itemId]) {
                // Posiciona no centro por padrão (atrás do avatar)
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
        if (!item) return;

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
            alert("Moedas insuficientes!");
        }
    }
};