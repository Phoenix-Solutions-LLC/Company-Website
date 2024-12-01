import { BufferGeometry, Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector3, Vector4 } from "three";
import { randFloat } from "three/src/math/MathUtils.js";

type GeometryFactory = () => BufferGeometry
type TraverseParticle = (particle: Particle) => void

export class ParticleSystem {

    private static MAX_COUNT: number = 500

    private scene: Scene
    private geometry: GeometryFactory

    private color: number
    private direction: Vector4
    private spawn: [Vector3, number]
    private rotation: [Vector3, Vector3]

    private opacity: number
    private opacityTime: number

    private particles: Particle[]
    private despawnTime: number

    public constructor(scene: Scene, geometry: GeometryFactory = () => new SphereGeometry(randFloat(0.05, 0.05))) {
        this.scene = scene

        this.color = 0x000000
        this.direction = new Vector4(0, -9.8, 0, 0)
        this.spawn = [new Vector3(0,0,0), 1]
        this.rotation = [new Vector3(0, 0, 0), new Vector3(0, 0, 0)]
        this.geometry = geometry

        this.opacity = 0.5
        this.opacityTime = 1
        
        this.particles = []
        this.despawnTime = 5
    }

    public setColor(color: number) : ParticleSystem {
        this.color = color
        return this
    }

    public setDirection(direction: Vector4) : ParticleSystem {
        this.direction = direction
        return this
    }

    public setRotation(rotation: Vector3) : ParticleSystem {
        return this.setRotationBounds(rotation, rotation)
    }
    public setRotationBounds(rotationStart: Vector3, rotationEnd: Vector3) {
        this.rotation = [rotationStart, rotationEnd]
        return this
    }

    public setSpawn(spawn: Vector3) {
        return this.setSpawnBounds(spawn, this.spawn[1])
    }
    public setSpawnBounds(spawnPosition: Vector3, spawnRadius: number) : ParticleSystem {
        this.spawn = [spawnPosition, spawnRadius]
        return this
    }

    public setDespawnTime(time: number) : ParticleSystem {
        this.despawnTime = time
        return this
    }

    public setOpacity(opacity: number, opacityTime : number = 0) {
        this.opacity = opacity
        this.opacityTime = opacityTime
        return this
    }

    public traverse(func: TraverseParticle) {
        for (let i = this.particles.length-1; i >= 0; i--) {
            func(this.particles[i])
        }
    }

    public spawnParticles(amount: number) {
        const possibleAmount = ParticleSystem.MAX_COUNT - this.particles.length - amount
        if (possibleAmount < 0) 
            return
        for (let i = 0; i < amount; i++) {
            const geometry = this.geometry()
            const material = new MeshBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0,
            })
            const sphere = new Mesh(geometry, material)
            sphere.rotation.set(randFloat(this.rotation[0].x, this.rotation[1].x), randFloat(this.rotation[0].y, this.rotation[1].y), randFloat(this.rotation[0].z, this.rotation[1].z))
            const radius = randFloat(0, this.spawn[1])
            const random = new Vector3(randFloat(-1,1), randFloat(-1,1), randFloat(-1,1)).normalize().multiply(new Vector3(radius, radius, radius))
            sphere.position.set(this.spawn[0].x + random.x, this.spawn[0].y + random.y, this.spawn[0].z + random.z)

            this.scene.add(sphere)

            const particle = new Particle(sphere)
            this.particles.push(particle)
        }
    }

    public update(delta: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i]
            particle.timeElapsed += delta

            if (particle.timeElapsed > this.despawnTime) {
                this.scene.remove(particle.getMesh())
                this.particles.splice(i, 1)
            } else {
                const acceleration = new Vector3(randFloat(this.direction.x - this.direction.w, this.direction.x + this.direction.w), randFloat(this.direction.y - this.direction.w, this.direction.y + this.direction.w), randFloat(this.direction.z - this.direction.w, this.direction.z + this.direction.w))
                particle.velocity.add(new Vector3(acceleration.x * (1/2) * delta, acceleration.y * (1/2) * delta, acceleration.z * (1/2) * delta))
                particle.getMesh().position.add(new Vector3(particle.velocity.x * delta, particle.velocity.y * delta, particle.velocity.z * delta))
                
                const material = particle.getMesh().material as MeshBasicMaterial
                material.opacity = this.opacity
                if (particle.timeElapsed <= this.opacityTime) {
                    const ratio = particle.timeElapsed / this.opacityTime
                    material.opacity = ratio * this.opacity
                } else if (this.despawnTime - particle.timeElapsed <= this.opacityTime) {
                    const ratio = (this.despawnTime - particle.timeElapsed) / this.opacityTime
                    material.opacity = ratio * this.opacity
                }
            }
        }
    }
}

class Particle {

    public timeElapsed: number
    public velocity: Vector3
    
    private mesh: Mesh

    public constructor(mesh: Mesh) {
        this.timeElapsed = 0
        this.mesh = mesh
        this.velocity = new Vector3(0,0,0)
    }

    public getMesh() : Mesh {
        return this.mesh
    }
}