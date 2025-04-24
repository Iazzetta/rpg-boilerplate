/**
 * Classe principal do jogo
 */
class Game {
    constructor() {
        this.player = {
            username: "Aventureiro",
            level: 1,
            health: 100,
            maxHealth: 100,
            exp: 0,
            next_level_exp: 100,
            gold: 50,
            x: 0, 
            y: 0,
            stats: {
                strength: 10,
                intelligence: 10,
                dexterity: 10,
                constitution: 10
            }
        };
        
        this.currentArea = {
            id: "city",
            name: "Cidade Principal",
            type: "city",
            resources: [],
            npcs: [],
            exits: []
        };
        
        this.inventory = [];
        this.equipment = {};
        this.stats = {};
        this.skillLevels = {
            mining: 1,
            woodcutting: 1,
            fishing: 1,
            herbalism: 1,
            crafting: 1
        };
        
        // Propriedades de movimento e interação
        this.playerMoving = false;
        this.targetPosition = null;
        this.interactionDistance = 50; // Distância para interagir com objetos
        this.moveSpeed = 2.5; // Velocidade de movimento em pixels por frame
        
        // Propriedades para coleta de recursos
        this.harvesting = false;
        this.harvestData = null;
        
        // Propriedades para batalha
        this.inBattle = false;
        this.battleData = null;
        this.battleCooldown = 1500; // Tempo entre ataques em ms
        this.lastAttackTime = 0;
        
        // Propriedades para respawn
        this.respawnTimers = {
            resources: {},
            enemies: {}
        };
        
        // Inicializar a UI
        this.ui = new UI(this);
        
        // Inicializar o jogo
        this.init();
        
        // Inicializar canvas e renderizador
        this.initCanvas();
    }
    
