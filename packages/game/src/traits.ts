
export interface IHasMesh {
    mesh: any;
}

export interface IHasSize {
    size: number;
}

export interface IHasVelocity {
    velocity: any;
}

export interface IAddToScene {
    addToScene(scene: any): void;
}

export interface IUpdate {
    update(dt: number): void;
}
