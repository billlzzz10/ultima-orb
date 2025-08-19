import { App, Modal, Setting, ButtonComponent, Notice, TextComponent, DropdownComponent } from 'obsidian';
import { UltimaOrbPlugin } from '../main';
import { AIOrchestrator } from '../ai/AIOrchestrator';
import { CredentialManager } from '../services/CredentialManager';

/**
 * 🚀 Ultima-Orb: Onboarding Flow
 * การแนะนำผู้ใช้ใหม่สำหรับ Ultima-Orb plugin
 * แสดงเมื่อผู้ใช้เปิดใช้งาน plugin ครั้งแรก
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: 'welcome' | 'ai-setup' | 'integrations' | 'features' | 'completion';
  required: boolean;
  completed: boolean;
}

export class OnboardingFlow {
  private plugin: UltimaOrbPlugin;
  private app: App;
  private steps: OnboardingStep[];
  private currentStepIndex: number = 0;
  private modal: OnboardingModal | null = null;

  constructor(plugin: UltimaOrbPlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.steps = this.initializeSteps();
  }

  private initializeSteps(): OnboardingStep[] {
    return [
      {
        id: 'welcome',
        title: 'ยินดีต้อนรับสู่ Ultima-Orb! 🎉',
        description: 'AI-powered plugin สำหรับ Obsidian ที่จะเปลี่ยนวิธีการทำงานของคุณ',
        component: 'welcome',
        required: true,
        completed: false
      },
      {
        id: 'ai-setup',
        title: 'ตั้งค่า AI Providers 🤖',
        description: 'เลือกและตั้งค่า AI providers ที่คุณต้องการใช้งาน',
        component: 'ai-setup',
        required: true,
        completed: false
      },
      {
        id: 'integrations',
        title: 'เชื่อมต่อ External Services 🔗',
        description: 'ตั้งค่าการเชื่อมต่อกับ Notion, Airtable, และ ClickUp',
        component: 'integrations',
        required: false,
        completed: false
      },
      {
        id: 'features',
        title: 'แนะนำคุณสมบัติหลัก ⭐',
        description: 'เรียนรู้คุณสมบัติหลักของ Ultima-Orb',
        component: 'features',
        required: false,
        completed: false
      },
      {
        id: 'completion',
        title: 'เสร็จสิ้นการตั้งค่า! 🎊',
        description: 'คุณพร้อมใช้งาน Ultima-Orb แล้ว',
        component: 'completion',
        required: true,
        completed: false
      }
    ];
  }

  public async start(): Promise<void> {
    // ตรวจสอบว่าเคยผ่าน onboarding แล้วหรือไม่
    const hasCompletedOnboarding = await this.plugin.settings.get('hasCompletedOnboarding');
    
    if (hasCompletedOnboarding) {
      // ถ้าเคยผ่านแล้ว ให้แสดง quick start guide แทน
      await this.showQuickStartGuide();
      return;
    }

    // เริ่ม onboarding flow
    this.modal = new OnboardingModal(this.app, this);
    this.modal.open();
  }

  public async showQuickStartGuide(): Promise<void> {
    const quickStartModal = new QuickStartModal(this.app, this.plugin);
    quickStartModal.open();
  }

  public getCurrentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex];
  }

  public getProgress(): number {
    const completedSteps = this.steps.filter(step => step.completed).length;
    return (completedSteps / this.steps.length) * 100;
  }

  public async nextStep(): Promise<void> {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.steps[this.currentStepIndex].completed = true;
      this.currentStepIndex++;
      this.updateModal();
    } else {
      await this.completeOnboarding();
    }
  }

  public async previousStep(): Promise<void> {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateModal();
    }
  }

  public async skipStep(): Promise<void> {
    this.steps[this.currentStepIndex].completed = true;
    await this.nextStep();
  }

  private updateModal(): void {
    if (this.modal) {
      this.modal.updateContent();
    }
  }

  private async completeOnboarding(): Promise<void> {
    // บันทึกสถานะการเสร็จสิ้น onboarding
    await this.plugin.settings.set('hasCompletedOnboarding', true);
    await this.plugin.settings.set('onboardingCompletedAt', new Date().toISOString());
    
    // ปิด modal
    if (this.modal) {
      this.modal.close();
    }

    // แสดงข้อความสำเร็จ
    new Notice('🎉 ยินดีต้อนรับสู่ Ultima-Orb! คุณพร้อมใช้งานแล้ว');
    
    // เปิด quick start guide
    await this.showQuickStartGuide();
  }
}

/**
 * Onboarding Modal - Modal หลักสำหรับ onboarding flow
 */
