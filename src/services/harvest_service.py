import uuid
import random
from datetime import datetime
from domains.entity import Harvest, TypeEntity
from domains.player import Player
from domains.item import Item, ItemType, Rarity
from services.player_service import PlayerService

class HarvestService:
    def __init__(self, player_service: PlayerService):
        self.player_service = player_service
        self.active_harvests = {}  # id: (harvest, respawn_time)
        
    def register_harvest(self, harvest: Harvest) -> Harvest:
        """Registra um novo objeto de colheita no mundo"""
        self.active_harvests[harvest.id] = (harvest, 0)
        return harvest
        
    def create_resource(self, name: str, type_entity: TypeEntity) -> Item:
        """Cria um novo item de recurso baseado no tipo de entidade"""
        item = Item(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            name=f"{name}",
            description=f"Um recurso obtido por {type_entity.value}",
            item_type=ItemType.RESOURCE,
            rarity=Rarity.COMMON,
            price=5,
            sell_price=2,
            is_tradable=True,
            is_consumable=False,
            is_equippable=False,
            is_boostable=False,
            stats=None
        )
        return item
        
    def harvest_resource(self, player: Player, harvest_id: str) -> (bool, str, list):
        """
        Tenta colher um recurso de uma entidade de colheita
        Retorna (sucesso, mensagem, itens)
        """
        if harvest_id not in self.active_harvests:
            return False, "Esse recurso não existe ou já foi colhido", []
            
        harvest, respawn_timer = self.active_harvests[harvest_id]
        
        # Verificar se o recurso já foi regenerado
        if respawn_timer > 0:
            return False, f"Este recurso estará disponível em {respawn_timer} segundos", []
            
        # Verificar a skill necessária
        required_skill = harvest.type_entity.value
        player_skill_level = getattr(player.life_skills, required_skill)
        
        # Calcular chance de sucesso baseada na habilidade
        success_chance = min(0.3 + (player_skill_level * 0.05), 0.95)
        success = random.random() < success_chance
        
        if not success:
            # Aumentar um pouco a habilidade mesmo com falha
            skill_increase = 0.05
            setattr(player.life_skills, required_skill, player_skill_level + skill_increase)
            return False, f"Você falhou ao tentar coletar {harvest.name}", []
            
        # Sucesso na coleta
        items_collected = []
        drop_amount = random.randint(1, harvest.drop_amount)
        
        for _ in range(drop_amount):
            resource_item = self.create_resource(harvest.name, harvest.type_entity)
            try:
                self.player_service.add_item_to_inventory(player, resource_item)
                items_collected.append(resource_item)
            except ValueError:
                return True, "Seu inventário está cheio!", items_collected
        
        # Aumentar a habilidade do jogador
        skill_increase = 0.1 + (random.random() * 0.1)
        new_skill_level = player_skill_level + skill_increase
        setattr(player.life_skills, required_skill, new_skill_level)
        
        # Definir timer de respawn
        self.active_harvests[harvest_id] = (harvest, harvest.respawn_time)
        
        return True, f"Você coletou {drop_amount} {harvest.name}(s)! (Habilidade de {required_skill}: {new_skill_level:.2f})", items_collected
        
    def update_respawn_timers(self, seconds: int):
        """Atualiza os timers de respawn das entidades de colheita"""
        for harvest_id, (harvest, timer) in list(self.active_harvests.items()):
            if timer > 0:
                new_timer = max(0, timer - seconds)
                self.active_harvests[harvest_id] = (harvest, new_timer) 