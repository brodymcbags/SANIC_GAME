class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const centerX = this.sys.game.config.width / 2;
        const centerY = this.sys.game.config.height / 2;

        // Title Text
        this.add.text(centerX, centerY - 100, 'SANIC', {
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Start Button
        const startButton = this.add.text(centerX, centerY, 'Start Game', {
            fontSize: '32px',
            backgroundColor: '#333333',
            color: '#ffffff',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => startButton.setScale(1.1))
          .on('pointerout', () => startButton.setScale(1))
          .on('pointerdown', () => {
              this.scene.start('platformerScene'); // Replace with your actual game scene key
          });
    }
}
