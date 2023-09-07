
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;
let ctx = canvas.getContext("2d");
const canvasMiddle = { x: canvas.width / 2, y: canvas.height / 2};
const red = "#FF0000";
const yellow = "#964B00"
const green = "#008000";
const image = new Image();
image.src = "./ship.png";
const backgroundColor = "white";


function clear() {
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = backgroundColor;
    ctx.fillRect(0, 0, 900, 900);
    ctx.strokeRect(0, 0, 900, 900);
}


function getRandomInt(min, max) {
    // Generate a random integer between min (inclusive) and max (inclusive)
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function keepWithinScreen(object) {
    if (object.position.x > canvas.width + object.size.w / 3) {
        object.position.x = 0 - object.size.w / 3;
    }
    else if (object.position.x < 0 - object.size.w / 3) {
        object.position.x = canvas.width + object.size.w / 3;
    }
    if (object.position.y > canvas.height + object.size.h / 3) {
        object.position.y= 0 - object.size.h / 3;
    }
    else if (object.position.y < 0 - object.size.h / 3) {
        object.position.y = canvas.height + object.size.h / 3;
    }
}

function Asteroid(size, position, speed) {
    this.size = size;
    this.position = position;
    this.speed = speed;
    this.velocity = {x: 0, y: 0};
    this.rotatedAngle = 0;
    this.color = "gray";
}
    Asteroid.prototype.move = function() {
        this.position.x += this.velocity.x * this.speed;
        this.position.y += this.velocity.y * this.speed;
    };
    Asteroid.prototype.rotate = function() {
        this.rotatedAngle += 0.030;
    };
    Asteroid.prototype.isCollided = function(object) {
        const xCollision = Math.abs(this.position.x - object.x) < this.size.w - (this.size.w/3);
        const yCollision = Math.abs(this.position.y - object.y) < this.size.h - (this.size.h/3);
        return xCollision && yCollision;
    };
    Asteroid.prototype.drawItself = function() {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotatedAngle);
        ctx.fillStyle = this.color;
        ctx.fillRect(0 - this.size.w/2, 0 - this.size.h/2, this.size.w, this.size.h);
        ctx.restore();
    }
    Asteroid.prototype.appear = function() {
        this.move();
        this.rotate();
        this.drawItself();
    }
    Asteroid.prototype.isOuttaTheScreen = function() {
        if (this.position.x > canvas.width + 100) {
            return true;
        }
        else if (this.position.x < 0 - 100) {
            return true;
        }
        if (this.position.y > canvas.height + 100) {
            return true;
        }
        else if (this.position.y < 0 - 100) {
            return true;
        }
        return false;
    };

