# nanoKONTROL Studio Control Surface for Bitwig

**tl;dr** get the `.js` file from the [latest release](https://github.com/randrej/bitwig_korg_nanokontrol_studio/releases/latest)

A control surface script for the Korg nanoKONTROL Studio MIDI controller in Bitwig Studio.

This script provides comprehensive control over transport, tracks, devices and more, _with full LED feedback_.

## Features

- **2 Modes**: _Mixer_ and _Device_ modes allow you to switch between using the sliders and pots
  for mixing, or adjusting macros, at the push of the _Set_ button
- **Full LED Feedback**: All buttons and channel controls provide visual status indicators
- **Jog wheel with acceleration**: Jog wheel moves the playhead in larger steps if you spin the wheel faster
- **Tempo Control**: Tap tempo and jog wheel tempo adjustment as a shift-function
- **Screensaver prevention**: while using this script, the controller doesn't
  activate the annoying screen saver

## Control Reference

The Reverse button (|◀ button in the bottom left) is the _shift_ button, will
be referred _shift_ to going forward).

### Mode Controls

- **SET**: Switch between Mixer and Device modes
- **Shift + SET**: **Toggle Panel Layout** - Switch between Arrange and Mix views

### Transport Controls

These are the same whether you're in _Mixer_ or _Device_ mode.

- **▶ (Play)**: Start playback
- **Shift + ▶ (Play)**: **Tap Tempo** - Tap to set project tempo

- **⏹ (Stop)**: Stop playback
- **Shift + ⏹ (Stop)**: **Reset Automation** - Clear all automation overrides

- **⏺ (Rec)**: Start recording
- **Shift + ⏺ (Rec)**: **Arm Cursor Track** - Toggle recording arm on selected track

- **Cycle**: Toggle loop mode on/off, LED reflects whether it's on

- **⏪(REW)**: Rewind transport
- **⏩ (FF)**: Fast forward transport; LED shows Follow Mode status
- **Shift + ⏩ (FF)**: **Toggle Follow Mode** - Enable/disable playback follow in arranger

- **⏹ + ▶ + ⏺ (All Three)**: **Toggle Audio Engine** - Emergency stop/start of Bitwig's audio engine

- **◀ (Prev Track)**: Select previous track
- **▶ (Next Track)**: Select next track
- **Shift + ▶ (Next Track)**: Duplicate the currently selected track

- **◀ (Prev Marker)**: Jump to previous cue marker, LED reflects countdown status
- **Shift + ◀ (Prev Marker)**: **Toggle Countdown** - Enable/disable metronome during pre-roll
- **▶ (Next Marker)**: Jump to next cue marker, LED reflects metronome status
- **Shift + ▶ (Next Marker)**: **Toggle Metronome** - Enable/disable click track

### Jog Wheel

The jog wheel provides precise control over playback position and tempo:

- **Rotate**: **Scrub Timeline** - Move playback position with 1/16 note resolution + acceleration
- **Shift + Rotate**: **Adjust Tempo** - Change project tempo (±0.5 BPM per step with acceleration)

### Channel Controls (8 Channels)

#### Mixer Mode (Default)

Each of the 8 channels provides identical controls that operate on the
currently selected 8 tracks. If a track 1-8 is currently selected, these
operate on tracks 1-8; if a track 9-16 is selected, we're operating on those.
Essentially we're operating on banks of 8 channels based on which channel is
selected.

- **Sliders**: **Track Volume** - Control individual track levels (0-127)
- **Knobs**: **Track Pan** - Control stereo positioning (-64 to +63)
- **S (Solo)**: **Track Solo** - Solo individual tracks
- **Shift + S (Solo)**: **Exclusive Solo** - Solo track and unsolo all others
- **M (Mute)**: **Track Mute** - Mute/unmute individual tracks
- **R (Rec)**: **Track Arm** - Arm tracks for recording
- **Select**: **Cursor Track** - Make track the active cursor track

#### Device Mode

- **Sliders**: **Device Macros** - Control macro parameters 1-8 of cursor device
- **Knobs**: **Device Parameters** - Control raw parameters 1-8 of cursor device
- **S/M/R/Select**: Disabled

## Installation

### Pre-reqs

You need to install [Korg Kontrol Editor](https://www.korg.com/us/support/download/product/1/133/),
and use it to send the `KorgKontrolEditor/scene_set.nktrl_st_set` file to the
device to configure the buttons and encoders.

It works in Wine on Linux as well.

The other file is just for 1 scene, then you'd have to send it 5x.

### For Users

1. Download the compiled `.control.js` file from the [latest release](https://github.com/randrej/bitwig_korg_nanokontrol_studio/releases/latest)
2. Copy to your Bitwig Studio controller scripts directory:
   - **Windows**: `%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\`
   - **macOS**: `~/Documents/Bitwig Studio/Controller Scripts/`
   - **Linux**: `~/Bitwig Studio/Controller Scripts/`
3. In Bitwig Studio:
   - Go to **Settings > Controllers**
   - Click **Add Controller**
   - Select **Korg > nanoKONTROL Studio**
   - Choose your MIDI input/output ports
   - Click **Add**

### For developers.

This project uses TypeScript for development convenience, and is split into several files.

To build it for actual use, you need to run `npm build` to compile TypeScript to JavaScript and bundle it into a single `.control.js` file, which you need to put in the proper folder as explained above.
