import uuid
from datetime import datetime
from typing import List
from domains.player import Player
from domains.item import Item
from domains.stats import Stats
from domains.life_skill import LifeSkill
from repositories.player_repository import PlayerRepository

class PlayerService:
    def __init__(self, player_repository: PlayerRepository):
        self.player_repository = player_repository
    
    def create_player(self, account_id: str, username: str) -> Player:
        stats = Stats(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            strength=10,
            intelligence=10,
            dexterity=10,
            constitution=10,
            health=100,
            mana=100,
            physical_power=10,
            magic_resistance=10,
            speed=10,
            magic_power=10,
            armor=5,
            critical_chance=0.05,
            critical_power=1.5,
            luck=1.0
        )
        
        life_skills = LifeSkill(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            cooking=0.0,
            fishing=0.0,
            mining=0.0,
            gathering=0.0,
            lumbering=0.0,
            crafting=0.0
        )
        
        player = Player(
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            account_id=account_id,
            username=username,
            equipment=[],
            inventory=[],
            stats=stats,
            life_skills=life_skills,
            x=0,
            y=0,
            hp=100,
            max_hp=100,
            level=1,
            exp=0,
            next_level_exp=100,
            gold=0,
            inventory_size=20,
            attribute_points=0
        )
        
        return self.player_repository.save(player)
    
    def add_item_to_inventory(self, player: Player, item: Item) -> Player:
        if len(player.inventory) >= player.inventory_size:
            raise ValueError("Inventory is full")
        
        player.inventory.append(item)
        return self.player_repository.save(player)
    
    def equip_item(self, player: Player, item_id: str) -> Player:
        # Find the item in the inventory
        item_to_equip = next((item for item in player.inventory if item.id == item_id), None)
        
        if not item_to_equip:
            raise ValueError("Item not found in inventory")
        
        if not item_to_equip.is_equippable:
            raise ValueError("Item cannot be equipped")
        
        # Add to equipment
        player.equipment.append(item_to_equip)
        
        # Remove from inventory
        player.inventory = [item for item in player.inventory if item.id != item_id]
        
        return self.player_repository.save(player)
    
    def gain_experience(self, player: Player, exp_amount: int) -> Player:
        player.exp += exp_amount
        
        # Check for level up
        while player.exp >= player.next_level_exp:
            player.exp -= player.next_level_exp
            player.level += 1
            player.next_level_exp = int(player.next_level_exp * 1.5)
            player.attribute_points += 3
            player.max_hp += 10
            player.hp = player.max_hp
        
        return self.player_repository.save(player) 