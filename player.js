import * as THREE from "three";

export class Player {
  
  constructor(engine, input) {
    
    this.engine = engine;
    this.input = input;
    
    this.camera =
      engine.camera;
    
    this.position =
      this.camera.position;
    
    this.velocity =
      new THREE.Vector3();
    
    this.height = 1.7;
    
    this.speed = 7;
    
    this.sensitivity = 0.0022;
    
    this.pitch = 0;
    this.yaw = 0;
    
    this.health = 100;
    
    
    /* =================================================
       COLLISION
       
       BUGFIX: player had zero
       collision with walls/cover
       and could walk straight
       through them.
    ================================================= */
    
    this.collisionRadius = 0.4;
    
    
    /* =================================================
       JUMP / GRAVITY
       
       BUGFIX: the jump button did
       nothing at all. Input.jump
       was set by the mobile button
       but never read anywhere, and
       position.y was hard-forced
       back to eye height every
       single frame, which would
       have cancelled a jump even
       if one existed.
    ================================================= */
    
    this.velocityY = 0;
    
    this.isGrounded = true;
    
    this.jumpSpeed = 6.2;
    
    this.gravity = 20;
    
    
    /* =================================================
       CROUCH
       
       BUGFIX: same story as jump -
       the crouch button set
       input.crouch but nothing ever
       read it.
    ================================================= */
    
    this.standHeight = 1.7;
    
    this.crouchHeight = 1.05;
    
    this.crouchSpeedMultiplier = 0.55;
    
    this.isCrouching = false;
    
    this.setup();
    
  }
  
  
  /* =====================================================
     SETUP
  ===================================================== */
  
  setup() {
    
    this.position.set(
      0,
      this.height,
      18
    );
    
    this.camera.rotation.order =
      "YXZ";
    
  }
  
  
  /* =====================================================
     UPDATE
  ===================================================== */
  
  update(delta) {
    
    this.updateLook();
    
    this.updateMovement(
      delta
    );
    
    this.updateHUD();
    
  }
  
  
  /* =====================================================
     CAMERA LOOK
     
     Supports:
     - Desktop mouse
     - Mobile right-side swipe
  ===================================================== */
  
  updateLook() {
    
    /*
     * DESKTOP MOUSE
     */
    
    const mouse =
      this.input.consumeMouseMovement();
    
    
    /*
     * MOBILE SWIPE
     */
    
    const touch =
      this.input.consumeLook();
    
    
    /*
     * Combine both.
     */
    
    const lookX =
      mouse.x +
      touch.x;
    
    const lookY =
      mouse.y +
      touch.y;
    
    
    /*
     * Horizontal camera rotation
     */
    
    this.yaw -=
      lookX *
      this.sensitivity;
    
    
    /*
     * Vertical camera rotation
     */
    
    this.pitch -=
      lookY *
      this.sensitivity;
    
    
    /*
     * Prevent the player from
     * looking completely upside down.
     */
    
    const maxPitch =
      Math.PI / 2 -
      0.05;
    
    
    this.pitch =
      Math.max(
        -maxPitch,
        Math.min(
          maxPitch,
          this.pitch
        )
      );
    
    
    /*
     * Apply camera rotation.
     */
    
    this.camera.rotation.order =
      "YXZ";
    
    this.camera.rotation.y =
      this.yaw;
    
    this.camera.rotation.x =
      this.pitch;
    
  }
  
  
  /* =====================================================
     MOVEMENT
  ===================================================== */
  
