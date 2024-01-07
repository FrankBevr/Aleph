import * as THREE from 'three';
import { ArenaObject } from './ArenaObject';
import { Sphere } from './Sphere';
import { Fighter } from './Fighter';

export class Arena {

    public size: number;
    public edges: any;

    public arenaObjects: Array<ArenaObject> = [];
    private arenaObjectsToAddToScene: Array<ArenaObject> = [];

    constructor(size: any) {
        this.size = size;
        this.edges = this.createEdges();
    }

    private createEdges() {
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2));
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        return new THREE.LineSegments(edges, material);
    }

    public addToScene(scene: any) {
        scene.add(this.edges);

        // Create spheres with random velocity
        for (let i = 0; i < 50; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5),
                (Math.random() - 0.5),
                (Math.random() - 0.5)
            ).normalize().multiplyScalar(5);
            const sphere = new Sphere(this.size, velocity);
            sphere.addToScene(scene);
            this.arenaObjects.push(sphere);
        }

        // Create fighters with random velocity
        for (let i = 0; i < 50; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5),
                (Math.random() - 0.5),
                (Math.random() - 0.5)
            ).normalize().multiplyScalar(5);
            const fighter = new Fighter(this.size, velocity);
            fighter.addToScene(scene);
            this.arenaObjects.push(fighter);
        }

    }

    public update(dt: number, scene: any) {
        this.arenaObjects.forEach(arenaObject => {
            arenaObject.update(dt);
        });

        // Add new objects to scene
        this.arenaObjectsToAddToScene.forEach(arenaObject => {
            arenaObject.addToScene(scene);
        });
        this.arenaObjectsToAddToScene = [];
    }
}