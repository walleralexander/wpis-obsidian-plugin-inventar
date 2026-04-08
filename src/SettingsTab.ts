import { PluginSettingTab, App, Setting, Plugin } from "obsidian";

/**
 * Settings tab for Plugin Inventar
 * Allows configuration of the inventory folder location
 * 
 * NOTE: This class does not import the main plugin class to avoid circular imports.
 * The plugin parameter is typed as Plugin, and we access settings via (plugin as any).settings
 */
export class SettingsTab extends PluginSettingTab {
  plugin: Plugin;

  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Get plugin settings (cast to any to avoid type issues)
    const pluginSettings = (this.plugin as any).settings || {};
    const saveSettings = (this.plugin as any).saveSettings?.bind(this.plugin);

    // Add heading
    containerEl.createEl("h2", { text: "Plugin Inventar Settings" });

    // Inventory folder setting
    new Setting(containerEl)
      .setName("Inventory Folder")
      .setDesc(
        "Folder where plugin inventory markdown files will be stored. " +
        "Use a folder in Obsidian Sync to keep inventories across devices. " +
        "Each device will have its own file: <VaultName>_<DeviceName>.md"
      )
      .addText((text) =>
        text
          .setPlaceholder("System/Plugin-Inventar")
          .setValue(pluginSettings.inventoryFolder || "System/Plugin-Inventar")
          .onChange(async (value) => {
            // Normalize the folder path
            const normalized = value.trim() || "System/Plugin-Inventar";
            pluginSettings.inventoryFolder = normalized;
            
            if (saveSettings) {
              await saveSettings();
            }
          })
      );

    // Info box
    const infoBox = containerEl.createEl("div", {
      cls: "plugin-inventar-info",
      attr: {
        style:
          "border: 1px solid var(--color-base-35); border-radius: 4px; " +
          "padding: 12px; margin-top: 20px; background: var(--color-base-25);",
      },
    });

    infoBox.createEl("p", {
      text: "About Plugin Inventar",
      attr: {
        style: "margin: 0 0 8px 0; font-weight: 500;",
      },
    });

    infoBox.createEl("p", {
      text:
        "This plugin automatically maintains an inventory of all installed plugins " +
        "for each of your devices and vaults. Each time you start Obsidian or change " +
        "your installed plugins, a markdown note is created/updated with the current " +
        "list of plugins.",
      attr: {
        style: "margin: 0 0 8px 0; font-size: 0.95em; opacity: 0.8;",
      },
    });

    infoBox.createEl("p", {
      text:
        "The file is named <YourVaultName>_<YourDeviceName>.md. Using a synchronized " +
        "folder (like those managed by Obsidian Sync) allows you to track plugin " +
        "changes across all your devices.",
      attr: {
        style: "margin: 0; font-size: 0.95em; opacity: 0.8;",
      },
    });
  }
}
