
const PROJECTS: Project[] = []

const PROJECTS_ELEMENT = document.getElementById('projects')
async function load() {
    const file = await fetch('../projects.json')
    const json = await file.json()

    for (let i = 0; i < json.length; i++) {
        const project = json[i]
        const colors = await getImageColors('../' + project.name.toLowerCase().replace(" ", "_") + '.png', 10)
        colors.sort((a, b) => b[3]-a[3])

        const proj = document.createElement('div')
        proj.id = 'project'
    
        const res = document.createElement('div')
        const logo = document.createElement('img')
        logo.src = '../' + project.name.toLowerCase().replace(" ", "_") + '.png'
        logo.style.borderRadius = '35px'
        logo.style.width = '200px'
        res.appendChild(logo)

        const details = document.createElement('div')
        const name = document.createElement('h1')
        name.innerText = project.name
        details.appendChild(name)
        const lastUpdated = document.createElement('h3')
        if (project.date) {
            lastUpdated.innerText = formatDate(project.date)
        } else {
            lastUpdated.innerText = 'Unreleased'
        }
        details.appendChild(lastUpdated)
        if (project.description) {
            const description = document.createElement('p')
            description.style.maxWidth = '500px'
            description.innerText = project.description
            details.appendChild(description)
        }
        if (project.platforms) {
            details.appendChild(document.createElement('br'))
            const label = document.createElement('h2')
            label.innerText = 'Downloads'
            details.appendChild(label)
            const downloads = document.createElement('div')
            downloads.style.display = 'flex'
            downloads.style.justifyContent = 'center'
            for (let j = 0; j < Object.keys(project.platforms).length; j++) {
                const key = Object.keys(project.platforms)[j]
                
                const download = document.createElement('a')
                download.href = project.platforms[key]
                download.target = '_bland'
                const icon = document.createElement('span')
                icon.className = 'material-icons'
                icon.style.padding = '0px 5px 0px 5px'
                if (key == "Web") {
                    icon.innerText = 'public'
                } else if (key == "iOS") {
                    icon.innerHTML = 'phone_iphone'
                } else if (key == "Android") {
                    icon.innerHTML = 'phone_android'
                } else if (key == "Mac") {
                    icon.innerHTML = 'desktop_mac'
                } else if (key == "Windows") {
                    icon.innerHTML = 'desktop_windows'
                }
                download.appendChild(icon)
                downloads.appendChild(download)
            }
            details.appendChild(downloads)
        }
        if (project.link) {
            details.appendChild(document.createElement('br'))
            const link = document.createElement('a')
            link.href ="https://" + project.link + '/'
            link.target = '_blank'
            link.innerText = project.link
            details.appendChild(link)
        }

        proj.appendChild(res)
        proj.appendChild(details)

        PROJECTS_ELEMENT!.appendChild(proj)

        PROJECTS.push(new Project(project, [[colors[0][0], colors[0][1], colors[0][2]], [colors[1][0], colors[1][1], colors[1][2]]], proj))
    }
}
load()


class Project {

    public data: any

    public colors: [[number, number, number], [number, number, number]]
    public dom: HTMLDivElement

    public constructor(data: any, colors: [[number, number, number], [number, number, number]], dom: HTMLDivElement) {
        this.data = data

        this.colors = colors
        this.dom = dom
    }
}


import * as THREE from 'three'
import { ParticleSystem } from './render/particles'
import { randFloat, randInt } from 'three/src/math/MathUtils.js'

const CANVAS = document.getElementById('gl-rendering')

const SCENE = new THREE.Scene()
const CAMERA = new THREE.PerspectiveCamera(75, CANVAS!.offsetWidth / CANVAS!.offsetHeight, 0.1, 1000)
const RENDERER = new THREE.WebGLRenderer({
    canvas: CANVAS!,
    alpha: true
})
const CLOCK = new THREE.Clock()
CAMERA.position.set(0,0,100)

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
const GEOMETRY_FACTORIES = [
    () => new THREE.TorusKnotGeometry(randFloat(0.5,1.5)),
    () => new THREE.TorusGeometry(randFloat(0.5,1))
]
const PARTICLES = new ParticleSystem(SCENE, () => GEOMETRY_FACTORIES[randInt(0,GEOMETRY_FACTORIES.length-1)]()).setColor(0x5c0c05).setSpawnBounds(new THREE.Vector3(), 100).setOpacity(0.8, 4).setRotationBounds(new THREE.Vector3(0,0,0), new THREE.Vector3(2*Math.PI, 2*Math.PI, 2*Math.PI)).setDirection(new THREE.Vector4(0,0,0,50)).setDespawnTime(12)

