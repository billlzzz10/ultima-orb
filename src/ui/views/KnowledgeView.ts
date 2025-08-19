import { App, PluginSettingTab, Setting, ButtonComponent, TextComponent, DropdownComponent } from 'obsidian';
import { KnowledgeManager } from '../../core/KnowledgeManager';
import { Logger } from '../../services/Logger';

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  size: number;
  source: string;
}

export interface KnowledgeWorkspace {
  id: string;
  name: string;
  description: string;
  documents: KnowledgeDocument[];
  settings: {
    autoIndex: boolean;
    searchEnabled: boolean;
    maxResults: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeView {
  private containerEl: HTMLElement;
  private knowledgeManager: KnowledgeManager;
  private logger: Logger;
  private workspaces: KnowledgeWorkspace[] = [];
  private currentWorkspace?: KnowledgeWorkspace;

  // UI Elements
  private workspacesContainer: HTMLElement;
  private documentsContainer: HTMLElement;
  private searchInput: TextComponent;
  private workspaceSelect: DropdownComponent;
  private tagFilter: DropdownComponent;

  constructor(containerEl: HTMLElement, knowledgeManager: KnowledgeManager, logger: Logger) {
    this.containerEl = containerEl;
    this.knowledgeManager = knowledgeManager;
    this.logger = logger;
    this.initializeUI();
    this.loadWorkspaces();
  }

  private initializeUI(): void {
    // Clear container
    this.containerEl.empty();

    // Create header
    const headerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-knowledge-header' });
    headerEl.createEl('h3', { text: '🧠 Knowledge Base', cls: 'ultima-orb-knowledge-title' });

    // Controls
    const controlsEl = headerEl.createEl('div', { cls: 'ultima-orb-knowledge-controls' });

    // Workspace selector
    const workspaceContainer = controlsEl.createEl('div', { cls: 'ultima-orb-workspace-selector' });
    workspaceContainer.createEl('label', { text: 'Workspace:', cls: 'ultima-orb-label' });
    
    this.workspaceSelect = new DropdownComponent(workspaceContainer)
      .addOption('', 'Select Workspace')
      .setClass('ultima-orb-workspace-dropdown')
      .onChange((value) => this.selectWorkspace(value));

    // Search input
    const searchContainer = controlsEl.createEl('div', { cls: 'ultima-orb-search-container' });
    searchContainer.createEl('label', { text: 'Search:', cls: 'ultima-orb-label' });
    
    this.searchInput = new TextComponent(searchContainer)
      .setPlaceholder('Search documents...')
      .setClass('ultima-orb-search-input')
      .onChange(() => this.searchDocuments());

    // Tag filter
    const tagContainer = controlsEl.createEl('div', { cls: 'ultima-orb-tag-filter' });
    tagContainer.createEl('label', { text: 'Tags:', cls: 'ultima-orb-label' });
    
    this.tagFilter = new DropdownComponent(tagContainer)
      .addOption('all', 'All Tags')
      .setClass('ultima-orb-tag-dropdown')
      .onChange(() => this.filterDocuments());

    // Action buttons
    const actionsEl = headerEl.createEl('div', { cls: 'ultima-orb-knowledge-actions' });

    const createWorkspaceButton = new ButtonComponent(actionsEl)
      .setButtonText('🏢 New Workspace')
      .setClass('ultima-orb-button ultima-orb-create-workspace-button')
      .onClick(() => this.showCreateWorkspaceModal());

    const uploadButton = new ButtonComponent(actionsEl)
      .setButtonText('📄 Upload Document')
      .setClass('ultima-orb-button ultima-orb-upload-button')
      .onClick(() => this.showUploadModal());

    const importButton = new ButtonComponent(actionsEl)
      .setButtonText('📥 Import')
      .setClass('ultima-orb-button ultima-orb-import-button')
      .onClick(() => this.showImportModal());

    // Main content area
    const contentEl = this.containerEl.createEl('div', { cls: 'ultima-orb-knowledge-content' });

    // Workspaces panel
    const workspacesPanel = contentEl.createEl('div', { cls: 'ultima-orb-workspaces-panel' });
    workspacesPanel.createEl('h4', { text: 'Workspaces', cls: 'ultima-orb-panel-title' });
    this.workspacesContainer = workspacesPanel.createEl('div', { cls: 'ultima-orb-workspaces-list' });

    // Documents panel
    const documentsPanel = contentEl.createEl('div', { cls: 'ultima-orb-documents-panel' });
    documentsPanel.createEl('h4', { text: 'Documents', cls: 'ultima-orb-panel-title' });
    this.documentsContainer = documentsPanel.createEl('div', { cls: 'ultima-orb-documents-list' });

    // Add default workspace
    this.addDefaultWorkspace();
  }

  private addDefaultWorkspace(): void {
    const defaultWorkspace: KnowledgeWorkspace = {
      id: 'default',
      name: 'Default Workspace',
      description: 'Default knowledge workspace for documents and notes',
      documents: [],
      settings: {
        autoIndex: true,
        searchEnabled: true,
        maxResults: 50
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workspaces.push(defaultWorkspace);
    this.updateWorkspaceSelector();
    this.selectWorkspace('default');
  }

  private updateWorkspaceSelector(): void {
    this.workspaceSelect.clearOptions();
    this.workspaceSelect.addOption('', 'Select Workspace');
    
    this.workspaces.forEach(workspace => {
      this.workspaceSelect.addOption(workspace.id, workspace.name);
    });
  }

  private selectWorkspace(workspaceId: string): void {
    this.currentWorkspace = this.workspaces.find(w => w.id === workspaceId);
    this.updateTagFilter();
    this.renderDocuments();
  }

  private updateTagFilter(): void {
    if (!this.currentWorkspace) return;

    this.tagFilter.clearOptions();
    this.tagFilter.addOption('all', 'All Tags');

    const allTags = new Set<string>();
    this.currentWorkspace.documents.forEach(doc => {
      doc.tags.forEach(tag => allTags.add(tag));
    });

    allTags.forEach(tag => {
      this.tagFilter.addOption(tag, tag);
    });
  }

  private searchDocuments(): void {
    const searchTerm = this.searchInput.getValue().toLowerCase();
    this.renderDocuments(searchTerm);
  }

  private filterDocuments(): void {
    const selectedTag = this.tagFilter.getValue();
    this.renderDocuments('', selectedTag);
  }

  private renderDocuments(searchTerm?: string, tagFilter?: string): void {
    if (!this.currentWorkspace) {
      this.documentsContainer.createEl('div', {
        cls: 'ultima-orb-no-workspace',
        text: 'Please select a workspace to view documents.'
      });
      return;
    }

    this.documentsContainer.empty();

    let filteredDocuments = this.currentWorkspace.documents;

    // Apply search filter
    if (searchTerm) {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply tag filter
    if (tagFilter && tagFilter !== 'all') {
      filteredDocuments = filteredDocuments.filter(doc =>
        doc.tags.includes(tagFilter)
      );
    }

    if (filteredDocuments.length === 0) {
      this.documentsContainer.createEl('div', {
        cls: 'ultima-orb-no-documents',
        text: 'No documents found matching your criteria.'
      });
      return;
    }

    filteredDocuments.forEach(doc => {
      this.renderDocumentCard(doc);
    });
  }

  private renderDocumentCard(doc: KnowledgeDocument): void {
    const cardEl = this.documentsContainer.createEl('div', {
      cls: 'ultima-orb-document-card'
    });

    // Document header
    const headerEl = cardEl.createEl('div', { cls: 'ultima-orb-document-header' });
    
    const titleEl = headerEl.createEl('div', { cls: 'ultima-orb-document-title' });
    titleEl.createEl('h5', { text: doc.name });
    
    const typeEl = headerEl.createEl('span', { 
      cls: 'ultima-orb-document-type',
      text: doc.type
    });

    // Document metadata
    const metadataEl = cardEl.createEl('div', { cls: 'ultima-orb-document-metadata' });
    
    metadataEl.createEl('span', { 
      cls: 'ultima-orb-document-size',
      text: `${(doc.size / 1024).toFixed(1)} KB`
    });

    metadataEl.createEl('span', { 
      cls: 'ultima-orb-document-date',
      text: doc.updatedAt.toLocaleDateString()
    });

    metadataEl.createEl('span', { 
      cls: 'ultima-orb-document-source',
      text: doc.source
    });

    // Document tags
    if (doc.tags.length > 0) {
      const tagsEl = cardEl.createEl('div', { cls: 'ultima-orb-document-tags' });
      doc.tags.forEach(tag => {
        tagsEl.createEl('span', { 
          cls: 'ultima-orb-tag',
          text: tag
        });
      });
    }

    // Document preview
    const previewEl = cardEl.createEl('div', { cls: 'ultima-orb-document-preview' });
    const previewText = doc.content.length > 200 
      ? doc.content.substring(0, 200) + '...'
      : doc.content;
    previewEl.createEl('p', { text: previewText });

    // Document actions
    const actionsEl = cardEl.createEl('div', { cls: 'ultima-orb-document-actions' });

    const viewButton = new ButtonComponent(actionsEl)
      .setButtonText('👁️ View')
      .setClass('ultima-orb-button ultima-orb-view-button')
      .onClick(() => this.viewDocument(doc));

    const editButton = new ButtonComponent(actionsEl)
      .setButtonText('✏️ Edit')
      .setClass('ultima-orb-button ultima-orb-edit-button')
      .onClick(() => this.editDocument(doc));

    const deleteButton = new ButtonComponent(actionsEl)
      .setButtonText('🗑️ Delete')
      .setClass('ultima-orb-button ultima-orb-delete-button')
      .onClick(() => this.deleteDocument(doc));
  }

  private renderWorkspaces(): void {
    this.workspacesContainer.empty();

    this.workspaces.forEach(workspace => {
      const workspaceEl = this.workspacesContainer.createEl('div', {
        cls: `ultima-orb-workspace-item ${this.currentWorkspace?.id === workspace.id ? 'active' : ''}`
      });

      const headerEl = workspaceEl.createEl('div', { cls: 'ultima-orb-workspace-header' });
      headerEl.createEl('h5', { text: workspace.name });
      
      const docCount = workspaceEl.createEl('span', { 
        cls: 'ultima-orb-workspace-doc-count',
        text: `${workspace.documents.length} docs`
      });

      workspaceEl.createEl('p', { 
        cls: 'ultima-orb-workspace-description',
        text: workspace.description
      });

      // Workspace actions
      const actionsEl = workspaceEl.createEl('div', { cls: 'ultima-orb-workspace-actions' });

      const selectButton = new ButtonComponent(actionsEl)
        .setButtonText('📂 Open')
        .setClass('ultima-orb-button ultima-orb-select-workspace-button')
        .onClick(() => this.selectWorkspace(workspace.id));

      const settingsButton = new ButtonComponent(actionsEl)
        .setButtonText('⚙️ Settings')
        .setClass('ultima-orb-button ultima-orb-workspace-settings-button')
        .onClick(() => this.showWorkspaceSettings(workspace));

      const deleteButton = new ButtonComponent(actionsEl)
        .setButtonText('🗑️ Delete')
        .setClass('ultima-orb-button ultima-orb-delete-workspace-button')
        .onClick(() => this.deleteWorkspace(workspace));
    });
  }

  private showCreateWorkspaceModal(): void {
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText('Create New Workspace');
    
    const contentEl = modal.contentEl;
    const formEl = contentEl.createEl('form', { cls: 'ultima-orb-create-workspace-form' });

    // Workspace name
    const nameContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    nameContainer.createEl('label', { text: 'Workspace Name:', cls: 'ultima-orb-label' });
    const nameInput = new TextComponent(nameContainer)
      .setPlaceholder('Enter workspace name')
      .setClass('ultima-orb-form-input');

    // Workspace description
    const descContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    descContainer.createEl('label', { text: 'Description:', cls: 'ultima-orb-label' });
    const descInput = new TextComponent(descContainer)
      .setPlaceholder('Enter workspace description')
      .setClass('ultima-orb-form-input');

    // Create button
    const createButton = new ButtonComponent(formEl)
      .setButtonText('🏢 Create Workspace')
      .setClass('ultima-orb-button ultima-orb-create-button')
      .onClick(() => {
        const newWorkspace: KnowledgeWorkspace = {
          id: `workspace-${Date.now()}`,
          name: nameInput.getValue(),
          description: descInput.getValue(),
          documents: [],
          settings: {
            autoIndex: true,
            searchEnabled: true,
            maxResults: 50
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.workspaces.push(newWorkspace);
        this.logger.info(`Created new workspace: ${newWorkspace.name}`);
        modal.close();
        this.updateWorkspaceSelector();
        this.renderWorkspaces();
      });

    modal.open();
  }

  private showUploadModal(): void {
    if (!this.currentWorkspace) {
      new (window as any).Notice('Please select a workspace first.');
      return;
    }

    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText('Upload Document');
    
    const contentEl = modal.contentEl;
    const formEl = contentEl.createEl('form', { cls: 'ultima-orb-upload-form' });

    // File input
    const fileContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    fileContainer.createEl('label', { text: 'Select File:', cls: 'ultima-orb-label' });
    const fileInput = fileContainer.createEl('input', {
      type: 'file',
      cls: 'ultima-orb-file-input'
    });

    // Document name
    const nameContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    nameContainer.createEl('label', { text: 'Document Name:', cls: 'ultima-orb-label' });
    const nameInput = new TextComponent(nameContainer)
      .setPlaceholder('Enter document name')
      .setClass('ultima-orb-form-input');

    // Tags
    const tagsContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    tagsContainer.createEl('label', { text: 'Tags (comma-separated):', cls: 'ultima-orb-label' });
    const tagsInput = new TextComponent(tagsContainer)
      .setPlaceholder('Enter tags separated by commas')
      .setClass('ultima-orb-form-input');

    // Upload button
    const uploadButton = new ButtonComponent(formEl)
      .setButtonText('📄 Upload Document')
      .setClass('ultima-orb-button ultima-orb-upload-button')
      .onClick(() => {
        const file = (fileInput as HTMLInputElement).files?.[0];
        if (!file) {
          new (window as any).Notice('Please select a file.');
          return;
        }

        const tags = tagsInput.getValue().split(',').map(tag => tag.trim()).filter(tag => tag);
        
        this.uploadDocument(file, nameInput.getValue() || file.name, tags);
        modal.close();
      });

    modal.open();
  }

  private async uploadDocument(file: File, name: string, tags: string[]): Promise<void> {
    try {
      const content = await file.text();
      
      const document: KnowledgeDocument = {
        id: `doc-${Date.now()}`,
        name,
        type: file.type || 'text/plain',
        content,
        metadata: {
          originalName: file.name,
          size: file.size,
          lastModified: file.lastModified
        },
        tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: file.size,
        source: 'upload'
      };

      if (this.currentWorkspace) {
        this.currentWorkspace.documents.push(document);
        this.currentWorkspace.updatedAt = new Date();
        this.logger.info(`Uploaded document: ${document.name}`);
        this.renderDocuments();
        this.updateTagFilter();
        new (window as any).Notice(`✅ Uploaded ${document.name} successfully!`);
      }
    } catch (error) {
      this.logger.error('Failed to upload document:', error);
      new (window as any).Notice(`❌ Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private viewDocument(doc: KnowledgeDocument): void {
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText(doc.name);
    
    const contentEl = modal.contentEl;
    contentEl.createEl('div', { 
      cls: 'ultima-orb-document-viewer',
      innerHTML: `<pre>${doc.content}</pre>`
    });

    modal.open();
  }

  private editDocument(doc: KnowledgeDocument): void {
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText(`Edit ${doc.name}`);
    
    const contentEl = modal.contentEl;
    const formEl = contentEl.createEl('form', { cls: 'ultima-orb-edit-document-form' });

    // Document name
    const nameContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    nameContainer.createEl('label', { text: 'Name:', cls: 'ultima-orb-label' });
    const nameInput = new TextComponent(nameContainer)
      .setValue(doc.name)
      .setClass('ultima-orb-form-input');

    // Document content
    const contentContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    contentContainer.createEl('label', { text: 'Content:', cls: 'ultima-orb-label' });
    const contentInput = new TextComponent(contentContainer)
      .setValue(doc.content)
      .setClass('ultima-orb-form-textarea');

    // Tags
    const tagsContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    tagsContainer.createEl('label', { text: 'Tags:', cls: 'ultima-orb-label' });
    const tagsInput = new TextComponent(tagsContainer)
      .setValue(doc.tags.join(', '))
      .setClass('ultima-orb-form-input');

    // Save button
    const saveButton = new ButtonComponent(formEl)
      .setButtonText('💾 Save Changes')
      .setClass('ultima-orb-button ultima-orb-save-button')
      .onClick(() => {
        doc.name = nameInput.getValue();
        doc.content = contentInput.getValue();
        doc.tags = tagsInput.getValue().split(',').map(tag => tag.trim()).filter(tag => tag);
        doc.updatedAt = new Date();
        
        this.logger.info(`Updated document: ${doc.name}`);
        modal.close();
        this.renderDocuments();
        this.updateTagFilter();
        new (window as any).Notice(`✅ Updated ${doc.name} successfully!`);
      });

    modal.open();
  }

  private deleteDocument(doc: KnowledgeDocument): void {
    if (!this.currentWorkspace) return;

    const index = this.currentWorkspace.documents.findIndex(d => d.id === doc.id);
    if (index !== -1) {
      this.currentWorkspace.documents.splice(index, 1);
      this.currentWorkspace.updatedAt = new Date();
      this.logger.info(`Deleted document: ${doc.name}`);
      this.renderDocuments();
      this.updateTagFilter();
      new (window as any).Notice(`🗑️ Deleted ${doc.name}`);
    }
  }

  private showWorkspaceSettings(workspace: KnowledgeWorkspace): void {
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText(`Settings - ${workspace.name}`);
    
    const contentEl = modal.contentEl;
    const formEl = contentEl.createEl('form', { cls: 'ultima-orb-workspace-settings-form' });

    // Auto-index setting
    const autoIndexContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    autoIndexContainer.createEl('label', { text: 'Auto-index documents:', cls: 'ultima-orb-label' });
    const autoIndexInput = new TextComponent(autoIndexContainer)
      .setValue(workspace.settings.autoIndex.toString())
      .setClass('ultima-orb-form-input');

    // Search enabled setting
    const searchEnabledContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    searchEnabledContainer.createEl('label', { text: 'Enable search:', cls: 'ultima-orb-label' });
    const searchEnabledInput = new TextComponent(searchEnabledContainer)
      .setValue(workspace.settings.searchEnabled.toString())
      .setClass('ultima-orb-form-input');

    // Max results setting
    const maxResultsContainer = formEl.createEl('div', { cls: 'ultima-orb-form-field' });
    maxResultsContainer.createEl('label', { text: 'Max search results:', cls: 'ultima-orb-label' });
    const maxResultsInput = new TextComponent(maxResultsContainer)
      .setValue(workspace.settings.maxResults.toString())
      .setClass('ultima-orb-form-input');

    // Save button
    const saveButton = new ButtonComponent(formEl)
      .setButtonText('💾 Save Settings')
      .setClass('ultima-orb-button ultima-orb-save-button')
      .onClick(() => {
        workspace.settings.autoIndex = autoIndexInput.getValue() === 'true';
        workspace.settings.searchEnabled = searchEnabledInput.getValue() === 'true';
        workspace.settings.maxResults = parseInt(maxResultsInput.getValue()) || 50;
        workspace.updatedAt = new Date();
        
        this.logger.info(`Updated workspace settings: ${workspace.name}`);
        modal.close();
        new (window as any).Notice(`✅ Updated workspace settings!`);
      });

    modal.open();
  }

  private deleteWorkspace(workspace: KnowledgeWorkspace): void {
    const index = this.workspaces.findIndex(w => w.id === workspace.id);
    if (index !== -1) {
      this.workspaces.splice(index, 1);
      this.logger.info(`Deleted workspace: ${workspace.name}`);
      
      if (this.currentWorkspace?.id === workspace.id) {
        this.currentWorkspace = undefined;
      }
      
      this.updateWorkspaceSelector();
      this.renderWorkspaces();
      this.renderDocuments();
      new (window as any).Notice(`🗑️ Deleted workspace ${workspace.name}`);
    }
  }

  private showImportModal(): void {
    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText('Import Documents');
    
    const contentEl = modal.contentEl;
    contentEl.createEl('p', { text: 'Import functionality coming soon...' });

    modal.open();
  }

  private loadWorkspaces(): void {
    // Load workspaces from storage or use defaults
    this.logger.info('Loading knowledge workspaces');
    this.renderWorkspaces();
  }

  public getWorkspaces(): KnowledgeWorkspace[] {
    return [...this.workspaces];
  }

  public getCurrentWorkspace(): KnowledgeWorkspace | undefined {
    return this.currentWorkspace;
  }

  public destroy(): void {
    this.containerEl.empty();
  }
}
