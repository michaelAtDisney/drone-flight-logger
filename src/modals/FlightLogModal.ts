import { App, Modal, Notice } from 'obsidian';
import { FlightLogData, DronePluginSettings } from '../types';
import { createFlightLogFile } from '../utils/fileUtils';

export class FlightLogModal extends Modal {
  private settings: DronePluginSettings;
  private onSaveSuccess?: () => void;

  private formData: FlightLogData;
  private activeTab: 'mission' | 'equipment' | 'personnel' | 'notes' = 'mission';

  constructor(app: App, settings: DronePluginSettings, onSaveSuccess?: () => void) {
    super(app);
    this.settings = settings;
    this.onSaveSuccess = onSaveSuccess;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const defaultStartTime = `${hours}:${mins}`;

    // Default end time + 20 mins
    const endNow = new Date(now.getTime() + 20 * 60000);
    const endHours = String(endNow.getHours()).padStart(2, '0');
    const endMins = String(endNow.getMinutes()).padStart(2, '0');
    const defaultEndTime = `${endHours}:${endMins}`;

    const defaultAircraft = settings.fleet[0] || {
      make: 'DJI',
      model: 'Mavic 3 Enterprise',
      registration: '',
      serialNumber: ''
    };

    this.formData = {
      flightDate: todayStr,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      durationMinutes: 20,
      location: 'Site Alpha',
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
      batteryIds: settings.batteries.length > 0 ? [settings.batteries[0].batteryCode] : [],
      batteryStartPct: 100,
      batteryEndPct: 30,
      maxAltitude: settings.unitSystem === 'imperial' ? 350 : 105,
      maxDistance: settings.unitSystem === 'imperial' ? 1200 : 365,

      pic: settings.defaultPic || 'Remote Pilot',
      visualObservers: [],
      wind: '8 mph NW',
      visibility: '10 miles',
      temperature: '72°F',
      lighting: 'Daylight',
      weatherNotes: '',

      anomalies: '',
      notes: ''
    };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('drone-flight-modal');

    // Header
    const headerEl = contentEl.createDiv({ cls: 'drone-modal-header' });
    const titleBox = headerEl.createDiv();
    const titleEl = titleBox.createDiv({ cls: 'drone-modal-title' });
    titleEl.innerHTML = `<span class="drone-modal-title-icon">🚁</span> New Drone Flight Log`;
    titleBox.createDiv({ cls: 'drone-modal-subtitle', text: 'Record essential flight telemetry, equipment health, and mission details' });

    // Tab Bar
    const tabsEl = contentEl.createDiv({ cls: 'drone-modal-tabs' });
    this.createTabButton(tabsEl, 'mission', '📍 Mission & Time');
    this.createTabButton(tabsEl, 'equipment', '🛸 Aircraft & Battery');
    this.createTabButton(tabsEl, 'personnel', '👤 Crew & Weather');
    this.createTabButton(tabsEl, 'notes', '⚠️ Anomalies & Notes');

    // Content Body Container
    const bodyEl = contentEl.createDiv({ cls: 'drone-modal-content' });

    // Render Panes
    this.renderMissionPane(bodyEl);
    this.renderEquipmentPane(bodyEl);
    this.renderPersonnelPane(bodyEl);
    this.renderNotesPane(bodyEl);

    // Footer Actions
    const footerEl = contentEl.createDiv({ cls: 'drone-modal-footer' });
    
    const cancelBtn = footerEl.createEl('button', { cls: 'drone-btn drone-btn-secondary', text: 'Cancel' });
    cancelBtn.onclick = () => this.close();

    const saveBtn = footerEl.createEl('button', { cls: 'drone-btn drone-btn-primary', text: 'Save Flight Log' });
    saveBtn.onclick = () => this.saveLog();

    const resizeHandle = footerEl.createDiv({ cls: 'drone-resize-handle', text: '◢' });
    resizeHandle.title = 'Drag corner to resize window';
  }

