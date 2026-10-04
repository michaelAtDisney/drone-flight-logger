# 🚁 Drone Flight Log for Obsidian

[![Obsidian Community Plugin](https://img.shields.io/badge/Obsidian-Community%20Plugin-7C3AED?logo=obsidian&logoColor=white)](https://obsidian.md)
[![Latest Release](https://img.shields.io/github/v/release/michaelatdisney/drone-flight-logger?style=flat&color=blue)](https://github.com/michaelatdisney/drone-flight-logger/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Drone Flight Log** is an Obsidian plugin for UAV/UAS pilots, Part 107 commercial operators, inspection teams, and drone hobbyists. Log missions, monitor battery cycle degradation, track airframes, verify regulatory day/night currency, and visualize your entire fleet's flight statistics directly inside your Obsidian knowledge base.

---

## ✨ Features

- **🚀 Interactive Flight Logging Wizard**: Multi-step modal designed for fast field logging:
  - **Mission & Time**: Auto-calculates total air duration, records takeoff/landing counts (day & night), mission purpose, and GPS coordinates.
  - **Aircraft & Battery**: Fleet selector, battery serial assignment, starting/ending battery percentages, and max altitude/distance telemetry.
  - **Crew & Weather**: Pilot in Command (PIC), Visual Observers (VO with internal `[[wiki-links]]`), wind speed/direction, visibility, temperature, and lighting.
  - **Anomalies & Notes**: Dedicated incident tracking for firmware alerts, compass issues, near-misses, or airspace events.
- **📊 Fleet Analytics & Flight Dashboard**: A dedicated workspace view (`Open Drone Flight Dashboard`) featuring:
  - Key performance indicators: Total flight hours, total missions, day vs. night landings, and incident counts.
  - Interactive table of recent flight logs with instant note access.
  - Fleet airframe flight time breakdown.
  - Battery inventory cycle counts and health tracking.
- **📑 Standardized Markdown & Dataview-Ready Metadata**: Every flight log generates structured YAML frontmatter (`type: drone-flight-log`, tags, numeric telemetry), accompanied by styled callout cards and clean Markdown tables.
- **🔋 Battery Inventory Tracker**: Monitor charge cycles and battery health over time to ensure battery safety and retire failing packs proactively.
- **🛸 Multi-Aircraft Fleet Management**: Store your UAV inventory (DJI, Autel, Skydio, custom FPV rigs) with serial numbers and FAA/CAA registration numbers in plugin settings for instant 1-click selection.
- **📏 Metric & Imperial Units**: Seamless toggle between feet/miles and meters/kilometers.
- **📝 In-Editor Template Insertion**: Quick command to insert a flight log template directly into any active note.

---

## 📸 Screenshots & Visual Overview

### 1. Interactive Flight Logging Wizard
> Quickly record flight parameters across categorized tabs with automatic duration calculation and prefilled fleet data.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🚁 New Drone Flight Log                                                │
│ Record essential flight telemetry, equipment health, and mission details│
├────────────────────────────────────────────────────────────────────────┤
│ [📍 Mission & Time]  [🛸 Aircraft & Battery]  [👤 Crew]  [⚠️ Anomalies]│
├────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Calculated Flight Air Duration: 25 minutes (0.4 hrs)               │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ Flight Date: [ 2026-10-04 ]  Start: [ 10:00 ]  End: [ 10:25 ]          │
│ Location / Launch Site: [ Site Alpha - North Ridge ]                   │
│ Purpose: [ Commercial ▼ ]                                              │
│ Day Takeoffs: [1] Landings: [1]  |  Night Takeoffs: [0] Landings: [0]  │
├────────────────────────────────────────────────────────────────────────┤
│                                        [ Cancel ]  [ Save Flight Log ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Fleet Command & Flight Analytics Dashboard
> Aggregates flight telemetry across your entire vault in real time.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🛸 Drone Flight Analytics & Fleet Command       [+ Log Flight] [🔄]    │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ ⏱️ Flight Time   │ 📊 Total Flights │ 🌅 Landings      │ ⚠️ Anomalies  │
│ 42.5 hrs         │ 118 logs         │ 110 Day / 8 Night│ 1 incident    │
├──────────────────┴──────────────────┴──────────────────┴───────────────┤
│ 📋 Recent Flight Logs                                                  │
│ Date        Aircraft          Location        Duration   Purpose       │
│ 2026-10-04  Mavic 3 Ent.      Site Alpha      25m        Commercial    │
│ 2026-10-02  EVO II Pro 6K     West Field      32m        Mapping       │
│ 2026-09-28  Mavic 3 Ent.      Substation B    18m        Inspection    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📥 Installation

### Method 1: Obsidian Community Plugins (Recommended)
1. In Obsidian, open **Settings** > **Community plugins**.
2. Make sure **Restricted mode** is turned **off**.
3. Click **Browse** and search for `Drone Flight Log`.
4. Click **Install**, then click **Enable**.

### Method 2: Obsidian42 - BRAT (Beta Testing)
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins.
2. In BRAT settings, select **Add Beta plugin**.
3. Enter `michaelatdisney/drone-flight-logger`.
4. Enable the plugin under **Community plugins**.

### Method 3: Manual Installation
1. Download the latest release assets (`main.js`, `manifest.json`, and `styles.css`) from the [Releases page](https://github.com/michaelatdisney/drone-flight-logger/releases).
2. In your Obsidian vault, navigate to `.obsidian/plugins/`.
3. Create a folder named `drone-flight-log/`.
4. Place `main.js`, `manifest.json`, and `styles.css` inside that folder.
5. Reload Obsidian and enable **Drone Flight Log** under **Settings** > **Community plugins**.

---

## 🚀 Quick Start Guide

### Step 1: Configure Your Fleet & Batteries
1. Navigate to **Settings** > **Drone Flight Log**.
2. Set your **Default Remote Pilot in Command (PIC)** name.
3. Choose your preferred **Measurement Units** (Imperial or Metric).
4. Under **Aircraft Fleet Manager**, add your drone models, registrations, and serial numbers.
5. Under **Battery Inventory & Cycle Tracker**, add your battery identification codes (e.g., `BAT-M3E-01`).

### Step 2: Log a Flight
You can trigger the flight logging modal at any time using:
- The **airplane ribbon icon** on the left ribbon.
- The command palette (`Ctrl/Cmd + P`) -> **Drone Flight Log: Log New Drone Flight**.
- The **+ Log New Flight** button in the Flight Dashboard.

Fill out the flight details and click **Save Flight Log**. A new note is automatically generated in your specified logs folder.

### Step 3: Open the Dashboard
- Open the command palette (`Ctrl/Cmd + P`) and run:
  ```text
  Drone Flight Log: Open Drone Flight Dashboard
  ```
- The dashboard parses all flight log notes in your vault and updates metrics, fleet airframe hours, and battery cycle counts.

---

## 📄 Generated Note Structure

Flight notes are created with structured YAML frontmatter for seamless searching, Dataview queries, and archiving.

```markdown
---
type: drone-flight-log
tags:
  - drone/flight-log
  - aircraft/mavic-3-enterprise
flight_date: "2026-10-04"
start_time: "10:00"
end_time: "10:25"
duration_minutes: 25
location: "Site Alpha - North Ridge"
coordinates: "37.7749, -122.4194"
purpose: "Commercial"
aircraft_make: "DJI"
aircraft_model: "Mavic 3 Enterprise"
aircraft_registration: "FA3X99001"
aircraft_serial: "1581F4EKD22001"
battery_ids:
  - "BAT-M3E-01"
battery_start_pct: 100
battery_end_pct: 35
max_altitude_ft: 350
max_distance_ft: 1200
day_takeoffs: 1
day_landings: 1
night_takeoffs: 0
night_landings: 0
pic: "Remote Pilot"
visual_observers:
  - "Jane Doe"
weather_wind: "8 mph NW"
weather_visibility: "10 miles"
weather_temp: "72°F"
weather_lighting: "Daylight"
has_anomalies: false
---

# 🚁 Drone Flight Log: Mavic 3 Enterprise - 2026-10-04

> [!info] Flight Summary
> - **Date & Time**: 2026-10-04 (10:00 – 10:25)
> - **Total Air Duration**: **25 minutes** (0.4 hrs)
> - **Location / Site**: Site Alpha - North Ridge (`37.7749, -122.4194`)
> - **Mission Purpose**: `Commercial`
> - **Takeoffs & Landings**: Day (1/1) | Night (0/0)

---

## 🛸 Aircraft & Battery Telemetry

| Parameter | Recorded Value |
| :--- | :--- |
| **Aircraft Model** | DJI Mavic 3 Enterprise |
| **Registration / Serial** | `FA3X99001` / `1581F4EKD22001` |
| **Battery Unit(s)** | BAT-M3E-01 |
| **Battery Discharge** | 100% → 35% (Used 65%) |
| **Max Altitude** | 350 ft AGL |
| **Max Distance** | 1200 ft range |

---

## 👤 Personnel & Weather Conditions

* **Remote Pilot in Command (PIC)**: [[Remote Pilot]]
* **Visual Observers (VO)**: [[Jane Doe]]
* **Wind**: 8 mph NW
* **Visibility**: 10 miles
* **Temperature**: 72°F
* **Lighting**: Daylight

---

## 📝 Mission Log & Notes

Captured high-resolution orthomosaic imagery over the north perimeter. All battery cell voltages remained balanced.
```

---

## 🔍 Dataview Queries

Because flight logs use standardized frontmatter, you can use the [Dataview plugin](https://github.com/blacksmithgu/obsidian-dataview) to build custom queries and reports.

### Recent Flights Table
```dataview
TABLE 
  flight_date AS "Date", 
  aircraft_model AS "Aircraft", 
  duration_minutes + " min" AS "Duration", 
  purpose AS "Purpose", 
  pic AS "Pilot"
FROM #drone/flight-log
SORT flight_date DESC
LIMIT 10
```

### Flights with Recorded Anomalies or Incidents
```dataview
TABLE 
  flight_date AS "Date", 
  aircraft_model AS "Aircraft", 
  location AS "Location",
  weather_wind AS "Wind"
FROM #drone/flight-log
WHERE has_anomalies = true
SORT flight_date DESC
```

### Total Hours by Aircraft (DataviewJS)
```dataviewjs
const pages = dv.pages('#drone/flight-log');
const byAircraft = {};

for (let p of pages) {
  const craft = p.aircraft_model || "Unknown";
  byAircraft[craft] = (byAircraft[craft] || 0) + (p.duration_minutes || 0);
}

dv.table(
  ["Aircraft", "Total Air Time (Hours)"],
  Object.entries(byAircraft).map(([craft, mins]) => [craft, (mins / 60).toFixed(1) + " hrs"])
);
```

---

## ⚙️ Settings Reference

| Setting | Default | Description |
| :--- | :--- | :--- |
| **Default PIC** | `Remote Pilot` | Name of the primary Remote Pilot in Command automatically filled in new logs. |
| **Measurement Units** | `Imperial` | Toggle between Imperial (`ft`, `mph`) and Metric (`m`, `km/h`). |
| **Log Notes Vault Directory** | `Drone Logs` | Destination folder path within your vault where flight notes are created. |
| **Filename Pattern** | `YYYY-MM-DD - Flight - {{aircraft}} - {{location}}` | Configurable naming pattern using template tags. |
| **Auto-open Created Log Note** | `true` | Automatically opens the created flight note in the editor immediately after saving. |
| **Aircraft Fleet** | *Sample fleet* | List of airframes with manufacturer, model, registration, and serial number. |
| **Battery Inventory** | *Sample batteries* | List of battery units with code, model, initial cycle count, and health percentage. |

---

## 🛡️ Regulatory & Compliance Notes

Keeping accurate flight logs is a key requirement under aviation regulations such as **FAA Part 107** (USA), **EASA Open/Specific Category** (EU), **Transport Canada CARs**, and **UK CAA CAP 722**:

- **Currency Tracking**: Separate tracking for day and night takeoffs and landings helps verify pilot recency requirements.
- **Maintenance Records**: Airframe hours and battery cycle logs support preventive maintenance schedules and warranty claims.
- **Incident Documentation**: Built-in anomaly tracking ensures compliance with mandatory occurrence reporting guidelines.

> *Disclaimer: This plugin is a record-keeping tool. Operators are solely responsible for ensuring compliance with applicable local civil aviation authority regulations.*

---

## 🛠️ Development & Contributing

Contributions, bug reports, and suggestions are welcome!

### Building from Source
1. Clone the repository:
   ```bash
   git clone https://github.com/michaelatdisney/drone-flight-logger.git
   cd drone-flight-logger
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build for production or development:
   ```bash
   # Development (watch mode)
   npm run dev

   # Production build
   npm run build
   ```

### Submitting Issues
If you encounter a bug or have a feature idea, please open an issue on the [GitHub Issue Tracker](https://github.com/michaelatdisney/drone-flight-logger/issues).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
