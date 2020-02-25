# SFU_Webrtc_server
## Resumo
  O projeto proposto busca fornecer um serviço de infraestrutura para jogos multi usuários em tempo real, visando baixa latência. Para isso alguns serviços e tecnologias já existentes serão utilizadas e integradas de forma a entregar a solução. A ideia final é tornar o serviço genérico para qualquer tipo de jogo da categoria, rodando em segundo plano. Para o presente trabalho, foi utilizado um jogo implementado com uma biblioteca para desenvolvimento de jogos em 2D, o Phaser. O jogo se trata de dois personagens que percorrem o mapa em caça de estrelas espalhadas pelo cenário. Ao coletar todas o jogo tem seu fim e é dado um vencedor.

## Infraestrutura
  Por se tratar de um jogo, o serviço responsável pelo roteamento de dados deve ser confiável e ágil, de modo a garantir uma latência imperceptível ao usuário. Dessa forma foi escolhida uma técnica de roteamento de dados conhecida por SFU (Selective Forwarding Unit). A SFU é uma poderosa unidade responsável por reconhecer todos os usuários inseridos na aplicação, receber múltiplas stream de dados  e decidir o seu destino. Entre diversas bibliotecas que disponibilizam um servidor SFU, a escolhida foi a MediaSoup.
  
  O MediaSoup é uma biblioteca em Javascript que implementa funções para transporte de Video, Audio e Data Channels. Uma vez que a escolha para o projeto é um servidor que realiza somente o transporte de dados de teclado e mouse do computador, o foco deste documento adiante será apenas para Data Channel.

 Sendo assim, cria-se um subprocesso no servidor instânciando a classe Worker. Dentro de um Worker pode-se criar diversos Router, que nada mais são que os responsáveis por realizar o roteamentos das midias para os demais endpoints. Diferente dos videos e áudios que utilizam RTP, o transporte dos Data Channels pelo MediaSoup será sobre SCTP (Stream Control Transmission Protocol), implementando duas classes: Producer, que encaminha Data Channels para o router SFU e o Consumer, responsável por encaminhar um Data Channel para um endpoint. A arquitetura dessas duas classes são semelhantes a técnica Publish-Subscriber e ambas são intânciadas no lado servidor e cliente. Um cliente A, para receber dados do cliente B, deve inscrever seu Consumer com o id do Producer do cliente A.

## Sinalização
A sinalização entre servidor e cliente do Phaser é feita através de websocket e suas tags foram criadas manualmente. Já a comunicação entre servidor Phaser e servidor MediaSoup é realizada através de requisições HTTP. Toda a implementação foi projetada para atender apenas dois usuários. Vale ressaltar que a sinalização serve para comunicação do jogo e também para estabelecer a conexão dos usuários com o servidor MediaSoup.
### Tag "req_transport"
> Antes mesmo de estabelecermos a conexão dos usuário com o servidor MediaSoup foi necessário distinguir-los, uma vez que os personagens do jogo precisam nascer em locais diferentes. A tag "req_transport" notifica o servidor da sua entrada no jogo e informado se é o jogador 1 ou 2, e também instância o WebRtcTransport, responsável pela criação dos canais de transporte no mediasoup-client para transmissão e recepção dos data channels. Internamente, o transporte mantém uma instância do WebRTC RTCPeerConnection. O servidor responde a requisição através da tag "res_transport"

### Tag "res_transport"
> Nesta etapa é que acontece a oferta de midia do MediaSoup. Ao receber as instâncias do objeto WebRtcTransport os parâmetros ofertados pelo servidos são enviados para o cliente, bastando apenas criar as instâncias no lado cliente e conectar o transporte. Segue abaixo imagem dos parâmetros enviados. Podemos notar a presença de parâmetros vistos na matérias como os candidatos do parâmetro ICE, SCTP e até mesmo a chave dtls para fornecer segurança na comunicação ponta-a-ponta.

![](image/midia.png)

### Tag "producedata"
Estabelecida conexão, o lado cliente requisita a criação da instância Producer, citada anteriormente. Criada essa instância nos dois lados, o jogo está pronto para começar.

### Tag "req_dataconsumer
Chamada para a criação do Consumer, realizando o subscriber no Producer do outro player. O servidor responder o cliente com a tag "res_dataconsumer"



Ambos tem a capacidade de comunicar com o servidor e serem notificados do status do outro cliente. Sendo assim, todas as configurações necessárias para o correto funcionamento do MediaSoup é realizada até o momento que ambos clientes são notificados que estão preparados para iniciar o jogo. Além disso, o servidor informa ao cliente que acabou de entrar se o mesmo é o jogador 1 ou 2 (isso é necessário para a definição da posição inicial do personagem ao iniciar o jogo).  


  
 ## Instalando módulos e pacotes
 > git clone https://github.com/nelsonealves/SFU_Webrtc_server.git
 cd SFU_Webrtc_server
 ./install.sh
 ./run.sh
 
 
 

