# SFU_Webrtc_server
## Resumo
  O projeto proposto busca fornecer um serviço de infraestrutura para jogos multi usuários em tempo real, visando baixa latência. Para isso alguns serviços e tecnologias já existentes serão utilizadas e integradas de forma a entregar a solução. A ideia final é tornar o serviço genérico para qualquer tipo de jogo da categoria, rodando em segundo plano. Para o presente trabalho, foi utilizado um jogo implementado com uma biblioteca para desenvolvimento de jogos em 2D, o Phaser. O jogo se trata de dois personagens que percorrem o mapa em caça de estrelas espalhadas pelo cenário. Ao coletar todas o jogo tem seu fim e é dado um vencedor.

## Instalando módulos e pacotes
 1. git clone https://github.com/nelsonealves/SFU_Webrtc_server.git
 2. cd SFU_Webrtc_server
 3. ./install.sh
 4. ./run.sh
 5. Abra o navegador e acesse http://(ip do servidor):3000 
 
## Infraestrutura
  Por se tratar de um jogo, o serviço responsável pelo roteamento de dados deve ser confiável e ágil, de modo a garantir uma latência imperceptível ao usuário. Dessa forma foi escolhida uma técnica de roteamento de dados conhecida por SFU (Selective Forwarding Unit). A SFU é uma poderosa unidade responsável por reconhecer todos os usuários inseridos na aplicação, receber múltiplas stream de dados  e decidir o seu destino. Entre diversas bibliotecas que disponibilizam um servidor SFU, a escolhida foi a MediaSoup.
  
  O MediaSoup é uma biblioteca em Javascript que implementa funções para transporte de Video, Audio e Data Channels. Uma vez que a escolha para o projeto é um servidor que realiza somente o transporte de dados de teclado e mouse do computador, o foco deste documento adiante será apenas para Data Channel.

 
 O mediasoup não fornece nenhum protocolo de sinalização para comunicar clientes e servidor. Para isso, a sinalização entre servidor e cliente do Phaser é feita através de websocket e suas tags foram criadas manualmente. Já a comunicação entre servidor Phaser e servidor MediaSoup é realizada através de requisições HTTP. Toda a implementação foi projetada para atender apenas dois usuários. Vale ressaltar que a sinalização serve para comunicação do jogo e também para estabelecer a conexão dos usuários com o servidor MediaSoup.usando WebSocket, HTTP ou qualquer outro meio de comunicação e trocar parâmetros, solicitações / respostas e notificações relacionadas a grupos de mídia, entre clientes e servidor.



Ambos tem a capacidade de comunicar com o servidor e serem notificados do status do outro cliente. Sendo assim, todas as configurações necessárias para o correto funcionamento do MediaSoup é realizada até o momento que ambos clientes são notificados que estão preparados para iniciar o jogo. Além disso, o servidor informa ao cliente que acabou de entrar se o mesmo é o jogador 1 ou 2 (isso é necessário para a definição da posição inicial do personagem ao iniciar o jogo).  


## Sinalização



Para estabelecimento do transporte WebRtc, é necessária a realização de alguns passos anteriormente. 
 1. Cria-se um subprocesso no servidor MediaSoup instânciando a classe Worker. 
 ```
 const worker = await mediasoup.createWorker();
 ```
 2. Dentro de um Worker pode-se criar diversos Router, que nada mais são que os responsáveis por realizar o roteamentos das midias para os demais endpoints. A chamada do passo 1 e 2 é feita através de uma chamada HTTP no mediasoup server com uri "/router/(id do router)/webrtc_transport/create".  
 
 ```
 const router = await worker.createRouter();
 ```
 O servidor retornar o pedido com o id do Router criado, como no exemplo abaixo:
 
 ```
 { router_id: '7d1f6b6e-f621-410a-97d5-4faedb5006d3' }
 ```
 

 
 3. Já no lado cliente, instancia-se uma classe Device, representando o cliente mediasoup. O mesmo é criado quando um cliente estabelece conexão com o Servidor Phaser via browser. 
 ```
 const device = new mediasoupClient.Device();
 ```
 ### Tag "req_transport"
A tag "req_transport" notifica o servidor da entrada de um cliente no jogo e requisita as midias. O servidor responde a requisição emitindo as midias ofertadas para a tag "res_transport". É recebido como resposta da chamada "req_transport" as ofertas de midia do transporte Webrtc (Nesse ponto ainda não foi definido qual recebe e qual envia, entretanto já é definido os atributos "send" e "recv" para facilitar na programação). 

* send: Parâmetro com a oferta do transporte de envio
* recv: Parâmetro com a oferta do transporte de recepção

4. Diferente dos videos e áudios que utilizam RTP, o transporte dos Data Channels pelo MediaSoup será sobre SCTP (Stream Control Transmission Protocol). O cliente mediasoup precisa de transporte WebRTC separado para envio e recebimento. Sendo assim, para transmitir:
    4.1. Um transporte WebRTC deve ser criado primeiro no Router do servidor mediasoup: 
    ```
    router.createWebRtcTransport()
    ```
     É aqui que a negociação de midia acontece, na criação do transporte WebRtc. Um transporte WebRTC representa um caminho      de rede negociado por ambos via procedimentos ICE e DTLS. Um transporte WebRTC pode ser usado para receber mídia,enviar      mídia ou para receber e enviar. Não há limitação no mediasoup. Ao chamar Router.createWebRtcTransport() definem-se os        parâmetros que serão ofertados através de atributos, tais como:
      * listenIps - Endereço IP de hospedagem do servidor
      * enableUdp - Ofertar protocolo Udp
      * enableTcp - Ofertar protocolo Tcp
      * preferUdp - Dá preferência de escolha do protocolo Udp na oferta da midia.
      * enableSctp - Ofertar protocolo Sctp
  
    Como estamos lidando com dataChannels, podemos ver no exemplo a seguir que no servidor foi dada prefêrencia ao uso do       protocolo udp para transporte: 
  