  private createTabButton(container: HTMLElement, tabKey: 'mission' | 'equipment' | 'personnel' | 'notes', label: string) {
    const btn = container.createEl('button', {
      cls: `drone-tab-button ${this.activeTab === tabKey ? 'active' : ''}`,
      text: label
    });
    btn.onclick = () => {
      this.activeTab = tabKey;
      container.querySelectorAll('.drone-tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const bodyEl = this.contentEl.querySelector('.drone-modal-content');
      if (bodyEl) {
        bodyEl.querySelectorAll('.drone-tab-pane').forEach(p => p.classList.remove('active'));
        const activePane = bodyEl.querySelector(`.drone-tab-pane-${tabKey}`);
        if (activePane) activePane.classList.add('active');
      }
    };
  }

  private calculateDuration() {
    if (!this.formData.startTime || !this.formData.endTime) return;
    const [sH, sM] = this.formData.startTime.split(':').map(Number);
    const [eH, eM] = this.formData.endTime.split(':').map(Number);
    
    if (!isNaN(sH) && !isNaN(sM) && !isNaN(eH) && !isNaN(eM)) {
      let startMin = sH * 60 + sM;
      let endMin = eH * 60 + eM;
      if (endMin < startMin) {
        endMin += 24 * 60; // Crosses midnight
      }
      this.formData.durationMinutes = endMin - startMin;
      const cardVal = this.contentEl.querySelector('.drone-duration-val');
      if (cardVal) {
        cardVal.textContent = `${this.formData.durationMinutes} minutes (${(this.formData.durationMinutes / 60).toFixed(1)} hrs)`;
      }
    }
  }

  private renderMissionPane(container: HTMLElement) {
    const pane = container.createDiv({ cls: `drone-tab-pane drone-tab-pane-mission ${this.activeTab === 'mission' ? 'active' : ''}` });

    // Duration Display Card
    const durCard = pane.createDiv({ cls: 'drone-duration-card' });
    durCard.createDiv({ text: 'Calculated Flight Air Duration', cls: 'drone-field-label' });
    durCard.createDiv({ cls: 'drone-duration-val', text: `${this.formData.durationMinutes} minutes (${(this.formData.durationMinutes / 60).toFixed(1)} hrs)` });

    // Date & Times
    const row1 = pane.createDiv({ cls: 'drone-form-row-3' });
    
    const dateGrp = row1.createDiv({ cls: 'drone-field-group' });
    dateGrp.createDiv({ cls: 'drone-field-label', text: 'Flight Date' });
    const dateInp = dateGrp.createEl('input', { type: 'date', cls: 'drone-input', value: this.formData.flightDate });
    dateInp.onchange = (e) => { this.formData.flightDate = (e.target as HTMLInputElement).value; };

    const startGrp = row1.createDiv({ cls: 'drone-field-group' });
    startGrp.createDiv({ cls: 'drone-field-label', text: 'Start Time' });
    const startInp = startGrp.createEl('input', { type: 'time', cls: 'drone-input', value: this.formData.startTime });
    startInp.onchange = (e) => {
      this.formData.startTime = (e.target as HTMLInputElement).value;
      this.calculateDuration();
    };

    const endGrp = row1.createDiv({ cls: 'drone-field-group' });
    endGrp.createDiv({ cls: 'drone-field-label', text: 'End Time' });
    const endInp = endGrp.createEl('input', { type: 'time', cls: 'drone-input', value: this.formData.endTime });
    endInp.onchange = (e) => {
      this.formData.endTime = (e.target as HTMLInputElement).value;
      this.calculateDuration();
    };

    // Location & Purpose
    const row2 = pane.createDiv({ cls: 'drone-form-row' });
    
    const locGrp = row2.createDiv({ cls: 'drone-field-group' });
    locGrp.createDiv({ cls: 'drone-field-label', text: 'Location / Launch Site' });
    const locInp = locGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.location, placeholder: 'e.g. Site Alpha / 123 Main St' });
    locInp.onchange = (e) => { this.formData.location = (e.target as HTMLInputElement).value; };

