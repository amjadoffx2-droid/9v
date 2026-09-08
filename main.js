import { Engine } from "./engine.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { World } from "./world.js";
import { Weapon } from "./weapon.js";
import { Combat } from "./combat.js";
import { MatchTimer } from "./matchTimer.js";
import { Multiplayer } from "./multiplayer.js";

/* =========================================================
   GAME ELEMENTS
========================================================= */

const container =
  document.getElementById("game");

const startScreen =
  document.getElementById("startScreen");

const startButton =
  document.getElementById("startButton");


/* =========================================================
   GAME SYSTEMS
========================================================= */

let engine = null;
let input = null;
let player = null;
let world = null;
let weapon = null;
let combat = null;
let matchTimer = null;
let multiplayer = null;

let gameStarted = false;

let lobbyMode =
  "online";


/* =========================================================
   MOBILE DETECTION
========================================================= */

function isMobileDevice() {

  return (
    window.matchMedia &&
    window.matchMedia(
      "(pointer: coarse)"
    ).matches
  ) ||
  navigator.maxTouchPoints > 0;

}


/* =========================================================
   ONLINE LOBBY
========================================================= */

function addLobbyUI() {

  if (
    !startScreen ||
    document.getElementById(
      "onlineLobby"
    )
  ) {

    return;

  }


  const panel =
    document.querySelector(
      ".startPanel"
    );


  if (!panel) {

    return;

  }


  const lobby =
    document.createElement(
      "div"
    );


  lobby.id =
    "onlineLobby";


  lobby.style.marginTop =
    "18px";

  lobby.style.paddingTop =
    "15px";

  lobby.style.borderTop =
    "1px solid rgba(255,255,255,.12)";


  lobby.innerHTML = `

    <div
      style="
        display:grid;
        gap:8px;
        text-align:left
      "
    >

      <label
        style="
          font-size:9px;
          letter-spacing:1.5px;
          color:rgba(255,255,255,.5)
        "
      >
        YOUR NAME
      </label>

      <input
        id="onlineName"
        maxlength="16"
        value="PLAYER"
        autocomplete="off"
        style="
          box-sizing:border-box;
          width:100%;
          height:42px;
          padding:0 12px;
          background:#101317;
          border:1px solid rgba(255,255,255,.12);
          color:white;
          outline:none
        "
      >

      <label
        style="
          font-size:9px;
          letter-spacing:1.5px;
          color:rgba(255,255,255,.5);
          margin-top:4px
        "
      >
        MODE
      </label>

      <select
        id="onlineMode"
        style="
          box-sizing:border-box;
          width:100%;
          height:42px;
          padding:0 12px;
          background:#101317;
          border:1px solid rgba(255,255,255,.12);
          color:white;
          outline:none
        "
      >

        <option value="1v1">
          1V1
        </option>

        <option value="2v2">
          2V2
        </option>

        <option value="3v3">
          3V3
        </option>

        <option value="4v4">
          4V4
        </option>

      </select>

      <label
        style="
          font-size:9px;
          letter-spacing:1.5px;
          color:rgba(255,255,255,.5);
          margin-top:4px
        "
      >
        TEAM
      </label>

      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px
        "
      >

        <button
          id="blueTeamButton"
          type="button"
          style="
            height:40px;
            border:1px solid rgba(70,150,255,.5);
            background:rgba(50,120,255,.18);
            color:white;
            font-weight:800
          "
        >
          BLUE
        </button>

        <button
          id="redTeamButton"
          type="button"
          style="
            height:40px;
            border:1px solid rgba(255,80,80,.35);
            background:rgba(255,50,50,.08);
            color:white;
            font-weight:800
          "
        >
          RED
        </button>

      </div>

      <button
        id="createRoomButton"
        type="button"
        style="
          height:44px;
          margin-top:5px;
          border:0;
          background:white;
          color:#050608;
          font-weight:900;
          letter-spacing:1.5px
        "
      >
        CREATE ROOM
      </button>

      <div
        style="
          display:grid;
          grid-template-columns:1fr auto;
          gap:8px;
          margin-top:2px
        "
      >

        <input
          id="roomCodeInput"
          maxlength="12"
          placeholder="ROOM CODE"
          style="
            box-sizing:border-box;
            width:100%;
            height:42px;
            padding:0 12px;
            background:#101317;
            border:1px solid rgba(255,255,255,.12);
            color:white;
            outline:none;
            text-transform:uppercase
          "
        >

        <button
          id="joinRoomButton"
          type="button"
          style="
            height:42px;
            padding:0 16px;
            border:1px solid rgba(255,255,255,.2);
            background:#171b20;
            color:white;
            font-weight:800
          "
        >
          JOIN
        </button>

      </div>

      <div
        id="onlineStatus"
        style="
          min-height:28px;
          text-align:center;
          font-size:9px;
          line-height:14px;
          color:rgba(255,255,255,.45);
          letter-spacing:1px
        "
      ></div>

      <div
        id="roomShare"
        style="
          display:none;
          text-align:center;
          padding:9px;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.1)
        "
      >

        <div
          style="
            font-size:8px;
            color:rgba(255,255,255,.4);
            letter-spacing:1.5px
          "
        >
          SEND THIS CODE TO YOUR FRIEND
        </div>

        <div
          id="roomCodeDisplay"
          style="
            font-size:25px;
            font-weight:900;
            letter-spacing:4px;
            color:white;
            margin-top:3px
          "
        ></div>

        <div
          id="roomPlayers"
          style="
            font-size:8px;
            color:rgba(255,255,255,.5);
            margin-top:4px
          "
        ></div>

      </div>

    </div>

  `;


  panel.insertBefore(
    lobby,
    startButton
  );


  const nameInput =
    document.getElementById(
      "onlineName"
    );

  const modeInput =
    document.getElementById(
      "onlineMode"
    );

  const roomInput =
    document.getElementById(
      "roomCodeInput"
    );

  const createButton =
    document.getElementById(
      "createRoomButton"
    );

  const joinButton =
    document.getElementById(
      "joinRoomButton"
    );

  const blueButton =
    document.getElementById(
      "blueTeamButton"
    );

  const redButton =
    document.getElementById(
      "redTeamButton"
    );

  const status =
    document.getElementById(
      "onlineStatus"
    );


  let selectedTeam =
    "blue";


  function selectTeam(
    team
  ) {

    selectedTeam =
      team;


    blueButton.style.background =
      team === "blue"
        ? "rgba(50,120,255,.35)"
        : "rgba(50,120,255,.08)";


    redButton.style.background =
      team === "red"
        ? "rgba(255,50,50,.28)"
        : "rgba(255,50,50,.08)";

  }


  selectTeam(
    "blue"
  );


  blueButton.addEventListener(
    "click",
    () => {

      selectTeam(
        "blue"
      );

    }
  );


  redButton.addEventListener(
    "click",
    () => {

      selectTeam(
        "red"
      );

    }
  );


  const getName =
    () => {

      return (
        (
          nameInput.value ||
          "PLAYER"
        )
          .trim() ||
        "PLAYER"
      );

    };


  function setStatus(
    text
  ) {

    status.textContent =
      text;

  }


  async function prepareMultiplayer() {

    if (
      !engine ||
      !multiplayer
    ) {

      throw new Error(
        "MULTIPLAYER IS NOT INITIALIZED."
      );

    }


    multiplayer.onStatus =
      setStatus;


    multiplayer.onError =
      (error) => {

        setStatus(
          error?.message ||
          "MULTIPLAYER ERROR."
        );


        createButton.disabled =
          false;

        joinButton.disabled =
          false;

      };


    multiplayer.onRoomChanged =
      (room) => {

        if (!room) {

          return;

        }


        const share =
          document.getElementById(
            "roomShare"
          );

        const code =
          document.getElementById(
            "roomCodeDisplay"
          );

        const players =
          document.getElementById(
            "roomPlayers"
          );


        if (
          room.roomCode
        ) {

          share.style.display =
            "block";


          code.textContent =
            room.roomCode;


          const count =
            Array.isArray(
              room.players
            )
              ? room.players.length
              : 1;


          players.textContent =
            `${count} PLAYER${
              count === 1
                ? ""
                : "S"
            } IN ROOM`;

        }

      };


    return multiplayer;

  }


  createButton.addEventListener(
    "click",
    async () => {

      createButton.disabled =
        true;

      joinButton.disabled =
        true;


      setStatus(
        "STARTING ONLINE ROOM..."
      );


      try {

        const mp =
          await prepareMultiplayer();


        await mp.connectAndCreate({
          name:
            getName(),

          mode:
            modeInput.value,

          team:
            selectedTeam
        });


        if (
          combat &&
          typeof combat.enableOnline ===
            "function"
        ) {

          combat.enableOnline();

        }


        mp.applyLocalSpawn();


        startButton.textContent =
          "ENTER MATCH";


        setStatus(
          `ROOM ${mp.roomCode} READY • SEND THE CODE TO YOUR FRIEND`
        );


      } catch (
        error
      ) {

        console.error(
          "CREATE ROOM ERROR:",
          error
        );


        setStatus(
          error?.message ||
          "COULD NOT CREATE ROOM."
        );

      } finally {

        createButton.disabled =
          false;

        joinButton.disabled =
          false;

      }

    }
  );


  joinButton.addEventListener(
    "click",
    async () => {

      const code =
        (
          roomInput.value ||
          ""
        )
          .trim()
          .toUpperCase();


      if (!code) {

        setStatus(
          "ENTER THE ROOM CODE FIRST."
        );

        return;

      }


      createButton.disabled =
        true;

      joinButton.disabled =
        true;


      setStatus(
        "JOINING ROOM..."
      );


      try {

        const mp =
          await prepareMultiplayer();


        await mp.connectAndJoin({
          name:
            getName(),

          roomCode:
            code,

          team:
            selectedTeam
        });


        if (
          combat &&
          typeof combat.enableOnline ===
            "function"
        ) {

          combat.enableOnline();

        }


        mp.applyLocalSpawn();


        startButton.textContent =
          "ENTER MATCH";


        setStatus(
          `JOINED ROOM ${mp.roomCode}`
        );


      } catch (
        error
      ) {

        console.error(
          "JOIN ROOM ERROR:",
          error
        );


        setStatus(
          error?.message ||
          "COULD NOT JOIN ROOM."
        );

      } finally {

        createButton.disabled =
          false;

        joinButton.disabled =
          false;

      }

    }
  );

}


