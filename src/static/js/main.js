/**
 * Arquivo principal para inicialização do jogo
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("Inicializando o jogo...");
        
        // Inicializar o jogo
        const game = new Game();
        window.gameInstance = game; // Salvar instância do jogo globalmente para debug
        
        // Tela de boas-vindas
        const welcomeScreen = document.getElementById('welcome-screen');
        const gameScreen = document.getElementById('game-screen');
        const playerNameInput = document.getElementById('player-name');
        const startGameBtn = document.getElementById('start-game-btn');
        
        // Botões de fechamento das telas de overlay
        const closeButtons = document.querySelectorAll('.close-btn');
        
        // Iniciar o jogo quando clicar no botão
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                try {
                    const playerName = playerNameInput.value.trim() || 'Aventureiro';
                    console.log(`Iniciando jogo com o jogador: ${playerName}`);
                    
                    // Esconder tela de boas-vindas e mostrar tela do jogo
                    welcomeScreen.classList.add('hidden');
                    gameScreen.classList.remove('hidden');
                } catch (error) {
                    console.error('Error starting game:', error);
                    alert('Erro ao iniciar o jogo. Por favor, tente novamente.');
                }
            });
        }
        
        // Enter para iniciar o jogo
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' && startGameBtn) {
                    startGameBtn.click();
                }
            });
        }
        
        // Fechar todas as telas de overlay
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Encontrar o elemento pai com a classe 'overlay-screen'
                let overlay = button.closest('.overlay-screen');
                if (overlay) {
                    overlay.classList.add('hidden');
                }
            });
        });
        
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Erro ao carregar o jogo. Verifique o console para mais detalhes.');
    }
}); 