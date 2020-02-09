import { intro } from "./intro.js"
import { cena2 } from "./cena2.js";


var player;
var player2;
var player2_x;
var player2_y;
var stars;
var bombs;
var platforms;
var cursors;
var pointer;
var touchX;
var touchY;
var score = 0;
var scoreText;


var cena1 = new Phaser.Scene("Cena 1");

cena1.preload = function() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.spritesheet("fullscreen", "assets/fullscreen.png", {
    frameWidth: 64,
    frameHeight: 64
  });

  // d-pad
  this.load.spritesheet("esquerda", "assets/esquerda.png", {
    frameWidth: 64,
    frameHeight: 64
  });
  this.load.spritesheet("direita", "assets/direita.png", {
    frameWidth: 64,
    frameHeight: 64
  });
  this.load.spritesheet("cima", "assets/cima.png", {
    frameWidth: 64,
    frameHeight: 64
  });
};

cena1.create = function() {
 
  //  A simple background for our game
  this.add.image(400, 300, "sky");

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms
    .create(400, 568, "ground")
    .setScale(2)
    .refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // The player and its settings
  console.log("intro.user.player");
  console.log(intro.user.player);
  if(intro.user.player == 0) {
    console.log('Oi, eu sou o player 1');
    player = this.physics.add.sprite(100, 450, "dude");
  } else {
    console.log('Oi, eu sou o player 2');
    player = this.physics.add.sprite(300, 450, "dude");
    
  }
  

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  player2 = this.add.sprite(50, 515, "dude");
  intro.socket.on("renderPlayer", ({ x, y }) => {
    console.log({ x, y });
    player2_x = x;
    player2_y = y;
  });

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "turn",
    frames: [
      {
        key: "dude",
        frame: 4
      }
    ],
    frameRate: 20
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", {
      start: 5,
      end: 8
    }),
    frameRate: 10,
    repeat: -1
  });

  //  Input Events
  // Keyboard
  cursors = this.input.keyboard.createCursorKeys();
  // Touch
  pointer = this.input.addPointer(1);

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: {
      x: 12,
      y: 0,
      stepX: 70
    }
  });

  stars.children.iterate(function(child) {
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  bombs = this.physics.add.group();

  //  The score
  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000"
  });

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);

  
  var button = this.add
    .image(800 - 16, 16, "fullscreen", 0)
    .setOrigin(1, 0)
    .setInteractive();

  button.on(
    "pointerup",
    function() {
      if (this.scale.isFullscreen) {
        button.setFrame(0);
        this.scale.stopFullscreen();
      } else {
        button.setFrame(1);
        this.scale.startFullscreen();
      }
    },
    this
  );

  // Tecla "F" também ativa/desativa tela cheia
  var FKey = this.input.keyboard.addKey("F");
  FKey.on(
    "down",
    function() {
      if (this.scale.isFullscreen) {
        button.setFrame(0);
        this.scale.stopFullscreen();
      } else {
        button.setFrame(1);
        this.scale.startFullscreen();
      }
    },
    this
  );

  var esquerda = this.add
    .image(50, 500, "esquerda", 0)
    .setInteractive()
    .setScrollFactor(0);
  esquerda.on("pointerover", () => {
    esquerda.setFrame(1);
    player.setVelocityX(-160);
    player.anims.play("left", true);
  });
  esquerda.on("pointerout", () => {
    esquerda.setFrame(0);
    player.setVelocityX(0);
    player.anims.play("turn", true);
  });
  //
  // Para a direita: correr
  var direita = this.add
    .image(124, 500, "direita", 0)
    .setInteractive()
    .setScrollFactor(0);
  direita.on("pointerover", () => {
    direita.setFrame(1);
    player.setVelocityX(160);
    player.anims.play("right", true);
  });
  direita.on("pointerout", () => {
    direita.setFrame(0);
    player.setVelocityX(0);
    player.anims.play("turn", true);
  });
  //
  // Para cima: pular
  var cima = this.add
    .image(750, 500, "cima", 0)
    .setInteractive()
    .setScrollFactor(0);
  cima.on("pointerover", () => {
    cima.setFrame(1);
    if (player.body.touching.down) {
      player.setVelocityY(-330);
    }
  });
  cima.on("pointerout", () => {
    cima.setFrame(0);
  });
  





  

  intro.recv.on("connect", ({ dtlsParameters }, callback, errback) => {
    console.log("CONNNNECCT");
    intro.socket.emit("connect-webrtc", {dtlsParameters: dtlsParameters, transport_id: intro.recv.id});
    intro.socket.on("res_connect_webrtc",()=>{
      console.log('callback recv');
      callback();
    });
    
  })
  //console.log();
  intro.socket.on("res_dataconsumer", (data)=> {
    console.log("response data consumer")
    console.log(data)
    const consumer = intro.recv.consumeData(
      {
        id                   : data.id,
        dataProducerId           : data.producerId,
        sctpStreamParameters : data.sctpStreamParameters,
        label                : data.label,
        protocol             : data.protocol
      });
      
      consumer.then((data)=> {
        console.log("CONSUMER ROLANDO");
        data.on("message", (data)=>{
          let position = JSON.parse(data);
          player2.x = position.x;
          player2.y = position.y;
          console.log(JSON.parse(data));

        });
      })
      
  })

  console.log("INTRO SENDDDDD");
  console.log(intro.recv);
  intro.socket.emit("req_dataconsumer", {recv_id: intro.recv._id, send_id: intro.send._id})


};

cena1.update = function () {
  // Muitas mensagens. Melhorar para apenas quando houver novidades...
  //this.socket.emit("movement", { x: player.body.x, y: player.body.y });
  intro.sendProduce.then((data) => {
    console.log("OPAAAAAAAAAAAAAAAA");
    data.send(
      JSON.stringify({
        "x": player.body.x,
        "y": player.body.y
      })
      );
    
  })
  //intro.sendProduce.send("MENSAGEM ROLANDO")
  
};

function collectStar(player, star) {
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function(child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb(player, bomb) {
  this.scene.start(cena2);
}

export { cena1 };