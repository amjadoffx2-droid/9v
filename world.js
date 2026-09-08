import * as THREE from "three";

export class World {
  
  constructor(engine) {
    
    this.engine = engine;
    
    this.scene =
      engine.scene;
    
    this.root =
      new THREE.Group();
    
    this.scene.add(
      this.root
    );
    
    
    /* =================================================
       COLLIDERS
       
       BUGFIX: nothing in the game
       ever collided with walls or
       cover before this. Players
       and bots could walk (and
       shoot) straight through solid
       geometry.
       
       Every wall/cover box below
       registers its footprint here
       as a simple XZ rectangle.
       Ground, road, and the flat
       spawn pad decals are NOT
       collidable.
    ================================================= */
    
    this.colliders =
      [];
    
    
    this.build();
    
  }
  
  build() {
    
    this.createGround();
    
    this.createWalls();
    
    this.createCover();
    
    this.createSpawns();
    
  }
  
  createGround() {
    
    const geometry =
      new THREE.PlaneGeometry(
        110,
        110
      );
    
    const material =
      new THREE.MeshStandardMaterial({
        color: 0x55585b,
        roughness: 0.9
      });
    
    const ground =
      new THREE.Mesh(
        geometry,
        material
      );
    
    ground.rotation.x = -Math.PI / 2;
    
    ground.receiveShadow = true;
    
    this.root.add(
      ground
    );
    
    /* ROAD */
    
    const roadGeometry =
      new THREE.PlaneGeometry(
        18,
        110
      );
    
    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x292b2e,
        roughness: 1
      });
    
    const road =
      new THREE.Mesh(
        roadGeometry,
        roadMaterial
      );
    
    road.rotation.x = -Math.PI / 2;
    
    road.position.y =
      0.01;
    
    this.root.add(
      road
    );
    
  }
  
  createWalls() {
    
    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x6c7073,
        roughness: 0.8
      });
    
    this.createBox(
      110,
      5,
      1,
      0,
      2.5,
      -55,
      wallMaterial
    );
    
    this.createBox(
      110,
      5,
      1,
      0,
      2.5,
      55,
      wallMaterial
    );
    
    this.createBox(
      1,
      5,
      110,
      -55,
      2.5,
      0,
      wallMaterial
    );
    
    this.createBox(
      1,
      5,
      110,
      55,
      2.5,
      0,
      wallMaterial
    );
    
  }
  
  createCover() {
    
    const coverMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x8a8a82,
        roughness: 0.85
      });
    
    /* CENTER COVER */
    
    this.createBox(
      10,
      2.2,
      3,
      0,
      1.1,
      0,
      coverMaterial
    );
    
    /* NORTH COVER */
    
    this.createBox(
      4,
      2,
      8,
      -16,
      1,
      -20,
      coverMaterial
    );
    
    this.createBox(
      4,
      2,
      8,
      16,
      1,
      -20,
      coverMaterial
    );
    
    /* SOUTH COVER */
    
    this.createBox(
      4,
      2,
      8,
      -16,
      1,
      20,
      coverMaterial
    );
    
    this.createBox(
      4,
      2,
      8,
      16,
      1,
      20,
      coverMaterial
    );
    
    /* SIDE BARRIERS */
    
    this.createBox(
      3,
      2.5,
      16,
      -28,
      1.25,
      0,
      coverMaterial
    );
    
    this.createBox(
      3,
      2.5,
      16,
      28,
      1.25,
      0,
      coverMaterial
    );
    
  }
  
  createSpawns() {
    
    const redMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xaa2222
      });
    
    const blueMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x2255aa
      });
    
    this.createBox(
      18,
      0.15,
      8,
      0,
      0.08,
      -44,
      redMaterial,
      false
    );
    
    this.createBox(
      18,
      0.15,
      8,
      0,
      0.08,
      44,
      blueMaterial,
      false
    );
    
  }
  
  createBox(
    width,
    height,
    depth,
    x,
    y,
    z,
    material,
    collidable = true
  ) {
    
    const geometry =
      new THREE.BoxGeometry(
        width,
        height,
        depth
      );
    
    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );
    
    mesh.position.set(
      x,
      y,
      z
    );
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.root.add(
      mesh
    );
    
    
    if (
      collidable
    ) {
      
      this.colliders.push(
        {
          minX: x - width / 2,
          maxX: x + width / 2,
          minZ: z - depth / 2,
          maxZ: z + depth / 2
        }
      );
      
    }
    
    
    return mesh;
    
  }
  
  
  /* =====================================================
     COLLISION CHECK
     
     Treats the player/bot as a
     circle of the given radius on
     the XZ plane and tests it
     against every registered wall
     and cover box.
  ===================================================== */
  
  checkCollision(
    x,
    z,
    radius
  ) {
    
    for (
      const box of
        this.colliders
    ) {
      
      const closestX =
        Math.max(
          box.minX,
          Math.min(
            x,
            box.maxX
          )
        );
      
      
      const closestZ =
        Math.max(
          box.minZ,
          Math.min(
            z,
            box.maxZ
          )
        );
      
      
      const dx =
        x -
        closestX;
      
      
      const dz =
        z -
        closestZ;
      
      
      if (
        dx * dx +
        dz * dz <
        radius * radius
      ) {
        
        return true;
        
      }
      
    }
    
    
    return false;
    
  }
  
}