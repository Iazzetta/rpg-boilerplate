from typing import TypeVar, Generic, List, Optional
from domains.base import BaseDomain

T = TypeVar('T', bound=BaseDomain)

class BaseRepository(Generic[T]):
    def __init__(self):
        self.items: List[T] = []
    
    def find_by_id(self, id: str) -> Optional[T]:
        for item in self.items:
            if item.id == id:
                return item
        return None
    
    def find_all(self) -> List[T]:
        return self.items
    
    def save(self, item: T) -> T:
        existing = self.find_by_id(item.id)
        if existing:
            # Replace existing item
            self.items = [item if x.id == item.id else x for x in self.items]
        else:
            # Add new item
            self.items.append(item)
        return item
    
    def delete(self, id: str) -> bool:
        existing = self.find_by_id(id)
        if existing:
            self.items = [x for x in self.items if x.id != id]
            return True
        return False 