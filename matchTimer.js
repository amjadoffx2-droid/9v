/* =========================================================
   MATCH TIMER
   5V5 TACTICAL FPS

   BUGFIX: index.html already had a
   #matchTimer element showing a
   static "10:00" label, but nothing
   in the entire codebase ever
   touched it. This system actually
   counts the match down and updates
   the HUD every frame.
========================================================= */

export class MatchTimer {
  
  constructor(
    durationSeconds = 600
  ) {
    
    this.duration =
      durationSeconds;
    
    
    this.remaining =
      durationSeconds;
    
    
    this.ended =
      false;
    
    
    this.element =
      document.getElementById(
        "matchTimer"
      );
    
    
    this.render();
    
  }
  
  
  /* =====================================================
     UPDATE
  ===================================================== */
  
  update(
    delta
  ) {
    
    if (
      this.ended
    ) {
      
      return;
      
    }
    
    
    this.remaining -=
      delta;
    
    
    if (
      this.remaining <=
      0
    ) {
      
      this.remaining =
        0;
      
      
      this.ended =
        true;
      
    }
    
    
    this.render();
    
  }
  
  
  /* =====================================================
     RENDER
  ===================================================== */
  
  render() {
    
    if (
      !this.element
    ) {
      
      return;
      
    }
    
    
    const totalSeconds =
      Math.max(
        0,
        Math.ceil(
          this.remaining
        )
      );
    
    
    const minutes =
      Math.floor(
        totalSeconds /
        60
      );
    
    
    const seconds =
      totalSeconds %
      60;
    
    
    const paddedSeconds =
      seconds <
      10 ?
      `0${seconds}` :
      `${seconds}`;
    
    
    this.element.textContent =
      `${minutes}:${paddedSeconds}`;
    
  }
  
  
  /* =====================================================
     RESET
  ===================================================== */
  
  reset() {
    
    this.remaining =
      this.duration;
    
    
    this.ended =
      false;
    
    
    this.render();
    
  }
  
}
