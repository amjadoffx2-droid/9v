import * as THREE from "three";

import { SoldierModel } from "./soldierModel.js";


export class BotAI {
  
  constructor(
    engine,
    teamManager,
    team,
    spawnPosition,
    name
  ) {
    
    this.engine =
      engine;
    
    this.teamManager =
      teamManager;
    
    this.team =
      team;
    
    this.name =
      name;
    
    this.position =
      spawnPosition.clone();
    
    this.spawnPosition =
      spawnPosition.clone();
    
    
    /* =================================================
       HEALTH
    ================================================= */
    
    this.health =
      100;
    
    this.maxHealth =
      100;
    
    this.alive =
      true;
    
    
    /* =================================================
       RESPAWN
    ================================================= */
    
    this.respawnTimer =
      0;
    
    this.respawnDelay =
      4;
    
    
    /* =================================================
       MOVEMENT
    ================================================= */
    
    this.speed =
      2.7 +
      Math.random() * 1.1;
    
    this.combatRange =
      18 +
      Math.random() * 12;
    
    this.detectionRange =
      60;
    
    
    /* =================================================
       COMBAT
    ================================================= */
    
    this.fireRate =
      0.45 +
      Math.random() * 0.35;
    
    this.lastShot =
      0;
    
    this.accuracy =
      0.72 +
      Math.random() * 0.2;
    
    
    this.target =
      null;
    
    
    /* =================================================
       LINE OF SIGHT RAYCASTER
       
       Used so bots cannot shoot
       through walls/cover.
    ================================================= */
    
    this.losRaycaster =
      new THREE.Raycaster();
    
    
    /* =================================================
       COLLISION
       
       BUGFIX: bots had zero
       collision with world geometry
       and would walk straight
       through walls/cover.
    ================================================= */
    
    this.collisionRadius =
      0.45;
    
    
    /* =================================================
       ROTATION
    ================================================= */
    
    this.yaw =
      0;
    
    
    /* =================================================
       MOVEMENT STATE
    ================================================= */
    
    this.isMoving =
      false;
    
    
    /* =================================================
       CREATE SOLDIER
    ================================================= */
    
    this.createModel();
    
    
    /* =================================================
       SCENE
    ================================================= */
    
    this.engine.scene.add(
      this.group
    );
    
    
    this.syncPosition();
    
    
    /*
     * Start the soldier facing
     * its team's natural direction
     * until a target is found.
     */
    
    this.setInitialRotation();
    
  }
  
  
  /* =====================================================
     CREATE SOLDIER
  ===================================================== */
  
  createModel() {
    
    this.soldier =
      new SoldierModel(
        this.engine,
        {
          team: this.team,
          
          name: this.name,
          
          scale: 1
        }
      );
    
    
    this.group =
      this.soldier.root;
    
    
    /*
     * Bot reference.
     */
    
    this.group.userData.bot =
      this;
    
    
    /*
     * Combat target reference.
     */
    
    this.group.userData.target =
      this;
    
    
    /*
     * Team reference.
     */
    
    this.group.userData.team =
      this.team;
    
    
    /* =================================================
       MARK ALL SOLDIER MESHES
    ================================================= */
    
    this.group.traverse(
      object => {
        
        if (
          object.isMesh
        ) {
          
          object.userData.bot =
            this;
          
          object.userData.target =
            this;
          
          object.userData.team =
            this.team;
          
        }
        
      }
    );
    
    
    /* =================================================
       WEAPON
    ================================================= */
    
    this.weapon =
      this.soldier.parts.weapon ||
      null;
    
    
    /* =================================================
       HEAD
    ================================================= */
    
    this.head =
      this.soldier.parts.head ||
      null;
    
    
    /* =================================================
       TEAM MARKER
    ================================================= */
    
    this.createTeamMarker();
    
  }
  
  
  /* =====================================================
     INITIAL ROTATION
  ===================================================== */
  
