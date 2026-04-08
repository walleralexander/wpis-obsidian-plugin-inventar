# Deployment Guide

Dieses Dokument beschreibt die Deployment-Optionen für das WPIS Plugin-Inventar.

## 1. Lokales Testen

Bevor du das Plugin veröffentlichst, solltest du es lokal in Obsidian testen.

### Anforderungen

- Obsidian installiert
- Ein Test-Vault (oder separater Vault zum Testen)
- Zugriff auf das Vault-Verzeichnis

### Schritt-für-Schritt Anleitung

#### 1.1 Build erstellen

```bash
cd /path/to/wpis-plugin-inventar
npm run build
```

Output: `dist/main.js` (10.3kb) und `dist/manifest.json`

#### 1.2 Plugin-Verzeichnis erstellen

Finde deinen Vault-Pfad. Beispiele:
- **Windows:** `C:\Users\YourName\Documents\Obsidian\MyVault`
- **macOS:** `/Users/YourName/Obsidian/MyVault`
- **Linux:** `/home/username/Obsidian/MyVault`

Erstelle das Plugin-Verzeichnis:

```bash
# Windows (PowerShell)
mkdir "$env:USERPROFILE\Documents\Obsidian\MyVault\.obsidian\plugins\wpis-plugin-inventar"

# macOS/Linux
mkdir -p ~/Obsidian/MyVault/.obsidian/plugins/wpis-plugin-inventar
```

#### 1.3 Build-Dateien kopieren

```bash
# Windows (PowerShell)
Copy-Item dist/main.js -Destination "$env:USERPROFILE\Documents\Obsidian\MyVault\.obsidian\plugins\wpis-plugin-inventar\"
Copy-Item dist/manifest.json -Destination "$env:USERPROFILE\Documents\Obsidian\MyVault\.obsidian\plugins\wpis-plugin-inventar\"

# macOS/Linux
cp dist/main.js ~/Obsidian/MyVault/.obsidian/plugins/wpis-plugin-inventar/
cp dist/manifest.json ~/Obsidian/MyVault/.obsidian/plugins/wpis-plugin-inventar/
```

#### 1.4 Obsidian neuladen

In Obsidian:
1. Settings → **About**
2. Klick **"Reload app"** ODER `Ctrl+R` / `Cmd+R`

Alternativ:
- Schließe Obsidian komplett und stelle es wieder her

#### 1.5 Plugin aktivieren

In Obsidian:
1. Settings → **Community Plugins**
2. Falls noch nicht aktiviert: **Disable Safe Mode**
3. Suche nach **"Plugin Inventar"** in der Liste
4. Klick **Enable**

#### 1.6 Funktionalität testen

Probiere folgende Dinge:

```
✓ Kommandopalette öffnen (Ctrl+P / Cmd+P)
✓ "Plugin Inventar: Manual Update" ausführen
✓ Schaue in deinen Vault nach: System/Plugin-Inventar/<VaultName>_<DeviceName>.md
✓ Settings öffnen (Ctrl+,) → "Plugin Inventar" Tab sollte sichtbar sein
✓ Inventory-Ordner-Setting ändern und speichern
✓ Nochmal "Manual Update" ausführen
✓ Neue Datei im neuen Ordner sollte erscheinen
```

#### 1.7 Nachricht in Obsidian Developer Console prüfen

Öffne Developer Tools:
- **macOS:** `Cmd+Option+I`
- **Windows/Linux:** `Ctrl+Shift+I`

Sollte Logs sehen wie:
```
Plugin Inventar loaded
Plugin inventory updated: System/Plugin-Inventar/MyVault_my-laptop.md (XX plugins)
```

---

## 2. GitHub Release (Automatisiert)

Nach lokalem Testen kannst du ein Release via GitHub Actions erstellen.

### Anforderungen

- Git Repository auf GitHub
- GitHub Actions enabled (Standardmäßig aktiv)

### Release-Prozess

#### 2.1 Versionsnummern aktualisieren

Ändere in **`package.json`**:
```json
"version": "0.1.0"  →  "0.1.1"  // oder 0.2.0, etc.
```

Ändere in **`manifest.json`**:
```json
"version": "0.1.0"  →  "0.1.1"
```

**Versionierungskonvention:** Semantic Versioning (Major.Minor.Patch)

#### 2.2 CHANGELOG.md aktualisieren

Verschiebe Unreleased-Änderungen in versioned Sektion:

```markdown
# Changelog

## [0.1.1] - 2026-04-08

### Fixed
- Fixed plugin event listener for older Obsidian versions
- Improved error handling in inventory write

### Added
- Initial feature set

## [0.1.0] - 2026-04-08
### Added
- Initial release
- ... (rest von 0.1.0 Features)
```

#### 2.3 Commit & Push

```bash
git add package.json manifest.json CHANGELOG.md
git commit -m "Release v0.1.1"
git push origin main
```

#### 2.4 Git Tag setzen (triggert GitHub Actions)

```bash
git tag v0.1.1
git push origin v0.1.1
```

### Was GitHub Actions dann tut:

1. ✅ `npm install` ausführen
2. ✅ `npm run build` ausführen
3. ✅ `manifest.json` in `dist/` kopieren
4. ✅ GitHub Release erstellen mit:
   - `dist/main.js`
   - `dist/manifest.json`
   - Release Notes aus Tag-Namen