class OnboardingModal extends Modal {
  private onboardingFlow: OnboardingFlow;
  private contentEl: HTMLElement;
  private progressEl: HTMLElement;
  private navigationEl: HTMLElement;

  constructor(app: App, onboardingFlow: OnboardingFlow) {
    super(app);
    this.onboardingFlow = onboardingFlow;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('ultima-orb-onboarding-modal');

    // สร้าง header
    this.createHeader();

    // สร้าง progress bar
    this.createProgressBar();

    // สร้าง content area
    this.createContentArea();

    // สร้าง navigation
    this.createNavigation();

    // แสดงเนื้อหาขั้นตอนแรก
    this.updateContent();
  }

  private createHeader(): void {
    const headerEl = this.contentEl.createEl('div', { cls: 'ultima-orb-onboarding-header' });
    
    const titleEl = headerEl.createEl('h2', { cls: 'ultima-orb-onboarding-title' });
    titleEl.setText('Ultima-Orb Setup Wizard');
    
    const subtitleEl = headerEl.createEl('p', { cls: 'ultima-orb-onboarding-subtitle' });
    subtitleEl.setText('ติดตั้งและตั้งค่า Ultima-Orb ในไม่กี่ขั้นตอน');
  }

  private createProgressBar(): void {
    this.progressEl = this.contentEl.createEl('div', { cls: 'ultima-orb-onboarding-progress' });
    
    const progressBarEl = this.progressEl.createEl('div', { cls: 'ultima-orb-progress-bar' });
    const progressFillEl = progressBarEl.createEl('div', { cls: 'ultima-orb-progress-fill' });
    
    const progressTextEl = this.progressEl.createEl('div', { cls: 'ultima-orb-progress-text' });
    progressTextEl.setText('Step 1 of 5');
  }

  private createContentArea(): void {
    this.contentEl = this.contentEl.createEl('div', { cls: 'ultima-orb-onboarding-content' });
  }

  private createNavigation(): void {
    this.navigationEl = this.contentEl.createEl('div', { cls: 'ultima-orb-onboarding-navigation' });
  }

  public updateContent(): void {
    const currentStep = this.onboardingFlow.getCurrentStep();
    
    // อัปเดต progress
    this.updateProgress();
    
    // อัปเดตเนื้อหา
    this.contentEl.empty();
    this.renderStepContent(currentStep);
    
    // อัปเดต navigation
    this.updateNavigation();
  }

  private updateProgress(): void {
    const progress = this.onboardingFlow.getProgress();
    const currentStep = this.onboardingFlow.getCurrentStep();
    const stepIndex = this.onboardingFlow['currentStepIndex'];
    
    // อัปเดต progress bar
    const progressFillEl = this.progressEl.querySelector('.ultima-orb-progress-fill') as HTMLElement;
    if (progressFillEl) {
      progressFillEl.style.width = `${progress}%`;
    }
    
    // อัปเดตข้อความ
    const progressTextEl = this.progressEl.querySelector('.ultima-orb-progress-text') as HTMLElement;
    if (progressTextEl) {
      progressTextEl.setText(`Step ${stepIndex + 1} of ${this.onboardingFlow['steps'].length}`);
    }
  }

