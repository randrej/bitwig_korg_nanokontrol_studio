// Scene management for nanoKONTROL Studio
// Handles switching between different scenes based on sysex messages

// So far I haven't figured out what I could do w/ 5 different scenes, so they
// all behave the same and I just print the scene name to console.

export enum Scene {
  SCENE1 = 0,
  SCENE2 = 1,
  SCENE3 = 2,
  SCENE4 = 3,
  SCENE5 = 4,
}

// Get scene name for display
export function getSceneName(scene: Scene): string {
  switch (scene) {
    case Scene.SCENE1:
      return 'Scene 1';
    case Scene.SCENE2:
      return 'Scene 2';
    case Scene.SCENE3:
      return 'Scene 3';
    case Scene.SCENE4:
      return 'Scene 4';
    case Scene.SCENE5:
      return 'Scene 5';
    default:
      return 'Unknown Scene';
  }
}

export class SceneManager {
  private currentScene: Scene = Scene.SCENE1;

  // Sysex message mappings for scene detection
  private static readonly SCENE_SYSEX_MAP: { [key: string]: Scene } = {
    f042400001370200004f00f7: Scene.SCENE1,
    f042400001370200004f01f7: Scene.SCENE2,
    f042400001370200004f02f7: Scene.SCENE3,
    f042400001370200004f03f7: Scene.SCENE4,
    f042400001370200004f04f7: Scene.SCENE5,
  };

  constructor(private onSceneChange: (scene: Scene) => void) {
    this.onSceneChange(this.currentScene);
  }

  getCurrentScene(): Scene {
    return this.currentScene;
  }

  setScene(scene: Scene): void {
    if (this.currentScene !== scene) {
      this.currentScene = scene;
      this.onSceneChange(scene);
    }
  }

  // Process incoming sysex message and switch scene if it matches
  processSysexMessage(sysexData: string): boolean {
    const normalizedSysex = sysexData.toLowerCase().replace(/\s/g, '');
    const scene = SceneManager.SCENE_SYSEX_MAP[normalizedSysex];

    if (scene !== undefined) {
      this.setScene(scene);
      return true;
    }

    return false;
  }

}
