import { Schema, type } from "@colyseus/schema";
import CollisionBody from "./CollisionBody";

export default class HexTank extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type("number") angle: number = 0;

    @type("number") jetsRotationZ: number = 0;
    @type("number") jetsRotationX: number = 0;
    @type("number") jetsFlameScale: number = 0.11;

    @type(CollisionBody) collisionBody: CollisionBody;

    private _jetFlameScaleMax: number = 0.22;
    private _jetFlameScaleMin: number = 0.11;

    private _fpsLimit: number = 60;
    private _convertDegreesToRad: number = Math.PI / 180;

    speed: number = 0;
    private _speedLimit: number = 0.5;
    private _speedAcceralation: number =
        1 * (this._speedLimit / this._fpsLimit);

    private _speedForward: boolean = false;
    private _speedBackward: boolean = false;

    private _rotationSpeed: number = 0;
    private _rotationSpeedLimit: number = 2.5 * this._convertDegreesToRad;
    private _rotationAcceralation =
        (6.25 / this._fpsLimit) * this._convertDegreesToRad;

    commands: Array<string> = [];

    constructor(x: number, z: number, id: string) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this.collisionBody = new CollisionBody(this.x, this.z, 0.8);
    }

    private _positiveAngle(angle: number): number {
        let computeAngle = angle;
        computeAngle = computeAngle % (2 * Math.PI);
        if (computeAngle < 0) {
            computeAngle += 2 * Math.PI;
        }
        return computeAngle;
    }

    private _rotate(direction: number) {
        let computeAngle = this.angle;

        this._rotationSpeed += this._rotationAcceralation;
        if (this._rotationSpeed > this._rotationSpeedLimit) {
            this._rotationSpeed = this._rotationSpeedLimit;
        }

        computeAngle += this._rotationSpeed * direction;
        computeAngle = this._positiveAngle(computeAngle);
        this.angle = computeAngle;

        if (direction >= 0) {
            this.jetsRotationX = -Math.PI / 12;
        } else {
            this.jetsRotationX = Math.PI / 12;
        }
        this.jetsFlameScale = this._jetFlameScaleMax;
    }

    private _stopRotate() {
        this._rotationSpeed = 0;
        this.jetsRotationX = 0;
        this.jetsFlameScale = this._jetFlameScaleMin;
    }

    private _moveForward() {
        this._speedForward = true;
        this.jetsRotationZ = Math.PI / 12;
        this.jetsFlameScale = this._jetFlameScaleMax;
    }

    private _stopMoveForward() {
        this._speedForward = false;
        this.jetsRotationZ = 0;
        this.jetsFlameScale = this._jetFlameScaleMin;
    }

    private _moveBackward() {
        this._speedBackward = true;
        this.jetsRotationZ = -Math.PI / 12;
        this.jetsFlameScale = this._jetFlameScaleMax;
    }

    private _stopMoveBackward() {
        this._speedBackward = false;
        this.jetsRotationZ = 0;
        this.jetsFlameScale = this._jetFlameScaleMin;
    }

    processCommands() {
        let currentCommand;
        while (
            typeof (currentCommand = this.commands.shift()) !== "undefined"
        ) {
            if (currentCommand === "upKeyDown") {
                this._moveForward();
            }

            if (currentCommand === "downKeyDown") {
                this._moveBackward();
            }

            if (currentCommand === "leftKeyDown") {
                this._rotate(-1);
            }

            if (currentCommand === "rightKeyDown") {
                this._rotate(1);
            }

            if (currentCommand === "upKeyUp") {
                this._stopMoveForward();
            }

            if (currentCommand === "downKeyUp") {
                this._stopMoveBackward();
            }

            if (currentCommand === "leftKeyUp") {
                this._stopRotate();
            }

            if (currentCommand === "rightKeyUp") {
                this._stopRotate();
            }
        }
    }

    private _decelerate() {
        if (this._speedForward === false && this._speedBackward === false) {
            if (this.speed !== 0) {
                if (this.speed >= 0) {
                    this.speed -= this._speedAcceralation;
                    if (this.speed <= 0) {
                        this.speed = 0;
                    }
                } else {
                    this.speed += this._speedAcceralation;
                    if (this.speed > 0) {
                        this.speed = 0;
                    }
                }
            }
        }
    }

    private _accelerate() {
        if (this._speedForward === true) {
            this.speed -= this._speedAcceralation;
        }
        if (this._speedBackward === true) {
            this.speed += this._speedAcceralation;
        }
    }

    private _limitTopSpeed() {
        if (Math.abs(this.speed) > this._speedLimit) {
            if (this.speed >= 0) {
                this.speed = this._speedLimit;
            } else {
                this.speed = -this._speedLimit;
            }
        }
    }

    private _setNewPosition() {
        if (this.collisionBody.collided === false) {
            this.x += this.speed * Math.cos(this.angle);
            this.z += this.speed * -Math.sin(this.angle);
        }
    }

    private _updateMovement() {
        this._decelerate();
        this._accelerate();
        this._limitTopSpeed();
        this._setNewPosition();
        this.collisionBody.updatePosition(this.x, this.z);
    }

    update() {
        this.collisionBody.collided = false;
        this.processCommands();
        this._updateMovement();
    }
}
