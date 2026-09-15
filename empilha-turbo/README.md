# Empilha Turbo — Corrida de Empilhadeiras

Protótipo 0.1. Desenvolvedor: Giovani Senem.

Jogo independente de Mecânico de Aço. O aplicativo Android usa o identificador br.com.beardedbr.empilhaturbo e pode ser instalado ao lado do outro jogo.

## Jogar
- Complete três entregas antes de 2 minutos e 30 segundos.
- Aproxime-se do pallet, solte o direcional para parar e toque em PEGAR.
- Vá à doca indicada e toque em ENTREGAR.
- Segure TURBO para acelerar. Ele recarrega quando não está sendo usado.
- Evite prateleiras, paredes e empilhadeiras em circulação: batidas danificam a carga.
- Motor, pneus e garfos podem ser melhorados com créditos virtuais obtidos nas partidas.
- Recordes e melhorias são locais. A versão HTML e o APK mantêm dados separados.

No computador: WASD ou setas para dirigir, E para manusear a carga, Shift para turbo e Esc para pausar.

O HTML portátil contém o jogo inteiro e pode ser aberto sem internet.
O APK é uma compilação de teste assinada com a chave de depuração do ambiente de compilação; futuras atualizações exigem conservar a chave ou preparar uma assinatura definitiva. Não é uma atualização do APK de Mecânico de Aço.

## Projeto
Android Java/WebView com HTML, CSS e JavaScript. Gráficos e sons próprios, gerados pelo código; sem bibliotecas de jogo, imagens externas, rastreamento, anúncios ou rede durante a partida.

Build: Java 17, Gradle 8.9, Android Gradle Plugin 8.7.3 e Android SDK 35.
Na pasta empilha-turbo, gradle assembleDebug gera o APK.
node checks/core.test.cjs verifica movimento, colisões, recompensas e validação dos dados salvos.
python scripts/package.py cria o HTML portátil e o ZIP do código-fonte.
O workflow empilha-turbo.yml também executa uma partida no Chromium com Playwright e verifica controles, entrega, pausa e persistência.
