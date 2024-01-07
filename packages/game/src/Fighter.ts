import * as THREE from "three";
import { ArenaObject } from "./ArenaObject";
import { IHasVelocity } from "./traits";

export class Fighter extends ArenaObject implements IHasVelocity {

    public velocity: any;

    constructor(size: number, velocity: any) {
        const geometry = new THREE.BoxGeometry(0.2, 0.1, 0.8);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        super(mesh, size, false);
        this.velocity = velocity;
    }

    update(dt: number) {
        // Update position based on velocity
        this.mesh.position.add(new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z).multiplyScalar(dt));
        // Orient mesh to face velocity
        this.mesh.lookAt(this.mesh.position.clone().add(this.velocity));
        super.update(dt);
    }
}