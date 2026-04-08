# WPIS Plugin-Inventar – Claude Code Workspace Instructions

**Master Source:** [CLAUDE.md](../CLAUDE.md) – vollständiger Projekt-Kontext und Setup-Plan

## Projekt-Essentials

**Quick Facts:**
- Obsidian Community Plugin (TypeScript)
- Auto-Update: Plugin-Liste → Markdown-Note pro Gerät/Vault
- Zielgruppe: Obsidian Sync-Nutzer (verhindert Git-Konflikte durch Device-spezifische Dateien)
- Status: Greenfield – komplettes Projekt ist zu implementieren

**Key Commands:**
```bash
npm install             # Dependencies einmal
npm run build          # esbuild: dist/main.js, manifest.json
npm run dev            # Watch-Modus
npm test               # Vitest
npm run release        # Vorbereitung für GitHub Release
```

---

## Projektstruktur (Zielzustand)

```
wpis-plugin-inventar/
├── src/
│   ├── main.ts               # Obsidian Plugin-Einstiegspunkt, Lifecycle nur
│   ├── InventoryManager.ts   # Reine Funktion: buildMarkdown(), getInstalledPlugins(), writeNote()
│   ├── DeviceInfo.ts         # Hostname-Sanitierung (mit os.hostname() Fallback)
│   ├── SettingsTab.ts        # Obsidian PluginSettingTab UI
│   └── types.ts              # Shared Types: PluginEntry, PluginInventarSettings
├── tests/
│   ├── InventoryManager.test.ts
│   ├── DeviceInfo.test.ts
│   └── mocks/
│       └── obsidian.ts       # Minimale Mocks (nur was Tests brauchen)
├── dist/                      # Build-Ausgabe (gitignore)
│   ├── main.js
│   └── manifest.json
├── .github/
│   └── workflows/
│       └── release.yml       # GitHub Actions: Auto-Release auf Tag push
├── manifest.json              # Plugin-Metadaten (Quelle, wird ins dist/ kopiert)
├── package.json               # Scripts: build, dev, test, release
├── tsconfig.json              # strict: true, target: ES6
├── esbuild.config.mjs
├── vitest.config.ts
├── README.md                  # Englisch (Obsidian Community Standard)
├── CHANGELOG.md               # Keep-a-Changelog Format
├── LICENSE                    # MIT License
└── CLAUDE.md                  # Architektur-Details & Setup-Plan
```

---

## Implementierungs-Roadmap

### Phase 1: Projektgerüst (npm init, Config-Dateien)
- [ ] `package.json` (Scripts: build, dev, test, release)
- [ ] `tsconfig.json` (strict, ES6 target)
- [ ] `esbuild.config.mjs`
- [ ] `vitest.config.ts`
- [ ] `manifest.json` (Plugin-Metadaten)
- [ ] `npm install`

### Phase 2: Kern-Typen & Business Logic (ohne Obsidian-API)
- [ ] `src/types.ts` – PluginEntry, PluginInventarSettings, DEFAULT_SETTINGS
- [ ] `src/DeviceInfo.ts` – Hostname-Ermittlung + Dateinamen-Sanitierung
- [ ] `src/InventoryManager.ts` – buildMarkdown(), getInstalledPlugins(), writeNote()
- [ ] Tests schreiben: `tests/DeviceInfo.test.ts`, `tests/InventoryManager.test.ts`
- [ ] `tests/mocks/obsidian.ts` – minimale Mocks (Vault, App)
- [ ] `npm test` ✓

### Phase 3: Obsidian Integration
- [ ] `src/SettingsTab.ts` – PluginSettingTab (inventoryFolder Setting)
- [ ] `src/main.ts` – Plugin-Klasse, onload, onLayoutReady, Event-Handler
- [ ] `npm run build` ✓

### Phase 4: Dokumentation & Release
- [ ] `README.md` (englisch, Screenshot-Platzhalter, Installation, Konfiguration, Known Issues)
- [ ] `CHANGELOG.md` (Keep-a-Changelog)
- [ ] `LICENSE` (MIT)
- [ ] `.github/workflows/release.yml` (GitHub Actions: Tag → Release)
- [ ] `manifest.json` Validierung (id, name, version, minAppVersion, description, author)

---

## Architektur & Key Design Decisions

### Separation of Concerns
- **Business Logic** (`InventoryManager.ts`, `DeviceInfo.ts`) hat KEINE Obsidian-Abhängigkeiten
  → Ermöglicht reine Unit-Tests ohne Mocks
