from domains.base import BaseDomain
from domains.stats import Stats
from enum import Enum

class Rarity(Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"
    UNIQUE = "unique"
    
class ItemType(Enum):
    GENERAL = "general"
    RESOURCE = "resource"
    BUFFER = "buffer"
    MOUNT = "mount"
    SCROLL = "scroll"
    

class Item(BaseDomain):
    name: str
    description: str
    item_type: ItemType
    rarity: Rarity
    price: int
    sell_price: int
    is_tradable: bool
    is_consumable: bool
    is_equippable: bool
    is_boostable: bool
    stats: Stats


