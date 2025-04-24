from repositories.base_repository import BaseRepository
from domains.item import Item, ItemType, Rarity
from typing import List

class ItemRepository(BaseRepository[Item]):
    def find_by_name(self, name: str) -> Item:
        for item in self.items:
            if item.name == name:
                return item
        return None
    
    def find_by_type(self, item_type: ItemType) -> List[Item]:
        return [item for item in self.items if item.item_type == item_type]
    
    def find_by_rarity(self, rarity: Rarity) -> List[Item]:
        return [item for item in self.items if item.rarity == rarity]
    
    def find_equippable(self) -> List[Item]:
        return [item for item in self.items if item.is_equippable] 