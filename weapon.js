import * as THREE from "three";


export class Weapon {
  
  constructor(
    engine,
    input,
    player
  ) {
    
    this.engine =
      engine;
    
    this.input =
      input;
    
    this.player =
      player;
    
    this.camera =
      engine.camera;
    
    
    /* =================================================
       PLAYER WEAPON DATA
    ================================================= */
    
    this.magazineSize = 30;
    
    this.ammo = 30;
    
    this.reserveAmmo = 120;
    
    this.damage = 25;
    
    this.fireRate = 10;
    
    this.fireInterval =
      1 / this.fireRate;
    
    this.lastShot = 0;
    
    this.reloadTime = 1.6;
    
    this.reloading = false;
    
    this.reloadTimer = 0;
    
    this.recoil = 0;
    
    
    /* =================================================
       PLAYER RAYCASTER
    ================================================= */
    
    this.raycaster =
      new THREE.Raycaster();
    
    
    /* =================================================
       PLAYER WEAPON
    ================================================= */
    
    this.createWeaponModel();
    
    
    /* =================================================
       AI WEAPONS
    ================================================= */
    
    this.aiWeapons = [];
    
  }
  
  
  /* =====================================================
     PLAYER WEAPON
  ===================================================== */
  
  createWeaponModel() {
    
    this.weapon =
      new THREE.Group();
    
    this.weapon.name =
      "PLAYER_AR15";
    
    
    this.weapon.position.set(
      0.38,
      -0.32,
      -0.65
    );
    
    
    this.weapon.rotation.set(
      0,
      0,
      0
    );
    
    
    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x24272a,
        
        roughness: 0.65,
        
        metalness: 0.7
        
      });
    
    
    const darkMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x111214,
        
        roughness: 0.8
        
      });
    
    
    /* =================================================
       RECEIVER
    ================================================= */
    
    const receiver =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.16,
          0.18,
          0.62
        ),
        
        bodyMaterial
        
      );
    
    
    receiver.position.z = -0.05;
    
    
    this.weapon.add(
      receiver
    );
    
    
    /* =================================================
       HANDGUARD
    ================================================= */
    
    const handguard =
      new THREE.Mesh(
        
        new THREE.CylinderGeometry(
          0.075,
          0.075,
          0.48,
          8
        ),
        
        darkMaterial
        
      );
    
    
    handguard.rotation.x =
      Math.PI / 2;
    
    
    handguard.position.z = -0.38;
    
    
    this.weapon.add(
      handguard
    );
    
    
    /* =================================================
       BARREL
    ================================================= */
    
    const barrel =
      new THREE.Mesh(
        
        new THREE.CylinderGeometry(
          0.035,
          0.035,
          0.58,
          8
        ),
        
        darkMaterial
        
      );
    
    
    barrel.rotation.x =
      Math.PI / 2;
    
    
    barrel.position.set(
      0,
      0,
      -0.68
    );
    
    
    this.weapon.add(
      barrel
    );
    
    
    /* =================================================
       MUZZLE DEVICE
    ================================================= */
    
    const muzzle =
      new THREE.Mesh(
        
        new THREE.CylinderGeometry(
          0.045,
          0.04,
          0.12,
          8
        ),
        
        darkMaterial
        
      );
    
    
    muzzle.rotation.x =
      Math.PI / 2;
    
    
    muzzle.position.z = -0.98;
    
    
    this.weapon.add(
      muzzle
    );
    
    
    /* =================================================
       STOCK
    ================================================= */
    
    const stock =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.13,
          0.15,
          0.35
        ),
        
        darkMaterial
        
      );
    
    
    stock.position.set(
      0,
      -0.01,
      0.43
    );
    
    
    this.weapon.add(
      stock
    );
    
    
    /* =================================================
       MAGAZINE
    ================================================= */
    
    const magazine =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.1,
          0.3,
          0.16
        ),
        
        darkMaterial
        
      );
    
    
    magazine.position.set(
      0,
      -0.22,
      0.05
    );
    
    
    magazine.rotation.x = -0.15;
    
    
    this.weapon.add(
      magazine
    );
    
    
    /* =================================================
       FRONT SIGHT
    ================================================= */
    
    const sight =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.035,
          0.08,
          0.06
        ),
        
        darkMaterial
        
      );
    
    
    sight.position.set(
      0,
      0.12,
      -0.43
    );
    
    
    this.weapon.add(
      sight
    );
    
    
    /* =================================================
       REAR SIGHT
    ================================================= */
    
    const rearSight =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.08,
          0.05,
          0.05
        ),
        
        darkMaterial
        
      );
    
    
    rearSight.position.set(
      0,
      0.1,
      0.15
    );
    
    
    this.weapon.add(
      rearSight
    );
    
    
    /* =================================================
       TRIGGER
    ================================================= */
    
    const trigger =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.035,
          0.09,
          0.04
        ),
        
        darkMaterial
        
      );
    
    
    trigger.position.set(
      0,
      -0.08,
      0.19
    );
    
    
    this.weapon.add(
      trigger
    );
    
    
    /* =================================================
       PLAYER MUZZLE FLASH
    ================================================= */
    
    this.createMuzzleFlash();
    
    
    /* =================================================
       CAMERA ATTACHMENT
    ================================================= */
    
    this.camera.add(
      this.weapon
    );
    
  }
  
  
  /* =====================================================
     MUZZLE FLASH
  ===================================================== */
  
  createMuzzleFlash() {
    
    const geometry =
      new THREE.SphereGeometry(
        0.08,
        8,
        8
      );
    
    
    const material =
      new THREE.MeshBasicMaterial({
        
        color: 0xffcc55,
        
        transparent: true,
        
        opacity: 0
        
      });
    
    
    this.muzzleFlash =
      new THREE.Mesh(
        geometry,
        material
      );
    
    
    this.muzzleFlash.position.set(
      0,
      0,
      -1.04
    );
    
    
    this.weapon.add(
      this.muzzleFlash
    );
    
  }
  
  
  /* =====================================================
     AI WEAPON
     
     Creates a completely separate visual rifle.

     It does NOT use:
     - player ammo
     - player camera
     - player reload
     - player raycaster
  ===================================================== */
  
  attachAIWeapon(
    soldier,
    team = "blue"
  ) {
    
    if (
      !soldier ||
      !soldier.parts ||
      !soldier.parts.weaponSocket
    ) {
      
      console.warn(
        "Weapon: AI weapon socket missing."
      );
      
      return null;
      
    }
    
    
    const socket =
      soldier.parts.weaponSocket;
    
    
    const rifle =
      new THREE.Group();
    
    
    rifle.name =
      `${team.toUpperCase()}_AI_AR15`;
    
    
    rifle.userData.aiWeapon =
      true;
    
    rifle.userData.team =
      team;
    
    rifle.userData.soldier =
      soldier;
    
    
    /* =================================================
       MATERIALS
    ================================================= */
    
    const receiverMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x25282b,
        
        roughness: 0.58,
        
        metalness: 0.72
        
      });
    
    
    const blackMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x0d0f10,
        
        roughness: 0.78,
        
        metalness: 0.35
        
      });
    
    
    const polymerMaterial =
      new THREE.MeshStandardMaterial({
        
        color: 0x171a1c,
        
        roughness: 0.9
        
      });
    
    
    const accentMaterial =
      new THREE.MeshStandardMaterial({
        
        color: team === "red" ?
          0x6d2025 :
          0x1d4e73,
        
        roughness: 0.72,
        
        metalness: 0.25
        
      });
    
    
    /* =================================================
       RECEIVER
    ================================================= */
    
    const receiver =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.16,
          0.19,
          0.58
        ),
        
        receiverMaterial
        
      );
    
    
    receiver.position.z = -0.02;
    
    
    rifle.add(
      receiver
    );
    
    
    /* =================================================
       UPPER RECEIVER
    ================================================= */
    
    const upper =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.14,
          0.12,
          0.38
        ),
        
        receiverMaterial
        
      );
    
    
    upper.position.set(
      0,
      0.08,
      -0.27
    );
    
    
    rifle.add(
      upper
    );
    
    
    /* =================================================
       HANDGUARD
    ================================================= */
    
    const handguard =
      new THREE.Mesh(
        
        new THREE.CylinderGeometry(
          0.078,
          0.078,
          0.5,
          8
        ),
        
        polymerMaterial
        
      );
    
    
    handguard.rotation.x =
      Math.PI / 2;
    
    
    handguard.position.z = -0.47;
    
    
    rifle.add(
      handguard
    );
    
    
    /* =================================================
       HANDGUARD RAIL
    ================================================= */
    
    const topRail =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.075,
          0.035,
          0.48
        ),
        
        blackMaterial
        
      );
    
    
    topRail.position.set(
      0,
      0.105,
      -0.47
    );
    
    
    rifle.add(
      topRail
    );
    
    
    /* =================================================
       BARREL
    ================================================= */
    
    const barrel =
      new THREE.Mesh(
        
        new THREE.CylinderGeometry(
          0.032,
          0.032,
          0.62,
          8
        ),
        
        blackMaterial
        
      );
    
    
    barrel.rotation.x =
      Math.PI / 2;
    
    
    barrel.position.z = -0.78;
    
    
    rifle.add(
      barrel
    );
    
    
    /* =================================================
       MUZZLE
    ================================================= */
    
    const muzzle =
      new THREE.Mesh(
        
        new THREE.CylinderGeometry(
          0.046,
          0.04,
          0.13,
          8
        ),
        
        blackMaterial
        
      );
    
    
    muzzle.rotation.x =
      Math.PI / 2;
    
    
    muzzle.position.z = -1.12;
    
    
    rifle.add(
      muzzle
    );
    
    
    /* =================================================
       STOCK
    ================================================= */
    
    const stock =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.14,
          0.16,
          0.38
        ),
        
        polymerMaterial
        
      );
    
    
    stock.position.set(
      0,
      -0.01,
      0.44
    );
    
    
    rifle.add(
      stock
    );
    
    
    /* =================================================
       STOCK END
    ================================================= */
    
    const stockEnd =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.16,
          0.18,
          0.06
        ),
        
        blackMaterial
        
      );
    
    
    stockEnd.position.z =
      0.64;
    
    
    rifle.add(
      stockEnd
    );
    
    
    /* =================================================
       MAGAZINE
    ================================================= */
    
    const magazine =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.105,
          0.3,
          0.17
        ),
        
        blackMaterial
        
      );
    
    
    magazine.position.set(
      0,
      -0.23,
      0.02
    );
    
    
    magazine.rotation.x = -0.15;
    
    
    rifle.add(
      magazine
    );
    
    
    /* =================================================
       MAGAZINE BASE
    ================================================= */
    
    const magazineBase =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.12,
          0.035,
          0.18
        ),
        
        blackMaterial
        
      );
    
    
    magazineBase.position.set(
      0,
      -0.38,
      0.01
    );
    
    
    rifle.add(
      magazineBase
    );
    
    
    /* =================================================
       FRONT SIGHT
    ================================================= */
    
    const frontSight =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.035,
          0.09,
          0.06
        ),
        
        blackMaterial
        
      );
    
    
    frontSight.position.set(
      0,
      0.14,
      -0.72
    );
    
    
    rifle.add(
      frontSight
    );
    
    
    /* =================================================
       REAR SIGHT
    ================================================= */
    
    const rearSight =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.09,
          0.055,
          0.05
        ),
        
        blackMaterial
        
      );
    
    
    rearSight.position.set(
      0,
      0.13,
      0.13
    );
    
    
    rifle.add(
      rearSight
    );
    
    
    /* =================================================
       TRIGGER
    ================================================= */
    
    const trigger =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.035,
          0.09,
          0.04
        ),
        
        blackMaterial
        
      );
    
    
    trigger.position.set(
      0,
      -0.09,
      0.18
    );
    
    
    rifle.add(
      trigger
    );
    
    
    /* =================================================
       SELECTOR
    ================================================= */
    
    const selector =
      new THREE.Mesh(
        
        new THREE.BoxGeometry(
          0.025,
          0.07,
          0.035
        ),
        
        accentMaterial
        
      );
    
    
    selector.position.set(
      0.085,
      0.02,
      0.1
    );
    
    
    rifle.add(
      selector
    );
    
    
    /* =================================================
       AI MUZZLE POINT
    ================================================= */
    
    const muzzlePoint =
      new THREE.Object3D();
    
    
    muzzlePoint.name =
      "muzzlePoint";
    
    
    muzzlePoint.position.set(
      0,
      0,
      -1.18
    );
    
    
    rifle.add(
      muzzlePoint
    );
    
    
    rifle.userData.muzzlePoint =
      muzzlePoint;
    
    
    /* =================================================
       ORIENTATION
       
       -Z = FORWARD
       
       This is important because
       BotAI rotates the soldier
       around Y.
    ================================================= */
    
    rifle.rotation.set(
      0,
      0,
      0
    );
    
    
    /*
     * Position the rifle inside
     * the soldier's weapon socket.
     */
    
    rifle.position.set(
      0,
      0,
      0
    );
    
    
    socket.add(
      rifle
    );
    
    
    /* =================================================
       SHADOWS
    ================================================= */
    
    rifle.traverse(
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
    
    
    /* =================================================
       AI WEAPON STATE
    ================================================= */
    
    rifle.userData.recoil =
      0;
    
    rifle.userData.fireTimer =
      0;
    
    
    rifle.userData.fire =
      () => {
        
        this.fireAIWeapon(
          rifle
        );
        
      };
    
    
    this.aiWeapons.push(
      rifle
    );
    
    
    return rifle;
    
  }
  
  
  /* =====================================================
     AI FIRE
  ===================================================== */
  
  fireAIWeapon(
    rifle
  ) {
    
    if (!rifle) {
      return;
    }
    
    
    rifle.userData.recoil =
      0.045;
    
    
    rifle.userData.fireTimer =
      0.1;
    
    
    const muzzle =
      rifle.userData.muzzlePoint;
    
    
    if (
      muzzle
    ) {
      
      this.createAIMuzzleFlash(
        muzzle
      );
      
    }
    
  }
  
  
  /* =====================================================
     AI MUZZLE FLASH
  ===================================================== */
  
  createAIMuzzleFlash(
    muzzle
  ) {
    
    const flash =
      new THREE.Mesh(
        
        new THREE.SphereGeometry(
          0.09,
          6,
          6
        ),
        
        new THREE.MeshBasicMaterial({
          
          color: 0xffbd45,
          
          transparent: true,
          
          opacity: 1
          
        })
        
      );
    
    
    muzzle.add(
      flash
    );
    
    
    flash.position.set(
      0,
      0,
      0
    );
    
    
    let life =
      0.055;
    
    
    const updateFlash =
      (delta) => {
        
        life -= delta;
        
        
        flash.material.opacity =
          Math.max(
            0,
            life / 0.055
          );
        
        
        if (
          life <= 0
        ) {
          
          if (
            flash.parent
          ) {
            
            flash.parent.remove(
              flash
            );
            
          }
          
          
          flash.geometry.dispose();
          
          flash.material.dispose();
          
          return;
          
        }
        
        
        requestAnimationFrame(
          () => {
            
            updateFlash(
              1 / 60
            );
            
          }
        );
        
      };
    
    
    updateFlash(
      0
    );
    
  }
  
  
  /* =====================================================
     UPDATE
     
     PLAYER + AI WEAPON EFFECTS
  ===================================================== */
  
  update(
    delta
  ) {
    
    /* PLAYER RELOAD */
    
    if (
      this.reloading
    ) {
      
      this.reloadTimer +=
        delta;
      
      
      if (
        this.reloadTimer >=
        this.reloadTime
      ) {
        
        this.finishReload();
        
      }
      
    }
    
    
    /* PLAYER RELOAD INPUT */
    
    if (
      this.input &&
      this.input.isDown &&
      this.input.isDown(
        "KeyR"
      )
    ) {
      
      this.startReload();
      
    }
    
    
    /* PLAYER FIRE */
    
    if (
      this.input &&
      (
        this.input.fire ||
        (
          this.input.isDown &&
          this.input.isDown(
            "Mouse0"
          )
        )
      )
    ) {
      
      this.tryFire();
      
    }
    
    
    this.updateRecoil(
      delta
    );
    
    
    /* PLAYER MUZZLE */
    
    if (
      this.muzzleFlash &&
      this.muzzleFlash.material.opacity >
      0
    ) {
      
      this.muzzleFlash.material.opacity =
        Math.max(
          0,
          this.muzzleFlash.material.opacity -
          delta * 12
        );
      
    }
    
    
    /* =================================================
       AI RECOIL
    ================================================= */
    
    for (
      const rifle of
        this.aiWeapons
    ) {
      
      if (!rifle) {
        continue;
      }
      
      
      if (
        rifle.userData.fireTimer >
        0
      ) {
        
        rifle.userData.fireTimer -=
          delta;
        
      }
      
      
      if (
        rifle.userData.recoil >
        0
      ) {
        
        rifle.userData.recoil =
          THREE.MathUtils.lerp(
            rifle.userData.recoil,
            0,
            delta * 18
          );
        
        
        rifle.position.z = -rifle.userData.recoil;
        
      } else {
        
        rifle.position.z =
          0;
        
      }
      
    }
    
  }
  
  
  /* =====================================================
     PLAYER FIRE
  ===================================================== */
  
  tryFire() {
    
    if (
      this.reloading
    ) {
      
      return;
      
    }
    
    
    if (
      this.ammo <= 0
    ) {
      
      this.startReload();
      
      return;
      
    }
    
    
    const now =
      performance.now() /
      1000;
    
    
    if (
      now -
      this.lastShot <
      this.fireInterval
    ) {
      
      return;
      
    }
    
    
    this.lastShot =
      now;
    
    
    this.fire();
    
  }
  
  
  /* =====================================================
     PLAYER FIRE
  ===================================================== */
  
  fire() {
    
    this.ammo--;
    
    
    this.updateAmmoHUD();
    
    
    this.recoil =
      0.045;
    
    
    if (
      this.muzzleFlash
    ) {
      
      this.muzzleFlash.material.opacity =
        1;
      
    }
    
    
    this.raycaster.setFromCamera(
      
      new THREE.Vector2(
        0,
        0
      ),
      
      this.camera
      
    );
    
    
    /*
     * BUGFIX: this used to call
     * getTargets(), which returns
     * BOTH teams (blue + red).
     *
     * That meant the player could
     * hit/kill their own BLUE
     * teammates, and a teammate
     * standing in the way could
     * silently block a shot meant
     * for a RED enemy behind them.
     *
     * getEnemyTargets() only
     * returns RED soldiers, which
     * is what player.js actually
     * intends.
     */
    
    const enemyTargets =
      this.engine.combat ?
      this.engine.combat.getEnemyTargets() :
      [];
    
    
    /*
     * BUGFIX: shots were never
     * tested against world geometry
     * (walls/cover), so the player
     * could hit enemies through
     * solid objects. Including the
     * world root here means the
     * closest hit wins - if a wall
     * is closer than the enemy, the
     * wall blocks the shot.
     */
    
    const obstacles =
      (
        this.engine.world &&
        this.engine.world.root
      ) ?
      [this.engine.world.root] :
      [];
    
    
    const testObjects =
      enemyTargets.concat(
        obstacles
      );
    
    
    const hits =
      this.raycaster.intersectObjects(
        testObjects,
        true
      );
    
    
    if (
      hits.length > 0
    ) {
      
      const object =
        hits[0].object;
      
      
      let target =
        object;
      
      
      while (
        target &&
        !target.userData.target
      ) {
        
        target =
          target.parent;
        
      }
      
      
      if (
        target &&
        target.userData.target
      ) {
        
        target.userData.target.takeDamage(
          this.damage
        );
        
        
        this.showHitMarker();
        
      }
      
    }
    
  }
  
  
  /* =====================================================
     RECOIL
  ===================================================== */
  
  updateRecoil(
    delta
  ) {
    
    if (
      this.recoil > 0
    ) {
      
      this.camera.rotation.x -=
        this.recoil;
      
      
      this.recoil *=
        Math.pow(
          0.05,
          delta
        );
      
    }
    
  }
  
  
  /* =====================================================
     RELOAD
  ===================================================== */
  
  startReload() {
    
    if (
      this.reloading
    ) {
      
      return;
      
    }
    
    
    if (
      this.ammo >=
      this.magazineSize
    ) {
      
      return;
      
    }
    
    
    if (
      this.reserveAmmo <= 0
    ) {
      
      return;
      
    }
    
    
    this.reloading =
      true;
    
    
    this.reloadTimer =
      0;
    
  }
  
  
  finishReload() {
    
    const needed =
      this.magazineSize -
      this.ammo;
    
    
    const amount =
      Math.min(
        needed,
        this.reserveAmmo
      );
    
    
    this.ammo +=
      amount;
    
    
    this.reserveAmmo -=
      amount;
    
    
    this.reloading =
      false;
    
    
    this.updateAmmoHUD();
    
  }
  
  
  /* =====================================================
     AMMO HUD
  ===================================================== */
  
  updateAmmoHUD() {
    
    const current =
      document.getElementById(
        "ammoCurrent"
      );
    
    
    const reserve =
      document.getElementById(
        "ammoReserve"
      );
    
    
    if (
      current
    ) {
      
      current.textContent =
        this.ammo;
      
    }
    
    
    if (
      reserve
    ) {
      
      reserve.textContent =
        this.reserveAmmo;
      
    }
    
  }
  
  
  /* =====================================================
     HIT MARKER
  ===================================================== */
  
  showHitMarker() {
    
    const marker =
      document.getElementById(
        "hitMarker"
      );
    
    
    if (!marker) {
      return;
    }
    
    
    marker.classList.remove(
      "hit"
    );
    
    
    void marker.offsetWidth;
    
    
    marker.classList.add(
      "hit"
    );
    
  }
  
  
  /* =====================================================
     REMOVE AI WEAPON
  ===================================================== */
  
  removeAIWeapon(
    rifle
  ) {
    
    if (!rifle) {
      return;
    }
    
    
    const index =
      this.aiWeapons.indexOf(
        rifle
      );
    
    
    if (
      index !== -1
    ) {
      
      this.aiWeapons.splice(
        index,
        1
      );
      
    }
    
    
    if (
      rifle.parent
    ) {
      
      rifle.parent.remove(
        rifle
      );
      
    }
    
    
    rifle.traverse(
      object => {
        
        if (
          object.geometry
        ) {
          
          object.geometry.dispose();
          
        }
        
        
        if (
          object.material
        ) {
          
          object.material.dispose();
          
        }
        
      }
    );
    
  }
  
}