- **Obsidian Integration** ({`main.ts`, `SettingsTab.ts`) nutzt Business Logic
- **Vorteil:** Einfach zu testen, wartbar, portable

### Dateinamen-Strategie
```
<inventoryFolder>/<VaultName>_<DeviceName>.md
```
Beispiel: `System/Plugin-Inventar/MyVault_my-laptop.md`

**Grund:** Pro Gerät eine Datei → verhindert Git-Sync-Konflikte beim Multi-Device Obsidian Sync

### Hostname-Sanitierung
Siehe [DeviceInfo.ts](#) – Sonderzeichen (`\ / : * ? " < > |` und `/^s+|s+$/`) → `-`

**Fallback-Kette:**
1. `os.hostname()` (Node.js, Desktop)
2. Browser/Mobile: `"Unknown"` (iOS/Android haben kein `os`-Modul)

### Markdown-Format
```markdown
# Plugin Inventory – [VaultName]

- **Device:** [DeviceName]
- **Updated:** [ISO 8601 Timestamp]
- **Trigger:** [Startup | Plugin change | Manual]

## Installed Plugins (X total)

| Status | Name | ID | Version |
|--------|------|----|----|
| ✅ | Plugin A | plugin-a | 1.0.0 |
| ⭕ | Plugin B | plugin-b | 2.1.0 |
```

(⭕ = deaktiviert)

---

## Qualitäts-Anforderungen (Community Release)

✓ **Strict TypeScript**: `noImplicitAny`, `strict: true` in tsconfig.json  
✓ **Kein `as any`** außer mit Kommentar ("// Internal Obsidian API")  
✓ **Fehlerbehandlung:** try/catch in alle async-Funktionen  
✓ **Englische UI-Strings** (Settings, Commands)  
✓ **Keine externen Dependencies** im Bundle (außer obsidian)  
✓ **Mobile-Kompatibel:** Guard `typeof process !== 'undefined'` für os-Modul  
✓ **Dateinamen-Sicherheit:** Alle SonderZeichen in Hostname sanitiert  

---

## Bekannte Fallstricke & Lösungen

### 1. `plugins.on("change")` Event
**Problem:** Event existiert möglicherweise nicht ab `minAppVersion 1.0.0`

**Lösung:**
```typescript
// In main.ts - registerEventHandlers()
if (this.app.plugins.on) {
  this.app.plugins.on('change', () => updateInventory(...));
} else {
  // Fallback: onExternalSettingsChanged
  this.app.metadataCache.on('changed', () => updateInventory(...));
}
```

Referenz: [CLAUDE.md – Bekannte Probleme](#claude-md)

### 2. `os`-Modul auf Mobile schlägt fehl
**Problem:** iOS/Android haben kein Node.js `os`-Modul

**Lösung:**
```typescript
// In DeviceInfo.ts
try {
  const os = require('os');
  return sanitizeHostname(os.hostname());
} catch (e) {
  return sanitizeHostname("Mobile");  // oder "Unknown"
}
```

### 3. Ordner existiert bereits
**Problem:** `vault.createFolder()` schlägt fehl wenn Ordner existiert

**Lösung:**
```typescript
// In InventoryManager.ts - writeNote()
const folderPath = normalizeFolder(this.settings.inventoryFolder);
let folder = vault.getAbstractFileByPath(folderPath);

if (!folder) {
  folder = await vault.createFolder(folderPath);
} else if (!(folder instanceof TFolder)) {
  throw new Error(`${folderPath} is not a folder`);
}
```

---

## Testing Strategy

**Unit Tests (Vitest):** 
- `buildMarkdown()` → Ausgabe-Validierung (Vault-Name, Device, Timestamp, Plugins sortiert)
- `DeviceInfo.sanitizeHostname()` → Sonderzeichen, Edge Cases
- `getInstalledPlugins()` → Mocked App

**Integration Tests (optional, später):**
- Tatsächlicher Note-Write in Vault

**Mocking:**
- Minimale Mocks in `tests/mocks/obsidian.ts` (nur `Vault`, `App`, `TFolder`)
- Nicht: vollständige Obsidian API simulieren

---

## Commands & Flags

### Obsidian Command Palette Commands (englisch)
```
Plugin Inventar: Manual Update          → updateInventory("Manual")
Plugin Inventar: Open Configuration    → openSettings()
```

### Obsidian Ribbon Icon
Optional: Ribbon-Button für schnellen Zugriff auf "Manual Update"

---

## Common Development Tasks

### "Ich starte neu"
```bash
npm install
npm run build          # Siehe dist/main.js & dist/manifest.json
```

### "Ich teste lokal"
1. Obsidian Developer Mode: `Ctrl+Shift+I` (Settings → About → Enable Safe Mode → Disable Safe Mode)
2. Plugin-Verzeichnis: `VaultPath/.obsidian/plugins/wpis-plugin-inventar/`
3. Dateien kopieren: `dist/main.js`, `dist/manifest.json` → Plugin-Verzeichnis
4. Obsidian reload: `Ctrl+R` oder Settings → Community plugins → wpis-plugin-inventar OFF/ON

### "Ich schreibe Tests"
```bash
npm test              # Einmalig
npm test -- --watch  # Continuous
```

### "Ich bereite Release vor"
```bash
# 1. Version erhöhen in package.json & manifest.json
# 2. CHANGELOG.md aktualisieren
# 3. Commit & Push
# 4. Tag setzen: git tag v1.0.0 && git push origin v1.0.0
# 5. GitHub Actions release.yml läuft automatisch
```

---

## Links & Referenzen

- **[CLAUDE.md](../CLAUDE.md)** – Vollständiger Projekt-Kontext, Setup-Plan, Bekannte Probleme
- **Obsidian Plugin Sample:** https://github.com/obsidianmd/obsidian-sample-plugin
- **Plugin Submission Guidelines:** https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- **Obsidian API Types:** https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts
- **Keep a Changelog:** https://keepachangelog.com
- **MIT License:** https://opensource.org/licenses/MIT

---

## Quick Checklist für Phase-Abschluss

**Phase 1 Complete?**
- [ ] `npm install` ✓
- [ ] `npm run build` erzeugt fehlerfrei `dist/main.js`

**Phase 2 Complete?**
- [ ] `npm test` alle Tests grün

**Phase 3 Complete?**
- [ ] Plugin lädt in Obsidian (PluginSettingTab sichtbar)
- [ ] Settings speichern/laden funktioniert

**Phase 4 Complete?**
- [ ] README.md, CHANGELOG.md, LICENSE vorhanden
- [ ] manifest.json vollständig & valide
- [ ] GitHub Actions release.yml getestet (Tag push)

---

**Zuletzt aktualisiert:** April 2026  
**Autor:** Alexander Waller
