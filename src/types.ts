/**
 * Shared types for Plugin Inventar
 */

export interface PluginEntry {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
}

export interface PluginInventarSettings {
  inventoryFolder: string;
}

export const DEFAULT_SETTINGS: PluginInventarSettings = {
  inventoryFolder: "System/Plugin-Inventar",
};
