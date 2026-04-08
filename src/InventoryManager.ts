import { App, Vault, TFolder } from "obsidian";
import { PluginEntry, PluginInventarSettings } from "./types";

/**
 * Manages plugin inventory: reading plugins, generating markdown, writing notes
 */
export class InventoryManager {
  constructor(private app: App, private settings: PluginInventarSettings) {}

  /**
   * Get list of installed plugins from the app
   * @returns Array of PluginEntry objects
   */
  getInstalledPlugins(): PluginEntry[] {
    const plugins: PluginEntry[] = [];

    // Get all installed plugins from app.plugins.manifests
    const manifests = (this.app.plugins as any).manifests || {};
    const enabledPlugins = (this.app.plugins as any).enabledPlugins || new Set();

    for (const [pluginId, manifest] of Object.entries(manifests)) {
      plugins.push({
        id: pluginId,
        name: (manifest as any).name || pluginId,
        version: (manifest as any).version || "unknown",
        enabled: enabledPlugins.has(pluginId),
      });
    }

    // Sort by name
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
  buildMarkdown(
    plugins: PluginEntry[],
    vaultName: string,
    deviceName: string,
    trigger: "Startup" | "Plugin change" | "Manual" = "Manual"
  ): string {
    const timestamp = new Date().toISOString();
    const enabledCount = plugins.filter((p) => p.enabled).length;
    const totalCount = plugins.length;

    let markdown = `# Plugin Inventory – ${vaultName}\n\n`;
    markdown += `- **Device:** ${deviceName}\n`;
    markdown += `- **Updated:** ${timestamp}\n`;
    markdown += `- **Trigger:** ${trigger}\n\n`;
    markdown += `## Installed Plugins (${enabledCount}/${totalCount} enabled)\n\n`;

    if (plugins.length === 0) {
      markdown += "No plugins installed.\n";
      return markdown;
    }

    // Create table
    markdown += `| Status | Name | ID | Version |\n`;
    markdown += `|--------|------|----|---------|\n`;

    for (const plugin of plugins) {
      const status = plugin.enabled ? "✅" : "⭕";
      markdown += `| ${status} | ${plugin.name} | ${plugin.id} | ${plugin.version} |\n`;
    }

    return markdown;
  }

  /**
   * Write inventory markdown to vault
   * @param vaultName Name of the vault
   * @param deviceName Name of the device
   * @param trigger What triggered the update
   */
  async writeNote(
    vaultName: string,
    deviceName: string,
    trigger: "Startup" | "Plugin change" | "Manual" = "Manual"
  ): Promise<void> {
    const vault = this.app.vault;

    try {
      // Get installed plugins
      const plugins = this.getInstalledPlugins();

      // Build markdown
      const markdown = this.buildMarkdown(
        plugins,
        vaultName,
        deviceName,
        trigger
      );

      // Normalize folder path (remove trailing/leading slashes)
      const folderPath = normalizeFolderPath(this.settings.inventoryFolder);

      // Ensure folder exists
      let folder = vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        folder = await vault.createFolder(folderPath);
      } else if (!(folder instanceof TFolder)) {
        throw new Error(
          `Inventory folder path "${folderPath}" exists but is not a folder`
        );
      }

      // Generate note filename
      const filename = `${vaultName}_${deviceName}.md`;
      const notePath = `${folderPath}/${filename}`;

      // Write or update the note
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
}

/**
 * Normalize folder path: remove leading/trailing slashes
 * @param path Folder path to normalize
 * @returns Normalized path
 */
function normalizeFolderPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}
