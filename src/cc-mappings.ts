// nanoKONTROL Studio CC mappings

// Utility/transport buttons
export enum UtilityButtons {
  CYCLE,
  REW,
  FF,
  STOP,
  PLAY,
  REC,
  PREV_TRACK,
  NEXT_TRACK,
  SET,
  PREV_MARKER,
  NEXT_MARKER,
  BACK,
}

// Jog wheel controls
export enum JogControls {
  DEC,
  INC,
}

// Per-channel controls (8 channels each)
export enum PerChannelControls {
  SLIDER,
  KNOB,
  SOLO,
  MUTE,
  REC,
  SEL,
}

// Control type differentiation
export enum ControlType {
  BUTTON,
  POT_SLIDER,
}

// Mapping from UtilityButtons to CC values
export const UTILITY_BUTTON_TO_CC: Record<UtilityButtons, number> = {
  [UtilityButtons.CYCLE]: 54,
  [UtilityButtons.REW]: 58,
  [UtilityButtons.FF]: 59,
  [UtilityButtons.STOP]: 63,
  [UtilityButtons.PLAY]: 80,
  [UtilityButtons.REC]: 81,
  [UtilityButtons.PREV_TRACK]: 60,
  [UtilityButtons.NEXT_TRACK]: 61,
  [UtilityButtons.BACK]: 62,
  [UtilityButtons.SET]: 55,
  [UtilityButtons.PREV_MARKER]: 56,
  [UtilityButtons.NEXT_MARKER]: 57,
};

// Mapping from JogControls to CC values
export const JOG_CONTROL_TO_CC: Record<JogControls, number> = {
  [JogControls.DEC]: 85,
  [JogControls.INC]: 83,
};

// Reverse mappings (programmatically generated)
export const CC_TO_UTILITY_BUTTON: Record<number, UtilityButtons> = (() => {
  const result: Record<number, UtilityButtons> = {};
  for (const buttonStr in UTILITY_BUTTON_TO_CC) {
    const button = Number(buttonStr) as UtilityButtons;
    const cc = UTILITY_BUTTON_TO_CC[button];
    result[cc] = button;
  }
  return result;
})();

export const CC_TO_JOG_CONTROL: Record<number, JogControls> = (() => {
  const result: Record<number, JogControls> = {};
  for (const controlStr in JOG_CONTROL_TO_CC) {
    const control = Number(controlStr) as JogControls;
    const cc = JOG_CONTROL_TO_CC[control];
    result[cc] = control;
  }
  return result;
})();

// Per-channel control mappings (channel 0-7)
export interface ChannelControls {
  slider: number;
  knob: number;
  solo: number;
  mute: number;
  rec: number;
  sel: number;
}

export const CHANNEL_CONTROLS: ChannelControls[] = [
  // Channel 0
  { slider: 2, knob: 13, solo: 29, mute: 21, rec: 38, sel: 46 },
  // Channel 1
  { slider: 3, knob: 14, solo: 30, mute: 22, rec: 39, sel: 47 },
  // Channel 2
  { slider: 4, knob: 15, solo: 31, mute: 23, rec: 40, sel: 48 },
  // Channel 3
  { slider: 5, knob: 16, solo: 33, mute: 24, rec: 41, sel: 49 },
  // Channel 4
  { slider: 6, knob: 17, solo: 34, mute: 25, rec: 42, sel: 50 },
  // Channel 5
  { slider: 8, knob: 18, solo: 35, mute: 26, rec: 43, sel: 51 },
  // Channel 6
  { slider: 9, knob: 19, solo: 36, mute: 27, rec: 44, sel: 52 },
  // Channel 7
  { slider: 12, knob: 20, solo: 37, mute: 28, rec: 45, sel: 53 },
];

// Control info for reverse mapping
export interface ControlInfo {
  channel: number;
  control: PerChannelControls;
  type: ControlType;
}

// Reverse mapping from CC to channel control info
export const CC_TO_CHANNEL_CONTROL: Record<number, ControlInfo> = (() => {
  const mapping: Record<number, ControlInfo> = {};

  CHANNEL_CONTROLS.forEach((channelControls, channelIndex) => {
    mapping[channelControls.slider] = {
      channel: channelIndex,
      control: PerChannelControls.SLIDER,
      type: ControlType.POT_SLIDER,
    };
    mapping[channelControls.knob] = {
      channel: channelIndex,
      control: PerChannelControls.KNOB,
      type: ControlType.POT_SLIDER,
    };
    mapping[channelControls.solo] = {
      channel: channelIndex,
      control: PerChannelControls.SOLO,
      type: ControlType.BUTTON,
    };
    mapping[channelControls.mute] = {
      channel: channelIndex,
      control: PerChannelControls.MUTE,
      type: ControlType.BUTTON,
    };
    mapping[channelControls.rec] = {
      channel: channelIndex,
      control: PerChannelControls.REC,
      type: ControlType.BUTTON,
    };
    mapping[channelControls.sel] = {
      channel: channelIndex,
      control: PerChannelControls.SEL,
      type: ControlType.BUTTON,
    };
  });

  return mapping;
})();

// Button press/release state
export enum ButtonState {
  PRESS,
  RELEASE,
}

// Sum type for all possible control events
export type ControlEvent =
  | {
      type: 'utility_button';
      button: UtilityButtons;
      state: ButtonState;
    }
  | {
      type: 'jog_control';
      control: JogControls;
      value: number;
    }
  | {
      type: 'channel_button';
      channel: number;
      control: PerChannelControls;
      state: ButtonState;
    }
  | {
      type: 'channel_pot';
      channel: number;
      control: PerChannelControls;
      value: number;
    }
  | {
      type: 'unknown';
    };

// Function to parse CC messages into structured events
export function parseControlEvent(cc: number, value: number): ControlEvent {
  // Check utility buttons
  if (cc in CC_TO_UTILITY_BUTTON) {
    return {
      type: 'utility_button',
      button: CC_TO_UTILITY_BUTTON[cc],
      state: value > 0 ? ButtonState.PRESS : ButtonState.RELEASE,
    };
  }

  // Check jog controls
  if (cc in CC_TO_JOG_CONTROL) {
    return {
      type: 'jog_control',
      control: CC_TO_JOG_CONTROL[cc],
      value,
    };
  }

  // Check channel controls
  if (cc in CC_TO_CHANNEL_CONTROL) {
    const controlInfo = CC_TO_CHANNEL_CONTROL[cc];

    if (controlInfo.type === ControlType.BUTTON) {
      return {
        type: 'channel_button',
        channel: controlInfo.channel,
        control: controlInfo.control,
        state: value > 0 ? ButtonState.PRESS : ButtonState.RELEASE,
      };
    } else {
      return {
        type: 'channel_pot',
        channel: controlInfo.channel,
        control: controlInfo.control,
        value,
      };
    }
  }

  // Unknown CC
  return {
    type: 'unknown',
  };
}
