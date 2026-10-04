import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import DroneFlightLogPlugin from './main';
import { UnitSystem } from './types';

export class DroneFlightLogSettingTab extends PluginSettingTab {
  plugin: DroneFlightLogPlugin;

  constructor(app: App, plugin: DroneFlightLogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: '🚁 Drone Flight Log Settings' });

    // General Section
    containerEl.createEl('h3', { text: 'General & Pilot Preferences' });

    new Setting(containerEl)
      .setName('Default Remote Pilot in Command (PIC)')
      .setDesc('Pre-filled pilot name for new flight logs.')
      .addText(text => text
        .setPlaceholder('Pilot Name')
        .setValue(this.plugin.settings.defaultPic)
        .onChange(async (value) => {
          this.plugin.settings.defaultPic = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Measurement Units')
      .setDesc('Select Imperial (ft/mph) or Metric (m/kmh) units for telemetry altitude and distance.')
      .addDropdown(drop => drop
        .addOption('imperial', 'Imperial (feet, miles)')
        .addOption('metric', 'Metric (meters, km)')
        .setValue(this.plugin.settings.unitSystem)
        .onChange(async (value: UnitSystem) => {
          this.plugin.settings.unitSystem = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Log Notes Vault Directory')
      .setDesc('Folder path in your vault where flight logs will be saved.')
      .addText(text => text
        .setPlaceholder('Drone Logs')
        .setValue(this.plugin.settings.logFolderPath)
        .onChange(async (value) => {
          this.plugin.settings.logFolderPath = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Filename Pattern Template')
      .setDesc('Variables available: YYYY-MM-DD, {{aircraft}}, {{location}}, {{purpose}}')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD - Flight - {{aircraft}} - {{location}}')
        .setValue(this.plugin.settings.filenameFormat)
        .onChange(async (value) => {
          this.plugin.settings.filenameFormat = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto-open Created Log Note')
      .setDesc('Automatically open newly created flight log note in editor upon saving.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoOpenNote)
        .onChange(async (value) => {
          this.plugin.settings.autoOpenNote = value;
          await this.plugin.saveSettings();
        }));

    // Fleet Management Section
    containerEl.createEl('h3', { text: '🛸 Aircraft Fleet Manager' });
    containerEl.createEl('p', { text: 'Pre-configure your drone inventory for quick dropdown selection during logging.', cls: 'setting-item-description' });

    const fleetContainer = containerEl.createDiv({ cls: 'drone-settings-fleet-list' });
    this.renderFleetList(fleetContainer);

    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('+ Add New Aircraft')
        .setCta()
        .onClick(async () => {
          this.plugin.settings.fleet.push({
            id: `aircraft-${Date.now()}`,
            make: 'DJI',
            model: 'New Aircraft Model',
            registration: 'N12345',
            serialNumber: 'SN-00000'
          });
          await this.plugin.saveSettings();
          this.display();
        }));

    // Battery Inventory Section
    containerEl.createEl('h3', { text: '🔋 Battery Inventory & Cycle Tracker' });
    const batteryContainer = containerEl.createDiv({ cls: 'drone-settings-battery-list' });
    this.renderBatteryList(batteryContainer);

    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('+ Add New Battery')
        .setCta()
        .onClick(async () => {
          const newNum = this.plugin.settings.batteries.length + 1;
          this.plugin.settings.batteries.push({
            id: `bat-${Date.now()}`,
            batteryCode: `BAT-0${newNum}`,
            makeModel: 'Intelligent Flight Battery',
            totalCycles: 0,
            healthPct: 100
          });
          await this.plugin.saveSettings();
          this.display();
        }));
  }

  private renderFleetList(container: HTMLElement) {
    container.empty();
    this.plugin.settings.fleet.forEach((aircraft, index) => {
      const row = container.createDiv({ cls: 'drone-battery-item', attr: { style: 'margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;' } });

      const makeInp = row.createEl('input', { type: 'text', cls: 'drone-input', value: aircraft.make, placeholder: 'Make (DJI)' });
      makeInp.style.width = '120px';
      makeInp.onchange = async (e) => {
        aircraft.make = (e.target as HTMLInputElement).value;
        await this.plugin.saveSettings();
      };

      const modelInp = row.createEl('input', { type: 'text', cls: 'drone-input', value: aircraft.model, placeholder: 'Model (Mavic 3)' });
      modelInp.style.width = '180px';
      modelInp.onchange = async (e) => {
        aircraft.model = (e.target as HTMLInputElement).value;
        await this.plugin.saveSettings();
      };

      const regInp = row.createEl('input', { type: 'text', cls: 'drone-input', value: aircraft.registration, placeholder: 'Registration #' });
      regInp.style.width = '120px';
      regInp.onchange = async (e) => {
        aircraft.registration = (e.target as HTMLInputElement).value;
        await this.plugin.saveSettings();
      };

      const delBtn = row.createEl('button', { cls: 'drone-btn drone-btn-secondary', text: '🗑️ Delete' });
      delBtn.onclick = async () => {
        this.plugin.settings.fleet.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
      };
    });
  }

  private renderBatteryList(container: HTMLElement) {
    container.empty();
    this.plugin.settings.batteries.forEach((bat, index) => {
      const row = container.createDiv({ cls: 'drone-battery-item', attr: { style: 'margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;' } });

      const codeInp = row.createEl('input', { type: 'text', cls: 'drone-input', value: bat.batteryCode, placeholder: 'Code (BAT-01)' });
      codeInp.style.width = '120px';
      codeInp.onchange = async (e) => {
        bat.batteryCode = (e.target as HTMLInputElement).value;
        await this.plugin.saveSettings();
      };

      const modelInp = row.createEl('input', { type: 'text', cls: 'drone-input', value: bat.makeModel, placeholder: 'Battery Description' });
      modelInp.style.width = '180px';
      modelInp.onchange = async (e) => {
        bat.makeModel = (e.target as HTMLInputElement).value;
        await this.plugin.saveSettings();
      };

      const cycleInp = row.createEl('input', { type: 'number', cls: 'drone-input', value: String(bat.totalCycles), placeholder: 'Cycles' });
      cycleInp.style.width = '80px';
      cycleInp.onchange = async (e) => {
        bat.totalCycles = Number((e.target as HTMLInputElement).value);
        await this.plugin.saveSettings();
      };

      const delBtn = row.createEl('button', { cls: 'drone-btn drone-btn-secondary', text: '🗑️ Delete' });
      delBtn.onclick = async () => {
        this.plugin.settings.batteries.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
      };
    });
  }
}
