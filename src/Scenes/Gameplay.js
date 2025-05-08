class pfire extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'pfire');
    }

    fire(x,y) {
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setScale(0.25);

        this.setVelocityY(-900);
    }

    preUpdate(time,delta) {
        super.preUpdate(time,delta);

        if (this.y <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class pfireGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: pfire,
            frameQuantity: 10,
            active: false,
            visible: false,
            key:'pfire'
        });
        this.children.iterate((pfire) => {
            if (pfire.body) {
                pfire.body.reset(-10000,100);
                pfire.body.allowGravity = false;
            } 
        });
    }

    fireLaser(x,y){
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x,y);
        }
    }
}

class efire extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'efire');
    }

    fire(x,y) {
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(500);
    }
    preUpdate(time,delta) {
        super.preUpdate(time,delta);

        if (this.y > 600) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
class efireGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: efire,
            frameQuantity: 30,
            active: false,
            visible: false,
            key:'efire'
        })
    }

    fireLaser(x,y){
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x,y);
        }
    }
}

class enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene,x,y,'enemy');
    }
    moveRight(){
        this.setVelocityX(100);
    }
    moveLeft(){
        this.setVelocityX(-100);
    }
    moveUp() {
        this.setVelocityY(-50);
    }
    moveDown() {
        this.setVelocityY(50);
    }
    placeEnemy(x,y) {
        this.body.reset(x,y);
        this.setVisible(true);
        this.setActive(true);
        this.moveRight();
    }

    shootAsteroid(efireGroup) {
        if (this.active){
            efireGroup.fireLaser(this.x,this.y+20);
        }
    }

    preUpdate(time,delta) {
        super.preUpdate(time,delta);

        if (this.x <= 20) {
            this.moveRight();
        }
        if (this.x >= 780) {
            this.moveLeft();
        }
    }

}

class enemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: enemy,
            frameQuantity: 20,
            active: false,
            visible: false,
            key: 'enemy'
        });

        this.children.iterate((enemy) => {
            if (enemy.body) {
                enemy.body.reset(100,-10000)
                enemy.body.allowGravity = false;
            } 
        });
    }
    
    spawnEnemy(x,y){
        const enemy = this.getFirstDead(false);
        if (enemy) {
            enemy.placeEnemy(x,y);
        }
    }
    

}

class Gameplay extends Phaser.Scene {
    constructor() {
        super('Gameplay')
    }
    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "ship_E.png");
        this.load.image("enemy","enemy_A.png");
        this.load.image("efire","meteor_detailedSmall.png");
        this.load.image("pfire","spaceMissiles_030.png");
        this.load.audio("shoot", "laser-gun-81720.mp3");
        this.load.audio("eshoot", "brick-falling.mp3");
    }
    create() {
        this.down = 0;
        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            font: '32px Arial',
            fill: '#ffffff'
        });
        this.retryText = this.add.text(50,300,'', {
            font: '64px Arial',
            fill: '#ffffff'
        });
        this.winText = this.add.text(100,300,'', {
            font: '64px Arial',
            fill: '#ffffff'
        });
        this.win = false;
        this.gameOver = false;
        this.enemyCount = 5;
        this.enemyAlive = 5;
        this.nextWave = true;
        this.player = this.physics.add.sprite(100,570, "player");
        this.player.body.allowGravity = false;

        this.pfireGroup = new pfireGroup(this);
        this.enemyGroup = new enemyGroup(this);
        this.efireGroup = new efireGroup(this);

        this.shootSound = this.sound.add("shoot");
        this.shootSound.loop = false;
        this.enemyShootSound = this.sound.add("eshoot");
        this.enemyShootSound.loop = false;

        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            if (!this.gameOver || this.win){
            this.shootLaser();
            this.shootSound.play();
            }
        });
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                this.enemyShootSound.play();
                this.enemyGroup.children.iterate((e) => {
                    e.shootAsteroid(this.efireGroup);
                    
                });
            }
        });

        this.physics.add.collider(this.pfireGroup,this.enemyGroup,this.pfireCollision,null,this);
        this.physics.add.collider(this.efireGroup,this.player, this.efireCollision,null,this);
        this.physics.add.collider(this.efireGroup, this.pfireGroup, this.bulletCollision,null,this);
        
    }


    shootLaser(){
        this.pfireGroup.fireLaser(this.player.x, this.player.y);
    }

    makeEnemy(x,y){
        this.enemyGroup.spawnEnemy(x,y);
    }

    enemyFire(){
        this.efireGroup.fireLaser();
    }

    update() {
        if (this.gameOver != true && this.win != true){
        if (this.nextWave) {
            this.wave(this.enemyCount);
            this.nextWave = false;
        }
        if (this.aKey.isDown && this.player.x > 50) {
            this.player.setVelocityX(-500);
        } else if (!this.dKey.isDown) {
            this.player.setVelocityX(0);
        }
        if (this.dKey.isDown && this.player.x < 750) {
            this.player.setVelocityX(500);
        } else if (!this.aKey.isDown) {
            this.player.setVelocityX(0);
        }
        if (this.enemyAlive == 0) {
            this.enemyCount += 2;
            this.enemyAlive = this.enemyCount;
            console.log(this.enemyCount);
            if (this.enemyCount > 9) {
                console.log("win");
                this.win = true;
            } else{
            this.nextWave = true;
            }
        }
    } else {
        console.log("over")
        if (this.gameOver) {
            this.retryText.setText("You died press R to retry");
        }
        if (this.win) {
            this.player.setVelocityX(0);
            this.winText.setText("         You Won\n press R to Play again");
        }
        if (this.rKey.isDown) {
            this.retryText.setText('');
            this.winText.setText('');
            this.score = 0;
            this.win = false;
            this.gameOver = false;
            this.player.setActive(true);
            this.player.setVisible(true);
            this.player.body.reset(100,570);
            this.enemyCount = 5;
            this.enemyAlive = 5;
            this.enemyGroup.children.iterate((e) => {
                e.setActive(false);
                e.setVisible(false);
                e.body.reset(10000,10000);   
            });
            this.nextWave = true;
            this.scoreText.setText("Score:" + this.score);
        }
    }
    }

    wave(num) {
        for (let x = 0; x < num ; x++) {
            this.makeEnemy(x*100, 100);
            console.log("made enemy " + x);
        }
    }

    pfireCollision(pfire, enemy) {
        if (pfire.active && enemy.active){
        this.score += 100;
        this.scoreText.setText("Score:" + this.score);
        this.enemyAlive -= 1;
        console.log(this.enemyAlive);
        pfire.setActive(false);
        pfire.setVisible(false);
        pfire.body.reset(-10000,100);
        pfire.setVelocityY(0);
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.body.reset(100,-10000);
        enemy.setVelocityX(0);
        }
    }

    efireCollision(efire,player) {
        efire.setActive(false);
        efire.setVisible(false);
        player.setActive(false);
        player.setActive(false);
        this.gameOver = true;
    }

    bulletCollision(efire,pfire) {
        efire.setActive(false);
        efire.setVisible(false);
        efire.body.reset(10000, 100)
        pfire.setActive(false);
        pfire.setVisible(false);
        pfire.body.reset(-10000,100);
    }



}