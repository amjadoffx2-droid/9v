import * as THREE from "three";
import { SoldierModel } from "./soldierModel.js";

/* =========================================================
   SERVER
========================================================= */

const SERVER_URL =
  "wss://hgff-1.onrender.com";


/* =========================================================
   OLD MAP SPAWNS
========================================================= */

const BLUE_SPAWNS = [
  new THREE.Vector3(-15, 1.7, 43),
  new THREE.Vector3(-5, 1.7, 43),
  new THREE.Vector3(5, 1.7, 43),
  new THREE.Vector3(15, 1.7, 43)
];

const RED_SPAWNS = [
  new THREE.Vector3(-15, 1.7, -43),
  new THREE.Vector3(-5, 1.7, -43),
  new THREE.Vector3(5, 1.7, -43),
  new THREE.Vector3(15, 1.7, -43)
];


/* =========================================================
   HELPERS
========================================================= */

function number(
  value,
  fallback = 0
) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}


function createId() {
  return (
    Math.random()
      .toString(36)
      .slice(2) +
    Date.now()
      .toString(36)
  );
}


/* =========================================================
   REMOTE PLAYER
========================================================= */

class RemotePlayer {

  constructor(
    multiplayer,
    data = {}
  ) {

    this.multiplayer =
      multiplayer;

    this.engine =
      multiplayer.engine;


    this.id =
      data.id ||
      data.playerId ||
      createId();


    this.name =
      String(
        data.name ||
        "PLAYER"
      ).slice(
        0,
        16
      );


    this.team =
      data.team === "red"
        ? "red"
        : "blue";


    this.health =
      Math.max(
        0,
        number(
          data.health,
          100
        )
      );


    this.alive =
      data.alive !== false &&
      this.health > 0;


    const position =
      data.position || {};


    this.position =
      new THREE.Vector3(
        number(
          data.x ??
          position.x,
          0
        ),

        number(
          data.y ??
          position.y,
          1.7
        ),

        number(
          data.z ??
          position.z,
          0
        )
      );


    this.targetPosition =
      this.position.clone();


    const rotation =
      data.rotation || {};


    this.yaw =
      number(
        data.yaw ??
        data.rotationY ??
        rotation.y,

        this.team === "red"
          ? Math.PI
          : 0
      );


    this.targetYaw =
      this.yaw;


    this.moving =
      Boolean(
        data.moving
      );


    this.soldier =
      new SoldierModel(
        this.engine,
        {
          team:
            this.team,

          name:
            this.name,

          scale:
            1
        }
      );


    this.group =
      this.soldier.root;


    this.group.position.copy(
      this.position
    );


    this.group.rotation.y =
      this.yaw;


    this.group.userData.remotePlayer =
      this;

    this.group.userData.target =
      this;

    this.group.userData.team =
      this.team;


    this.group.traverse(
      (object) => {

        object.userData.remotePlayer =
          this;

        object.userData.target =
          this;

        object.userData.team =
          this.team;

      }
    );


    this.engine.scene.add(
      this.group
    );


    this.setVisible(
      this.alive
    );

  }


  /* =======================================================
     STATE
  ======================================================= */

  setState(
    data = {}
  ) {

    if (
      data.name !==
      undefined
    ) {

      this.name =
        String(
          data.name
        ).slice(
          0,
          16
        );

    }


    if (
      data.team === "red" ||
      data.team === "blue"
    ) {

      this.team =
        data.team;

    }


    const position =
      data.position || {};


    const x =
      data.x ??
      position.x;


    const y =
      data.y ??
      position.y;


    const z =
      data.z ??
      position.z;


    if (
      x !== undefined ||
      y !== undefined ||
      z !== undefined
    ) {

      this.targetPosition.set(

        number(
          x,
          this.targetPosition.x
        ),

        number(
          y,
          this.targetPosition.y
        ),

        number(
          z,
          this.targetPosition.z
        )

      );

    }


    const rotation =
      data.rotation || {};


    const yaw =
      data.yaw ??
      data.rotationY ??
      rotation.y;


    if (
      yaw !== undefined
    ) {

      this.targetYaw =
        number(
          yaw,
          this.targetYaw
        );

    }


    if (
      data.moving !==
      undefined
    ) {

      this.moving =
        Boolean(
          data.moving
        );

    }


    if (
      data.health !==
      undefined
    ) {

      this.health =
        Math.max(
          0,
          number(
            data.health,
            this.health
          )
        );

    }


    if (
      data.alive !==
      undefined
    ) {

      this.alive =
        Boolean(
          data.alive
        );

    } else {

      this.alive =
        this.health > 0;

    }


    this.setVisible(
      this.alive
    );

  }


