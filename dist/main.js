"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/SettingsTab.ts
var SettingsTab_exports = {};
__export(SettingsTab_exports, {
  SettingsTab: () => SettingsTab
});
var import_obsidian2, SettingsTab;
var init_SettingsTab = __esm({
  "src/SettingsTab.ts"() {
    "use strict";
    import_obsidian2 = require("obsidian");
    SettingsTab = class extends import_obsidian2.PluginSettingTab {
      constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
      }
      display() {
        const { containerEl } = this;
        containerEl.empty();
        const pluginSettings = this.plugin.settings || {};
        const saveSettings = this.plugin.saveSettings?.bind(this.plugin);
        containerEl.createEl("h2", { text: "Plugin Inventar Settings" });
        new import_obsidian2.Setting(containerEl).setName("Inventory Folder").setDesc(
          "Folder where plugin inventory markdown files will be stored. Use a folder in Obsidian Sync to keep inventories across devices. Each device will have its own file: <VaultName>_<DeviceName>.md"
        ).addText(
          (text) => text.setPlaceholder("System/Plugin-Inventar").setValue(pluginSettings.inventoryFolder || "System/Plugin-Inventar").onChange(async (value) => {
            const normalized = value.trim() || "System/Plugin-Inventar";
            pluginSettings.inventoryFolder = normalized;
            if (saveSettings) {
              await saveSettings();
            }
          })
        );
        const infoBox = containerEl.createEl("div", {
          cls: "plugin-inventar-info",
          attr: {
            style: "border: 1px solid var(--color-base-35); border-radius: 4px; padding: 12px; margin-top: 20px; background: var(--color-base-25);"
          }
        });
        infoBox.createEl("p", {
          text: "About Plugin Inventar",
          attr: {
            style: "margin: 0 0 8px 0; font-weight: 500;"
          }
        });
        infoBox.createEl("p", {
          text: "This plugin automatically maintains an inventory of all installed plugins for each of your devices and vaults. Each time you start Obsidian or change your installed plugins, a markdown note is created/updated with the current list of plugins.",
          attr: {
            style: "margin: 0 0 8px 0; font-size: 0.95em; opacity: 0.8;"
          }
        });
        infoBox.createEl("p", {
          text: "The file is named <YourVaultName>_<YourDeviceName>.md. Using a synchronized folder (like those managed by Obsidian Sync) allows you to track plugin changes across all your devices.",
          attr: {
            style: "margin: 0; font-size: 0.95em; opacity: 0.8;"
          }
        });
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PluginInventar
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  inventoryFolder: "System/Plugin-Inventar"
};

// src/InventoryManager.ts
var import_obsidian = require("obsidian");
var InventoryManager = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  /**
   * Get list of installed plugins from the app
   * @returns Array of PluginEntry objects
   */
  getInstalledPlugins() {
    const plugins = [];
    const manifests = this.app.plugins.manifests || {};
    const enabledPlugins = this.app.plugins.enabledPlugins || /* @__PURE__ */ new Set();
    for (const [pluginId, manifest] of Object.entries(manifests)) {
      plugins.push({
        id: pluginId,
        name: manifest.name || pluginId,
        version: manifest.version || "unknown",
        enabled: enabledPlugins.has(pluginId)
      });
    }
    plugins.sort((a, b) => a.name.localeCompare(b.name));
    return plugins;
  }
  /**
   * Build markdown content for plugin inventory
   * @param plugins Array of installed plugins
   * @param vaultName Name of the vault
   * @param deviceName Name of the device
   * @param trigger What triggered the update (Startup, Plugin change, Manual)
   * @returns Markdown formatted inventory
   */
  buildMarkdown(plugins, vaultName, deviceName, trigger = "Manual") {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const enabledCount = plugins.filter((p) => p.enabled).length;
    const totalCount = plugins.length;
    let markdown = `# Plugin Inventory \u2013 ${vaultName}

`;
    markdown += `- **Device:** ${deviceName}
`;
    markdown += `- **Updated:** ${timestamp}
`;
    markdown += `- **Trigger:** ${trigger}

`;
    markdown += `## Installed Plugins (${enabledCount}/${totalCount} enabled)

`;
    if (plugins.length === 0) {
      markdown += "No plugins installed.\n";
      return markdown;
    }
    markdown += `| Status | Name | ID | Version |
`;
    markdown += `|--------|------|----|---------|
`;
    for (const plugin of plugins) {
      const status = plugin.enabled ? "\u2705" : "\u2B55";
      markdown += `| ${status} | ${plugin.name} | ${plugin.id} | ${plugin.version} |
`;
    }
    return markdown;
  }
  /**
   * Write inventory markdown to vault
   * @param vaultName Name of the vault
   * @param deviceName Name of the device
   * @param trigger What triggered the update
   */
  async writeNote(vaultName, deviceName, trigger = "Manual") {
    const vault = this.app.vault;
    try {
      const plugins = this.getInstalledPlugins();
      const markdown = this.buildMarkdown(
        plugins,
        vaultName,
        deviceName,
        trigger
      );
      const folderPath = normalizeFolderPath(this.settings.inventoryFolder);
      let folder = vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        folder = await vault.createFolder(folderPath);
      } else if (!(folder instanceof import_obsidian.TFolder)) {
        throw new Error(
          `Inventory folder path "${folderPath}" exists but is not a folder`
        );
      }
      const filename = `${vaultName}_${deviceName}.md`;
      const notePath = `${folderPath}/${filename}`;
      const existingFile = vault.getFileByPath(notePath);
      if (existingFile) {
        await vault.modify(existingFile, markdown);
      } else {
        await vault.create(notePath, markdown);
      }
      console.log(
        `Plugin inventory updated: ${notePath} (${plugins.length} plugins)`
      );
    } catch (error) {
      console.error("Failed to write plugin inventory:", error);
      throw error;
    }
  }
};
function normalizeFolderPath(path) {
  return path.replace(/^\/+|\/+$/g, "");
}

// src/DeviceInfo.ts
function getDeviceName() {
  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      const os = require("os");
      const hostname = os.hostname();
      return sanitizeFilename(hostname);
    }
  } catch (e) {
  }
  return sanitizeFilename("Unknown");
}
function sanitizeFilename(input) {
  if (!input || input.trim().length === 0) {
    return "Unknown";
  }
  const invalidChars = /[\\/:"*?<>|]/g;
  let sanitized = input.replace(invalidChars, "-");
  sanitized = sanitized.trim();
  sanitized = sanitized.replace(/-+/g, "-");
  return sanitized || "Unknown";
}

// src/main.ts
var PluginInventar = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.inventoryManager = null;
  }
  async onload() {
    console.log("Plugin Inventar loaded");
    await this.loadSettings();
    this.inventoryManager = new InventoryManager(this.app, this.settings);
    try {
      const { SettingsTab: SettingsTab2 } = (init_SettingsTab(), __toCommonJS(SettingsTab_exports));
      this.addSettingTab(new SettingsTab2(this.app, this));
    } catch (error) {
      console.error("Failed to initialize settings tab:", error);
    }
    try {
      this.registerCommands();
    } catch (error) {
      console.error("Failed to register commands:", error);
    }
    try {
      const workspaceProxy = this.app.workspace;
      if (workspaceProxy.layoutReady) {
        await this.onLayoutReady();
      } else {
        this.registerEvent(
          this.app.workspace.on("layout-ready", () => {
            this.onLayoutReady();
          })
        );
      }
    } catch (error) {
      console.error("Failed to run/register initial inventory update:", error);
    }
  }
  async onunload() {
    console.log("Plugin Inventar unloaded");
  }
  /**
   * Called when workspace layout is fully loaded
   * Performs initial inventory update and registers event listeners
   */
  async onLayoutReady() {
    try {
      await this.updateInventory("Startup", true);
    } catch (error) {
      console.error("Failed to update inventory on startup:", error);
    }
    this.registerPluginChangeListener();
  }
  /**
   * Load plugin settings from disk
   */
  async loadSettings() {
    const savedData = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData?.settings);
  }
  /**
   * Save plugin settings to disk
   */
  async saveSettings() {
    await this.saveData({ settings: this.settings });
  }
  /**
   * Update inventory with current plugin list
   * @param trigger What triggered the update (Startup, Plugin change, Manual)
   */
  async updateInventory(trigger = "Manual", showSuccessNotice = false) {
    if (!this.inventoryManager) {
      return;
    }
    try {
      const vaultName = this.app.vault.getName();
      const deviceName = getDeviceName();
      await this.inventoryManager.writeNote(
        vaultName,
        deviceName,
        trigger
      );
      if (showSuccessNotice) {
        new import_obsidian3.Notice("Plugin Inventar: Inventory updated");
      }
    } catch (error) {
      console.error("Failed to update plugin inventory:", error);
    }
  }
  /**
   * Register command palette commands
   */
  registerCommands() {
    this.addCommand({
      id: "plugin-inventar-update",
      name: "Manual Update",
      callback: async () => {
        console.log("Manual inventory update triggered");
        await this.updateInventory("Manual");
      }
    });
    this.addCommand({
      id: "plugin-inventar-settings",
      name: "Open Configuration",
      callback: () => {
        this.app.setting.open();
        this.app.setting.openTabById(this.manifest.id);
      }
    });
  }
  /**
   * Register listener for plugin changes
   * Updates inventory when plugins are installed/uninstalled/enabled/disabled
   */
  registerPluginChangeListener() {
    const pluginsProxy = this.app.plugins;
    if (pluginsProxy.on && typeof pluginsProxy.on === "function") {
      pluginsProxy.on("change", async () => {
        console.log("Plugin change detected");
        await this.updateInventory("Plugin change");
      });
    } else {
      this.registerInterval(
        window.setInterval(async () => {
        }, 5 * 60 * 1e3)
      );
      console.log(
        "Note: plugins.on('change') not available, falling back to periodic checks"
      );
    }
  }
};