![](image/webrtctransport.png)
 
  O WebRtcTransport, responsável pela criação dos canais de transporte no mediasoup-client para transmissão e recepção dos data channels. Internamente, o transporte mantém uma instância do WebRTC RTCPeerConnection.
  
  4.2. A oferta é recebida no cliente e o transporte criado no servidor também deve ser feita no lado cliente. Como dito anteriormente, é necessário criar transportes para recepção e transmissão, ou seja, dois transportes. No lado servidor chamar a funçao do item 4.1 por duas vezes, porém no cliente são duas funções que esperam os parâmetros de oferta do cliente.
  * Para transmissão:
    ```
    const send = device.createSendTransport({Midia_ofertada})
    ```
    * Para recepção
  ```
   const recv = device.createRecvTransport({Midia_ofertada})
  ```
  O MediaSoup possui um websocket com tags pré definidas que são usadas para casos como esse, que o servidor espera a resposta do cliente. Sendo assim, foi implementado uma escuta para a tag "connect". O servidor, ao receber a resposta da oferta, envia via websocket a chave dtls para estabelecimento seguro do transporte:
  ```
   this.send.on("connect", ({ dtlsParameters }, callback, errback) => {
          intro.socket.emit("connect-webrtc", {dtlsParameters: dtlsParameters, transport_id: intro.send.id});
          intro.socket.on("res_connect_webrtc",()=>{
            callback();
          });
        })
  ```     
  ![](image/dtls.png)
  
  Recebendo a chave dtls, a mesma é enviada novamente para o servidor através da tag "connect-webrtc", essa tag chama a uri "/router/'+data.transport_id+"/webrtc_transport/connect" com a chave e o id dos transportes (sendTransport e recvTransport). Feito isso, o transporte está estabelecido. Agora é necessário criar as classes produtoras e consumidoras de dados: Producer e Consumer. Producer, que encaminha Data Channels para o router SFU e o Consumer, responsável por encaminhar um Data Channel para um endpoint. A arquitetura dessas duas classes são semelhantes a técnica Publish-Subscriber e ambas são intânciadas no lado servidor e cliente. Um cliente A, para receber dados do cliente B, deve inscrever seu Consumer com o id do Producer do cliente A.

  ### Tag "producedata"
Estabelecida conexão do transporte, o lado cliente cria sua instância Producer e requisita a criação da mesma no servidor:
```
 const sendProduce = this.send.produceData(); 
```
É criado uma escuta via websocket interno MediaSoup para a tag "producedata" e feita uma chamada HTTP para a uri "/router/'+intro.send.id+"/webrtc_transport/data_producer". O servidor cria uma instância Producer, que espera os seguintes parâmetros Sctp:

SctpParameters: 
  * port - Porta para comunicação 
  * OS - Define a quantidade de stream que irão dar saída do terminal para o Router
  * MIS - Define a quantidade de stream que irão dar entrada no terminal
  * maxMessageSize - Tamanho máximo das messagens

```
const dataProducer = await webrtc1.produceData(SctpParameters);
```
Feito isso, o cliente está pronto para enviar dados para o Router.


### Tag "req_dataconsumer
Depois que o transporte de recebimento é criado, o cliente pode consumir vários DataChannels nele. No entanto, o pedido é o oposto (aqui o Consumer deve ser criado primeiro no servidor). 

   1. Enviada uma requisição HTTP para o servidor instânciar o Consumer através da uri "/router/'+data.recv_id+"/webrtc_transport/data_consumer" passando id do seu recvTransport e sendTransport. No servidor cria-se uma instância que espera os seguintes parâmetros:

* dataProducerId - ID do producer que vai se increver para receber mensagens

O servidor responde a requisição com as seguintes informações:

```
{ id: 'c6d29e35-d21b-452d-890d-8c17db8406fe', id do Consumer criado
  producerId: '2d179c44-3111-4791-b941-16ed85ab7f99', // id do Producer que irá se inscrever
  sctpStreamParameters: { ordered: true, streamId: 0 }, // Parâmetros SCTP
  label: '',
  protocol: '' }
```
Esses parâmetros são esperados pela função do lado cliente que cria a instância do Consumer:

```
const consumer = intro.recv.consumeData(parameters);
```
  
Sendo assim, é efetuada toda a implementação do jogo. Em uma busca rápida no Wireshark nota-se o uso do protocolo Udp para transporte e DTLS sobre TLS.

![](image/data_tls.png)

Outra captura interessante é a resposta do Binding Request feita pelo servidor STUN. A implementação de transporte WebRTC do mediasoup é o ICE Lite, o que significa que ele não inicia as conexões do ICE, mas espera as ICE Binding Request a partir dos terminais clientes.

![](image/stun.png)

  
  

   
  

 

