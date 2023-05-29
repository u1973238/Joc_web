"use strict";

class PlatformScene extends Phaser.Scene {
    constructor (){
        super('PlatformScene');
		this.username = "";
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
		this.isGroundPounding = false;
		this.dashKey = null;
		this.canDash = true;
		this.DashCooldown = 2000;
		this.lastDashTime = 0;
		this.enemy = null;
		this.enemy_HP = 1
		this.enemy_stun = 2000;

		this.local_save = () => {
            let partida = {
                username: this.username,
                score: this.score,
				PosX: this.player.x,
				PosY: this.player.y,
				EnPosX: this.enemy.x,
				EnPosY: this.enemy.y,
				Dif: this.dif_mult
            };
			console.log(partida);
            let arrayPartides = [];

            if(localStorage.partides){
				arrayPartides = JSON.parse(localStorage.partides);
				if(!Array.isArray(arrayPartides)) arrayPartides = [];
			}

            arrayPartides.push(partida);
			console.log(arrayPartides);
            localStorage.partides = JSON.stringify(arrayPartides);

            this.goMenu();
        };
    }
    preload (){	
		this.load.image('sky', '../resources/sky.png');
		this.load.image('ground', '../resources/platform.png');
		this.load.image('star', '../resources/star.png');
		this.load.image('bomb', '../resources/bomb.png');
		this.load.image('enemic', '../resources/enemic.png');
		
		this.load.spritesheet('dude',
			'../resources/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
		);
		this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

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
			this.createBomb();


			this.enemy = this.physics.add.group();
			this.enemy = this.createEnemy();
			
		{	// Definim les col·lisions i interaccions
			this.physics.add.collider(this.player, this.platforms);
			this.physics.add.collider(this.stars, this.platforms);
			this.cursors = this.input.keyboard.createCursorKeys();
			this.physics.add.overlap(this.player, this.stars, 
				(body1, body2)=>this.collectStar(body1, body2));

			this.physics.add.collider(this.bombs, this.platforms);
			this.physics.add.collider(this.player, this.bombs, 
				(body1, body2)=>this.hitBomb(body1, body2));
			
			this.physics.add.collider(this.player, this.enemy, 
				(body1, body2)=>this.hitEnemy(body1, body2));
		}
		{ // UI
			this.scoreText = this.add.text(16, 16, 'Score: 0', 
				{ fontSize: '32px', fill: '#000' });
		}
		this.pauseButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		WebFont.load({
			custom: {
			  families: ['Alien Encounters'],
			  urls: ['../resources/fonts/Alien-Encounters-Regular.ttf']
			}
		  });

		this.overlayMenu = this.add.graphics();
		this.overlayMenu.fillStyle(0x000000, 0.5);
		this.overlayMenu.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
		
		this.PauseTitle = this.add.text(this.cameras.main.width / 2 - 210 , this.cameras.main.height / 2 - 250, 'PAUSE', { fontSize: '70px', fill: '#fff' });
		this.PauseTitle.setStyle({ fill: '#ff7e00' });
		this.PauseTitle.setFont('150px Alien Encounters');

		this.resumeButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'RESUME', { fontSize: '32px', fill: '#00ff00' });
		this.resumeButton.setOrigin(0.5);
		this.resumeButton.setInteractive();
		this.resumeButton.on('pointerdown', () => {
			this.resumeGame();
		});
		this.resumeButton.on('pointerover', () => {
			this.resumeButton.setFill('#ff7e00');
			this.resumeButton.setFont('bold 32px Alien Encounters');
		});
		this.resumeButton.on('pointerout', () => {
			this.resumeButton.setFill('#00ff00');
			this.resumeButton.setFont('32px Alien Encounters');
		});

