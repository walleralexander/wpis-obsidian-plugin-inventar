# WPIS Plugin-Inventar – Claude Code Projekt-Kontext

## Projekt-Übersicht

Obsidian Community Plugin, das pro Gerät und Vault eine eigene Markdown-Notiz mit
allen installierten Plugins pflegt. Ziel: Veröffentlichung im offiziellen
Obsidian Community Plugin Repository.

**Autor:** Alexander Waller – WebPoint Internet Solutions, Lauterach, Vorarlberg, AT  
**Kontakt:** a.waller@webpoint.at  
**Plugin-ID:** `wpis-plugin-inventar`  
**Workspace:** `C:\workspace\wpis-plugin-inventar\`

---

## Kernfunktion

- Beim Vault-Start und bei jeder Plugin-Änderung (Install/Deinstall/Aktivierung)
  wird automatisch eine Notiz aktualisiert.
- Dateiname: `<KonfigurierbarerOrdner>/<VaultName>_<Gerätename>.md`
  → Pro Gerät eine eigene Datei, kein Git-Sync-Konflikt.
- Inhalt: Tabelle aller installierten Plugins (aktiv/deaktiviert), Vault-Name,
  Gerätename (Hostname), Zeitstempel, Auslöser der Aktualisierung.

---

## Projektstruktur (Zielzustand)

```
wpis-plugin-inventar/
├── src/
│   ├── main.ts               # Plugin-Einstiegspunkt (Obsidian Plugin-Klasse)
│   ├── InventoryManager.ts   # Logik: Plugins lesen, Markdown bauen, Notiz schreiben
│   ├── DeviceInfo.ts         # Gerätename ermitteln (Desktop/Mobile-Fallback)
│   ├── SettingsTab.ts        # Obsidian Settings-UI
│   └── types.ts              # Shared Interfaces/Types
├── tests/
│   ├── InventoryManager.test.ts
│   ├── DeviceInfo.test.ts
│   └── mocks/
│       └── obsidian.ts       # Minimale Obsidian-API-Mocks für Tests
├── .github/
│   └── workflows/
│       └── release.yml       # Automatischer GitHub Release bei Tag-Push
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── vitest.config.ts
├── README.md
├── CHANGELOG.md
└── LICENSE                   # MIT
```

---

## Setup-Aufgaben beim ersten Start

Claude Code soll folgende Schritte ausführen:

### 1. Projektgerüst aus offiziellem Template aufbauen

Verwende das offizielle Obsidian-Plugin-Sample als Referenz für:
- `package.json` (Scripts: `build`, `dev`, `test`)
- `tsconfig.json` (target ES6, moduleResolution node, strict true)
- `esbuild.config.mjs` (bundle, external: obsidian/electron, format cjs)

Abhängigkeiten:
```
npm install --save-dev obsidian esbuild @types/node typescript vitest
```

### 2. Bestehenden Code refaktorieren

Den bestehenden `main.ts` (Einzeldatei) in die Struktur unter `src/` aufteilen:

**`src/types.ts`**
```typescript
export interface PluginEntry {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
}

export interface PluginInventarSettings {
  inventoryFolder: string;  // Default: "System/Plugin-Inventar"
}

