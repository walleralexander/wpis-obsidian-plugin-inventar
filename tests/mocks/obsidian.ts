/**
 * Minimal Obsidian API mocks for testing
 * Only includes what tests actually need, not a full mock
 */

import { vi } from "vitest";

// Export public classes that InventoryManager needs
export class TFolder {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  isRoot(): boolean {
    return this.path === "/";
  }
}

export class TFile {
  path: string;
  content: string;

  constructor(path: string, content: string = "") {
    this.path = path;
    this.content = content;
  }

  get name(): string {
    return this.path.split("/").pop() || "";
  }
}

export class Vault {
  private files: Map<string, TFile> = new Map();
  private folders: Map<string, TFolder> = new Map();

  constructor() {
    // Initialize root folder
    this.folders.set("", new TFolder(""));
  }

  getAbstractFileByPath(path: string): TFile | TFolder | null {
    const normalized = path.replace(/^\/+|\/+$/g, "");
    return this.folders.get(normalized) || this.files.get(normalized) || null;
  }

  getFileByPath(path: string): TFile | null {
    const normalized = path.replace(/^\/+|\/+$/g, "");
    return this.files.get(normalized) || null;
  }

  async createFolder(path: string): Promise<TFolder> {
    const normalized = path.replace(/^\/+|\/+$/g, "");
    if (this.folders.has(normalized)) {
      throw new Error(`Folder already exists: ${normalized}`);
    }
    const folder = new TFolder(normalized);
    this.folders.set(normalized, folder);
    return folder;
  }

  async create(path: string, content: string): Promise<TFile> {
    const normalized = path.replace(/^\/+|\/+$/g, "");
    if (this.files.has(normalized)) {
      throw new Error(`File already exists: ${normalized}`);
    }
    const file = new TFile(normalized, content);
    this.files.set(normalized, file);
    return file;
  }

  async modify(file: TFile, content: string): Promise<void> {
    file.content = content;
  }

  getFiles(): TFile[] {
    return Array.from(this.files.values());
  }

  getFolders(): TFolder[] {
    return Array.from(this.folders.values());
  }
}

export class App {
  vault: Vault;
  plugins: any = {};

  constructor() {
    this.vault = new Vault();
  }
}

export class PluginSettingTab {
  constructor(public app: App, public plugin: any) {}
  display(): void {}
}

export class Plugin {
  app!: App;
  manifest!: any;
}

// Additional stubs for completeness
export const Notice = class Notice {};
export const Modal = class Modal {};
export const Setting = class Setting {
  constructor(public containerEl: any) {}
};

// Test helper: create a mock App with pre-configured plugins
export function createMockApp(options?: {
  plugins?: Array<{ id: string; name: string; version: string; enabled: boolean }>;
}): App {
  const app = new App();

  if (options?.plugins) {
    for (const plugin of options.plugins) {
      app.plugins.manifests = app.plugins.manifests || {};
      app.plugins.manifests[plugin.id] = {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
      };
      
      app.plugins.enabledPlugins = app.plugins.enabledPlugins || new Set();
      if (plugin.enabled) {
        app.plugins.enabledPlugins.add(plugin.id);
      }
    }
  }

  return app;
}