/* =========================================================
   CREATE GAME
========================================================= */

function createGame() {

  engine =
    new Engine(
      container
    );


  input =
    new Input();


  world =
    new World(
      engine
    );


  player =
    new Player(
      engine,
      input
    );


  /*
   * Multiplayer MUST be created
   * before Combat.
   */

  multiplayer =
    new Multiplayer(
      engine,
      player
    );


  engine.multiplayer =
    multiplayer;


  weapon =
    new Weapon(
      engine,
      input,
      player
    );


  combat =
    new Combat(
      engine,
      player
    );


  engine.combat =
    combat;

  engine.world =
    world;


  multiplayer.engine =
    engine;

  multiplayer.player =
    player;


  matchTimer =
    new MatchTimer(
      600
    );


  engine.addSystem(
    player
  );

  engine.addSystem(
    weapon
  );

  engine.addSystem(
    combat
  );

  engine.addSystem(
    matchTimer
  );

}


/* =========================================================
   START MATCH
========================================================= */

function startGame() {

  if (
    gameStarted
  ) {

    return;

  }


  if (
    lobbyMode ===
      "online" &&
    (
      !multiplayer ||
      !multiplayer.online
    )
  ) {

    const status =
      document.getElementById(
        "onlineStatus"
      );


    if (status) {

      status.textContent =
        "CREATE OR JOIN A ROOM FIRST.";

    }


    return;

  }


  gameStarted =
    true;


  if (startScreen) {

    startScreen.style.display =
      "none";

  }


  /*
   * IMPORTANT:
   *
   * Pointer Lock is for desktop only.
   * NEVER request it on mobile/touch.
   */

  if (
    input &&
    !isMobileDevice()
  ) {

    input.lockMouse();

  }


  if (engine) {

    engine.start();

  }

}


