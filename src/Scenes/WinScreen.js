class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    create() {
        const screenWidth = this.sys.game.config.width;
        const screenHeight = this.sys.game.config.height;

        // Box size
        const boxWidth = 600;
        const boxHeight = 400;

        // Background rectangle (slightly transparent)
        const background = this.add.rectangle(
            screenWidth / 2,
            screenHeight / 2,
            boxWidth,
            boxHeight,
            0x000000,
            0.6
        );
        background.setOrigin(0.5);

        // Outline rectangle
        const outline = this.add.graphics();
        outline.lineStyle(4, 0xffffff, 1);
        outline.strokeRect(
            (screenWidth - boxWidth) / 2,
            (screenHeight - boxHeight) / 2,
            boxWidth,
            boxHeight
        );

        const centerX = this.sys.game.config.width / 2;
        const centerY = this.sys.game.config.height / 2;

        // Add "You Win!" text
        const winText = this.add.text(centerX, centerY - 120, 'You Win!', {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        const buttonStyle = {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
            fixedWidth: 200,
            align: 'center'
        };

        // Restart Button
        const restartButton = this.add.text(centerX, centerY - 40, 'Restart', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => restartButton.setScale(1.1))
            .on('pointerout', () => restartButton.setScale(1))
            .on('pointerdown', () => {
                // Stop both WinScene and platformerScene before restarting
                this.scene.stop('platformerScene');
                this.scene.start('platformerScene');
            });

        // Main Menu Button
        const menuButton = this.add.text(centerX, centerY + 40, 'Main Menu', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => menuButton.setScale(1.1))
            .on('pointerout', () => menuButton.setScale(1))
            .on('pointerdown', () => {
                // Stop both current scenes before going to main menu
                this.scene.stop('platformerScene');
                this.scene.stop('WinScene');
                this.scene.start('MainMenu');
            });
    }
}