from domains.base import BaseDomain
from domains.item import Item
from domains.stats import Stats

class DropItem(BaseDomain):
    item: Item
    chance: float
    amount: int

class NPC(BaseDomain):
    name: str
    description: str
    stats: Stats
    x: int
    y: int
    hp: int
    max_hp: int
    level: int
    drop_items: list[DropItem]
    stats: Stats