  /* =======================================================
     VISIBILITY
  ======================================================= */

  setVisible(
    value
  ) {

    if (
      this.group
    ) {

      this.group.visible =
        Boolean(
          value
        );

    }

  }


  /* =======================================================
     DAMAGE
  ======================================================= */

  takeDamage(
    amount
  ) {

    if (
      !this.alive
    ) {

      return;

    }


    const damage =
      Math.max(
        0,
        Math.min(
          100,
          number(
            amount,
            0
          )
        )
      );


    if (
      !damage
    ) {

      return;

    }


    this.multiplayer.damage(
      this.id,
      damage
    );

  }


  /* =======================================================
     UPDATE
  ======================================================= */

  update(
    delta
  ) {

    if (
      !this.group
    ) {

      return;

    }


    const alpha =
      Math.min(
        1,
        delta * 15
      );


    this.position.lerp(
      this.targetPosition,
      alpha
    );


    this.group.position.copy(
      this.position
    );


    let difference =
      this.targetYaw -
      this.yaw;


    while (
      difference >
      Math.PI
    ) {

      difference -=
        Math.PI * 2;

    }


    while (
      difference <
      -Math.PI
    ) {

      difference +=
        Math.PI * 2;

    }


    this.yaw +=
      difference *
      alpha;


    this.group.rotation.y =
      this.yaw;


    if (
      this.soldier &&
      typeof this.soldier.setMovement ===
        "function"
    ) {

      this.soldier.setMovement(
        this.moving
          ? 1
          : 0
      );

    }

  }


  /* =======================================================
     FIRE
  ======================================================= */

  fire() {

    if (
      this.soldier &&
      typeof this.soldier.fire ===
        "function"
    ) {

      this.soldier.fire();

    }

  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {

    if (
      this.group
    ) {

      this.group.removeFromParent();

    }


    if (
      this.soldier &&
      typeof this.soldier.dispose ===
        "function"
    ) {

      this.soldier.dispose();

    }

  }

}


/* =========================================================
   MULTIPLAYER
========================================================= */

export class Multiplayer {

  constructor(
    engine,
    player
  ) {

    this.engine =
      engine;

    this.player =
      player;


    this.socket =
      null;


    this.connected =
      false;

    this.online =
      false;

    this.connecting =
      false;

    this.connectPromise =
      null;


    this.playerId =
      null;

    this.playerName =
      "PLAYER";

    this.roomCode =
      null;

    this.mode =
      "1v1";

    this.team =
      "blue";


    this.remotePlayers =
      new Map();


    this.lastNetworkSend =
      0;


    this.networkInterval =
      1 / 20;


    this.roomResponseTimer =
      null;

    this.roomResponseResolve =
      null;

    this.roomResponseReject =
      null;


    this.onRoomChanged =
      null;

    this.onStatus =
      null;

    this.onError =
      null;


    this.spawnIndex =
      0;

  }


  /* =======================================================
     STATUS
  ======================================================= */

  status(
    text
  ) {

    if (
      typeof this.onStatus ===
      "function"
    ) {

      this.onStatus(
        text
      );

    }

  }


  /* =======================================================
     NAME
  ======================================================= */

  cleanName(
    value
  ) {

    const name =
      String(
        value ||
        "PLAYER"
      )
        .trim()
        .replace(
          /[^a-zA-Z0-9_\- ]/g,
          ""
        )
        .slice(
          0,
          16
        );


    return (
      name ||
      "PLAYER"
    );

  }


  /* =======================================================
     MODE
  ======================================================= */

  cleanMode(
    value
  ) {

    if (
      value === "1v1" ||
      value === "2v2" ||
      value === "3v3" ||
      value === "4v4"
    ) {

      return value;

    }


    return "1v1";

  }


  /* =======================================================
     CONNECT + CREATE
  ======================================================= */

