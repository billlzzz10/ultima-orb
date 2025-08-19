import { App, PluginSettingTab, Setting, ButtonComponent, TextComponent, DropdownComponent } from 'obsidian';
import { ToolManager } from '../../core/ToolManager';
import { Logger } from '../../services/Logger';

export interface ToolTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  config: Record<string, any>;
  enabled: boolean;
  lastUsed?: Date;
  usageCount: number;
}

export class ToolTemplateView {
  private containerEl: HTMLElement;
  private toolManager: ToolManager;
  private logger: Logger;
  private templates: ToolTemplate[] = [];

  // UI Elements
  private templatesContainer: HTMLElement;
  private searchInput: TextComponent;
  private categoryFilter: DropdownComponent;
  private providerFilter: DropdownComponent;

  constructor(containerEl: HTMLElement, toolManager: ToolManager, logger: Logger) {
    this.containerEl = containerEl;
    this.toolManager = toolManager;
    this.logger = logger;
    this.initializeUI();
    this.loadTemplates();
  }

  private initializeUI(): void {
    // Clear container
    this.containerEl.empty();

    // Create header
    const headerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-tools-header' });
    headerEl.createEl('h3', { text: '🛠️ Tool Templates', cls: 'ultima-orb-tools-title' });

    // Search and filters
    const filtersContainer = headerEl.createEl('div', { cls: 'ultima-orb-tools-filters' });
    
    // Search input
    const searchContainer = filtersContainer.createEl('div', { cls: 'ultima-orb-search-container' });
    searchContainer.createEl('label', { text: 'Search:', cls: 'ultima-orb-label' });
    
    this.searchInput = new TextComponent(searchContainer)
      .setPlaceholder('Search tools...')
      .setClass('ultima-orb-search-input')
      .onChange(() => this.filterTemplates());

    // Category filter
    const categoryContainer = filtersContainer.createEl('div', { cls: 'ultima-orb-filter-container' });
    categoryContainer.createEl('label', { text: 'Category:', cls: 'ultima-orb-label' });
    
    this.categoryFilter = new DropdownComponent(categoryContainer)
      .addOption('all', 'All Categories')
      .addOption('notion', 'Notion')
      .addOption('airtable', 'Airtable')
      .addOption('clickup', 'ClickUp')
      .addOption('knowledge', 'Knowledge')
      .addOption('automation', 'Automation')
      .setValue('all')
      .onChange(() => this.filterTemplates());

    // Provider filter
    const providerContainer = filtersContainer.createEl('div', { cls: 'ultima-orb-filter-container' });
    providerContainer.createEl('label', { text: 'Provider:', cls: 'ultima-orb-label' });
    
    this.providerFilter = new DropdownComponent(providerContainer)
      .addOption('all', 'All Providers')
      .addOption('ollama', 'Ollama')
      .addOption('claude', 'Claude')
      .addOption('openai', 'OpenAI')
      .addOption('gemini', 'Gemini')
      .addOption('anythingllm', 'AnythingLLM')
      .setValue('all')
      .onChange(() => this.filterTemplates());

    // Add new template button
    const addButton = new ButtonComponent(headerEl)
      .setButtonText('➕ Add Template')
      .setClass('ultima-orb-button ultima-orb-add-button')
      .onClick(() => this.showAddTemplateModal());

    // Templates container
    this.templatesContainer = this.containerEl.createEl('div', { 
      cls: 'ultima-orb-templates-container' 
    });

    // Add default templates
    this.addDefaultTemplates();
  }

  private addDefaultTemplates(): void {
    const defaultTemplates: ToolTemplate[] = [
      {
        id: 'notion-create-page',
        name: 'Create Notion Page',
        description: 'Create a new page in Notion with specified properties',
        category: 'notion',
        provider: 'notion',
        config: {
          parentId: '',
          properties: {}
        },
        enabled: true,
        usageCount: 0
      },
      {
        id: 'notion-query-database',
        name: 'Query Notion Database',
        description: 'Search and filter records in a Notion database',
        category: 'notion',
        provider: 'notion',
        config: {
          databaseId: '',
          filter: {},
          sorts: []
        },
        enabled: true,
        usageCount: 0
      },
      {
        id: 'airtable-create-record',
        name: 'Create Airtable Record',
        description: 'Add a new record to an Airtable table',
        category: 'airtable',
        provider: 'airtable',
        config: {
          baseId: '',
          tableName: '',
          fields: {}
        },
        enabled: true,
        usageCount: 0
      },
      {
        id: 'clickup-create-task',
        name: 'Create ClickUp Task',
        description: 'Create a new task in ClickUp',
        category: 'clickup',
        provider: 'clickup',
        config: {
          listId: '',
          taskData: {}
        },
        enabled: true,
        usageCount: 0
      },
      {
        id: 'knowledge-search',
        name: 'Knowledge Search',
        description: 'Search through knowledge base documents',
        category: 'knowledge',
        provider: 'anythingllm',
        config: {
          workspaceId: '',
          query: '',
          limit: 10
        },
        enabled: true,
        usageCount: 0
      }
    ];

    this.templates = defaultTemplates;
    this.renderTemplates();
  }

