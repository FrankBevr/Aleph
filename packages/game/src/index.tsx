import { createRoot } from "react-dom/client";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArenaObject } from "./ArenaObject";
import { IHasVelocity } from "./traits";
import { Arena } from "./Arena";

let scene: any, camera: any, renderer: any, controls: any;
let lastFrame = new Date().getTime();
const arenaSize = 10;
let arena: Arena;

function initGame() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create and position the camera
    const fov = 80; // field of view
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(arenaSize + 6, arenaSize + 5, arenaSize + 4);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container')!.appendChild(renderer.domElement);

    // Add orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Create the arena
    arena = new Arena(arenaSize);
    arena.addToScene(scene);

    // Start the animation loop
    animate();
}

function initUi() {
    const root = createRoot(
        document.getElementById('ui-container')!
    );
    const App = () => {
        return (
            <div>
                <h1>Hello from React UI!</h1>
            </div>
        );
    };
    root.render(<App />);
}

function init() {
    initGame();
    initUi();
}

function animate() {
    let now = new Date().getTime();
    let delta = (now - lastFrame) * 0.001;
    lastFrame = now;

    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Update each sphere
    arena.update(delta, scene);

    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
