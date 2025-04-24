import uuid
import random
from datetime import datetime
from domains.player import Player
from domains.npc import NPC, DropItem
from services.player_service import PlayerService
from repositories.player_repository import PlayerRepository

class GameService:
    def __init__(self, player_service: PlayerService):
        self.player_service = player_service
        
    def battle(self, player: Player, npc: NPC) -> (bool, list):
        """
        Simula uma batalha entre o jogador e um NPC.
        Retorna uma tupla com (vitória, recompensas)
        """
        player_hp = player.hp
        npc_hp = npc.hp
        
        battle_log = []
        battle_log.append(f"Batalha iniciada: {player.username} vs {npc.name}")
        
        # Calculando dano do jogador e do NPC
        player_damage = player.stats.physical_power - int(npc.stats.armor * 0.5)
        player_damage = max(1, player_damage)  # Garantir dano mínimo
        
        npc_damage = npc.stats.physical_power - int(player.stats.armor * 0.5)
        npc_damage = max(1, npc_damage)  # Garantir dano mínimo
        
        # Simulação de turnos
        turn = 0
        while player_hp > 0 and npc_hp > 0:
            turn += 1
            battle_log.append(f"Turno {turn}")
            
            # Turno do jogador
            crit_chance = random.random() < player.stats.critical_chance
            actual_damage = player_damage
            
            if crit_chance:
                actual_damage = int(player_damage * player.stats.critical_power)
                battle_log.append(f"{player.username} causou um golpe crítico de {actual_damage} de dano!")
            else:
                battle_log.append(f"{player.username} causou {actual_damage} de dano.")
            
            npc_hp -= actual_damage
            
            # Verificar se o NPC foi derrotado
            if npc_hp <= 0:
                battle_log.append(f"{npc.name} foi derrotado!")
                break
                
            # Turno do NPC
            battle_log.append(f"{npc.name} causou {npc_damage} de dano.")
            player_hp -= npc_damage
            
            # Verificar se o jogador foi derrotado
            if player_hp <= 0:
                battle_log.append(f"{player.username} foi derrotado!")
                break
                
            battle_log.append(f"Status: {player.username} HP: {player_hp} | {npc.name} HP: {npc_hp}")
        
        # Determinar resultado e recompensas
        victory = player_hp > 0
        rewards = []
        
        if victory:
            # Experiência baseada no nível do NPC
            exp_reward = npc.level * 10
            self.player_service.gain_experience(player, exp_reward)
            rewards.append(f"EXP: {exp_reward}")
            
            # Gold baseado no nível do NPC
            gold_reward = npc.level * 5
            player.gold += gold_reward
            rewards.append(f"Gold: {gold_reward}")
            
            # Drops baseados em chance
            for drop_item in npc.drop_items:
                if random.random() < drop_item.chance:
                    actual_amount = random.randint(1, drop_item.amount)
                    for _ in range(actual_amount):
                        try:
                            self.player_service.add_item_to_inventory(player, drop_item.item)
                            rewards.append(f"Item: {drop_item.item.name}")
                        except ValueError:
                            # Inventário cheio
                            battle_log.append("Seu inventário está cheio!")
                            break
        
        # Atualizar HP do jogador
        player.hp = max(1, player_hp) if victory else 1  # Se derrotado, fica com 1 HP
        
        return victory, battle_log, rewards 