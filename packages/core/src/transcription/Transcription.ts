import { TranscriptionResponse, TranscriptionSegment } from "../providers/Provider.js";

export class Transcription {
  constructor(private readonly response: TranscriptionResponse) {}

  get text(): string {
    return this.response.text;
  }

  get model(): string {
    return this.response.model;
  }

  get segments(): TranscriptionSegment[] {
    return this.response.segments || [];
  }

  get duration(): number | undefined {
    return this.response.duration;
  }

  toString(): string {
    return this.text;
  }
}