### Release überprüfen

1. Gehe zu https://github.com/[dein-username]/wpis-plugin-inventar/releases
2. Sollte neue Release v0.1.1 mit Assets sehen
3. Download-Links sind verfügbar für Manual Distribution

---

## 3. Obsidian Community Plugins Submit

Um dein Plugin im offiziellen Obsidian Plugin Repository zu listen.

### Anforderungen

- **Erstes Release** muss v1.0.0 sein
- GitHub Public Repository
- Dokumentation (README.md) vollständig

### Submission Process

#### 3.1 README.md Review

Stelle sicher, dass [README.md](README.md) enthält:
- ✓ Plugin-Beschreibung
- ✓ Features
- ✓ Installation Instructions
- ✓ Configuration Guide
- ✓ Known Issues
- ✓ Author & Links
- ✓ License

(Aktuell ✓ alle vorhandenen)

#### 3.2 v1.0.0 Release erstellen

Folgee Schritt 2, aber mit v1.0.0:

```bash
# Updatee package.json & manifest.json → "1.0.0"
# Updatee CHANGELOG.md
git add .
git commit -m "Release v1.0.0: Initial release for community"
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions erstellt Release automatisch
```

#### 3.3 PR im obsidian-releases Repository erstellen

1. Öffne: https://github.com/obsidianmd/obsidian-releases
2. **Fork** das Repo
3. **Clone dein Fork:**
   ```bash
   git clone https://github.com/[dein-username]/obsidian-releases.git
   cd obsidian-releases
   ```

4. **Editiere `community-plugins.json`:**
   ```json
   {
     "id": "wpis-plugin-inventar",
     "name": "Plugin Inventar",
     "author": "Alexander Waller",
     "description": "Automatically maintain an inventory of installed plugins per device and vault",
     "repo": "atwaller/wpis-plugin-inventar"
   }
   ```

5. **Commit & Push zu deinem Fork:**
   ```bash
   git add community-plugins.json
   git commit -m "Add Plugin Inventar to community plugins"
   git push origin main
   ```

6. **GitHub UI:** Erstelle Pull Request gegen obsidianmd/obsidian-releases
   - Title: "Add Plugin Inventar"
   - Description: "New plugin for tracking installed plugins per device"

#### 3.4 Review & Merge

Obsidian Team wird schauen:
- ✓ Plugin existiert & ist public
- ✓ manifest.json hat alle erforderlichen Felder
- ✓ README.md vorhanden
- ✓ License vorhanden

Normalerweise: **1-3 Tage**

Sobald merged:
- ✅ Dein Plugin erscheint in Obsidian Community Plugins
- ✅ Suchbar in Community Plugins Dialog
- ✅ 1-Click Install für alle Nutzer

---

## Quick Reference

### Lokales Testen starten

```bash
# 1. Build
npm run build

# 2. Zu Vault kopieren
# (Nutze obige Pfade für dein OS)

# 3. Obsidian neuladen
# Settings → About → "Reload app"

# 4. Testen
# Settings → Community Plugins → Enable
# Ctrl+P → "Plugin Inventar: Manual Update"
# Überprüfe: System/Plugin-Inventar/...md
```

### Release-Checklist

```
Vor Release:
□ npm test → 41/41 Tests ✓
□ npm run build → kein Error ✓
□ Lokal getestet ✓
□ Version in package.json & manifest.json aktualisiert
□ CHANGELOG.md aktualisiert
□ git commit -m "Release vX.Y.Z"
□ git tag vX.Y.Z
□ git push origin vX.Y.Z
→ GitHub Actions übernimmt Rest ✓

Nach Release:
□ GitHub Release überprüfen
□ Download-Links funktionieren
□ Optionally: Community Plugin Submit
```

---

## Troubleshooting

### Plugin wird in Obsidian nicht angezeigt

**Problem:** Plugin im .obsidian/plugins/ Ordner aber nicht in Settings sichtbar

**Lösung:**
1. Obsidian komplett schließen
2. Überprüfe: `.obsidian/plugins/wpis-plugin-inventar/` enthält `main.js` + `manifest.json`
3. Stelle Obsidian wieder her
4. Settings → Community Plugins → Reload plugins (falls verfügbar)

### "TypeError: Cannot read property 'plugins' of undefined"

**Problem:** Plugin crasht beim Laden

**Lösung:**
1. Überprüfe `manifest.json` - sollte gültiges JSON sein
2. Build neu: `npm run build`
3. Kopiere `dist/main.js` & `dist/manifest.json` neu
4. Obsidian reload

### manifest.json wird nicht gefunden

**Problem:** GitHub Actions gibt Fehler

**Lösung:**
- Stelle sicher dass `release.yml` diese Zeile hat:
  ```yaml
  - name: Copy manifest to dist
    run: cp manifest.json dist/manifest.json
  ```

---

## Links & Ressourcen

- **Obsidian Plugin Development:** https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin
- **Community Plugins:** https://obsidian.md/plugins
- **Release Submissions:** https://github.com/obsidianmd/obsidian-releases
- **Plugin Review Guidelines:** https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md

---

**Fragen?** Schau dir [CLAUDE.md](CLAUDE.md) oder [.github/copilot-instructions.md](.github/copilot-instructions.md) an.