  private renderStepContent(step: OnboardingStep): void {
    const stepEl = this.contentEl.createEl('div', { cls: 'ultima-orb-onboarding-step' });
    
    const titleEl = stepEl.createEl('h3', { cls: 'ultima-orb-step-title' });
    titleEl.setText(step.title);
    
    const descEl = stepEl.createEl('p', { cls: 'ultima-orb-step-description' });
    descEl.setText(step.description);
    
    // แสดงเนื้อหาตาม component type
    switch (step.component) {
      case 'welcome':
        this.renderWelcomeStep(stepEl);
        break;
      case 'ai-setup':
        this.renderAISetupStep(stepEl);
        break;
      case 'integrations':
        this.renderIntegrationsStep(stepEl);
        break;
      case 'features':
        this.renderFeaturesStep(stepEl);
        break;
      case 'completion':
        this.renderCompletionStep(stepEl);
        break;
    }
  }

  private renderWelcomeStep(container: HTMLElement): void {
    const welcomeEl = container.createEl('div', { cls: 'ultima-orb-welcome-content' });
    
    const featuresList = welcomeEl.createEl('ul', { cls: 'ultima-orb-features-list' });
    featuresList.innerHTML = `
      <li>🤖 AI Providers 5 ตัว (OpenAI, Claude, Gemini, Ollama, AnythingLLM)</li>
      <li>🔗 External Integrations (Notion, Airtable, ClickUp)</li>
      <li>💬 Chat Interface ที่ใช้งานง่าย</li>
      <li>📚 Knowledge Management System</li>
      <li>⚡ Performance Optimization</li>
      <li>🛡️ Security & Privacy Protection</li>
    `;
    
    const tipEl = welcomeEl.createEl('div', { cls: 'ultima-orb-tip' });
    tipEl.innerHTML = `
      <strong>💡 Tip:</strong> คุณสามารถข้ามขั้นตอนที่ไม่จำเป็นได้ และกลับมาทำภายหลัง
    `;
  }

  private renderAISetupStep(container: HTMLElement): void {
    const aiSetupEl = container.createEl('div', { cls: 'ultima-orb-ai-setup' });
    
    // AI Provider Selection
    const providerSection = aiSetupEl.createEl('div', { cls: 'ultima-orb-provider-section' });
    providerSection.createEl('h4', { text: 'เลือก AI Providers' });
    
    const providers = [
      { id: 'openai', name: 'OpenAI GPT', description: 'เหมาะสำหรับงานทั่วไป' },
      { id: 'claude', name: 'Anthropic Claude', description: 'เหมาะสำหรับการวิเคราะห์เชิงลึก' },
      { id: 'gemini', name: 'Google Gemini', description: 'เหมาะสำหรับข้อมูลล่าสุด' },
      { id: 'ollama', name: 'Ollama', description: 'เหมาะสำหรับความเป็นส่วนตัว' },
      { id: 'anythingllm', name: 'AnythingLLM', description: 'เหมาะสำหรับความรู้เฉพาะ' }
    ];
    
    providers.forEach(provider => {
      const providerEl = providerSection.createEl('div', { cls: 'ultima-orb-provider-option' });
      
      const checkbox = providerEl.createEl('input', { type: 'checkbox', id: `provider-${provider.id}` });
      checkbox.checked = provider.id === 'openai'; // Default to OpenAI
      
      const label = providerEl.createEl('label', { for: `provider-${provider.id}` });
      label.innerHTML = `
        <strong>${provider.name}</strong><br>
        <small>${provider.description}</small>
      `;
    });
    
    // API Key Setup
    const apiSection = aiSetupEl.createEl('div', { cls: 'ultima-orb-api-section' });
    apiSection.createEl('h4', { text: 'ตั้งค่า API Keys' });
    
    const apiKeyContainer = apiSection.createEl('div', { cls: 'ultima-orb-api-key-container' });
    
    new Setting(apiKeyContainer)
      .setName('OpenAI API Key')
      .setDesc('กรอก OpenAI API key ของคุณ')
      .addText(text => {
        text.setPlaceholder('sk-...');
        text.onChange(async (value) => {
          if (value.trim()) {
            await this.onboardingFlow.plugin.credentialManager.storeCredentials('openai', value);
          }
        });
      });
    
    const testButton = apiKeyContainer.createEl('button', { 
      text: 'ทดสอบการเชื่อมต่อ',
      cls: 'ultima-orb-test-button'
    });
    
    testButton.addEventListener('click', async () => {
      try {
        testButton.setText('กำลังทดสอบ...');
        testButton.disabled = true;
        
        // ทดสอบการเชื่อมต่อ
        const aiOrchestrator = new AIOrchestrator();
        const result = await aiOrchestrator.testConnection('openai');
        
        if (result.success) {
          new Notice('✅ การเชื่อมต่อสำเร็จ!');
        } else {
          new Notice('❌ การเชื่อมต่อล้มเหลว: ' + result.error);
        }
      } catch (error) {
        new Notice('❌ เกิดข้อผิดพลาด: ' + error.message);
      } finally {
        testButton.setText('ทดสอบการเชื่อมต่อ');
        testButton.disabled = false;
      }
    });
  }

