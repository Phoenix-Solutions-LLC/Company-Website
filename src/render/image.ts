import { Euler, FrontSide, Mesh, MeshPhongMaterial, TextureLoader, Vector3 } from "three";
import { DecalGeometry, RoundedBoxGeometry } from "three/examples/jsm/Addons.js";

export async function createMeshFromImage(image: string, depth: number, backface: string | undefined = undefined, color: number = 0xffffff): Promise<Mesh> {
    const { width, height } = await loadImageData(image)
    
    const geometry = new RoundedBoxGeometry(width, height, depth, 12, depth)
    const material = new MeshPhongMaterial({
        color: color
    })
    const mesh = new Mesh(geometry, material)

    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(image);

    const decalMaterial = new MeshPhongMaterial({
        map: texture,
        depthWrite: false,
        transparent: true,
        emissive: 0x0,
        side: FrontSide,
        polygonOffset: true,
        polygonOffsetUnits: -10,
        polygonOffsetFactor: -1,
    });
    const decalPosition = new Vector3(0, 0, depth / 2);
    const decalRotation = new Euler(0, 0, 0);
    const decalSize = new Vector3(width, height, 0.1);
    const decalGeometry = new DecalGeometry(mesh, decalPosition, decalRotation, decalSize)
    const decal = new Mesh(decalGeometry, decalMaterial)

    if (backface) {
        const backfaceDecalMaterial = new MeshPhongMaterial({
            map: texture,
            depthWrite: false,
            transparent: true,
            emissive: 0x0,
            side: FrontSide,
            polygonOffset: true,
            polygonOffsetUnits: -10,
            polygonOffsetFactor: -1,
        });
        const backfaceDecalPosition = new Vector3(0, 0, -depth / 2);
        const backfaceDecalRotation = new Euler(0, 0, 0);
        const backfaceDecalSize = new Vector3(width, height, 0.1);
        const backfaceDecalGeometry = new DecalGeometry(mesh, backfaceDecalPosition, backfaceDecalRotation, backfaceDecalSize)
        const backfaceDecal = new Mesh(backfaceDecalGeometry, backfaceDecalMaterial)
        
        mesh.add(backfaceDecal)
    }

    mesh.add(decal)

    return mesh
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