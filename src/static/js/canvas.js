/**
 * Classe para gerenciar a renderização do jogo em canvas
 */
class Canvas {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Cores para tipos de terreno
        this.terrainColors = {
            grass: '#7EC850',
            water: '#5AA9E6',
            mountain: '#A97C50',
            forest: '#2D6A4F',
            sand: '#E9C46A',
            snow: '#F0F3F5',
            stone: '#8D99AE',
            dirt: '#AA8976'
        };
        
        // Cores para tipos de recursos
        this.resourceColors = {
            ore: '#8D6E63',    // Marrom
            wood: '#795548',   // Marrom mais escuro
            herb: '#4CAF50',   // Verde
            fish: '#81D4FA',   // Azul claro
            default: '#FFB300' // Amarelo
        };
        
        // Iniciar loop de renderização
        this.initializeCanvas();
        this.startRenderLoop();
    }
    
    /**
     * Inicializa o canvas e registra event listeners
     */
    initializeCanvas() {
        // Ajustar tamanho do canvas para tela
        this.resizeCanvas();
        
        // Registrar event listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Event listener para cliques no canvas
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            this.game.handleObjectClick(x, y);
        });
        
        // Forçar uma renderização imediata
        this.render();
    }
    
    /**
     * Redimensiona o canvas com base no tamanho da tela
     */
    resizeCanvas() {
        const gameArea = document.getElementById('game-world');
        this.canvas.width = gameArea.clientWidth;
        this.canvas.height = gameArea.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Re-renderizar após redimensionamento
        this.render();
    }
    
    /**
     * Inicia o loop de renderização
     */
    startRenderLoop() {
        const loop = () => {
            this.render();
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
    
    /**
     * Renderiza o jogo no canvas
     */
    render() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Verificar se há uma área atual
        if (!this.game.currentArea) {
            this.renderLoadingScreen();
            return;
        }
        
        // Renderizar fundo da área
        this.renderAreaBackground();
        
        // Renderizar recursos
        this.renderResources();
        
        // Renderizar NPCs (inimigos)
        this.renderNPCs();
        
        // Renderizar outros objetos interativos
        this.renderInteractiveObjects();
        
        // Renderizar jogador
        this.renderPlayer();
        
        // Renderizar ações em andamento
        this.renderActiveActions();
    }
    
    /**
     * Renderiza uma tela de carregamento quando não há área
     */
    renderLoadingScreen() {
        this.ctx.fillStyle = '#2E2E3A';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Carregando...', this.width / 2, this.height / 2);
    }
    
    /**
     * Renderiza o fundo da área atual
     */
    renderAreaBackground() {
        const area = this.game.currentArea;
        
        // Se a área tem um terreno definido, usar a cor correspondente
        if (area.terrain) {
            const color = this.terrainColors[area.terrain] || '#7EC850';
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            // Fundo padrão
            this.ctx.fillStyle = '#7EC850';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Renderizar elementos de decoração se existirem
        if (area.decorations) {
            for (const decoration of area.decorations) {
                this.ctx.fillStyle = decoration.color || '#8D6E63';
                this.ctx.fillRect(decoration.x, decoration.y, decoration.width || 20, decoration.height || 20);
            }
        }
    }
    
    /**
     * Renderiza os recursos da área
     */
    renderResources() {
        const area = this.game.currentArea;
        
        if (!area.resources) return;
        
        for (const resource of area.resources) {
            // Pular recursos invisíveis (já coletados)
            if (resource.visible === false) continue;
            
            // Selecionar cor baseada no tipo de recurso
            const resourceType = resource.resource_type || 'default';
            const color = this.resourceColors[resourceType] || this.resourceColors.default;
            
            // Desenhar o recurso
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Rótulo se estiver próximo
            const playerDist = this.getDistanceToPlayer(resource.x, resource.y);
            if (playerDist < 200) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(resource.name, resource.x, resource.y - 20);
            }
        }
    }
    
    /**
     * Renderiza os NPCs da área (incluindo inimigos)
     */
    renderNPCs() {
        const area = this.game.currentArea;
        
        if (!area.npcs) return;
        
        for (const npc of area.npcs) {
            // Pular NPCs invisíveis (derrotados)
            if (npc.visible === false) continue;
            
            // Cor baseada no tipo de NPC
            let color = '#E57373'; // Vermelho para inimigos
            
            if (npc.type === 'friendly' || npc.type === 'quest') {
                color = '#4FC3F7'; // Azul para NPCs amigáveis
            } else if (npc.type === 'merchant') {
                color = '#FFB74D'; // Laranja para mercadores
            }
            
            // Desenhar o NPC
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(npc.x, npc.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Barra de HP para inimigos
            if (npc.type === 'enemy' || npc.type === 'boss') {
                if (npc.health !== undefined && npc.maxHealth !== undefined) {
                    const hpWidth = 40;
                    const hpHeight = 5;
                    const healthPercentage = npc.health / npc.maxHealth;
                    
                    // Background da barra
                    this.ctx.fillStyle = '#333333';
                    this.ctx.fillRect(npc.x - hpWidth/2, npc.y - 35, hpWidth, hpHeight);
                    
                    // Barra de HP
                    this.ctx.fillStyle = '#E53935';
                    this.ctx.fillRect(npc.x - hpWidth/2, npc.y - 35, hpWidth * healthPercentage, hpHeight);
                }
            }
            
            // Rótulo
            const playerDist = this.getDistanceToPlayer(npc.x, npc.y);
            if (playerDist < 200) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(npc.name, npc.x, npc.y - 25);
                
                // Mostrar nível para inimigos
                if (npc.level && (npc.type === 'enemy' || npc.type === 'boss')) {
                    this.ctx.fillText(`Nível ${npc.level}`, npc.x, npc.y - 10);
                }
            }
        }
    }
    
    /**
     * Renderiza outros objetos interativos
     */
    renderInteractiveObjects() {
        const area = this.game.currentArea;
        
        // Renderizar saídas da área
        if (area.exits) {
            for (const exit of area.exits) {
                this.ctx.fillStyle = '#9C27B0'; // Roxo para saídas
                this.ctx.fillRect(exit.x - 15, exit.y - 15, 30, 30);
                
                // Rótulo
                const playerDist = this.getDistanceToPlayer(exit.x, exit.y);
                if (playerDist < 200) {
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.font = '14px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`Para: ${exit.target_area}`, exit.x, exit.y - 20);
                }
            }
        }
        
        // Renderizar outros objetos interativos
        if (area.objects) {
            for (const obj of area.objects) {
                let color = '#9E9E9E'; // Cinza para objetos genéricos
                
                if (obj.type === 'market') {
                    color = '#FFEB3B'; // Amarelo para mercados
                } else if (obj.type === 'forge') {
                    color = '#FF5722'; // Laranja/vermelho para forjas
                } else if (obj.type === 'chest') {
                    color = '#8D6E63'; // Marrom para baús
                }
                
                // Desenhar o objeto
                this.ctx.fillStyle = color;
                this.ctx.fillRect(obj.x - 15, obj.y - 15, 30, 30);
                
                // Rótulo
                const playerDist = this.getDistanceToPlayer(obj.x, obj.y);
                if (playerDist < 200) {
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.font = '14px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(obj.name, obj.x, obj.y - 20);
                }
            }
        }
    }
    
    /**
     * Renderiza o jogador
     */
    renderPlayer() {
        const player = this.game.player;
        
        if (!player) return;
        
        // Atualizar posição do jogador se estiver se movendo
        if (this.game.playerMoving && this.game.targetPosition) {
            this.game.updatePlayerPosition();
        }
        
        // Desenhar o jogador
        this.ctx.fillStyle = '#3F51B5'; // Azul para o jogador
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Nome do jogador
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name, player.x, player.y - 25);
        
        // Desenhar um círculo de interação ao redor do jogador (opcional)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, this.game.interactionDistance, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Renderiza ações em andamento (coleta, combate, etc)
     */
    renderActiveActions() {
        // Renderizar barra de progresso para coleta
        if (this.game.harvesting) {
            const { startTime, duration, resourcePosition } = this.game.harvestData;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Desenhar barra de progresso
            const barWidth = 60;
            const barHeight = 8;
            
            // Fundo da barra
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(resourcePosition.x - barWidth/2, resourcePosition.y - 40, barWidth, barHeight);
            
            // Progresso
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(resourcePosition.x - barWidth/2, resourcePosition.y - 40, barWidth * progress, barHeight);
            
            // Texto (opcional)
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Coletando...', resourcePosition.x, resourcePosition.y - 50);
        }
        
        // Renderizar indicadores de batalha
        if (this.game.inBattle) {
            const { enemy, lastHitTime } = this.game.battleData;
            
            // Renderizar linha entre jogador e inimigo
            if (enemy) {
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.game.player.x, this.game.player.y);
                this.ctx.lineTo(enemy.x, enemy.y);
                this.ctx.stroke();
                
                // Animação de hit (piscar por um curto período)
                if (lastHitTime && Date.now() - lastHitTime < 300) {
                    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(enemy.x, enemy.y, 25, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    /**
     * Calcula a distância entre o jogador e um ponto
     * @param {number} x - Coordenada X do ponto
     * @param {number} y - Coordenada Y do ponto
     * @returns {number} Distância em pixels
     */
    getDistanceToPlayer(x, y) {
        const player = this.game.player;
        
        if (!player) return Infinity;
        
        const dx = player.x - x;
        const dy = player.y - y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Retorna um objeto na posição clicada
     * @param {number} x - Coordenada X do clique
     * @param {number} y - Coordenada Y do clique
     * @returns {object|null} Objeto clicado ou null
     */
    getObjectAtPosition(x, y) {
        const area = this.game.currentArea;
        
        if (!area) return null;
        
        // Raio de clique (tolerância)
        const clickRadius = 20;
        
        // Verificar todos os tipos de objetos
        
        // Verificar NPCs primeiro
        if (area.npcs) {
            for (const npc of area.npcs) {
                // Pular NPCs invisíveis
                if (npc.visible === false) continue;
                
                const dist = Math.sqrt((npc.x - x) ** 2 + (npc.y - y) ** 2);
                if (dist <= clickRadius) {
                    return {...npc, type: npc.type || 'enemy'};
                }
            }
        }
        
        // Verificar recursos
        if (area.resources) {
            for (const resource of area.resources) {
                // Pular recursos invisíveis
                if (resource.visible === false) continue;
                
                const dist = Math.sqrt((resource.x - x) ** 2 + (resource.y - y) ** 2);
                if (dist <= clickRadius) {
                    return {...resource, type: 'resource'};
                }
            }
        }
        
        // Verificar saídas
        if (area.exits) {
            for (const exit of area.exits) {
                const dist = Math.sqrt((exit.x - x) ** 2 + (exit.y - y) ** 2);
                if (dist <= clickRadius) {
                    return {...exit, type: 'exit'};
                }
            }
        }
        
        // Verificar outros objetos interativos
        if (area.objects) {
            for (const obj of area.objects) {
                const dist = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2);
                if (dist <= clickRadius) {
                    return obj;
                }
            }
        }
        
        return null;
    }
} 