import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';
import { DronePluginSettings } from '../types';
import { parseVaultFlightStats, VaultStats } from '../utils/statsUtils';
import { FlightLogModal } from '../modals/FlightLogModal';

export const DRONE_DASHBOARD_VIEW_TYPE = 'drone-flight-dashboard-view';

export class DroneFlightDashboardView extends ItemView {
  private settings: DronePluginSettings;

  constructor(leaf: WorkspaceLeaf, settings: DronePluginSettings) {
    super(leaf);
    this.settings = settings;
  }

  getViewType(): string {
    return DRONE_DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Drone Flight Dashboard';
  }

  getIcon(): string {
    return 'plane';
  }

  async onOpen() {
    await this.render();
  }

  async render() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass('drone-dashboard-container');

    // Header
    const headerEl = container.createDiv({ cls: 'drone-dashboard-header' });
    const title = headerEl.createDiv({ cls: 'drone-dashboard-title' });
    title.innerHTML = `<span>🛸</span> Drone Flight Analytics & Fleet Command`;

    const btnGroup = headerEl.createDiv({ cls: 'drone-btn-group' });
    const newLogBtn = btnGroup.createEl('button', { cls: 'drone-btn drone-btn-primary', text: '+ Log New Flight' });
    newLogBtn.onclick = () => {
      new FlightLogModal(this.app, this.settings, () => this.render()).open();
    };

    const refreshBtn = btnGroup.createEl('button', { cls: 'drone-btn drone-btn-secondary', text: '🔄 Refresh' });
    refreshBtn.onclick = () => this.render();

    // Parse Stats from Vault
    const stats: VaultStats = await parseVaultFlightStats(this.app);

    // Summary Metric Cards Grid
    const grid = container.createDiv({ cls: 'drone-metrics-grid' });

    const totalHoursStr = (stats.totalDurationMinutes / 60).toFixed(1);
    this.createMetricCard(grid, '⏱️', 'Total Flight Time', `${totalHoursStr} hrs`, `${stats.totalDurationMinutes} minutes in air`);
    this.createMetricCard(grid, '📊', 'Total Flights', `${stats.totalFlights}`, `${stats.recentFlights.length} logged notes`);
    this.createMetricCard(grid, '🌅', 'Landings (Day / Night)', `${stats.totalDayLandings} / ${stats.totalNightLandings}`, 'Regulatory takeoff tracking');
    this.createMetricCard(grid, '⚠️', 'Anomalies & Incidents', `${stats.incidentCount}`, stats.incidentCount === 0 ? 'Clean safety record' : 'Review safety logs');

    // Main Content Split
    const split = container.createDiv({ cls: 'drone-dashboard-split' });

    // Left Column: Recent Flights Table
    const leftCol = split.createDiv({ cls: 'drone-section-card' });
    const recentHeader = leftCol.createDiv({ cls: 'drone-section-header' });
    recentHeader.createSpan({ text: '📋 Recent Flight Logs' });

    if (stats.recentFlights.length === 0) {
      leftCol.createDiv({ text: 'No drone flights logged yet. Click "+ Log New Flight" above to record your first mission!', cls: 'drone-field-hint' });
    } else {
      const table = leftCol.createEl('table', { cls: 'drone-flight-table' });
      const thead = table.createEl('thead');
      const trHead = thead.createEl('tr');
      trHead.createEl('th', { text: 'Date' });
      trHead.createEl('th', { text: 'Aircraft' });
      trHead.createEl('th', { text: 'Location' });
      trHead.createEl('th', { text: 'Duration' });
      trHead.createEl('th', { text: 'Purpose' });

      const tbody = table.createEl('tbody');
      stats.recentFlights.slice(0, 10).forEach(item => {
        const tr = tbody.createEl('tr');
        tr.style.cursor = 'pointer';
        tr.onclick = () => {
          this.app.workspace.getUnpinnedLeaf().openFile(item.file);
        };

        tr.createEl('td', { text: item.date });
        tr.createEl('td', { text: item.aircraft });
        tr.createEl('td', { text: item.location });
        tr.createEl('td', { text: `${item.duration}m` });
        
        const purpTd = tr.createEl('td');
        const purpClass = item.purpose.toLowerCase();
        purpTd.createEl('span', { cls: `drone-tag drone-tag-${purpClass}`, text: item.purpose });
      });
    }

    // Right Column: Aircraft Fleet & Battery Health
    const rightCol = split.createDiv({ cls: 'drone-section-card' });
    const rightHeader = rightCol.createDiv({ cls: 'drone-section-header' });
    rightHeader.createSpan({ text: '🔋 Fleet & Battery Inventory' });

    rightCol.createDiv({ cls: 'drone-field-label', text: 'Aircraft Flight Hours' });
    Object.entries(stats.aircraftHours).forEach(([craft, mins]) => {
      const row = rightCol.createDiv({ cls: 'drone-battery-item' });
      row.createDiv({ cls: 'drone-battery-id', text: craft });
      row.createDiv({ cls: 'drone-battery-cycles', text: `${(mins / 60).toFixed(1)} hrs (${mins}m)` });
    });

    rightCol.createDiv({ cls: 'drone-field-label', text: 'Configured Battery Pool' });
    this.settings.batteries.forEach(bat => {
      const row = rightCol.createDiv({ cls: 'drone-battery-item' });
      const uses = stats.batteryUsage[bat.batteryCode] || 0;
      const totalC = bat.totalCycles + uses;

      row.createDiv({ cls: 'drone-battery-id', text: bat.batteryCode });
      row.createDiv({ cls: 'drone-battery-cycles', text: `${totalC} cycles | Health: ${bat.healthPct}%` });
    });
  }

  private createMetricCard(container: HTMLElement, icon: string, label: string, value: string, subtext: string) {
    const card = container.createDiv({ cls: 'drone-metric-card' });
    card.createDiv({ cls: 'drone-metric-icon', text: icon });
    card.createDiv({ cls: 'drone-metric-label', text: label });
    card.createDiv({ cls: 'drone-metric-value', text: value });
    card.createDiv({ cls: 'drone-metric-subtext', text: subtext });
  }

  async onClose() {
    // Cleanup if needed
  }
}