  setInitialRotation() {
    
    /*
     * Blue starts facing +Z.
     * Red starts facing -Z.
     *
     * The actual target-facing
     * system below takes over once
     * an enemy is detected.
     */
    
    if (
      this.team === "blue"
    ) {
      
      this.yaw =
        Math.PI;
      
    } else {
      
      this.yaw =
        0;
      
    }
    
    
    this.group.rotation.y =
      this.yaw;
    
  }
  
  
  /* =====================================================
     TEAM MARKER
  ===================================================== */
  
  createTeamMarker() {
    
    const markerGeometry =
      new THREE.RingGeometry(
        0.42,
        0.5,
        20
      );
    
    
    const markerMaterial =
      new THREE.MeshBasicMaterial({
        
        color: this.team === "red" ?
          0xff3030 :
          0x3090ff,
        
        transparent: true,
        
        opacity: 0.72,
        
        side: THREE.DoubleSide
        
      });
    
    
    this.marker =
      new THREE.Mesh(
        markerGeometry,
        markerMaterial
      );
    
    
    this.marker.name =
      `${this.team.toUpperCase()}_TEAM_MARKER`;
    
    
    this.marker.rotation.x = -Math.PI / 2;
    
    
    this.marker.position.y =
      0.025;
    
    
    this.marker.userData.bot =
      this;
    
    
    this.marker.userData.target =
      this;
    
    
    this.group.add(
      this.marker
    );
    
  }
  
  
  /* =====================================================
     UPDATE
  ===================================================== */
  
  update(
    delta
  ) {
    
    /* =================================================
       DEAD
    ================================================= */
    
    if (
      !this.alive
    ) {
      
      this.soldier.setMovement(
        0
      );
      
      
      this.soldier.update(
        delta
      );
      
      
      this.respawnTimer +=
        delta;
      
      
      if (
        this.respawnTimer >=
        this.respawnDelay
      ) {
        
        this.respawn();
        
      }
      
      
      return;
      
    }
    
    
    /* =================================================
       FIND TARGET
    ================================================= */
    
    this.findTarget();
    
    
    /* =================================================
       NO TARGET
       
       BUGFIX: bots used to just
       freeze here forever. Spawn
       points for the two teams are
       ~86 units apart, but
       detectionRange is only 60,
       so at the start of the match
       nobody could ever see an
       enemy - the whole match sat
       frozen until the human player
       wandered into range.
       
       Bots now push toward the
       middle of the map while they
       have no target, which brings
       them into detection range of
       each other.
    ================================================= */
    
    if (
      !this.target
    ) {
      
      this.advanceToFrontline(
        delta
      );
      
      
      this.soldier.update(
        delta
      );
      
      
      return;
      
    }
    
    
    /* =================================================
       MOVE + FIGHT
    ================================================= */
    
    this.moveAndFight(
      delta
    );
    
    
    /* =================================================
       SOLDIER ANIMATION
    ================================================= */
    
    this.soldier.update(
      delta
    );
    
  }
  
  
  /* =====================================================
     ADVANCE TO FRONTLINE
     
     Used only while the bot has no
     target yet. Walks the bot
     toward the middle of the map
     so the two teams actually meet
     and start detecting each other,
     instead of freezing forever at
     their spawn points.
  ===================================================== */
  
  advanceToFrontline(
    delta
  ) {
    
    const dx =
      0 -
      this.position.x;
    
    
    const dz =
      0 -
      this.position.z;
    
    
    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );
    
    
    /*
     * Close enough to the middle -
     * hold position and wait for
     * findTarget() to pick someone
     * up next frame.
     */
    
