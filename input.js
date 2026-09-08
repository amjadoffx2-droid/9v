/* =========================================================
   INPUT.JS
   Desktop + Mobile FPS Input
========================================================= */

export class Input {

  constructor() {

    /* =================================================
       KEYBOARD
    ================================================= */

    this.keys = {};


    window.addEventListener(
      "keydown",
      (event) => {

        this.keys[event.code] =
          true;

      }
    );


    window.addEventListener(
      "keyup",
      (event) => {

        this.keys[event.code] =
          false;

      }
    );


    window.addEventListener(
      "blur",
      () => {

        this.keys = {};

        this.resetTouchState();

        this.fire = false;

      }
    );


    /* =================================================
       DESKTOP MOUSE LOOK
    ================================================= */

    this.mouseX = 0;
    this.mouseY = 0;

    this.mouseSensitivity =
      1;

    this.mouseLocked =
      false;


    document.addEventListener(
      "mousemove",
      (event) => {

        if (
          !this.mouseLocked
        ) {

          return;

        }


        this.mouseX +=
          Number(event.movementX) || 0;


        this.mouseY +=
          Number(event.movementY) || 0;

      }
    );


    document.addEventListener(
      "pointerlockchange",
      () => {

        this.mouseLocked =
          document.pointerLockElement !==
          null;

      }
    );


    /* =================================================
       FIRE
    ================================================= */

    this.fire =
      false;


    window.addEventListener(
      "mousedown",
      (event) => {

        if (
          event.button === 0
        ) {

          this.fire =
            true;

        }

      }
    );


    window.addEventListener(
      "mouseup",
      (event) => {

        if (
          event.button === 0
        ) {

          this.fire =
            false;

        }

      }
    );


    /* =================================================
       JOYSTICK
    ================================================= */

    this.joystickX =
      0;

    this.joystickY =
      0;

    this.joystickActive =
      false;

    this.joystickPointerId =
      null;

    this.joystickCenterX =
      0;

    this.joystickCenterY =
      0;

    this.joystickRadius =
      55;


    /* =================================================
       MOBILE CAMERA LOOK
    ================================================= */

    this.lookX =
      0;

    this.lookY =
      0;

    this.lookActive =
      false;

    this.lookPointerId =
      null;

    this.lookLastX =
      0;

    this.lookLastY =
      0;

    this.lookSensitivity =
      1;


    /* =================================================
       BUTTON STATES
    ================================================= */

    this.jump =
      false;

    this.crouch =
      false;

    this.aim =
      false;


    /* =================================================
       TOUCH SETUP
    ================================================= */

    this.setupTouchControls();

  }


  /* =====================================================
     KEYBOARD
  ===================================================== */

  isDown(
    code
  ) {

    return !!this.keys[code];

  }


  /* =====================================================
     MOVEMENT
  ===================================================== */

  getMovement() {

    let x =
      0;

    let z =
      0;


    /* Keyboard */

    if (
      this.isDown("KeyA") ||
      this.isDown("ArrowLeft")
    ) {

      x -=
        1;

    }


    if (
      this.isDown("KeyD") ||
      this.isDown("ArrowRight")
    ) {

      x +=
        1;

    }


    if (
      this.isDown("KeyW") ||
      this.isDown("ArrowUp")
    ) {

      z -=
        1;

    }


    if (
      this.isDown("KeyS") ||
      this.isDown("ArrowDown")
    ) {

      z +=
        1;

    }


    /* Mobile */

    if (
      this.joystickActive
    ) {

      x +=
        this.joystickX;

      z +=
        this.joystickY;

    }


    const length =
      Math.sqrt(
        x * x +
        z * z
      );


    if (
      length > 1
    ) {

      x /=
        length;

      z /=
        length;

    }


    return {
      x,
      z
    };

  }


  /* =====================================================
     POINTER LOCK
     DESKTOP ONLY
  ===================================================== */

  lockMouse() {

    /*
     * Never request pointer lock
     * on touch devices.
     */

    if (
      navigator.maxTouchPoints >
      0
    ) {

      return;

    }


    if (
      document.body.requestPointerLock
    ) {

      document.body.requestPointerLock();

    }

  }


