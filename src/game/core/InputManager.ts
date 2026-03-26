export class InputManager {
  keys: Record<string, boolean> = {};
  movementX: number = 0;
  movementY: number = 0;
  isMouseDown: boolean = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'F1') {
      e.preventDefault();
      document.exitPointerLock();
    }
    this.keys[e.code] = true;
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

  handleMouseMove(e: MouseEvent) {
    if (document.pointerLockElement) {
      this.movementX += e.movementX;
      this.movementY += e.movementY;
    }
  }

  handleMouseDown() {
    if (document.pointerLockElement) {
      this.isMouseDown = true;
    }
  }

  handleMouseUp() {
    this.isMouseDown = false;
  }

  consumeMovement() {
    const mx = this.movementX;
    const my = this.movementY;
    this.movementX = 0;
    this.movementY = 0;
    return { mx, my };
  }
  
  consumeClick() {
    const clicked = this.isMouseDown;
    this.isMouseDown = false;
    return clicked;
  }

  isKeyDown(code: string) {
    return !!this.keys[code];
  }
}
