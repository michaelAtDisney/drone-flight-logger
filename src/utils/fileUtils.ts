import { App, TFile, normalizePath } from 'obsidian';
import { FlightLogData, DronePluginSettings } from '../types';

export function formatFlightLogMarkdown(data: FlightLogData, settings: DronePluginSettings): string {
  const altUnit = settings.unitSystem === 'imperial' ? 'ft' : 'm';
  const distUnit = settings.unitSystem === 'imperial' ? 'ft' : 'm';

  const frontmatter = `---
type: drone-flight-log
tags:
  - drone/flight-log
  - aircraft/${data.aircraftModel.toLowerCase().replace(/[^a-z0-9]/g, '-')}
flight_date: "${data.flightDate}"
start_time: "${data.startTime}"
end_time: "${data.endTime}"
duration_minutes: ${data.durationMinutes}
location: "${data.location}"
coordinates: "${data.coordinates}"
purpose: "${data.purpose}"
aircraft_make: "${data.aircraftMake}"
aircraft_model: "${data.aircraftModel}"
aircraft_registration: "${data.aircraftRegistration}"
aircraft_serial: "${data.aircraftSerial}"
battery_ids:
${data.batteryIds.map(b => `  - "${b}"`).join('\n')}
battery_start_pct: ${data.batteryStartPct}
battery_end_pct: ${data.batteryEndPct}
max_altitude_${altUnit}: ${data.maxAltitude}
max_distance_${distUnit}: ${data.maxDistance}
day_takeoffs: ${data.dayTakeoffs}
day_landings: ${data.dayLandings}
night_takeoffs: ${data.nightTakeoffs}
night_landings: ${data.nightLandings}
pic: "${data.pic}"
visual_observers:
${data.visualObservers.map(vo => `  - "${vo}"`).join('\n')}
weather_wind: "${data.wind}"
weather_visibility: "${data.visibility}"
weather_temp: "${data.temperature}"
weather_lighting: "${data.lighting}"
has_anomalies: ${data.anomalies.trim().length > 0}
---

# 🚁 Drone Flight Log: ${data.aircraftModel} - ${data.flightDate}

> [!info] Flight Summary
> - **Date & Time**: ${data.flightDate} (${data.startTime} – ${data.endTime})
> - **Total Air Duration**: **${data.durationMinutes} minutes** (${(data.durationMinutes / 60).toFixed(1)} hrs)
> - **Location / Site**: ${data.location} ${data.coordinates ? `(\`${data.coordinates}\`)` : ''}
> - **Mission Purpose**: \`${data.purpose}\`
> - **Takeoffs & Landings**: Day (${data.dayTakeoffs}/${data.dayLandings}) | Night (${data.nightTakeoffs}/${data.nightLandings})

---

## 🛸 Aircraft & Battery Telemetry

| Parameter | Recorded Value |
| :--- | :--- |
| **Aircraft Model** | ${data.aircraftMake} ${data.aircraftModel} |
| **Registration / Serial** | \`${data.aircraftRegistration || 'N/A'}\` / \`${data.aircraftSerial || 'N/A'}\` |
| **Battery Unit(s)** | ${data.batteryIds.join(', ') || 'N/A'} |
| **Battery Discharge** | ${data.batteryStartPct}% → ${data.batteryEndPct}% (Used ${data.batteryStartPct - data.batteryEndPct}%) |
| **Max Altitude** | ${data.maxAltitude} ${altUnit} AGL |
| **Max Distance** | ${data.maxDistance} ${distUnit} range |

---

## 👤 Personnel & Weather Conditions

* **Remote Pilot in Command (PIC)**: [[${data.pic}]]
* **Visual Observers (VO)**: ${data.visualObservers.length > 0 ? data.visualObservers.map(vo => `[[${vo}]]`).join(', ') : 'None'}
* **Wind**: ${data.wind || 'Calm'}
* **Visibility**: ${data.visibility || 'Clear'}
* **Temperature**: ${data.temperature || 'N/A'}
* **Lighting**: ${data.lighting || 'Daylight'}
${data.weatherNotes ? `\n> [!note] Weather Notes\n> ${data.weatherNotes.split('\n').join('\n> ')}` : ''}

---

${data.anomalies.trim().length > 0 ? `> [!warning] Noteworthy Events & Anomalies\n> ${data.anomalies.split('\n').join('\n> ')}\n\n---` : ''}

## 📝 Mission Log & Notes

${data.notes.trim() ? data.notes : '*No additional flight notes entered.*'}
`;

  return frontmatter;
}

export function generateFilename(data: FlightLogData, settings: DronePluginSettings): string {
  let template = settings.filenameFormat || 'YYYY-MM-DD - Flight - {{aircraft}} - {{location}}';
  const cleanLocation = (data.location || 'Site').replace(/[^a-zA-Z0-9 -]/g, '').trim();
  const cleanAircraft = (data.aircraftModel || 'Drone').replace(/[^a-zA-Z0-9 -]/g, '').trim();

  let name = template
    .replace('YYYY-MM-DD', data.flightDate)
    .replace('{{aircraft}}', cleanAircraft)
    .replace('{{location}}', cleanLocation)
    .replace('{{purpose}}', data.purpose);

  return `${name}.md`;
}

export async function createFlightLogFile(
  app: App,
  data: FlightLogData,
  settings: DronePluginSettings
): Promise<TFile> {
  const folderPath = normalizePath(settings.logFolderPath || 'Drone Logs');
  
  // Ensure directory exists
  if (!app.vault.getAbstractFileByPath(folderPath)) {
    await app.vault.createFolder(folderPath);
  }

  const filename = generateFilename(data, settings);
  let filePath = normalizePath(`${folderPath}/${filename}`);
  
  // Handle duplicate filename by appending timestamp if file already exists
  if (app.vault.getAbstractFileByPath(filePath)) {
    const timeSuffix = data.startTime.replace(':', '');
    const nameWithoutExt = filename.substring(0, filename.length - 3);
    filePath = normalizePath(`${folderPath}/${nameWithoutExt} (${timeSuffix}).md`);
  }

  const content = formatFlightLogMarkdown(data, settings);
  const file = await app.vault.create(filePath, content);
  
  return file;
}