export const DEFAULT_SETTINGS: PluginInventarSettings = {
  inventoryFolder: "System/Plugin-Inventar",
};
```

**`src/DeviceInfo.ts`** – Gerätename ermitteln, Sonderzeichen sanitieren:
```typescript
// Hostname via Node.js os.hostname(), Fallback "Mobile" / "Unknown"
// Sanitierung: Zeichen die in Dateinamen ungültig sind ersetzen durch "-"
// Ungültige Zeichen: \ / : * ? " < > | und führende/trailing Leerzeichen
```

**`src/InventoryManager.ts`** – Kernlogik ohne Obsidian-Abhängigkeiten wo möglich:
```typescript
// buildMarkdown(plugins: PluginEntry[], meta: {...}): string  ← pure function, testbar
// getInstalledPlugins(app: App): PluginEntry[]
// writeNote(vault: Vault, path: string, content: string): Promise<void>
```

**`src/SettingsTab.ts`** – Obsidian PluginSettingTab:
```typescript
// Einstellung: Zielordner (inventoryFolder) – Text-Input mit Beschreibung
// Sprache: Englisch (Community-Standard)
```

**`src/main.ts`** – Schlank halten, nur Obsidian-Lifecycle:
```typescript
// onload: Settings laden, onLayoutReady → updateInventory, Event registrieren, Command registrieren
// Trigger-Strings auf Englisch: "Startup", "Plugin change", "Manual"
```

### 3. Tests schreiben (Vitest)

Testbare Units sind bewusst von der Obsidian-API getrennt.

**`tests/mocks/obsidian.ts`** – Minimale Mocks:
```typescript
// Mock für Vault (create, modify, getAbstractFileByPath, createFolder)
// Mock für App (vault, plugins.manifests, plugins.enabledPlugins)
// NUR was die Tests brauchen – kein vollständiges Mock der gesamten API
```

**`tests/InventoryManager.test.ts`**
Zu testende Funktionen:
- `buildMarkdown()` – Ausgabe enthält Vault-Name, Gerätename, Timestamp, alle Plugins
- `buildMarkdown()` – Aktive und deaktivierte Plugins werden korrekt getrennt
- `buildMarkdown()` – Plugins alphabetisch sortiert
- `buildMarkdown()` – Leere Plugin-Liste erzeugt valides Markdown (kein Crash)
- Dateinamen-Generierung: `<vault>_<device>.md` korrekt zusammengesetzt

**`tests/DeviceInfo.test.ts`**
- Sanitierung: `My PC\Server` → `My PC-Server`
- Sanitierung: `PC:Name` → `PC-Name`
- Sanitierung: Leerzeichen am Anfang/Ende werden getrimmt
- Leerer String → Fallback `"Unknown"`

### 4. README.md erstellen

Sprache: Englisch (Obsidian Community Standard).

Inhalt:
- Was macht das Plugin (kurze Beschreibung)
- Screenshot-Platzhalter
- Installation (Community Plugins / manuell)
- Konfiguration (Zielordner-Setting)
- Warum pro-Gerät-Dateien (Git-Sync-Erklärung)
- Bekannte Einschränkungen (Mobile: Hostname nicht verfügbar)
- Contributing / License

### 5. GitHub Actions Release-Workflow

**`.github/workflows/release.yml`**

Trigger: Push eines Tags `v*` (z.B. `v1.0.0`)

Steps:
1. Checkout
2. Node.js Setup
3. `npm ci`
4. `npm run build`
5. GitHub Release erstellen mit Assets: `main.js`, `manifest.json`, `styles.css` (falls vorhanden)

Orientierung an: https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/.github/workflows/release.yml

### 6. CHANGELOG.md anlegen

Format: Keep a Changelog (https://keepachangelog.com)

```markdown
# Changelog

## [Unreleased]

## [1.0.0] - TBD
### Added
- Initial release
- Automatic plugin inventory per device and vault
- Configurable target folder in settings
- Manual update via Command Palette
```

---

## Qualitätsanforderungen (für Community-Release)

- **Kein `as any`** außer wo die Obsidian-API es absolut erfordert (interne APIs)
  → Kommentar mit Begründung wenn doch
- **Strict TypeScript** – keine impliziten `any`
- **Fehlerbehandlung** – alle async-Funktionen haben try/catch, Fehler werden
  mit `console.error` geloggt, kein stiller Absturz
- **Dateinamen-Sanitierung** – Hostname kann Sonderzeichen enthalten
- **Mobile-kompatibel** – `os`-Modul nicht verfügbar auf iOS/Android → Fallback
- **Englische UI-Strings** – Settings-Tab, Command-Name auf Englisch;
  interne Log-Kommentare können Deutsch bleiben
- **Keine externen Abhängigkeiten** im Bundle – nur `obsidian` (extern) und Node built-ins

---

## Bekannte Probleme im aktuellen Code (zu beheben)

1. `(this.app as any).plugins.on("change", ...)` – prüfen ob dieses Event
   in allen Obsidian-Versionen (ab minAppVersion 1.0.0) verfügbar ist;
   ggf. auf `app.plugins.on` mit Fallback zu `onExternalSettingsChanged` umstellen

2. Markdown-Footer noch auf Deutsch und falschem Plugin-Namen:
   `"Plugin Inventory"` → `"WPIS Plugin-Inventar"` korrigieren

3. `os`-Import schlägt auf Mobile fehl – muss in `DeviceInfo.ts` sauber
   mit try/catch und `typeof process !== 'undefined'`-Guard abgesichert werden

4. Ordner wird nicht angelegt wenn `vault.createFolder` bereits existiert
   → prüfen ob Ordner ein `TFolder` ist bevor `createFolder` aufgerufen wird

---

## Workflow für Claude Code

```
1. cd C:\workspace\wpis-plugin-inventar
2. Projektstruktur anlegen (Ordner src/, tests/, .github/workflows/)
3. package.json / tsconfig.json / esbuild.config.mjs erstellen
4. npm install
5. Bestehenden Code refaktorieren in src/-Struktur
6. Tests schreiben und mit `npm test` grün bekommen
7. `npm run build` – main.js muss fehlerfrei entstehen
8. README.md, CHANGELOG.md, LICENSE (MIT) erstellen
9. GitHub Actions Workflow erstellen
10. Abschlussprüfung: manifest.json auf Vollständigkeit prüfen
    (id, name, version, minAppVersion, description, author, authorUrl, isDesktopOnly)
```

---

## Referenzen

- Obsidian Plugin Sample: https://github.com/obsidianmd/obsidian-sample-plugin
- Plugin Submission Guidelines: https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Obsidian API Typen: https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts
- Keep a Changelog: https://keepachangelog.com
- 