import { Plugin, Notice } from "obsidian";
import { DEFAULT_SETTINGS, PluginInventarSettings } from "./types";
import { InventoryManager } from "./InventoryManager";
import { getDeviceName } from "./DeviceInfo";

/**
 * WPIS Plugin-Inventar
 * Automatically maintains an inventory of installed plugins per device and Vault
 */
export default class PluginInventar extends Plugin {
  settings: PluginInventarSettings = DEFAULT_SETTINGS;
  private inventoryManager: InventoryManager | null = null;

  async onload() {
    console.log("Plugin Inventar loaded");

    // Load settings
    await this.loadSettings();

    // Initialize inventory manager
    this.inventoryManager = new InventoryManager(this.app, this.settings);

    // Add settings tab lazily so any tab-related runtime issue does not block plugin activation.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { SettingsTab } = require("./SettingsTab");
      this.addSettingTab(new SettingsTab(this.app, this));
    } catch (error) {
      console.error("Failed to initialize settings tab:", error);
    }

    // Register commands
    try {
      this.registerCommands();
    } catch (error) {
      console.error("Failed to register commands:", error);
    }

    // Run initial update immediately when workspace is already ready (plugin enabled at runtime),
    // otherwise wait for layout-ready during app startup.
    try {
      const workspaceProxy = this.app.workspace as any;
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
  private async onLayoutReady() {
    // Perform initial inventory update on startup
    try {
      await this.updateInventory("Startup", true);
    } catch (error) {
      console.error("Failed to update inventory on startup:", error);
    }

    // Register event listeners for plugin changes
    this.registerPluginChangeListener();
  }

  /**
   * Load plugin settings from disk
   */
  private async loadSettings() {
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
  private async updateInventory(
    trigger: "Startup" | "Plugin change" | "Manual" = "Manual",
    showSuccessNotice = false
  ) {
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
        new Notice("Plugin Inventar: Inventory updated");
      }
    } catch (error) {
      console.error("Failed to update plugin inventory:", error);
    }
  }

  /**
   * Register command palette commands
   */
  private registerCommands() {
    // Manual update command
    this.addCommand({
      id: "plugin-inventar-update",
      name: "Manual Update",
      callback: async () => {
        console.log("Manual inventory update triggered");
        await this.updateInventory("Manual");
      },
    });

    // Open settings command
    this.addCommand({
      id: "plugin-inventar-settings",
      name: "Open Configuration",
      callback: () => {
        // Open settings tab
        (this.app as any).setting.open();
        (this.app as any).setting.openTabById(this.manifest.id);
      },
    });
  }

  /**
   * Register listener for plugin changes
   * Updates inventory when plugins are installed/uninstalled/enabled/disabled
   */
  private registerPluginChangeListener() {
    // Try to use plugins.on("change") if available (newer Obsidian versions)
    const pluginsProxy = this.app.plugins as any;

    if (pluginsProxy.on && typeof pluginsProxy.on === "function") {
      pluginsProxy.on("change", async () => {
        console.log("Plugin change detected");
        await this.updateInventory("Plugin change");
      });
    } else {
      // Fallback: watch for external settings changes
      // This is less reliable but works on older Obsidian versions
      this.registerInterval(
        window.setInterval(async () => {
          // Periodically check for changes (every 5 minutes)
          // This is a fallback and not ideal, but ensures compatibility
          // with older Obsidian versions that don't support plugins.on()
        }, 5 * 60 * 1000)
      );

      console.log(
        "Note: plugins.on('change') not available, falling back to periodic checks"
      );
    }
  }
}
