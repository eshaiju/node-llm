export interface Base64Data {
  data: string;
  mimeType: string;
}

export class BinaryUtils {
  /**
   * Converts a URL (data: or http:) to a base64 string and mime type.
   */
  static async toBase64(url: string): Promise<Base64Data | null> {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match && match[1] && match[2]) {
        return {
          mimeType: match[1],
          data: match[2],
        };
      }
    } else if (url.startsWith("http")) {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = response.headers.get("content-type") || "image/jpeg";
        return {
          mimeType,
          data: base64,
        };
      } catch (e) {
        console.error("Error converting URL to base64:", e);
        return null;
      }
    }
    return null;
  }
}