/* =========================================================
   START BUTTON
========================================================= */

if (
  startButton
) {

  startButton.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      startGame();

    }
  );

}


/* =========================================================
   POINTER LOCK — DESKTOP ONLY
========================================================= */

document.addEventListener(
  "pointerdown",
  (event) => {

    if (
      !gameStarted
    ) {

      return;

    }


    /*
     * Mobile/touch:
     * DO NOT request pointer lock.
     */

    if (
      isMobileDevice() ||
      event.pointerType ===
        "touch"
    ) {

      return;

    }


    if (
      event.target &&
      event.target.closest &&
      event.target.closest(
        "button,input,select"
      )
    ) {

      return;

    }


    if (input) {

      input.lockMouse();

    }

  }
);


/* =========================================================
   MOBILE FIRE
========================================================= */

const fireButton =
  document.getElementById(
    "fireButton"
  );


if (
  fireButton
) {

  fireButton.addEventListener(
    "pointerdown",
    (event) => {

      event.preventDefault();

      if (input) {

        input.fire =
          true;

      }

    },
    {
      passive: false
    }
  );


  fireButton.addEventListener(
    "pointerup",
    (event) => {

      event.preventDefault();

      if (input) {

        input.fire =
          false;

      }

    },
    {
      passive: false
    }
  );


  fireButton.addEventListener(
    "pointercancel",
    () => {

      if (input) {

        input.fire =
          false;

      }

    }
  );

}


/* =========================================================
   MOBILE RELOAD
========================================================= */

const reloadButton =
  document.getElementById(
    "reloadButton"
  );


if (
  reloadButton
) {

  reloadButton.addEventListener(
    "pointerdown",
    (event) => {

      event.preventDefault();


      if (
        weapon &&
        typeof weapon.startReload ===
          "function"
      ) {

        weapon.startReload();

      }

    },
    {
      passive: false
    }
  );

}


/* =========================================================
   VISIBILITY
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      input
    ) {

      input.fire =
        false;

      input.resetTouchState();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

createGame();

addLobbyUI();