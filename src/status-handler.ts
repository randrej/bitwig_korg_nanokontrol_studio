import { LEDManager } from './led-manager';
import { UtilityButtons, PerChannelControls } from './cc-mappings';

export class StatusHandler {
  constructor(
    private ledManager: LEDManager,
    private transport: API.Transport,
    private trackBank: API.TrackBank,
    private arranger: API.Arranger
  ) {
    this.setupTransportObservers();
    this.setupTrackObservers();
  }

  private setupTransportObservers(): void {
    // Transport state observers
    this.transport.isPlaying().addValueObserver(playing => {
      this.updateTransportLEDs();
    });
    this.transport.isArrangerRecordEnabled().addValueObserver(recording => {
      this.updateTransportLEDs();
    });
    this.transport.isArrangerLoopEnabled().addValueObserver(looping => {
      this.updateTransportLEDs();
    });
    this.arranger.isPlaybackFollowEnabled().addValueObserver(followMode => {
      this.updateTransportLEDs();
    });
    this.transport.isMetronomeEnabled().addValueObserver(metronome => {
      this.updateTransportLEDs();
    });
    this.transport
      .isMetronomeAudibleDuringPreRoll()
      .addValueObserver(countdown => {
        this.updateTransportLEDs();
      });
  }

  private setupTrackObservers(): void {
    // Track state observers for all 8 channels
    for (let i = 0; i < 8; i++) {
      const track = this.trackBank.getItemAt(i);

      track.solo().addValueObserver(solo => {
        this.ledManager.setChannelLED(i, PerChannelControls.SOLO, solo);
      });

      track.mute().addValueObserver(mute => {
        this.ledManager.setChannelLED(i, PerChannelControls.MUTE, mute);
      });

      track.arm().addValueObserver(arm => {
        this.ledManager.setChannelLED(i, PerChannelControls.REC, arm);
      });

      track.addIsSelectedInMixerObserver(selected => {
        this.ledManager.setChannelLED(i, PerChannelControls.SEL, selected);
      });
    }
  }

  private updateTransportLEDs(): void {
    const isPlaying = this.transport.isPlaying().get();
    const isRecording = this.transport.isArrangerRecordEnabled().get();
    const isLooping = this.transport.isArrangerLoopEnabled().get();
    const isFollowMode = this.arranger.isPlaybackFollowEnabled().get();
    const isMetronomeEnabled = this.transport.isMetronomeEnabled().get();
    const isCountdownEnabled = this.transport
      .isMetronomeAudibleDuringPreRoll()
      .get();

    // Transport LED logic:
    // - Stop LED: on when stopped
    // - Play LED: on when playing
    // - Rec LED: on when recording or armed for recording
    // - Cycle LED: on when loop mode is enabled
    // - FF LED: on when playback follow mode is enabled
    // - Prev Marker LED: on when countdown is enabled
    // - Next Marker LED: on when metronome is enabled

    this.ledManager.setUtilityLED(UtilityButtons.STOP, !isPlaying);
    this.ledManager.setUtilityLED(UtilityButtons.PLAY, isPlaying);
    this.ledManager.setUtilityLED(UtilityButtons.REC, isRecording);
    this.ledManager.setUtilityLED(UtilityButtons.CYCLE, isLooping);
    this.ledManager.setUtilityLED(UtilityButtons.FF, isFollowMode);
    this.ledManager.setUtilityLED(
      UtilityButtons.PREV_MARKER,
      isCountdownEnabled
    );
    this.ledManager.setUtilityLED(
      UtilityButtons.NEXT_MARKER,
      isMetronomeEnabled
    );
  }

  // Call this when track bank changes to update all channel LEDs
  updateAllChannelLEDs(): void {
    for (let i = 0; i < 8; i++) {
      const track = this.trackBank.getItemAt(i);

      this.ledManager.setChannelLED(
        i,
        PerChannelControls.SOLO,
        track.solo().get()
      );
      this.ledManager.setChannelLED(
        i,
        PerChannelControls.MUTE,
        track.mute().get()
      );
      this.ledManager.setChannelLED(
        i,
        PerChannelControls.REC,
        track.arm().get()
      );
    }
  }
}
