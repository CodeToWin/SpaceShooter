var game = new Phaser.Game(800, 1000, Phaser.AUTO, '', {preload: preload, create: create, update: update});

function preload() {
    game.load.image('ufo', 'Assets/Art/ufoRed.png');
    game.load.image('player', 'Assets/Art/playerShip1_red.png');
    game.load.image('space', 'Assets/Art/space.jpg');
    game.load.image('laser', 'Assets/Art/laserBlue01.png');
    game.load.image('ufoMissile', 'Assets/Art/laserRed10.png');
    
    game.load.image('ufo_blue', 'Assets/Art/ufoBlue.png');
    game.load.image('ufoLaser', 'Assets/Art/laserRed03.png');
    
    game.load.spritesheet('explosion', 'Assets/Art/explosion.png', 128, 128);
    
    game.load.audio('playerShoot', 'Assets/Sounds/sfx_laser2.ogg'); 
    game.load.audio('ufoShoot', 'Assets/Sounds/sfx_laser1.ogg');
}

var player;
var ufos;
var lasers; 
var cursors;
var fireButton;
var explosions;
var bulletTime = 0;
var firingTimer = 0;
var livingEnemies = [];
var score = 0;
var scoreString = 'Score: ';
var livesString = 'Lives: ';
var scoreText;
var livesText;
var playerLives = 2;
var stateText;
var waveNumber = 1;

function create() {
    //create game assets
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    starfield = game.add.tileSprite(0,0,800,1000,'space');
    
    player = game.add.sprite(game.world.width / 2, game.world.height - 200, 'player');
    game.physics.arcade.enable(player);
    player.enableBody = true;
    player.body.collideWorldBounds = true;
    
    ufos = game.add.group();
    game.physics.arcade.enable(ufos);
    ufos.enableBody = true;
    ufos.setAll('outOfBoundsKill', true);
    ufos.setAll('checkWorldBounds', true);
    
    lasers = game.add.group(); 
    lasers.enableBody = true;
    game.physics.arcade.enable(lasers);     
    lasers.createMultiple(20, 'laser');
    lasers.setAll('anchor.x', 0.5);
    lasers.setAll('anchor.y', 0.5);
    lasers.setAll('outOfBoundsKill', true);
    lasers.setAll('checkWorldBounds', true);
    lasers.shootSound = game.add.audio('playerShoot');
    
    ufoMissiles = game.add.group();
    ufoMissiles.enableBody = true;
    game.physics.arcade.enable(ufoMissiles);
    ufoMissiles.createMultiple(20, 'ufoMissile');
    ufoMissiles.setAll('anchor.x', 0.5);
    ufoMissiles.setAll('anchor.y', 0.5);
    ufoMissiles.setAll('checkWorldBounds', true);
    ufoMissiles.setAll('outOfBoundsKill', true);
    ufoMissiles.shootSound = game.add.audio('ufoShoot');
    
    ufoLasers = game.add.group();
    ufoLasers.enableBody = true;
    game.physics.arcade.enable(ufoLasers);
    ufoLasers.createMultiple(20, 'ufoLaser');
    ufoLasers.setAll('anchor.x', 0.5);
    ufoLasers.setAll('anchor.y', 0.5);
    ufoLasers.setAll('outOfBoundsKill', true);
    ufoLasers.setAll('checkWorldBounds', true);
    ufoLasers.shootSound = game.add.audio('ufoShoot');

    explosions = game.add.group();
    explosions.createMultiple(30, 'explosion');
    explosions.forEach(setupufo, this);    
      
    scoreText = game.add.text(10,10, scoreString + score, { font: '34px Arial', fill: '#fff'});
    
    livesText =  game.add.text(game.world.width - 150, 10, livesString + playerLives, { font: '34px Arial', fill: '#fff'});
    
    stateText = game.add.text(game.world.centerX, game.world.centerY, ' ' , { font: '84px Arial', fill: '#fff'});
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
        
    cursors = game.input.keyboard.createCursorKeys();    
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);    
    
    createUfos();
    
    mute_label = game.add.text(game.width -300, 10, 'Mute', {font: '34px Arial', fill: '#fff'});
    mute_label.inputEnabled = true;
    mute_label.events.onInputUp.add(function() {
        
        if (game.sound.mute == false) {
            game.sound.mute = true;
            mute_label.setText("Unmute");
        } else {
            game.sound.mute = false;
            mute_label.setText("Mute");
        };    
    });
    
    pause_label = game.add.text(game.width-500, 10, 'Pause', {font: '34px Arial', fill: '#fff'});
    pause_label.inputEnabled = true;
    pause_label.events.onInputUp.add(function() {
        if (game.paused == false) {
            game.paused = true;
            pause_label.setText("Unpause");
        } 
        game.input.onDown.add(unpause, self);
        
        function unpause(event) {
            if (game.paused) {
                    game.paused = false;
                    pause_label.setText("Pause");
            }          
            
        }
    });
}

function createUfos() {
    for ( var i = 0; i < 4; i++) {
        for ( var j = 0; j < 2; j++) {
            if ( i%2 == 0) {
                var ufo = ufos.create(i * (game.world.width) / 6 + j * game.world.width / 6, j * game.world.width / 8, 'ufo');
            } else {
                var ufo = ufos.create(i * (game.world.width) / 6 + j * game.world.width / 6, j * game.world.width / 8, 'ufo_blue')
            }
            ufo.anchor.setTo(0.5, 0.5);            
        }
    } 
    ufos.x = 100;
    ufos.y = 50;
}