  async connectAndCreate({
    name,
    mode,
    team
  } = {}) {

    await this.connect();


    this.playerName =
      this.cleanName(
        name
      );


    this.mode =
      this.cleanMode(
        mode
      );


    this.team =
      team === "red"
        ? "red"
        : "blue";


    this.status(
      "Creating room..."
    );


    return this.waitForRoomResponse(
      () => {

        this.send({

          type:
            "create_room",

          name:
            this.playerName,

          mode:
            this.mode,

          team:
            this.team

        });

      }
    );

  }


  /* =======================================================
     CONNECT + JOIN
  ======================================================= */

  async connectAndJoin({
    name,
    roomCode,
    team
  } = {}) {

    await this.connect();


    this.playerName =
      this.cleanName(
        name
      );


    this.team =
      team === "red"
        ? "red"
        : "blue";


    const code =
      String(
        roomCode ||
        ""
      )
        .trim()
        .toUpperCase();


    if (
      !code
    ) {

      throw new Error(
        "ENTER THE ROOM CODE FIRST."
      );

    }


    this.status(
      "Joining room..."
    );


    return this.waitForRoomResponse(
      () => {

        this.send({

          type:
            "join_room",

          code:
            code,

          roomCode:
            code,

          name:
            this.playerName,

          team:
            this.team

        });

      }
    );

  }


  /* =======================================================
     WAIT FOR ROOM RESPONSE
  ======================================================= */

