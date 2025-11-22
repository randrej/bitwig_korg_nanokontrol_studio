export enum Mode {
  MIXER = 0,
  DEVICE = 1,
}

export class ModeManager {
  private currentMode: Mode = Mode.MIXER;

  constructor(private onModeChange: (mode: Mode) => void) {
    this.onModeChange(this.currentMode);
  }

  getCurrentMode(): Mode {
    return this.currentMode;
  }

  switchMode(): void {
    if (this.currentMode === Mode.MIXER) {
      this.setMode(Mode.DEVICE);
    } else {
      this.setMode(Mode.MIXER);
    }
  }

  setMode(mode: Mode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      this.onModeChange(mode);
    }
  }
}
