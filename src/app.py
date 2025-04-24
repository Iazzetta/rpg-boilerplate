#!/usr/bin/env python3
import os
import uuid
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Importando domínios e serviços
from domains.player import Player
from domains.item import Item, ItemType, Rarity
from domains.stats import Stats
from domains.life_skill import LifeSkill
from domains.npc import NPC, DropItem
from domains.entity import Harvest, TypeEntity

from repositories.player_repository import PlayerRepository
from repositories.item_repository import ItemRepository

from services.player_service import PlayerService
from services.game_service import GameService
from services.harvest_service import HarvestService

# Inicializa o Flask
app = Flask(__name__, static_folder='static')
CORS(app)

# Configuração dos repositórios
player_repository = PlayerRepository()
item_repository = ItemRepository()

# Configuração dos serviços
player_service = PlayerService(player_repository)
game_service = GameService(player_service)
harvest_service = HarvestService(player_service)

# Estado global do jogo (em um projeto real seria um banco de dados)
GAME_STATE = {
    'current_player': None,
    'resources': {},
    'npcs': {},
    'market_items': [],
    'last_regen_time': datetime.now()  # Para regeneração de vida/mana
}

# Configurações de regeneração
REGEN_CONFIG = {
    'hp_regen_percent': 0.05,  # 5% por minuto
    'mana_regen_percent': 0.10,  # 10% por minuto
    'regen_interval': 60  # segundos
}

# Verificar e aplicar regeneração ao jogador
def check_and_apply_regen():
    if not GAME_STATE['current_player']:
        return
    
    now = datetime.now()
    seconds_passed = (now - GAME_STATE['last_regen_time']).total_seconds()
    
    # Verificar se passou tempo suficiente para regenerar
    if seconds_passed >= REGEN_CONFIG['regen_interval']:
        player = GAME_STATE['current_player']
        
        # Calcular regeneração com base no tempo passado
        intervals = seconds_passed / REGEN_CONFIG['regen_interval']
        
        # Regenerar HP
        hp_regen = int(player.max_hp * REGEN_CONFIG['hp_regen_percent'] * intervals)
        new_hp = min(player.hp + hp_regen, player.max_hp)
        if new_hp > player.hp:
            player.hp = new_hp
        
        # Regenerar Mana
        mana_regen = int(player.stats.mana * REGEN_CONFIG['mana_regen_percent'] * intervals)
        if player.stats.mana > 0 and mana_regen > 0:
            new_mana = min(player.stats.mana + mana_regen, player.stats.mana)
            player.stats.mana = new_mana
        
        # Atualizar o tempo da última regeneração
        GAME_STATE['last_regen_time'] = now

# API para verificar e aplicar regeneração periodicamente
@app.route('/api/player/regen', methods=['GET'])
def player_regeneration():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    check_and_apply_regen()
    
    return jsonify({
        'success': True,
        'player': player_to_dict(GAME_STATE['current_player'])
    })

