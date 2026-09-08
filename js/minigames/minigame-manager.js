// js/minigame-manager.js

const MinigameManager = (() => {
    let menuModal, forjaModal;
    let btnOpenMenu, btnCloseMenu, btnCloseForja;
    let btnSelectForja;

    function init() {
        // Elementos dos Modais
        menuModal = document.getElementById('modal-minigames-menu');
        forjaModal = document.getElementById('modal-forja');
        
        // Botões de Interface
        btnOpenMenu = document.getElementById('btn-mini-games'); // Botão roxo na tela de pausa
        btnCloseMenu = document.getElementById('close-minigames-menu-btn');
        btnCloseForja = document.getElementById('close-forja-btn');

        // Botões de Seleção dos Jogos
        btnSelectForja = document.getElementById('btn-select-forja');

        // Registra os Eventos
        registerEvents();
    }

    function registerEvents() {
        // Abre o menu de seleção ao clicar em "Jogar Mini-Games" na pausa
        if (btnOpenMenu) {
            btnOpenMenu.addEventListener('click', () => {
                openModal(menuModal);
            });
        }

        // Fecha o menu de seleção
        if (btnCloseMenu) {
            btnCloseMenu.addEventListener('click', () => closeModal(menuModal));
        }

        // Entra no mini-game da Forja
        if (btnSelectForja) {
            btnSelectForja.addEventListener('click', () => {
                closeModal(menuModal);
                openModal(forjaModal);
                
                // Inicia a lógica da Forja
                if (typeof ForjaGame !== 'undefined') {
                    ForjaGame.start();
                }
            });
        }

        // Fecha a forja pelo "X" e volta para o menu de seleção
        if (btnCloseForja) {
            btnCloseForja.addEventListener('click', () => {
                if (typeof ForjaGame !== 'undefined') ForjaGame.stop();
                closeModal(forjaModal);
                openModal(menuModal);
            });
        }
    }

    // Funções utilitárias de modal
    function openModal(modal) {
        if (modal) modal.classList.remove('hidden');
    }

    function closeModal(modal) {
        if (modal) modal.classList.add('hidden');
    }

    return { init };
})();

// Inicializa o gerenciador assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    MinigameManager.init();
});