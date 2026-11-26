# Sistema de sprites do Jujutsu Clash

## Como colocar sprites
1. Abra `assets/sprites/`.
2. Entre na pasta do personagem (ex.: `gojo/`, `yuji/`, `toji/`).
3. Coloque os PNGs com estes nomes: `idle.png`, `walk.png`, `walk-back.png`, `jump.png`, `fall.png`, `dash.png`, `block.png`, `hurt.png`, `charge.png`, `light.png`, `heavy.png`, `special.png`, `ultimate.png`, `domain.png`.
4. Cada PNG deve ser uma spritesheet horizontal: quadros lado a lado, todos com a mesma largura e altura, fundo transparente.
5. O padrão é 256×256 por quadro. Se o pacote usar outro tamanho, altere `frameWidth` e `frameHeight` no `manifest.json`.
6. Se a animação tiver uma quantidade de quadros diferente, informe `"frames": 6` (por exemplo) dentro daquela animação no manifesto. O sistema também tenta calcular automaticamente pela largura da imagem.
7. Ajuste `drawWidth` e `drawHeight` para mudar o tamanho do personagem na arena.

## Pastas de personagens
`gojo`, `yuji`, `megumi`, `nobara`, `sukuna`, `todo`, `toji`, `yuta`, `geto`, `maki`, `choso`.

## Cenários
Coloque imagens PNG/JPG em `assets/stages/` com os nomes `stage-1.png`, `stage-2.png` e `stage-3.png`. Use uma imagem horizontal de 960×480 (ou proporção 2:1). A imagem ocupa o fundo da arena; os efeitos de domínio e a camada do chão continuam por cima.

## Efeitos visuais opcionais
Para começar, use as animações `special`, `ultimate` e `domain` do próprio personagem para representar técnicas e efeitos. O sistema usa o desenho antigo como reserva quando um arquivo não existe ou ainda não carregou.

## Formato e licença
Use arte própria ou pacotes cuja licença permita incorporar os arquivos no jogo. Não presuma que uma imagem encontrada em pesquisa ou extraída de outro jogo/anime está liberada para reutilização.
