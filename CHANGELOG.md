# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-04-11

### Fixed

- GitHub Release workflow now builds and uploads a user-ready plugin ZIP archive containing the `wpis-plugin-inventar/` folder
- Manual installation instructions now explicitly point to the release asset ZIP and warn against the GitHub `Source code (zip)` archive

## [0.1.1] - 2026-04-11

### Added

- Security policy document for responsible vulnerability disclosure

### Changed

- README cleanup and improved project links/documentation sections

### Fixed

- Included release artifacts under dist/ for reliable release packaging
- Adjusted gitignore handling for generated plugin release files

## [0.1.0] - 2026-04-08

### Added

- Initial release of Plugin Inventar
- Automatic plugin inventory generation on Obsidian startup
- Plugin change detection and inventory updates when plugins are installed/uninstalled/enabled/disabled
- Per-device inventory files to prevent Obsidian Sync conflicts
- Settings tab to configure inventory folder location
- Manual update command via Command Palette
- Configurable inventory folder with default location `System/Plugin-Inventar`
- Clean Markdown table format showing plugin status, names, IDs, and versions
- Mobile device support with hostname fallback
- Comprehensive unit tests (41 tests) for core functionality
- Complete TypeScript implementation with no external dependencies
- MIT License

### Technical

- Built with Obsidian API, TypeScript, and Esbuild
- Full test coverage for DeviceInfo and InventoryManager modules
- Vitest-based unit test suite
- GitHub Actions automated release workflow

## Future Roadmap

### [0.2.0] - Planned

- [ ] Plugin size tracking per device
- [ ] Settings to filter/exclude specific plugins
- [ ] Vault name alias (custom display names)
- [ ] Periodic auto-update interval configuration
- [ ] Export inventory to CSV/JSON formats
- [ ] Comparison view between devices

### [0.3.0] - Planned

- [ ] Plugin metadata caching for faster performance
- [ ] Statistics dashboard (most common plugins, version spreads)
- [ ] Sync conflict detection and resolution
- [ ] Custom inventory layout templates

---

[Unreleased]: https://github.com/walleralexander/wpis-obsidian-plugin-inventar/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/walleralexander/wpis-obsidian-plugin-inventar/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/walleralexander/wpis-obsidian-plugin-inventar/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/walleralexander/wpis-obsidian-plugin-inventar/releases/tag/v0.1.0
