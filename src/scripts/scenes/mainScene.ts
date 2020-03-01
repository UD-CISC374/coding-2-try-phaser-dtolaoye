import ExampleObject from '../objects/exampleObject';
import Beam from "./beam";


export default class MainScene extends Phaser.Scene {
  private exampleObject: ExampleObject;
  background: Phaser.GameObjects.TileSprite;
  ship1: Phaser.GameObjects.Sprite; 
  ship2: Phaser.GameObjects.Sprite; 
  ship3: Phaser.GameObjects.Sprite; 
  powerUps: Phaser.Physics.Arcade.Group;
  player: Phaser.Physics.Arcade.Sprite;
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  spacebar: Phaser.Input.Keyboard.Key;
  projectiles: Phaser.GameObjects.Group;
  enemies: Phaser.Physics.Arcade.Group;
 

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.exampleObject = new ExampleObject(this, 0,0);
    this.background = this.add.tileSprite(0,0, this.scale.width, this.scale.height, "background").setOrigin(0,0);
    this.ship1 = this.add.sprite(this.scale.width / 2 + 50, this.scale.height,"ship1");
    this.ship2 = this.add.sprite(this.scale.width / 2, this.scale.height,"ship2");
    this.ship3 = this.add.sprite(this.scale.width / 2 - 50, this.scale.height,"ship3"); 
    
    this.ship1.play("ship1_anim");
    this.ship2.play("ship2_anim");
    this.ship3.play("ship3_anim");

    this.ship1.setInteractive();
    this.ship2.setInteractive();
    this.ship3.setInteractive();

    this.enemies = this.physics.add.group();
    this.enemies.add(this.ship1);
    this.enemies.add(this.ship2);
    this.enemies.add(this.ship3);

  
    this.player = this.physics.add.sprite(this.scale.width / 2 - 8, this.scale.height - 64, "player");
    this.player.play("thrust");
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);
    
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 
    this.projectiles = this.add.group();


    this.input.on('gameobjectdown', this.destroyShip, this);

    this.powerUps = this.physics.add.group();

    let maxObjects: number = 5;
    for(let i: number = 0; i <= maxObjects; i++){
      var powerUp = this.physics.add.sprite(16, 16, "power-up");
      this.powerUps.add(powerUp);
      powerUp.setRandomPosition(0, 0, this.scale.width, this.scale.height);

      
      if(Math.random() > .5){
        powerUp.play("red");
      }else{
        powerUp.play("gray");
      }
    

      powerUp.setVelocity(100,100);
      powerUp.setCollideWorldBounds(true);
      powerUp.setBounce(1);

    }

    this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp){
      projectile.destroy();
    }); 

    //ERROR MIGHT BE HERE
    this.physics.overlap(this.player, this.powerUps, this.pickPowerUp, undefined, this);
    this.physics.overlap(this.player, this.enemies, this.hurtPlayer, undefined, this);
    this.physics.overlap(this.projectiles, this.enemies, this.hitEnemy, undefined, this);

  }

  pickPowerUp(player, powerUp){
    powerUp.disableBody(true,true);
  }

  hurtPlayer(player, enemy){
    this.resetShip(enemy);
    player.x = this.scale.width / 2 - 8; 
    player.y = this.scale.height - 64
  }

  hitEnemy(projectile, enemy){
    projectile.destroy();
    this.resetShip(enemy);
  }

  moveShip(ship, speed){
    ship.y += speed; 
    if(ship.y > this.scale.height){
      this.resetShip(ship);
    }
  }

  resetShip(ship){
    ship.y = 0;
    var randomX = Phaser.Math.Between(0, this.scale.width);
    ship.x = randomX; 
  }

  destroyShip(pointer, gameObject){
    gameObject.setTexture("explosion");
    gameObject.play("explode");
  }

  
  movePlayer(){
    if (this.cursorKeys.left?.isDown){
      this.player.setVelocityX(-200);
    }
    else if (this.cursorKeys.right?.isDown){
      this.player.setVelocityX(200);
    }
    else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursorKeys.up?.isDown){
      this.player.setVelocityY(-200);
    }
    else if (this.cursorKeys.down?.isDown){
      this.player.setVelocityY(200);
    }
    else {
      this.player.setVelocityY(0);
    }
  }
  
  shoot(){
    var beam = new Beam(this); 
  }
  

  

  update() {
    this.background.tilePositionY -= 0.5;
    this.moveShip(this.ship1, 1);
    this.moveShip(this.ship2, 2);
    this.moveShip(this.ship3, 3);
    this.movePlayer();

    if(Phaser.Input.Keyboard.JustDown(this.spacebar)){
      this.shoot();
    }
    
    for(var i = 0; i <  this.projectiles.getChildren().length; i++){
      var beam = this.projectiles.getChildren()[i];
      beam.update(); 
    }
  }
}
