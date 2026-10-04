import { App, TFile } from 'obsidian';

export interface VaultStats {
  totalFlights: number;
  totalDurationMinutes: number;
  totalDayLandings: number;
  totalNightLandings: number;
  incidentCount: number;
  aircraftHours: Record<string, number>; // aircraftModel -> totalMinutes
  batteryUsage: Record<string, number>; // batteryId -> usageCount
  recentFlights: Array<{
    file: TFile;
    date: string;
    aircraft: string;
    location: string;
    duration: number;
    purpose: string;
    hasAnomalies: boolean;
  }>;
}

export async function parseVaultFlightStats(app: App): Promise<VaultStats> {
  const stats: VaultStats = {
    totalFlights: 0,
    totalDurationMinutes: 0,
    totalDayLandings: 0,
    totalNightLandings: 0,
    incidentCount: 0,
    aircraftHours: {},
    batteryUsage: {},
    recentFlights: []
  };

  const files = app.vault.getMarkdownFiles();

  for (const file of files) {
    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter;

    if (!fm) continue;

    // Check if it's a flight log note
    const isFlightLog = fm.type === 'drone-flight-log' || 
      (Array.isArray(fm.tags) && fm.tags.includes('drone/flight-log'));

    if (!isFlightLog) continue;

    stats.totalFlights += 1;

    const duration = Number(fm.duration_minutes || 0);
    stats.totalDurationMinutes += duration;

    stats.totalDayLandings += Number(fm.day_landings || 0);
    stats.totalNightLandings += Number(fm.night_landings || 0);

    if (fm.has_anomalies || (fm.anomalies && String(fm.anomalies).trim().length > 0)) {
      stats.incidentCount += 1;
    }

    const aircraft = String(fm.aircraft_model || 'Unknown Aircraft');
    stats.aircraftHours[aircraft] = (stats.aircraftHours[aircraft] || 0) + duration;

    const batIds = Array.isArray(fm.battery_ids) ? fm.battery_ids : [];
    for (const bId of batIds) {
      if (bId) {
        stats.batteryUsage[bId] = (stats.batteryUsage[bId] || 0) + 1;
      }
    }

    stats.recentFlights.push({
      file,
      date: String(fm.flight_date || file.basename),
      aircraft,
      location: String(fm.location || 'N/A'),
      duration,
      purpose: String(fm.purpose || 'General'),
      hasAnomalies: Boolean(fm.has_anomalies)
    });
  }

  // Sort recent flights descending by date
  stats.recentFlights.sort((a, b) => b.date.localeCompare(a.date));

  return stats;
}