# Inicializar o estado do jogo
def initialize_game():
    # Criar alguns itens básicos
    sword = Item(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name="Espada de Ferro",
        description="Uma espada básica feita de ferro",
        item_type=ItemType.GENERAL,
        rarity=Rarity.COMMON,
        price=50,
        sell_price=20,
        is_tradable=True,
        is_consumable=False,
        is_equippable=True,
        is_boostable=False,
        stats=Stats(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            strength=0,
            intelligence=0,
            dexterity=0,
            constitution=0,
            health=0,
            mana=0,
            physical_power=5,
            magic_resistance=0,
            speed=0,
            magic_power=0,
            armor=0,
            critical_chance=0.05,
            critical_power=0.1,
            luck=0
        )
    )
    item_repository.save(sword)
    GAME_STATE['market_items'].append(sword)
    
    # Criar armadura
    armor = Item(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name="Armadura de Couro",
        description="Uma armadura básica feita de couro",
        item_type=ItemType.GENERAL,
        rarity=Rarity.COMMON,
        price=40,
        sell_price=15,
        is_tradable=True,
        is_consumable=False,
        is_equippable=True,
        is_boostable=False,
        stats=Stats(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            strength=0,
            intelligence=0,
            dexterity=0,
            constitution=0,
            health=0,
            mana=0,
            physical_power=0,
            magic_resistance=0,
            speed=0,
            magic_power=0,
            armor=3,
            critical_chance=0,
            critical_power=0,
            luck=0
        )
    )
    item_repository.save(armor)
    GAME_STATE['market_items'].append(armor)
    
    # Criar poção
    potion = Item(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name="Poção de Cura",
        description="Recupera 50 pontos de vida",
        item_type=ItemType.GENERAL,
        rarity=Rarity.COMMON,
        price=10,
        sell_price=5,
        is_tradable=True,
        is_consumable=True,
        is_equippable=False,
        is_boostable=False,
        stats=Stats(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            strength=0,
            intelligence=0,
            dexterity=0,
            constitution=0,
            health=50,  # Poção restaura 50 de vida
            mana=0,
            physical_power=0,
            magic_resistance=0,
            speed=0,
            magic_power=0,
            armor=0,
            critical_chance=0.0,
            critical_power=0.0,
            luck=0.0
        )
    )
    item_repository.save(potion)
    GAME_STATE['market_items'].append(potion)
    
    # Criar pergaminho de aprimoramento
    scroll = Item(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name="Pergaminho de Aprimoramento",
        description="Aprimora um item +1",
        item_type=ItemType.SCROLL,
        rarity=Rarity.COMMON,
        price=100,
        sell_price=30,
        is_tradable=True,
        is_consumable=True,
        is_equippable=False,
        is_boostable=True,
        stats=Stats(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            strength=0,
            intelligence=0,
            dexterity=0,
            constitution=0,
            health=0,
            mana=0,
            physical_power=0,
            magic_resistance=0,
            speed=0,
            magic_power=0,
            armor=0,
            critical_chance=0.0,
            critical_power=0.0,
            luck=0.0
        )
    )
    item_repository.save(scroll)
    GAME_STATE['market_items'].append(scroll)
    
    # Criar recursos para colheita
    minerals = [
        create_harvest("Ferro", TypeEntity.MINING, 3, 60),
        create_harvest("Cobre", TypeEntity.MINING, 4, 45),
        create_harvest("Prata", TypeEntity.MINING, 2, 90),
    ]
    plants = [
        create_harvest("Ervas", TypeEntity.GATHERING, 5, 30),
        create_harvest("Flores", TypeEntity.GATHERING, 3, 40),
    ]
    trees = [
        create_harvest("Carvalho", TypeEntity.LUMBERING, 3, 120),
        create_harvest("Pinheiro", TypeEntity.LUMBERING, 4, 90),
    ]
    
    # Registrar todos os recursos no serviço de colheita
    for resource in minerals + plants + trees:
        harvest_service.register_harvest(resource)
        GAME_STATE['resources'][resource.id] = {
            'id': resource.id,
            'name': resource.name,
            'type': resource.type_entity.value,
            'position': {
                'x': 0,  # Será definido no frontend
                'y': 0
            },
            'area': 'forest_1'  # Floresta inicial
        }
    
    # Criar NPCs
    create_enemy("Lobo Selvagem", 1, 40, 5, 3, 'forest_1')
    create_enemy("Goblin", 2, 60, 8, 5, 'forest_1')
    create_enemy("Bandido", 3, 80, 10, 8, 'forest_2')
    create_enemy("Ogro", 5, 150, 15, 12, 'forest_2')
    create_enemy("Dragão Jovem", 10, 300, 25, 20, 'forest_3')

def create_harvest(name, type_entity, drop_amount, respawn_time):
    """Método auxiliar para criar entidades de colheita"""
    return Harvest(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name=name,
        description=f"Um recurso que pode ser coletado através de {type_entity.value}",
        type_entity=type_entity,
        drop_amount=drop_amount,
        respawn_time=respawn_time,
        hp=10,
        is_collidable=True
    )

def create_enemy(name, level, hp, damage, armor, area):
    """Cria um inimigo no mundo"""
    npc_stats = Stats(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        strength=level * 2,
        intelligence=level,
        dexterity=int(level * 1.5),
        constitution=level * 2,
        health=hp,
        mana=level * 10,
        physical_power=damage,
        magic_resistance=level,
        speed=level,
        magic_power=level,
        armor=armor,
        critical_chance=0.03,
        critical_power=1.3,
        luck=1.0
    )
    
    drop_item = DropItem(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        item=item_repository.items[0] if item_repository.items else None,
        chance=0.5,
        amount=1
    )
    
    enemy = NPC(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name=name,
        description=f"Um {name} hostil",
        stats=npc_stats,
        x=0,  # Será definido no frontend
        y=0,
        hp=hp,
        max_hp=hp,
        level=level,
        drop_items=[drop_item]
    )
    
    GAME_STATE['npcs'][enemy.id] = {
        'id': enemy.id,
        'name': enemy.name,
        'level': enemy.level,
        'hp': enemy.hp,
        'max_hp': enemy.max_hp,
        'position': {
            'x': 0,  # Será definido no frontend
            'y': 0
        },
        'area': area,
        'type': 'enemy'
    }
    
    return enemy

