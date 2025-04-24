/**
 * Classe para gerenciar a interface do usuário
 */
class UI {
    constructor(game) {
        this.game = game;
        
        // Iniciar com verificações de elementos críticos
        try {
            // Elementos da UI principal
            this.playerNameElement = document.getElementById('player-name-display');
            this.levelElement = document.getElementById('level-value');
            this.goldElement = document.getElementById('gold-value');
            this.expBarElement = document.getElementById('exp-fill');
            this.expTextElement = document.getElementById('exp-text');
            this.hpBarElement = document.getElementById('hp-fill');
            this.hpTextElement = document.getElementById('hp-text');
            this.strengthElement = document.getElementById('strength-value');
            this.intelligenceElement = document.getElementById('intelligence-value');
            this.dexterityElement = document.getElementById('dexterity-value');
            this.constitutionElement = document.getElementById('constitution-value');
            this.attributePointsElement = document.getElementById('attribute-points-value');
            this.logContentElement = document.getElementById('log-content');
            
            // Verificar elementos essenciais
            if (!this.playerNameElement) console.warn('Elemento player-name-display não encontrado');
            if (!this.hpBarElement) console.warn('Elemento hp-fill não encontrado');
            if (!this.logContentElement) console.warn('Elemento log-content não encontrado');
            
            // Elementos das telas de overlay
            this.inventoryScreen = document.getElementById('inventory-screen');
            this.statsScreen = document.getElementById('stats-screen');
            this.mapScreen = document.getElementById('map-screen');
            this.marketScreen = document.getElementById('market-screen');
            this.forgeScreen = document.getElementById('forge-screen');
            this.battleScreen = document.getElementById('battle-screen');
            this.harvestScreen = document.getElementById('harvest-screen');
            this.itemDetailsScreen = document.getElementById('item-details-screen');
            
            // Elementos para barras de progresso
            this.harvestProgressBar = document.getElementById('harvest-progress-bar');
            this.harvestProgressText = document.getElementById('harvest-progress-text');
            this.battleCooldownBar = document.getElementById('battle-cooldown-bar');
            this.battleCooldownText = document.getElementById('battle-cooldown-text');
            
            // Adicionar mensagem de boas-vindas ao log
            this.addToLog('Bem-vindo ao jogo!');
            
            // Criar inventário vazio para inicialização
            const emptyInventory = [];
            
            // Inicializar a sidebar com inventário vazio
            this.updateSidebarInventory(emptyInventory, []);
            
            // Inicializar eventos da UI
            this.initEvents();
            
            // Atualizar informações iniciais do jogador
            if (game && game.player) {
                this.updatePlayerInfo(game.player);
            }
        } catch (error) {
            console.error("Erro ao inicializar a UI:", error);
        }
    }
    
    /**
     * Atualizar informações do jogador na UI
     * @param {object} player - Dados do jogador
     */
    updatePlayerInfo(player) {
        if (!player) return;
        
        try {
            // Informações básicas
            if (this.playerNameElement) this.playerNameElement.textContent = player.username;
            if (this.levelElement) this.levelElement.textContent = player.level;
            if (this.goldElement) this.goldElement.textContent = player.gold;
            
            // Barra de experiência
            const expPercentage = (player.exp / player.next_level_exp) * 100;
            if (this.expBarElement) this.expBarElement.style.width = `${expPercentage}%`;
            if (this.expTextElement) this.expTextElement.textContent = `${player.exp}/${player.next_level_exp}`;
            
            // Barra de HP
            const hpPercentage = (player.health / player.maxHealth) * 100;
            if (this.hpBarElement) this.hpBarElement.style.width = `${hpPercentage}%`;
            if (this.hpTextElement) this.hpTextElement.textContent = `${player.health}/${player.maxHealth}`;
            
            // Atributos básicos
            if (this.strengthElement) this.strengthElement.textContent = player.stats.strength;
            if (this.intelligenceElement) this.intelligenceElement.textContent = player.stats.intelligence;
            if (this.dexterityElement) this.dexterityElement.textContent = player.stats.dexterity;
            if (this.constitutionElement) this.constitutionElement.textContent = player.stats.constitution;
            if (this.attributePointsElement) this.attributePointsElement.textContent = player.attribute_points || 0;
        } catch (error) {
            console.error("Erro ao atualizar informações do jogador:", error);
        }
    }
    
    /**
     * Adicionar mensagem ao log
     * @param {string} message - Mensagem a adicionar
     */
    addToLog(message) {
        // Verificar se o elemento de log existe
        if (!this.logContentElement) {
            console.log("Log: " + message);
            return;
        }
        
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry');
        logEntry.textContent = message;
        
        this.logContentElement.appendChild(logEntry);
        this.logContentElement.scrollTop = this.logContentElement.scrollHeight;
    }
    
    /**
     * Mostrar inventário do jogador
     * @param {object} player - Dados do jogador
     */
    showInventory(player) {
        // Esconder outras telas de overlay
        this.hideAllOverlays();
        
        // Atualizar contagem de itens
        document.getElementById('inventory-count').textContent = player.inventory.length;
        document.getElementById('inventory-max').textContent = player.inventory_size;
        
        // Limpar listas de itens
        const equippedItemsList = document.getElementById('equipped-items-list');
        const inventoryItemsList = document.getElementById('inventory-items-list');
        equippedItemsList.innerHTML = '';
        inventoryItemsList.innerHTML = '';
        
        // Preencher itens equipados
        if (player.equipment.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'Nenhum item equipado';
            emptyMessage.classList.add('empty-message');
            equippedItemsList.appendChild(emptyMessage);
        } else {
            player.equipment.forEach(item => {
                const itemElement = this.createItemElement(item, 'equipment');
                equippedItemsList.appendChild(itemElement);
            });
        }
        
        // Preencher itens do inventário
        if (player.inventory.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'Inventário vazio';
            emptyMessage.classList.add('empty-message');
            inventoryItemsList.appendChild(emptyMessage);
        } else {
            player.inventory.forEach(item => {
                const itemElement = this.createItemElement(item, 'inventory');
                inventoryItemsList.appendChild(itemElement);
            });
        }
        
        // Mostrar tela
        this.inventoryScreen.classList.remove('hidden');
    }
    
