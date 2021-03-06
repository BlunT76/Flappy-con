// Create our 'main' state that will contain the game
var mainState = {

    preload: function () {
        // This function will be executed at the beginning
        // That's where we load the images and sounds
        game.load.image('bird', 'assets/perso.png');
        game.load.image('pipe', 'assets/pipe.png')
    },

    create: function () {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.
        // Change the background color of the game to blue
        game.stage.backgroundColor = '#97fca4';
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //creation du groupe des pipes
        this.pipes = game.add.group();
        this.pipes.alpha = 1;
        // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'bird');
        this.bird.alpha = 1;
        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;
        // ajouter le text pour start
        this.startText = this.add.text (

            this.game.width * 0.5, this.game.height * 0.5,
            'Press space to start',
            {
                font: "30px Arial",
                fill: "#f4427a",
                align: 'center'
            }
        )
        this.startText.anchor.set(0.5)
        // Call the 'startGame' function when the spacekey is hit
        this.spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.startGame, this);
        //pour afficher les colonnes de tuyaux toutes les secondes et demi
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        //ajout du score:
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        if(!localStorage.getItem('bestScore')){
            localStorage.setItem('bestScore', 0)
        }
        this.bestScore = localStorage.getItem('bestScore');

        //gestion gameover
        this.gameIsRunning = false;
        // désactiver la gravité pour bird
        this.bird.body.allowGravity = false;

    },

    update: function () {
        // This function is called 60 times per second
        // It contains the game's logic
        // If the bird is out of the screen (too high or too low)
        // Call the 'gameOver' function

        if (this.bird.y < 0 || this.bird.y > 490)
            this.gameOver();

        if (this.bird.angle < 20)
            this.bird.angle += 1;

        var controller = new Unswitch({
            side: 'R',
            b: p => {
                this.jump();
                console.log("LOL");
            },
        });
        controller.update();
        //on lorsque le sprite de bird colle au sprite d'une pipe : on restart
        game.physics.arcade.overlap(this.bird, this.pipes, this.gameOver, null, this);
    },
    startGame: function(){
        // activer la gravité pour bird
        this.bird.body.allowGravity = true;
        // start le game
        this.gameIsRunning = true;
        // DESTROY le text
        this.startText.destroy();
        // Add first jump
        this.bird.body.velocity.y = -350;
        // call 'jump' function
        this.spaceKey.onDown.add(this.jump, this);
    },
    // Make the bird jump
    jump: function () {
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;

        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start();
    },

    // Display game over
    gameOver: function () {
        game.state.start('gameover',true,false,this.score,this.bestScore)
        
  },

    // Restart the game
    restartGame: function () {

        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'pipe');

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Automatically kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    addRowOfPipes: function() {
        if(this.gameIsRunning){
            // Randomly pick a number between 1 and 5
            // This will be the hole position
            var hole = Math.floor(Math.random() * 5) + 1;

            // Add the 6 pipes
            // With one big hole at position 'hole' and 'hole + 1'
            for (var i = 0; i < 8; i++)
                if (i != hole && i != hole + 1)
                    this.addOnePipe(400, i * 60 + 10);
            this.score += 1;
            this.labelScore.text = this.score;
        }
    },
}

var introState = {
    preload: function () {},

    create: function () {
        game.stage.backgroundColor = '#97fca4';
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.startGame, this);
        this.textIntro = this.add.text (
            this.game.width * 0.5, this.game.height * 0.5,
            'Welcome to Flappy Con\n\n Press space to start',
          {
            font: "30px Arial",
            fill: "#f4427a",
            align: 'center'
          }
        )
        this.textIntro.anchor.set(0.5)
        game.add.tween(this.textIntro).from( { y: -200 }, 2000, Phaser.Easing.Bounce.Out, true);
    },

    update: function () {},

    startGame: function () {
        game.state.start('main');
    }

}

var gameOverState = {
    init: function(score, bestScore){
        this.s = score;
        this.b = bestScore
	},
    preload: function () {},

    create: function (score) {
        game.stage.backgroundColor = '#97fca4';
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.startGame, this);
        this.record = '';
        if(this.b < this.s){
            localStorage.setItem('bestScore', this.s)
            this.record = 'New record !!!'
        }
        let text = this.add.text (

            this.game.width * 0.5, this.game.height * 0.5,
            `Score: ${this.s} Best score: ${this.b}\n ${this.record} \n\nGame over\n\n Press space to restart`,
          {
            font: "30px Arial",
            fill: "#f4427a",
            align: 'center'
          }
        )
        game.add.tween(text).from( { y: -200 }, 2000, Phaser.Easing.Bounce.Out, true);
        text.anchor.set(0.5)
    },

    update: function () {},

    startGame: function () {
        game.state.start('main');
    }
}
// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);
game.state.add('intro', introState)
game.state.add('gameover', gameOverState)
// Start the state to actually start the game
game.state.start('intro');