  waitForRoomResponse(
    sendRequest
  ) {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        this.clearRoomResponse();


        this.roomResponseResolve =
          resolve;


        this.roomResponseReject =
          reject;


        this.roomResponseTimer =
          setTimeout(
            () => {

              const error =
                new Error(
                  "SERVER TOOK TOO LONG TO RESPOND. TRY AGAIN."
                );


              this.clearRoomResponse();


              if (
                typeof this.onError ===
                "function"
              ) {

                this.onError(
                  error
                );

              }


              reject(
                error
              );

            },
            20000
          );


        try {

          sendRequest();

        } catch (
          error
        ) {

          this.clearRoomResponse();

          reject(
            error
          );

        }

      }
    );

  }


  /* =======================================================
     CLEAR ROOM RESPONSE
  ======================================================= */

  clearRoomResponse() {

    if (
      this.roomResponseTimer
    ) {

      clearTimeout(
        this.roomResponseTimer
      );

      this.roomResponseTimer =
        null;

    }


    this.roomResponseResolve =
      null;

    this.roomResponseReject =
      null;

  }


  /* =======================================================
     CONNECT
  ======================================================= */

  connect() {

    if (
      this.connected &&
      this.socket
    ) {

      return Promise.resolve();

    }


    if (
      this.connecting &&
      this.connectPromise
    ) {

      return this.connectPromise;

    }


    this.connecting =
      true;


    this.status(
      "Connecting to server..."
    );


    this.connectPromise =
      new Promise(
        (
          resolve,
          reject
        ) => {

          let settled =
            false;


          let socket;


          try {

            socket =
              new WebSocket(
                SERVER_URL
              );

          } catch (
            error
          ) {

            this.connecting =
              false;

            this.connectPromise =
              null;

            reject(
              error
            );

            return;

          }


          this.socket =
            socket;


          const resolveOnce =
            () => {

              if (
                settled
              ) {

                return;

              }


              settled =
                true;


              this.connected =
                true;


              this.connecting =
                false;


              this.status(
                "Connected to server."
              );


              resolve();

            };


          const rejectOnce =
            (
              error
            ) => {

              if (
                settled
              ) {

                return;

              }


              settled =
                true;


              this.connected =
                false;


              this.connecting =
                false;


              this.connectPromise =
                null;


              reject(
                error
              );

            };


          socket.addEventListener(
            "open",
            () => {

              resolveOnce();

            }
          );


          socket.addEventListener(
            "message",
            (event) => {

              this.handleMessage(
                event.data
              );

            }
          );


          socket.addEventListener(
            "error",
            () => {

              const error =
                new Error(
                  "COULD NOT CONNECT TO MULTIPLAYER SERVER."
                );


              this.status(
                error.message
              );


              if (
                typeof this.onError ===
                "function"
              ) {

                this.onError(
                  error
                );

              }


              rejectOnce(
                error
              );

            }
          );


          socket.addEventListener(
            "close",
            () => {

              this.connected =
                false;

              this.online =
                false;

              this.connecting =
                false;

              this.connectPromise =
                null;


              this.clearRemotePlayers();


              this.status(
                "Disconnected from server."
              );

            }
          );

        }
      );


    return this.connectPromise;

  }


  /* =======================================================
     SEND
  ======================================================= */

  send(
    message
  ) {

    if (
      !this.socket ||
      this.socket.readyState !==
        WebSocket.OPEN
    ) {

      return false;

    }


    try {

      this.socket.send(
        JSON.stringify(
          message
        )
      );


      return true;

    } catch (
      error
    ) {

      console.error(
        "[MULTIPLAYER] SEND ERROR:",
        error
      );


      return false;

    }

  }


  /* =======================================================
     SERVER MESSAGE
  ======================================================= */

  handleMessage(
    raw
  ) {

    let message;


    try {

      message =
        typeof raw ===
        "string"
          ? JSON.parse(
              raw
            )
          : raw;

    } catch (
      error
    ) {

      console.error(
        "[MULTIPLAYER] BAD SERVER MESSAGE",
        error
      );

      return;

    }


    if (
      !message ||
      typeof message !==
        "object"
    ) {

      return;

    }


    const type =
      message.type;


    /* =====================================================
       ERROR
    ===================================================== */

    if (
      type === "error"
    ) {

      const error =
        new Error(
          String(
            message.message ||
            message.error ||
            "MULTIPLAYER ERROR."
          )
        );


      this.status(
        error.message
      );


      if (
        this.roomResponseReject
      ) {

        const reject =
          this.roomResponseReject;


        this.clearRoomResponse();


        reject(
          error
        );

      }


      if (
        typeof this.onError ===
        "function"
      ) {

        this.onError(
          error
        );

      }


      return;

    }


    /* =====================================================
       CONNECTED
    ===================================================== */

    if (
      type === "connected"
    ) {

      this.playerId =
        message.playerId ||
        message.id ||
        this.playerId;


      return;

    }


    /* =====================================================
       ROOM CREATED / JOINED
    ===================================================== */

    if (
      type === "room_created" ||
      type === "room_joined" ||
      type === "joined_room"
    ) {

      this.handleRoomAccepted(
        message
      );


      if (
        this.roomResponseResolve
      ) {

        const resolve =
          this.roomResponseResolve;


        this.clearRoomResponse();


        resolve(
          message
        );

      }


      return;

    }


    /* =====================================================
       ROOM STATE
    ===================================================== */

    if (
      type === "room_state" ||
      type === "state" ||
      type === "room_update"
    ) {

      this.handleRoomState(
        message
      );


      return;

    }


    /* =====================================================
       PLAYER JOINED
    ===================================================== */

    if (
      type === "player_joined"
    ) {

      const data =
        message.player ||
        message;


      this.upsertRemote(
        data
      );


      this.notifyRoomChanged();


      return;

    }


    /* =====================================================
       PLAYER LEFT
    ===================================================== */

    if (
      type === "player_left"
    ) {

      this.removeRemote(
        message.playerId ||
        message.id
      );


      this.notifyRoomChanged();


      return;

    }


    /* =====================================================
       PLAYER UPDATE
    ===================================================== */

    if (
      type === "player_update"
    ) {

      const data =
        message.player ||
        message;


      const playerId =
        data.id ||
        data.playerId;


      if (
        playerId &&
        playerId !==
          this.playerId
      ) {

        this.upsertRemote({

          ...data,

          id:
            playerId

        });

      }


      return;

    }


    /* =====================================================
       DAMAGE
    ===================================================== */

    if (
      type === "player_damaged" ||
      type === "damage"
    ) {

      this.handleDamage(
        message
      );


      return;

    }


    /* =====================================================
       KILLED
    ===================================================== */

    if (
      type === "player_killed"
    ) {

      const playerId =
        message.playerId ||
        message.targetId ||
        message.id;


      const remote =
        this.remotePlayers.get(
          playerId
        );


      if (
        remote
      ) {

        remote.health =
          0;

        remote.alive =
          false;

        remote.setVisible(
          false
        );

      }


      return;

    }


    /* =====================================================
       SHOOT
    ===================================================== */

    if (
      type === "player_shoot" ||
      type === "shoot"
    ) {

      const playerId =
        message.playerId ||
        message.id;


      const remote =
        this.remotePlayers.get(
          playerId
        );


      if (
        remote
      ) {

        remote.fire();

      }


      return;

    }


    /* =====================================================
       RESPAWN
    ===================================================== */

    if (
      type === "player_respawned" ||
      type === "player_respawn" ||
      type === "respawn"
    ) {

      this.handleRespawn(
        message
      );


      return;

    }


    /* =====================================================
       MATCH STARTED
    ===================================================== */

    if (
      type === "match_started"
    ) {

      this.status(
        "MATCH STARTED"
      );


      return;

    }

  }


  /* =======================================================
     ROOM ACCEPTED
  ======================================================= */

  handleRoomAccepted(
    message
  ) {

    this.playerId =
      message.playerId ||
      message.id ||
      this.playerId ||
      createId();


    this.roomCode =
      String(
        message.roomCode ||
        message.code ||
        message.room ||
        this.roomCode ||
        ""
      )
        .toUpperCase();


    if (
      message.mode
    ) {

      this.mode =
        this.cleanMode(
          message.mode
        );

    }


    if (
      message.team === "red" ||
      message.team === "blue"
    ) {

      this.team =
        message.team;

    }


    this.online =
      true;


    this.applyLocalSpawn(
      message
    );


    this.status(
      `LOBBY ${this.roomCode} • ${this.mode.toUpperCase()} • ${this.team.toUpperCase()}`
    );


    this.handleRoomState(
      message
    );


    this.notifyRoomChanged();

  }


  /* =======================================================
     ROOM STATE
  ======================================================= */

  handleRoomState(
    message
  ) {

    const players =
      Array.isArray(
        message.players
      )
        ? message.players
        : Array.isArray(
            message.room?.players
          )
          ? message.room.players
          : [];


    if (
      message.roomCode ||
      message.code ||
      message.room
    ) {

      this.roomCode =
        String(
          message.roomCode ||
          message.code ||
          message.room
        )
          .toUpperCase();

    }


    if (
      message.playerId ||
      message.id
    ) {

      this.playerId =
        message.playerId ||
        message.id;

    }


    if (
      message.team === "red" ||
      message.team === "blue"
    ) {

      this.team =
        message.team;

    }


    if (
      message.mode
    ) {

      this.mode =
        this.cleanMode(
          message.mode
        );

    }


    for (
      const data of players
    ) {

      const playerId =
        data.id ||
        data.playerId;


      if (
        !playerId ||
        playerId ===
          this.playerId
      ) {

        continue;

      }


      this.upsertRemote({

        ...data,

        id:
          playerId

      });

    }


    if (
      players.length
    ) {

      const ids =
        new Set(
          players.map(
            (player) =>
              player.id ||
              player.playerId
          )
        );


      for (
        const playerId of
        this.remotePlayers.keys()
      ) {

        if (
          !ids.has(
            playerId
          )
        ) {

          this.removeRemote(
            playerId
          );

        }

      }

    }


    this.notifyRoomChanged();

  }


  /* =======================================================
     UPSERT REMOTE
  ======================================================= */

  upsertRemote(
    data
  ) {

    const playerId =
      data.id ||
      data.playerId;


    if (
      !playerId ||
      playerId ===
        this.playerId
    ) {

      return null;

    }


    let remote =
      this.remotePlayers.get(
        playerId
      );


    if (
      !remote
    ) {

      remote =
        new RemotePlayer(
          this,
          {
            ...data,

            id:
              playerId
          }
        );


      this.remotePlayers.set(
        playerId,
        remote
      );

    } else {

      remote.setState(
        data
      );

    }


    return remote;

  }


  /* =======================================================
     REMOVE REMOTE
  ======================================================= */

  removeRemote(
    playerId
  ) {

    if (
      !playerId
    ) {

      return;

    }


    const remote =
      this.remotePlayers.get(
        playerId
      );


    if (
      !remote
    ) {

      return;

    }


    remote.destroy();


    this.remotePlayers.delete(
      playerId
    );

  }


  /* =======================================================
     CLEAR REMOTES
  ======================================================= */

  clearRemotePlayers() {

    for (
      const remote of
      this.remotePlayers.values()
    ) {

      remote.destroy();

    }


    this.remotePlayers.clear();

  }


  /* =======================================================
     DAMAGE HANDLER
  ======================================================= */

  handleDamage(
    message
  ) {

    const targetId =
      message.targetId ||
      message.playerId ||
      message.id;


    const amount =
      Math.max(
        0,
        Math.min(
          100,
          number(
            message.amount ??
            message.damage,
            0
          )
        )
      );


    if (
      !targetId ||
      !amount
    ) {

      return;

    }


    if (
      targetId ===
      this.playerId
    ) {

      if (
        this.player &&
        typeof this.player.takeDamage ===
          "function"
      ) {

        this.player.takeDamage(
          amount
        );

      }


      return;

    }


    const remote =
      this.remotePlayers.get(
        targetId
      );


    if (
      remote
    ) {

      remote.health =
        Math.max(
          0,
          remote.health -
            amount
        );


      remote.alive =
        remote.health > 0;


      remote.setVisible(
        remote.alive
      );

    }

  }


  /* =======================================================
     RESPAWN HANDLER
  ======================================================= */

  handleRespawn(
    message
  ) {

    const playerId =
      message.playerId ||
      message.id;


    const team =
      message.team === "red" ||
      message.team === "blue"
        ? message.team
        : this.team;


    if (
      playerId ===
      this.playerId
    ) {

      this.team =
        team;


      this.applyLocalSpawn();


      this.sendPlayerUpdate(
        true
      );


      return;

    }


    const remote =
      this.remotePlayers.get(
        playerId
      );


    if (
      !remote
    ) {

      return;

    }


    remote.team =
      team;


    remote.health =
      100;


    remote.alive =
      true;


    const position =
      message.position || {};


    const x =
      message.x ??
      position.x;


    const y =
      message.y ??
      position.y;


    const z =
      message.z ??
      position.z;


    if (
      x !== undefined ||
      y !== undefined ||
      z !== undefined
    ) {

      remote.targetPosition.set(

        number(
          x,
          remote.targetPosition.x
        ),

        number(
          y,
          remote.targetPosition.y
        ),

        number(
          z,
          remote.targetPosition.z
        )

      );

    }


    remote.setVisible(
      true
    );

  }


  /* =======================================================
     LOCAL SPAWN
  ======================================================= */

  applyLocalSpawn(
    data = {}
  ) {

    if (
      !this.player ||
      !this.player.position
    ) {

      return;

    }


    /*
     * IMPORTANT:
     * The old map is kept.
     * We only use the old-map spawn points.
     */

    const points =
      this.team === "red"
        ? RED_SPAWNS
        : BLUE_SPAWNS;


    const spawn =
      points[
        this.spawnIndex %
        points.length
      ];


    this.spawnIndex =
      (
        this.spawnIndex +
        1
      ) %
      points.length;


    this.player.position.copy(
      spawn
    );


    this.player.health =
      100;


    if (
      this.player.velocity &&
      typeof this.player.velocity.set ===
        "function"
    ) {

      this.player.velocity.set(
        0,
        0,
        0
      );

    }


    if (
      "alive" in
      this.player
    ) {

      this.player.alive =
        true;

    }


    if (
      typeof this.player.updateHUD ===
        "function"
    ) {

      this.player.updateHUD();

    }

  }


  /* =======================================================
     ENEMY TARGETS
  ======================================================= */

  getEnemyTargets() {

    const result = [];


    for (
      const remote of
      this.remotePlayers.values()
    ) {

      if (
        !remote.alive ||
        remote.team ===
          this.team ||
        !remote.group
      ) {

        continue;

      }


      remote.group.traverse(
        (object) => {

          if (
            object.isMesh
          ) {

            result.push(
              object
            );

          }

        }
      );

    }


    return result;

  }


  /* =======================================================
     ALL TARGETS
  ======================================================= */

  getAllTargets() {

    const result = [];


    for (
      const remote of
      this.remotePlayers.values()
    ) {

      if (
        !remote.alive ||
        !remote.group
      ) {

        continue;

      }


      remote.group.traverse(
        (object) => {

          if (
            object.isMesh
          ) {

            result.push(
              object
            );

          }

        }
      );

    }


    return result;

  }


  /* =======================================================
     ROOM PLAYERS
  ======================================================= */

  getRoomPlayers() {

    const players = [

      {

        id:
          this.playerId,

        name:
          this.playerName,

        team:
          this.team,

        local:
          true

      }

    ];


    for (
      const remote of
      this.remotePlayers.values()
    ) {

      players.push({

        id:
          remote.id,

        name:
          remote.name,

        team:
          remote.team,

        local:
          false

      });

    }


    return players;

  }


  /* =======================================================
     ROOM CHANGED
  ======================================================= */

  notifyRoomChanged() {

    if (
      typeof this.onRoomChanged ===
      "function"
    ) {

      this.onRoomChanged({

        roomCode:
          this.roomCode,

        mode:
          this.mode,

        team:
          this.team,

        players:
          this.getRoomPlayers()

      });

    }

  }


  /* =======================================================
     PLAYER UPDATE
  ======================================================= */

  sendPlayerUpdate(
    force = false
  ) {

    if (
      !this.online ||
      !this.connected ||
      !this.player ||
      !this.playerId
    ) {

      return;

    }


    const now =
      performance.now() /
      1000;


    if (
      !force &&
      now -
        this.lastNetworkSend <
        this.networkInterval
    ) {

      return;

    }


    this.lastNetworkSend =
      now;


    const position =
      this.player.position;


    const yaw =
      this.player.yaw ??
      (
        this.player.camera
          ? this.player.camera.rotation.y
          : 0
      );


    const pitch =
      this.player.pitch ??
      (
        this.player.camera
          ? this.player.camera.rotation.x
          : 0
      );


    const health =
      number(
        this.player.health,
        100
      );


    const alive =
      health > 0;


    const moving =
      Boolean(
        this.player.velocity &&
        this.player.velocity.lengthSq() >
          0.01
      );


    /*
     * IMPORTANT FIX:
     *
     * The server expects:
     *
     * position: { x, y, z }
     * rotation: { x, y }
     *
     * We also send the old flat values for
     * compatibility with older clients.
     */

    this.send({

      type:
        "player_update",

      id:
        this.playerId,

      playerId:
        this.playerId,

      name:
        this.playerName,

      team:
        this.team,


      position: {

        x:
          Number(
            position.x
          ),

        y:
          Number(
            position.y
          ),

        z:
          Number(
            position.z
          )

      },


      rotation: {

        x:
          Number(
            pitch
          ),

        y:
          Number(
            yaw
          )

      },


      /*
       * Compatibility fields
       */

      x:
        Number(
          position.x
        ),

      y:
        Number(
          position.y
        ),

      z:
        Number(
          position.z
        ),

      yaw:
        Number(
          yaw
        ),

      pitch:
        Number(
          pitch
        ),


      health:
        health,

      alive:
        alive,

      moving:
        moving

    });

  }


  /* =======================================================
     SHOOT
  ======================================================= */

  shoot(
    targetId = null
  ) {

    if (
      !this.online
    ) {

      return;

    }


    this.send({

      type:
        "shoot",

      playerId:
        this.playerId,

      id:
        this.playerId,

      targetId:
        targetId

    });

  }


  /* =======================================================
     DAMAGE
  ======================================================= */

  damage(
    targetId,
    amount
  ) {

    if (
      !this.online ||
      !targetId
    ) {

      return;

    }


    this.send({

      type:
        "damage",

      targetId:
        targetId,

      amount:
        Math.max(
          0,
          Math.min(
            100,
            number(
              amount,
              0
            )
          )
        ),

      attackerId:
        this.playerId,

      playerId:
        this.playerId

    });

  }


  /* =======================================================
     RESPAWN REQUEST
  ======================================================= */

  respawn() {

    if (
      !this.online
    ) {

      return;

    }


    this.send({

      type:
        "respawn",

      playerId:
        this.playerId

    });

  }


  /* =======================================================
     UPDATE
  ======================================================= */

  update(
    delta
  ) {

    for (
      const remote of
      this.remotePlayers.values()
    ) {

      remote.update(
        delta
      );

    }


    this.sendPlayerUpdate(
      false
    );

  }


  /* =======================================================
     LEAVE
  ======================================================= */

  leave() {

    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.OPEN
    ) {

      this.send({

        type:
          "leave_room"

      });

    }


    this.online =
      false;


    this.roomCode =
      null;


    this.clearRemotePlayers();


    this.notifyRoomChanged();

  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {

    this.leave();


    if (
      this.socket
    ) {

      try {

        this.socket.close();

      } catch (
        _
      ) {}

    }


    this.socket =
      null;

    this.connected =
      false;

    this.connecting =
      false;

    this.connectPromise =
      null;


    this.clearRoomResponse();

  }

}


/* =========================================================
   EXPORT
========================================================= */

export {
  SERVER_URL
};