import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { ParticleSystem } from './render/particles'
import { randFloat } from 'three/src/math/MathUtils.js'

const CANVAS = document.getElementById('gl-rendering')

const SCENE = new THREE.Scene()
const CAMERA = new THREE.PerspectiveCamera(75, CANVAS!.offsetWidth / CANVAS!.offsetHeight, 0.1, 1000)
const RENDERER = new THREE.WebGLRenderer({
    canvas: CANVAS!,
    alpha: true
})

const CLOCK = new THREE.Clock()
CAMERA.position.set(0, 0, 10)
const LOADER = new GLTFLoader()

const pointLight = new THREE.DirectionalLight(0xffffff, 1)
pointLight.position.set(0, 1, 1)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
SCENE.add(ambientLight, pointLight)

const PARTICLES = new ParticleSystem(SCENE, () => new THREE.CylinderGeometry(0.01, 0.01, randFloat(0.3, 0.7))).setDirection(new THREE.Vector4(8, 0, 2, 1)).setColor(0x4d0a04).setOpacity(1, 3).setSpawnBounds(new THREE.Vector3(2, -1.5, -1), 2.2).setRotation(new THREE.Vector3(0, 0, Math.PI/2))
const BALL = new ParticleSystem(SCENE, () => new THREE.SphereGeometry(0.02)).setDirection(new THREE.Vector4(0, 0, 0, 1)).setColor(0x4d0a04).setOpacity(1, 0.2).setSpawnBounds(new THREE.Vector3(0, -1, 0), 2).setDespawnTime(1.2)

let mixer: THREE.AnimationMixer

RENDERER.setSize(CANVAS!.offsetWidth, CANVAS!.offsetHeight)
RENDERER.setPixelRatio(window.devicePixelRatio)
window.addEventListener("resize", 
    function () {
        CANVAS!.style.width = window.innerWidth.toString() + 'px'
        CANVAS!.style.height = window.innerHeight.toString() + 'px'
        RENDERER.setSize(CANVAS!.offsetWidth, CANVAS!.offsetHeight)
        CAMERA.aspect = CANVAS!.offsetWidth / CANVAS!.offsetHeight
        CAMERA.updateProjectionMatrix()
    }
)

LOADER.load('phoenix.glb', function ( gltf ) {
    gltf.scene.scale.set(0.01, 0.01, 0.01)
    gltf.scene.position.set(-1, -2, 0)
    gltf.scene.rotateY(-Math.PI)
    gltf.scene.rotateZ(Math.PI/12)
    gltf.scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshToonMaterial({
                color: 0xdd1d0c,
                wireframe: true
            })
        }
    })

    mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations.length > 0) {
        const flyingAnimation = gltf.animations[0]
        extendAnimation(flyingAnimation, 3)
        const action = mixer.clipAction(flyingAnimation);
        action.play();
    }

    SCENE.add(gltf.scene)
})


function animate() {
    requestAnimationFrame(animate);

    const delta = CLOCK.getDelta();

    if (mixer instanceof THREE.AnimationMixer) 
        mixer.update(delta);

    PARTICLES.update(delta)
    BALL.update(delta)
    BALL.setSpawnBounds(new THREE.Vector3(4*Math.sin(((1/2)*Math.PI*document.body.getBoundingClientRect().top)/window.innerHeight), 15*document.body.getBoundingClientRect().top/window.innerHeight, 0), 2)
    BALL.setOpacity(-document.body.getBoundingClientRect().top > window.innerHeight ? 0.4 : 1, 0.2)

    CAMERA.position.set(0, 15*document.body.getBoundingClientRect().top/window.innerHeight, 10)

    RENDERER.render(SCENE, CAMERA);
}
animate();
function loopParticles() {
    setTimeout(() => {
        PARTICLES.spawnParticles(10)
        loopParticles()
    }, 200)
}
loopParticles()
function loopBall() {
    setTimeout(() => {
        if (-document.body.getBoundingClientRect().top > window.innerHeight / 6)
            BALL.spawnParticles(50)
        loopBall()
    }, 100)
}
loopBall()

function extendAnimation(animation: THREE.AnimationClip, scale: number) {
    const extendedDuration = animation.duration * scale
    animation.tracks.forEach((track) => {
        const times = track.times
        for (let i = 0; i < times.length; i++) {
            times[i] *= extendedDuration / animation.duration
        }
    })
    animation.duration = extendedDuration
}