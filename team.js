import * as THREE from "three";

export class TeamManager {
  
  constructor(engine, player) {
    
    this.engine = engine;
    this.player = player;
    
    this.redTeam = [];
    this.blueTeam = [];
    
    this.redScore = 0;
    this.blueScore = 0;
    
    this.maxScore = 50;
    
    this.spawnPoints = {
      
      red: [
        new THREE.Vector3(-15, 0, -43),
        new THREE.Vector3(-5, 0, -43),
        new THREE.Vector3(5, 0, -43),
        new THREE.Vector3(15, 0, -43),
        new THREE.Vector3(0, 0, -37)
      ],
      
      blue: [
        new THREE.Vector3(-15, 0, 43),
        new THREE.Vector3(-5, 0, 43),
        new THREE.Vector3(5, 0, 43),
        new THREE.Vector3(15, 0, 43),
        new THREE.Vector3(0, 0, 37)
      ]
      
    };
    
  }
  
  addRed(bot) {
    
    if (!this.redTeam.includes(bot)) {
      this.redTeam.push(bot);
    }
    
  }
  
  addBlue(bot) {
    
    if (!this.blueTeam.includes(bot)) {
      this.blueTeam.push(bot);
    }
    
  }
  
  removeBot(bot) {
    
    this.redTeam =
      this.redTeam.filter(
        item => item !== bot
      );
    
    this.blueTeam =
      this.blueTeam.filter(
        item => item !== bot
      );
    
  }
  
  getEnemies(team) {
    
    if (team === "red") {
      return this.blueTeam;
    }
    
    return this.redTeam;
    
  }
  
  getFriendlies(team) {
    
    if (team === "red") {
      return this.redTeam;
    }
    
    return this.blueTeam;
    
  }
  
  addScore(team) {
    
    if (team === "red") {
      
      this.redScore++;
      
      const score =
        document.getElementById(
          "redScore"
        );
      
      if (score) {
        score.textContent =
          this.redScore;
      }
      
    } else {
      
      this.blueScore++;
      
      const score =
        document.getElementById(
          "blueScore"
        );
      
      if (score) {
        score.textContent =
          this.blueScore;
      }
      
    }
    
  }
  
  getSpawn(team) {
    
    const points =
      this.spawnPoints[team];
    
    const point =
      points[
        Math.floor(
          Math.random() *
          points.length
        )
      ];
    
    return point.clone();
    
  }
  
}