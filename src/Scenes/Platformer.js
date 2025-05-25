class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.deafaultJump = -400
        this.ACCELERATION = 200;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1700;
        this.JUMP_VELOCITY = this.deafaultJump;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.5;
        this.score = 0;
        this.scoreText = null; 
        this.jumpsRemaining = 2; // Track jumps
        this.canDoubleJump = false; // Double jump flag
        this.MAX_SPEED = 150; // Pixels per second
        this.keyFound = false;

        
    }
    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        this.load.audio('jumpSound', ['assets/boing.wav']);
        this.load.audio('dieSound', ['assets/die.mp3']);
        this.load.audio('jump', ['assets/jump.wav']);
        this.load.audio('locked', ['assets/HellNa.wav']);
        this.load.audio('unlocked', ['assets/unlocked.wav']);
        this.load.audio('fart', ['assets/fart.wav']);
        this.load.audio('coincollect', ['assets/collectcoin.wav']);

        //this.load.audio('unlocked', ['assets/HellNa.wav']);



    }
    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 64, 30);

        //his.Bmap = this.add.tilemap("background", 24, 24, 40, 30);


        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        //this.Btileset = this.Bmap.addTilesetImage("tilemap-background_packed", "background_tiles");

        //this.backgroundLayer = this.Bmap.createLayer("back1", this.Btileset, 0, 0);
        //this.backgroundLayer.setDepth(-2);

        // Create a layer
        this.groundLayer = this.map.createLayer("level", this.tileset, 0, 0);
        this.clouds = this.map.createLayer("clouds", this.tileset, 0, 0); 
        // this.clouds.setScrollFactor(0.5);       
        const objectsLayer = this.map.getObjectLayer("Objects");
        this.clouds.setDepth(-1);

        this.cloudInitialX = 0;
        this.cloudInitialY = 0;
        
        // Parallax factor 
        this.cloudParallaxFactor = 0.35;

     

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collide: true
        });

         // Create score text (fixed to camera)

         this.scoreText = this.add.text(430, 270, 'Score: 0', {
             fontSize: '25px',
             fontFamily: 'Arial',
             color: '#ffffff', 
             stroke: '#000000',
             strokeThickness: 4,
             padding: { x: 10, y: 5 },
         });
         
         
         // This makes the text stay in the same position on screen regardless of camera movement
         this.scoreText.setScrollFactor(0);
         this.scoreText.setDepth(9999); // Ensure it's always on top

         //coin animation
         
         this.anims.create({
            key: "coin_spin",
            frames: [
              { key: "tilemap_sheet", frame: 151 },
              { key: "tilemap_sheet", frame: 152 }  
            ],
            frameRate: 5,  // 0.2 s per cycle
            repeat: -1     // loop forever
          });
        
        // spring animation
        this.anims.create({
            key: "spring_bounce",
            frames: [
                { key: "tilemap_sheet", frame: 107 }, // compressed
                
                { key: "tilemap_sheet", frame: 108 }, // Uncompressed
                { key: "tilemap_sheet", frame: 108 }, // Uncompressed

                { key: "tilemap_sheet", frame: 107 }  // Reset
            ],
            frameRate: 22,
            repeat: 0
        });


        // TODO: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        

        // this.coins = this.physics.add.staticGroup();

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151

        });
        this.coins.forEach(coin => {
            coin.play("coin_spin"); // Play the animation
        });
        this.powerUp = this.map.createFromObjects("Objects", {
            name: "powerUp",
            key: "tilemap_sheet",
            frame: 128
        });
        
        this.spikes = this.map.createFromObjects("Objects", {
            name: "spikes",
            key: "tilemap_sheet",
            frame: 68
        });
        

        this.spring = this.map.createFromObjects("Objects", {
            name: "spring",
            key: "tilemap_sheet",
            frame: 107

        });

        this.key = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27

        });

        this.lock = this.map.createFromObjects("Objects", {
            name: "lock",
            key: "tilemap_sheet",
            frame: 28

        });

        // audio
        this.jump = this.sound.add('jump', { volume: 0.3 });
        this.jumpSound = this.sound.add('jumpSound', { volume: 0.3 });
        this.dieSound = this.sound.add('dieSound', { volume: 0.3 });
        this.lockSound = this.sound.add('locked', { volume: 0.3 });
        this.unlockSound = this.sound.add('unlocked', { volume: 0.3 });
        this.boinCollectSound = this.sound.add('fart', { volume: 0.3 }); //power up collect
        this.collectSound = this.sound.add('coincollect', { volume: 0.3 });

        this.deathSoundPlayed = false; // reset

        // TODO: Add turn into Arcade Physics here

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerUp, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spring, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.lock, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        
        this.coinGroup = this.coins;
          

        // set up player avatar
        const spawnPoint = this.map.findObject("Objects", obj => obj.name === "spawn");
        my.sprite.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "platformer_characters", "tile_0000.png");
        // my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(false, false, false, false);
        my.sprite.player.isDying = false; 

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        
        // collider between lock and player
        // this.physics.add.collider(my.sprite.player, this.lock);

        // coin juice
        my.vfx.boinCollect = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_07.png', 'star_08.png'],
            // TODO: Try: add random: true
            random: false,

            scale: {start: 0.02, end: 0.5},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 8,

            lifespan: 100,
            // TODO: Try: gravityY: -400,
            gravityY: -400,

            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.boinCollect.stop();

        //power up juice
        my.vfx.PUCollect = this.add.particles(0, 0, "kenny-particles", {
            frame: ['spark_01.png', 'spark_02.png','spark_03.png','spark_04.png'],
            // TODO: Try: add random: true
            random: false,

            scale: {start: 0.06, end: 0.12},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 3,

            lifespan: 300,

            alpha: {start: 1, end: 0.1}, 


        });

        my.vfx.PUCollect.stop();

        // some springy juicyness
        my.vfx.springBounce = this.add.particles(0, 0, "kenny-particles", {
            frame: ["star_03.png"],
            scale: { start: 0.05, end: 0.2 },
            speed: { min: -50, max: 50 },
            lifespan: 500,
            alpha: { start: 1, end: 0 },
            quantity: 3
        });
        my.vfx.springBounce.stop();

        // Critical: Re-enable inputs before restart
        this.input.keyboard.enabled = true;
                
        // Reset physics
        my.sprite.player.body.setEnable(true);
        my.sprite.player.body.setAllowGravity(true);

        

        //power up collision handler
        this.physics.add.overlap(my.sprite.player, this.powerUp, (obj1, obj2) => {
            obj2.destroy(); 
            this.boinCollectSound.play()

            my.vfx.boinCollect.start();
            my.vfx.boinCollect.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.boinCollect.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.time.delayedCall(100, () => {
                my.vfx.boinCollect.stop();
            });
            
            // add to score
            this.score += 100;
            this.scoreText.setText('Score: ' + this.score);

            this.time.addEvent({
                callback: () => this.PowerUp(),
            });

        });

        // spring collision 
        this.physics.add.collider(my.sprite.player, this.spring, (player, spring) => {
                this.jumpSound.play();
                // Propel player upward
                player.setVelocityY(-700); // Adjust force as needed
                spring.play("spring_bounce");
                my.vfx.springBounce.emitParticleAt(spring.x, spring.y);

                
            },
            null,
            this
        );
        
        // spike collision
        this.physics.add.collider(my.sprite.player, this.spikes, (player, spike) => {

            if (!this.deathSoundPlayed) {
                this.dieSound.play();
                this.deathSoundPlayed = true; // Mark sound as played
            }
            // Immediately freeze all movement
            player.body.stop(); // Sets velocity to 0
            player.body.setEnable(false); // Completely disables physics body
            
            // Disable ALL input methods
            this.input.keyboard.enabled = false;
            cursors.up.reset();
            cursors.left.reset();
            cursors.right.reset();

            // Prevent multiple triggers
            if (player.isDying) return;
            player.isDying = true;

            // Re-enable only what we need for animation
            player.body.setEnable(true);
            player.body.setAllowGravity(false);
            player.setVelocity(-50, -300); // Upward bounce

            // Screen shake
            this.cameras.main.shake(100, 0.01);
            
            const rotationEvent = this.time.addEvent({
                delay: 200, // Time between snaps
                repeat: 4,  // 0°→90°→180°→270° (4 total positions)
                callback: () => {
                    player.setVelocityX(0);
                    player.setVelocityY(0);
                    player.angle -= 90; // Snap rotation
                    this.rotations += 1
                    // Make sure player can't get stuck on platforms
                    this.physics.world.overlap(
                        player, 
                        this.groundLayer, 
                        null, 
                        () => false, // Always return false to prevent collision
                        this)

                }
                
            });
            this.time.delayedCall(1200, () => {
                player.setVelocityY(300); // Fall downward
            });
            // 4. Restart handler with PROPER input cleanup
            const restartScene = () => {
                // Cleanup events
                rotationEvent.remove();
                
                
                
                this.scene.restart();
            };

            this.time.delayedCall(2000, restartScene);
                    
            
        }, null, this);

        // Coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); 
            this.collectSound.play();
            my.vfx.boinCollect.start();
            my.vfx.boinCollect.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.boinCollect.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            this.time.delayedCall(100, () => {
                my.vfx.boinCollect.stop();
            });

            // add to score
            this.score += 10; 
            this.scoreText.setText('Score: ' + this.score);


        });

        // key collision handler
        this.physics.add.overlap(my.sprite.player, this.key, (obj1, obj2) => {
            obj2.destroy(); 

            my.vfx.boinCollect.start();
            my.vfx.boinCollect.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.boinCollect.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.time.delayedCall(100, () => {
                my.vfx.boinCollect.stop();
            });
            
            // set key to found
            this.keyFound = true;

        });
        

        // lock collision handling 
        this.lock.isShaking = false;
        this.lock.unlocking = false;
        this.lock.soundPlayed = false; // New flag to track sound state

        this.physics.add.collider(my.sprite.player, this.lock, (obj1, obj2) => {
            if (this.keyFound) {
                if (!obj2.unlocking) { // Prevent duplicate unlocks
                    obj2.unlocking = true;
                    this.unlockSound.play(); // Play only once
                    this.tweens.add({
                        targets: obj2,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            obj2.destroy();
                        }
                    });
                }
            } else {
                if (!obj2.isShaking && !obj2.soundPlayed) { // Prevent duplicate shakes/sounds
                    obj2.isShaking = true;
                    obj2.soundPlayed = true; // Mark sound as played
                    this.lockSound.play(); // Play only once
                    
                    this.shakeLock(obj2, () => {
                        obj2.isShaking = false;
                        obj2.soundPlayed = false; // Reset for next collision
                    });
                }
            }
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            random: false,

            scale: {start: 0.03, end: 0.07},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 8,

            lifespan: 150,
            // TODO: Try: gravityY: -400,
            gravityY: -400,

            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        
        

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        
        this.animatedTiles.init(this.map);

    }

    update() {
        this.updateCloudParallax();
        // reset jumps when touching
        if (my.sprite.player.body.blocked.down) {
            this.jumpsRemaining = 2;
            this.canDoubleJump = true;
        }

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.sprite.player.setAccelerationX(-this.ACCELERATION);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.sprite.player.setAccelerationX(this.ACCELERATION);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();

        }
        // Enforce maximum speed
        const currentSpeedX = my.sprite.player.body.velocity.x;
        if (Math.abs(currentSpeedX) > this.MAX_SPEED) {
            my.sprite.player.body.velocity.x = Math.sign(currentSpeedX) * this.MAX_SPEED;
        }

        // player jump
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.jump.play({
                rate: 1 // 1.0 is normal speed, less is slower
            });
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (my.sprite.player.body.blocked.down) {
                // Ground jump
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.jumpsRemaining--;
            } 
            else if (this.jumpsRemaining > 0 && this.canDoubleJump) {
                // Double jump
                this.jump.play({
                    rate: 1.3 // 1.0 is normal speed, less is slower
                });

                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY * 0.9); // Slightly weaker
                this.jumpsRemaining--;
                this.canDoubleJump = false;
            }
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
        const playerX = my.sprite.player.x;
        const gameWidth = parseInt(this.sys.game.config.width);
        if (playerX > gameWidth-300) {
            this.time.delayedCall(1000, () => {
                this.scene.launch('WinScene'); // or .start('WinScene')
            });
        }
    }
    PowerUp() {
        //up the power of the jump
        this.physics.world.gravity.y = 1400;
        this.JUMP_VELOCITY = -700;
        this.MAX_SPEED += 200
        this.ACCELERATION += 200
        // add effects while in power up
        my.vfx.PUCollect.start();
            my.vfx.PUCollect.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.PUCollect.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            

        //stop jump power up 
        this.time.delayedCall(3000, () => {
            this.JUMP_VELOCITY = this.deafaultJump;
            this.MAX_SPEED -= 200
            this.ACCELERATION -= 200
            my.vfx.PUCollect.stop();

        });

    }

    addDoubleJumpEffects() {
        // Visual feedback
        my.vfx.doubleJump = this.add.particles(my.sprite.player.x, my.sprite.player.y, "kenny-particles", {
            frame: ['star_07.png', 'star_08.png'],
            scale: { start: 0.1, end: 0.3 },
            speed: { min: -100, max: 100 },
            lifespan: 300,
            quantity: 10
        });
        
        // Sound effect
        
        // Small screen shake for impact
        this.cameras.main.shake(100, 0.01);
    }
    shakeLock(lock, onComplete) {
        this.tweens.add({
            targets: lock,
            x: lock.x + 10,
            yoyo: true,
            repeat: 2,
            duration: 100,
            onComplete: onComplete
        });
    }  
    updateCloudParallax() {
        if (!this.clouds) return;
        
        // Get camera scroll position
        const scrollX = this.cameras.main.scrollX;
        const scrollY = this.cameras.main.scrollY;
        
        // Calculate parallax position
        const cloudX = this.cloudInitialX - (scrollX * this.cloudParallaxFactor);
        const cloudY = this.cloudInitialY - (scrollY * this.cloudParallaxFactor * 0.5)-30; // Less vertical movement
        
        // Update cloud layer position
        this.clouds.setPosition(cloudX, cloudY);
    }  
    
}