  updateMovement(delta) {
    
    const movement =
      this.input.getMovement();
    
    
    const forward =
      new THREE.Vector3(
        0,
        0,
        -1
      );
    
    
    const right =
      new THREE.Vector3(
        1,
        0,
        0
      );
    
    
    /*
     * Use camera orientation
     * to determine movement direction.
     */
    
    forward.applyQuaternion(
      this.camera.quaternion
    );
    
    right.applyQuaternion(
      this.camera.quaternion
    );
    
    
    /*
     * Keep movement horizontal.
     */
    
    forward.y = 0;
    right.y = 0;
    
    
    forward.normalize();
    right.normalize();
    
    
    const direction =
      new THREE.Vector3();
    
    
    /*
     * Forward/backward.
     */
    
    direction.addScaledVector(
      forward,
      -movement.z
    );
    
    
    /*
     * Left/right.
     */
    
    direction.addScaledVector(
      right,
      movement.x
    );
    
    
    /*
     * Normalize diagonal movement.
     */
    
    if (
      direction.lengthSq() >
      0
    ) {
      
      direction.normalize();
      
    }
    
    
    /*
     * CROUCH
     *
     * BUGFIX: input.crouch was
     * tracked but never read
     * anywhere. Crouching lowers
     * eye height and slows
     * movement.
     */
    
    this.isCrouching =
      !!(
        this.input.crouch ||
        (
          this.input.isDown &&
          (
            this.input.isDown("ControlLeft") ||
            this.input.isDown("KeyC")
          )
        )
      );
    
    
    const targetHeight =
      this.isCrouching ?
      this.crouchHeight :
      this.standHeight;
    
    
    const currentSpeed =
      this.isCrouching ?
      this.speed * this.crouchSpeedMultiplier :
      this.speed;
    
    
    /*
     * Calculate velocity.
     */
    
    this.velocity.x =
      direction.x *
      currentSpeed;
    
    
    this.velocity.z =
      direction.z *
      currentSpeed;
    
    
    /*
     * BUGFIX: movement used to be
     * applied directly with no
     * collision test at all, so
     * the player could walk
     * straight through walls and
     * cover. Each axis is now
     * tested separately against
     * the world's colliders so the
     * player slides along a wall
     * instead of stopping dead or
     * clipping through it.
     */
    
    const world =
      this.engine.world;
    
    
    let nextX =
      this.position.x +
      this.velocity.x *
      delta;
    
    
    let nextZ =
      this.position.z +
      this.velocity.z *
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
    
    
    /* =================================================
       MAP BOUNDS
    ================================================= */
    
    const limit = 48;
    
    
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
    
    
    /* =================================================
       JUMP / GRAVITY
       
       BUGFIX: jump was completely
       non-functional. There was no
       vertical velocity at all,
       and position.y was forced
       back to eye height every
       frame regardless of input.
    ================================================= */
    
    const wantsJump =
      !!(
        this.input.jump ||
        (
          this.input.isDown &&
          this.input.isDown("Space")
        )
      );
    
    
    if (
      this.isGrounded &&
      wantsJump &&
      !this.isCrouching
    ) {
      
      this.velocityY =
        this.jumpSpeed;
      
      
      this.isGrounded =
        false;
      
    }
    
    
    this.velocityY -=
      this.gravity *
      delta;
    
    
    this.height =
      THREE.MathUtils.lerp(
        this.height,
        targetHeight,
        Math.min(
          1,
          delta * 10
        )
      );
    
    
    this.position.y +=
      this.velocityY *
      delta;
    
    
    if (
      this.position.y <=
      this.height
    ) {
      
      this.position.y =
        this.height;
      
      this.velocityY =
        0;
      
      this.isGrounded =
        true;
      
    }
    
  }
  
  
  /* =====================================================
     HEALTH
  ===================================================== */
  
  takeDamage(amount) {
    
    if (
      this.health <= 0
    ) {
      
      return;
      
    }
    
    
    this.health -=
      amount;
    
    
    this.health =
      Math.max(
        0,
        this.health
      );
    
    
    if (
      this.health <= 0
    ) {
      
      this.die();
      
    }
    
  }
  
  
  /* =====================================================
     PLAYER DEATH
  ===================================================== */
  
  die() {
    
    /*
     * Temporary respawn.
     *
     * Later we'll connect this to
     * the full 5v5 respawn system.
     */
    
    this.health = 100;
    
    
    this.height =
      this.standHeight;
    
    
    this.velocityY =
      0;
    
    
    this.isGrounded =
      true;
    
    
    this.isCrouching =
      false;
    
    
    this.position.set(
      0,
      this.height,
      18
    );
    
    
    this.yaw = 0;
    this.pitch = 0;
    
    
    this.camera.rotation.order =
      "YXZ";
    
    this.camera.rotation.y =
      0;
    
    this.camera.rotation.x =
      0;
    
  }
  
  
  /* =====================================================
     HUD
  ===================================================== */
  
  updateHUD() {
    
    const health =
      document.getElementById(
        "healthNumber"
      );
    
    
    const fill =
      document.getElementById(
        "healthFill"
      );
    
    
    if (health) {
      
      health.textContent =
        Math.round(
          this.health
        );
      
    }
    
    
    if (fill) {
      
      fill.style.width =
        `${this.health}%`;
      
    }
    
  }
  
}