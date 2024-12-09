import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { LoadingManager } from 'three';
import gsap from 'gsap';

// // 加載管理器和遮罩
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');

const container = document.getElementById('container');

const stats = new Stats();
// container.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);
scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
).texture;

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    100
);
camera.position.set(18, 3, -7);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/gltf/');

const loadingManager = new LoadingManager(
    // 所有資源加載完成
    () => {
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                loadingScreen.style.display = 'none';
            },
        });

        gsap.to(camera.position, {
            x: camera.position.x - 10, // 調整相機位置（如果需要大角度移動）
            duration: 2,
            ease: 'power2.inOut',
            onUpdate: () => controls.update(), // 同步更新控件
        });
    },
    // 資源加載進度
    (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = `${progress}%`;
    }
);

const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);
loader.load(
    './models/SmartCube.glb',
    function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        scene.add(model);

        renderer.setAnimationLoop(animate);
    },
    undefined,
    function (e) {
        console.error(e);
    }
);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(cube);

window.onload = () => {
    renderer.setAnimationLoop(animate);
};

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
};

function animate() {
    controls.update();

    stats.update();

    renderer.render(scene, camera);
}
