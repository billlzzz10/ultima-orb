import { App, PluginSettingTab, Setting, ButtonComponent, TextComponent, DropdownComponent } from 'obsidian';
import { Logger } from '../../services/Logger';

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  url?: string;
  metadata: Record<string, any>;
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'error';
  errorMessage?: string;
}

export interface AttachmentConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
  autoUpload: boolean;
  storageLocation: 'local' | 'cloud';
}

export class FileAttachmentView {
  private containerEl: HTMLElement;
  private logger: Logger;
  private attachments: FileAttachment[] = [];
  private config: AttachmentConfig;
  private onAttachmentChange?: (attachments: FileAttachment[]) => void;

  // UI Elements
  private attachmentsContainer: HTMLElement;
  private dropZone: HTMLElement;
  private fileInput: HTMLInputElement;

  constructor(
    containerEl: HTMLElement, 
    logger: Logger, 
    config?: Partial<AttachmentConfig>,
    onAttachmentChange?: (attachments: FileAttachment[]) => void
  ) {
    this.containerEl = containerEl;
    this.logger = logger;
    this.onAttachmentChange = onAttachmentChange;
    
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['text/*', 'image/*', 'application/pdf', 'application/json'],
      maxFiles: 5,
      autoUpload: true,
      storageLocation: 'local',
      ...config
    };

