export class TimeTool {
  getTime(): string {
    return new Date().toISOString();
  }

  convertTimezone(date: string, timezone: string): string {
    try {
      return new Date(date).toLocaleString("en-US", { timeZone: timezone });
    } catch (error) {
      return "Invalid timezone or date format.";
    }
  }
}