    /**
     * Criar elemento para um item
     * @param {object} item - Dados do item
     * @param {string} source - Fonte do item (inventory/equipment)
     * @returns {HTMLElement} Elemento HTML para o item
     */
    createItemElement(item, source) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.classList.add(`item-rarity-${item.rarity}`);
        itemElement.dataset.itemId = item.id;
        
        const imageElement = document.createElement('div');
        imageElement.classList.add('item-image');
        
        // Definir ícone com base no tipo de item
        let icon = '?';
        switch (item.item_type) {
            case 'general': icon = item.is_equippable ? '⚔️' : '📦'; break;
            case 'resource': icon = '🔷'; break;
            case 'buffer': icon = '🧪'; break;
            case 'mount': icon = '🐎'; break;
            case 'scroll': icon = '📜'; break;
            case 'weapon': icon = '⚔️'; break;
            case 'armor': icon = '🛡️'; break;
            case 'consumable': icon = '🧪'; break;
        }
        imageElement.textContent = icon;
        
        const nameElement = document.createElement('div');
        nameElement.classList.add('item-name');
        nameElement.textContent = item.name;
        
        itemElement.appendChild(imageElement);
        itemElement.appendChild(nameElement);
        
        // Adicionar evento de clique
        if (source === 'inventory' || source === 'equipment') {
            itemElement.addEventListener('click', () => {
                this.game.selectItem(item, source);
            });
        }
        
        // Adicionar tooltip
        this.addItemTooltip(itemElement, item);
        
