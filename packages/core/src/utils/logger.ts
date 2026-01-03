/**
 * Centralized logger for node-llm
 */
class Logger {
  private isDebugEnabled(): boolean {
    return process.env.NODELLM_DEBUG === "true";
  }

  debug(message: string, data?: any): void {
    if (this.isDebugEnabled()) {
      const formattedData = data ? `\n${JSON.stringify(data, null, 2)}` : '';
      console.log(`[NodeLLM Debug] ${message}${formattedData}`);
    }
  }

  warn(message: string): void {
    console.warn(`[NodeLLM] ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[NodeLLM Error] ${message}`, error || '');
  }

  info(message: string): void {
    console.log(`[NodeLLM] ${message}`);
  }
}

export const logger = new Logger();
