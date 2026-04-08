import { describe, it, expect, beforeEach } from "vitest";
import { InventoryManager } from "@/InventoryManager";
import { createMockApp } from "./mocks/obsidian";
import { DEFAULT_SETTINGS } from "@/types";

describe("InventoryManager", () => {
  let manager: InventoryManager;
  let mockApp: ReturnType<typeof createMockApp>;

  beforeEach(() => {
    mockApp = createMockApp({
      plugins: [
        { id: "plugin-a", name: "Plugin A", version: "1.0.0", enabled: true },
        {
          id: "plugin-b",
          name: "Plugin B",
          version: "2.1.0",
          enabled: false,
        },
        { id: "plugin-c", name: "Plugin C", version: "1.5.0", enabled: true },
      ],
    });

    manager = new InventoryManager(mockApp as any, DEFAULT_SETTINGS);
  });;

  describe("getInstalledPlugins", () => {
    it("should return all installed plugins", () => {
      const plugins = manager.getInstalledPlugins();
      expect(plugins).toHaveLength(3);
    });

    it("should mark enabled plugins correctly", () => {
      const plugins = manager.getInstalledPlugins();
      const enabledPlugins = plugins.filter((p) => p.enabled);
      expect(enabledPlugins).toHaveLength(2);
    });

    it("should mark disabled plugins correctly", () => {
      const plugins = manager.getInstalledPlugins();
      const disabledPlugins = plugins.filter((p) => !p.enabled);
      expect(disabledPlugins).toHaveLength(1);
    });

    it("should sort plugins alphabetically by name", () => {
      const plugins = manager.getInstalledPlugins();
      const names = plugins.map((p) => p.name);
      expect(names).toEqual(["Plugin A", "Plugin B", "Plugin C"]);
    });

    it("should preserve plugin metadata", () => {
      const plugins = manager.getInstalledPlugins();
      const pluginA = plugins.find((p) => p.id === "plugin-a");
      expect(pluginA).toBeDefined();
      expect(pluginA?.name).toBe("Plugin A");
      expect(pluginA?.version).toBe("1.0.0");
      expect(pluginA?.enabled).toBe(true);
    });

    it("should return empty array when no plugins installed", () => {
      const emptyApp = createMockApp();
      const emptyManager = new InventoryManager(
        emptyApp as any,
        DEFAULT_SETTINGS
      );
      const plugins = emptyManager.getInstalledPlugins();
      expect(plugins).toHaveLength(0);
    });
  });

  describe("buildMarkdown", () => {
    it("should include vault name in heading", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop",
        "Startup"
      );
      expect(markdown).toContain("# Plugin Inventory – MyVault");
    });

    it("should include device name", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop",
        "Startup"
      );
      expect(markdown).toContain("- **Device:** my-laptop");
    });

    it("should include ISO 8601 timestamp", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop",
        "Startup"
      );
      expect(markdown).toMatch(/- \*\*Updated:\*\* \d{4}-\d{2}-\d{2}T/);
    });

    it("should include trigger reason", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop",
        "Manual"
      );
      expect(markdown).toContain("- **Trigger:** Manual");
    });

    it("should include plugin count", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop"
      );
      expect(markdown).toContain("## Installed Plugins (2/3 enabled)");
    });

    it("should create markdown table with all plugins", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop"
      );
      expect(markdown).toContain("| Status | Name | ID | Version |");
      expect(markdown).toContain("| ✅ | Plugin A | plugin-a | 1.0.0 |");
      expect(markdown).toContain("| ⭕ | Plugin B | plugin-b | 2.1.0 |");
      expect(markdown).toContain("| ✅ | Plugin C | plugin-c | 1.5.0 |");
    });

    it("should mark enabled plugins with ✅", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop"
      );
      const enabledCount = (markdown.match(/\| ✅ \|/g) || []).length;
      expect(enabledCount).toBe(2);
    });

    it("should mark disabled plugins with ⭕", () => {
      const plugins = manager.getInstalledPlugins();
      const markdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop"
      );
      const disabledCount = (markdown.match(/\| ⭕ \|/g) || []).length;
      expect(disabledCount).toBe(1);
    });

    it("should handle empty plugin list gracefully", () => {
      const markdown = manager.buildMarkdown([], "MyVault", "my-laptop");
      expect(markdown).toContain("## Installed Plugins (0/0 enabled)");
      expect(markdown).toContain("No plugins installed.");
    });

    it("should list trigger options correctly", () => {
      const plugins = manager.getInstalledPlugins();

      const startupMarkdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop",
        "Startup"
      );
      expect(startupMarkdown).toContain("- **Trigger:** Startup");

      const changeMarkdown = manager.buildMarkdown(
        plugins,
        "MyVault",
        "my-laptop",
        "Plugin change"
      );
      expect(changeMarkdown).toContain("- **Trigger:** Plugin change");
    });
  });

  describe("writeNote", () => {
    it("should create inventory note in vault", async () => {
      await manager.writeNote("MyVault", "my-laptop", "Startup");

      const file = mockApp.vault.getFileByPath(
        "System/Plugin-Inventar/MyVault_my-laptop.md"
      );
      expect(file).toBeDefined();
    });

    it("should create inventory folder if not exists", async () => {
      await manager.writeNote("MyVault", "my-laptop", "Startup");

      const folder = mockApp.vault.getAbstractFileByPath(
        "System/Plugin-Inventar"
      );
      expect(folder).toBeDefined();
    });

    it("should use custom inventory folder from settings", async () => {
      manager = new InventoryManager(mockApp as any, {
        inventoryFolder: "Plugins/Inventory",
      });

      await manager.writeNote("MyVault", "my-laptop", "Startup");

      const file = mockApp.vault.getFileByPath(
        "Plugins/Inventory/MyVault_my-laptop.md"
      );
      expect(file).toBeDefined();
    });

    it("should update existing note", async () => {
      await manager.writeNote("MyVault", "my-laptop", "Startup");
      const file1 = mockApp.vault.getFileByPath(
        "System/Plugin-Inventar/MyVault_my-laptop.md"
      );

      await manager.writeNote("MyVault", "my-laptop", "Plugin change");
      const file2 = mockApp.vault.getFileByPath(
        "System/Plugin-Inventar/MyVault_my-laptop.md"
      );

      expect(file1).toBe(file2); // Same file object
      expect(file2?.content).toContain("- **Trigger:** Plugin change");
    });

    it("should include all plugin information in note", async () => {
      await manager.writeNote("MyVault", "my-laptop", "Startup");

      const file = mockApp.vault.getFileByPath(
        "System/Plugin-Inventar/MyVault_my-laptop.md"
      );
      expect(file?.content).toContain("Plugin A");
      expect(file?.content).toContain("plugin-a");
      expect(file?.content).toContain("1.0.0");
    });
  });
});