  private renderIntegrationsStep(container: HTMLElement): void {
    const integrationsEl = container.createEl('div', { cls: 'ultima-orb-integrations' });
    
    const integrations = [
      { 
        id: 'notion', 
        name: 'Notion', 
        description: 'เชื่อมต่อกับ Notion workspace ของคุณ',
        icon: '📝'
      },
      { 
        id: 'airtable', 
        name: 'Airtable', 
        description: 'เชื่อมต่อกับ Airtable bases และ tables',
        icon: '📊'
      },
      { 
        id: 'clickup', 
        name: 'ClickUp', 
        description: 'เชื่อมต่อกับ ClickUp projects และ tasks',
        icon: '📋'
      }
    ];
    
    integrations.forEach(integration => {
      const integrationEl = integrationsEl.createEl('div', { cls: 'ultima-orb-integration-option' });
      
      const headerEl = integrationEl.createEl('div', { cls: 'ultima-orb-integration-header' });
      headerEl.innerHTML = `
        <span class="ultima-orb-integration-icon">${integration.icon}</span>
        <div class="ultima-orb-integration-info">
          <h5>${integration.name}</h5>
          <p>${integration.description}</p>
        </div>
      `;
      
      const setupButton = integrationEl.createEl('button', { 
        text: 'ตั้งค่าตอนนี้',
        cls: 'ultima-orb-setup-button'
      });
      
      setupButton.addEventListener('click', () => {
        new Notice(`🔧 การตั้งค่า ${integration.name} จะเปิดในหน้าตั้งค่า`);
        // เปิดหน้าตั้งค่า integration
        this.onboardingFlow.plugin.openSettings();
      });
      
      const skipButton = integrationEl.createEl('button', { 
        text: 'ข้าม',
        cls: 'ultima-orb-skip-button'
      });
      
      skipButton.addEventListener('click', () => {
        new Notice(`⏭️ ข้ามการตั้งค่า ${integration.name}`);
      });
    });
  }

  private renderFeaturesStep(container: HTMLElement): void {
    const featuresEl = container.createEl('div', { cls: 'ultima-orb-features-showcase' });
    
    const features = [
      {
        icon: '💬',
        title: 'Chat Interface',
        description: 'สนทนากับ AI ได้อย่างเป็นธรรมชาติ',
        command: 'Ultima-Orb: Open Chat'
      },
      {
        icon: '🚀',
        title: 'AI Generation',
        description: 'สร้างเนื้อหาด้วย AI generation tools',
        command: 'Ultima-Orb: AI Generation'
      },
      {
        icon: '🔧',
        title: 'Tool Management',
        description: 'จัดการและใช้งาน tools ต่างๆ',
        command: 'Ultima-Orb: Tool Management'
      },
      {
        icon: '📚',
        title: 'Knowledge Base',
        description: 'จัดการความรู้และเอกสาร',
        command: 'Ultima-Orb: Knowledge Base'
      },
      {
        icon: '📊',
        title: 'Analytics',
        description: 'ดูสถิติและประสิทธิภาพการใช้งาน',
        command: 'Ultima-Orb: Analytics'
      }
    ];
    
    features.forEach(feature => {
      const featureEl = featuresEl.createEl('div', { cls: 'ultima-orb-feature-card' });
      
      featureEl.innerHTML = `
        <div class="ultima-orb-feature-icon">${feature.icon}</div>
        <div class="ultima-orb-feature-content">
          <h5>${feature.title}</h5>
          <p>${feature.description}</p>
          <code>${feature.command}</code>
        </div>
      `;
      
      const tryButton = featureEl.createEl('button', { 
        text: 'ลองใช้งาน',
        cls: 'ultima-orb-try-button'
      });
      
      tryButton.addEventListener('click', () => {
        // เปิด feature ที่เลือก
        this.app.commands.executeCommandById(`ultima-orb:${feature.title.toLowerCase().replace(' ', '-')}`);
      });
    });
  }

