import { App, Notice } from 'obsidian';
import { UltimaOrbPlugin } from '../../UltimaOrbPlugin';

/**
 * 🚀 AI Generation Buttons
 * ปุ่มสำหรับ AI generation tools
 */

export interface GenerationTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  icon: string;
}

export class AIGenerationButtons {
  private plugin: UltimaOrbPlugin;
  private containerEl: HTMLElement;
  private templates: GenerationTemplate[] = [];
  private templatesContainer!: HTMLElement;

  constructor(plugin: UltimaOrbPlugin) {
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
    this.containerEl.addClass('ultima-orb-generation-modal');
    this.initializeTemplates();
  }

  public open(): void {
    this.containerEl.empty();
    this.containerEl.addClass('ultima-orb-generation-modal');

    this.createHeader();
    this.createTemplatesContainer();
    this.createCustomGeneration();
    this.createFooter();

    // Add to document
    document.body.appendChild(this.containerEl);
  }

  public close(): void {
    if (this.containerEl.parentNode) {
      this.containerEl.parentNode.removeChild(this.containerEl);
    }
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'summarize',
        name: 'สรุปเนื้อหา',
        description: 'สรุปเนื้อหาที่เลือกให้กระชับและเข้าใจง่าย',
        prompt: 'กรุณาสรุปเนื้อหาต่อไปนี้ให้กระชับและเข้าใจง่าย:\n\n{content}',
        category: 'content',
        icon: '📝'
      },
      {
        id: 'expand',
        name: 'ขยายเนื้อหา',
        description: 'ขยายเนื้อหาที่เลือกให้ละเอียดมากขึ้น',
        prompt: 'กรุณาขยายเนื้อหาต่อไปนี้ให้ละเอียดและครอบคลุมมากขึ้น:\n\n{content}',
        category: 'content',
        icon: '📈'
      },
      {
        id: 'translate',
        name: 'แปลภาษา',
        description: 'แปลเนื้อหาจากภาษาไทยเป็นภาษาอังกฤษ',
        prompt: 'กรุณาแปลเนื้อหาต่อไปนี้เป็นภาษาอังกฤษ:\n\n{content}',
        category: 'language',
        icon: '🌐'
      },
      {
        id: 'improve',
        name: 'ปรับปรุงภาษา',
        description: 'ปรับปรุงการใช้ภาษาให้ดีขึ้น',
        prompt: 'กรุณาปรับปรุงการใช้ภาษาในเนื้อหาต่อไปนี้ให้ดีขึ้น:\n\n{content}',
        category: 'writing',
        icon: '✨'
      },
      {
        id: 'bullet-points',
        name: 'ทำเป็นหัวข้อ',
        description: 'แปลงเนื้อหาให้เป็นหัวข้อแบบ bullet points',
        prompt: 'กรุณาแปลงเนื้อหาต่อไปนี้ให้เป็นหัวข้อแบบ bullet points:\n\n{content}',
        category: 'formatting',
        icon: '📋'
      },
      {
        id: 'questions',
        name: 'สร้างคำถาม',
        description: 'สร้างคำถามจากเนื้อหาที่เลือก',
        prompt: 'กรุณาสร้างคำถามจากเนื้อหาต่อไปนี้:\n\n{content}',
        category: 'learning',
        icon: '❓'
      },
      {
        id: 'code-explain',
        name: 'อธิบายโค้ด',
        description: 'อธิบายโค้ดที่เลือกให้เข้าใจง่าย',
        prompt: 'กรุณาอธิบายโค้ดต่อไปนี้ให้เข้าใจง่าย:\n\n{content}',
        category: 'coding',
        icon: '💻'
      },
      {
        id: 'brainstorm',
        name: 'ระดมความคิด',
        description: 'ช่วยระดมความคิดเกี่ยวกับหัวข้อที่เลือก',
        prompt: 'กรุณาช่วยระดมความคิดเกี่ยวกับหัวข้อต่อไปนี้:\n\n{content}',
        category: 'creativity',
        icon: '💡'
      }
    ];
  }

  private createHeader(): void {
    const headerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-generation-header' });
    
    const titleEl = headerEl.createEl('h2', { cls: 'ultima-orb-generation-title' });
    titleEl.setText('🚀 AI Generation Tools');

    const subtitleEl = headerEl.createEl('p', { cls: 'ultima-orb-generation-subtitle' });
    subtitleEl.setText('เลือกเครื่องมือ AI หรือสร้างคำสั่งเอง');
  }

  private createTemplatesContainer(): void {
    this.templatesContainer = this.containerEl.createEl('div', { cls: 'ultima-orb-templates-container' });
    
    // Category filter
    const filterContainer = this.templatesContainer.createEl('div', { cls: 'ultima-orb-filter-container' });
    
    const categoryFilter = filterContainer.createEl('select', { cls: 'ultima-orb-category-filter' });
    categoryFilter.createEl('option', { value: 'all', text: 'ทุกหมวดหมู่' });
    
    const categories = [...new Set(this.templates.map(t => t.category))];
    categories.forEach(category => {
      const option = categoryFilter.createEl('option', { value: category });
      option.setText(this.getCategoryDisplayName(category));
    });

    categoryFilter.addEventListener('change', () => {
      this.filterTemplates(categoryFilter.value);
    });

    // Templates grid
    const templatesGrid = this.templatesContainer.createEl('div', { cls: 'ultima-orb-templates-grid' });
    this.renderTemplates(templatesGrid);
  }

  private createCustomGeneration(): void {
    const customContainer = this.containerEl.createEl('div', { cls: 'ultima-orb-custom-generation' });
    
    customContainer.createEl('h3', { text: '🎯 คำสั่งแบบกำหนดเอง' });
    
    const inputContainer = customContainer.createEl('div', { cls: 'ultima-orb-custom-input-container' });
    
    const promptInput = inputContainer.createEl('textarea', { 
      cls: 'ultima-orb-custom-prompt',
      placeholder: 'พิมพ์คำสั่ง AI ของคุณเอง...'
    });
    
    const generateButton = inputContainer.createEl('button', { 
      cls: 'ultima-orb-custom-generate-button',
      text: 'สร้าง'
    });
    
    generateButton.addEventListener('click', () => {
      const prompt = promptInput.value.trim();
      if (prompt) {
        this.generateContent(prompt);
      } else {
        new Notice('❌ กรุณาใส่คำสั่ง');
      }
    });
  }

  private createFooter(): void {
    const footerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-generation-footer' });
    
    const closeButton = footerEl.createEl('button', { 
      cls: 'ultima-orb-close-button',
      text: 'ปิด'
    });
    
    closeButton.addEventListener('click', () => {
      this.close();
    });
  }

  private renderTemplates(container: HTMLElement): void {
    container.empty();
    
    this.templates.forEach(template => {
      const templateEl = container.createEl('div', { 
        cls: 'ultima-orb-template-card',
        attr: { 'data-template-id': template.id }
      });
      
      templateEl.innerHTML = `
        <div class="ultima-orb-template-icon">${template.icon}</div>
        <div class="ultima-orb-template-content">
          <h4>${template.name}</h4>
          <p>${template.description}</p>
          <span class="ultima-orb-template-category">${this.getCategoryDisplayName(template.category)}</span>
        </div>
      `;
      
      templateEl.addEventListener('click', () => {
        this.useTemplate(template);
      });
    });
  }

  private filterTemplates(category: string): void {
    const templatesGrid = this.templatesContainer.querySelector('.ultima-orb-templates-grid');
    if (!templatesGrid) return;

    const filteredTemplates = category === 'all' 
      ? this.templates 
      : this.templates.filter(t => t.category === category);

    templatesGrid.empty();
    
    filteredTemplates.forEach(template => {
      const templateEl = templatesGrid.createEl('div', { 
        cls: 'ultima-orb-template-card',
        attr: { 'data-template-id': template.id }
      });
      
      templateEl.innerHTML = `
        <div class="ultima-orb-template-icon">${template.icon}</div>
        <div class="ultima-orb-template-content">
          <h4>${template.name}</h4>
          <p>${template.description}</p>
          <span class="ultima-orb-template-category">${this.getCategoryDisplayName(template.category)}</span>
        </div>
      `;
      
      templateEl.addEventListener('click', () => {
        this.useTemplate(template);
      });
    });
  }

  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      'content': 'เนื้อหา',
      'language': 'ภาษา',
      'writing': 'การเขียน',
      'formatting': 'การจัดรูปแบบ',
      'learning': 'การเรียนรู้',
      'coding': 'การเขียนโค้ด',
      'creativity': 'ความคิดสร้างสรรค์'
    };
    return displayNames[category] || category;
  }

  private async useTemplate(template: GenerationTemplate): Promise<void> {
    try {
      // Get selected text from active editor
      const activeView = this.plugin.app.workspace.getActiveViewOfType('markdown');
      if (!activeView) {
        new Notice('❌ กรุณาเปิดไฟล์ Markdown ก่อน');
        return;
      }

      const editor = activeView.editor;
      const selectedText = editor.getSelection();
      
      if (!selectedText.trim()) {
        new Notice('❌ กรุณาเลือกข้อความที่ต้องการประมวลผล');
        return;
      }

      // Replace placeholder in template
      const prompt = template.prompt.replace('{content}', selectedText);
      
      // Generate content
      await this.generateContent(prompt, selectedText, template.name);
      
    } catch (error) {
      console.error('Failed to use template:', error);
      new Notice('❌ เกิดข้อผิดพลาดในการใช้เทมเพลต');
    }
  }

  private async generateContent(prompt: string, originalText?: string, templateName?: string): Promise<void> {
    try {
      const defaultProvider = this.plugin.aiOrchestrator.getDefaultProvider();
      
      if (!defaultProvider) {
        new Notice('❌ กรุณาตั้งค่า AI Provider ก่อน');
        return;
      }

      // Show loading
      new Notice(`🔄 กำลังสร้างเนื้อหาด้วย ${templateName || 'AI'}...`);

      // Send request to AI
      const response = await this.plugin.aiOrchestrator.sendRequest({
        provider: defaultProvider,
        prompt: prompt
      });

      if (response.success && response.content) {
        // Insert generated content
        const activeView = this.plugin.app.workspace.getActiveViewOfType('markdown');
        if (activeView) {
          const editor = activeView.editor;
          
          if (originalText) {
            // Replace selected text
            const selection = editor.getSelection();
            if (selection === originalText) {
              editor.replaceSelection(response.content);
            }
          } else {
            // Insert at cursor position
            const cursor = editor.getCursor();
            editor.replaceRange(response.content, cursor);
          }
        }

        new Notice('✅ สร้างเนื้อหาเรียบร้อยแล้ว');
        this.close();
      } else {
        new Notice(`❌ เกิดข้อผิดพลาด: ${response.error || 'ไม่สามารถสร้างเนื้อหาได้'}`);
      }

    } catch (error) {
      console.error('Failed to generate content:', error);
      new Notice('❌ เกิดข้อผิดพลาดในการสร้างเนื้อหา');
    }
  }

  public dispose(): void {
    this.close();
  }
}
