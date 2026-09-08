/* =========================================================
   OPTIMIZER.JS
   ENGINE SPEED CONTROL
========================================================= */

export class Optimizer {
  
  constructor(engine) {
    
    this.engine = engine;
    
    /* =================================================
       PERFORMANCE STATE
    ================================================= */
    
    this.fps = 60;
    
    this.frameTime = 16.67;
    
    this.averageFrameTime = 16.67;
    
    this.frameSamples = [];
    
    this.maxSamples = 30;
    
    
    /* =================================================
       PERFORMANCE TIER
       
       3 = HIGH
       2 = MEDIUM
       1 = LOW
       0 = CRITICAL
    ================================================= */
    
    this.tier = 3;
    
    this.targetFPS = 60;
    
    
    /* =================================================
       UPDATE BUDGETS
    ================================================= */
    
    this.aiBudget = 5;
    
    this.maxAIUpdates =
      5;
    
    this.worldBudget = 8;
    
    this.renderBudget = 16;
    
    
    /* =================================================
       DISTANCE SETTINGS
    ================================================= */
    
    this.aiUpdateDistance = 60;
    
    this.worldUpdateDistance = 100;
    
    
    /* =================================================
       RENDER SETTINGS
    ================================================= */
    
    this.pixelRatio =
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      );
    
    
    this.minPixelRatio = 0.7;
    
    this.maxPixelRatio = 1.5;
    
    
    /* =================================================
       TIMERS
    ================================================= */
    
    this.sampleTimer = 0;
    
    this.adjustTimer = 0;
    
    this.adjustInterval = 1.0;
    
    
    /* =================================================
       LOAD CONTROL
    ================================================= */
    
    this.frameLoad = 0;
    
    this.aiLoad = 0;
    
    this.worldLoad = 0;
    
    
    /* =================================================
       INITIALIZE RENDERER
    ================================================= */
    
