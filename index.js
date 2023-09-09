//atualmente com bug de qdo o player morre e explode, asteroids ainda explodem qdo batem na posição q o player tava antes de ir de berço
//crie um sistema de status melhor, e depois isso crie texto para avisar q o player explodiu, e opção pra jogar novamente
const canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;
let ctx = canvas.getContext("2d");
const canvasMiddle = { x: canvas.width / 2, y: canvas.height / 2};
const red = "#FF0000";
const yellow = "#964B00"
const green = "#008000";
const backgroundColor = "white";
const idleImage = new Image();
idleImage.src = "./ship.png";
const thrustImgs = [new Image(), new Image()];
thrustImgs[0].src = "./ship_thrust_anim/2.png";
thrustImgs[1].src = "./ship_thrust_anim/3.png";


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

  function convertToRadians(angle) {
    return angle * (Math.PI / 180);
};

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

function drawPlayerLife(player) {

    let width = player.lifePoints > 0 ? 2 * player.lifePoints : 0;
    let height = 14;
    let color = "";
    if (player.lifePoints > 65) {
        color = "green";
    } else if (player.lifePoints >= 30) {
        color = "orange";
    } else {
        color = "red";
    }
    ctx.fillStyle = color;
    ctx.fillRect(20, 20, width, height);
    ctx.strokeStyle = "black";
    ctx.strokeRect(20, 20, 200, 14);
    
}

function drawPlayerScore(player) {
    ctx.font = "bold 20px serif";
    ctx.fillStyle = "black";
    ctx.fillText(`Score: ${player.score.toFixed(0)}`, 20, 60);
}

