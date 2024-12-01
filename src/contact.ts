import * as THREE from 'three'
import { createMeshFromImage } from './render/image'

const CANVAS = document.getElementById('gl-rendering')

const SCENE = new THREE.Scene()
const CAMERA = new THREE.PerspectiveCamera(75, CANVAS!.offsetWidth / CANVAS!.offsetHeight, 0.1, 1000)
const RENDERER = new THREE.WebGLRenderer({
    canvas: CANVAS!,
    alpha: true
})
CAMERA.position.set(0, 0, 100)

const pointLight = new THREE.DirectionalLight(0xffffff, 2)
pointLight.position.set(1, 1, 1)
const ambientLight = new THREE.AmbientLight(0xffffff, 2)
SCENE.add(ambientLight)

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

let card : THREE.Mesh | undefined = undefined
createMeshFromImage('../card.png', 10).then((mesh) => {
    card = mesh
    card.scale.set(0.1,0.1,0.1)
    SCENE.add(card)
})
window.onmousemove = (event) => {
    if (card) {
        let rX = (event.clientX - (window.innerWidth / 2))/(window.innerWidth / 2)
        let rY = (event.clientY - (window.innerHeight / 2))/(window.innerHeight / 2)
        card.rotation.set(rY/10, rX/10, 0)
    }
}

function animate() {
    requestAnimationFrame(animate)

    RENDERER.render(SCENE, CAMERA)
}
animate()