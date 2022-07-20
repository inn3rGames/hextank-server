import { Schema, type } from "@colyseus/schema";

export default class HexTank extends Schema {
    @type("number") x: number;
    @type("number") z: number;
    @type("string") id: string;

    @type("number") angle: number = 0;

    private _fpsLimit: number = 60;
    private _convertRadToDegrees: number = 180 / Math.PI;
    private _convertDegreesToRad: number = Math.PI / 180;

    private _speed: number = 0.5;
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
        this.x += this._speed * Math.cos(this.angle) * direction;
        this.z += this._speed * -Math.sin(this.angle) * direction;
    }
}