let asteroidGenerator = {
    asteroidList: [],
    genSize: function(){
        let randomNumber = getRandomInt(20, 60);
        return {w: randomNumber, h: randomNumber};
    },
    genPosition: function() {
        let x = getRandomInt(-70, canvas.width + 70);
        let y = (x < 0 || x > canvas.width) ? getRandomInt(0 + 35, canvas.height - 35) : (Math.random() > 0.5 ? canvas.height + 70 : -70);
        return { x, y };
    },
    genSpeed: function(){
        return getRandomInt(2, 4);
    },
    genVelocity: function(asteroidPosition) {
        const playerDirection = {x: player.position.x - asteroidPosition.x, y: player.position.y - asteroidPosition.y};
        const playerAngle = Math.atan2(playerDirection.y, playerDirection.x);
        const playerAngleDegrees = (playerAngle * 180) / Math.PI;
        const generatedAngle = getRandomInt(playerAngleDegrees - 30, playerAngleDegrees + 30);
        const generatedAngleRadians = generatedAngle * (Math.PI / 180);
        const unitVector = {x: Math.cos(generatedAngleRadians), y: Math.sin(generatedAngleRadians)};
        return unitVector;
    },
    generate: function(quantity) {
        for (let i = 0; i<quantity;i++) {
            let newAsteroid = new Asteroid(this.genSize(), this.genPosition(),this.genSpeed());
            newAsteroid.velocity = this.genVelocity(newAsteroid.position);
            this.asteroidList.push(newAsteroid);
        }
    },
    generateOneCustom: function(customSize, customVelocity, customPosition) {
        let newAsteroid = new Asteroid(customSize, customPosition, this.genSpeed());
        newAsteroid.velocity = customVelocity;
        newAsteroid.type = "debris"; //line added for debugging purposes
        this.asteroidList.push(newAsteroid);
    },    
    generateDebris: function(quantity, parentAsteroid) {
        for (let i = 0; i < quantity; i++) {
            /*gets moving angle of parent asteroid, convert it to degree, generate a new angle with little offset
            based on the parent's angle in degrees, convert it to radians, and get the angle unity vector.
            Generate a random size and create a custom asteroid smaller, with a new angle starting at the same position
            of it's parent.*/
            const parentAsteroidMovingAngle = Math.atan2(parentAsteroid.velocity.y, parentAsteroid.velocity.x);
            const parentAsteroidMovingAngleDegrees = (parentAsteroidMovingAngle * 180) / Math.PI;
            const debrisAngle = getRandomInt(parentAsteroidMovingAngleDegrees - 20, parentAsteroidMovingAngleDegrees + 20);
            const debrisAngleRadians = debrisAngle * (Math.PI / 180);
            const debrisVelocity = {x: Math.cos(debrisAngleRadians), y: Math.sin(debrisAngleRadians)};
            
            const debrisSize = getRandomInt(7, 25);
            this.generateOneCustom(debrisSize, debrisVelocity, parentAsteroid.position);
        };
    },
    handleAsteroidCollisions: function(bulletsList, playerPosition){
        // Check for collisions between asteroids and the player.
        for (let i = this.asteroidList.length - 1; i >= 0; i--) {
            if (this.asteroidList[i].isCollided(playerPosition)) {
                // Remove the asteroid and break out of the loop.
                this.asteroidList.splice(i, 1);
                break;
            }
            // Check for collisions between asteroids and bullets.
            if (bulletsList.length > 0) {
                for (let x = bulletsList.length - 1; x >= 0; x--) {
                    if (this.asteroidList[i].isCollided(bulletsList[x].position)) {
                        // Remove the bullet
                        bulletsList.splice(x, 1);
                        //generate debris
                        this.generateDebris(3, this.asteroidList[i]);
                        //console.log("Parent position in the moment it was killed:");
                        //console.log(this.asteroidList[i].position.y);
                        //remove asteroid
                        this.asteroidList.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
};    

//let asteroidTest = new Asteroid({w: 50, h: 50}, {x: 0, y: canvas.height/2 + 60}, 2, { x: 1, y: -0.3 });
let bullet = {
    size: {w: 5, h: 5},
    position: {x: 0, y: 0},
    color: "green",
    rotatedAngle: 0,
    facingDirection: {x: 0, y: 0},
    speed: 4,
    generate: function(position, angle, facingDirection){
        this.position = position;
        this.rotatedAngle = angle;
        this.facingDirection = facingDirection;
        return this;
    },
    move: function() {
        //facing direction here is being used as the velocity, because it is a unit vector representing the direction
        // so i just multiply it by the speed and add it to the position of the bullet
        this.position.x += this.facingDirection.x * this.speed;
        this.position.y += this.facingDirection.y * this.speed;
    },
    isOuttaTheScreen: function() {
        if (this.position.x > canvas.width + this.size.w) {
            return true;
        }
        else if (this.position.x < 0 - this.size.w) {
            return true;
        }
        if (this.position.y > canvas.height + this.size.h) {
            return true;
        }
        else if (this.position.y < 0 - this.size.h) {
            return true;
        }
        return false;
    }

}

let player = {
    image: image,
    keysBeingPressed: [],
    rotatedAngle: 0,
    position: {x: 400 - 25 / 2, y:400 - 25/2},
    size: {w: 50, h: 50},
    speed: 0.050,
    velocity: {x: 0, y: 0},
    maxVelocity: 5,
    friction: 0.005,
    bullets: [],
    cooldown: 0,
    setFacingDirectionAndAcceleration: function(){
        this.facingDirection = {x: Math.cos(this.rotatedAngle), y: Math.sin(this.rotatedAngle)};
        this.acceleration = {x: this.facingDirection.x * this.speed, y: this.facingDirection.y * this.speed};
    },
    accelerate: function(){
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
    },
    applyFriction: function(){
        if (!this.keysBeingPressed.includes("w")) {
            const reduction = 1 - this.friction;
            this.velocity.x *= reduction;
            this.velocity.y *= reduction;
        }
    },
    limitVelocity: function(){
        let velocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        let scaleFactor = this.maxVelocity / velocityMagnitude;
        if (velocityMagnitude > this.maxVelocity) {
            this.velocity.x *= scaleFactor;
            this.velocity.y *= scaleFactor;
        }
    },
    move: function(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.limitVelocity();
    },
    coolDownAllows: function(){
        return this.cooldown <= 0 ? true : false;
    },
    resetCoolDown: function(){
        this.cooldown = 0.3;
    },
    updateCoolDown: function() {
        if (this.cooldown > 0) {
            this.cooldown -= 0.01;
        }
    },
    prepareBullet: function(){
        //this function should generate a new bullet for the player bullets list
        let bulletPosition = {
            x: this.position.x + this.facingDirection.x * (this.size.w - 20),
            y: this.position.y + this.facingDirection.y * (this.size.h - 20)
        };
        let bulletAngle = this.rotatedAngle;
    
        // Generate the new bullet using the calculated position
        let generatedBullet = Object.create(bullet);
        generatedBullet.generate(bulletPosition, bulletAngle, this.facingDirection);
        this.bullets.push(generatedBullet);
    },
    handleBulletsMovement: function(){
        for (item of this.bullets) {
            item.move(this.facingDirection);
        }
    },
    shoot: function(){
        this.drawBullets();
        this.handleBulletsMovement();
    },
    handleInput: function(){
        let len = this.keysBeingPressed.length > 0;
        if (len) {
            if (this.keysBeingPressed.includes("w")) {
                this.accelerate();
            }
            if (this.keysBeingPressed.includes("d")) {
                this.rotatedAngle += 0.030;
            }
            if (this.keysBeingPressed.includes("a")) {
                this.rotatedAngle -= 0.030;
            }
            if (this.keysBeingPressed.includes("ç") && this.coolDownAllows()) {
                this.resetCoolDown();
                this.prepareBullet();
            }
        }
    },
    drawItself: function(){
        this.setFacingDirectionAndAcceleration();
        if (this.rotatedAngle != 0) {
            ctx.save();
            ctx.translate(this.position.x,this.position.y);
            ctx.rotate(this.rotatedAngle);
            ctx.drawImage(this.image, 0 - this.size.w/2, 0 - this.size.h/2, this.size.w, this.size.h);
            ctx.restore();
        }
        else {
            ctx.drawImage(this.image, this.position.x - this.size.w/2,this.position.y- this.size.h/2, this.size.w,this.size.h);
        }
    },
    appear: function() {
        this.handleInput();
        this.move();
        this.applyFriction();
        this.updateCoolDown();
        this.drawItself();
    },
    drawBullets: function() {
        for (item of this.bullets) {
            ctx.save();
            ctx.translate(item.position.x, item.position.y);
            ctx.rotate(item.rotatedAngle);
            ctx.fillStyle = item.color;
            ctx.fillRect(0 - item.size.w/2, 0 - item.size.h/2, item.size.w, item.size.h);
            ctx.restore();
            
        }
    }
}

function updateAsteroids() {
    /*this function make sure all asteroids are drawn on the canvas and delete them if
    they are outta the screen*/
    for (let i = asteroidGenerator.asteroidList.length - 1; i >= 0; i--) {
        asteroidGenerator.asteroidList[i].appear();
        if (asteroidGenerator.asteroidList[i].isOuttaTheScreen()) {
            asteroidGenerator.asteroidList.splice(i, 1);
        }
    }
}

function checkGenerateAsteroids() {
    /*this function generates two new asteroids every
    time there are less than 3 asteroids on the screen*/
    if (asteroidGenerator.asteroidList.length < 3) {
        asteroidGenerator.generate(2);
    }
}

asteroidGenerator.generate(3);

function gameLoop() {
    requestAnimationFrame(gameLoop);
    clear();
    if (asteroidGenerator.asteroidList.length > 0) {
        updateAsteroids();
        asteroidGenerator.handleAsteroidCollisions(player.bullets, player.position);
    } 
    checkGenerateAsteroids();
    player.appear();
    if (player.bullets.length > 0) {
        player.shoot();
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            if (player.bullets[i].isOuttaTheScreen()) {
                player.bullets.splice(i, 1); // Remove the out-of-screen bullet
            };
        }
    }
    keepWithinScreen(player);
}

window.addEventListener("keydown", function (event) {
    let keyBeingPressed = event.key;
    if (!player.keysBeingPressed.includes(keyBeingPressed)) {
        player.keysBeingPressed.push(keyBeingPressed)
    }
});
window.addEventListener("keyup", function(event){
    let keyBeingReleased = event.key;
    player.keysBeingPressed = player.keysBeingPressed.filter((item)=>item != keyBeingReleased);
})

image.onload = ()=>{
    gameLoop();
}



