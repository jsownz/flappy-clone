var gameWidth = window.innerWidth;
var gameHeight = window.innerHeight;

var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'gameDiv');

var mainState = {

  preload: function() { 
    // This function will be executed at the beginning     
    // That's where we load the game's assets  

    game.stage.backgroundColor = '#1ddded';

    game.load.image('bird', 'assets/bird.png'); 
    game.load.image('pipe', 'assets/pipe.png');

  },

  create: function() { 
    // This function is called after the preload function     
    // Here we set up the game, display sprites, etc.  

    var birdX = Math.floor(gameWidth/3) - 100,
        birdY = Math.floor(gameHeight/2) - 100;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bird = this.game.add.sprite(birdX, birdY, 'bird');

    game.physics.arcade.enable(this.bird);
    //reenable this
    //this.bird.body.gravity.y = 1000;

    this.pipes = game.add.group(); // Create a group  
    this.pipes.enableBody = true;  // Add physics to the group  
    this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes 

    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);

    this.score = 0;
    this.firstPipe = true;
    this.labelScore = game.add.text(10, 10, "0", { font: "24px Helvetica", fill: "#ffffff" });  

  },

  update: function() {
    // This function is called 60 times per second    
    // It contains the game's logic   

    if (this.bird.inWorld == false) {
      this.restartGame();
    }

    game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);  

  },

  jump: function() {  
    // Add a vertical velocity to the bird

    var pipeTimeout = gameWidth * 3.5;

    if ( this.bird.body.gravity.y == 0 ) {
      this.bird.body.gravity.y = 1000;
      this.timer = game.time.events.loop(pipeTimeout, this.addColumnOfPipes, this); 
    }

    this.bird.body.velocity.y = -350;

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
    var numberOfBlocks = Math.floor(gameHeight / 70);
    console.log(numberOfBlocks);

    // Pick where the hole will be
    var hole = Math.floor(Math.random() * (numberOfBlocks-1)) + 1;

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