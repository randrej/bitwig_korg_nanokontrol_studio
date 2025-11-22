// LED management for nanoKONTROL Studio
// Handles LED state tracking and efficient MIDI output

import {
  UtilityButtons,
  PerChannelControls,
  UTILITY_BUTTON_TO_CC,
  CHANNEL_CONTROLS,
  ChannelControls,
} from './cc-mappings';

export class LEDManager {
  private ledState: Record<number, boolean> = {};
  private midiOut: API.MidiOut;

  constructor(private host: API.ControllerHost) {
    this.midiOut = host.getMidiOutPort(0);

    const utilityCCs: number[] = [];
    for (const button in UTILITY_BUTTON_TO_CC) {
      utilityCCs.push(UTILITY_BUTTON_TO_CC[Number(button) as UtilityButtons]);
    }

    const channelCCs: number[] = [];
    CHANNEL_CONTROLS.forEach((channel: ChannelControls) => {
      channelCCs.push(channel.solo, channel.mute, channel.rec, channel.sel);
    });

    const allCCs = [...utilityCCs, ...channelCCs];

    allCCs.forEach(cc => {
      this.ledState[cc] = false;
    });
  }

  private setLED(cc: number, on: boolean): void {
    if (this.ledState[cc] !== on) {
      this.ledState[cc] = on;
      const value = on ? 127 : 0;
      this.midiOut.sendMidi(176, cc, value);
    }
    this.ledState[cc] = on;
  }

  setUtilityLED(button: UtilityButtons, on: boolean): void {
    const cc = UTILITY_BUTTON_TO_CC[button];
    this.setLED(cc, on);
  }

  setChannelLED(
    channel: number,
    control: PerChannelControls,
    on: boolean
  ): void {
    if (channel < 0 || channel >= 8) {
      return;
    }

    const channelControls = CHANNEL_CONTROLS[channel];
    let cc: number;

    if (control === PerChannelControls.SOLO) {
      cc = channelControls.solo;
    } else if (control === PerChannelControls.MUTE) {
      cc = channelControls.mute;
    } else if (control === PerChannelControls.REC) {
      cc = channelControls.rec;
    } else if (control === PerChannelControls.SEL) {
      cc = channelControls.sel;
    } else {
      return; // Invalid control for LED
    }

    this.setLED(cc, on);
  }

  getUtilityLEDState(button: UtilityButtons): boolean {
    const cc = UTILITY_BUTTON_TO_CC[button];
    return this.ledState[cc] ?? false;
  }

  getChannelLEDState(channel: number, control: PerChannelControls): boolean {
    if (channel < 0 || channel >= 8) {
      return false;
    }

    const channelControls = CHANNEL_CONTROLS[channel];
    let cc: number;

    if (control === PerChannelControls.SOLO) {
      cc = channelControls.solo;
    } else if (control === PerChannelControls.MUTE) {
      cc = channelControls.mute;
    } else if (control === PerChannelControls.REC) {
      cc = channelControls.rec;
    } else if (control === PerChannelControls.SEL) {
      cc = channelControls.sel;
    } else {
      return false;
    }

    return this.ledState[cc] ?? false;
  }

  // Flush all LED states - called periodically by Bitwig
  flush(): void {
    // Send all LED states over MIDI
    Object.keys(this.ledState).forEach(ccStr => {
      const cc = Number(ccStr);
      const state = this.ledState[cc];
      const value = state ? 127 : 0;
      this.midiOut.sendMidi(176, cc, value);
    });
  }
}
