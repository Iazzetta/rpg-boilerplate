/**
 * Classe de renderização do jogo
 * Responsável por desenhar todos os elementos no canvas
 */
class Renderer {
    /**
     * Inicializa o renderizador
     * @param {HTMLCanvasElement} canvas - Elemento canvas para renderização
     * @param {object} game - Referência para a instância do jogo
     */
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        
        // Cores para tipos de terreno
        this.terrainColors = {
            city: '#7EC850',    // Verde claro
            forest: '#2D6A4F',  // Verde escuro
            mountain: '#A97C50', // Marrom
            desert: '#E9C46A',  // Areia
            water: '#5AA9E6',   // Azul
            snow: '#F0F3F5',    // Branco
            cave: '#666666',    // Cinza
            default: '#7EC850'  // Verde padrão
        };
        
        // Cores para tipos de recursos
        this.resourceColors = {
            ore: '#8D6E63',    // Marrom
            wood: '#795548',   // Marrom mais escuro
            herb: '#4CAF50',   // Verde
            fish: '#81D4FA',   // Azul claro
            default: '#FFB300' // Amarelo
        };
        
        console.log("Renderer inicializado!");
    }
    
    /**
     * Método principal de renderização
     */
    render() {
        // Limpar o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar fundo da área
        this.renderAreaBackground();
        
        // Renderizar recursos
        this.renderResources();
        
        // Renderizar NPCs e inimigos
        this.renderNPCs();
        
        // Renderizar saídas e objetos
        this.renderExits();
        
        // Renderizar jogador
        this.renderPlayer();
        
        // Renderizar efeitos
        this.renderEffects();
    }
    
    /**
     * Renderiza o fundo da área
     */
    renderAreaBackground() {
        const area = this.game.currentArea;
        
        // Definir cor do terreno
        const terrainColor = this.terrainColors[area.type] || this.terrainColors.default;
        
        // Preencher fundo
        this.ctx.fillStyle = terrainColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar grid opcional para referência
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Grid vertical
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Grid horizontal
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Nome da área
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(area.name || 'Área Desconhecida', 10, 30);
    }
    
    /**
     * Renderiza os recursos na área
     */
    renderResources() {
        const area = this.game.currentArea;
        
        if (!area.resources || !area.resources.length) return;
        
        area.resources.forEach(resource => {
            if (resource.active === false) return; // Pular recursos inativos
            
            // Determinar cor do recurso
            const resourceColor = this.resourceColors[resource.resource_type] || this.resourceColors.default;
            
            // Desenhar círculo para representar o recurso
            this.ctx.fillStyle = resourceColor;
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Borda do recurso
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Nome do recurso
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(resource.name, resource.x, resource.y - 25);
            
            // Barra de progresso se estiver coletando
            if (this.game.harvesting && 
                this.game.harvestData && 
                this.game.harvestData.resource.id === resource.id) {
                    
                const now = Date.now();
                const elapsed = now - this.game.harvestData.startTime;
                const progress = Math.min(elapsed / this.game.harvestData.duration, 1);
                
                // Desenhar barra de progresso
                const barWidth = 40;
                const barHeight = 6;
                
                // Fundo da barra
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(resource.x - barWidth/2, resource.y - 15, barWidth, barHeight);
                
                // Barra de progresso
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(resource.x - barWidth/2, resource.y - 15, barWidth * progress, barHeight);
            }
        });
    }
    
    /**
     * Renderiza NPCs e inimigos
     */
    renderNPCs() {
        const area = this.game.currentArea;
        
        if (!area.npcs || !area.npcs.length) return;
        
        area.npcs.forEach(npc => {
            if (npc.active === false) return; // Pular NPCs inativos
            
            // Cor baseada no tipo
            let color;
            switch (npc.type) {
                case 'enemy':
                    color = '#FF5252'; // Vermelho
                    break;
                case 'merchant':
                    color = '#FFC107'; // Amarelo
                    break;
                case 'quest':
                    color = '#2196F3'; // Azul
                    break;
                default:
                    color = '#9C27B0'; // Roxo
            }
            
            // Desenhar NPC como um quadrado
            this.ctx.fillStyle = color;
            this.ctx.fillRect(npc.x - 16, npc.y - 16, 32, 32);
            
            // Borda
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(npc.x - 16, npc.y - 16, 32, 32);
            
            // Nome e nível para inimigos
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            
            if (npc.type === 'enemy') {
                const level = npc.level || 1;
                this.ctx.fillText(`${npc.name} Lv.${level}`, npc.x, npc.y - 25);
                
                // Barra de vida para inimigos
                if (npc.health !== undefined && npc.maxHealth !== undefined) {
                    const hpPercentage = npc.health / npc.maxHealth;
                    const barWidth = 40;
                    const barHeight = 5;
                    
                    // Fundo da barra
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.fillRect(npc.x - barWidth/2, npc.y - 20, barWidth, barHeight);
                    
                    // Barra de HP
                    this.ctx.fillStyle = '#FF5252';
                    this.ctx.fillRect(npc.x - barWidth/2, npc.y - 20, barWidth * hpPercentage, barHeight);
                }
            } else {
                this.ctx.fillText(npc.name, npc.x, npc.y - 25);
            }
        });
    }
    
    /**
     * Renderiza as saídas da área
     */
    renderExits() {
        const area = this.game.currentArea;
        
        if (!area.exits || !area.exits.length) return;
        
        area.exits.forEach(exit => {
            // Desenhar saída como portal
            this.ctx.fillStyle = '#9C27B0'; // Roxo
            this.ctx.beginPath();
            this.ctx.arc(exit.x, exit.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Borda
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Texto interno
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('→', exit.x, exit.y);
            
            // Nome do destino
            this.ctx.font = '12px Arial';
            this.ctx.fillText(exit.name || exit.target_area, exit.x, exit.y - 35);
            this.ctx.textBaseline = 'alphabetic';
        });
    }
    
    /**
     * Renderiza o jogador
     */
    renderPlayer() {
        const player = this.game.player;
        
        if (!player) return;
        
        // Desenhar jogador como um círculo azul
        this.ctx.fillStyle = '#3F51B5'; // Azul
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borda
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Nome do jogador
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.username, player.x, player.y - 25);
        
        // Desenhar linha de movimento
        if (this.game.playerMoving && this.game.targetPosition) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(player.x, player.y);
            this.ctx.lineTo(this.game.targetPosition.x, this.game.targetPosition.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Resetar
        }
    }
    
    /**
     * Renderiza efeitos visuais
     */
    renderEffects() {
        // Renderiza efeitos de batalha
        if (this.game.inBattle && this.game.battleData) {
            const player = this.game.player;
            const enemy = this.game.battleData.enemy;
            
            if (!player || !enemy) return;
            
            // Linha de combate
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(player.x, player.y);
            this.ctx.lineTo(enemy.x, enemy.y);
            this.ctx.stroke();
            
            // Ícone de batalha
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc((player.x + enemy.x) / 2, (player.y + enemy.y) / 2, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('⚔️', (player.x + enemy.x) / 2, (player.y + enemy.y) / 2);
            this.ctx.textBaseline = 'alphabetic';
        }
    }
}

// Exportar para uso global
window.Renderer = Renderer; 