function setupufo(enemy) {
    enemy.anchor.x = 0.5;
    enemy.anchor.y = 0.5;
    enemy.animations.add('explosion');
}

function fireLaser() {
    if (game.time.now > bulletTime) {      
        var laser = lasers.getFirstExists(false);
        if (laser) {
            laser.reset(player.x+44, player.y-64);
            laser.body.velocity.y = -300;
            lasers.shootSound.play();
            bulletTime = game.time.now + 200;
        }
    }
}

function update() {
    moveUfos();
    starfield.tilePosition.y += 2;
    if (player.alive) {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        
        if (cursors.left.isDown) {
            player.body.velocity.x -= 500;
        }
        else if (cursors.right.isDown) {
            player.body.velocity.x += 500;
        }  
        else if (cursors.up.isDown) {
            player.body.velocity.y -= 500;
        }
        else if (cursors.down.isDown) {
            player.body.velocity.y += 500;
        }
        if (fireButton.isDown) {
            fireLaser();
        }
        if (game.time.now > firingTimer) {
            ufoFires();
        }
        if (stateText.visible == false) {
            game.physics.arcade.overlap(lasers, ufos, killufo, null, this);
            game.physics.arcade.overlap(player, ufos, killPlayer, null, this);
            game.physics.arcade.overlap(player, ufoMissiles, killPlayer, null, this);
            game.physics.arcade.overlap(player, ufoLasers, killPlayer, null, this);
        }
    }
}

function moveUfos() {
    ufos.y += 1*waveNumber;
    if (ufos.y > game.world.height) {
        ufos.y = 50;
    }
}

function killPlayer(player, baddy) {
    
    // note that 'baddy' can also be a ufo laser - one function handles collisions with the ufo and its laser
    baddy.kill();    
    
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('explosion', 120, false, true);
            
    playerLives -= 1;
    
    livesText.text = livesString + playerLives;
    
    if (playerLives < 1) { 
        player.kill();
        ufoMissiles.callAll('kill');
        
        stateText.text = " GAME OVER \n Click to Restart";
        stateText.visible = true;
        waveNumber = 1;
    
        game.input.onTap.addOnce(restart, this);
    }  
    
    player.x = 500;
    player.y = 720;
}

function killufo(laser, ufo) {
    laser.kill();
    ufo.kill();
    score += 50;
    scoreText.text = scoreString + score;
    
    var explosion = explosions.getFirstExists(false);
    explosion.reset(ufo.body.x+48, ufo.body.y+48);
    explosion.play('explosion', 120, false, true);
    
    if (ufos.countLiving() == 0) {
        score += 1000;
        scoreText.text = scoreString + score;
        
        ufoMissiles.callAll('kill', this);
        stateText.text = " Wave Complete! \n Click to advance"; 
        stateText.visible = true;
        waveNumber += 1;
        game.input.onTap.addOnce(restart, this);
    }
}

function ufoFires() {
    ufoMissile = ufoMissiles.getFirstExists(false);
    ufoLaser = ufoLasers.getFirstExists(false);
    
    livingEnemies.length = 0;
    
    ufos.forEachAlive(function(ufo) {
        livingEnemies.push(ufo);
    });

    if ((ufoMissile || ufoLaser) && livingEnemies.length > 0) {
        
        var random = game.rnd.integerInRange(0, livingEnemies.length-1);
        var shooter = livingEnemies[random];
        
        if ( shooter.key == 'ufo_blue') {
            ufoLaser.reset(shooter.body.x +50, shooter.body.y +50);
            ufoMissiles.shootSound.play();
            ufoLaser.body.velocity.y = 150*waveNumber;
        } else {
        
            ufoMissile.reset(shooter.body.x+50, shooter.body.y+50);
            ufoMissiles.shootSound.play();
        
            game.physics.arcade.moveToObject(ufoMissile, player, 120*waveNumber);
        }
        // if the last UFO alive is blue, the firing rate of 500 ms makes it almost impossible to kill it without dying -> need
        // a longer firing timer
        if (livingEnemies.length > 1) {
            firingTimer = game.time.now + 500;
        } else {
            firingTimer = game.time.now + 2000;
        }
    }
}
    
function restart() {
    if (player.alive == false) {
        playerLives = 2;
        score = 0;
    }
    scoreText.text = scoreString + score;
    livesText.text = livesString + playerLives;

    if (ufos.countLiving() > 0) { ufos.removeAll(); }
    
    if (ufoMissiles.countLiving() > 0) { ufoMissiles.removeAll(); }                
    
    if (lasers.countLiving() > 0) { lasers.removeAll(); }
    
    if (ufoLasers.countLiving() > 0) { ufoLasers.removeAll(); }
    
    lasers.createMultiple(20, 'laser');
    ufoMissiles.createMultiple(20, 'ufoMissile');
    ufoLasers.createMultiple(20, 'ufoLaser');
    
    createUfos();
    player.revive();
    
    stateText.visible = false;
}
