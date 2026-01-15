export type ContentPart = 
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "input_audio"; input_audio: { data: string; format: string } }
  | { type: "video_url"; video_url: { url: string } };

export const isBinaryContent = (part: ContentPart): boolean => 
  part.type === "image_url" || part.type === "input_audio" || part.type === "video_url";

export const isTextContent = (part: ContentPart): boolean => 
  part.type === "text";

export const partitionContentParts = (parts: ContentPart[]) => {
  return {
    textParts: parts.filter(isTextContent) as ({ type: "text"; text: string })[],
    binaryParts: parts.filter(isBinaryContent)
  };
};

export const formatMultimodalContent = (content: string | ContentPart[], parts: ContentPart[]): MessageContent => {
  const { textParts, binaryParts } = partitionContentParts(parts);

  let fullText = typeof content === "string" ? content : "";
  let currentParts: ContentPart[] = typeof content === "string" ? [] : content;

  if (textParts.length > 0) {
    const additionalText = textParts.map(f => f.text).join("\n");
    if (typeof content === "string") {
      fullText += "\n" + additionalText;
    } else {
      currentParts.push({ type: "text", text: additionalText });
    }
  }

  if (binaryParts.length > 0) {
    if (typeof content === "string") {
      return [
        { type: "text", text: fullText },
        ...binaryParts
      ];
    } else {
      return [...currentParts, ...binaryParts];
    }
  }

  return typeof content === "string" ? fullText : currentParts;
};

export type MessageContent = string | String | ContentPart[];
