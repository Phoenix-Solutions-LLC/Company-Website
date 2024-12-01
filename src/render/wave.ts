import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";

export class WaveSystem {

    private mesh: Mesh
    private speed: number
    private positions: number[]
    private waves: [number, number, number][]

    public constructor(speed:number, width: number, height: number, segments: number = width, color: number = 0x000000) {
        const geometry = new PlaneGeometry(width, height, segments)
        const material = new MeshBasicMaterial({color: color})
        this.mesh = new Mesh(geometry, material)
        this.speed = speed
        this.positions = []
        for (let i = 0; i < segments + 1; i++) {
            this.positions.push(0)
        }
        this.waves = []
    }

    public getMesh() {
        return this.mesh
    }

    public pushWave(index: number, height: number) {
        if (this.positions[index] < height)
            this.positions[index] = height
        this.waves.push([index, height, 1])
        this.waves.push([index, height, -1])
        this.build()
    }

    public set(index: number, height: number) {
        this.positions[index] = height
    }

    public build() {
        for (let i = 0; i < this.positions.length; i++) {
            this.setHeight(i, this.positions[i])
        }
    }

    private timeElapsedSinceUpdate: number = 0
    public update(delta: number) {
        this.timeElapsedSinceUpdate += delta

        if (this.timeElapsedSinceUpdate > this.speed) {
            this.timeElapsedSinceUpdate = 0

            for (let i = 0; i < this.positions.length; i++) {
                this.positions[i] -= 20*delta/(this.positions[i]+0.001)
                if (this.positions[i] < 0)
                    this.positions[i] = 0
            }

            for (let i = this.waves.length - 1; i >= 0; i--) {
                const proj = this.waves[i][0] + this.waves[i][2]

                if (this.positions[proj] < this.waves[i][1]) {
                    this.positions[proj] = this.waves[i][1]
                }

                this.waves[i][0] = proj

                if (proj < 0 || proj > this.positions.length-1) 
                    this.waves.splice(i, 1)
            }

            this.build()
        }
    }

    private setHeight(index: number, height: number) {
        const position = this.mesh.geometry.attributes.position;
        const array = position.array as Float32Array;

        const yIndex = index * 3 + 1;

        if (yIndex < 0 || yIndex >= array.length) {
            return;
        }

        array[yIndex] = height
        position.needsUpdate = true
    }
}