# Inicializa o estado do jogo ao iniciar o servidor
initialize_game()

# Rotas para servir arquivos estáticos
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# API para criar novo jogador
@app.route('/api/player', methods=['POST'])
def create_player():
    data = request.json
    account_id = "default_account"
    username = data.get('username', 'Unknown')
    
    player = player_service.create_player(account_id, username)
    GAME_STATE['current_player'] = player
    
    return jsonify({
        'success': True,
        'player': player_to_dict(player)
    })

# API para obter dados do jogador atual
@app.route('/api/player', methods=['GET'])
def get_player():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    return jsonify({
        'success': True,
        'player': player_to_dict(GAME_STATE['current_player'])
    })

# API para atualizar posição do jogador
@app.route('/api/player/position', methods=['POST'])
def update_position():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    x = data.get('x', 0)
    y = data.get('y', 0)
    area = data.get('area', 'city')
    
    GAME_STATE['current_player'].x = x
    GAME_STATE['current_player'].y = y
    
    return jsonify({
        'success': True,
        'position': {'x': x, 'y': y, 'area': area}
    })

# API para distribuir pontos de atributo
@app.route('/api/player/attributes', methods=['POST'])
def distribute_attribute_points():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    attribute = data.get('attribute')
    points = data.get('points', 1)
    
    player = GAME_STATE['current_player']
    
    if player.attribute_points < points:
        return jsonify({'success': False, 'error': 'Not enough attribute points'})
    
    # Atualizar o atributo específico
    if attribute == 'strength':
        player.stats.strength += points
    elif attribute == 'intelligence':
        player.stats.intelligence += points
        # Inteligência aumenta resistência mágica, poder mágico, mana e sorte
        player.stats.magic_resistance += int(points * 0.5)
        player.stats.magic_power += int(points * 0.8)
        player.stats.mana += points * 2
        player.stats.luck += points * 0.05
    elif attribute == 'dexterity':
        player.stats.dexterity += points
        # Destreza aumenta poder físico, velocidade e crítico
        player.stats.physical_power += int(points * 0.5)
        player.stats.speed += int(points * 0.3)
        player.stats.critical_chance += points * 0.01
        player.stats.critical_power += points * 0.05
    elif attribute == 'constitution':
        player.stats.constitution += points
        # Constituição aumenta saúde
        player.stats.health += points * 5
        player.max_hp += points * 5
        player.hp += points * 5
    else:
        return jsonify({'success': False, 'error': 'Invalid attribute'})
    
    # Deduzir os pontos gastos
    player.attribute_points -= points
    
    return jsonify({
        'success': True,
        'player': player_to_dict(player)
    })

# API para equipar um item
@app.route('/api/player/equip', methods=['POST'])
def equip_item():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    item_id = data.get('item_id')
    
    try:
        player = player_service.equip_item(GAME_STATE['current_player'], item_id)
        GAME_STATE['current_player'] = player
        
        return jsonify({
            'success': True,
            'player': player_to_dict(player)
        })
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)})

# API para coletar recurso
@app.route('/api/harvest', methods=['POST'])
def harvest_resource():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    harvest_id = data.get('harvest_id')
    
    success, message, items = harvest_service.harvest_resource(GAME_STATE['current_player'], harvest_id)
    
    return jsonify({
        'success': success,
        'message': message,
        'items': [item_to_dict(item) for item in items]
    })

