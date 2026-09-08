/* =========================================================
   SOLDIER MODEL
   5V5 TACTICAL FPS

   Medium-poly tactical soldier.

   Responsibilities:
   - Soldier visual body
   - Team appearance
   - Weapon socket
   - Hand sockets
   - Basic movement animation
   - Weapon firing animation
   - Visibility / respawn

   Weapon direction:
   - Soldier forward = -Z
   - Rifle forward = -Z
========================================================= */

import * as THREE from "three";

import { Weapon }
from "./weapon.js";


export class SoldierModel {
  
  constructor(
    engine,
    options = {}
  ) {
    
    this.engine =
      engine;
    
    this.team =
      options.team ||
      "blue";
    
    this.name =
      options.name ||
      "SOLDIER";
    
    this.scale =
      options.scale ||
      1;
    
    
    /* =================================================
       ROOT
    ================================================= */
    
    this.root =
      new THREE.Group();
    
    this.root.name =
      this.name;
    
    
    this.root.scale.setScalar(
      this.scale
    );
    
    
    /* =================================================
       STATE
    ================================================= */
    
    this.walkTime =
      Math.random() *
      Math.PI * 2;
    
    this.walkAmount =
      0;
    
    this.fireRecoil =
      0;
    
    this.fireTimer =
      0;
    
    
    /* =================================================
       PART REFERENCES
    ================================================= */
    
    this.parts = {
      
      head: null,
      
      helmet: null,
      
      body: null,
      
      weapon: null,
      
      weaponSocket: null,
      
      leftHand: null,
      
      rightHand: null,
      
      leftArm: null,
      
      rightArm: null,
      
      leftLeg: null,
      
      rightLeg: null
      
    };
    
    
    /* =================================================
       MATERIALS
    ================================================= */
    
    this.createMaterials();
    
    
    /* =================================================
       MODEL
    ================================================= */
    
    this.createModel();
    
    
    /* =================================================
       WEAPON
    ================================================= */
    
    this.attachWeapon();
    
    
    /* =================================================
       SHADOWS
    ================================================= */
    
    this.root.traverse(
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
    
  }
  
  
  /* =====================================================
     MATERIALS
  ===================================================== */
  
  createMaterials() {
    
    const blue =
      this.team === "blue";
    
    
    this.materials = {
      
      skin: new THREE.MeshStandardMaterial({
        
        color: 0x8b5a3c,
        
        roughness: 0.9
        
      }),
      
      
      uniform: new THREE.MeshStandardMaterial({
        
        color: blue ?
          0x263b4d :
          0x4b292d,
        
        roughness: 0.88
        
      }),
      
      
      armor: new THREE.MeshStandardMaterial({
        
        color: blue ?
          0x172533 :
          0x32191d,
        
        roughness: 0.72,
        
        metalness: 0.15
        
      }),
      
      
      helmet: new THREE.MeshStandardMaterial({
        
        color: blue ?
          0x1d3040 :
          0x3a1d21,
        
        roughness: 0.7,
        
        metalness: 0.2
        
      }),
      
      
      dark: new THREE.MeshStandardMaterial({
        
        color: 0x111416,
        
        roughness: 0.8,
        
        metalness: 0.25
        
      }),
      
      
      boot: new THREE.MeshStandardMaterial({
        
        color: 0x101214,
        
        roughness: 0.95
        
      }),
      
      
      glass: new THREE.MeshStandardMaterial({
        
        color: blue ?
          0x3979a8 :
          0x9c3035,
        
        emissive: blue ?
          0x07141e :
          0x1a0507,
        
        roughness: 0.3,
        
        metalness: 0.2
        
      })
      
    };
    
  }
  
  
  /* =====================================================
     CREATE MODEL
  ===================================================== */
  
  createModel() {
    
    this.createLegs();
    
    this.createTorso();
    
    this.createHead();
    
    this.createArms();
    
    this.createEquipment();
    
  }
  
  
  /* =====================================================
     LEGS
  ===================================================== */
  
  createLegs() {
    
    /* LEFT LEG */
    
    const leftLeg =
      new THREE.Group();
    
    leftLeg.name =
      "leftLeg";
    
    
    leftLeg.position.set(
      -0.19,
      0.78,
      0
    );
    
    
    const leftThigh =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.14,
          0.48,
          4,
          8
        ),
        this.materials.uniform
      );
    
    
    leftThigh.position.y = -0.15;
    
    
    leftLeg.add(
      leftThigh
    );
    
    
    const leftBoot =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.22,
          0.18,
          0.42
        ),
        this.materials.boot
      );
    
    
    leftBoot.position.set(
      0,
      -0.56,
      -0.08
    );
    
    
    leftLeg.add(
      leftBoot
    );
    
    
    this.root.add(
      leftLeg
    );
    
    
    /* RIGHT LEG */
    
    const rightLeg =
      new THREE.Group();
    
    rightLeg.name =
      "rightLeg";
    
    
    rightLeg.position.set(
      0.19,
      0.78,
      0
    );
    
    
    const rightThigh =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.14,
          0.48,
          4,
          8
        ),
        this.materials.uniform
      );
    
    
    rightThigh.position.y = -0.15;
    
    
    rightLeg.add(
      rightThigh
    );
    
    
    const rightBoot =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.22,
          0.18,
          0.42
        ),
        this.materials.boot
      );
    
    
    rightBoot.position.set(
      0,
      -0.56,
      -0.08
    );
    
    
    rightLeg.add(
      rightBoot
    );
    
    
    this.root.add(
      rightLeg
    );
    
    
    this.parts.leftLeg =
      leftLeg;
    
    this.parts.rightLeg =
      rightLeg;
    
  }
  
  
  /* =====================================================
     TORSO
  ===================================================== */
  
  createTorso() {
    
    this.torso =
      new THREE.Group();
    
    this.torso.position.y =
      1.35;
    
    
    /* BODY */
    
    const body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.37,
          0.62,
          5,
          10
        ),
        this.materials.uniform
      );
    
    
    body.scale.set(
      1,
      1,
      0.68
    );
    
    
    body.castShadow =
      true;
    
    
    this.torso.add(
      body
    );
    
    
    this.parts.body =
      body;
    
    
    /* CHEST PLATE */
    
    const chest =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.61,
          0.55,
          0.22
        ),
        this.materials.armor
      );
    
    
    chest.position.set(
      0,
      0.02,
      -0.25
    );
    
    
    chest.rotation.x =
      0.03;
    
    
    this.torso.add(
      chest
    );
    
    
    /* LOWER ARMOR */
    
    const lowerArmor =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.55,
          0.18,
          0.2
        ),
        this.materials.armor
      );
    
    
    lowerArmor.position.set(
      0,
      -0.28,
      -0.2
    );
    
    
    this.torso.add(
      lowerArmor
    );
    
    
    this.root.add(
      this.torso
    );
    
  }
  
  
  /* =====================================================
     HEAD
  ===================================================== */
  
  createHead() {
    
    const headGroup =
      new THREE.Group();
    
    
    headGroup.position.y =
      1.98;
    
    
    /* NECK */
    
    const neck =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12,
          0.14,
          0.18,
          8
        ),
        this.materials.skin
      );
    
    
    neck.position.y = -0.12;
    
    
    headGroup.add(
      neck
    );
    
    
    /* HEAD */
    
    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.25,
          12,
          10
        ),
        this.materials.skin
      );
    
    
    head.scale.set(
      0.9,
      1.1,
      0.9
    );
    
    
    head.position.y =
      0.04;
    
    
    head.userData.part =
      "head";
    
    
    headGroup.add(
      head
    );
    
    
    this.parts.head =
      head;
    
    
    /* =================================================
       HELMET
    ================================================= */
    
    const helmet =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.29,
          12,
          8,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.6
        ),
        this.materials.helmet
      );
    
    
    helmet.position.y =
      0.12;
    
    
    helmet.scale.set(
      1,
      0.75,
      1
    );
    
    
    headGroup.add(
      helmet
    );
    
    
    this.parts.helmet =
      helmet;
    
    
    /* HELMET FRONT */
    
    const helmetFront =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.42,
          0.06,
          0.14
        ),
        this.materials.helmet
      );
    
    
    helmetFront.position.set(
      0,
      0.08,
      -0.25
    );
    
    
    headGroup.add(
      helmetFront
    );
    
    
    /* VISOR / GOGGLES */
    
    const goggles =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.36,
          0.09,
          0.08
        ),
        this.materials.glass
      );
    
    
    goggles.position.set(
      0,
      0.01,
      -0.245
    );
    
    
    headGroup.add(
      goggles
    );
    
    
    this.root.add(
      headGroup
    );
    
  }
  
  
  /* =====================================================
     ARMS
  ===================================================== */
  
  createArms() {
    
    /* =================================================
       LEFT ARM
    ================================================= */
    
    const leftArm =
      new THREE.Group();
    
    
    leftArm.name =
      "leftArm";
    
    
    leftArm.position.set(
      -0.39,
      1.55,
      -0.04
    );
    
    
    const leftUpper =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.105,
          0.38,
          4,
          7
        ),
        this.materials.uniform
      );
    
    
    leftUpper.rotation.z = -0.15;
    
    
    leftArm.add(
      leftUpper
    );
    
    
    const leftForearm =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.09,
          0.32,
          4,
          7
        ),
        this.materials.uniform
      );
    
    
    leftForearm.position.set(
      -0.02,
      -0.32,
      -0.16
    );
    
    
    leftForearm.rotation.x = -0.45;
    
    
    leftArm.add(
      leftForearm
    );
    
    
    const leftHand =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.095,
          8,
          6
        ),
        this.materials.skin
      );
    
    
    leftHand.position.set(
      -0.03,
      -0.53,
      -0.28
    );
    
    
    leftArm.add(
      leftHand
    );
    
    
    this.root.add(
      leftArm
    );
    
    
    this.parts.leftArm =
      leftArm;
    
    this.parts.leftHand =
      leftHand;
    
    
    /* =================================================
       RIGHT ARM
    ================================================= */
    
    const rightArm =
      new THREE.Group();
    
    
    rightArm.name =
      "rightArm";
    
    
    rightArm.position.set(
      0.39,
      1.55,
      -0.04
    );
    
    
    const rightUpper =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.105,
          0.38,
          4,
          7
        ),
        this.materials.uniform
      );
    
    
    rightUpper.rotation.z =
      0.15;
    
    
    rightArm.add(
      rightUpper
    );
    
    
    const rightForearm =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.09,
          0.32,
          4,
          7
        ),
        this.materials.uniform
      );
    
    
    rightForearm.position.set(
      0.02,
      -0.32,
      -0.16
    );
    
    
    rightForearm.rotation.x = -0.45;
    
    
    rightArm.add(
      rightForearm
    );
    
    
    const rightHand =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.095,
          8,
          6
        ),
        this.materials.skin
      );
    
    
    rightHand.position.set(
      0.03,
      -0.53,
      -0.28
    );
    
    
    rightArm.add(
      rightHand
    );
    
    
    this.root.add(
      rightArm
    );
    
    
    this.parts.rightArm =
      rightArm;
    
    this.parts.rightHand =
      rightHand;
    
  }
  
  
  /* =====================================================
     EQUIPMENT
  ===================================================== */
  
  createEquipment() {
    
    /* SHOULDER PADS */
    
    const leftShoulder =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.16,
          8,
          6
        ),
        this.materials.armor
      );
    
    
    leftShoulder.position.set(
      -0.41,
      1.57,
      0
    );
    
    
    leftShoulder.scale.y =
      0.65;
    
    
    this.root.add(
      leftShoulder
    );
    
    
    const rightShoulder =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.16,
          8,
          6
        ),
        this.materials.armor
      );
    
    
    rightShoulder.position.set(
      0.41,
      1.57,
      0
    );
    
    
    rightShoulder.scale.y =
      0.65;
    
    
    this.root.add(
      rightShoulder
    );
    
    
    /* =================================================
       TACTICAL POUCHES
    ================================================= */
    
    for (
      let i = -1; i <= 1; i++
    ) {
      
      const pouch =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.13,
            0.16,
            0.1
          ),
          this.materials.dark
        );
      
      
      pouch.position.set(
        i * 0.16,
        1.18,
        -0.32
      );
      
      
      this.root.add(
        pouch
      );
      
    }
    
    
    /* RADIO */
    
    const radio =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.13,
          0.23,
          0.08
        ),
        this.materials.dark
      );
    
    
    radio.position.set(
      0.3,
      1.35,
      0.12
    );
    
    
    this.root.add(
      radio
    );
    
    
    /* ANTENNA */
    
    const antenna =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.012,
          0.012,
          0.28,
          6
        ),
        this.materials.dark
      );
    
    
    antenna.position.set(
      0.3,
      1.6,
      0.12
    );
    
    
    antenna.rotation.z = -0.15;
    
    
    this.root.add(
      antenna
    );
    
  }
  
  
  /* =====================================================
     WEAPON SOCKET
     
     The rifle attaches here.

     IMPORTANT:
     Soldier forward = -Z
     Rifle forward = -Z
  ===================================================== */
  
  createWeaponSocket() {
    
    const socket =
      new THREE.Object3D();
    
    
    socket.name =
      "weaponSocket";
    
    
    /*
     * Rifle sits in front
     * of the soldier's chest.
     */
    
    socket.position.set(
      0.16,
      1.35,
      -0.42
    );
    
    
    /*
     * Rifle is already built
     * facing -Z.
     */
    
    socket.rotation.set(
      0,
      0,
      0
    );
    
    
    this.root.add(
      socket
    );
    
    
    this.parts.weaponSocket =
      socket;
    
  }
  
  
  /* =====================================================
     ATTACH WEAPON
  ===================================================== */
  
  attachWeapon() {
    
    this.createWeaponSocket();
    
    
    /*
     * Weapon system creates
     * the actual rifle.
     */
    
    this.weaponSystem =
      this.engine.weapon ||
      new Weapon(
        this.engine,
        null,
        null
      );
    
    
    /*
     * Make engine reference
     * available for future AI.
     */
    
    if (
      !this.engine.weapon
    ) {
      
      this.engine.weapon =
        this.weaponSystem;
      
    }
    
    
    this.parts.weapon =
      this.weaponSystem.attachAIWeapon(
        this,
        this.team
      );
    
    
    /*
     * Keep the rifle aimed
     * along soldier forward.
     */
    
    if (
      this.parts.weapon
    ) {
      
      this.parts.weapon.rotation.set(
        0,
        0,
        0
      );
      
    }
    
  }
  
  
  /* =====================================================
     MOVEMENT
  ===================================================== */
  
  setMovement(
    amount
  ) {
    
    this.walkAmount =
      THREE.MathUtils.clamp(
        amount,
        0,
        1
      );
    
  }
  
  
  /* =====================================================
     ROTATION
  ===================================================== */
  
  setRotation(
    x,
    y,
    z
  ) {
    
    this.root.rotation.set(
      x,
      y,
      z
    );
    
  }
  
  
  /* =====================================================
     UPDATE ANIMATION
  ===================================================== */
  
  update(
    delta
  ) {
    
    /*
     * Walking animation.
     */
    
    if (
      this.walkAmount >
      0
    ) {
      
      this.walkTime +=
        delta *
        7;
      
    }
    
    
    const swing =
      Math.sin(
        this.walkTime
      ) *
      0.45 *
      this.walkAmount;
    
    
    /* LEGS */
    
    if (
      this.parts.leftLeg
    ) {
      
      this.parts.leftLeg.rotation.x =
        swing;
      
    }
    
    
    if (
      this.parts.rightLeg
    ) {
      
      this.parts.rightLeg.rotation.x = -swing;
      
    }
    
    
    /*
     * Arms stay mostly forward
     * because the soldier is
     * holding the rifle.
     */
    
    if (
      this.parts.leftArm
    ) {
      
      this.parts.leftArm.rotation.x = -0.15 +
        swing * 0.12;
      
    }
    
    
    if (
      this.parts.rightArm
    ) {
      
      this.parts.rightArm.rotation.x = -0.15 -
        swing * 0.12;
      
    }
    
    
    /* =================================================
       WEAPON RECOIL
    ================================================= */
    
    if (
      this.fireTimer >
      0
    ) {
      
      this.fireTimer -=
        delta;
      
      this.fireRecoil =
        THREE.MathUtils.lerp(
          this.fireRecoil,
          0,
          delta * 16
        );
      
    }
    
    
    if (
      this.parts.weapon
    ) {
      
      this.parts.weapon.position.z = -this.fireRecoil;
      
    }
    
  }
  
  
  /* =====================================================
     FIRE
  ===================================================== */
  
  fire() {
    
    this.fireRecoil =
      0.045;
    
    this.fireTimer =
      0.12;
    
    /*
     * Future:
     * muzzle flash
     * shell ejection
     * firing sound
     * smoke
     */
    
  }
  
  
  /* =====================================================
     VISIBILITY
  ===================================================== */
  
  setVisible(
    visible
  ) {
    
    this.root.visible =
      visible;
    
  }
  
  
  /* =====================================================
     RESPAWN
  ===================================================== */
  
  respawn(
    x,
    y,
    z
  ) {
    
    this.root.position.set(
      x,
      y,
      z
    );
    
    
    this.root.rotation.set(
      0,
      0,
      0
    );
    
    
    this.walkAmount =
      0;
    
    
    this.fireRecoil =
      0;
    
    
    this.fireTimer =
      0;
    
  }
  
  
  /* =====================================================
     DESTROY
  ===================================================== */
  
  destroy() {
    
    if (
      this.root.parent
    ) {
      
      this.root.parent.remove(
        this.root
      );
      
    }
    
    
    this.root.traverse(
      object => {
        
        if (
          object.geometry
        ) {
          
          object.geometry.dispose();
          
        }
        
        
        if (
          object.material
        ) {
          
          if (
            Array.isArray(
              object.material
            )
          ) {
            
            for (
              const material of
                object.material
            ) {
              
              material.dispose();
              
            }
            
          } else {
            
            object.material.dispose();
            
          }
          
        }
        
      }
    );
    
  }
  
}