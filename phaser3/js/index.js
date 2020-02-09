import { cena1 } from "./cena1.js";
import { cena2 } from "./cena2.js";
import { intro } from "./intro.js";



var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  scene: [intro, cena1, cena2]
};

var game = new Phaser.Game(config);
