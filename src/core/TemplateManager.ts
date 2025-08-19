import { App } from 'obsidian';

export class TemplateManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async createNoteFromTemplate(templateName: string, targetPath: string): Promise<void> {
    // TODO: Implement template-based note creation
    console.log(`Creating note from template: ${templateName} at ${targetPath}`);
  }

  async getAvailableTemplates(): Promise<string[]> {
    // TODO: Scan templates directory
    return ['project_docs', 'knowledge_base', 'meeting_notes'];
  }

  async saveTemplate(name: string, content: string): Promise<void> {
    // TODO: Save template to templates directory
    console.log(`Saving template: ${name}`);
    void content; // avoid unused var lint until implemented
  }
}