        return itemElement;
    }
    
    /**
     * Adiciona tooltip a um elemento de item
     * @param {HTMLElement} element - Elemento ao qual adicionar o tooltip
     * @param {object} item - Dados do item
     */
    addItemTooltip(element, item) {
        // Criar elemento de tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'item-tooltip';
        tooltip.style.display = 'none';
        tooltip.style.position = 'absolute';
        
        // Nome com raridade
        const nameElement = document.createElement('div');
        nameElement.className = `tooltip-name item-rarity-${item.rarity}`;
        nameElement.textContent = item.name;
        tooltip.appendChild(nameElement);
        
        // Tipo
        const typeElement = document.createElement('div');
        typeElement.className = 'tooltip-type';
        
        // Formatar o tipo
        let typeText = '';
        switch (item.item_type) {
            case 'weapon': typeText = 'Arma'; break;
            case 'armor': typeText = 'Armadura'; break;
            case 'consumable': typeText = 'Consumível'; break;
            case 'resource': typeText = 'Recurso'; break;
            case 'scroll': typeText = 'Pergaminho'; break;
            default: typeText = 'Item';
        }
        
        typeElement.textContent = typeText;
        tooltip.appendChild(typeElement);
        
        // Descrição
        if (item.description) {
            const descElement = document.createElement('div');
            descElement.className = 'tooltip-description';
            descElement.textContent = item.description;
            tooltip.appendChild(descElement);
        }
        
        // Stats
        if (item.stats) {
            const statsElement = document.createElement('div');
            statsElement.className = 'tooltip-stats';
            
            for (const [key, value] of Object.entries(item.stats)) {
                if (value && key !== 'id' && key !== 'created_at') {
                    const statRow = document.createElement('div');
                    statRow.className = 'tooltip-stat';
                    
                    // Formatar nome do stat
                    let statName = key.replace(/_/g, ' ');
                    statName = statName.charAt(0).toUpperCase() + statName.slice(1);
                    
                    // Formatar valor (percentagem ou não)
                    let statValue = value;
                    if (key.includes('chance') || key.includes('power') || key === 'luck') {
                        if (typeof value === 'number') {
                            statValue = `${(value * 100).toFixed(1)}%`;
                        }
                    }
                    
                    statRow.innerHTML = `<span class="stat-name">${statName}:</span> <span class="stat-value">${statValue}</span>`;
                    statsElement.appendChild(statRow);
                }
            }
            
            tooltip.appendChild(statsElement);
        }
        
        // Preço (se disponível)
        if (item.price) {
            const priceElement = document.createElement('div');
            priceElement.className = 'tooltip-price';
            priceElement.textContent = `Preço: ${item.price} ouro`;
            tooltip.appendChild(priceElement);
        }
        
        // Adicionar tooltip ao elemento
        element.appendChild(tooltip);
        
        // Eventos de mouse para mostrar/esconder tooltip
        element.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
            
            // Ajustar posição para não sair da tela
            const rect = element.getBoundingClientRect();
            
            // Verificar se há espaço à direita
            if (rect.right + tooltip.offsetWidth > window.innerWidth) {
                tooltip.style.left = 'auto';
                tooltip.style.right = '100%';
                tooltip.style.top = '0';
            } else {
                tooltip.style.left = '100%';
                tooltip.style.right = 'auto';
                tooltip.style.top = '0';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }
    
    /**
     * Mostrar status do jogador
     * @param {object} player - Dados do jogador
     */
    showStats(player) {
        // Esconder outras telas de overlay
        this.hideAllOverlays();
        
        // Atualizar valores dos stats
        this.updateStats(player);
        
        // Habilitar/desabilitar botões de atributos
        const addButtons = document.querySelectorAll('.add-attribute-btn');
        addButtons.forEach(button => {
            button.disabled = player.attribute_points <= 0;
        });
        
        // Mostrar tela
        this.statsScreen.classList.remove('hidden');
    }
    
    /**
     * Atualizar valores dos status
     * @param {object} player - Dados do jogador
     */
    updateStats(player) {
        // Atributos básicos
        document.getElementById('str-value').textContent = player.stats.strength;
        document.getElementById('int-value').textContent = player.stats.intelligence;
        document.getElementById('dex-value').textContent = player.stats.dexterity;
        document.getElementById('con-value').textContent = player.stats.constitution;
        document.getElementById('points-value').textContent = player.attribute_points;
        
        // Atributos derivados
        document.getElementById('health-value').textContent = player.stats.health;
        document.getElementById('mana-value').textContent = player.stats.mana;
        document.getElementById('physical-value').textContent = player.stats.physical_power;
        document.getElementById('magic-resist-value').textContent = player.stats.magic_resistance;
        document.getElementById('speed-value').textContent = player.stats.speed;
        document.getElementById('magic-power-value').textContent = player.stats.magic_power;
        document.getElementById('armor-value').textContent = player.stats.armor;
        document.getElementById('crit-chance-value').textContent = `${(player.stats.critical_chance * 100).toFixed(1)}%`;
        document.getElementById('crit-power-value').textContent = `${(player.stats.critical_power * 100).toFixed(0)}%`;
        document.getElementById('luck-value').textContent = player.stats.luck.toFixed(2);
        
        // Habilidades de vida
        document.getElementById('cooking-value').textContent = player.life_skills.cooking.toFixed(2);
        document.getElementById('fishing-value').textContent = player.life_skills.fishing.toFixed(2);
        document.getElementById('mining-value').textContent = player.life_skills.mining.toFixed(2);
        document.getElementById('gathering-value').textContent = player.life_skills.gathering.toFixed(2);
        document.getElementById('lumbering-value').textContent = player.life_skills.lumbering.toFixed(2);
        document.getElementById('crafting-value').textContent = player.life_skills.crafting.toFixed(2);
    }
    
    /**
     * Mostrar mapa do mundo
     * @param {string} currentArea - Área atual
     */
    showMap(currentArea) {
        // Esconder outras telas de overlay
        this.hideAllOverlays();
        
        // Destacar a área atual
        const mapLocations = document.querySelectorAll('.map-location');
        mapLocations.forEach(location => {
            const area = location.getAttribute('data-area');
            if (area === currentArea) {
                location.classList.add('active');
            } else {
                location.classList.remove('active');
            }
        });
        
        // Mostrar tela
        this.mapScreen.classList.remove('hidden');
    }
    
    /**
     * Mostrar mercado
     * @param {Array} items - Itens disponíveis
     * @param {number} playerGold - Ouro do jogador
     */
    showMarket(items, playerGold) {
        // Esconder outras telas de overlay
        this.hideAllOverlays();
        
        // Limpar lista de itens
        const marketItemsContainer = document.getElementById('market-items-container');
        marketItemsContainer.innerHTML = '';
        
        // Mostrar ouro do jogador
        const goldHeader = document.createElement('h3');
        goldHeader.textContent = `Seu ouro: ${playerGold}`;
        marketItemsContainer.appendChild(goldHeader);
        
        // Preencher itens
        if (items.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'Nenhum item disponível';
            emptyMessage.classList.add('empty-message');
            marketItemsContainer.appendChild(emptyMessage);
        } else {
            const itemsGrid = document.createElement('div');
            itemsGrid.classList.add('items-grid');
            
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('item');
                itemElement.classList.add(`item-rarity-${item.rarity}`);
                
                const imageElement = document.createElement('div');
                imageElement.classList.add('item-image');
                
                // Definir ícone com base no tipo de item
                let icon = '?';
                switch (item.item_type) {
                    case 'general': icon = item.is_equippable ? '⚔️' : '📦'; break;
                    case 'resource': icon = '🔷'; break;
                    case 'buffer': icon = '🧪'; break;
                    case 'mount': icon = '🐎'; break;
                    case 'scroll': icon = '📜'; break;
                }
                imageElement.textContent = icon;
                
                const nameElement = document.createElement('div');
                nameElement.classList.add('item-name');
                nameElement.textContent = item.name;
                
                const priceElement = document.createElement('div');
                priceElement.classList.add('item-price');
                priceElement.textContent = `${item.price} ouro`;
                
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Comprar';
                buyButton.disabled = playerGold < item.price;
                buyButton.addEventListener('click', () => {
                    this.game.buyItem(item.id).then(success => {
                        if (success) {
                            this.showMarket(items, this.game.player.gold);
                        }
                    });
                });
                
                itemElement.appendChild(imageElement);
                itemElement.appendChild(nameElement);
                itemElement.appendChild(priceElement);
                itemElement.appendChild(buyButton);
                
                itemsGrid.appendChild(itemElement);
            });
            
            marketItemsContainer.appendChild(itemsGrid);
        }
        
        // Mostrar tela
        this.marketScreen.classList.remove('hidden');
    }
    
    /**
     * Mostrar forja
     * @param {Array} inventory - Itens no inventário
     */
    showForge(inventory) {
        // Esconder outras telas de overlay
        this.hideAllOverlays();
        
        // Limpar listas de itens
        const forgeItemsList = document.getElementById('forge-items-list');
        const forgeScrollsList = document.getElementById('forge-scrolls-list');
        forgeItemsList.innerHTML = '';
        forgeScrollsList.innerHTML = '';
        
        // Filtrar itens que podem ser aprimorados
        const equippableItems = inventory.filter(item => item.is_equippable);
        
        // Filtrar pergaminhos
        const scrolls = inventory.filter(item => item.item_type === 'scroll');
        
        // Preencher itens que podem ser aprimorados
        if (equippableItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'Nenhum item para aprimorar';
            emptyMessage.classList.add('empty-message');
            forgeItemsList.appendChild(emptyMessage);
        } else {
            equippableItems.forEach(item => {
                const itemElement = this.createItemElement(item, 'forge-item');
                
                // Substituir evento de clique
                itemElement.onclick = () => {
                    this.game.selectForgeItem(item);
                };
                
                forgeItemsList.appendChild(itemElement);
            });
        }
        
        // Preencher pergaminhos
        if (scrolls.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'Nenhum pergaminho disponível';
            emptyMessage.classList.add('empty-message');
            forgeScrollsList.appendChild(emptyMessage);
        } else {
            scrolls.forEach(scroll => {
                const scrollElement = this.createItemElement(scroll, 'forge-scroll');
                
                // Substituir evento de clique
                scrollElement.onclick = () => {
                    this.game.selectForgeScroll(scroll);
                };
                
                forgeScrollsList.appendChild(scrollElement);
            });
        }
        
        // Resetar seleção e mensagem
        document.getElementById('forge-selected-item').textContent = 'Nenhum item selecionado';
        document.getElementById('forge-selected-scroll').textContent = 'Nenhum pergaminho selecionado';
        document.getElementById('forge-chance').textContent = 'Chance de sucesso: 0%';
        document.getElementById('forge-enhance-btn').disabled = true;
        document.getElementById('forge-result-message').textContent = '';
        
        // Mostrar tela
        this.forgeScreen.classList.remove('hidden');
    }
    
    /**
     * Atualizar seleção na forja
     * @param {object} item - Item selecionado
     * @param {object} scroll - Pergaminho selecionado
     */
    updateForgeSelection(item, scroll) {
        const itemText = item ? `Item: ${item.name}` : 'Nenhum item selecionado';
        const scrollText = scroll ? `Pergaminho: ${scroll.name}` : 'Nenhum pergaminho selecionado';
        
        document.getElementById('forge-selected-item').textContent = itemText;
        document.getElementById('forge-selected-scroll').textContent = scrollText;
        
        // Calcular chance de sucesso
        if (item && scroll) {
            let currentLevel = 0;
            if (item.name.includes('+')) {
                try {
                    currentLevel = parseInt(item.name.split('+')[1]);
                } catch (e) {
                    // Ignorar erro de parsing
                }
            }
            
            const successChance = Math.max(5, 100 - (currentLevel * 5));
            document.getElementById('forge-chance').textContent = `Chance de sucesso: ${successChance}%`;
            document.getElementById('forge-enhance-btn').disabled = false;
        } else {
            document.getElementById('forge-chance').textContent = 'Chance de sucesso: 0%';
            document.getElementById('forge-enhance-btn').disabled = true;
        }
    }
    
    /**
     * Atualizar resultado do aprimoramento
     * @param {object} result - Resultado do aprimoramento
     */
    updateForgeResult(result) {
        if (result.enhancement_success) {
            document.getElementById('forge-result-message').textContent = result.message;
            document.getElementById('forge-result-message').style.color = '#4caf50';
        } else {
            document.getElementById('forge-result-message').textContent = result.message;
            document.getElementById('forge-result-message').style.color = '#e94560';
        }
        
        // Atualizar seleções
        document.getElementById('forge-selected-item').textContent = 'Nenhum item selecionado';
        document.getElementById('forge-selected-scroll').textContent = 'Nenhum pergaminho selecionado';
        document.getElementById('forge-chance').textContent = 'Chance de sucesso: 0%';
        document.getElementById('forge-enhance-btn').disabled = true;
        
        // Resetar seleções no jogo
        this.game.forgeItem = null;
        this.game.forgeScroll = null;
        
        // Atualizar listas de itens
        this.showForge(this.game.player.inventory);
    }
    
    /**
     * Mostrar tela de coleta de recursos
     * @param {object} resource - Recurso selecionado
     * @param {string} skillType - Tipo de habilidade
     * @param {float} skillLevel - Nível da habilidade
     */
    showHarvest(resource, skillType, skillLevel) {
        const harvestScreen = document.getElementById('harvest-screen');
        const resourceName = document.getElementById('harvest-resource-name');
        const resourceDesc = document.getElementById('harvest-resource-description');
        const skillName = document.getElementById('harvest-skill-name');
        const skillLevelEl = document.getElementById('harvest-skill-level');
        const collectBtn = document.getElementById('harvest-collect-btn');
        const resultMsg = document.getElementById('harvest-result-message');
        
        // Limpar mensagens anteriores
        resultMsg.textContent = '';
        
        // Adicionar barra de progresso se não existir
        let progressBar = document.getElementById('harvest-progress-bar');
        if (!progressBar) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'harvest-progress';
            progressContainer.innerHTML = `
                <div class="progress-container">
                    <div id="harvest-progress-bar" class="progress-bar"></div>
                </div>
                <div id="harvest-progress-text" class="progress-text">Pronto para coletar</div>
            `;
            
            const harvestContainer = document.querySelector('.harvest-container');
            harvestContainer.insertBefore(progressContainer, collectBtn.parentElement);
        }
        
        // Resetar a barra de progresso
        this.completeHarvestProgress();
        
        // Preencher informações
        resourceName.textContent = resource.name;
        resourceDesc.textContent = resource.description || `Um recurso de ${skillType}`;
        
        let skillTypeName = '';
        switch (skillType) {
            case 'mining': skillTypeName = 'Mineração'; break;
            case 'fishing': skillTypeName = 'Pesca'; break;
            case 'gathering': skillTypeName = 'Coleta'; break;
            case 'lumbering': skillTypeName = 'Lenhador'; break;
            case 'cooking': skillTypeName = 'Culinária'; break;
            case 'crafting': skillTypeName = 'Artesanato'; break;
            default: skillTypeName = skillType;
        }
        
        skillName.textContent = skillTypeName;
        skillLevelEl.textContent = skillLevel.toFixed(1);
        
        // Mostrar a tela
        harvestScreen.classList.remove('hidden');
    }
    
    /**
     * Atualizar o progresso da coleta
     * @param {number} percentage - Porcentagem de conclusão (0-100)
     * @param {number} totalTime - Tempo total da coleta em ms
     */
    updateHarvestProgress(percentage, totalTime) {
        if (!this.harvestProgressBar || !this.harvestProgressText) return;
        
        this.harvestProgressBar.style.width = `${percentage}%`;
        
        // Calcular o tempo restante
        const remainingTime = Math.ceil((100 - percentage) * totalTime / 100 / 1000);
        this.harvestProgressText.textContent = `Coletando... ${remainingTime}s`;
        
        // Desabilitar o botão durante a coleta
        const collectBtn = document.getElementById('harvest-collect-btn');
        if (collectBtn) {
            collectBtn.disabled = true;
        }
    }
    
    /**
     * Completar o progresso da coleta
     */
    completeHarvestProgress() {
        if (!this.harvestProgressBar || !this.harvestProgressText) return;
        
        this.harvestProgressBar.style.width = '0%';
        this.harvestProgressText.textContent = 'Pronto para coletar';
        
        // Habilitar o botão de coleta
        const collectBtn = document.getElementById('harvest-collect-btn');
        if (collectBtn) {
            collectBtn.disabled = false;
        }
    }
    
    /**
     * Mostrar tela de batalha
     * @param {object} enemy - Inimigo selecionado
     */
    showBattleUI(enemy) {
        const battleScreen = document.getElementById('battle-screen');
        
        // Verificar se os elementos existem antes de atualizar
        const playerNameElement = document.getElementById('player-battle-name');
        const enemyNameElement = document.getElementById('battle-enemy-name');
        const playerHPText = document.getElementById('battle-player-hp-text');
        const enemyHPText = document.getElementById('battle-enemy-hp-text');
        const playerHPFill = document.getElementById('battle-player-hp-fill');
        const enemyHPFill = document.getElementById('battle-enemy-hp-fill');
        const battleLogElement = document.getElementById('battle-log');
        
        // Limpar resultados de batalha anteriores
        const battleResults = document.getElementById('battle-results');
        if (battleResults) {
            battleResults.classList.add('hidden');
            battleResults.innerHTML = '';
        }
        
        // Mostrar controles de batalha
        const battleControls = document.getElementById('battle-controls');
        if (battleControls) {
            battleControls.classList.remove('hidden');
        }
        
        // Atualizar nomes
        if (playerNameElement) playerNameElement.textContent = this.game.player.username;
        if (enemyNameElement) enemyNameElement.textContent = enemy.name;
        
        // Atualizar barras de vida
        if (playerHPText) playerHPText.textContent = `${Math.floor(this.game.player.health)}/${Math.floor(this.game.player.maxHealth)}`;
        if (enemyHPText) enemyHPText.textContent = `${Math.floor(enemy.health)}/${Math.floor(enemy.maxHealth)}`;
        
        if (playerHPFill) {
            const playerHPPercent = (this.game.player.health / this.game.player.maxHealth) * 100;
            playerHPFill.style.width = `${playerHPPercent}%`;
        }
        
        if (enemyHPFill) {
            const enemyHPPercent = (enemy.health / enemy.maxHealth) * 100;
            enemyHPFill.style.width = `${enemyHPPercent}%`;
        }
        
        // Limpar log de batalha
        if (battleLogElement) {
            battleLogElement.innerHTML = '';
        }
        
        // Remover a classe 'hidden' para mostrar a interface de batalha
        if (battleScreen) {
            battleScreen.classList.remove('hidden');
            this.hideAllOverlays(battleScreen.id);
        }
    }
    
    /**
     * Mostrar detalhes de um item
     * @param {object} item - Item selecionado
     */
    showItemDetails(item) {
        // Esconder outras telas de overlay (exceto a que chamou)
        // (não chamamos hideAllOverlays para não fechar o menu que abriu)
        
        // Preencher informações do item
        document.getElementById('item-details-name').textContent = item.name;
        document.getElementById('item-details-description').textContent = 
            item.description || 'Sem descrição disponível';
        
        // Preencher estatísticas do item
        const statsElement = document.getElementById('item-details-stats');
        statsElement.innerHTML = '';
        
        if (item.stats) {
            const stats = item.stats;
            
            // Adicionar cada stat que não seja zero
            for (const [key, value] of Object.entries(stats)) {
                if (value && key !== 'id' && key !== 'created_at') {
                    const statRow = document.createElement('div');
                    
                    // Formatar nome do stat
                    let statName = key.replace(/_/g, ' ');
                    statName = statName.charAt(0).toUpperCase() + statName.slice(1);
                    
                    // Formatar valor (percentagem ou não)
                    let statValue = value;
                    if (key.includes('chance') || key.includes('power') || key === 'luck') {
                        if (typeof value === 'number') {
                            statValue = `${(value * 100).toFixed(1)}%`;
                        }
                    }
                    
                    statRow.textContent = `${statName}: ${statValue}`;
                    statsElement.appendChild(statRow);
                }
            }
        } else {
            statsElement.textContent = 'Este item não possui estatísticas.';
        }
        
        // Configurar botões de ação
        const equipBtn = document.getElementById('item-equip-btn');
        const unequipBtn = document.getElementById('item-unequip-btn');
        const useBtn = document.getElementById('item-use-btn');
        const sellBtn = document.getElementById('item-sell-btn');
        
        equipBtn.classList.add('hidden');
        unequipBtn.classList.add('hidden');
        useBtn.classList.add('hidden');
        
        if (item.source === 'inventory') {
            if (item.is_equippable) {
                equipBtn.classList.remove('hidden');
            }
            
            if (item.is_consumable) {
                useBtn.classList.remove('hidden');
            }
        } else if (item.source === 'equipment') {
            unequipBtn.classList.remove('hidden');
        }
        
        // Mostrar tela
        this.itemDetailsScreen.classList.remove('hidden');
    }
    
    /**
     * Esconder detalhes do item
     */
    hideItemDetails() {
        this.itemDetailsScreen.classList.add('hidden');
    }
    
    /**
     * Esconder todas as telas de overlay
     * @param {string} except - ID da tela que não deve ser escondida
     */
    hideAllOverlays(except) {
        try {
            if (this.inventoryScreen && except !== this.inventoryScreen.id) 
                this.inventoryScreen.classList.add('hidden');
                
            if (this.statsScreen && except !== this.statsScreen.id) 
                this.statsScreen.classList.add('hidden');
                
            if (this.mapScreen && except !== this.mapScreen.id) 
                this.mapScreen.classList.add('hidden');
                
            if (this.marketScreen && except !== this.marketScreen.id) 
                this.marketScreen.classList.add('hidden');
                
            if (this.forgeScreen && except !== this.forgeScreen.id) 
                this.forgeScreen.classList.add('hidden');
                
            if (this.battleScreen && except !== this.battleScreen.id) 
                this.battleScreen.classList.add('hidden');
                
            if (this.harvestScreen && except !== this.harvestScreen.id) 
                this.harvestScreen.classList.add('hidden');
                
            if (this.itemDetailsScreen && except !== this.itemDetailsScreen.id) 
                this.itemDetailsScreen.classList.add('hidden');
        } catch (error) {
            console.error("Erro ao esconder overlays:", error);
        }
    }
    
    /**
     * Atualizar o cooldown de ação na batalha
     * @param {number} percentage - Porcentagem do cooldown completo (0-100)
     */
    updateBattleCooldown(percentage) {
        if (!this.battleCooldownBar || !this.battleCooldownText) return;
        
        this.battleCooldownBar.style.width = `${percentage}%`;
        
        if (percentage >= 100) {
            this.battleCooldownText.textContent = 'Pronto para atacar';
            document.getElementById('battle-attack-btn').disabled = false;
        } else {
            const remainingTime = ((100 - percentage) / 100 * this.game.battleCooldown / 1000).toFixed(1);
            this.battleCooldownText.textContent = `Aguarde ${remainingTime}s`;
            document.getElementById('battle-attack-btn').disabled = true;
        }
    }
    
    /**
     * Mostrar a UI de coleta
     * @param {object} resource - Recurso sendo coletado
     */
    showHarvestUI(resource) {
        // Esconder outras telas de overlay
        this.hideAllOverlays();
        
        // Configurar informações do recurso
        const resourceName = document.getElementById('harvest-resource-name');
        const resourceDesc = document.getElementById('harvest-resource-description');
        const skillName = document.getElementById('harvest-skill-name');
        const skillLevelEl = document.getElementById('harvest-skill-level');
        
        resourceName.textContent = resource.name;
        resourceDesc.textContent = resource.description || `Um recurso do tipo ${resource.resource_type}`;
        
        // Determinar tipo de habilidade
        const skillType = this.game.getSkillTypeForResource(resource.resource_type);
        const skillLevel = this.game.skillLevels[skillType] || 0;
        
        // Formatar nome da habilidade
        let skillTypeName = '';
        switch (skillType) {
            case 'mining': skillTypeName = 'Mineração'; break;
            case 'woodcutting': skillTypeName = 'Lenhador'; break;
            case 'fishing': skillTypeName = 'Pesca'; break;
            case 'herbalism': skillTypeName = 'Coleta'; break;
            case 'crafting': skillTypeName = 'Artesanato'; break;
            default: skillTypeName = skillType;
        }
        
        skillName.textContent = skillTypeName;
        skillLevelEl.textContent = skillLevel.toFixed(1);
        
        // Garantir que as referências às barras de progresso existam
        if (!this.harvestProgressBar) {
            this.harvestProgressBar = document.getElementById('harvest-progress-bar');
        }
        
        if (!this.harvestProgressText) {
            this.harvestProgressText = document.getElementById('harvest-progress-text');
        }
        
        // Criar elementos se não existirem
        if (!this.harvestProgressBar || !this.harvestProgressText) {
            const harvestContainer = document.querySelector('.harvest-container');
            const collectBtn = document.getElementById('harvest-collect-btn');
            
            // Criar container de progresso
            const progressContainer = document.createElement('div');
            progressContainer.className = 'harvest-progress';
            progressContainer.innerHTML = `
                <div class="progress-container">
                    <div id="harvest-progress-bar" class="progress-bar"></div>
                </div>
                <div id="harvest-progress-text" class="progress-text">Iniciando coleta...</div>
            `;
            
            // Inserir antes do botão de coleta
            if (harvestContainer && collectBtn) {
                harvestContainer.insertBefore(progressContainer, collectBtn.parentElement);
                
                // Atualizar referências
                this.harvestProgressBar = document.getElementById('harvest-progress-bar');
                this.harvestProgressText = document.getElementById('harvest-progress-text');
            }
        }
        
        // Resetar barra de progresso
        if (this.harvestProgressBar && this.harvestProgressText) {
            this.harvestProgressBar.style.width = '0%';
            this.harvestProgressText.textContent = 'Iniciando coleta...';
        }
        
        // Mostrar a tela
        this.harvestScreen.classList.remove('hidden');
    }
    
    /**
     * Esconder UI de coleta
     */
    hideHarvestUI() {
        this.harvestScreen.classList.add('hidden');
    }
    
    /**
     * Esconder UI de batalha
     */
    hideBattleUI() {
        this.battleScreen.classList.add('hidden');
    }
    
    /**
     * Atualizar log de batalha
     * @param {string} message - Mensagem para adicionar
     */
    updateBattleLog(message) {
        const battleLog = document.getElementById('battle-log');
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        battleLog.appendChild(messageElement);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    /**
     * Atualizar HP do inimigo na interface
     * @param {number} currentHp - HP atual
     * @param {number} maxHp - HP máximo
     */
    updateBattleEnemyHealth(currentHp, maxHp) {
        const enemyHpFill = document.getElementById('battle-enemy-hp-fill');
        const enemyHpText = document.getElementById('battle-enemy-hp-text');
        
        const percentage = Math.max(0, (currentHp / maxHp) * 100);
        enemyHpFill.style.width = `${percentage}%`;
        enemyHpText.textContent = `${currentHp}/${maxHp}`;
    }
    
    /**
     * Atualizar HP do jogador na interface
     * @param {number} currentHp - HP atual
     * @param {number} maxHp - HP máximo
     */
    updateBattlePlayerHealth(currentHp, maxHp) {
        const playerHpFill = document.getElementById('battle-player-hp-fill');
        const playerHpText = document.getElementById('battle-player-hp-text');
        
        const percentage = Math.max(0, (currentHp / maxHp) * 100);
        playerHpFill.style.width = `${percentage}%`;
        playerHpText.textContent = `${currentHp}/${maxHp}`;
    }
    
    /**
     * Mostrar resultados da coleta
     * @param {Array} items - Itens coletados
     */
    showHarvestResults(items) {
        // Verificar elementos
        if (!this.harvestProgressBar || !this.harvestProgressText) return;
        
        // Completar barra de progresso
        this.harvestProgressBar.style.width = '100%';
        this.harvestProgressText.textContent = 'Coleta finalizada!';
        
        // Mostrar itens coletados
        const resultMessage = document.getElementById('harvest-result-message');
        if (resultMessage) {
            resultMessage.innerHTML = '';
            
            const header = document.createElement('div');
            header.className = 'results-header';
            header.textContent = 'Itens coletados:';
            resultMessage.appendChild(header);
            
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = `result-item item-rarity-${item.rarity}`;
                itemElement.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                `;
                resultMessage.appendChild(itemElement);
            });
        }
    }
    
    /**
     * Mostrar resultados da batalha
     * @param {boolean} victory - Se o jogador venceu
     * @param {number} expGain - Quantidade de EXP ganha
     * @param {number} goldGain - Quantidade de ouro ganha
     * @param {Array} drops - Itens dropados
     */
    showBattleResults(victory, expGain = 0, goldGain = 0, drops = []) {
        // Verificar se o elemento de resultados existe
        const battleResults = document.getElementById('battle-results');
        if (!battleResults) return;
        
        // Limpar resultados anteriores
        battleResults.innerHTML = '';
        
        // Criar conteúdo de resultados
        const resultsContent = document.createElement('div');
        resultsContent.className = 'battle-results-content';
        
        // Título baseado no resultado
        const titleElement = document.createElement('h3');
        titleElement.className = victory ? 'victory-title' : 'defeat-title';
        titleElement.textContent = victory ? 'Vitória!' : 'Derrota!';
        resultsContent.appendChild(titleElement);
        
        // Se for vitória, mostrar recompensas
        if (victory) {
            // Mostrar EXP e ouro
            const rewardsElement = document.createElement('div');
            rewardsElement.className = 'battle-rewards';
            rewardsElement.innerHTML = `
                <div class="reward-item">
                    <span class="reward-label">Experiência:</span>
                    <span class="reward-value">+${expGain}</span>
                </div>
                <div class="reward-item">
                    <span class="reward-label">Ouro:</span>
                    <span class="reward-value">+${goldGain}</span>
                </div>
            `;
            resultsContent.appendChild(rewardsElement);
            
            // Mostrar drops se houver
            if (drops.length > 0) {
                const dropsHeader = document.createElement('h4');
                dropsHeader.textContent = 'Itens obtidos:';
                resultsContent.appendChild(dropsHeader);
                
                const dropsContainer = document.createElement('div');
                dropsContainer.className = 'drops-container';
                
                drops.forEach(drop => {
                    const dropElement = document.createElement('div');
                    dropElement.className = `drop-item item-rarity-${drop.rarity}`;
                    dropElement.innerHTML = `
                        <span class="item-name">${drop.name}</span>
                        <span class="item-quantity">x${drop.quantity}</span>
                    `;
                    dropsContainer.appendChild(dropElement);
                });
                
                resultsContent.appendChild(dropsContainer);
            }
        } else {
            // Mensagem de derrota
            const defeatMessage = document.createElement('p');
            defeatMessage.textContent = 'Você foi derrotado. Tente novamente!';
            resultsContent.appendChild(defeatMessage);
        }
        
        // Botão de fechar
        const closeButton = document.createElement('button');
        closeButton.className = 'close-results-btn';
        closeButton.textContent = 'Fechar';
        closeButton.onclick = () => {
            this.hideBattleUI();
        };
        resultsContent.appendChild(closeButton);
        
        // Adicionar conteúdo ao container de resultados
        battleResults.appendChild(resultsContent);
        
        // Mostrar resultados
        battleResults.classList.remove('hidden');
        
        // Esconder botões de batalha
        const battleControls = document.getElementById('battle-controls');
        if (battleControls) {
            battleControls.classList.add('hidden');
        }
        
        // Atualizar informações do jogador
        this.updatePlayerInfo(this.game.player);
    }
    
    /**
     * Atualiza as informações da área atual
     * @param {object} area - Dados da área atual
     */
    updateAreaInfo(area) {
        // Atualizar nome da área na interface
        const areaNameElement = document.getElementById('area-name');
        if (areaNameElement) {
            areaNameElement.textContent = area.name;
        }
        
        // Atualizar log com mensagem de mudança de área
        this.addToLog(`Você entrou em: ${area.name}`);
    }
    
    /**
     * Atualiza o inventário na sidebar
     * @param {Array} inventory - Itens no inventário
     * @param {Array} equipment - Itens equipados
     */
    updateSidebarInventory(inventory = [], equipment = []) {
        // Limpar slots de inventário
        const inventorySlots = document.querySelectorAll('.inventory-slot');
        inventorySlots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('filled');
        });
        
        // Limpar slots de equipamento
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('filled');
            // Manter apenas o texto do slot
            const slotName = slot.querySelector('.slot-name');
            if (slotName) {
                slot.innerHTML = '';
                slot.appendChild(slotName);
            }
        });
        
        // Preencher slots de inventário
        if (inventory && inventory.length > 0) {
            inventory.forEach((item, index) => {
                if (index >= inventorySlots.length) return;
                
                const slot = inventorySlots[index];
                slot.classList.add('filled');
                
                // Criar elemento do item
                const itemElement = document.createElement('div');
                itemElement.className = `item item-rarity-${item.rarity || 'common'}`;
                
                // Definir ícone com base no tipo de item
                let icon = '?';
                switch (item.item_type) {
                    case 'general': icon = item.is_equippable ? '⚔️' : '📦'; break;
                    case 'resource': icon = '🔷'; break;
                    case 'buffer': icon = '🧪'; break;
                    case 'mount': icon = '🐎'; break;
                    case 'scroll': icon = '📜'; break;
                    case 'weapon': icon = '⚔️'; break;
                    case 'armor': icon = '🛡️'; break;
                    case 'consumable': icon = '🧪'; break;
                    default: icon = '📦';
                }
                
                itemElement.textContent = icon;
                slot.appendChild(itemElement);
                
                // Adicionar tooltip ao slot
                this.addItemTooltip(slot, item);
                
                // Adicionar evento de clique
                slot.onclick = () => {
                    this.showItemDetails(item);
                };
            });
        }
        
        // Preencher slots de equipamento
        if (equipment && equipment.length > 0) {
            equipment.forEach(item => {
                let slotType = '';
                
                // Determinar o tipo de slot com base no item
                switch (item.item_type) {
                    case 'weapon': slotType = 'weapon'; break;
                    case 'armor': slotType = 'armor'; break;
                    case 'helmet': slotType = 'helmet'; break;
                    case 'gloves': slotType = 'gloves'; break;
                    default: return; // Ignorar itens que não correspondem a slots
                }
                
                // Encontrar o slot correspondente
                const slot = document.querySelector(`.equipment-slot[data-slot="${slotType}"]`);
                if (!slot) return;
                
                // Limpar o slot (mantendo o nome)
                const slotName = slot.querySelector('.slot-name');
                slot.innerHTML = '';
                if (slotName) {
                    slot.appendChild(slotName);
                }
                
                // Marcar como preenchido
                slot.classList.add('filled');
                
                // Adicionar ícone do item
                const itemIcon = document.createElement('div');
                itemIcon.className = `item-icon item-rarity-${item.rarity || 'common'}`;
                
                // Definir ícone com base no tipo de item
                let icon = '?';
                switch (item.item_type) {
                    case 'weapon': icon = '⚔️'; break;
                    case 'armor': icon = '🛡️'; break;
                    case 'helmet': icon = '🪖'; break;
                    case 'gloves': icon = '🧤'; break;
                    default: icon = '📦';
                }
                
                itemIcon.textContent = icon;
                slot.appendChild(itemIcon);
                
                // Adicionar tooltip
                this.addItemTooltip(slot, item);
                
                // Adicionar evento de clique
                slot.onclick = () => {
                    this.showItemDetails(item);
                };
            });
        }
        
        // Atualizar contador de inventário
        const countElement = document.getElementById('inventory-count');
        const maxElement = document.getElementById('inventory-max');
        
        if (countElement) {
            countElement.textContent = inventory ? inventory.length : 0;
        }
        
        if (maxElement && this.game.player) {
            maxElement.textContent = this.game.player.inventory_size || 20;
        }
    }
    
    /**
     * Inicializa eventos de interface
     */
    initEvents() {
        // Inicializar botões da interface
        const toggleSidebarBtn = document.getElementById('toggle-sidebar');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar-right');
                if (sidebar) {
                    sidebar.classList.toggle('visible');
                }
            });
        }
        
        // Configurar botões de batalha
        const attackBtn = document.getElementById('battle-attack-btn');
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                if (this.game && this.game.attackEnemy) {
                    this.game.attackEnemy();
                }
            });
        }
        
        const fleeBtn = document.getElementById('battle-flee-btn');
        if (fleeBtn) {
            fleeBtn.addEventListener('click', () => {
                if (this.game) {
                    // Encerrar a batalha sem vitória (fuga)
                    this.game.inBattle = false;
                    this.game.battleData = null;
                    this.hideBattleUI();
                    this.addToLog('Você fugiu da batalha!');
                }
            });
        }
        
        // Configurar botões de fechamento de telas
        const closeButtons = document.querySelectorAll('.close-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllOverlays();
            });
        });
        
        // Eventos para botões de mercador, inventário, etc.
        // (serão adicionados conforme necessário)
    }
} 