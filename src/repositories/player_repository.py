from repositories.base_repository import BaseRepository
from domains.player import Player

class PlayerRepository(BaseRepository[Player]):
    def find_by_account_id(self, account_id: str) -> Player:
        for player in self.items:
            if player.account_id == account_id:
                return player
        return None
    
    def find_by_username(self, username: str) -> Player:
        for player in self.items:
            if player.username == username:
                return player
        return None 