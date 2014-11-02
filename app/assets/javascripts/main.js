var gameWidth = window.innerWidth * window.devicePixelRatio,
    gameHeight = window.innerHeight * window.devicePixelRatio,
    game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'gameDiv');

var mainState = {

  preload: function() { 
    // This function will be executed at the beginning     
    // That's where we load the game's assets  

    //background assets
    game.stage.backgroundColor = '#1ddded';

    //image assets
    game.load.image('bird', '/images/bird.png'); 
    game.load.image('pipe', '/images/pipe.png');

    //sounds assets
    game.load.audio('jump', '/sounds/jump.wav');
    game.load.audio('die', '/sounds/die.wav');
  },

  create: function() { 
    // This function is called after the preload function     
    // Here we set up the game, display sprites, etc.  

    var birdX = Math.floor(gameWidth/3) - 100,
        birdY = Math.floor(gameHeight/2) - 100,
        spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bird = this.game.add.sprite(birdX, birdY, 'bird');
    this.bird.anchor.setTo(-0.2, 0.5);

    game.physics.arcade.enable(this.bird);
    //reenable this
    //this.bird.body.gravity.y = 1000;

    this.pipes = game.add.group(); // Create a group  
    this.pipes.enableBody = true;  // Add physics to the group  
    this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes 

    spaceKey.onDown.add(this.jump, this);

    this.score = 0;
    this.firstPipe = true;
    this.labelScore = game.add.text(10, 10, "0", { font: "24px Helvetica", fill: "#ffffff" });  

    this.jumpSound = game.add.audio('jump');
    this.dieSound = game.add.audio('die');

  },

  update: function() {
    // This function is called 60 times per second    
    // It contains the game's logic   

    if (this.bird.inWorld == false) {
      this.dieSound.play();
      this.restartGame();
    }

    game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 

    if (this.bird.angle < 20) {
      this.bird.angle += 1; 
    }

  },

  hitPipe: function(){

    if (this.bird.alive == false) {
      return;
    }

    // Set the alive property of the bird to false
    this.bird.alive = false;
    this.dieSound.play();

    // Prevent new pipes from appearing
    game.time.events.remove(this.timer);

    // Go through all the pipes, and stop their movement
    this.pipes.forEachAlive(function(p){
      p.body.velocity.x = 0;
    }, this);

  },

  jump: function() {  
    // Add a vertical velocity to the bird

    var pipeTimeout = gameWidth * 3.5;

    if ( this.bird.body.gravity.y == 0 ) {
      this.bird.body.gravity.y = 1000;
      this.timer = game.time.events.loop(pipeTimeout, this.addColumnOfPipes, this); 
    }

    if ( this.bird.alive ) {
      this.bird.body.velocity.y = -350;
      game.add.tween(this.bird).to({angle: -20}, 100).start();
      this.jumpSound.play();
    }

  },

  restartGame: function() {  
    // Start the 'main' state, which restarts the game

    game.state.start('main');

  },

  addOnePipe: function(x, y) {  
    // Get the first dead pipe of our group
    var pipe = this.pipes.getFirstDead();

    // Set the new position of the pipe
    pipe.reset(x, y);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200; 

    // Kill the pipe when it's no longer visible 
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;

  },

  addColumnOfPipes: function() {  
    var numberOfBlocks = Math.floor(gameHeight / 70),
        hole = Math.floor(Math.random() * (numberOfBlocks-1)) + 1;

    for (var i = 0; i < (numberOfBlocks+1); i++) {
      if (i != hole && i != hole + 1) {
        this.addOnePipe(gameWidth, i * 60 + 10);
      }
    }

    if (!this.firstPipe) {
      this.score += 1;  
      this.labelScore.text = this.score;  
    } else {
      this.firstPipe = false;
    }
  }
};

game.state.add('main', mainState);  
game.state.start('main');  