import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FileLoader } from "../../../src/utils/FileLoader.js";
import { promises as fs } from "fs";

describe("FileLoader", () => {
  describe("HTTP URLs", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("should load image from HTTP URL", async () => {
      const mockBuffer = Buffer.from("fake image data");
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockBuffer.buffer,
        headers: new Map([["content-type", "image/png"]])
      });

      const result = await FileLoader.load("https://example.com/image.png");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:image/png;base64,");
      }
    });

    it("should load audio from HTTP URL", async () => {
      const mockBuffer = Buffer.from("fake audio data");
      const arrayBuffer = mockBuffer.buffer.slice(
        mockBuffer.byteOffset,
        mockBuffer.byteOffset + mockBuffer.byteLength
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => arrayBuffer,
        headers: new Map([["content-type", "audio/mpeg"]])
      });

      const result = await FileLoader.load("https://example.com/audio.mp3");

      expect(result.type).toBe("input_audio");
      if (result.type === "input_audio") {
        expect(result.input_audio?.format).toBe("mp3");
        expect(result.input_audio?.data).toBe(mockBuffer.toString("base64"));
      }
    });

    it("should convert audio/mpeg to mp3 format", async () => {
      const mockBuffer = Buffer.from("fake audio data");
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockBuffer.buffer,
        headers: new Map([["content-type", "audio/mpeg"]])
      });

      const result = await FileLoader.load("https://example.com/audio.mp3");

      expect(result.type).toBe("input_audio");
      if (result.type === "input_audio") {
        expect(result.input_audio?.format).toBe("mp3");
      }
    });

    it("should load video from HTTP URL", async () => {
      const mockBuffer = Buffer.from("fake video data");
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockBuffer.buffer,
        headers: new Map([["content-type", "video/mp4"]])
      });

      const result = await FileLoader.load("https://example.com/video.mp4");

      expect(result.type).toBe("video_url");
      if (result.type === "video_url") {
        expect(result.video_url?.url).toContain("data:video/mp4;base64,");
      }
    });

    it("should handle content-type with charset", async () => {
      const mockBuffer = Buffer.from("fake image data");
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockBuffer.buffer,
        headers: new Map([["content-type", "image/jpeg; charset=utf-8"]])
      });

      const result = await FileLoader.load("https://example.com/image.jpg");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:image/jpeg;base64,");
      }
    });

    it("should use default mime type when content-type is missing", async () => {
      const mockBuffer = Buffer.from("fake data");
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockBuffer.buffer,
        headers: new Map()
      });

      const result = await FileLoader.load("https://example.com/unknown");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:image/jpeg;base64,");
      }
    });

    it("should fallback to URL when fetch fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Not Found"
      });

      const result = await FileLoader.load("https://example.com/missing.png");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toBe("https://example.com/missing.png");
      }
    });

    it("should fallback to URL when fetch throws error", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await FileLoader.load("https://example.com/image.png");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toBe("https://example.com/image.png");
      }
    });
  });

  describe("Data URLs", () => {
    it("should handle data: URLs directly", async () => {
      const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const result = await FileLoader.load(dataUrl);

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toBe(dataUrl);
      }
    });
  });

  describe("Local text files", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should load JSON file as text", async () => {
      const content = '{"key": "value"}';
      vi.spyOn(fs, "readFile").mockResolvedValue(content as unknown as string & Buffer);

      const result = await FileLoader.load("/path/to/file.json");

      expect(result.type).toBe("text");
      if (result.type === "text") {
        expect(result.text).toContain("file.json");
        expect(result.text).toContain(content);
      }
    });

    it("should load JavaScript files as text", async () => {
      const content = 'console.log("hello");';
      vi.spyOn(fs, "readFile").mockResolvedValue(content as unknown as string & Buffer);

      const jsResult = await FileLoader.load("/path/to/file.js");
      expect(jsResult.type).toBe("text");

      const mjsResult = await FileLoader.load("/path/to/file.mjs");
      expect(mjsResult.type).toBe("text");

      const cjsResult = await FileLoader.load("/path/to/file.cjs");
      expect(cjsResult.type).toBe("text");
    });

    it("should load TypeScript files as text", async () => {
      const content = "const x: number = 42;";
      vi.spyOn(fs, "readFile").mockResolvedValue(content as unknown as string & Buffer);

      const result = await FileLoader.load("/path/to/file.ts");

      expect(result.type).toBe("text");
      if (result.type === "text") {
        expect(result.text).toContain(content);
      }
    });

    it("should load various programming language files", async () => {
      const content = 'print("hello")';
      vi.spyOn(fs, "readFile").mockResolvedValue(content as unknown as string & Buffer);

      const extensions = [".py", ".rb", ".go", ".java", ".c", ".cpp", ".rs", ".swift", ".kt"];

      for (const ext of extensions) {
        const result = await FileLoader.load(`/path/to/file${ext}`);
        expect(result.type).toBe("text");
      }
    });

    it("should load markup and config files as text", async () => {
      const content = "<html></html>";
      vi.spyOn(fs, "readFile").mockResolvedValue(content as unknown as string & Buffer);

      const extensions = [".html", ".css", ".xml", ".yml", ".yaml", ".csv", ".md", ".txt"];

      for (const ext of extensions) {
        const result = await FileLoader.load(`/path/to/file${ext}`);
        expect(result.type).toBe("text");
      }
    });

    it("should include filename in text content", async () => {
      const content = "test content";
      vi.spyOn(fs, "readFile").mockResolvedValue(content as unknown as string & Buffer);

      const result = await FileLoader.load("/path/to/myfile.txt");

      if (result.type === "text") {
        expect(result.text).toContain("myfile.txt");
        expect(result.text).toContain("--- File:");
        expect(result.text).toContain("--- End of File ---");
      }
    });
  });

  describe("Local binary files", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should load image files as base64", async () => {
      const mockBuffer = Buffer.from("fake image data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const pngResult = await FileLoader.load("/path/to/image.png");
      expect(pngResult.type).toBe("image_url");
      if (pngResult.type === "image_url") {
        expect(pngResult.image_url?.url).toContain("data:image/png;base64,");
      }

      const jpgResult = await FileLoader.load("/path/to/image.jpg");
      expect(jpgResult.type).toBe("image_url");
      if (jpgResult.type === "image_url") {
        expect(jpgResult.image_url?.url).toContain("data:image/jpeg;base64,");
      }

      const jpegResult = await FileLoader.load("/path/to/image.jpeg");
      expect(jpegResult.type).toBe("image_url");
      if (jpegResult.type === "image_url") {
        expect(jpegResult.image_url?.url).toContain("data:image/jpeg;base64,");
      }

      const gifResult = await FileLoader.load("/path/to/image.gif");
      expect(gifResult.type).toBe("image_url");
      if (gifResult.type === "image_url") {
        expect(gifResult.image_url?.url).toContain("data:image/gif;base64,");
      }

      const webpResult = await FileLoader.load("/path/to/image.webp");
      expect(webpResult.type).toBe("image_url");
      if (webpResult.type === "image_url") {
        expect(webpResult.image_url?.url).toContain("data:image/webp;base64,");
      }
    });

    it("should load audio files with correct format", async () => {
      const mockBuffer = Buffer.from("fake audio data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const mp3Result = await FileLoader.load("/path/to/audio.mp3");
      expect(mp3Result.type).toBe("input_audio");
      if (mp3Result.type === "input_audio") {
        expect(mp3Result.input_audio?.format).toBe("mp3");
        expect(mp3Result.input_audio?.data).toBe(mockBuffer.toString("base64"));
      }

      const wavResult = await FileLoader.load("/path/to/audio.wav");
      expect(wavResult.type).toBe("input_audio");
      if (wavResult.type === "input_audio") {
        expect(wavResult.input_audio?.format).toBe("wav");
      }
    });

    it("should load video files as data URI", async () => {
      const mockBuffer = Buffer.from("fake video data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const mp4Result = await FileLoader.load("/path/to/video.mp4");
      expect(mp4Result.type).toBe("video_url");
      if (mp4Result.type === "video_url") {
        expect(mp4Result.video_url?.url).toContain("data:video/mp4;base64,");
      }

      const mpegResult = await FileLoader.load("/path/to/video.mpeg");
      expect(mpegResult.type).toBe("video_url");
      if (mpegResult.type === "video_url") {
        expect(mpegResult.video_url?.url).toContain("data:video/mpeg;base64,");
      }

      const movResult = await FileLoader.load("/path/to/video.mov");
      expect(movResult.type).toBe("video_url");
      if (movResult.type === "video_url") {
        expect(movResult.video_url?.url).toContain("data:video/quicktime;base64,");
      }
    });

    it("should handle PDF files", async () => {
      const mockBuffer = Buffer.from("fake pdf data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const result = await FileLoader.load("/path/to/document.pdf");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:application/pdf;base64,");
      }
    });

    it("should handle unknown binary extensions", async () => {
      const mockBuffer = Buffer.from("fake data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const result = await FileLoader.load("/path/to/file.xyz");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:application/octet-stream;base64,");
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle uppercase extensions", async () => {
      const mockBuffer = Buffer.from("fake data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const result = await FileLoader.load("/path/to/IMAGE.PNG");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:image/png;base64,");
      }
    });

    it("should handle files without extensions", async () => {
      const mockBuffer = Buffer.from("fake data");
      vi.spyOn(fs, "readFile").mockResolvedValue(mockBuffer);

      const result = await FileLoader.load("/path/to/file");

      expect(result.type).toBe("image_url");
      if (result.type === "image_url") {
        expect(result.image_url?.url).toContain("data:application/octet-stream;base64,");
      }
    });
  });
});