    const gpsGrp = row2.createDiv({ cls: 'drone-field-group' });
    gpsGrp.createDiv({ cls: 'drone-field-label', text: 'GPS Coordinates (Optional)' });
    const gpsInp = gpsGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.coordinates, placeholder: '37.7749, -122.4194' });
    gpsInp.onchange = (e) => { this.formData.coordinates = (e.target as HTMLInputElement).value; };

    const row3 = pane.createDiv({ cls: 'drone-form-row' });
    const purpGrp = row3.createDiv({ cls: 'drone-field-group' });
    purpGrp.createDiv({ cls: 'drone-field-label', text: 'Flight Purpose' });
    const purpSel = purpGrp.createEl('select', { cls: 'drone-select' });
    ['Commercial', 'Training', 'Mapping', 'Recreational', 'Inspection', 'Search & Rescue'].forEach(p => {
      const opt = purpSel.createEl('option', { value: p, text: p });
      if (p === this.formData.purpose) opt.selected = true;
    });
    purpSel.onchange = (e) => { this.formData.purpose = (e.target as HTMLSelectElement).value as any; };

    // Day / Night Landings
    const row4 = pane.createDiv({ cls: 'drone-form-row-3' });
    this.createNumberField(row4, 'Day Takeoffs', this.formData.dayTakeoffs, (v) => this.formData.dayTakeoffs = v);
    this.createNumberField(row4, 'Day Landings', this.formData.dayLandings, (v) => this.formData.dayLandings = v);
    this.createNumberField(row4, 'Night Takeoffs', this.formData.nightTakeoffs, (v) => this.formData.nightTakeoffs = v);
    this.createNumberField(row4, 'Night Landings', this.formData.nightLandings, (v) => this.formData.nightLandings = v);
  }

  private renderEquipmentPane(container: HTMLElement) {
    const pane = container.createDiv({ cls: `drone-tab-pane drone-tab-pane-equipment ${this.activeTab === 'equipment' ? 'active' : ''}` });

    // Aircraft Selection
    const row1 = pane.createDiv({ cls: 'drone-form-row' });
    const craftGrp = row1.createDiv({ cls: 'drone-field-group' });
    craftGrp.createDiv({ cls: 'drone-field-label', text: 'Select Aircraft' });
    const craftSel = craftGrp.createEl('select', { cls: 'drone-select' });
    
    this.settings.fleet.forEach(craft => {
      const opt = craftSel.createEl('option', {
        value: craft.id,
        text: `${craft.make} ${craft.model} (${craft.registration || 'No Reg'})`
      });
      if (craft.model === this.formData.aircraftModel) opt.selected = true;
    });

    craftSel.onchange = (e) => {
      const selectedCraft = this.settings.fleet.find(f => f.id === (e.target as HTMLSelectElement).value);
      if (selectedCraft) {
        this.formData.aircraftMake = selectedCraft.make;
        this.formData.aircraftModel = selectedCraft.model;
        this.formData.aircraftRegistration = selectedCraft.registration;
        this.formData.aircraftSerial = selectedCraft.serialNumber;
      }
    };

    // Battery Selection
    const batGrp = row1.createDiv({ cls: 'drone-field-group' });
    batGrp.createDiv({ cls: 'drone-field-label', text: 'Battery Unit Code' });
    const batInp = batGrp.createEl('input', {
      type: 'text',
      cls: 'drone-input',
      value: this.formData.batteryIds.join(', '),
      placeholder: 'e.g. BAT-M3E-01'
    });
    batInp.onchange = (e) => {
      this.formData.batteryIds = (e.target as HTMLInputElement).value
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    };

    // Battery Charge levels
    const row2 = pane.createDiv({ cls: 'drone-form-row' });
    this.createNumberField(row2, 'Start Charge %', this.formData.batteryStartPct, (v) => this.formData.batteryStartPct = v);
    this.createNumberField(row2, 'End Charge %', this.formData.batteryEndPct, (v) => this.formData.batteryEndPct = v);

    // Telemetry Limits
    const altUnit = this.settings.unitSystem === 'imperial' ? 'ft' : 'm';
    const distUnit = this.settings.unitSystem === 'imperial' ? 'ft' : 'm';

    const row3 = pane.createDiv({ cls: 'drone-form-row' });
    this.createNumberField(row3, `Max Altitude (${altUnit} AGL)`, this.formData.maxAltitude, (v) => this.formData.maxAltitude = v);
    this.createNumberField(row3, `Max Distance from Controller (${distUnit})`, this.formData.maxDistance, (v) => this.formData.maxDistance = v);
  }

  private renderPersonnelPane(container: HTMLElement) {
    const pane = container.createDiv({ cls: `drone-tab-pane drone-tab-pane-personnel ${this.activeTab === 'personnel' ? 'active' : ''}` });

    const row1 = pane.createDiv({ cls: 'drone-form-row' });
    const picGrp = row1.createDiv({ cls: 'drone-field-group' });
    picGrp.createDiv({ cls: 'drone-field-label', text: 'Remote Pilot in Command (PIC)' });
    const picInp = picGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.pic });
    picInp.onchange = (e) => { this.formData.pic = (e.target as HTMLInputElement).value; };

    const voGrp = row1.createDiv({ cls: 'drone-field-group' });
    voGrp.createDiv({ cls: 'drone-field-label', text: 'Visual Observers (Comma Separated)' });
    const voInp = voGrp.createEl('input', {
      type: 'text',
      cls: 'drone-input',
      value: this.formData.visualObservers.join(', '),
      placeholder: 'e.g. Jane Doe, John Smith'
    });
    voInp.onchange = (e) => {
      this.formData.visualObservers = (e.target as HTMLInputElement).value
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    };

    // Weather Fields
    const row2 = pane.createDiv({ cls: 'drone-form-row' });
    
    const windGrp = row2.createDiv({ cls: 'drone-field-group' });
    windGrp.createDiv({ cls: 'drone-field-label', text: 'Wind Speed & Direction' });
    const windInp = windGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.wind, placeholder: 'e.g. 8 mph NW' });
    windInp.onchange = (e) => { this.formData.wind = (e.target as HTMLInputElement).value; };

    const visGrp = row2.createDiv({ cls: 'drone-field-group' });
    visGrp.createDiv({ cls: 'drone-field-label', text: 'Visibility' });
    const visInp = visGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.visibility, placeholder: 'e.g. 10 statute miles' });
    visInp.onchange = (e) => { this.formData.visibility = (e.target as HTMLInputElement).value; };

    const row3 = pane.createDiv({ cls: 'drone-form-row' });
    const tempGrp = row3.createDiv({ cls: 'drone-field-group' });
    tempGrp.createDiv({ cls: 'drone-field-label', text: 'Temperature' });
    const tempInp = tempGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.temperature, placeholder: 'e.g. 72°F' });
    tempInp.onchange = (e) => { this.formData.temperature = (e.target as HTMLInputElement).value; };

    const lightGrp = row3.createDiv({ cls: 'drone-field-group' });
    lightGrp.createDiv({ cls: 'drone-field-label', text: 'Lighting / Sky' });
    const lightInp = lightGrp.createEl('input', { type: 'text', cls: 'drone-input', value: this.formData.lighting, placeholder: 'Daylight / Clear' });
    lightInp.onchange = (e) => { this.formData.lighting = (e.target as HTMLInputElement).value; };

    const wNotesGrp = pane.createDiv({ cls: 'drone-field-group' });
    wNotesGrp.createDiv({ cls: 'drone-field-label', text: 'Additional Weather Observations' });
    const wNotesTa = wNotesGrp.createEl('textarea', { cls: 'drone-textarea', placeholder: 'e.g. Light turbulence near tree line, clear horizon' });
    wNotesTa.value = this.formData.weatherNotes;
    wNotesTa.onchange = (e) => { this.formData.weatherNotes = (e.target as HTMLTextAreaElement).value; };
  }

  private renderNotesPane(container: HTMLElement) {
    const pane = container.createDiv({ cls: `drone-tab-pane drone-tab-pane-notes ${this.activeTab === 'notes' ? 'active' : ''}` });

    const anomGrp = pane.createDiv({ cls: 'drone-field-group' });
    anomGrp.createDiv({ cls: 'drone-field-label', text: '⚠️ Noteworthy Events / Anomalies / Incidents' });
    anomGrp.createDiv({ cls: 'drone-field-hint', text: 'Log any firmware errors, GPS compass warnings, battery alerts, or near-misses' });
    const anomTa = anomGrp.createEl('textarea', { cls: 'drone-textarea', placeholder: 'e.g. Brief compass interference prompt on takeoff, cleared after elevation increase.' });
    anomTa.value = this.formData.anomalies;
    anomTa.onchange = (e) => { this.formData.anomalies = (e.target as HTMLTextAreaElement).value; };

    const notesGrp = pane.createDiv({ cls: 'drone-field-group' });
    notesGrp.createDiv({ cls: 'drone-field-label', text: '📝 Mission Notes & Objectives Achieved' });
    const notesTa = notesGrp.createEl('textarea', { cls: 'drone-textarea', placeholder: 'Captured 45 aerial photos of North Ridge mapping grid. Flight path stable.' });
    notesTa.value = this.formData.notes;
    notesTa.onchange = (e) => { this.formData.notes = (e.target as HTMLTextAreaElement).value; };
  }

  private createNumberField(container: HTMLElement, label: string, initialVal: number, onChange: (val: number) => void) {
    const grp = container.createDiv({ cls: 'drone-field-group' });
    grp.createDiv({ cls: 'drone-field-label', text: label });
    const inp = grp.createEl('input', { type: 'number', cls: 'drone-input', value: String(initialVal) });
    inp.onchange = (e) => { onChange(Number((e.target as HTMLInputElement).value)); };
  }

  private async saveLog() {
    try {
      const file = await createFlightLogFile(this.app, this.formData, this.settings);
      new Notice(`Flight Log saved: ${file.basename}`);
      
      if (this.settings.autoOpenNote) {
        const leaf = this.app.workspace.getUnpinnedLeaf();
        await leaf.openFile(file);
      }

      if (this.onSaveSuccess) {
        this.onSaveSuccess();
      }

      this.close();
    } catch (err) {
      new Notice(`Error saving flight log: ${err}`);
      console.error(err);
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
