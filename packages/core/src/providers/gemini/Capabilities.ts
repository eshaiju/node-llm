export class Capabilities {
  static contextWindowFor(modelId: string): number | null {
    if (modelId.match(/gemini-2\.5-pro-exp-03-25|gemini-2\.0-flash|gemini-2\.0-flash-lite|gemini-1\.5-flash|gemini-1\.5-flash-8b/)) {
      return 1_048_576;
    }
    if (modelId.match(/gemini-1\.5-pro/)) {
      return 2_097_152;
    }
    if (modelId.match(/gemini-embedding-exp/)) {
      return 8_192;
    }
    if (modelId.match(/text-embedding-004|embedding-001/)) {
      return 2_048;
    }
    if (modelId.match(/aqa/)) {
      return 7_168;
    }
    return 32_768;
  }

  static maxTokensFor(modelId: string): number | null {
    if (modelId.match(/gemini-2\.5-pro-exp-03-25/)) {
      return 64_000;
    }
    if (modelId.match(/gemini-2\.0-flash|gemini-2\.0-flash-lite|gemini-1\.5-flash|gemini-1\.5-flash-8b|gemini-1\.5-pro/)) {
      return 8_192;
    }
    if (modelId.match(/text-embedding-004|embedding-001/)) {
      return 768;
    }
    if (modelId.match(/imagen-3/)) {
      return 4;
    }
    return 4_096;
  }

  static supportsVision(modelId: string): boolean {
    if (modelId.match(/text-embedding|embedding-001|aqa/)) {
      return false;
    }
    return !!modelId.match(/gemini|flash|pro|imagen/);
  }

  static supportsTools(modelId: string): boolean {
    if (modelId.match(/text-embedding|embedding-001|aqa|flash-lite|imagen|gemini-2\.0-flash-lite/)) {
      return false;
    }
    return !!modelId.match(/gemini|pro|flash/);
  }

  static supportsStructuredOutput(modelId: string): boolean {
    if (modelId.match(/text-embedding|embedding-001|aqa|imagen|gemini-2\.0-flash-lite|gemini-2\.5-pro-exp-03-25/)) {
      return false;
    }
    return !!modelId.match(/gemini|pro|flash/);
  }

  static supportsEmbeddings(modelId: string): boolean {
    return !!modelId.match(/text-embedding|embedding|gemini-embedding/);
  }

  static supportsImageGeneration(modelId: string): boolean {
    return !!modelId.match(/imagen/);
  }

  static supportsTranscription(modelId: string): boolean {
    return false; // Gemini doesn't have a direct whisper-like API in this REST spec usually, but supports audio input in chat.
  }

  static supportsModeration(modelId: string): boolean {
    return false; // Typically uses safetySettings within chat rather than a separate endpoint.
  }

  static normalizeTemperature(temperature: number | undefined, _modelId: string): number | undefined | null {
    // Gemini models generally accept 0.0 to 1.0 or 2.0. 
    // We'll pass through the user value for now.
    return temperature;
  }
}
