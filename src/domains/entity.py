from enum import Enum
from domains.base import BaseDomain
from domains.item import Item

class TypeEntity(Enum):
    COOKING = "cooking"
    FISHING = "fishing"
    MINING = "mining"
    GATHERING = "gathering"
    LUMBERING = "lumbering"
    CRAFTING = "crafting"

class Harvest(BaseDomain):
    name: str
    description: str
    type_entity: TypeEntity
    drop_amount: int
    respawn_time: int # seconds
    hp: int
    is_collidable: bool
    
    
