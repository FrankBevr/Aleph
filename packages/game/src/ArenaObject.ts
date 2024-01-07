import { IAddToScene, IHasMesh, IHasSize, IHasVelocity, IUpdate } from "./traits";

export interface IArenaObject extends IHasMesh, IHasSize, IAddToScene, IUpdate {
}

// ArenaObject Class
export class ArenaObject implements IArenaObject {

    public mesh: any;
    public size: number;
    public bounce: boolean = true;

    constructor(mesh: any, size: number, bounce: boolean = true) {
        this.mesh = mesh;
        this.size = size;
        this.bounce = bounce;
    }

    addToScene(scene: any) {
        scene.add(this.mesh);
    }

    update(dt: number) {
        // Teleport if out of bounds
        ['x', 'y', 'z'].forEach(axis => {
            if (this.mesh.position[axis] > this.size) {
                if ("velocity" in this && this.bounce) {
                    this.mesh.position[axis] = this.size - 0.001;

                    const thisAsHasVelocity = this as IHasVelocity;
                    if (typeof thisAsHasVelocity.velocity[axis] !== 'undefined') {
                        thisAsHasVelocity.velocity[axis] *= -1.0;
                    }
                } else {
                    // Teleport
                    this.mesh.position[axis] = -this.size + 0.001;
                }
            } else if (this.mesh.position[axis] < -this.size) {
                if ("velocity" in this && this.bounce) {
                    this.mesh.position[axis] = -this.size + 0.001;

                    const thisAsHasVelocity = this as IHasVelocity;
                    if (typeof thisAsHasVelocity.velocity[axis] !== 'undefined') {
                        thisAsHasVelocity.velocity[axis] *= -1.0;
                    }
                } else {
                    // Teleport
                    this.mesh.position[axis] = this.size - 0.001;
                }
            }
        });

    }
}