# API para batalhar
@app.route('/api/battle', methods=['POST'])
def battle():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    npc_id = data.get('npc_id')
    
    # Encontrar o NPC pelo ID
    npc_data = GAME_STATE['npcs'].get(npc_id)
    if not npc_data:
        return jsonify({'success': False, 'error': 'NPC not found'})
    
    # Criar um objeto NPC para a batalha
    npc_stats = Stats(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        strength=npc_data['level'] * 2,
        intelligence=npc_data['level'],
        dexterity=int(npc_data['level'] * 1.5),
        constitution=npc_data['level'] * 2,
        health=npc_data['hp'],
        mana=npc_data['level'] * 10,
        physical_power=npc_data['level'] * 2,
        magic_resistance=npc_data['level'],
        speed=npc_data['level'],
        magic_power=npc_data['level'],
        armor=npc_data['level'],
        critical_chance=0.03,
        critical_power=1.3,
        luck=1.0
    )
    
    drop_item = DropItem(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        item=item_repository.items[0] if item_repository.items else None,
        chance=0.5,
        amount=1
    )
    
    npc = NPC(
        id=npc_id,
        created_at=datetime.now(),
        name=npc_data['name'],
        description=f"Um {npc_data['name']} hostil",
        stats=npc_stats,
        x=npc_data['position']['x'],
        y=npc_data['position']['y'],
        hp=npc_data['hp'],
        max_hp=npc_data['max_hp'],
        level=npc_data['level'],
        drop_items=[drop_item]
    )
    
    victory, battle_log, rewards = game_service.battle(GAME_STATE['current_player'], npc)
    
    # Aplicar consequências da batalha (o serviço já atualizou o jogador)
    if victory:
        # Chance de ganhar atributos ao derrotar inimigos poderosos
        if npc.level >= 5:
            GAME_STATE['current_player'].attribute_points += 2
    
    return jsonify({
        'success': True,
        'victory': victory,
        'battle_log': battle_log,
        'rewards': rewards,
        'player': player_to_dict(GAME_STATE['current_player'])
    })

# API para comprar item do mercado
@app.route('/api/market/buy', methods=['POST'])
def buy_item():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    item_id = data.get('item_id')
    
    # Encontrar o item pelo ID
    item = None
    for market_item in GAME_STATE['market_items']:
        if market_item.id == item_id:
            item = market_item
            break
    
    if not item:
        return jsonify({'success': False, 'error': 'Item not found'})
    
    player = GAME_STATE['current_player']
    
    # Verificar se tem ouro suficiente
    if player.gold < item.price:
        return jsonify({'success': False, 'error': 'Not enough gold'})
    
    # Deduzir o ouro
    player.gold -= item.price
    
    # Adicionar o item ao inventário (criando uma cópia)
    new_item = Item(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        name=item.name,
        description=item.description,
        item_type=item.item_type,
        rarity=item.rarity,
        price=item.price,
        sell_price=item.sell_price,
        is_tradable=item.is_tradable,
        is_consumable=item.is_consumable,
        is_equippable=item.is_equippable,
        is_boostable=item.is_boostable,
        stats=item.stats
    )
    
    try:
        player_service.add_item_to_inventory(player, new_item)
    except ValueError as e:
        # Devolver o ouro se não conseguiu adicionar
        player.gold += item.price
        return jsonify({'success': False, 'error': str(e)})
    
    return jsonify({
        'success': True,
        'player': player_to_dict(player),
        'item': item_to_dict(new_item)
    })

# API para aprimorar um item
@app.route('/api/forge', methods=['POST'])
def enhance_item():
    if not GAME_STATE['current_player']:
        return jsonify({'success': False, 'error': 'No player created'})
    
    data = request.json
    item_id = data.get('item_id')
    scroll_id = data.get('scroll_id')
    
    player = GAME_STATE['current_player']
    
    # Encontrar o item a ser aprimorado
    item_to_enhance = None
    for item in player.inventory:
        if item.id == item_id:
            item_to_enhance = item
            break
    
    if not item_to_enhance:
        return jsonify({'success': False, 'error': 'Item not found in inventory'})
    
    # Encontrar o pergaminho
    scroll = None
    for item in player.inventory:
        if item.id == scroll_id and item.item_type == ItemType.SCROLL:
            scroll = item
            break
    
    if not scroll:
        return jsonify({'success': False, 'error': 'Scroll not found in inventory'})
    
    # Verificar o nível atual de aprimoramento
    current_level = 0
    if "+" in item_to_enhance.name:
        try:
            current_level = int(item_to_enhance.name.split("+")[1])
        except:
            pass
    
    # Calcular chance de sucesso
    success_chance = max(0.05, 1.0 - (current_level * 0.05))
    
    import random
    success = random.random() < success_chance
    
    # Remover o pergaminho do inventário
    player.inventory = [item for item in player.inventory if item.id != scroll.id]
    
    if success:
        # Aprimorar o item
        item_to_enhance.name = item_to_enhance.name.split("+")[0] + f" +{current_level + 1}"
        
        # Melhorar atributos
        if item_to_enhance.stats:
            item_to_enhance.stats.physical_power = item_to_enhance.stats.physical_power * 1.1 if item_to_enhance.stats.physical_power else 1
            item_to_enhance.stats.armor = item_to_enhance.stats.armor * 1.1 if item_to_enhance.stats.armor else 1
        
        message = f"Aprimoramento bem-sucedido! {item_to_enhance.name}"
    else:
        message = "Aprimoramento falhou!"
    
    return jsonify({
        'success': True,
        'enhancement_success': success,
        'message': message,
        'success_chance': success_chance * 100,
        'player': player_to_dict(player)
    })

