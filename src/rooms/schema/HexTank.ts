import { Schema, type } from "@colyseus/schema";

export default class HexTank extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type("number") angle: number = 0;

    private _fpsLimit: number = 60;
    private _convertRadToDegrees: number = 180 / Math.PI;
    private _convertDegreesToRad: number = Math.PI / 180;

    private _speed: number = 0;
    private _speedLimit: number = 1;
    private _speedAcceralation: number =
        1 * (this._speedLimit / this._fpsLimit);
    private _speedDirection: number = 1;
    private _speedDecelerate: boolean = false;
    private _speedPreviousDirection: number = 0;

    private _rotationSpeed: number = 0;
    private _rotationSpeedLimit: number = 5 * this._convertDegreesToRad;
    private _rotationAcceralation =
        (25 / this._fpsLimit) * this._convertDegreesToRad;

    commands: Array<string> = [];

    constructor(x: number, z: number, id: string) {
        super();

        this.x = x;
        this.z = z;
        this.id = id;
    }
    private _positiveAngle(angle: number): number {
        let computeAngle = angle;
        computeAngle = computeAngle % (2 * Math.PI);
        if (computeAngle < 0) {
            computeAngle += 2 * Math.PI;
        }
        return computeAngle;
    }

    rotate(direction: number) {
        let computeAngle = this.angle;

        this._rotationSpeed += this._rotationAcceralation;
        if (this._rotationSpeed > this._rotationSpeedLimit) {
            this._rotationSpeed = this._rotationSpeedLimit;
        }

        computeAngle += this._rotationSpeed * direction;
        computeAngle = this._positiveAngle(computeAngle);
        this.angle = computeAngle;
    }

    stopRotate() {
        this._rotationSpeed = 0;
    }

    move(direction: number) {
        this._speedDecelerate = false;

        if (this._speedPreviousDirection !== direction) {
            this._speed = 0;
        }

        this._speed += this._speedAcceralation;
        if (this._speed > this._speedLimit) {
            this._speed = this._speedLimit;
        }

        this._speedDirection = direction;
        this._speedPreviousDirection = direction;
    }

    stopMove() {
        this._speedDecelerate = true;
    }

    updateMovement() {
        if (this._speedDecelerate === true) {
            this._speed -= this._speedAcceralation;
            if (this._speed <= 0) {
                this._speed = 0;
                this._speedDecelerate = false;
            }
        }

        this.x += this._speed * Math.cos(this.angle) * this._speedDirection;
        this.z += this._speed * -Math.sin(this.angle) * this._speedDirection;
    }
}
