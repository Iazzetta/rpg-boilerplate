from domains.base import BaseDomain
from domains.item import Item
from domains.stats import Stats
from domains.life_skill import LifeSkill

class Player(BaseDomain):
    account_id: str
    username: str
    equipment: list[Item]
    inventory: list[Item]
    stats: Stats
    life_skills: LifeSkill
    x: int
    y: int
    hp: int
    max_hp: int
    level: int
    exp: int
    next_level_exp: int
    gold: int
    inventory_size: int
    attribute_points: int