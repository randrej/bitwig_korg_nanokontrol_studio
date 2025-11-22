import {
  ButtonState,
  UtilityButtons,
  PerChannelControls,
  parseControlEvent,
} from './cc-mappings';
import { Mode, ModeManager } from './mode-manager';
import { handleJogControl } from './jog-handler';

export interface BitwigDependencies {
  transport: API.Transport;
  application: API.Application;
  cursorTrack: API.CursorTrack;
  primaryDevice: API.CursorDevice;
  arranger: API.Arranger;
  trackBank: API.TrackBank;
}

// Transport button state tracking for combinations
let shiftPressed = false;
let stopPressed = false;
let playPressed = false;
let recPressed = false;

// Track current panel layout for toggling
let isArrangerView = true;

// Main entry point for processing MIDI CC messages
export function processMidiCC(
  cc: number,
  value: number,
  modeManager: ModeManager,
  deps: BitwigDependencies
): void {
  const event = parseControlEvent(cc, value);

  // Track transport button states for combinations
  if (event.type === 'utility_button') {
    if (event.button === UtilityButtons.BACK) {
      shiftPressed = event.state === ButtonState.PRESS;
    } else if (event.button === UtilityButtons.STOP) {
      stopPressed = event.state === ButtonState.PRESS;
    } else if (event.button === UtilityButtons.PLAY) {
      playPressed = event.state === ButtonState.PRESS;
    } else if (event.button === UtilityButtons.REC) {
      recPressed = event.state === ButtonState.PRESS;
    }
  }

  const {
    transport,
    application,
    cursorTrack,
    primaryDevice,
    arranger,
    trackBank,
  } = deps;
  const currentMode = modeManager.getCurrentMode();

  if (event.type === 'utility_button') {
    // Only process button presses for most buttons, but handle combinations
    if (event.state === ButtonState.RELEASE) {
      return;
    }

    // Check for triple button combination (engine toggle)
    if (stopPressed && playPressed && recPressed) {
      // Toggle engine state when all three transport buttons are pressed
      if (!application.hasActiveEngine()) {
        application.activateEngine();
      }
      return;
    }

    if (event.button === UtilityButtons.PLAY) {
      if (shiftPressed) {
        transport.tapTempo();
      } else {
        transport.play();
      }
    } else if (event.button === UtilityButtons.STOP) {
      if (shiftPressed && !playPressed && !recPressed) {
        transport.resetAutomationOverrides();
      } else if (!shiftPressed && !playPressed && !recPressed) {
        transport.stop();
      }
    } else if (event.button === UtilityButtons.REC) {
      if (shiftPressed && !playPressed && !stopPressed) {
        cursorTrack.arm().toggle();
      } else if (!shiftPressed && !playPressed && !stopPressed) {
        transport.record();
      }
    } else if (event.button === UtilityButtons.CYCLE) {
      transport.isArrangerLoopEnabled().toggle();
    } else if (event.button === UtilityButtons.SET) {
      if (shiftPressed) {
        if (isArrangerView) {
          application.setPanelLayout('MIX');
          isArrangerView = false;
        } else {
          application.setPanelLayout('ARRANGE');
          isArrangerView = true;
        }
      } else {
        modeManager.switchMode();
      }
    } else if (event.button === UtilityButtons.REW) {
      transport.rewind();
    } else if (event.button === UtilityButtons.FF) {
      if (shiftPressed) {
        arranger.isPlaybackFollowEnabled().toggle();
      } else {
        transport.fastForward();
      }
    } else if (event.button === UtilityButtons.PREV_TRACK) {
      cursorTrack.selectPrevious();
    } else if (event.button === UtilityButtons.NEXT_TRACK) {
      if (shiftPressed) {
        cursorTrack.duplicate();
      } else {
        cursorTrack.selectNext();
      }
    } else if (event.button === UtilityButtons.PREV_MARKER) {
      if (shiftPressed) {
        transport.isMetronomeAudibleDuringPreRoll().toggle();
      } else {
        transport.jumpToPreviousCueMarker();
      }
    } else if (event.button === UtilityButtons.NEXT_MARKER) {
      if (shiftPressed) {
        transport.isMetronomeEnabled().toggle();
      } else {
        transport.jumpToNextCueMarker();
      }
    }
  } else if (event.type === 'jog_control') {
    handleJogControl(event.control, event.value, transport, shiftPressed);
  } else if (event.type === 'channel_button') {
    if (event.state === ButtonState.RELEASE) {
      return;
    }

    const track = trackBank.getItemAt(event.channel);

    if (currentMode === Mode.MIXER) {
      if (event.control === PerChannelControls.SOLO) {
        track.solo().toggle(shiftPressed);
      } else if (event.control === PerChannelControls.MUTE) {
        track.mute().toggle();
      } else if (event.control === PerChannelControls.REC) {
        track.arm().toggle();
      } else if (event.control === PerChannelControls.SEL) {
        cursorTrack.selectChannel(track);
      }
    }
    // in device mode solo, mute, ... buttons do nothing
  } else if (event.type === 'channel_pot') {
    const track = trackBank.getItemAt(event.channel);

    if (event.control === PerChannelControls.SLIDER) {
      if (currentMode === Mode.MIXER) {
        track.volume().set(event.value, 128);
      } else {
        // DEVICE mode
        primaryDevice.getMacro(event.channel).getAmount().set(event.value, 128);
      }
    } else if (event.control === PerChannelControls.KNOB) {
      if (currentMode === Mode.MIXER) {
        track.pan().set(event.value, 128);
      } else {
        // DEVICE mode
        primaryDevice.getParameter(event.channel).set(event.value, 128);
      }
    }
  } else if (event.type === 'unknown') {
    println('Unknown CC received');
  }
}
