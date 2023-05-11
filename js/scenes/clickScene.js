class ClickScene extends Phaser.Scene
{
    constructor ()
    {
        super("ClickScene");
        this.username = "";
        this.minigame = "Click Game";

        this.timedEvecnt;
        this.paused = false;
        this.secs;
        this.millis;

        this.gameStage = 0; // 0: animacio inicial, 1: joc, 2: animacio final

        this.canClick = false;
        this.bombScale = 0.7;

        this.dif_mult = 1;

        this.onEvent = () =>
        {
            if (this.gameStage == 0)
            {
                this.gameStage = 1;
                this.canClick = true;
                this.clickText.destroy();
            }
            else if (this.gameStage == 1)
            {
                this.saveButton.disabled = true;
                this.millis = "000";
                this.canClick = false;
                this.timerText.setText("YOU LOST");
                this.gameStage = 2;
            }
            else
            {
                if (this.bomb.scale < 0.1 * this.dif_mult)
                {
                    this.saveButton.disabled = true;
                    this.canPressPause = false;
                    this.timedEvecnt.paused = true;
                    this.canClick = false;
                    this.timerText.setText("YOU WIN");
                    this.gameStage = 2;
                }
            }
        }
    }
    preload ()
    {
        this.load.image("bomb", "../resources/ClickAssets/enemi.png");
    }
    create()
    {
        this.add.image(400, 300, 'bomb');
    }
    update ()
    {

    }
}