    // Keeps the state of keys/buttons
    //
    // You can check
    //
    //   inputManager.keys.left.down
    //
    // to see if the left key is currently held down
    // and you can check
    //
    //   inputManager.keys.left.justPressed
    //
    // To see if the left key was pressed this frame
    //
    // Keys are 'left', 'right', 'a', 'b', 'up', 'down'
    export class InputManager {
      public keys = {};
      constructor() {
        const keyMap = new Map();
     
        const setKey = (keyName, pressed) => {
          const keyState = this.keys[keyName];
          keyState.justPressed = pressed && !keyState.down;
          keyState.down = pressed;
        };
     
        const addKey = (keyCode, name) => {
          this.keys[name] = { down: false, justPressed: false };
          keyMap.set(keyCode, name);
        };
     
        const setKeyFromKeyCode = (keyCode, pressed) => {
          const keyName = keyMap.get(keyCode);
          if (!keyName) {
            return;
          }
          setKey(keyName, pressed);
        };
     
        addKey(37, 'left');
        addKey(39, 'right');
        addKey(32, 'space');
     
        window.addEventListener('keydown', (e) => {
          setKeyFromKeyCode(e.keyCode, true);
        });
        window.addEventListener('keyup', (e) => {
          setKeyFromKeyCode(e.keyCode, false);
        });
      }

      isDown(key: string) {
        return this.keys[key] && this.keys[key].down;
      }

      isPressed(key: string) {
        return this.keys[key] && this.keys[key].justPressed;
      }

      update() {
        for (const keyState of Object.values(this.keys)) {
          if (keyState['justPressed']) {
            keyState['justPressed'] = false;
          }
        }
      }
    }