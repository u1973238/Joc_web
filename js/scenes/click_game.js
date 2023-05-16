class ClickScene extends Phaser.Scene
{
    constructor ()
	{
        super("ClickScene");
		this.username = "";
		this.day = 1;
		this.minigame = "Clicker";
		
        this.timedEvent;
        this.paused = false;
        this.secs;
        this.millis;

        this.gameStage = 0; // 0: animacio inicial, 1: joc, 2: animacio final

        this.canClick = false;
        this.cookieScale = 0.7;

        this.dif_mult = 1;

        this.onEvent = () => // transicio entre gameStages
        {
            if (this.gameStage == 0) // 0 -> 1
            {
                this.gameStage = 1;
                this.canClick = true;
                this.clickText.destroy();
            }
            else if (this.gameStage == 1) // 1 -> 2
            {
                if (this.secs == 0) // s'ha acabat el temporitzador
                {
                    this.millis = "000";
                    this.canClick = false;
                    this.timerText.setText(this.secs + ":" + this.millis + " YOU LOST...");
                    setTimeout(()=>loadpage("../Index.html"), 3000);
                }
                else // NO s'ha acabat el temporitzador encara
                {
                    if (this.cookie.scale < 0.1 * this.dif_mult)
                    {
                        this.canPressPause = false;
                        this.timedEvent.paused = true;
                        this.canClick = false;
                        this.day++;
                        localStorage.setItem("day", this.day);
                        this.timerText.setText(this.secs + ":" + this.millis + " YOU WON!");
                        setTimeout(()=>loadpage("../Index.html"), 1000);
                    }
                }
            }
            console.log("beep");
        }
    }

    preload ()
	{	
        this.load.image("back", "../resources/Click/backCookie.png");
		this.load.image("cookie", "../resources/Click/cookie.png");
		this.load.image("boom", "../resources/Click/boom.png");
		this.load.image("click", "../resources/Click/click.png");
	}
	
    create() 
    {
        let l_partida = null;

        if (sessionStorage.idPartida && localStorage.partides)
		{
			let arrayPartides = JSON.parse(localStorage.partides);
			if (sessionStorage.idPartida < arrayPartides.length)
				l_partida = arrayPartides[sessionStorage.idPartida];
		}
		
		if (l_partida){
			this.username = l_partida.username,
            this.day = l_partida.day,
            this.secs = l_partida.secs
            this.cookieScale = l_partida.cookieScale;
            this.dif_mult = l_partida.dif_mult;
		}
		else
        {
            var json = localStorage.getItem("config") || '{"dificulty": "hard"}';
			var options_data = JSON.parse(json);

			switch (options_data.dificulty)
			{
				case "easy":
					this.dif_mult = 2;
					break;

				case "normal":
					this.dif_mult = 1;
					break;

				case "hard":
					this.dif_mult = 0.7;
					break;
			}

            this.username = localStorage.getItem("username","unknown");
            this.day = localStorage.getItem("day",1);
            this.secs = 10 * this.dif_mult;
            this.cookieScale = 0.7;
        }
        sessionStorage.clear();

        this.background = this.add.sprite(50, 250, "back");
        
        this.spinBoom = this.add.sprite(300, 250, "boom");
        this.spinBoom.displayHeight = 400;
        this.spinBoom.scaleX = this.spinBoom.scaleY

        this.cookie = this.add.sprite(300, 250, "cookie");
        this.cookie.displayHeight = 200;
        this.cookie.scaleX = this.cookie.scaleY;
        this.cookie.scale = this.cookieScale;
        this.cookie.setInteractive();
        this.cookie.on('pointerup', () => {
            if (this.canClick)
            {
                this.cookie.scale *= 0.95;
            }
        }, this.cookie);

        this.clickText = this.add.sprite(300, 250, "click");
        this.clickText.displayHeight = 10;
        this.clickText.scaleX = this.clickText.scaleY


        this.pauseButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.canPressPause = true;

		this.timerText = this.add.text(32, 32, "", {fontFamily: "Arial Black", fontSize: 50, color: "#ffffff"});
        this.timerText.setStroke("#000000", 10);
            
        console.log(this.secs);
        this.timedEvent = this.time.addEvent({delay: 1000, callback: this.onEvent, callbackScope: this, repeat: this.secs});
    }
	update()
	{
        if (this.gameStage == 0)
        {
            let x = 1-this.timedEvent.getProgress()
            this.clickText.scale = -2*x*x + 2*x;
        }
        else // this.gameStage == 1 o 2
        {
            // D'aquesta manera nomes detecta el isDown com a un unic click
            if (this.pauseButton.isDown && this.canPressPause)
            {
                this.timedEvent.paused = !this.timedEvent.paused;
                this.paused = !this.paused;
                this.canPressPause = false;
                this.canClick = !this.paused; // en lloc de fer que depengui d'ell mateix, especifico que nomes es pot clicar quan no esta pausat
            }
            if (this.pauseButton.isUp && !this.canPressPause)
            {
                this.canPressPause = true;
            }

            this.secs = this.timedEvent.repeatCount;
            this.millis = (1-this.timedEvent.getProgress()).toString().substr(2, 3);
            if (!this.millis) this.millis = "000"
            if (this.gameStage != 2) this.timerText.setText(this.secs + ":" + this.millis);


            if (!this.paused)
            {
                this.background.x += 0.4;

                this.spinBoom.angle += 0.5;
                this.spinBoom.scale = Math.sin(this.spinBoom.rotation*4)/10+0.5;

                this.cookie.angle -= 0.2;
            }
        }
        
	}
}