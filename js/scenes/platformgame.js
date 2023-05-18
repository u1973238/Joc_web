"use strict";

class PlatformScene extends Phaser.Scene {
    constructor (){
        super('PlatformScene');
		this.platforms = null;
		this.player = null;
		this.cursors = null;
		this.stars = null;
		this.score = 0;
		this.scoreText;
		this.bombs = null;
		this.gameOver = false;
		this.pause = false;
		this.jumpCount = 0;
		this.canGroundPounding = false
		this.isGroundPounding = false;
		this.dashKey = null;
		this.canDash = true;
		this.DashCooldown = 1000;
		this.lastDashTime = 0;
    }
    preload (){	
		this.load.image('sky', '../resources/starsassets/sky.png');
		this.load.image('ground', '../resources/starsassets/platform.png');
		this.load.image('star', '../resources/starsassets/star.png');
		this.load.image('bomb', '../resources/starsassets/bomb.png');
		
		this.load.spritesheet('dude',
			'../resources/starsassets/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
		);
	}
    create (){	
		this.add.image(400, 300, 'sky');
		{	// Creem platafomres
			this.platforms = this.physics.add.staticGroup();
			this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
			this.platforms.create(600, 400, 'ground');
			this.platforms.create(50, 250, 'ground');
			this.platforms.create(750, 220, 'ground');
		}
		{	// Creem player i definim animacions
			this.player = this.physics.add.sprite(100, 450, 'dude');
			this.player.setBounce(0.2);
			this.player.setCollideWorldBounds(true);
			
			this.anims.create({
				key: 'left',
				frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
				frameRate: 10,
				repeat: -1
			});

			this.anims.create({
				key: 'turn',
				frames: [ { key: 'dude', frame: 4 } ],
				frameRate: 20
			});

			this.anims.create({
				key: 'right',
				frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
				frameRate: 10,
				repeat: -1
			});
		}
		{	// Creem objectes interactuables
			this.stars = this.physics.add.group({
				key: 'star',
				repeat: 11,
				setXY: { x: 12, y: 0, stepX: 70 }
			});
			this.stars.children.iterate((child) => 
				child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));
		}
			this.bombs = this.physics.add.group(); // Grup d'enemics
			this.createBomb(); //Determinar la dificultat
		{	// Definim les col·lisions i interaccions
			this.physics.add.collider(this.player, this.platforms);
			this.physics.add.collider(this.stars, this.platforms);
			this.cursors = this.input.keyboard.createCursorKeys();
			this.physics.add.overlap(this.player, this.stars, 
				(body1, body2)=>this.collectStar(body1, body2));

			this.physics.add.collider(this.bombs, this.platforms);
			this.physics.add.collider(this.player, this.bombs, 
				(body1, body2)=>this.hitBomb(body1, body2));
		}
		{ // UI
			this.scoreText = this.add.text(16, 16, 'Score: 0', 
				{ fontSize: '32px', fill: '#000' });
		}
		this.pauseButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
	}
	update (){	
		  
		{ // Moviment
			if(!this.isGroundPounding){
				if (this.cursors.left.isDown){
					this.player.setVelocityX(-160);
					this.player.anims.play('left', true);
				}
				else if (this.cursors.right.isDown){
					this.player.setVelocityX(160);
					this.player.anims.play('right', true);
				}
				else{
					this.player.setVelocityX(0);
					this.player.anims.play('turn');
			}
			
			}

			if (Phaser.Input.Keyboard.JustDown(this.cursors.up)){
				if (this.player.body.touching.down) {
					this.player.setVelocityY(-330);
				}
				else if (this.jumpCount < 1) { // Allowing up to two jumps
					this.player.setVelocityY(-330);
					this.jumpCount++;
					this.canGroundPounding = true;
				}
			}
			if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.canGroundPounding){
				this.isGroundPounding = true;
				this.canGroundPounding = false;
				this.player.setVelocityY(1000);
			}
			
			if (Phaser.Input.Keyboard.JustDown(this.dashKey) && this.canDash) {
				if (this.cursors.left.isDown) {
					this.Dash(200);
				} else if (this.cursors.right.isDown) {
					this.Dash(-200);
				}
			}

			if(!this.canDash){
				const temps = this.time.now - this.lastDashTime;
				if (temps >= this.DashCooldown){
					this.canDash = true;
				}
			}
			
			if (this.player.body.touching.down) {
				this.jumpCount = 0;
				this.canGroundPounding = false;
				this.isGroundPounding = false;
			}
		
		}
		

		
	}
	Dash(distance){
		const newX = this.player.x - distance;
		this.player.setX(newX);

		this.canDash = false;

		this.lastDashTime = this.time.now;
	}

	collectStar(player, star){
		star.disableBody(true, true);
		this.score += 10;
		this.scoreText.setText('Score: ' + this.score);
		if (this.stars.countActive(true) === 0){
			this.enableAllStars();
			this.createBomb();
		}
	}
	createBomb(){
		var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}
	hitBomb(player, bomb){
		if(this.isGroundPounding){
			bomb.disableBody(true, true);
		}
		else{
			if (this.gameOver) 
				return;
			this.physics.pause();
			this.player.setTint(0xff0000);
			this.player.anims.play('turn');
			this.gameOver = true;
			setTimeout(()=>loadpage("../Index.html"), 1000);
		}

	}
	enableAllStars(){
		this.stars.children.iterate(child => 
			child.enableBody(true, child.x, 0, true, true));
	}
	canDoubleJump() {
		return this.player.jumpCount < 20;
	}
}