    this.applyPixelRatio();
    
  }
  
  
  /* =====================================================
     UPDATE
  ===================================================== */
  
  update(delta) {
    
    if (
      !Number.isFinite(delta) ||
      delta <= 0
    ) {
      
      return;
      
    }
    
    
    this.frameTime =
      delta * 1000;
    
    
    this.frameSamples.push(
      this.frameTime
    );
    
    
    if (
      this.frameSamples.length >
      this.maxSamples
    ) {
      
      this.frameSamples.shift();
      
    }
    
    
    this.calculateAverage();
    
    
    this.sampleTimer += delta;
    
    this.adjustTimer += delta;
    
    
    /*
     * Re-evaluate performance
     * once every second.
     */
    
    if (
      this.adjustTimer >=
      this.adjustInterval
    ) {
      
      this.adjustPerformance();
      
      this.adjustTimer = 0;
      
    }
    
  }
  
  
  /* =====================================================
     CALCULATE PERFORMANCE
  ===================================================== */
  
  calculateAverage() {
    
    if (
      this.frameSamples.length === 0
    ) {
      
      return;
      
    }
    
    
    let total = 0;
    
    
    for (
      const sample of
        this.frameSamples
    ) {
      
      total += sample;
      
    }
    
    
    this.averageFrameTime =
      total /
      this.frameSamples.length;
    
    
    this.fps =
      1000 /
      Math.max(
        this.averageFrameTime,
        0.1
      );
    
  }
  
  
  /* =====================================================
     PERFORMANCE ADJUSTMENT
  ===================================================== */
  
  adjustPerformance() {
    
    /*
     * CRITICAL
     */
    
    if (
      this.fps < 25
    ) {
      
      this.setTier(0);
      
      return;
      
    }
    
    
    /*
     * LOW
     */
    
    if (
      this.fps < 35
    ) {
      
      this.setTier(1);
      
      return;
      
    }
    
    
    /*
     * MEDIUM
     */
    
    if (
      this.fps < 50
    ) {
      
      this.setTier(2);
      
      return;
      
    }
    
    
    /*
     * HIGH
     */
    
    this.setTier(3);
    
  }
  
  
  /* =====================================================
     SET PERFORMANCE TIER
  ===================================================== */
  
  setTier(tier) {
    
    if (
      tier === this.tier
    ) {
      
      return;
      
    }
    
    
    this.tier =
      tier;
    
    
    switch (tier) {
      
      case 3:
        
        this.applyHighPerformance();
        
        break;
        
        
      case 2:
        
        this.applyMediumPerformance();
        
        break;
        
        
      case 1:
        
        this.applyLowPerformance();
        
        break;
        
        
      case 0:
        
        this.applyCriticalPerformance();
        
        break;
        
    }
    
  }
  
  
  /* =====================================================
     HIGH PERFORMANCE
  ===================================================== */
  
  applyHighPerformance() {
    
    this.targetFPS = 60;
    
    this.aiBudget = 5;
    
    this.maxAIUpdates = 5;
    
    this.aiUpdateDistance = 70;
    
    this.worldUpdateDistance = 120;
    
    
    this.pixelRatio =
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      );
    
    
    this.applyPixelRatio();
    
  }
  
  
  /* =====================================================
     MEDIUM PERFORMANCE
  ===================================================== */
  
  applyMediumPerformance() {
    
    this.targetFPS = 45;
    
    this.aiBudget = 4;
    
    this.maxAIUpdates = 4;
    
    this.aiUpdateDistance = 55;
    
    this.worldUpdateDistance = 100;
    
    
    this.pixelRatio =
      Math.min(
        window.devicePixelRatio || 1,
        1.25
      );
    
    
    this.applyPixelRatio();
    
  }
  
  
  /* =====================================================
     LOW PERFORMANCE
  ===================================================== */
  
  applyLowPerformance() {
    
    this.targetFPS = 30;
    
    this.aiBudget = 2;
    
    this.maxAIUpdates = 2;
    
    this.aiUpdateDistance = 40;
    
    this.worldUpdateDistance = 75;
    
    
    this.pixelRatio =
      Math.max(
        this.minPixelRatio,
        0.9
      );
    
    
    this.applyPixelRatio();
    
  }
  
  
  /* =====================================================
     CRITICAL PERFORMANCE
  ===================================================== */
  
  applyCriticalPerformance() {
    
    this.targetFPS = 25;
    
    this.aiBudget = 1;
    
    this.maxAIUpdates = 1;
    
    this.aiUpdateDistance = 30;
    
    this.worldUpdateDistance = 50;
    
    
    this.pixelRatio =
      this.minPixelRatio;
    
    
    this.applyPixelRatio();
    
  }
  
  
  /* =====================================================
     RENDERER PIXEL RATIO
  ===================================================== */
  
  applyPixelRatio() {
    
    if (
      !this.engine ||
      !this.engine.renderer
    ) {
      
      return;
      
    }
    
    
    this.engine.renderer
      .setPixelRatio(
        this.pixelRatio
      );
    
  }
  
  
  /* =====================================================
     AI BUDGET
     
     Bot systems can ask the optimizer
     whether they should update.
  ===================================================== */
  
  shouldUpdateAI(
    bot,
    playerPosition
  ) {
    
    if (!bot) {
      
      return false;
      
    }
    
    
    if (!bot.alive) {
      
      return true;
      
    }
    
    
    /*
     * Always update close enemies.
     */
    
    if (
      !playerPosition ||
      !bot.position
    ) {
      
      return true;
      
    }
    
    
    const distance =
      bot.position.distanceTo(
        playerPosition
      );
    
    
    if (
      distance <=
      this.aiUpdateDistance
    ) {
      
      return true;
      
    }
    
    
    /*
     * Far AI gets throttled.
     */
    
    return (
      Math.random() <
      0.25
    );
    
  }
  
  
  /* =====================================================
     DISTANCE CHECK
  ===================================================== */
  
  isWithinWorldRange(
    position,
    playerPosition
  ) {
    
    if (
      !position ||
      !playerPosition
    ) {
      
      return true;
      
    }
    
    
    return (
      position.distanceTo(
        playerPosition
      ) <=
      this.worldUpdateDistance
    );
    
  }
  
  
  /* =====================================================
     DEBUG INFORMATION
  ===================================================== */
  
  getStats() {
    
    return {
      
      fps: Math.round(
        this.fps
      ),
      
      frameTime: Number(
        this.averageFrameTime
      ).toFixed(2),
      
      tier: this.tier,
      
      aiBudget: this.aiBudget,
      
      aiDistance: this.aiUpdateDistance,
      
      pixelRatio: Number(
        this.pixelRatio
      ).toFixed(2)
      
    };
    
  }
  
}