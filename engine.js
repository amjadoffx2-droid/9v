import * as THREE from "three";
import { Optimizer } from "./optimizer.js";
import { AssetLoader } from "./assetLoader.js";

export class Engine {
  
  constructor(container) {
    
    this.container =
      container;
    
    
    /* =================================================
       CLOCK
    ================================================= */
    
    this.clock =
      new THREE.Clock();
    
    
    /* =================================================
       SCENE
    ================================================= */
    
    this.scene =
      new THREE.Scene();
    
    
    this.scene.background =
      new THREE.Color(
        0x7d8790
      );
    
    
    this.scene.fog =
      new THREE.Fog(
        0x7d8790,
        45,
        180
      );
    
    
    /* =================================================
       CAMERA
    ================================================= */
    
    this.camera =
      new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.05,
        500
      );
    
    
    this.camera.position.set(
      0,
      1.7,
      5
    );
    
    
    this.camera.rotation.order =
      "YXZ";
    
    
    /* =================================================
       RENDERER
    ================================================= */
    
    this.renderer =
      new THREE.WebGLRenderer({
        
        antialias: true,
        
        powerPreference: "high-performance"
        
      });
    
    
    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      )
    );
    
    
    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
    
    
    /*
     * Allow transparent UI overlays
     * to sit above the renderer.
     */
    
    this.renderer.domElement.style.display =
      "block";
    
    
    this.renderer.domElement.style.width =
      "100%";
    
    
    this.renderer.domElement.style.height =
      "100%";
    
    
    /* =================================================
       SHADOWS
    ================================================= */
    
    this.renderer.shadowMap.enabled =
      true;
    
    
    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;
    
    
    this.container.appendChild(
      this.renderer.domElement
    );
    
    
    /* =================================================
       LIGHTING
    ================================================= */
    
    this.setupLighting();
    
    
    /* =================================================
       SYSTEMS
    ================================================= */
    
    this.systems = [];
    
    
    /* =================================================
       ENGINE STATE
    ================================================= */
    
    this.running =
      false;
    
    
    this.lastTime =
      performance.now();
    
    
    this.frameId =
      null;
    
    
    /* =================================================
       OPTIMIZER
       
       Global performance controller.
    ================================================= */
    
    this.optimizer =
      new Optimizer(
        this
      );
    
    
    /* =================================================
       ASSET LOADER
       
       Centralized model/material/texture
       loading and caching.
    ================================================= */
    
    this.assetLoader =
      new AssetLoader(
        this
      );
    
    
    /* =================================================
       RESIZE
    ================================================= */
    
    this.resizeHandler =
      () => this.resize();
    
    
    window.addEventListener(
      "resize",
      this.resizeHandler
    );
    
  }
  
  
  /* =====================================================
     LIGHTING
  ===================================================== */
  
  setupLighting() {
    
    const ambient =
      new THREE.HemisphereLight(
        0xffffff,
        0x303030,
        1.8
      );
    
    
    this.scene.add(
      ambient
    );
    
    
    const sun =
      new THREE.DirectionalLight(
        0xffffff,
        2.2
      );
    
    
    sun.position.set(
      30,
      50,
      20
    );
    
    
    sun.castShadow =
      true;
    
    
    sun.shadow.mapSize.width =
      1024;
    
    
    sun.shadow.mapSize.height =
      1024;
    
    
    sun.shadow.camera.left = -80;
    
    
    sun.shadow.camera.right =
      80;
    
    
    sun.shadow.camera.top =
      80;
    
    
    sun.shadow.camera.bottom = -80;
    
    
    this.scene.add(
      sun
    );
    
  }
  
  
  /* =====================================================
     ADD SYSTEM
  ===================================================== */
  
  addSystem(system) {
    
    if (!system) {
      
      return;
      
    }
    
    
    this.systems.push(
      system
    );
    
    
    /*
     * Initialize systems once
     * when they are registered.
     */
    
    if (
      typeof system.init ===
      "function"
    ) {
      
      system.init();
      
    }
    
  }
  
  
  /* =====================================================
     REMOVE SYSTEM
  ===================================================== */
  
  removeSystem(system) {
    
    const index =
      this.systems.indexOf(
        system
      );
    
    
    if (
      index === -1
    ) {
      
      return;
      
    }
    
    
    this.systems.splice(
      index,
      1
    );
    
    
    if (
      typeof system.destroy ===
      "function"
    ) {
      
      system.destroy();
      
    }
    
  }
  
  
  /* =====================================================
     START
  ===================================================== */
  
  start() {
    
    if (
      this.running
    ) {
      
      return;
      
    }
    
    
    this.running =
      true;
    
    
    this.lastTime =
      performance.now();
    
    
    this.clock.start();
    
    
    this.frameId =
      requestAnimationFrame(
        (time) =>
        this.loop(time)
      );
    
  }
  
  
  /* =====================================================
     MAIN LOOP
  ===================================================== */
  
  loop(time) {
    
    if (
      !this.running
    ) {
      
      return;
      
    }
    
    
    /* ================================================
       DELTA TIME
    ================================================= */
    
    let delta =
      (
        time -
        this.lastTime
      ) / 1000;
    
    
    this.lastTime =
      time;
    
    
    /*
     * Protect the simulation from
     * large frame spikes.
     */
    
    delta =
      Math.min(
        delta,
        0.05
      );
    
    
    /*
     * Ignore invalid delta values.
     */
    
    if (
      !Number.isFinite(delta) ||
      delta < 0
    ) {
      
      delta = 0;
      
    }
    
    
    /* ================================================
       OPTIMIZER
    ================================================= */
    
    if (
      this.optimizer &&
      typeof this.optimizer.update ===
      "function"
    ) {
      
      this.optimizer.update(
        delta
      );
      
    }
    
    
    /* ================================================
       GAME SYSTEMS
    ================================================= */
    
    for (
      const system of
        this.systems
    ) {
      
      if (
        !system
      ) {
        
        continue;
        
      }
      
      
      if (
        typeof system.update !==
        "function"
      ) {
        
        continue;
        
      }
      
      
      try {
        
        system.update(
          delta
        );
        
      }
      catch (error) {
        
        /*
         * Don't allow one broken
         * system to destroy the
         * entire render loop.
         */
        
        console.error(
          "Engine system error:",
          error,
          system
        );
        
      }
      
    }
    
    
    /* ================================================
       RENDER
    ================================================= */
    
    this.renderer.render(
      this.scene,
      this.camera
    );
    
    
    /* ================================================
       NEXT FRAME
    ================================================= */
    
    this.frameId =
      requestAnimationFrame(
        (nextTime) =>
        this.loop(
          nextTime
        )
      );
    
  }
  
  
  /* =====================================================
     STOP
  ===================================================== */
  
  stop() {
    
    if (
      !this.running
    ) {
      
      return;
      
    }
    
    
    this.running =
      false;
    
    
    if (
      this.frameId !== null
    ) {
      
      cancelAnimationFrame(
        this.frameId
      );
      
      this.frameId =
        null;
      
    }
    
  }
  
  
  /* =====================================================
     RESIZE
  ===================================================== */
  
  resize() {
    
    const width =
      window.innerWidth;
    
    
    const height =
      window.innerHeight;
    
    
    if (
      width <= 0 ||
      height <= 0
    ) {
      
      return;
      
    }
    
    
    this.camera.aspect =
      width /
      height;
    
    
    this.camera.updateProjectionMatrix();
    
    
    this.renderer.setSize(
      width,
      height,
      false
    );
    
  }
  
  
  /* =====================================================
     ENGINE STATS
  ===================================================== */
  
  getStats() {
    
    const optimizerStats =
      this.optimizer &&
      typeof this.optimizer.getStats ===
      "function"
      
      ?
      this.optimizer.getStats()
      
      :
      null;
    
    
    const assetStats =
      this.assetLoader &&
      typeof this.assetLoader.getStats ===
      "function"
      
      ?
      this.assetLoader.getStats()
      
      :
      null;
    
    
    return {
      
      systems: this.systems.length,
      
      running: this.running,
      
      optimizer: optimizerStats,
      
      assets: assetStats
      
    };
    
  }
  
  
  /* =====================================================
     DESTROY
  ===================================================== */
  
  destroy() {
    
    this.stop();
    
    
    window.removeEventListener(
      "resize",
      this.resizeHandler
    );
    
    
    /*
     * Destroy registered systems.
     */
    
    for (
      const system of
        this.systems
    ) {
      
      if (
        system &&
        typeof system.destroy ===
        "function"
      ) {
        
        system.destroy();
        
      }
      
    }
    
    
    this.systems.length =
      0;
    
    
    /*
     * Clear asset caches.
     */
    
    if (
      this.assetLoader &&
      typeof this.assetLoader.clearCache ===
      "function"
    ) {
      
      this.assetLoader.clearCache();
      
    }
    
    
    /*
     * Remove renderer.
     */
    
    if (
      this.renderer &&
      this.renderer.domElement
    ) {
      
      this.renderer.domElement.remove();
      
    }
    
    
    /*
     * Dispose renderer.
     */
    
    if (
      this.renderer
    ) {
      
      this.renderer.dispose();
      
    }
    
  }
  
}