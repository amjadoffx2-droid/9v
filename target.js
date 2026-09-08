import * as THREE from "three";

export class Target {
  
  constructor(
    engine,
    position,
    team = "red"
  ) {
    
    this.engine = engine;
    
    this.team = team;
    
    this.maxHealth = 100;
    this.health = 100;
    
    this.alive = true;
    
    this.createModel();
    
    this.group.position.copy(
      position
    );
    
    engine.scene.add(
      this.group
    );
    
    this.group.userData.target =
      this;
    
  }
  
  createModel() {
    
    this.group =
      new THREE.Group();
    
    const material =
      new THREE.MeshStandardMaterial({
        color: this.team === "red" ?
          0xaa2222 :
          0x2255cc,
        roughness: 0.75
      });
    
    const body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.38,
          0.8,
          4,
          8
        ),
        material
      );
    
    body.position.y =
      1.05;
    
    body.castShadow = true;
    
    this.group.add(
      body
    );
    
    this.body = body;
    
    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.25,
          12,
          12
        ),
        material
      );
    
    head.position.y =
      1.72;
    
    head.castShadow = true;
    
    this.group.add(
      head
    );
    
    this.head = head;
    
    const weapon =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.12,
          0.7
        ),
        new THREE.MeshStandardMaterial({
          color: 0x151515,
          metalness: 0.7
        })
      );
    
    weapon.position.set(
      0.38,
      1.1,
      -0.2
    );
    
    weapon.rotation.y =
      Math.PI / 2;
    
    this.group.add(
      weapon
    );
    
  }
  
  takeDamage(amount) {
    
    if (!this.alive) {
      return;
    }
    
    this.health -= amount;
    
    if (this.health <= 0) {
      
      this.health = 0;
      
      this.die();
      
    }
    
  }
  
  die() {
    
    this.alive = false;
    
    this.engine.scene.remove(
      this.group
    );
    
    if (
      this.engine.combat
    ) {
      
      this.engine.combat.targetKilled(
        this
      );
      
    }
    
  }
  
}