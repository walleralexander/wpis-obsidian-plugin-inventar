import { describe, it, expect } from "vitest";
import { sanitizeFilename, getDeviceName } from "@/DeviceInfo";

describe("DeviceInfo", () => {
  describe("sanitizeFilename", () => {
    it("should sanitize backslashes", () => {
      expect(sanitizeFilename("My PC\\Server")).toBe("My PC-Server");
    });

    it("should sanitize forward slashes", () => {
      expect(sanitizeFilename("My/PC/Name")).toBe("My-PC-Name");
    });

    it("should sanitize colons", () => {
      expect(sanitizeFilename("PC:Name")).toBe("PC-Name");
    });

    it("should sanitize asterisks", () => {
      expect(sanitizeFilename("PC*Name")).toBe("PC-Name");
    });

    it("should sanitize question marks", () => {
      expect(sanitizeFilename("PC?Name")).toBe("PC-Name");
    });

    it("should sanitize quotes", () => {
      expect(sanitizeFilename('PC"Name')).toBe("PC-Name");
    });

    it("should sanitize angle brackets", () => {
      expect(sanitizeFilename("PC<Name>")).toBe("PC-Name-");
    });

    it("should sanitize pipes", () => {
      expect(sanitizeFilename("PC|Name")).toBe("PC-Name");
    });

    it("should trim leading and trailing whitespace", () => {
      expect(sanitizeFilename("  My PC  ")).toBe("My PC");
    });

    it("should collapse multiple hyphens", () => {
      expect(sanitizeFilename("My--PC--Name")).toBe("My-PC-Name");
    });

    it("should return 'Unknown' for empty string", () => {
      expect(sanitizeFilename("")).toBe("Unknown");
    });

    it("should return 'Unknown' for whitespace only", () => {
      expect(sanitizeFilename("   ")).toBe("Unknown");
    });

    it("should handle complex mixed case", () => {
      expect(sanitizeFilename("My\\PC:Server/Name*?")).toBe("My-PC-Server-Name-");
    });

    it("should preserve normal alphanumeric characters", () => {
      expect(sanitizeFilename("MyPC123")).toBe("MyPC123");
    });

    it("should preserve hyphens", () => {
      expect(sanitizeFilename("my-laptop-01")).toBe("my-laptop-01");
    });

    it("should preserve underscores", () => {
      expect(sanitizeFilename("my_server_name")).toBe("my_server_name");
    });

    it("should preserve dots", () => {
      expect(sanitizeFilename("server.local")).toBe("server.local");
    });
  });

  describe("getDeviceName", () => {
    it("should return a non-empty string", () => {
      const name = getDeviceName();
      expect(name).toBeDefined();
      expect(name.length).toBeGreaterThan(0);
    });

    it("should return a string without invalid filename characters", () => {
      const name = getDeviceName();
      const invalidChars = /[\\/:"*?<>|]/;
      expect(invalidChars.test(name)).toBe(false);
    });

    it("should not have leading or trailing hyphens", () => {
      const name = getDeviceName();
      expect(name.startsWith("-")).toBe(false);
      expect(name.endsWith("-")).toBe(false);
    });
  });
});
