import * as THREE from "three";
import { ArenaObject } from "./ArenaObject";
import { IHasVelocity } from "./traits";

// Sphere subclass
export class Sphere extends ArenaObject implements IHasVelocity {

    public velocity: any;

    constructor(size: number, velocity: any) {
        const geometry = new THREE.SphereGeometry(0.1, 6, 6);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        super(mesh, size);
        this.velocity = velocity;
    }

    update(dt: number) {
        // Update position based on velocity
        this.mesh.position.add(new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z).multiplyScalar(dt));
        super.update(dt);
    }
}