function Asteroid(size, position, speed) {
    this.size = size;
    this.position = position;
    this.speed = speed;
    this.velocity = {x: 0, y: 0};
    this.rotatedAngle = 0;
    this.color = "gray";
    this.damage = 2;
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
    Asteroid.prototype.applyForce = function(object) {
        if (this.size.h > 15) {
            object.velocity = {x: object.velocity.x + this.velocity.x * this.speed, y: object.velocity.y + this.velocity.y * this.speed};
        }
        
    }
    Asteroid.prototype.inflictDamage = function(object) {
        object.lifePoints -= this.damage * (this.size.w / 8);
    }
    Asteroid.prototype.givePlayerPoints = function(player) {
        player.score += 5 * (this.size.w / 3); 
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
        const generatedAngleRadians = convertToRadians(generatedAngle);
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
        newAsteroid.type = "debris"; //
        this.asteroidList.push(newAsteroid);
    },    
    generateDebris: function(quantity, parentAsteroid) {
        for (let i = 0; i < quantity; i++) {
            /*gets moving angle of parent asteroid, convert it to degree, generate a new angle with little offset
            based on the parent's angle in degrees, convert it to radians, and get the angle unity vector.
            Generate a random size and create a smaller custom asteroid, with a new angle starting at the same position
            of it's parent.*/
            const parentAsteroidMovingAngle = Math.atan2(parentAsteroid.velocity.y, parentAsteroid.velocity.x);
            const parentAsteroidMovingAngleDegrees = (parentAsteroidMovingAngle * 180) / Math.PI;
            const debrisAngle = getRandomInt(parentAsteroidMovingAngleDegrees - 20, parentAsteroidMovingAngleDegrees + 20);
            const debrisAngleRadians = convertToRadians(debrisAngle);
            const debrisVelocity = {x: Math.cos(debrisAngleRadians), y: Math.sin(debrisAngleRadians)};
            const size = getRandomInt(parentAsteroid.size.w / 3, parentAsteroid.size.w / 2);
            const debrisSize = {w: size, h: size};
            this.generateOneCustom(debrisSize, debrisVelocity, {x: parentAsteroid.position.x + 5, y: parentAsteroid.position.y});
        };
    },
    handleAsteroidCollisions: function(bulletsList, playerPosition){
        // Check for collisions between asteroids and the player.
        for (let i = this.asteroidList.length - 1; i >= 0; i--) {
            if (this.asteroidList[i].isCollided(playerPosition)) {
                // Remove the asteroid and break out of the loop.
                this.asteroidList[i].applyForce(player);
                this.asteroidList[i].inflictDamage(player);
                this.asteroidList[i].givePlayerPoints(player);
                player.applyForce(this.asteroidList[i]);
                this.generateDebris(2, this.asteroidList[i]);
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
                        this.asteroidList[i].givePlayerPoints(player);
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
    speed: 5,
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

let animator = {
    thrustImg: 0,
    frameCounter: 0,
    frameDelay: 8, // Adjust this value to control the animation speed

    thrustingAnimation: function(player) {
        if (player.status == "accelerating") {
            player.image = thrustImgs[this.thrustImg];
            this.frameCounter++;
            if (this.frameCounter >= this.frameDelay) {
                this.frameCounter = 0;
                player.image = thrustImgs[this.thrustImg];
                this.thrustImg += 1;
                if (this.thrustImg > 1) {
                    this.thrustImg = 0;
                }
            }
        } else {
            player.image = idleImage;
            this.frameCounter = 0; // Reset the frame counter when not thrusting
        }
    },
};

function Particle(size, position, velocity, speed, angle, color) {
    //this object is only used inside the particleEffects object
    this.size = size;
    this.initialPosition = {...position};
    this.position = position;
    this.velocity = velocity;
    this.rotatedAngle = angle;
    this.speed = speed;
    this.color = color;
}
    Particle.prototype.move = function() {
        this.position.x += this.velocity.x * this.speed;
        this.position.y += this.velocity.y * this.speed;
    };
    Particle.prototype.shouldDisappear = function() {
        const distanceTraveledVector = {x: this.initialPosition.x - this.position.x, y: this.initialPosition.y - this.position.y};
        const magnitude = Math.sqrt(distanceTraveledVector.x ** 2 + distanceTraveledVector.y ** 2);
        return magnitude > 400;
    };

let particleEffects = {
    particlesList: [],
    particlesColors: ["darkorange", "red", "yellow"],
    updateParticles: function() {
        if (this.particlesList.length > 0) {
            for (let i = this.particlesList.length - 1; i >= 0; i--) {
                this.drawParticle(this.particlesList[i]);
                this.particlesList[i].move();
                this.deleteParticles(this.particlesList[i], i);
            }
        }
    },
    drawParticle: function(particle) {
        ctx.save();
        ctx.translate(particle.position.x, particle.position.y);
        ctx.rotate(particle.rotatedAngle);
        ctx.fillStyle = particle.color;
        ctx.fillRect(0 - particle.size.w/2, 0 - particle.size.h/2, particle.size.w, particle.size.h);
        ctx.restore();
    },
    deleteParticles: function(particle, index) {
        if (particle.shouldDisappear()) {
            this.particlesList.splice(index, 1);
        }
    },
    createParticleExplosion: function(position, quantity) {
        for (let i = 0; i <= quantity; i++) {
            const positionOffset = getRandomInt(2, 7);
            const newPosition = {x: position.x + positionOffset, y: position.y + positionOffset};
            const angleAndVelocity = this.genVelocityAndAngle();

            const newParticle = new Particle(this.genSize(),newPosition, angleAndVelocity.velocity, 
            getRandomInt(1, 3), angleAndVelocity.angle, this.particlesColors[getRandomInt(0, 2)]);

            this.particlesList.push(newParticle);
        }
    },
    genVelocityAndAngle: function() {
        const generatedAngleDegrees = getRandomInt(1, 359);
        const angleRadians = convertToRadians(generatedAngleDegrees);
        const unitVector = {x: Math.cos(angleRadians), y: Math.sin(angleRadians)};
        return {velocity: unitVector, angle: angleRadians};
    },
    genSize: function() {
        const size = getRandomInt(5, 11);
        return {w: size, h: size};
    }
}

let player = {
    image: idleImage,
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
    lifePoints: 100,
    score: 0,
    status: "idle",
    setFacingDirectionAndAcceleration: function(){
        this.facingDirection = {x: Math.cos(this.rotatedAngle), y: Math.sin(this.rotatedAngle)};
        this.acceleration = {x: this.facingDirection.x * this.speed, y: this.facingDirection.y * this.speed};
    },
    applyForce: function(object) {
        object.velocity = {x: object.velocity.x + this.velocity.x, y: object.velocity.y + this.velocity.y};
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
        if (this.lifePoints > 0) {
            this.handleInput();
            this.move();
            this.applyFriction();
            this.updateCoolDown();
            this.drawItself();
        }
        if (this.lifePoints <= 0 && this.status != "exploded") {
            this.explode();
            this.status = "exploded";
        } 
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
    },
    explode: function() {
        particleEffects.createParticleExplosion(this.position, 27);
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
    if (asteroidGenerator.asteroidList.length <= 3) {
        asteroidGenerator.generate(4);
    }
}

asteroidGenerator.generate(3);
function gameLoop() {
    requestAnimationFrame(gameLoop);
    clear();
    player.appear();
    animator.thrustingAnimation(player);
    if (asteroidGenerator.asteroidList.length > 0) {
        updateAsteroids();
        asteroidGenerator.handleAsteroidCollisions(player.bullets, player.position);
    } 
    checkGenerateAsteroids();
    if (player.bullets.length > 0) {
        player.shoot();
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            if (player.bullets[i].isOuttaTheScreen()) {
                player.bullets.splice(i, 1); // Remove the out-of-screen bullet
            };
        }
    }
    drawPlayerLife(player);
    drawPlayerScore(player);
    particleEffects.updateParticles();
    keepWithinScreen(player);
}

window.addEventListener("keydown", function (event) {
    let keyBeingPressed = event.key;
    if (keyBeingPressed == "w" && player.status == "idle") {
        player.status = "accelerating";
    }
    if (!player.keysBeingPressed.includes(keyBeingPressed)) {
        player.keysBeingPressed.push(keyBeingPressed)
    }
});
window.addEventListener("keyup", function(event){
    let keyBeingReleased = event.key;
    if (keyBeingReleased == "w" && player.status == "accelerating") {
        player.status = "idle";
    }
    player.keysBeingPressed = player.keysBeingPressed.filter((item)=>item != keyBeingReleased);
})


idleImage.onload = () => {
    gameLoop();
};




