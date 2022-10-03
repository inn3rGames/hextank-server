import { MapSchema, Schema, type } from "@colyseus/schema";
import CircleBody from "./CircleBody";
import Bullet from "./Bullet";

export default class HexTank extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type("number") angle: number = 0;

    @type("number") jetsRotationZ: number = 0;
    @type("number") jetsRotationX: number = 0;
    @type("number") jetsFlameScale: number = -0.11;

    @type(CircleBody) collisionBody: CircleBody;

    entityType: string = "HexTank";

    private _jetFlameScaleMax: number = -0.22;
    private _jetFlameScaleMin: number = -0.11;

    private _fpsLimit: number = 60;
    private _convertDegreesToRad: number = Math.PI / 180;

    private _speed: number = 0;
    private _speedLimit: number = 0.5;
    private _speedAcceralation: number =
        1 * (this._speedLimit / this._fpsLimit);

    private _speedForward: boolean = false;
    private _speedBackward: boolean = false;

    private _rotationSpeed: number = 0;
    private _rotationSpeedLimit: number = 2.5 * this._convertDegreesToRad;
    private _rotationAcceralation =
        (6.25 / this._fpsLimit) * this._convertDegreesToRad;
    private _rotateLeft: boolean = false;
    private _rotateRight: boolean = false;

    commands: Array<string> = [];

    private _bulletsMap: MapSchema<Bullet>;

    constructor(
        x: number,
        z: number,
        id: string,
        bulletsMap?: MapSchema<Bullet>
    ) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;

        this._bulletsMap = bulletsMap;

        this.collisionBody = new CircleBody(this.x, this.z, 0.7, this);
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
        if (!(this._rotateLeft === true && this._rotateRight === true)) {
            let computeAngle = this.angle;

            this._rotationSpeed += this._rotationAcceralation;
            if (this._rotationSpeed > this._rotationSpeedLimit) {
                this._rotationSpeed = this._rotationSpeedLimit;
            }

            computeAngle += this._rotationSpeed * direction;
            computeAngle = this._positiveAngle(computeAngle);
            this.angle = computeAngle;

            if (direction >= 0) {
                this.jetsRotationX = Math.PI / 12;
                this._rotateRight = true;
            } else {
                this.jetsRotationX = -Math.PI / 12;
                this._rotateLeft = true;
            }
        } else {
            this.jetsRotationX = 0;
        }

        this.jetsFlameScale = this._jetFlameScaleMax;
    }

    private _stopRotate() {
        this._rotationSpeed = 0;
        this.jetsRotationX = 0;
        this._rotateLeft = false;
        this._rotateRight = false;
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

            if (typeof this._bulletsMap !== undefined) {
                if (currentCommand === "shootDown") {
                    new Bullet(
                        this.x - 5 * Math.cos(this.angle),
                        this.z - 5 * -Math.sin(this.angle),
                        0.1,
                        this.angle,
                        this.id + performance.now().toString(),
                        this._bulletsMap
                    );
                }
            }
        }
    }

    private _decelerate() {
        if (this._speedForward === false && this._speedBackward === false) {
            if (this._speed !== 0) {
                if (this._speed >= 0) {
                    this._speed -= this._speedAcceralation;
                    if (this._speed <= 0) {
                        this._speed = 0;
                    }
                } else {
                    this._speed += this._speedAcceralation;
                    if (this._speed > 0) {
                        this._speed = 0;
                    }
                }
            }
        }
    }

    private _accelerate() {
        if (this._speedForward === true) {
            this._speed -= this._speedAcceralation;
        }
        if (this._speedBackward === true) {
            this._speed += this._speedAcceralation;
        }
    }

    private _limitTopSpeed() {
        if (Math.abs(this._speed) > this._speedLimit) {
            if (this._speed >= 0) {
                this._speed = this._speedLimit;
            } else {
                this._speed = -this._speedLimit;
            }
        }
    }

    private _setNewPosition() {
        if (this.collisionBody.collided === false) {
            this.x += this._speed * Math.cos(this.angle);
            this.z += this._speed * -Math.sin(this.angle);
        }
    }

    private _preventDoubleSpeedCommands() {
        if (this._speedForward === true && this._speedBackward === true) {
            this._speed = 0;
            this.jetsRotationZ = 0;
        }
    }

    private _updateMovement() {
        this._decelerate();
        this._accelerate();
        this._limitTopSpeed();
        this._preventDoubleSpeedCommands();
        this._setNewPosition();
    }

    update() {
        this.processCommands();
        this._updateMovement();
        this.collisionBody.updateBody(this.x, this.z);
    }
}
