# RPG Game

Um jogo de RPG simples baseado em texto, construído com Python seguindo uma arquitetura limpa e escalável.

## Estrutura do Projeto

O projeto segue uma arquitetura em camadas para facilitar a manutenção e escalabilidade:

- **Domains**: Modelos de dados e regras de negócio
- **Repositories**: Gerenciamento de persistência de dados
- **Services**: Lógica de negócio e regras do jogo
- **UI**: Interface com o usuário

## Funcionalidades

- Sistema de combate por turnos
- Coleta de recursos (mineração, colheita, lenhador)
- Sistema de habilidades de vida
- Inventário de itens
- Atributos de personagem
- Progressão de nível e experiência

## Como Executar

1. Clone o repositório
2. Execute o jogo com `python src/main.py`

## Extensibilidade

A estrutura modular permite fácil extensão do jogo:

- Adicione novos tipos de itens em `domains/item.py`
- Crie novos NPCs em `repositories/npc_repository.py`
- Implemente novas mecânicas em `services/game_service.py`
- Personalize a interface em `ui/game.py`

## Requisitos

- Python 3.7+
- Biblioteca `pydantic`

## Instalação de Dependências

```bash
pip install pydantic
``` 