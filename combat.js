/* =========================================================
   COMBAT SYSTEM
   5V5 TEAM DEATHMATCH

   OFFLINE:
   BLUE:
   - Human Player
   - 4 AI Soldiers

   RED:
   - 5 AI Soldiers

   ONLINE:
   - NO AI BOTS
   - Real players only
========================================================= */

import { BotAI } from "./botAI.js";
import { TeamManager } from "./team.js";


export class Combat {

  constructor(
    engine,
    player
  ) {

    this.engine =
      engine;

    this.player =
      player;


    /* =================================================
       TEAM MANAGER
    ================================================= */

    this.teamManager =
      new TeamManager(
        engine,
        player
      );


    /* =================================================
       BOTS
    ================================================= */

    this.bots = [];


    /* =================================================
       ONLINE MODE
    ================================================= */

    this.online = Boolean(
      this.engine.multiplayer &&
      this.engine.multiplayer.online
    );


    /* =================================================
       CREATE OFFLINE TEAMS ONLY
    ================================================= */

    if (!this.online) {

      this.createTeams();

    }

  }


  /* =====================================================
     CREATE OFFLINE TEAMS
  ===================================================== */

  createTeams() {

    /*
     * BLUE TEAM
     *
     * Human player + 4 AI
     */

    const blueSpawns =
      this.teamManager
        .spawnPoints
        .blue;


    for (
      let i = 0;
      i < 4;
      i++
    ) {

      const spawn =
        blueSpawns[i];


      const bot =
        new BotAI(
          this.engine,
          this.teamManager,
          "blue",
          spawn,
          `BLUE-${i + 2}`
        );


      this.bots.push(
        bot
      );


      this.teamManager.addBlue(
        bot
      );

    }


    /*
     * RED TEAM
     *
     * 5 AI
     */

    const redSpawns =
      this.teamManager
        .spawnPoints
        .red;


    for (
      let i = 0;
      i < 5;
      i++
    ) {

      const spawn =
        redSpawns[i];


      const bot =
        new BotAI(
          this.engine,
          this.teamManager,
          "red",
          spawn,
          `RED-${i + 1}`
        );


      this.bots.push(
        bot
      );


      this.teamManager.addRed(
        bot
      );

    }

  }


  /* =====================================================
     ENABLE ONLINE
  ===================================================== */

  enableOnline() {

    /*
     * Switch combat to online.
     */

    this.online =
      true;


    /*
     * Remove every offline bot.
     */

    for (
      const bot of this.bots
    ) {

      if (
        !bot
      ) {
        continue;
      }


      if (
        bot.group &&
        bot.group.parent
      ) {

        bot.group.parent.remove(
          bot.group
        );

      }

    }


    /*
     * Empty bot list.
     */

    this.bots.length =
      0;


    /*
     * Tell multiplayer that
     * online mode is active.
     */

    if (
      this.engine.multiplayer
    ) {

      this.engine.multiplayer.online =
        true;

      this.engine.multiplayer.player =
        this.player;

    }

  }


  /* =====================================================
     UPDATE
  ===================================================== */

  update(
    delta
  ) {

    /*
     * Online players.
     */

    if (
      this.online &&
      this.engine.multiplayer &&
      typeof this.engine.multiplayer.update ===
        "function"
    ) {

      this.engine.multiplayer.update(
        delta
      );

    }


    /*
     * Offline AI only.
     *
     * In online mode bots array is empty.
     */

    for (
      const bot of this.bots
    ) {

      if (
        bot &&
        typeof bot.update ===
          "function"
      ) {

        bot.update(
          delta
        );

      }

    }

  }


  /* =====================================================
     GET ALL TARGET MESHES
  ===================================================== */

  getTargets() {

    const meshes =
      [];


    /*
     * Offline bots.
     */

    for (
      const bot of this.bots
    ) {

      if (
        !bot ||
        !bot.alive ||
        !bot.group
      ) {

        continue;

      }


      bot.group.traverse(
        object => {

          if (
            object.isMesh
          ) {

            meshes.push(
              object
            );

          }

        }
      );

    }


    /*
     * Online players.
     */

    if (
      this.online &&
      this.engine.multiplayer &&
      typeof this.engine.multiplayer.getAllTargets ===
        "function"
    ) {

      const remoteTargets =
        this.engine.multiplayer.getAllTargets();


      if (
        Array.isArray(
          remoteTargets
        )
      ) {

        meshes.push(
          ...remoteTargets
        );

      }

    }


    return meshes;

  }


  /* =====================================================
     GET ENEMY TARGET MESHES
  ===================================================== */

  getEnemyTargets() {

    const meshes =
      [];


    /*
     * OFFLINE
     *
     * Original game:
     * Player is BLUE.
     * Only RED bots can be shot.
     */

    if (!this.online) {

      for (
        const bot of this.bots
      ) {

        if (
          !bot ||
          !bot.alive ||
          !bot.group
        ) {

          continue;

        }


        if (
          bot.team !==
          "red"
        ) {

          continue;

        }


        bot.group.traverse(
          object => {

            if (
              object.isMesh
            ) {

              meshes.push(
                object
              );

            }

          }
        );

      }

    }


    /*
     * ONLINE
     *
     * Real enemy players only.
     */

    if (
      this.online &&
      this.engine.multiplayer &&
      typeof this.engine.multiplayer.getEnemyTargets ===
        "function"
    ) {

      const enemyTargets =
        this.engine.multiplayer.getEnemyTargets();


      if (
        Array.isArray(
          enemyTargets
        )
      ) {

        meshes.push(
          ...enemyTargets
        );

      }

    }


    return meshes;

  }


  /* =====================================================
     FIND BOT FROM HIT OBJECT
  ===================================================== */

  getBotFromObject(
    object
  ) {

    let current =
      object;


    while (
      current
    ) {

      if (
        current.userData &&
        current.userData.bot
      ) {

        return current
          .userData
          .bot;

      }


      current =
        current.parent;

    }


    return null;

  }


  /* =====================================================
     TARGET KILLED
  ===================================================== */

  targetKilled(
    target
  ) {

    if (
      !target
    ) {

      return;

    }


    /*
     * Reserved for:
     *
     * - Kill feed
     * - Hit marker
     * - Score
     * - Announcer
     */

  }


  /* =====================================================
     GET BLUE BOTS
  ===================================================== */

  getBlueBots() {

    return this.bots.filter(
      bot =>
        bot.team ===
        "blue"
    );

  }


  /* =====================================================
     GET RED BOTS
  ===================================================== */

  getRedBots() {

    return this.bots.filter(
      bot =>
        bot.team ===
        "red"
    );

  }


  /* =====================================================
     GET LIVING BOTS
  ===================================================== */

  getLivingBots() {

    return this.bots.filter(
      bot =>
        bot.alive
    );

  }

}