function loopParticles() {
    setTimeout(() => {
        PARTICLES.spawnParticles(20)
        loopParticles()
    }, 8000)
}
PARTICLES.spawnParticles(20)
loopParticles()

class LerpColor {
    private color: [number, number, number]
    private current: [number, number, number]

    public constructor(color: [number, number, number]) {
        this.color = color
        this.current = color
    }
    
    public getColor() {
        return rgbToHexNumber(this.current)
    }

    public setColor(color: [number, number, number]) {
        this.color = color
    }

    public update(delta: number) {
        this.current = interpolateColors(this.current, this.color, delta)
    }
}
const COLOR = new LerpColor([255,255,255])
function animate() {
    requestAnimationFrame(animate)

    const delta = CLOCK.getDelta()
    COLOR.update(delta)
    for (let i = PROJECTS.length-1; i >= 0; i--) {
        const project = PROJECTS[i]

        if (project.dom.getBoundingClientRect().top <= 0) {
            PARTICLES.setColor(rgbToHexNumber(project.colors[1]))
            COLOR.setColor(project.colors[0])
            break
        }
    }
    RENDERER.setClearColor(COLOR.getColor(), 1)

    PARTICLES.traverse((particle) => {
        particle.getMesh().rotateX(randFloat(0, delta))
        particle.getMesh().rotateY(randFloat(0, delta))
        particle.getMesh().rotateZ(randFloat(0, delta))
    })

    PARTICLES.update(delta)

    RENDERER.render(SCENE, CAMERA)
}
animate()






async function getImageColors(filePath: string, tolerance: number) {

    const { data, width, height } = await loadImageData(filePath)
    const colorData: [number, number, number][][] = []

    function fit(red: number, green: number, blue: number, alpha: number) {
        if (alpha > 0) {
            for (let i = 0; i < colorData.length; i++) {
                const testColor = colorData[i][0]

                const distance = Math.sqrt((red - testColor[0])**2 + (green - testColor[1])**2 + (blue - testColor[2])**2)
                if (distance <= tolerance) {
                    return colorData[i]
                }
            }
        }
        return undefined
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
  
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const alpha = data[index + 3];
  
            const arr = fit(red, green, blue, alpha)
            if (arr) {
                arr.push([red, green, blue])
            } else {
                colorData.push([[red, green, blue]])
            }
        }
    }

    const colors: [number, number, number, number][] = []

    for (let i = 0; i < colorData.length; i++) {
        const testedColors = colorData[i]
        const big = [0, 0, 0]
        for (let j = 0; j < testedColors.length; j++) {
            big[0] += testedColors[j][0]
            big[1] += testedColors[j][1]
            big[2] += testedColors[j][2]
        }
        colors.push([big[0] / testedColors.length, big[1] / testedColors.length, big[2] / testedColors.length, testedColors.length])
    }

    return colors
}


async function loadImageData(filePath: string): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = filePath;
  
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
  
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D context"));
          return;
        }
  
        ctx.drawImage(img, 0, 0);
  
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
    
        resolve({
          data: imageData.data,
          width: imageData.width,
          height: imageData.height,
        });
      };
  
      img.onerror = () => {
        reject(new Error(`Failed to load image from path: ${filePath}`));
      };
    });
}

function rgbToHexNumber(rgb: [number, number, number]): number {
    let r = Math.max(0, Math.min(255, rgb[0]));
    let g = Math.max(0, Math.min(255, rgb[1]));
    let b = Math.max(0, Math.min(255, rgb[2]));
  
    const hexNumber = (r << 16) | (g << 8) | b;
  
    return hexNumber;
}

function interpolateColors(color1: [number, number, number], color2: [number, number, number], t: number): [number, number, number] {
    t = Math.max(0, Math.min(1, t));

    const newR = color1[0] + (color2[0] - color1[0]) * t;
    const newG = color1[1] + (color2[1] - color1[1]) * t;
    const newB = color1[2] + (color2[2] - color1[2]) * t;

    return [newR, newG, newB];
}

function formatDate(dateString: string): string {
    const [month, day, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${Number.parseInt(day) + 1}`);

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
}