  private renderCompletionStep(container: HTMLElement): void {
    const completionEl = container.createEl('div', { cls: 'ultima-orb-completion' });
    
    completionEl.innerHTML = `
      <div class="ultima-orb-completion-icon">🎉</div>
      <h3>ยินดีต้อนรับสู่ Ultima-Orb!</h3>
      <p>คุณได้ตั้งค่า Ultima-Orb เสร็จสิ้นแล้ว ตอนนี้คุณสามารถ:</p>
      <ul>
        <li>💬 เริ่มสนทนากับ AI ด้วย Chat Interface</li>
        <li>🚀 ใช้ AI Generation tools สร้างเนื้อหา</li>
        <li>🔧 จัดการ tools และ integrations</li>
        <li>📚 สร้างและจัดการ knowledge base</li>
        <li>📊 ดู analytics และประสิทธิภาพ</li>
      </ul>
      <div class="ultima-orb-completion-tips">
        <h4>💡 เคล็ดลับการใช้งาน:</h4>
        <ul>
          <li>ใช้ Command Palette (Ctrl+P) เพื่อเข้าถึงฟีเจอร์ต่างๆ</li>
          <li>ตรวจสอบ Settings → Ultima-Orb เพื่อปรับแต่งการตั้งค่า</li>
          <li>ดู Documentation สำหรับคำแนะนำเพิ่มเติม</li>
        </ul>
      </div>
    `;
  }

