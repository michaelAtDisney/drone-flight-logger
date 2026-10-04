import { Plugin, WorkspaceLeaf, Notice, Editor } from 'obsidian';
import { DronePluginSettings, DEFAULT_SETTINGS } from './types';
import { DroneFlightLogSettingTab } from './settings';
import { FlightLogModal } from './modals/FlightLogModal';
import { DroneFlightDashboardView, DRONE_DASHBOARD_VIEW_TYPE } from './views/DashboardView';
import { formatFlightLogMarkdown } from './utils/fileUtils';

export default class DroneFlightLogPlugin extends Plugin {
  settings: DronePluginSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    // Register Custom Dashboard View
    this.registerView(
      DRONE_DASHBOARD_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new DroneFlightDashboardView(leaf, this.settings)
    );

    // Register Settings Tab
    this.addSettingTab(new DroneFlightLogSettingTab(this.app, this));

    // Register Ribbon Icon
    this.addRibbonIcon('plane', 'Log Drone Flight', () => {
      new FlightLogModal(this.app, this.settings).open();
    });

    // Command: Open Modal to Log Flight
    this.addCommand({
      id: 'log-drone-flight',
      name: 'Log New Drone Flight',
      callback: () => {
        new FlightLogModal(this.app, this.settings).open();
      }
    });

    // Command: Open Dashboard
    this.addCommand({
      id: 'open-drone-dashboard',
      name: 'Open Drone Flight Dashboard',
      callback: () => {
        this.activateDashboardView();
      }
    });

    // Command: Insert Template into Active Editor
    this.addCommand({
      id: 'insert-drone-flight-template',
      name: 'Insert Flight Log Template into Active Note',
      editorCallback: (editor: Editor) => {
        const defaultAircraft = this.settings.fleet[0] || {
          make: 'DJI',
          model: 'Mavic 3 Enterprise',
          registration: 'FA3X99001',
          serialNumber: 'SN12345678'
        };

        const now = new Date();
        const templateStr = formatFlightLogMarkdown({
          flightDate: now.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '10:25',
          durationMinutes: 25,
          location: 'Site Location',
          coordinates: '',
          purpose: 'Commercial',
          dayTakeoffs: 1,
          dayLandings: 1,
          nightTakeoffs: 0,
          nightLandings: 0,
          aircraftMake: defaultAircraft.make,
          aircraftModel: defaultAircraft.model,
          aircraftRegistration: defaultAircraft.registration,
          aircraftSerial: defaultAircraft.serialNumber,
          batteryIds: this.settings.batteries.length > 0 ? [this.settings.batteries[0].batteryCode] : ['BAT-01'],
          batteryStartPct: 100,
          batteryEndPct: 35,
          maxAltitude: this.settings.unitSystem === 'imperial' ? 400 : 120,
          maxDistance: this.settings.unitSystem === 'imperial' ? 1500 : 450,
          pic: this.settings.defaultPic || 'Remote Pilot',
          visualObservers: [],
          wind: '5 mph N',
          visibility: '10 statute miles',
          temperature: '68°F',
          lighting: 'Daylight',
          weatherNotes: '',
          anomalies: '',
          notes: 'Flight mission notes here...'
        }, this.settings);

        editor.replaceSelection(templateStr);
        new Notice('Inserted Drone Flight Log Template');
      }
    });

    console.log('Drone Flight Log Plugin loaded successfully.');
  }

  async activateDashboardView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(DRONE_DASHBOARD_VIEW_TYPE);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false) || workspace.getUnpinnedLeaf();
      if (leaf) {
        await leaf.setViewState({
          type: DRONE_DASHBOARD_VIEW_TYPE,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {
    console.log('Drone Flight Log Plugin unloaded.');
  }
}