    this.initializeUI();
    this.setupEventListeners();
  }

  private initializeUI(): void {
    // Clear container
    this.containerEl.empty();

    // Create header
    const headerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-attachment-header' });
    headerEl.createEl('h4', { text: '📎 Attachments', cls: 'ultima-orb-attachment-title' });

    // File count indicator
    const countEl = headerEl.createEl('span', { 
      cls: 'ultima-orb-attachment-count',
      text: `${this.attachments.length}/${this.config.maxFiles}`
    });

    // Drop zone
    this.dropZone = this.containerEl.createEl('div', { 
      cls: 'ultima-orb-attachment-dropzone'
    });
    
    const dropZoneContent = this.dropZone.createEl('div', { cls: 'ultima-orb-dropzone-content' });
    dropZoneContent.createEl('div', { 
      cls: 'ultima-orb-dropzone-icon',
      text: '📁'
    });
    dropZoneContent.createEl('p', { 
      text: 'Drag and drop files here or click to browse',
      cls: 'ultima-orb-dropzone-text'
    });
    dropZoneContent.createEl('p', { 
      text: `Max ${this.config.maxFiles} files, ${(this.config.maxFileSize / 1024 / 1024).toFixed(1)}MB each`,
      cls: 'ultima-orb-dropzone-info'
    });

    // Hidden file input
    this.fileInput = this.containerEl.createEl('input', {
      type: 'file',
      multiple: true,
      cls: 'ultima-orb-file-input-hidden'
    }) as HTMLInputElement;

    // Attachments list
    this.attachmentsContainer = this.containerEl.createEl('div', { 
      cls: 'ultima-orb-attachments-list'
    });

    // Update UI based on current state
    this.updateUI();
  }

  private setupEventListeners(): void {
    // File input change
    this.fileInput.addEventListener('change', (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        this.handleFiles(Array.from(files));
      }
    });

    // Drop zone events
    this.dropZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      this.dropZone.addClass('ultima-orb-dropzone-dragover');
    });

    this.dropZone.addEventListener('dragleave', (event) => {
      event.preventDefault();
      this.dropZone.removeClass('ultima-orb-dropzone-dragover');
    });

    this.dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      this.dropZone.removeClass('ultima-orb-dropzone-dragover');
      
      const files = Array.from(event.dataTransfer?.files || []);
      this.handleFiles(files);
    });
  }

  private async handleFiles(files: File[]): Promise<void> {
    // Check file count limit
    if (this.attachments.length + files.length > this.config.maxFiles) {
      new (window as any).Notice(`❌ Maximum ${this.config.maxFiles} files allowed`);
      return;
    }

    for (const file of files) {
      await this.processFile(file);
    }
  }

  private async processFile(file: File): Promise<void> {
    // Validate file size
    if (file.size > this.config.maxFileSize) {
      new (window as any).Notice(`❌ File ${file.name} is too large (max ${(this.config.maxFileSize / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }

    // Validate file type
    if (!this.isFileTypeAllowed(file.type)) {
      new (window as any).Notice(`❌ File type ${file.type} not allowed`);
      return;
    }

    // Create attachment object
    const attachment: FileAttachment = {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      metadata: {
        originalFile: file,
        lastModified: file.lastModified
      },
      uploadedAt: new Date(),
      status: 'uploading'
    };

    // Add to attachments list
    this.attachments.push(attachment);
    this.updateUI();

    // Process file content
    try {
      if (this.config.autoUpload) {
        await this.uploadFile(attachment, file);
      } else {
        // Store file content for later upload
        attachment.content = await this.readFileContent(file);
        attachment.status = 'uploaded';
      }
    } catch (error) {
      attachment.status = 'error';
      attachment.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process file ${file.name}:`, error);
    }

    this.updateUI();
    this.notifyAttachmentChange();
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type.startsWith('text/') || file.type === 'application/json') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  private async uploadFile(attachment: FileAttachment, file: File): Promise<void> {
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      attachment.content = await this.readFileContent(file);
      attachment.status = 'uploaded';
      
      this.logger.info(`Uploaded file: ${attachment.name}`);
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isFileTypeAllowed(fileType: string): boolean {
    return this.config.allowedTypes.some(allowedType => {
      if (allowedType.endsWith('/*')) {
        return fileType.startsWith(allowedType.slice(0, -1));
      }
      return fileType === allowedType;
    });
  }

  private updateUI(): void {
    // Update drop zone visibility
    if (this.attachments.length >= this.config.maxFiles) {
      this.dropZone.addClass('ultima-orb-dropzone-disabled');
    } else {
      this.dropZone.removeClass('ultima-orb-dropzone-disabled');
    }

    // Update file count
    const countEl = this.containerEl.querySelector('.ultima-orb-attachment-count');
    if (countEl) {
      countEl.setText(`${this.attachments.length}/${this.config.maxFiles}`);
    }

    // Render attachments
    this.renderAttachments();
  }

  private renderAttachments(): void {
    this.attachmentsContainer.empty();

    if (this.attachments.length === 0) {
      return;
    }

    this.attachments.forEach(attachment => {
      this.renderAttachmentCard(attachment);
    });
  }

  private renderAttachmentCard(attachment: FileAttachment): void {
    const cardEl = this.attachmentsContainer.createEl('div', {
      cls: `ultima-orb-attachment-card ultima-orb-attachment-${attachment.status}`
    });

    // File icon and info
    const infoEl = cardEl.createEl('div', { cls: 'ultima-orb-attachment-info' });
    
    const iconEl = infoEl.createEl('div', { cls: 'ultima-orb-attachment-icon' });
    iconEl.setText(this.getFileIcon(attachment.type));

    const detailsEl = infoEl.createEl('div', { cls: 'ultima-orb-attachment-details' });
    detailsEl.createEl('div', { 
      cls: 'ultima-orb-attachment-name',
      text: attachment.name
    });
    
    detailsEl.createEl('div', { 
      cls: 'ultima-orb-attachment-meta',
      text: `${(attachment.size / 1024).toFixed(1)} KB • ${attachment.uploadedAt.toLocaleTimeString()}`
    });

    // Status indicator
    const statusEl = cardEl.createEl('div', { cls: 'ultima-orb-attachment-status' });
    
    switch (attachment.status) {
      case 'uploading':
        statusEl.createEl('div', { 
          cls: 'ultima-orb-status-uploading',
          text: '⏳ Uploading...'
        });
        break;
      case 'uploaded':
        statusEl.createEl('div', { 
          cls: 'ultima-orb-status-uploaded',
          text: '✅ Uploaded'
        });
        break;
      case 'error':
        statusEl.createEl('div', { 
          cls: 'ultima-orb-status-error',
          text: '❌ Error'
        });
        if (attachment.errorMessage) {
          statusEl.createEl('div', { 
            cls: 'ultima-orb-error-message',
            text: attachment.errorMessage
          });
        }
        break;
    }

    // Actions
    const actionsEl = cardEl.createEl('div', { cls: 'ultima-orb-attachment-actions' });

    if (attachment.status === 'uploaded') {
      const viewButton = new ButtonComponent(actionsEl)
        .setButtonText('👁️ View')
        .setClass('ultima-orb-button ultima-orb-view-button')
        .onClick(() => this.viewAttachment(attachment));

      const downloadButton = new ButtonComponent(actionsEl)
        .setButtonText('📥 Download')
        .setClass('ultima-orb-button ultima-orb-download-button')
        .onClick(() => this.downloadAttachment(attachment));
    }

    if (attachment.status === 'error') {
      const retryButton = new ButtonComponent(actionsEl)
        .setButtonText('🔄 Retry')
        .setClass('ultima-orb-button ultima-orb-retry-button')
        .onClick(() => this.retryUpload(attachment));
    }

    const deleteButton = new ButtonComponent(actionsEl)
      .setButtonText('🗑️ Remove')
      .setClass('ultima-orb-button ultima-orb-delete-button')
      .onClick(() => this.removeAttachment(attachment));
  }

  private getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('text/')) return '📄';
    if (fileType === 'application/pdf') return '📕';
    if (fileType === 'application/json') return '📋';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    return '📎';
  }

  private viewAttachment(attachment: FileAttachment): void {
    if (!attachment.content) {
      new (window as any).Notice('❌ No content available to view');
      return;
    }

    const modal = new (window as any).Modal(this.containerEl);
    modal.titleEl.setText(`View: ${attachment.name}`);
    
    const contentEl = modal.contentEl;
    
    if (attachment.type.startsWith('image/')) {
      const imgEl = contentEl.createEl('img', {
        src: attachment.content,
        cls: 'ultima-orb-attachment-viewer-image'
      });
    } else if (attachment.type.startsWith('text/') || attachment.type === 'application/json') {
      const preEl = contentEl.createEl('pre', {
        cls: 'ultima-orb-attachment-viewer-text',
        text: attachment.content
      });
    } else {
      contentEl.createEl('p', { 
        text: 'Preview not available for this file type',
        cls: 'ultima-orb-attachment-viewer-unsupported'
      });
    }

    modal.open();
  }

  private downloadAttachment(attachment: FileAttachment): void {
    if (!attachment.content) {
      new (window as any).Notice('❌ No content available to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = attachment.content;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      new (window as any).Notice(`✅ Downloaded ${attachment.name}`);
    } catch (error) {
      this.logger.error('Failed to download attachment:', error);
      new (window as any).Notice('❌ Failed to download file');
    }
  }

  private async retryUpload(attachment: FileAttachment): Promise<void> {
    const originalFile = attachment.metadata.originalFile as File;
    if (!originalFile) {
      new (window as any).Notice('❌ Original file not found');
      return;
    }

    attachment.status = 'uploading';
    this.updateUI();

    try {
      await this.uploadFile(attachment, originalFile);
      new (window as any).Notice(`✅ Successfully uploaded ${attachment.name}`);
    } catch (error) {
      attachment.status = 'error';
      attachment.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      new (window as any).Notice(`❌ Failed to upload ${attachment.name}`);
    }

    this.updateUI();
    this.notifyAttachmentChange();
  }

  private removeAttachment(attachment: FileAttachment): void {
    const index = this.attachments.findIndex(a => a.id === attachment.id);
    if (index !== -1) {
      this.attachments.splice(index, 1);
      this.logger.info(`Removed attachment: ${attachment.name}`);
      this.updateUI();
      this.notifyAttachmentChange();
      new (window as any).Notice(`🗑️ Removed ${attachment.name}`);
    }
  }

  private notifyAttachmentChange(): void {
    if (this.onAttachmentChange) {
      this.onAttachmentChange([...this.attachments]);
    }
  }

  // Public methods
  public getAttachments(): FileAttachment[] {
    return [...this.attachments];
  }

  public getUploadedAttachments(): FileAttachment[] {
    return this.attachments.filter(a => a.status === 'uploaded');
  }

  public clearAttachments(): void {
    this.attachments = [];
    this.updateUI();
    this.notifyAttachmentChange();
  }

  public updateConfig(newConfig: Partial<AttachmentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.updateUI();
  }

  public destroy(): void {
    this.containerEl.empty();
  }
}