    if (
      distance < 4
    ) {
      
      this.isMoving =
        false;
      
      
      this.soldier.setMovement(
        0
      );
      
      
      this.syncPosition();
      
      
      return;
      
    }
    
    
    this.yaw =
      Math.atan2(
        dx,
        dz
      ) +
      Math.PI;
    
    
    this.group.rotation.y =
      this.yaw;
    
    
    const length =
      Math.max(
        distance,
        0.001
      );
    
    
    this.attemptMove(
      (
        dx /
        length
      ) *
      this.speed,
      (
        dz /
        length
      ) *
      this.speed,
      delta
    );
    
    
    this.isMoving =
      true;
    
    
    this.soldier.setMovement(
      1
    );
    
    
    this.keepInsideMap();
    
    
    this.syncPosition();
    
  }
  
  
  /* =====================================================
     FIND TARGET
  ===================================================== */
  
  findTarget() {
    
    const enemies =
      this.teamManager.getEnemies(
        this.team
      );
    
    
    let closest =
      null;
    
    
    let closestDistance =
      Infinity;
    
    
    /* =================================================
       HUMAN PLAYER
    ================================================= */
    
    if (
      this.team === "red" &&
      this.teamManager.player
    ) {
      
      const player =
        this.teamManager.player;
      
      
      if (
        player.position
      ) {
        
        const distance =
          this.position.distanceTo(
            player.position
          );
        
        
        if (
          distance <
          this.detectionRange &&
          distance <
          closestDistance
        ) {
          
          closest =
            player;
          
          
          closestDistance =
            distance;
          
        }
        
      }
      
    }
    
    
    /* =================================================
       ENEMY BOTS
    ================================================= */
    
    for (
      const enemy of
        enemies
    ) {
      
      if (
        !enemy ||
        !enemy.alive
      ) {
        
        continue;
        
      }
      
      
      const distance =
        this.position.distanceTo(
          enemy.position
        );
      
      
      if (
        distance <
        this.detectionRange &&
        distance <
        closestDistance
      ) {
        
        closest =
          enemy;
        
        
        closestDistance =
          distance;
        
      }
      
    }
    
    
    this.target =
      closest;
    
  }
  
  
  /* =====================================================
     MOVE WITH COLLISION
     
     Shared by moveAndFight() and
     advanceToFrontline(). Moves the
     bot by the given velocity, but
     slides along a wall/cover box
     instead of clipping through it.
  ===================================================== */
  
  attemptMove(
    vx,
    vz,
    delta
  ) {
    
    const world =
      this.engine.world;
    
    
    let nextX =
      this.position.x +
      vx *
      delta;
    
    
    let nextZ =
      this.position.z +
      vz *
      delta;
    
    
    if (
      world &&
      typeof world.checkCollision ===
      "function"
    ) {
      
      const blockedFull =
        world.checkCollision(
          nextX,
          nextZ,
          this.collisionRadius
        );
      
      
      if (
        blockedFull
      ) {
        
        const blockedX =
          world.checkCollision(
            nextX,
            this.position.z,
            this.collisionRadius
          );
        
        
        const blockedZ =
          world.checkCollision(
            this.position.x,
            nextZ,
            this.collisionRadius
          );
        
        
        if (
          !blockedX
        ) {
          
          nextZ =
            this.position.z;
          
        } else if (
          !blockedZ
        ) {
          
          nextX =
            this.position.x;
          
        } else {
          
          nextX =
            this.position.x;
          
          nextZ =
            this.position.z;
          
        }
        
      }
      
    }
    
    
    this.position.x =
      nextX;
    
    
    this.position.z =
      nextZ;
    
  }
  
  
  /* =====================================================
     MOVE + FIGHT
  ===================================================== */
  
  moveAndFight(
    delta
  ) {
    
    if (
      !this.target ||
      !this.target.position
    ) {
      
      return;
      
    }
    
    
    const targetPosition =
      this.target.position;
    
    
    const dx =
      targetPosition.x -
      this.position.x;
    
    
    const dz =
      targetPosition.z -
      this.position.z;
    
    
    const distanceSquared =
      dx * dx +
      dz * dz;
    
    
    const distance =
      Math.sqrt(
        distanceSquared
      );
    
    
    /* =================================================
       FACE TARGET

       IMPORTANT

       Soldier forward = -Z

       Rifle forward = -Z

       Therefore the soldier's
       negative Z axis must point
       toward the target.
    ================================================= */
    
    this.yaw =
      Math.atan2(
        dx,
        dz
      ) +
      Math.PI;
    
    
    this.group.rotation.y =
      this.yaw;
    
    
    /* =================================================
       MOVEMENT
    ================================================= */
    
    if (
      distance >
      this.combatRange
    ) {
      
      const length =
        Math.max(
          distance,
          0.001
        );
      
      
      this.attemptMove(
        (
          dx /
          length
        ) *
        this.speed,
        (
          dz /
          length
        ) *
        this.speed,
        delta
      );
      
      
      this.isMoving =
        true;
      
      
      this.soldier.setMovement(
        1
      );
      
    } else {
      
      this.isMoving =
        false;
      
      
      this.soldier.setMovement(
        0
      );
      
    }
    
    
    /* =================================================
       MAP BOUNDS
    ================================================= */
    
    this.keepInsideMap();
    
    
    /* =================================================
       SHOOT
    ================================================= */
    
    if (
      distance <=
      this.combatRange
    ) {
      
      this.tryShoot();
      
    }
    
    
    /* =================================================
       POSITION
    ================================================= */
    
    this.syncPosition();
    
  }
  
  
  /* =====================================================
     SHOOT
  ===================================================== */
  
  tryShoot() {
    
    const now =
      performance.now() /
      1000;
    
    
    if (
      now -
      this.lastShot <
      this.fireRate
    ) {
      
      return;
      
    }
    
    
    this.lastShot =
      now;
    
    
    /* =================================================
       ACCURACY
    ================================================= */
    
    if (
      Math.random() >
      this.accuracy
    ) {
      
      return;
      
    }
    
    
    /* =================================================
       LINE OF SIGHT
       
       Bots must have a clear line
       to the target through the
       world geometry (walls/cover)
       before they are allowed to
       hit. This stops bots from
       shooting enemies through
       walls.
    ================================================= */
    
    if (
      !this.hasLineOfSight(
        this.target
      )
    ) {
      
      return;
      
    }
    
    
    /* =================================================
       WEAPON FIRE
    ================================================= */
    
    if (
      this.weapon &&
      this.weapon.userData &&
      typeof this.weapon.userData.fire ===
      "function"
    ) {
      
      this.weapon.userData.fire();
      
    }
    
    
    /* =================================================
       SOLDIER RECOIL
    ================================================= */
    
    this.soldier.fire();
    
    
    /* =================================================
       DAMAGE
    ================================================= */
    
    const damage =
      8 +
      Math.random() * 7;
    
    
    if (
      this.target ===
      this.teamManager.player
    ) {
      
      this.damagePlayer(
        damage
      );
      
    } else if (
      this.target &&
      this.target.alive
    ) {
      
      this.target.takeDamage(
        damage,
        this
      );
      
    }
    
  }
  
  
  /* =====================================================
     LINE OF SIGHT CHECK
     
     Casts a ray from the bot's
     approximate chest height to
     the target's approximate chest
     height. If world geometry
     (walls/cover) blocks that ray
     before it reaches the target,
     the bot has no shot.
  ===================================================== */
  
  hasLineOfSight(
    target
  ) {
    
    if (
      !target ||
      !target.position
    ) {
      
      return false;
      
    }
    
    
    if (
      !this.engine.world ||
      !this.engine.world.root
    ) {
      
      /*
       * No world geometry to
       * block against, so the
       * shot is always clear.
       */
      
      return true;
      
    }
    
    
    const eyeHeight =
      1.5;
    
    
    const origin =
      new THREE.Vector3(
        this.position.x,
        this.position.y +
        eyeHeight,
        this.position.z
      );
    
    
    /*
     * The player's own position is
     * already tracked at eye/camera
     * height, so it is used as-is.
     */
    
    const targetIsPlayer =
      target ===
      this.teamManager.player;
    
    
    const targetPoint =
      targetIsPlayer ?
      target.position.clone() :
      new THREE.Vector3(
        target.position.x,
        target.position.y +
        eyeHeight,
        target.position.z
      );
    
    
    const toTarget =
      targetPoint.clone().sub(
        origin
      );
    
    
    const distance =
      toTarget.length();
    
    
    if (
      distance <
      0.001
    ) {
      
      return true;
      
    }
    
    
    toTarget.normalize();
    
    
    this.losRaycaster.set(
      origin,
      toTarget
    );
    
    
    /*
     * Stop just short of the target
     * so the target's own mesh does
     * not count as a blocker.
     */
    
    this.losRaycaster.far =
      Math.max(
        0,
        distance - 0.6
      );
    
    
    const blockers =
      this.losRaycaster.intersectObject(
        this.engine.world.root,
        true
      );
    
    
    return blockers.length ===
      0;
    
  }
  
  
  /* =====================================================
     DAMAGE PLAYER
  ===================================================== */
  
  damagePlayer(
    amount
  ) {
    
    const player =
      this.teamManager.player;
    
    
    if (
      !player
    ) {
      
      return;
      
    }
    
    
    player.health =
      Math.max(
        0,
        player.health -
        amount
      );
    
    
    if (
      typeof player.updateHUD ===
      "function"
    ) {
      
      player.updateHUD();
      
    }
    
    
    if (
      player.health <=
      0
    ) {
      
      player.health =
        100;
      
      
      const spawn =
        this.teamManager.getSpawn(
          "blue"
        );
      
      
      if (
        spawn
      ) {
        
        player.position.copy(
          spawn
        );
        
      }
      
      
      if (
        typeof player.updateHUD ===
        "function"
      ) {
        
        player.updateHUD();
        
      }
      
    }
    
  }
  
  
  /* =====================================================
     TAKE DAMAGE
  ===================================================== */
  
  takeDamage(
    amount,
    attacker = null
  ) {
    
    if (
      !this.alive
    ) {
      
      return;
      
    }
    
    
    this.health -=
      amount;
    
    
    /* =================================================
       RETURN FIRE
    ================================================= */
    
    if (
      attacker &&
      attacker.team !==
      this.team
    ) {
      
      this.target =
        attacker;
      
    }
    
    
    if (
      this.health <=
      0
    ) {
      
      this.die(
        attacker
      );
      
    }
    
  }
  
  
  /* =====================================================
     DIE
  ===================================================== */
  
  die(
    attacker = null
  ) {
    
    if (
      !this.alive
    ) {
      
      return;
      
    }
    
    
    this.alive =
      false;
    
    
    this.health =
      0;
    
    
    this.respawnTimer =
      0;
    
    
    this.target =
      null;
    
    
    this.isMoving =
      false;
    
    
    this.soldier.setMovement(
      0
    );
    
    
    /* =================================================
       HIDE SOLDIER
    ================================================= */
    
    this.soldier.setVisible(
      false
    );
    
    
    /* =================================================
       SCORE
    ================================================= */
    
    const scoringTeam =
      attacker &&
      attacker.team ?
      attacker.team :
      (
        this.team === "red" ?
        "blue" :
        "red"
      );
    
    
    this.teamManager.addScore(
      scoringTeam
    );
    
  }
  
  
  /* =====================================================
     RESPAWN
  ===================================================== */
  
  respawn() {
    
    this.alive =
      true;
    
    
    this.health =
      this.maxHealth;
    
    
    this.respawnTimer =
      0;
    
    
    const spawn =
      this.teamManager.getSpawn(
        this.team
      );
    
    
    if (
      spawn
    ) {
      
      this.position.copy(
        spawn
      );
      
    } else {
      
      this.position.copy(
        this.spawnPosition
      );
      
    }
    
    
    this.target =
      null;
    
    
    this.lastShot =
      0;
    
    
    this.isMoving =
      false;
    
    
    this.soldier.setMovement(
      0
    );
    
    
    this.soldier.setVisible(
      true
    );
    
    
    this.soldier.respawn(
      this.position.x,
      this.position.y,
      this.position.z
    );
    
    
    this.setInitialRotation();
    
    
    this.syncPosition();
    
  }
  
  
  /* =====================================================
     MAP BOUNDS
  ===================================================== */
  
  keepInsideMap() {
    
    const limit =
      49;
    
    
    this.position.x =
      THREE.MathUtils.clamp(
        this.position.x,
        -limit,
        limit
      );
    
    
    this.position.z =
      THREE.MathUtils.clamp(
        this.position.z,
        -limit,
        limit
      );
    
  }
  
  
  /* =====================================================
     POSITION
  ===================================================== */
  
  syncPosition() {
    
    this.group.position.copy(
      this.position
    );
    
  }
  
}