/* =========================================================
   ASSET LOADER
   5V5 TACTICAL FPS

   Central asset/model factory.

   Currently creates procedural medium-poly assets so the
   game does not depend on external OBJ/MTL files.

   AssetLoader is responsible for creating:
   - AI weapons
   - future soldier assets
   - future vehicles
   - future environment assets
========================================================= */

import * as THREE from "three";


export class AssetLoader {
  
  constructor(engine) {
    
    this.engine =
      engine;
    
    this.weaponCache =
      new Map();
    
  }
  
  
  /* =====================================================
     CREATE AI RIFLE
  ===================================================== */
  
  createAIRifle(options = {}) {
    
    const type =
      options.type ||
      "ar15";
    
    
    /*
     * Keep one reusable weapon
     * definition.
     */
    
    if (
      this.weaponCache.has(type)
    ) {
      
      return this.cloneWeapon(
        this.weaponCache.get(type)
      );
      
    }
    
    
    let weapon;
    
    
    switch (type) {
      
      case "ar15":
        
        weapon =
          this.createAR15();
        
        break;
        
        
      default:
        
        weapon =
          this.createAR15();
        
        break;
        
    }
    
    
    /*
     * Store source model.
     */
    
    this.weaponCache.set(
      type,
      weapon
    );
    
    
    return this.cloneWeapon(
      weapon
    );
    
  }
  
  
  /* =====================================================
     AR-15 STYLE GAME RIFLE
     
     Medium-poly fictional/game representation.
  ===================================================== */
  