  /* =====================================================
     MOUSE LOOK
  ===================================================== */

  consumeMouseMovement() {

    const movement = {

      x:
        this.mouseX,

      y:
        this.mouseY

    };


    this.mouseX =
      0;

    this.mouseY =
      0;


    return movement;

  }


  /* =====================================================
     MOBILE LOOK
  ===================================================== */

  consumeLook() {

    const movement = {

      x:
        this.lookX,

      y:
        this.lookY

    };


    this.lookX =
      0;

    this.lookY =
      0;


    return movement;

  }


  /* =====================================================
     RESET TOUCH STATE
  ===================================================== */

  resetTouchState() {

    this.joystickActive =
      false;

    this.joystickPointerId =
      null;

    this.joystickX =
      0;

    this.joystickY =
      0;


    this.lookActive =
      false;

    this.lookPointerId =
      null;

    this.lookX =
      0;

    this.lookY =
      0;


    this.jump =
      false;

    this.crouch =
      false;

    this.aim =
      false;


    const knob =
      document.getElementById(
        "joystickKnob"
      );


    if (knob) {

      knob.style.transform =
        "translate(-50%, -50%)";

    }

  }


  /* =====================================================
     TOUCH CONTROLS
  ===================================================== */

  setupTouchControls() {

    const joystick =
      document.getElementById(
        "joystick"
      );

    const joystickKnob =
      document.getElementById(
        "joystickKnob"
      );


    /* =================================================
       JOYSTICK
    ================================================= */

    if (
      joystick
    ) {

      joystick.addEventListener(
        "pointerdown",
        (event) => {

          if (
            event.pointerType !==
            "touch"
          ) {

            return;

          }


          event.preventDefault();


          /*
           * Ignore a second touch
           * on the joystick.
           */

          if (
            this.joystickActive
          ) {

            return;

          }


          this.joystickActive =
            true;

          this.joystickPointerId =
            event.pointerId;


          const rect =
            joystick.getBoundingClientRect();


          this.joystickCenterX =
            rect.left +
            rect.width / 2;


          this.joystickCenterY =
            rect.top +
            rect.height / 2;


          try {

            joystick.setPointerCapture(
              event.pointerId
            );

          } catch (_) {}


          this.updateJoystick(
            event.clientX,
            event.clientY,
            joystickKnob
          );

        },
        {
          passive: false
        }
      );


      joystick.addEventListener(
        "pointermove",
        (event) => {

          if (
            !this.joystickActive
          ) {

            return;

          }


          if (
            event.pointerId !==
            this.joystickPointerId
          ) {

            return;

          }


          event.preventDefault();


          this.updateJoystick(
            event.clientX,
            event.clientY,
            joystickKnob
          );

        },
        {
          passive: false
        }
      );


      const stopJoystick =
        (event) => {

          if (
            event.pointerId !==
            this.joystickPointerId
          ) {

            return;

          }


          this.joystickActive =
            false;

          this.joystickPointerId =
            null;

          this.joystickX =
            0;

          this.joystickY =
            0;


          if (
            joystickKnob
          ) {

            joystickKnob.style.transform =
              "translate(-50%, -50%)";

          }

        };


      joystick.addEventListener(
        "pointerup",
        stopJoystick
      );


      joystick.addEventListener(
        "pointercancel",
        stopJoystick
      );


      joystick.addEventListener(
        "lostpointercapture",
        () => {

          this.joystickActive =
            false;

          this.joystickPointerId =
            null;

          this.joystickX =
            0;

          this.joystickY =
            0;


          if (
            joystickKnob
          ) {

            joystickKnob.style.transform =
              "translate(-50%, -50%)";

          }

        }
      );

    }


    /* =================================================
       MOBILE CAMERA
       RIGHT HALF
    ================================================= */

    document.addEventListener(
      "pointerdown",
      (event) => {

        if (
          event.pointerType !==
          "touch"
        ) {

          return;

        }


        if (
          event.target.closest &&
          event.target.closest(
            "#joystick"
          )
        ) {

          return;

        }


        if (
          event.target.closest &&
          event.target.closest(
            "button,input,select"
          )
        ) {

          return;

        }


        if (
          event.clientX <
          window.innerWidth / 2
        ) {

          return;

        }


        /*
         * Only one camera finger.
         */

        if (
          this.lookActive
        ) {

          return;

        }


        event.preventDefault();


        this.lookActive =
          true;

        this.lookPointerId =
          event.pointerId;

        this.lookLastX =
          event.clientX;

        this.lookLastY =
          event.clientY;

      },
      {
        passive: false
      }
    );


    document.addEventListener(
      "pointermove",
      (event) => {

        if (
          !this.lookActive
        ) {

          return;

        }


        if (
          event.pointerId !==
          this.lookPointerId
        ) {

          return;

        }


        event.preventDefault();


        const dx =
          event.clientX -
          this.lookLastX;


        const dy =
          event.clientY -
          this.lookLastY;


        this.lookX +=
          dx *
          this.lookSensitivity;


        this.lookY +=
          dy *
          this.lookSensitivity;


        this.lookLastX =
          event.clientX;

        this.lookLastY =
          event.clientY;

      },
      {
        passive: false
      }
    );


    const stopLook =
      (event) => {

        if (
          event.pointerId !==
          this.lookPointerId
        ) {

          return;

        }


        this.lookActive =
          false;

        this.lookPointerId =
          null;

      };


    document.addEventListener(
      "pointerup",
      stopLook
    );


    document.addEventListener(
      "pointercancel",
      stopLook
    );


    /* =================================================
       FIRE
    ================================================= */

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

          this.fire =
            true;

        },
        {
          passive: false
        }
      );


      fireButton.addEventListener(
        "pointerup",
        () => {

          this.fire =
            false;

        }
      );


      fireButton.addEventListener(
        "pointercancel",
        () => {

          this.fire =
            false;

        }
      );

    }


    /* =================================================
       JUMP
    ================================================= */

    const jumpButton =
      document.getElementById(
        "jumpButton"
      );


    if (
      jumpButton
    ) {

      jumpButton.addEventListener(
        "pointerdown",
        (event) => {

          event.preventDefault();

          this.jump =
            true;

        },
        {
          passive: false
        }
      );


      jumpButton.addEventListener(
        "pointerup",
        () => {

          this.jump =
            false;

        }
      );


      jumpButton.addEventListener(
        "pointercancel",
        () => {

          this.jump =
            false;

        }
      );

    }


    /* =================================================
       CROUCH
    ================================================= */

    const crouchButton =
      document.getElementById(
        "crouchButton"
      );


    if (
      crouchButton
    ) {

      crouchButton.addEventListener(
        "pointerdown",
        (event) => {

          event.preventDefault();

          this.crouch =
            true;

        },
        {
          passive: false
        }
      );


      crouchButton.addEventListener(
        "pointerup",
        () => {

          this.crouch =
            false;

        }
      );


      crouchButton.addEventListener(
        "pointercancel",
        () => {

          this.crouch =
            false;

        }
      );

    }


    /* =================================================
       AIM
    ================================================= */

    const aimButton =
      document.getElementById(
        "aimButton"
      );


    if (
      aimButton
    ) {

      aimButton.addEventListener(
        "pointerdown",
        (event) => {

          event.preventDefault();

          this.aim =
            true;

        },
        {
          passive: false
        }
      );


      aimButton.addEventListener(
        "pointerup",
        () => {

          this.aim =
            false;

        }
      );


      aimButton.addEventListener(
        "pointercancel",
        () => {

          this.aim =
            false;

        }
      );

    }

  }


  /* =====================================================
     JOYSTICK CALCULATION
  ===================================================== */

  updateJoystick(
    clientX,
    clientY,
    knob
  ) {

    let dx =
      clientX -
      this.joystickCenterX;


    let dy =
      clientY -
      this.joystickCenterY;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance >
      this.joystickRadius
    ) {

      const scale =
        this.joystickRadius /
        distance;


      dx *=
        scale;

      dy *=
        scale;

    }


    this.joystickX =
      dx /
      this.joystickRadius;


    this.joystickY =
      dy /
      this.joystickRadius;


    if (
      knob
    ) {

      knob.style.transform =
        `translate(
          calc(-50% + ${dx}px),
          calc(-50% + ${dy}px)
        )`;

    }

  }

}