		this.menuButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'MENU', { fontSize: '32px', fill: '#00ff00' });
		this.menuButton.setOrigin(0.5);
		this.menuButton.setInteractive();
		this.menuButton.on('pointerdown', () => {
			this.goMenu();
		});
		this.menuButton.on('pointerover', () => {
			this.menuButton.setFill('#ff7e00');
			this.menuButton.setFont('bold 32px Alien Encounters');
		});
		this.menuButton.on('pointerout', () => {
			this.menuButton.setFill('#00ff00');
			this.menuButton.setFont('32px Alien Encounters');
		});

		this.saveButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'SAVE', { fontSize: '32px', fill: '#00ff00' });
		this.saveButton.setOrigin(0.5);
		this.saveButton.setInteractive();
		this.saveButton.on('pointerdown', () => {
			this.local_save(); 
		});
		this.saveButton.on('pointerover', () => {
			this.saveButton.setFill('#ff7e00');
			this.saveButton.setFont('bold 32px Alien Encounters');
		});
		this.saveButton.on('pointerout', () => {
			this.saveButton.setFill('#00ff00');
			this.saveButton.setFont('32px Alien Encounters');
		});

		this.PauseTitle.setVisible(false)
		this.overlayMenu.setVisible(false);
		this.resumeButton.setVisible(false);
		this.menuButton.setVisible(false);
		this.saveButton.setVisible(false);

		let l_partida = null;

		if (sessionStorage.idPartida && localStorage.partides)
		{
			let arrayPartides = JSON.parse(localStorage.partides);
			if (sessionStorage.idPartida < arrayPartides.length)
				l_partida = arrayPartides[sessionStorage.idPartida];
		}

		if (l_partida){
			this.username = l_partida.username,
			this.score = l_partida.score,
			this.player.x = l_partida.PosX,
			this.player.y = l_partida.PosY,
			this.enemy.x = l_partida.EnPosX,
			this.enemy.y = l_partida.EnPosY,
			this.dif_mult = l_partida.dif_mult,
			this.scoreText.setText('Score: ' + this.score);
		}
		else{
			var json = localStorage.getItem("config") || '{"dificulty": "hard"}';
			var options_data = JSON.parse(json);

			switch (options_data.dificulty)
			{
				case "easy":
					this.dif_mult = 1;
					break;

				case "normal":
					this.dif_mult = 2;
					break;

				case "hard":
					this.dif_mult = 3;
			}

			this.enemy_HP = this.enemy_HP + this.dif_mult;
					
			this.username = localStorage.getItem("username","unknown");
			this.score = localStorage.getItem("score",0);
		}
		sessionStorage.clear();

	}
	update (){	
		if (Phaser.Input.Keyboard.JustDown(this.pauseButton)) {
			this.pause = !this.pause; // Toggle the pause state
		
			if (this.pause) {
				this.physics.pause();
				this.PauseTitle.setVisible(true)
				this.overlayMenu.setVisible(true);
				this.resumeButton.setVisible(true);
				this.menuButton.setVisible(true);
				this.saveButton.setVisible(true);
			} else {
				this.physics.resume();
				this.PauseTitle.setVisible(false)
				this.overlayMenu.setVisible(false);
				this.resumeButton.setVisible(false);
				this.menuButton.setVisible(false);
				this.saveButton.setVisible(false);
			}
		}
		
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
				}
			}
			if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && !this.player.body.touching.down){
				this.isGroundPounding = true;
				this.canGroundPounding = false;
				this.player.setVelocityY(1000);
				this.player.setVelocityX(0);
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
				this.isGroundPounding = false;
			}
		
		}
		{//Enemy chase
			const directionX = this.player.x - this.enemy.x;
			const directionY = this.player.y - this.enemy.y;

			const length = Math.sqrt(directionX * directionX + directionY * directionY);
			const normalizedDirectionX = directionX / length;
			const normalizedDirectionY = directionY / length;

			const speed = 100 * this.dif_mult; 
			const enemicX = normalizedDirectionX * speed;
			const enemicY = normalizedDirectionY * speed;
			this.enemy.setVelocity(enemicX, enemicY);
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
			this.dif_mult = this.dif_mult + 0.1
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
		if (this.gameOver) 
			return;
		this.physics.pause();
		this.player.setTint(0xff0000);
		this.player.anims.play('turn');
		this.gameOver = true;
		setTimeout(()=>loadpage("../Index.html"), 1000);
	}
	hitEnemy(player, enemy){
		if(this.isGroundPounding){
			if(this.enemy_HP > 0){
				const initialPosition = { x: this.enemy.x, y: this.enemy.y };
   				enemy.disableBody(true, true);
      			this.enemy_HP = this.enemy_HP - 1;
     			setTimeout(() => {
        			enemy.enableBody(true, initialPosition.x, initialPosition.y, true, true);
      			}, this.enemy_stun);
				this.enemy_stun = this.enemy_stun - 500;
			}
			else{
				enemy.disableBody(true, true);
			}
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

	resumeGame() {
		this.pause = false;
		this.physics.resume();
		this.PauseTitle.setVisible(false);
		this.overlayMenu.setVisible(false);
		this.resumeButton.setVisible(false);
		this.menuButton.setVisible(false);
		this.saveButton.setVisible(false);
	}
	goMenu() {
		loadpage("../Index.html");
	}
	
	createEnemy() {
		var enemic = this.enemy.create(16, 16, 'enemic');
		enemic.setCollideWorldBounds(true);

		enemic.setScale(0.1);

		return enemic;
	}
}