  private filterTemplates(): void {
    const searchTerm = this.searchInput.getValue().toLowerCase();
    const categoryFilter = this.categoryFilter.getValue();
    const providerFilter = this.providerFilter.getValue();

    const filteredTemplates = this.templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm) ||
                           template.description.toLowerCase().includes(searchTerm);
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      const matchesProvider = providerFilter === 'all' || template.provider === providerFilter;

      return matchesSearch && matchesCategory && matchesProvider;
    });

    this.renderTemplates(filteredTemplates);
  }

  private renderTemplates(templates: ToolTemplate[] = this.templates): void {
    this.templatesContainer.empty();

    if (templates.length === 0) {
      this.templatesContainer.createEl('div', {
        cls: 'ultima-orb-no-templates',
        text: 'No tools found matching your criteria.'
      });
      return;
    }

    templates.forEach(template => {
      this.renderTemplateCard(template);
    });
  }

  private renderTemplateCard(template: ToolTemplate): void {
    const cardEl = this.templatesContainer.createEl('div', {
      cls: `ultima-orb-template-card ${template.enabled ? 'enabled' : 'disabled'}`
    });

    // Template header
    const headerEl = cardEl.createEl('div', { cls: 'ultima-orb-template-header' });
    
    const titleEl = headerEl.createEl('div', { cls: 'ultima-orb-template-title' });
    titleEl.createEl('h4', { text: template.name });
    
    const categoryEl = headerEl.createEl('span', { 
      cls: 'ultima-orb-template-category',
      text: template.category
    });

    // Template description
    cardEl.createEl('p', { 
      cls: 'ultima-orb-template-description',
      text: template.description
    });

    // Template metadata
    const metadataEl = cardEl.createEl('div', { cls: 'ultima-orb-template-metadata' });
    
    metadataEl.createEl('span', { 
      cls: 'ultima-orb-template-provider',
      text: `Provider: ${template.provider}`
    });

    metadataEl.createEl('span', { 
      cls: 'ultima-orb-template-usage',
      text: `Used: ${template.usageCount} times`
    });

    if (template.lastUsed) {
      metadataEl.createEl('span', { 
        cls: 'ultima-orb-template-last-used',
        text: `Last: ${template.lastUsed.toLocaleDateString()}`
      });
    }

    // Template actions
    const actionsEl = cardEl.createEl('div', { cls: 'ultima-orb-template-actions' });

    // Enable/Disable toggle
    const toggleButton = new ButtonComponent(actionsEl)
      .setButtonText(template.enabled ? '✅ Enabled' : '❌ Disabled')
      .setClass(`ultima-orb-button ultima-orb-toggle-button ${template.enabled ? 'enabled' : 'disabled'}`)
      .onClick(() => this.toggleTemplate(template));

    // Configure button
    const configButton = new ButtonComponent(actionsEl)
      .setButtonText('⚙️ Configure')
      .setClass('ultima-orb-button ultima-orb-config-button')
      .onClick(() => this.showConfigModal(template));

    // Execute button
    const executeButton = new ButtonComponent(actionsEl)
      .setButtonText('🚀 Execute')
      .setClass('ultima-orb-button ultima-orb-execute-button')
      .onClick(() => this.executeTemplate(template));

    // Delete button
    const deleteButton = new ButtonComponent(actionsEl)
      .setButtonText('🗑️ Delete')
      .setClass('ultima-orb-button ultima-orb-delete-button')
      .onClick(() => this.deleteTemplate(template));
  }

  private toggleTemplate(template: ToolTemplate): void {
    template.enabled = !template.enabled;
    this.logger.info(`Toggled template ${template.name} to ${template.enabled ? 'enabled' : 'disabled'}`);
    this.renderTemplates();
  }

  private showConfigModal(template: ToolTemplate): void {
    // Create modal for configuration
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText(`Configure ${template.name}`);
    
    const contentEl = modal.contentEl;
    contentEl.createEl('p', { text: 'Configure the tool parameters:' });

    // Create configuration form
    const formEl = contentEl.createEl('form', { cls: 'ultima-orb-config-form' });

    Object.entries(template.config).forEach(([key, value]) => {
      const fieldContainer = formEl.createEl('div', { cls: 'ultima-orb-config-field' });
      fieldContainer.createEl('label', { text: key, cls: 'ultima-orb-label' });
      
      if (typeof value === 'string') {
        const input = new TextComponent(fieldContainer)
          .setValue(value)
          .setClass('ultima-orb-config-input')
          .onChange((newValue) => {
            template.config[key] = newValue;
          });
      } else if (typeof value === 'number') {
        const input = new TextComponent(fieldContainer)
          .setValue(value.toString())
          .setClass('ultima-orb-config-input')
          .onChange((newValue) => {
            template.config[key] = parseInt(newValue) || 0;
          });
      } else if (typeof value === 'object') {
        const textarea = new TextComponent(fieldContainer)
          .setValue(JSON.stringify(value, null, 2))
          .setClass('ultima-orb-config-textarea')
          .onChange((newValue) => {
            try {
              template.config[key] = JSON.parse(newValue);
            } catch (e) {
              // Keep old value if JSON is invalid
            }
          });
      }
    });

    // Save button
    const saveButton = new ButtonComponent(formEl)
      .setButtonText('💾 Save Configuration')
      .setClass('ultima-orb-button ultima-orb-save-button')
      .onClick(() => {
        this.logger.info(`Saved configuration for template ${template.name}`);
        modal.close();
        this.renderTemplates();
      });

    modal.open();
  }

  private async executeTemplate(template: ToolTemplate): Promise<void> {
    try {
      this.logger.info(`Executing template: ${template.name}`);
      
      // Update usage statistics
      template.usageCount++;
      template.lastUsed = new Date();

      // Execute the tool through tool manager
      const result = await this.toolManager.executeTool(template.id, template.config);
      
      this.logger.info(`Template ${template.name} executed successfully`);
      
      // Show success notification
      new (window as any).Notice(`✅ ${template.name} executed successfully!`);
      
      this.renderTemplates();
    } catch (error) {
      this.logger.error(`Failed to execute template ${template.name}:`, error);
      new (window as any).Notice(`❌ Failed to execute ${template.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private deleteTemplate(template: ToolTemplate): void {
    const index = this.templates.findIndex(t => t.id === template.id);
    if (index !== -1) {
      this.templates.splice(index, 1);
      this.logger.info(`Deleted template: ${template.name}`);
      this.renderTemplates();
    }
  }

  private showAddTemplateModal(): void {
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText('Add New Tool Template');
    
    const contentEl = modal.contentEl;
    const formEl = contentEl.createEl('form', { cls: 'ultima-orb-add-template-form' });

    // Template name
    const nameContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    nameContainer.createEl('label', { text: 'Template Name:', cls: 'ultima-orb-label' });
    const nameInput = new TextComponent(nameContainer)
      .setPlaceholder('Enter template name')
      .setClass('ultima-orb-form-input');

    // Template description
    const descContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    descContainer.createEl('label', { text: 'Description:', cls: 'ultima-orb-label' });
    const descInput = new TextComponent(descContainer)
      .setPlaceholder('Enter template description')
      .setClass('ultima-orb-form-input');

    // Category
    const categoryContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    categoryContainer.createEl('label', { text: 'Category:', cls: 'ultima-orb-label' });
    const categoryDropdown = new DropdownComponent(categoryContainer)
      .addOption('notion', 'Notion')
      .addOption('airtable', 'Airtable')
      .addOption('clickup', 'ClickUp')
      .addOption('knowledge', 'Knowledge')
      .addOption('automation', 'Automation')
      .setClass('ultima-orb-form-dropdown');

    // Provider
    const providerContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    providerContainer.createEl('label', { text: 'Provider:', cls: 'ultima-orb-label' });
    const providerDropdown = new DropdownComponent(providerContainer)
      .addOption('notion', 'Notion')
      .addOption('airtable', 'Airtable')
      .addOption('clickup', 'ClickUp')
      .addOption('anythingllm', 'AnythingLLM')
      .setClass('ultima-orb-form-dropdown');

    // Add button
    const addButton = new ButtonComponent(formEl)
      .setButtonText('➕ Add Template')
      .setClass('ultima-orb-button ultima-orb-add-button')
      .onClick(() => {
        const newTemplate: ToolTemplate = {
          id: `custom-${Date.now()}`,
          name: nameInput.getValue(),
          description: descInput.getValue(),
          category: categoryDropdown.getValue(),
          provider: providerDropdown.getValue(),
          config: {},
          enabled: true,
          usageCount: 0
        };

        this.templates.push(newTemplate);
        this.logger.info(`Added new template: ${newTemplate.name}`);
        modal.close();
        this.renderTemplates();
      });

    modal.open();
  }

  private loadTemplates(): void {
    // Load templates from storage or use defaults
    this.logger.info('Loading tool templates');
  }

  public getTemplates(): ToolTemplate[] {
    return [...this.templates];
  }

  public getEnabledTemplates(): ToolTemplate[] {
    return this.templates.filter(template => template.enabled);
  }

  public destroy(): void {
    this.containerEl.empty();
  }
}