  private updateNavigation(): void {
    this.navigationEl.empty();
    
    const currentStep = this.onboardingFlow.getCurrentStep();
    const isFirstStep = this.onboardingFlow['currentStepIndex'] === 0;
    const isLastStep = this.onboardingFlow['currentStepIndex'] === this.onboardingFlow['steps'].length - 1;
    
    // Previous button
    if (!isFirstStep) {
      const prevButton = new ButtonComponent(this.navigationEl)
        .setButtonText('← ก่อนหน้า')
        .onClick(() => this.onboardingFlow.previousStep());
    }
    
    // Skip button (if not required)
    if (!currentStep.required) {
      const skipButton = new ButtonComponent(this.navigationEl)
        .setButtonText('ข้าม')
        .setClass('ultima-orb-skip-button')
        .onClick(() => this.onboardingFlow.skipStep());
    }
    
    // Next/Complete button
    const nextButton = new ButtonComponent(this.navigationEl)
      .setButtonText(isLastStep ? 'เสร็จสิ้น' : 'ถัดไป →')
      .setClass('ultima-orb-primary-button')
      .onClick(() => this.onboardingFlow.nextStep());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/**
 * Quick Start Modal - แสดงเมื่อผู้ใช้ที่เคยผ่าน onboarding แล้ว
 */
class QuickStartModal extends Modal {
  private plugin: UltimaOrbPlugin;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('ultima-orb-quick-start-modal');

    contentEl.innerHTML = `
      <div class="ultima-orb-quick-start-header">
        <h2>🚀 Quick Start Guide</h2>
        <p>เริ่มต้นใช้งาน Ultima-Orb อย่างรวดเร็ว</p>
      </div>
      
      <div class="ultima-orb-quick-start-content">
        <div class="ultima-orb-quick-actions">
          <h3>⚡ การใช้งานด่วน</h3>
          
          <div class="ultima-orb-action-card" data-action="chat">
            <div class="ultima-orb-action-icon">💬</div>
            <div class="ultima-orb-action-content">
              <h4>Chat with AI</h4>
              <p>สนทนากับ AI ได้ทันที</p>
              <code>Ctrl+P → "Ultima-Orb: Open Chat"</code>
            </div>
          </div>
          
          <div class="ultima-orb-action-card" data-action="generate">
            <div class="ultima-orb-action-icon">🚀</div>
            <div class="ultima-orb-action-content">
              <h4>AI Generation</h4>
              <p>สร้างเนื้อหาด้วย AI</p>
              <code>Ctrl+P → "Ultima-Orb: AI Generation"</code>
            </div>
          </div>
          
          <div class="ultima-orb-action-card" data-action="tools">
            <div class="ultima-orb-action-icon">🔧</div>
            <div class="ultima-orb-action-content">
              <h4>Tool Management</h4>
              <p>จัดการ tools และ integrations</p>
              <code>Ctrl+P → "Ultima-Orb: Tool Management"</code>
            </div>
          </div>
          
          <div class="ultima-orb-action-card" data-action="knowledge">
            <div class="ultima-orb-action-icon">📚</div>
            <div class="ultima-orb-action-content">
              <h4>Knowledge Base</h4>
              <p>จัดการความรู้และเอกสาร</p>
              <code>Ctrl+P → "Ultima-Orb: Knowledge Base"</code>
            </div>
          </div>
        </div>
        
        <div class="ultima-orb-help-section">
          <h3>❓ ต้องการความช่วยเหลือ?</h3>
          <ul>
            <li><a href="#" data-action="docs">📖 ดู Documentation</a></li>
            <li><a href="#" data-action="tutorials">🎥 ดู Video Tutorials</a></li>
            <li><a href="#" data-action="community">🤝 เข้าร่วม Community</a></li>
            <li><a href="#" data-action="settings">⚙️ เปิด Settings</a></li>
          </ul>
        </div>
      </div>
      
      <div class="ultima-orb-quick-start-footer">
        <button class="ultima-orb-close-button">ปิด</button>
        <button class="ultima-orb-dont-show-button">ไม่แสดงอีกครั้ง</button>
      </div>
    `;

    // Add event listeners
    this.addEventListeners();
  }

  private addEventListeners(): void {
    const { contentEl } = this;

    // Action cards
    contentEl.querySelectorAll('.ultima-orb-action-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        this.executeAction(action);
      });
    });

    // Help links
    contentEl.querySelectorAll('[data-action]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const action = (e.currentTarget as HTMLElement).dataset.action;
        this.executeHelpAction(action);
      });
    });

    // Footer buttons
    const closeButton = contentEl.querySelector('.ultima-orb-close-button') as HTMLButtonElement;
    closeButton?.addEventListener('click', () => this.close());

    const dontShowButton = contentEl.querySelector('.ultima-orb-dont-show-button') as HTMLButtonElement;
    dontShowButton?.addEventListener('click', async () => {
      await this.plugin.settings.set('showQuickStartOnStartup', false);
      this.close();
      new Notice('✅ จะไม่แสดง Quick Start Guide อีกครั้ง');
    });
  }

  private executeAction(action: string): void {
    switch (action) {
      case 'chat':
        this.app.commands.executeCommandById('ultima-orb:open-chat');
        break;
      case 'generate':
        this.app.commands.executeCommandById('ultima-orb:ai-generation');
        break;
      case 'tools':
        this.app.commands.executeCommandById('ultima-orb:tool-management');
        break;
      case 'knowledge':
        this.app.commands.executeCommandById('ultima-orb:knowledge-base');
        break;
    }
    this.close();
  }

  private executeHelpAction(action: string): void {
    switch (action) {
      case 'docs':
        // เปิด documentation
        window.open('https://github.com/your-repo/ultima-orb/docs', '_blank');
        break;
      case 'tutorials':
        // เปิด video tutorials
        window.open('https://youtube.com/playlist?list=your-playlist', '_blank');
        break;
      case 'community':
        // เปิด community Discord
        window.open('https://discord.gg/your-invite', '_blank');
        break;
      case 'settings':
        // เปิด settings
        this.plugin.openSettings();
        break;
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
