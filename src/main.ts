import { processMidiCC } from './event-handlers';
import { LEDManager } from './led-manager';
import { ModeManager, Mode } from './mode-manager';
import { SceneManager, Scene, getSceneName } from './scene-manager';
import { StatusHandler } from './status-handler';
import { UtilityButtons } from './cc-mappings';

loadAPI(19);

const version = '2.0.0';

host.defineController(
  'Korg',
  'nanoKONTROL Studio',
  version,
  '07f8e5d5-ba9b-4818-9d54-5b9d499fa35d',
  'Andrej Radović'
);
host.defineMidiPorts(1, 1);

let ledManager: LEDManager;
let modeManager: ModeManager;
let sceneManager: SceneManager;
let statusHandler: StatusHandler;
let trackBank: API.TrackBank;
let transport: API.Transport;
let application: API.Application;
let cursorTrack: API.CursorTrack;
let primaryDevice: API.CursorDevice;
let arranger: API.Arranger;
let keepaliveTask: any = null;

function init() {
  println(`nanoKONTROL Studio ${version} initialized`);

  // Initialize Bitwig API objects
  trackBank = host.createTrackBank(8, 1, 0);
  transport = host.createTransport();
  application = host.createApplication();
  cursorTrack = host.createCursorTrack(2, 0);
  primaryDevice = cursorTrack.createCursorDevice();
  arranger = host.createArranger(0);

  trackBank.followCursorTrack(cursorTrack);

  // Mark interest in play position and playing state for jog wheel functionality
  transport.playStartPosition().markInterested();
  transport.isPlaying().markInterested();
  transport.tempo().markInterested();

  // Initialize managers
  ledManager = new LEDManager(host);
  modeManager = new ModeManager((mode: Mode) => {
    // Set "SET" LED: off for mixer mode, on for device mode
    ledManager.setUtilityLED(UtilityButtons.SET, mode === Mode.DEVICE);

    // Show mode notification
    if (mode === Mode.MIXER) {
      host.showPopupNotification('Mixer Mode');
    } else if (mode === Mode.DEVICE) {
      host.showPopupNotification('Device Mode');
    }
  });

  sceneManager = new SceneManager((scene: Scene) => {
    const sceneName = getSceneName(scene);
    println(`Scene changed to: ${sceneName}`);
    // host.showPopupNotification(sceneName);
  });

  // Initialize status handler for LED feedback
  statusHandler = new StatusHandler(ledManager, transport, trackBank, arranger);

  // Set up MIDI callback with event processing
  host
    .getMidiInPort(0)
    .setMidiCallback((status: number, data1: number, data2: number) => {
      println(`MIDI: ${status} ${data1} ${data2}`);

      // Only process CC messages (status 176)
      if (status === 176) {
        const cc = data1;
        const value = data2;
        processMidiCC(cc, value, modeManager, {
          transport,
          application,
          cursorTrack,
          primaryDevice,
          arranger,
          trackBank,
        });
      }
    });

  // Set up sysex callback for scene switching
  host.getMidiInPort(0).setSysexCallback((sysexData: string) => {
    println(`Sysex: ${sysexData}`);
    sceneManager.processSysexMessage(sysexData);
  });

  // Set up keepalive to prevent device sleep
  const scheduleKeepalive = () => {
    host.getMidiOutPort(0).sendMidi(176, 127, 127);
    keepaliveTask = host.scheduleTask(scheduleKeepalive, 30000);
  };
  keepaliveTask = host.scheduleTask(scheduleKeepalive, 30000);
}

function exit() {
  println(`nanoKONTROL Studio ${version} exiting`);

  // Clean up keepalive task
  if (keepaliveTask !== null) {
    keepaliveTask = null;
  }
}

function flush() {
  // Called periodically by Bitwig
  ledManager?.flush();
}

// Export functions to global scope for Bitwig
(globalThis as any).init = init;
(globalThis as any).exit = exit;
(globalThis as any).flush = flush;
