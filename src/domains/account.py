from domains.base import BaseDomain


class Account(BaseDomain):
    name: str
    email: str
    password: str
    gems: int