# API para obter recursos disponíveis
@app.route('/api/resources', methods=['GET'])
def get_resources():
    area = request.args.get('area', 'city')
    
    # Filtrar recursos pela área atual
    area_resources = {k: v for k, v in GAME_STATE['resources'].items() if v['area'] == area}
    
    return jsonify({
        'success': True,
        'resources': area_resources
    })

# API para obter NPCs disponíveis
@app.route('/api/npcs', methods=['GET'])
def get_npcs():
    area = request.args.get('area', 'city')
    
    # Filtrar NPCs pela área atual
    area_npcs = {k: v for k, v in GAME_STATE['npcs'].items() if v['area'] == area}
    
    return jsonify({
        'success': True,
        'npcs': area_npcs
    })

# API para obter itens do mercado
@app.route('/api/market', methods=['GET'])
def get_market_items():
    return jsonify({
        'success': True,
        'items': [item_to_dict(item) for item in GAME_STATE['market_items']]
    })

# Funções auxiliares para conversão de objetos em dicionários
def player_to_dict(player):
    return {
        'id': player.id,
        'username': player.username,
        'equipment': [item_to_dict(item) for item in player.equipment],
        'inventory': [item_to_dict(item) for item in player.inventory],
        'stats': stats_to_dict(player.stats),
        'life_skills': life_skills_to_dict(player.life_skills),
        'position': {'x': player.x, 'y': player.y},
        'hp': player.hp,
        'max_hp': player.max_hp,
        'level': player.level,
        'exp': player.exp,
        'next_level_exp': player.next_level_exp,
        'gold': player.gold,
        'inventory_size': player.inventory_size,
        'attribute_points': player.attribute_points
    }

def item_to_dict(item):
    if not item:
        return None
    
    return {
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'item_type': item.item_type.value,
        'rarity': item.rarity.value,
        'price': item.price,
        'sell_price': item.sell_price,
        'is_tradable': item.is_tradable,
        'is_consumable': item.is_consumable,
        'is_equippable': item.is_equippable,
        'is_boostable': item.is_boostable,
        'stats': stats_to_dict(item.stats) if item.stats else None
    }

def stats_to_dict(stats):
    if not stats:
        return None
    
    return {
        'strength': stats.strength,
        'intelligence': stats.intelligence,
        'dexterity': stats.dexterity,
        'constitution': stats.constitution,
        'health': stats.health,
        'mana': stats.mana,
        'physical_power': stats.physical_power,
        'magic_resistance': stats.magic_resistance,
        'speed': stats.speed,
        'magic_power': stats.magic_power,
        'armor': stats.armor,
        'critical_chance': stats.critical_chance,
        'critical_power': stats.critical_power,
        'luck': stats.luck
    }

def life_skills_to_dict(life_skills):
    if not life_skills:
        return None
    
    return {
        'cooking': life_skills.cooking,
        'fishing': life_skills.fishing,
        'mining': life_skills.mining,
        'gathering': life_skills.gathering,
        'lumbering': life_skills.lumbering,
        'crafting': life_skills.crafting
    }

# API para obter dados de admin
@app.route('/admin')
def admin_panel():
    return send_from_directory('templates', 'admin.html')

