const Shop = {
    // Catálogo da loja. Coloquei price: 0 para que você possa testar livremente.
    catalog: [
        { id: 'mesa_1', name: 'Mesa de Estudo', img: 'assets/mesa-estudo_1.png', price: 0, type: 'furniture', layer: 'layer-base', posClass: 'pos-mesa' },
        { id: 'estante_1', name: 'Estante Clássica', img: 'assets/estante_1.png', price: 0, type: 'furniture', layer: 'layer-base', posClass: 'pos-estante' },
        { id: 'planta_1', name: 'Planta Pequena', img: 'assets/planta_1.png', price: 0, type: 'furniture', layer: 'layer-surface', posClass: 'pos-planta' }
    ],

    init: function() {
        // Garante que o jogador tenha os arrays no save
        if (!Game.state.inventory) Game.state.inventory = [];
        if (!Game.state.equippedItems) Game.state.equippedItems = [];
        
        // Como o preço é 0 (itens gratuitos/iniciais), adicionamos ao inventário automaticamente
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
                // Botão de Equipar/Desequipar
                buttonHTML = `<button class="btn-equip ${isEquipped ? 'equipped' : ''}" onclick="Shop.toggleEquip('${item.id}')">
                                ${isEquipped ? 'Equipado' : 'Usar'}
                              </button>`;
            } else {
                // Botão de Compra (para o futuro)
                buttonHTML = `<button class="btn-equip" onclick="Shop.buyItem('${item.id}')">💰 ${item.price}</button>`;
            }

            // Nota: O src da imagem puxa de assets/
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
            Game.state.equippedItems.splice(index, 1); // Desequipa se já tiver equipado
        } else {
            Game.state.equippedItems.push(itemId); // Equipa
        }
        
        Storage.save(Game.state);
        this.renderShop(); // Atualiza botões da loja
        UI.renderFurniture(Game.state.equippedItems, this.catalog); // Atualiza os móveis no cenário
        AudioFX.click();
    },

    buyItem: function(itemId) {
        const item = this.catalog.find(i => i.id === itemId);
        if (!item) return;

        if (Game.state.coins >= item.price) {
            Game.state.coins -= item.price;
            Game.state.inventory.push(itemId);
            Storage.save(Game.state);
            AudioFX.coin();
            this.renderShop();
            UI.updateStats(Game.state, Game.getXPForNextLevel(), Game.getTotalXPForLevel(Game.state.level));
        } else {
            alert("Moedas insuficientes!");
        }
    }
};