  createAR15() {
    
    const root =
      new THREE.Group();
    
    
    root.name =
      "AI_AR15";
    
    
    /* =================================================
       MATERIALS
    ================================================= */
    
    const receiverMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x242629,
        
        roughness: 0.58,
        
        metalness: 0.72
        
      });
    
    
    const darkMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x111315,
        
        roughness: 0.72,
        
        metalness: 0.35
        
      });
    
    
    const polymerMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x171918,
        
        roughness: 0.9,
        
        metalness: 0.05
        
      });
    
    
    const metalMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x34373a,
        
        roughness: 0.42,
        
        metalness: 0.85
        
      });
    
    
    /* =================================================
       RECEIVER
    ================================================= */
    
    const receiver =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.25,
          0.72
        ),
        receiverMaterial
      );
    
    
    receiver.position.z =
      0;
    
    
    receiver.castShadow =
      true;
    
    
    root.add(
      receiver
    );
    
    
    /* =================================================
       UPPER RECEIVER
    ================================================= */
    
    const upper =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.17,
          0.13,
          0.72
        ),
        metalMaterial
      );
    
    
    upper.position.y =
      0.12;
    
    
    upper.castShadow =
      true;
    
    
    root.add(
      upper
    );
    
    
    /* =================================================
       BARREL
       
       Forward direction is -Z.
    ================================================= */
    
    const barrel =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.045,
          0.055,
          0.92,
          8
        ),
        metalMaterial
      );
    
    
    barrel.rotation.x =
      Math.PI / 2;
    
    
    barrel.position.z = -0.76;
    
    
    barrel.castShadow =
      true;
    
    
    root.add(
      barrel
    );
    
    
    /* =================================================
       MUZZLE
    ================================================= */
    
    const muzzle =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.065,
          0.065,
          0.13,
          8
        ),
        darkMaterial
      );
    
    
    muzzle.rotation.x =
      Math.PI / 2;
    
    
    muzzle.position.z = -1.22;
    
    
    muzzle.castShadow =
      true;
    
    
    root.add(
      muzzle
    );
    
    
    /* =================================================
       HANDGUARD
    ================================================= */
    
    const handguard =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.16,
          0.18,
          0.7
        ),
        polymerMaterial
      );
    
    
    handguard.position.z = -0.65;
    
    
    handguard.position.y =
      0.02;
    
    
    handguard.castShadow =
      true;
    
    
    root.add(
      handguard
    );
    
    
    /* =================================================
       MAGAZINE
    ================================================= */
    
    const magazine =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.13,
          0.38,
          0.19
        ),
        polymerMaterial
      );
    
    
    magazine.position.y = -0.27;
    
    
    magazine.position.z = -0.03;
    
    
    magazine.rotation.x = -0.12;
    
    
    magazine.castShadow =
      true;
    
    
    root.add(
      magazine
    );
    
    
    /* =================================================
       MAGAZINE WELL
    ================================================= */
    
    const magWell =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.15,
          0.15,
          0.2
        ),
        darkMaterial
      );
    
    
    magWell.position.y = -0.13;
    
    
    magWell.position.z = -0.02;
    
    
    root.add(
      magWell
    );
    
    
    /* =================================================
       TRIGGER GUARD
    ================================================= */
    
    const triggerGuard =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          0.065,
          0.018,
          6,
          10,
          Math.PI
        ),
        darkMaterial
      );
    
    
    triggerGuard.rotation.x =
      Math.PI / 2;
    
    
    triggerGuard.position.y = -0.13;
    
    
    triggerGuard.position.z =
      0.18;
    
    
    root.add(
      triggerGuard
    );
    
    
    /* =================================================
       GRIP
    ================================================= */
    
    const grip =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.15,
          0.38,
          0.18
        ),
        polymerMaterial
      );
    
    
    grip.position.y = -0.28;
    
    
    grip.position.z =
      0.24;
    
    
    grip.rotation.x = -0.2;
    
    
    grip.castShadow =
      true;
    
    
    root.add(
      grip
    );
    
    
    /* =================================================
       STOCK
    ================================================= */
    
    const stock =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.2,
          0.18,
          0.52
        ),
        polymerMaterial
      );
    
    
    stock.position.z =
      0.58;
    
    
    stock.position.y =
      0.02;
    
    
    stock.castShadow =
      true;
    
    
    root.add(
      stock
    );
    
    
    /* =================================================
       STOCK END
    ================================================= */
    
    const stockEnd =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.23,
          0.2,
          0.08
        ),
        darkMaterial
      );
    
    
    stockEnd.position.z =
      0.86;
    
    
    stockEnd.position.y =
      0.02;
    
    
    root.add(
      stockEnd
    );
    
    
    /* =================================================
       FRONT SIGHT
    ================================================= */
    
    const frontSight =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.045,
          0.12,
          0.045
        ),
        metalMaterial
      );
    
    
    frontSight.position.y =
      0.15;
    
    
    frontSight.position.z = -0.98;
    
    
    root.add(
      frontSight
    );
    
    
    /* =================================================
       REAR SIGHT
    ================================================= */
    
    const rearSight =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.07,
          0.08,
          0.08
        ),
        darkMaterial
      );
    
    
    rearSight.position.y =
      0.18;
    
    
    rearSight.position.z =
      0.22;
    
    
    root.add(
      rearSight
    );
    
    
    /* =================================================
       RAIL
    ================================================= */
    
    const rail =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.08,
          0.035,
          0.55
        ),
        darkMaterial
      );
    
    
    rail.position.y =
      0.2;
    
    
    rail.position.z = -0.2;
    
    
    root.add(
      rail
    );
    
    
    /* =================================================
       MUZZLE SOCKET
    ================================================= */
    
    const muzzleSocket =
      new THREE.Object3D();
    
    
    muzzleSocket.position.set(
      0,
      0,
      -1.3
    );
    
    
    muzzleSocket.name =
      "muzzleSocket";
    
    
    root.add(
      muzzleSocket
    );
    
    
    /* =================================================
       HAND SOCKETS
    ================================================= */
    
    const rearHandSocket =
      new THREE.Object3D();
    
    
    rearHandSocket.position.set(
      0,
      -0.12,
      0.15
    );
    
    
    rearHandSocket.name =
      "rearHandSocket";
    
    
    root.add(
      rearHandSocket
    );
    
    
    const frontHandSocket =
      new THREE.Object3D();
    
    
    frontHandSocket.position.set(
      0,
      -0.02,
      -0.58
    );
    
    
    frontHandSocket.name =
      "frontHandSocket";
    
    
    root.add(
      frontHandSocket
    );
    
    
    /* =================================================
       METADATA
    ================================================= */
    
    root.userData.assetType =
      "weapon";
    
    
    root.userData.weaponType =
      "ar15";
    
    
    root.userData.forward =
      "-Z";
    
    
    root.userData.muzzle =
      muzzleSocket;
    
    
    root.userData.rearHand =
      rearHandSocket;
    
    
    root.userData.frontHand =
      frontHandSocket;
    
    
    /*
     * Mark meshes.
     */
    
    root.traverse(
      object => {
        
        if (
          object.isMesh
        ) {
          
          object.castShadow =
            true;
          
          object.receiveShadow =
            true;
          
        }
        
      }
    );
    
    
    return root;
    
  }
  
  
  /* =====================================================
     CLONE WEAPON
  ===================================================== */
  
  cloneWeapon(
    source
  ) {
    
    const clone =
      source.clone(
        true
      );
    
    
    /*
     * Clone materials so
     * individual weapon effects
     * don't affect every rifle.
     */
    
    clone.traverse(
      object => {
        
        if (
          object.isMesh &&
          object.material
        ) {
          
          object.material =
            object.material.clone();
          
        }
        
      }
    );
    
    
    return clone;
    
  }
  
}