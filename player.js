const { vec2 } = require("gl-matrix");
const bounds = require("./bounds.js");

class Player {
    constructor() {
        this.name = "empty";
        this.position = vec2.fromValues(0.5, 0.0);
        this.size = vec2.fromValues(150 / 1280, 150 / 720);
        this.boostCounter = 10;
        this.velocity = vec2.create(); // [0, 0]
        this.timeMs = Date.now();
        this.boostCooldownMs = 500;
        this.mousePosition = vec2.create();
        this.isJumpButtonPressed = false;
        this.timePassed = 0;
        this.playing = false;
    }

    reset() {
        this.timePassed = 0;
        this.position = vec2.fromValues(0.5, 0.0);
        this.boostCounter = 10;
        this.velocity = vec2.fromValues(0, 0);
        this.timeMs = Date.now();
        this.isJumpButtonPressed = false;
    }

    startPlaying() {
        this.playing = true;
        this.reset();
    }

    stopPlaying() {
        this.playing = false;
        this.reset();
    }

    isPlaying() {
        return this.playing;
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    updateMousePosition(position) {
        vec2.copy(this.mousePosition, position);
    }

    jump() {
        this.isJumpButtonPressed = true;
    }

    getPosition() {
        return this.position;
    }

    getBounds() {
        return new bounds.Bounds2D(this.position, this.size);
    }

    handleMovement() {
        const center = vec2.create();
        vec2.add(center, this.position, vec2.scale(this.size, this.size, 0.5));

        const direction = vec2.create();
        vec2.sub(direction, this.mousePosition, center);

        if (vec2.length(direction) === 0) {
            return;
        }

        vec2.normalize(direction, direction);


        if (
            this.isJumpButtonPressed &&
            Date.now() - this.timeMs >= this.boostCooldownMs &&
            this.boostCounter > 0
        ) {
            vec2.add(this.velocity, this.velocity, vec2.scale(direction, direction, 1));
            
            this.boostCounter--;
            this.timeMs = Date.now();
        }

        this.isJumpButtonPressed = false;
    }

    handleGravity() {
        const GRAVITY = vec2.fromValues(0, 0.0);
        vec2.add(this.velocity, this.velocity, GRAVITY);
    }

    handleBorder() {
        const playerBounds = this.getBounds();
        const pos = playerBounds.getPosition();     
        const force = vec2.create();

        if (pos.x === 0) {
            vec2.add(force, force, vec2.fromValues(1, 0));
        } else if (pos.x === 1 - this.size[0]) {
            vec2.add(force, force, vec2.fromValues(-1, 0));
        }      

        if (pos.y === 0) {
            vec2.add(force, force, vec2.fromValues(0, 1));
        }   

        if (vec2.length(force) === 0) 
                return;   
            
        vec2.normalize(force, force);
        vec2.scale(force, force, vec2.length(this.velocity) * 1.1);
        vec2.add(this.velocity, this.velocity, force);
  }

    update(timePassed) {
        const FLT_MAX = 3.402823466e38;     
        
        this.handleMovement();
        this.handleGravity();
        this.handleBorder(); 

        this.velocity = this.clampLength(this.velocity, 0, 40);

        vec2.add(this.position, this.position, this.velocity);  

        const lerpedVelocity = vec2.create();

        vec2.lerp(lerpedVelocity, this.velocity, vec2.fromValues(0, 0), 0.001);
        vec2.copy(this.velocity, lerpedVelocity);       

        const maxPosition = vec2.fromValues(1 - this.size[0], FLT_MAX);
        this.clampVec2(this.position, vec2.fromValues(0, 0), maxPosition);
        
        this.timePassed += timePassed;
    }

    clampVec2(out, min, max) {
        out[0] = Math.max(min[0], Math.min(max[0], out[0]));
        out[1] = Math.max(min[1], Math.min(max[1], out[1]));
    }

    clampLength(vector, minLength, maxLength) {
        let vectorLength = vec2.length(vector);

        if(vectorLength >= minLength && vectorLength <= maxLength) {
            return vector;
        } 

        if(vectorLength < minLength) {
            return vec2.mul(vector, vec2.normalize(vector, vector), minLength);
        }       

        return vec2.mul(vector, vec2.normalize(vector, vector), maxLength);
    }
}

module.exports = { Player };