    /**
     * Inicializa o canvas e o renderizador
     */
    initCanvas() {
        try {
            // Criar canvas
            const gameArea = document.getElementById('game-world');
            
            if (!gameArea) {
                console.error('Elemento game-world não encontrado!');
                return;
            }
            
            // Verificar se já existe um canvas
            let canvas = document.getElementById('game-canvas');
            
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = 'game-canvas';
                gameArea.appendChild(canvas);
            }
            
            // Configurar tamanho
            canvas.width = gameArea.clientWidth || 800;
            canvas.height = gameArea.clientHeight || 600;
            
            // Salvar referência
            this.canvas = canvas;
            
            // Inicializar renderizador
            this.renderer = new Renderer(canvas, this);
            
            // Adicionar listeners de eventos
            this.addCanvasListeners();
            
            // Iniciar loop de renderização
            this.startGameLoop();
            
            console.log('Canvas inicializado com sucesso:', canvas.width, 'x', canvas.height);
        } catch (error) {
            console.error('Erro ao inicializar canvas:', error);
        }
    }
    
    /**
     * Adiciona os listeners de eventos ao canvas
     */
    addCanvasListeners() {
        if (!this.canvas) return;
        
        this.canvas.addEventListener('click', (event) => {
            // Obter a posição exata do clique relativa ao canvas
            const rect = this.canvas.getBoundingClientRect();
            
            // Calcular a escala do canvas (caso ele tenha sido redimensionado via CSS)
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            // Converter coordenadas do cliente para coordenadas do canvas
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;
            
            console.log('Clique no canvas em:', x, y, 'Dimensões canvas:', this.canvas.width, 'x', this.canvas.height);
            this.handleObjectClick(x, y);
        });
        
        console.log('Listeners de canvas adicionados');
    }
    
    /**
     * Inicia o loop principal do jogo
     */
    startGameLoop() {
        // Loop de atualização
        this.gameLoopInterval = setInterval(() => {
            this.update();
        }, 1000 / 60); // 60 FPS
        
        console.log('Loop do jogo iniciado');
    }
    
    /**
     * Atualiza o estado do jogo a cada frame
     */
    update() {
        // Atualizar posição do jogador
        this.updatePlayerPosition();
        
        // Atualizar batalha se estiver em uma
        if (this.inBattle) {
            this.updateBattle();
        }
        
        // Atualizar coleta se estiver coletando
        if (this.harvesting) {
            this.updateHarvesting();
        }
        
        // Renderizar o jogo
        if (this.renderer) {
            this.renderer.render();
        }
    }
    
    /**
     * Inicializa o jogo e carrega dados iniciais
     */
    async init() {
        try {
            console.log('Inicializando o jogo...');
            
            // Posicionar jogador no centro da tela
            const gameArea = document.getElementById('game-world');
            if (gameArea) {
                this.player.x = (gameArea.clientWidth / 2) - 16;
                this.player.y = (gameArea.clientHeight / 2) - 16;
            } else {
                this.player.x = 400 - 16;
                this.player.y = 300 - 16;
            }

            // Criar recursos iniciais para a área
            this.createInitialResources();
            
            console.log('Jogo inicializado com sucesso');
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }
    
    /**
     * Cria recursos iniciais para a área
     */
    createInitialResources() {
        // Adicionar alguns recursos para testes
        this.currentArea.resources = [
            {
                id: 'resource_1',
                name: 'Minério de Ferro',
                resource_type: 'ore',
                x: 100,
                y: 150,
                active: true
            },
            {
                id: 'resource_2',
                name: 'Árvore',
                resource_type: 'wood',
                x: 250,
                y: 200,
                active: true
            },
            {
                id: 'resource_3',
                name: 'Erva Medicinal',
                resource_type: 'herb',
                x: 400,
                y: 300,
                active: true
            }
        ];
        
        // Adicionar alguns NPCs para testes
        this.currentArea.npcs = [
            {
                id: 'npc_1',
                name: 'Mercador',
                type: 'merchant',
                x: 550,
                y: 150,
                active: true
            },
            {
                id: 'enemy_1',
                name: 'Slime',
                type: 'enemy',
                level: 1,
                health: 30,
                maxHealth: 30,
                x: 150,
                y: 350,
                active: true
            }
        ];
        
        // Adicionar saídas para outras áreas
        this.currentArea.exits = [
            {
                id: 'exit_1',
                name: 'Floresta',
                target_area: 'forest',
                x: 700,
                y: 400
            }
        ];
        
        console.log('Recursos iniciais criados');
    }
    
    /**
     * Processa o clique em um objeto no canvas
     * @param {number} x - Coordenada X do clique
     * @param {number} y - Coordenada Y do clique
     */
    handleObjectClick(x, y) {
        console.log('Processando clique em:', x, y);
        
        // Verificar se há um objeto na posição
        const clickedObject = this.getObjectAtPosition(x, y);
        
        if (clickedObject) {
            console.log('Objeto clicado:', clickedObject);
            
            // Definir o alvo e iniciar movimento
            this.targetPosition = { x: clickedObject.x, y: clickedObject.y };
            this.playerMoving = true;
            this.targetObject = clickedObject;
        } else {
            // Apenas mover para a posição clicada
            this.targetPosition = { x, y };
            this.playerMoving = true;
            this.targetObject = null;
            
            // Cancelar qualquer batalha ou coleta em andamento
            this.resetInteractionStates();
        }
    }
    
    /**
     * Encontra um objeto na posição especificada
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {object|null} Objeto encontrado ou null
     */
    getObjectAtPosition(x, y) {
        if (!this.currentArea) return null;
        
        // Distância para considerar clique no objeto
        const clickDistance = 25; // Aumentado para melhorar detecção
        
        // Verificar recursos
        if (this.currentArea.resources) {
            for (const resource of this.currentArea.resources) {
                if (resource.active === false) continue;
                
                const dx = x - resource.x;
                const dy = y - resource.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < clickDistance) {
                    return { ...resource, type: 'resource' };
                }
            }
        }
        
        // Verificar NPCs
        if (this.currentArea.npcs) {
            for (const npc of this.currentArea.npcs) {
                if (npc.active === false) continue;
                
                const dx = x - npc.x;
                const dy = y - npc.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < clickDistance) {
                    // Determinar o tipo correto de NPC
                    let npcType = 'npc';
                    if (npc.type === 'enemy') {
                        npcType = 'enemy';
                    } else if (npc.type === 'merchant') {
                        npcType = 'merchant';
                    }
                    return { ...npc, type: npcType };
                }
            }
        }
        
        // Verificar saídas
        if (this.currentArea.exits) {
            for (const exit of this.currentArea.exits) {
                const dx = x - exit.x;
                const dy = y - exit.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < clickDistance) {
                    return { ...exit, type: 'exit' };
                }
            }
        }
        
        // Não encontrou nenhum objeto
        return null;
    }
    
    /**
     * Atualiza a posição do jogador durante o movimento
     */
    updatePlayerPosition() {
        if (!this.playerMoving || !this.targetPosition || !this.player) return;
        
        // Calcular distância até o alvo (sem adicionar 16, usar coordenadas brutas)
        const dx = this.targetPosition.x - this.player.x;
        const dy = this.targetPosition.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Se chegou próximo ao destino
        if (distance < this.moveSpeed) {
            this.player.x = this.targetPosition.x;
            this.player.y = this.targetPosition.y;
            this.playerMoving = false;
            
            // Se tinha um objeto alvo, interagir com ele
            if (this.targetObject) {
                this.interactWithObject(this.targetObject);
            }
            
            // Limpar target
            this.targetPosition = null;
            return;
        }
        
        // Mover em direção ao alvo
        const moveX = (dx / distance) * this.moveSpeed;
        const moveY = (dy / distance) * this.moveSpeed;
        
        this.player.x += moveX;
        this.player.y += moveY;
    }
    
    /**
     * Interage com um objeto após chegar perto dele
     * @param {object} object - Objeto para interagir
     */
    interactWithObject(object) {
        console.log('Interagindo com objeto:', object);
        
        switch (object.type) {
            case 'resource':
                this.startHarvesting(object);
                break;
                
            case 'enemy':
                this.startBattle(object);
                break;
                
            case 'exit':
                this.changeArea(object.target_area);
                break;
                
            case 'merchant':
                this.openMarket(object);
                break;
                
            default:
                console.log('Tipo de objeto desconhecido:', object.type);
        }
        
        this.targetObject = null;
    }
    
    /**
     * Inicia a coleta de um recurso
     * @param {object} resource - Recurso para coletar
     */
    startHarvesting(resource) {
        console.log('Iniciando coleta de:', resource.name);
        
        // Definir tempo de coleta
        const harvestTime = 3000; // 3 segundos
        
        // Iniciar coleta
        this.harvesting = true;
        this.harvestData = {
            resource: resource,
            startTime: Date.now(),
            duration: harvestTime,
            resourcePosition: { x: resource.x, y: resource.y }
        };
        
        // Mostrar a interface de coleta
        if (this.ui) {
            this.ui.showHarvestUI(resource);
        }
        
        console.log(`Coletando ${resource.name}...`);
    }
    
    /**
     * Atualiza o estado da coleta de recursos
     */
    updateHarvesting() {
        if (!this.harvesting || !this.harvestData) return;
        
        const now = Date.now();
        const elapsed = now - this.harvestData.startTime;
        const progress = Math.min(1, elapsed / this.harvestData.duration);
        const percentage = Math.floor(progress * 100);
        
        // Atualizar barra de progresso na UI
        if (this.ui && this.ui.updateHarvestProgress) {
            this.ui.updateHarvestProgress(percentage, this.harvestData.duration);
        }
        
        // Se completou a coleta
        if (progress >= 1) {
            this.completeHarvesting();
        }
    }
    
    /**
     * Conclui a coleta de um recurso
     */
    completeHarvesting() {
        if (!this.harvesting || !this.harvestData) return;
        
        const resource = this.harvestData.resource;
        
        console.log(`Coleta de ${resource.name} concluída!`);
        
        // Ocultar recurso temporariamente
        this.hideResource(resource);
        
        // Determinar quantidade coletada (1-3)
        const itemQuantity = Math.floor(Math.random() * 3) + 1;
        
        // Gerar item coletado
        const itemColetado = { 
            id: `item_${Date.now()}`, 
            name: resource.name, 
            quantity: itemQuantity,
            rarity: 'common',
            item_type: 'resource',
            description: `${resource.name} coletado da área ${this.currentArea.name}`
        };
        
        // Verificar se já existe este item no inventário para agrupamento
        let itemAdicionado = false;
        if (this.player.inventory) {
            // Procurar por item similar (mesmo nome e tipo)
            const existingItemIndex = this.player.inventory.findIndex(
                item => item.name === itemColetado.name && 
                       item.item_type === itemColetado.item_type && 
                       !item.is_equippable && 
                       !item.is_unique
            );
            
            if (existingItemIndex !== -1) {
                // Aumentar a quantidade do item existente
                if (!this.player.inventory[existingItemIndex].quantity) {
                    this.player.inventory[existingItemIndex].quantity = 1;
                }
                this.player.inventory[existingItemIndex].quantity += itemQuantity;
                itemAdicionado = true;
                console.log(`Quantidade de ${resource.name} aumentada para ${this.player.inventory[existingItemIndex].quantity}`);
            }
        }
        
        // Se não encontrou item similar, adicionar como novo item
        if (!itemAdicionado) {
            if (!this.player.inventory) {
                this.player.inventory = [];
            }
            this.player.inventory.push(itemColetado);
            console.log(`${resource.name} (${itemQuantity}) adicionado ao inventário.`);
        }
        
        // Atualizar UI de inventário
        if (this.ui) {
            this.ui.updatePlayerInfo(this.player);
            this.ui.updateSidebarInventory(this.player.inventory, this.player.equipment || []);
        }
        
        // Atualizar UI de coleta (fechar automaticamente após coleta)
        if (this.ui) {
            this.ui.showHarvestResults([itemColetado]);
            
            // Fechar a tela de coleta após 2 segundos
            setTimeout(() => {
                this.ui.hideHarvestUI();
            }, 2000);
        }
        
        // Limpar estado de coleta
        this.harvesting = false;
        this.harvestData = null;
    }
    
    /**
     * Oculta um recurso temporariamente após coleta
     * @param {object} resource - Recurso para ocultar
     */
    hideResource(resource) {
        const resourceIndex = this.currentArea.resources.findIndex(r => 
            r.id === resource.id);
            
        if (resourceIndex !== -1) {
            this.currentArea.resources[resourceIndex].active = false;
            
            // Configurar respawn depois de 10 segundos
            setTimeout(() => {
                this.currentArea.resources[resourceIndex].active = true;
                console.log(`${resource.name} reapareceu.`);
            }, 10000);
        }
    }
    
    /**
     * Inicia uma batalha com um inimigo
     * @param {object} enemy - Inimigo para batalhar
     */
    startBattle(enemy) {
        console.log('Iniciando batalha com:', enemy.name);
        
        // Preparar dados de batalha
        this.inBattle = true;
        this.battleData = {
            enemy: { ...enemy },
            lastAttackTime: 0,
            lastHitTime: 0,
            cooldown: this.battleCooldown,
            autoAttack: false    // Atacar manualmente por padrão
        };
        
        // Configurar HP do inimigo se não estiver definido
        if (!this.battleData.enemy.health) {
            this.battleData.enemy.health = this.battleData.enemy.maxHealth || 30;
        }
        
        if (!this.battleData.enemy.maxHealth) {
            this.battleData.enemy.maxHealth = this.battleData.enemy.health;
        }
        
        // Mostrar a UI de batalha
        if (this.ui) {
            this.ui.showBattleUI(this.battleData.enemy);
        }
        
        // Iniciar primeiro ataque do inimigo após um curto delay
        setTimeout(() => {
            if (this.inBattle) {
                this.enemyAttack();
            }
        }, 1500);
    }
    
    /**
     * Atualiza o estado da batalha
     */
    updateBattle() {
        if (!this.inBattle || !this.battleData) return;
        
        // Calcular cooldown
        const now = Date.now();
        const elapsed = now - this.battleData.lastAttackTime;
        const cooldownPercentage = Math.min(100, (elapsed / this.battleCooldown) * 100);
        
        // Atualizar a UI de batalha com o cooldown
        if (this.ui && this.ui.updateBattleCooldown) {
            this.ui.updateBattleCooldown(cooldownPercentage);
        }
        
        // Não atacar automaticamente, deixar para o jogador clicar no botão
    }
    
    /**
     * Realiza um ataque ao inimigo
     */
    attackEnemy() {
        if (!this.inBattle || !this.battleData) return;
        
        // Atualizar timestamp do último ataque
        this.battleData.lastAttackTime = Date.now();
        this.battleData.lastHitTime = Date.now();
        
        // Calcular dano baseado nos atributos do jogador
        const damage = 5 + Math.floor(this.player.stats.strength / 2);
        
        // Reduzir HP do inimigo
        const enemy = this.battleData.enemy;
        enemy.health = Math.max(0, enemy.health - damage);
        
        console.log(`Atacou ${enemy.name} causando ${damage} de dano. HP restante: ${enemy.health}`);
        
        // Atualizar UI de batalha
        if (this.ui) {
            this.ui.updateBattleLog(`Você atacou ${enemy.name} causando ${damage} de dano!`);
            this.ui.updateBattleEnemyHealth(enemy.health, enemy.maxHealth);
        }
        
        // Verificar se o inimigo foi derrotado
        if (enemy.health <= 0) {
            this.endBattle(true);
            return;
        }
    }
    
    /**
     * Processa o ataque do inimigo
     */
    enemyAttack() {
        if (!this.inBattle || !this.battleData) return;
        
        const enemy = this.battleData.enemy;
        const damage = 3 + Math.floor(enemy.level || 1);
        
        // Reduzir HP do jogador
        this.player.health = Math.max(0, this.player.health - damage);
        
        console.log(`${enemy.name} atacou causando ${damage} de dano. Seu HP: ${this.player.health}`);
        
        // Atualizar UI
        if (this.ui) {
            this.ui.updateBattleLog(`${enemy.name} atacou você causando ${damage} de dano!`);
            this.ui.updateBattlePlayerHealth(this.player.health, this.player.maxHealth);
        }
        
        // Verificar se o jogador morreu
        if (this.player.health <= 0) {
            this.endBattle(false);
            return;
        }
        
        // Programar próximo ataque do inimigo apenas se a batalha continuar
        setTimeout(() => {
            if (this.inBattle) {
                this.enemyAttack();
            }
        }, this.battleCooldown + Math.random() * 500);
    }
    
    /**
     * Finaliza a batalha
     * @param {boolean} victory - Se o jogador venceu
     */
    endBattle(victory) {
        if (!this.inBattle) return;
        
        const enemy = this.battleData.enemy;
        
        if (victory) {
            console.log(`Você derrotou ${enemy.name}!`);
            
            // Adicionar experiência e recompensas
            const expGain = 10 + (enemy.level || 1) * 5;
            const goldGain = 5 + Math.floor(Math.random() * 10) * (enemy.level || 1);
            
            this.player.exp += expGain;
            this.player.gold += goldGain;
            
            // Gerar drops aleatórios (simulação)
            const drops = [];
            const dropChance = Math.random();
            
            if (dropChance > 0.3) {
                drops.push({
                    id: `drop_${Date.now()}_1`,
                    name: "Poção Pequena",
                    rarity: "common",
                    quantity: 1
                });
            }
            
            if (dropChance > 0.7) {
                drops.push({
                    id: `drop_${Date.now()}_2`,
                    name: "Material de Monstro",
                    rarity: "uncommon",
                    quantity: Math.floor(Math.random() * 2) + 1
                });
            }
            
            if (this.ui) {
                this.ui.showBattleResults(true, expGain, goldGain, drops);
            }
        } else {
            console.log(`Você foi derrotado por ${enemy.name}!`);
            
            // Recuperar um pouco de vida
            this.player.health = Math.floor(this.player.maxHealth * 0.3);
            
            if (this.ui) {
                this.ui.showBattleResults(false);
            }
        }
        
        // Limpar estado de batalha
        this.inBattle = false;
        this.battleData = null;
    }
    
    /**
     * Retorna o tipo de habilidade necessária para o tipo de recurso
     * @param {string} resourceType - Tipo de recurso
     * @returns {string} Tipo de habilidade
     */
    getSkillTypeForResource(resourceType) {
        switch (resourceType) {
            case 'ore': return 'mining';
            case 'wood': return 'woodcutting';
            case 'fish': return 'fishing';
            case 'herb': return 'herbalism';
            default: return 'gathering';
        }
    }
    
    /**
     * Reseta todos os estados de interação
     */
    resetInteractionStates() {
        // Limpar estado de coleta
        if (this.harvesting) {
            this.harvesting = false;
            this.harvestData = null;
        }
        
        // Limpar estado de batalha
        if (this.inBattle) {
            this.inBattle = false;
            this.battleData = null;
        }
    }
    
    /**
     * Abre a interface do mercador
     * @param {object} merchant - Objeto do mercador
     */
    openMarket(merchant) {
        console.log('Abrindo mercado do mercador:', merchant.name);
        
        // Criar itens simulados para o mercador
        const merchantItems = [
            {
                id: 'market_item_1',
                name: 'Poção de Cura',
                description: 'Restaura 50 pontos de vida',
                price: 20,
                rarity: 'common',
                item_type: 'consumable'
            },
            {
                id: 'market_item_2',
                name: 'Espada de Ferro',
                description: '+5 de Força',
                price: 100,
                rarity: 'uncommon',
                item_type: 'weapon',
                is_equippable: true
            },
            {
                id: 'market_item_3',
                name: 'Armadura de Couro',
                description: '+3 de Defesa',
                price: 80,
                rarity: 'common',
                item_type: 'armor',
                is_equippable: true
            }
        ];
        
        // Mostrar interface do mercado
        if (this.ui) {
            this.ui.showMarket(merchantItems, this.player.gold);
        }
    }
    
    /**
     * Compra um item do mercador
     * @param {string} itemId - ID do item a ser comprado
     * @returns {Promise<boolean>} Promessa que resolve para true se a compra foi bem-sucedida
     */
    async buyItem(itemId) {
        console.log(`Tentando comprar item: ${itemId}`);
        
        // Encontrar o item pelo ID (simulado com os itens padrão do mercador)
        const merchantItems = [
            {
                id: 'market_item_1',
                name: 'Poção de Cura',
                description: 'Restaura 50 pontos de vida',
                price: 20,
                rarity: 'common',
                item_type: 'consumable'
            },
            {
                id: 'market_item_2',
                name: 'Espada de Ferro',
                description: '+5 de Força',
                price: 100,
                rarity: 'uncommon',
                item_type: 'weapon',
                is_equippable: true
            },
            {
                id: 'market_item_3',
                name: 'Armadura de Couro',
                description: '+3 de Defesa',
                price: 80,
                rarity: 'common',
                item_type: 'armor',
                is_equippable: true
            }
        ];
        
        const item = merchantItems.find(item => item.id === itemId);
        
        if (!item) {
            console.error(`Item não encontrado: ${itemId}`);
            return false;
        }
        
        // Verificar se o jogador tem ouro suficiente
        if (this.player.gold < item.price) {
            console.log(`Ouro insuficiente para comprar ${item.name}. Necessário: ${item.price}, Disponível: ${this.player.gold}`);
            
            // Mostrar mensagem de erro (pode ser implementado na UI)
            if (this.ui && this.ui.addToLog) {
                this.ui.addToLog(`Ouro insuficiente para comprar ${item.name}.`);
            }
            
            return false;
        }
        
        // Deduzir o preço do item
        this.player.gold -= item.price;
        
        // Adicionar item ao inventário (cópia do item com ID único)
        const boughtItem = {
            ...item,
            id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        };
        
        // Adicionar ao inventário
        if (!this.player.inventory) {
            this.player.inventory = [];
        }
        
        this.player.inventory.push(boughtItem);
        
        console.log(`Item comprado com sucesso: ${item.name}`);
        
        // Atualizar a UI
        if (this.ui) {
            // Atualizar informações do jogador
            this.ui.updatePlayerInfo(this.player);
            
            // Adicionar mensagem ao log
            if (this.ui.addToLog) {
                this.ui.addToLog(`Você comprou ${item.name} por ${item.price} de ouro.`);
            }
            
            // Atualizar inventário na barra lateral
            if (this.ui.updateSidebarInventory) {
                this.ui.updateSidebarInventory(this.player.inventory, this.player.equipment);
            }
        }
        
        return true;
    }
    
    /**
     * Muda para outra área
     * @param {string} targetArea - ID da área alvo
     */
    changeArea(targetArea) {
        console.log(`Mudando para área: ${targetArea}`);
        
        // Simulação da mudança de área (criar nova área)
        switch (targetArea) {
            case 'forest':
                this.currentArea = {
                    id: "forest",
                    name: "Floresta Densa",
                    type: "forest",
                    resources: [
                        {
                            id: 'resource_forest_1',
                            name: 'Árvore Antiga',
                            resource_type: 'wood',
                            x: 150,
                            y: 200,
                            active: true
                        },
                        {
                            id: 'resource_forest_2',
                            name: 'Ervas Raras',
                            resource_type: 'herb',
                            x: 300,
                            y: 250,
                            active: true
                        }
                    ],
                    npcs: [
                        {
                            id: 'enemy_forest_1',
                            name: 'Lobo Selvagem',
                            type: 'enemy',
                            level: 2,
                            health: 45,
                            maxHealth: 45,
                            x: 400,
                            y: 300,
                            active: true
                        }
                    ],
                    exits: [
                        {
                            id: 'exit_forest_1',
                            name: 'Cidade Principal',
                            target_area: 'city',
                            x: 50,
                            y: 50
                        }
                    ]
                };
                break;
            case 'city':
                // Voltar para a cidade inicial
                this.createInitialResources();
                break;
            default:
                console.error(`Área desconhecida: ${targetArea}`);
                return;
        }
        
        // Atualizar a UI com a nova área
        if (this.ui) {
            this.ui.updateAreaInfo(this.currentArea);
        }
    }
    
    /**
     * Seleciona um item do inventário ou equipamento
     * @param {object} item - Item selecionado
     * @param {string} source - Fonte do item (inventory/equipment)
     */
    selectItem(item, source) {
        console.log(`Item selecionado: ${item.name} de ${source}`);
        
        // Adicionar a fonte ao item para saber como tratá-lo
        const itemWithSource = { ...item, source };
        
        // Mostrar detalhes do item
        if (this.ui) {
            this.ui.showItemDetails(itemWithSource);
        }
    }
    
    /**
     * Usa um item consumível
     * @param {object} item - Item a ser usado
     * @returns {boolean} Sucesso da operação
     */
    useItem(item) {
        console.log(`Tentando usar item: ${item.name}`);
        
        if (!item || !item.item_type || item.item_type !== 'consumable') {
            console.error('Item inválido ou não é consumível');
            return false;
        }
        
        // Remover o item do inventário
        const inventoryIndex = this.player.inventory.findIndex(i => i.id === item.id);
        if (inventoryIndex === -1) {
            console.error('Item não encontrado no inventário');
            return false;
        }
        
        // Verificar se é um item de cura
        if (item.name.toLowerCase().includes('poção') || item.name.toLowerCase().includes('cura')) {
            // Curar o jogador (valor fixo de 50 pontos)
            const healAmount = 50;
            this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
            console.log(`Jogador curado em ${healAmount} pontos de vida. Vida atual: ${this.player.health}`);
            
            // Adicionar mensagem ao log
            if (this.ui) {
                this.ui.addToLog(`Você usou ${item.name} e recuperou ${healAmount} pontos de vida.`);
            }
        }
        
        // Reduzir a quantidade do item ou removê-lo
        if (this.player.inventory[inventoryIndex].quantity && this.player.inventory[inventoryIndex].quantity > 1) {
            this.player.inventory[inventoryIndex].quantity--;
            console.log(`Quantidade reduzida: ${this.player.inventory[inventoryIndex].quantity}`);
        } else {
            // Remover o item completamente
            this.player.inventory.splice(inventoryIndex, 1);
            console.log('Item removido do inventário');
        }
        
        // Atualizar UI
        if (this.ui) {
            this.ui.updatePlayerInfo(this.player);
            this.ui.updateSidebarInventory(this.player.inventory, this.player.equipment || []);
            this.ui.hideItemDetails();
        }
        
        return true;
    }
    
    /**
     * Vende um item
     * @param {object} item - Item a ser vendido
     * @returns {boolean} Sucesso da operação
     */
    sellItem(item) {
        console.log(`Tentando vender item: ${item.name}`);
        
        if (!item) return false;
        
        // Encontrar o item no inventário
        const inventoryIndex = this.player.inventory.findIndex(i => i.id === item.id);
        if (inventoryIndex === -1) {
            console.error('Item não encontrado no inventário');
            return false;
        }
        
        // Calcular valor de venda (5% do preço original)
        let sellPrice = 0;
        if (item.price) {
            sellPrice = Math.floor(item.price * 0.05);
        } else {
            // Preço base para itens sem preço definido
            sellPrice = 1;
        }
        
        // Adicionar ouro ao jogador
        this.player.gold += sellPrice;
        
        // Reduzir a quantidade do item ou removê-lo
        if (this.player.inventory[inventoryIndex].quantity && this.player.inventory[inventoryIndex].quantity > 1) {
            this.player.inventory[inventoryIndex].quantity--;
            console.log(`Quantidade reduzida: ${this.player.inventory[inventoryIndex].quantity}`);
        } else {
            // Remover o item completamente
            this.player.inventory.splice(inventoryIndex, 1);
            console.log('Item removido do inventário');
        }
        
        // Atualizar UI
        if (this.ui) {
            this.ui.updatePlayerInfo(this.player);
            this.ui.updateSidebarInventory(this.player.inventory, this.player.equipment || []);
            this.ui.hideItemDetails();
            this.ui.addToLog(`Você vendeu ${item.name} por ${sellPrice} de ouro.`);
        }
        
        return true;
    }
    
    /**
     * Equipa um item
     * @param {object} item - Item a ser equipado
     * @returns {boolean} Sucesso da operação
     */
    equipItem(item) {
        console.log(`Tentando equipar: ${item.name}`);
        
        if (!item || !item.is_equippable) {
            console.error('Item inválido ou não é equipável');
            return false;
        }
        
        // Inicializar array de equipamento se não existir
        if (!this.player.equipment) {
            this.player.equipment = [];
        }
        
        // Determinar o tipo de slot
        let slotType = item.item_type;
        
        // Verificar se já existe um item no mesmo slot
        const equippedItemIndex = this.player.equipment.findIndex(i => i.item_type === slotType);
        let equippedItem = null;
        
        if (equippedItemIndex !== -1) {
            // Guardar o item equipado para movê-lo para o inventário
            equippedItem = this.player.equipment[equippedItemIndex];
            // Remover o item equipado
            this.player.equipment.splice(equippedItemIndex, 1);
        }
        
        // Remover o novo item do inventário
        const inventoryIndex = this.player.inventory.findIndex(i => i.id === item.id);
        if (inventoryIndex === -1) {
            console.error('Item não encontrado no inventário');
            return false;
        }
        
        // Remover o item do inventário
        this.player.inventory.splice(inventoryIndex, 1);
        
        // Adicionar o item ao equipamento
        this.player.equipment.push(item);
        
        // Se tinha um item equipado, movê-lo para o inventário
        if (equippedItem) {
            this.player.inventory.push(equippedItem);
        }
        
        // Atualizar UI
        if (this.ui) {
            this.ui.updatePlayerInfo(this.player);
            this.ui.updateSidebarInventory(this.player.inventory, this.player.equipment);
            this.ui.hideItemDetails();
            this.ui.addToLog(`Você equipou ${item.name}.`);
        }
        
        return true;
    }
    
    /**
     * Desequipa um item
     * @param {object} item - Item a ser desequipado
     * @returns {boolean} Sucesso da operação
     */
    unequipItem(item) {
        console.log(`Tentando desequipar: ${item.name}`);
        
        if (!this.player.equipment) {
            console.error('Jogador não tem itens equipados');
            return false;
        }
        
        // Encontrar o item no equipamento
        const equipmentIndex = this.player.equipment.findIndex(i => i.id === item.id);
        if (equipmentIndex === -1) {
            console.error('Item não encontrado no equipamento');
            return false;
        }
        
        // Remover o item do equipamento
        const removedItem = this.player.equipment.splice(equipmentIndex, 1)[0];
        
        // Adicionar o item ao inventário
        if (!this.player.inventory) {
            this.player.inventory = [];
        }
        
        this.player.inventory.push(removedItem);
        
        // Atualizar UI
        if (this.ui) {
            this.ui.updatePlayerInfo(this.player);
            this.ui.updateSidebarInventory(this.player.inventory, this.player.equipment);
            this.ui.hideItemDetails();
            this.ui.addToLog(`Você desequipou ${item.name}.`);
        }
        
        return true;
    }
}

// Inicialização
window.Game = Game; 