# API para adicionar novo item (admin)
@app.route('/api/admin/items', methods=['POST'])
def add_item():
    data = request.json
    
    try:
        stats = Stats(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            strength=int(data.get('strength', 0)),
            intelligence=int(data.get('intelligence', 0)),
            dexterity=int(data.get('dexterity', 0)),
            constitution=int(data.get('constitution', 0)),
            health=int(data.get('health', 0)),
            mana=int(data.get('mana', 0)),
            physical_power=int(data.get('physical_power', 0)),
            magic_resistance=int(data.get('magic_resistance', 0)),
            speed=int(data.get('speed', 0)),
            magic_power=int(data.get('magic_power', 0)),
            armor=int(data.get('armor', 0)),
            critical_chance=float(data.get('critical_chance', 0)),
            critical_power=float(data.get('critical_power', 0)),
            luck=float(data.get('luck', 0))
        )
        
        item = Item(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            name=data.get('name', 'New Item'),
            description=data.get('description', ''),
            item_type=ItemType(data.get('item_type', 'general')),
            rarity=Rarity(data.get('rarity', 'common')),
            price=int(data.get('price', 0)),
            sell_price=int(data.get('sell_price', 0)),
            is_tradable=bool(data.get('is_tradable', True)),
            is_consumable=bool(data.get('is_consumable', False)),
            is_equippable=bool(data.get('is_equippable', False)),
            is_boostable=bool(data.get('is_boostable', False)),
            stats=stats
        )
        
        item_repository.save(item)
        GAME_STATE['market_items'].append(item)
        
        return jsonify({
            'success': True,
            'item': item_to_dict(item)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# API para adicionar novo recurso (admin)
@app.route('/api/admin/resources', methods=['POST'])
def add_resource():
    data = request.json
    
    try:
        # Criar um novo recurso
        resource = Harvest(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            name=data.get('name', 'New Resource'),
            description=data.get('description', ''),
            type_entity=TypeEntity(data.get('type_entity', 'mining')),
            drop_amount=int(data.get('drop_amount', 1)),
            respawn_time=int(data.get('respawn_time', 60)),
            hp=int(data.get('hp', 10)),
            is_collidable=bool(data.get('is_collidable', True))
        )
        
        # Registrar o recurso
        harvest_service.register_harvest(resource)
        
        # Adicionar ao mapa
        GAME_STATE['resources'][resource.id] = {
            'id': resource.id,
            'name': resource.name,
            'type': resource.type_entity.value,
            'position': {
                'x': int(data.get('x', 0)),
                'y': int(data.get('y', 0))
            },
            'area': data.get('area', 'forest_1')
        }
        
        return jsonify({
            'success': True,
            'resource': GAME_STATE['resources'][resource.id]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# API para adicionar novo inimigo (admin)
@app.route('/api/admin/npcs', methods=['POST'])
def add_npc():
    data = request.json
    
    try:
        # Criar um novo inimigo
        npc_id = str(uuid.uuid4())
        name = data.get('name', 'New Enemy')
        level = int(data.get('level', 1))
        hp = int(data.get('hp', 50))
        
        GAME_STATE['npcs'][npc_id] = {
            'id': npc_id,
            'name': name,
            'level': level,
            'hp': hp,
            'max_hp': hp,
            'position': {
                'x': int(data.get('x', 0)),
                'y': int(data.get('y', 0))
            },
            'area': data.get('area', 'forest_1'),
            'type': 'enemy'
        }
        
        return jsonify({
            'success': True,
            'npc': GAME_STATE['npcs'][npc_id]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# API para listar todos os itens (admin)
@app.route('/api/admin/items', methods=['GET'])
def list_items():
    items = [item_to_dict(item) for item in item_repository.items]
    return jsonify({
        'success': True,
        'items': items
    })

# API para listar todos os recursos (admin)
@app.route('/api/admin/resources', methods=['GET'])
def list_resources():
    return jsonify({
        'success': True,
        'resources': list(GAME_STATE['resources'].values())
    })

# API para listar todos os NPCs (admin)
@app.route('/api/admin/npcs', methods=['GET'])
def list_npcs():
    return jsonify({
        'success': True,
        'npcs': list(GAME_STATE['npcs'].values())
    })

# API para limpar dados (admin)
@app.route('/api/admin/reset', methods=['POST'])
def reset_game():
    GAME_STATE['resources'] = {}
    GAME_STATE['npcs'] = {}
    GAME_STATE['market_items'] = []
    
    # Reinicializar o jogo
    initialize_game()
    
    return jsonify({
        'success': True,
        'message': 'Game state has been reset'
    })

# API para salvar estado atual (admin) - em um caso real, salvaria em banco de dados
@app.route('/api/admin/save', methods=['POST'])
def save_game_state():
    # Em um caso real, aqui salvaríamos o estado do jogo em um banco de dados
    return jsonify({
        'success': True,
        'message': 'Game state has been saved'
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000) 