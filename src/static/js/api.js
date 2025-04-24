/**
 * Módulo para gerenciar todas as chamadas de API do jogo
 */
const API = {
    /**
     * Inicializa o módulo de API
     */
    init() {
        console.log("API inicializada!");
        // Configuração inicial da API
    },
    
    /**
     * Carrega dados do jogador
     * @returns {Promise} Promise com os dados do jogador
     */
    async loadPlayer() {
        // Simulação de chamada de API
        return {
            success: true,
            player: {
                id: 1,
                username: "Jogador",
                level: 1,
                exp: 0,
                next_level_exp: 100,
                health: 100,
                max_health: 100,
                gold: 100,
                x: 400,
                y: 300,
                stats: {
                    strength: 10,
                    intelligence: 10,
                    dexterity: 10,
                    constitution: 10
                }
            }
        };
    },
    
    BASE_URL: '',  // URL base para as requisições (vazio para relativo)
    
    /**
     * Função para fazer requisições à API
     * @param {string} endpoint - Endpoint da API
     * @param {string} method - Método HTTP (GET, POST, etc)
     * @param {object} data - Dados para enviar (opcional)
     * @returns {Promise} Promise com o resultado da requisição
     */
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.BASE_URL}/api/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!result.success && result.error) {
                console.error(`API Error: ${result.error}`);
                throw new Error(result.error);
            }
            
            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },
    
    /**
     * Criar um novo jogador
     * @param {string} username - Nome do jogador
     * @returns {Promise} Promise com os dados do jogador criado
     */
    async createPlayer(username) {
        const result = await this.request('player', 'POST', { username });
        return result.player;
    },
    
    /**
     * Obter dados do jogador atual
     * @returns {Promise} Promise com os dados do jogador atual
     */
    async getPlayer() {
        const result = await this.request('player');
        return result.player;
    },
    
    /**
     * Atualizar a posição do jogador
     * @param {number} x - Posição X
     * @param {number} y - Posição Y
     * @param {string} area - Área atual
     * @returns {Promise} Promise com a nova posição
     */
    async updatePosition(x, y, area) {
        const result = await this.request('player/position', 'POST', { x, y, area });
        return result.position;
    },
    
    /**
     * Distribuir pontos de atributo
     * @param {string} attribute - Nome do atributo (strength, intelligence, dexterity, constitution)
     * @param {number} points - Quantidade de pontos a distribuir
     * @returns {Promise} Promise com os dados atualizados do jogador
     */
    async distributeAttributePoints(attribute, points = 1) {
        const result = await this.request('player/attributes', 'POST', { attribute, points });
        return result.player;
    },
    
    /**
     * Equipar um item
     * @param {string} itemId - ID do item a equipar
     * @returns {Promise} Promise com os dados atualizados do jogador
     */
    async equipItem(itemId) {
        const result = await this.request('player/equip', 'POST', { item_id: itemId });
        return result.player;
    },
    
    /**
     * Coletar um recurso
     * @param {string} harvestId - ID do recurso a coletar
     * @returns {Promise} Promise com o resultado da coleta
     */
    async harvestResource(harvestId) {
        return await this.request('harvest', 'POST', { harvest_id: harvestId });
    },
    
    /**
     * Batalhar com um NPC
     * @param {string} npcId - ID do NPC para batalhar
     * @returns {Promise} Promise com o resultado da batalha
     */
    async battle(npcId) {
        return await this.request('battle', 'POST', { npc_id: npcId });
    },
    
    /**
     * Comprar um item do mercado
     * @param {string} itemId - ID do item a comprar
     * @returns {Promise} Promise com o resultado da compra
     */
    async buyItem(itemId) {
        return await this.request('market/buy', 'POST', { item_id: itemId });
    },
    
    /**
     * Aprimorar um item
     * @param {string} itemId - ID do item a aprimorar
     * @param {string} scrollId - ID do pergaminho para usar
     * @returns {Promise} Promise com o resultado do aprimoramento
     */
    async enhanceItem(itemId, scrollId) {
        return await this.request('forge', 'POST', { item_id: itemId, scroll_id: scrollId });
    },
    
    /**
     * Obter recursos disponíveis na área atual
     * @param {string} area - Área atual
     * @returns {Promise} Promise com os recursos disponíveis
     */
    async getResources(area) {
        const result = await this.request(`resources?area=${area}`);
        return result.resources;
    },
    
    /**
     * Obter NPCs disponíveis na área atual
     * @param {string} area - Área atual
     * @returns {Promise} Promise com os NPCs disponíveis
     */
    async getNpcs(area) {
        const result = await this.request(`npcs?area=${area}`);
        return result.npcs;
    },
    
    /**
     * Obter itens do mercado
     * @returns {Promise} Promise com os itens do mercado
     */
    async getMarketItems() {
        const result = await this.request('market');
        return result.items;
    },
    
    /**
     * Verificar e aplicar regeneração de vida/mana
     * @returns {Promise} Promise com os dados atualizados do jogador
     */
    async playerRegen() {
        return await this.request('player/regen');
    },
    
    /* Métodos de Administração */
    
    /**
     * Obter todos os itens (admin)
     * @returns {Promise} Promise com a lista de itens
     */
    async adminGetItems() {
        const result = await this.request('admin/items');
        return result.items;
    },
    
    /**
     * Obter todos os recursos (admin)
     * @returns {Promise} Promise com a lista de recursos
     */
    async adminGetResources() {
        const result = await this.request('admin/resources');
        return result.resources;
    },
    
    /**
     * Obter todos os NPCs (admin)
     * @returns {Promise} Promise com a lista de NPCs
     */
    async adminGetNPCs() {
        const result = await this.request('admin/npcs');
        return result.npcs;
    },
    
    /**
     * Adicionar novo item (admin)
     * @param {object} itemData - Dados do item
     * @returns {Promise} Promise com o resultado da operação
     */
    async adminAddItem(itemData) {
        return await this.request('admin/items', 'POST', itemData);
    },
    
    /**
     * Adicionar novo recurso (admin)
     * @param {object} resourceData - Dados do recurso
     * @returns {Promise} Promise com o resultado da operação
     */
    async adminAddResource(resourceData) {
        return await this.request('admin/resources', 'POST', resourceData);
    },
    
    /**
     * Adicionar novo NPC (admin)
     * @param {object} npcData - Dados do NPC
     * @returns {Promise} Promise com o resultado da operação
     */
    async adminAddNPC(npcData) {
        return await this.request('admin/npcs', 'POST', npcData);
    },
    
    /**
     * Resetar estado do jogo (admin)
     * @returns {Promise} Promise com o resultado da operação
     */
    async adminResetGame() {
        return await this.request('admin/reset', 'POST');
    },
    
    /**
     * Salvar estado do jogo (admin)
     * @returns {Promise} Promise com o resultado da operação
     */
    async adminSaveGame() {
        return await this.request('admin/save', 'POST');
    }
};

// Inicializar API
API.init();

// Exportar API
window.API = API; 