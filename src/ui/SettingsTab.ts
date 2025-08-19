import { App, PluginSettingTab, Setting } from 'obsidian';
import { UltimaOrbPlugin } from '../UltimaOrbPlugin';

/**
 * ⚙️ Settings Tab
 * หน้าตั้งค่าของ Ultima-Orb plugin
 */

export class SettingsTab extends PluginSettingTab {
  private plugin: UltimaOrbPlugin;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Ultima-Orb Settings' });

    // General Settings
    this.createGeneralSettings(containerEl);

    // AI Providers Settings
    this.createAIProviderSettings(containerEl);

    // Integrations Settings
    this.createIntegrationSettings(containerEl);

    // Performance Settings
    this.createPerformanceSettings(containerEl);

    // Security Settings
    this.createSecuritySettings(containerEl);

    // Advanced Settings
    this.createAdvancedSettings(containerEl);
  }

  private createGeneralSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'General Settings' });

    new Setting(containerEl)
      .setName('Default AI Provider')
      .setDesc('เลือก AI provider ที่จะใช้เป็นค่าเริ่มต้น')
      .addDropdown(dropdown => {
        dropdown
          .addOption('openai', 'OpenAI GPT')
          .addOption('claude', 'Anthropic Claude')
          .addOption('gemini', 'Google Gemini')
          .addOption('ollama', 'Ollama')
          .addOption('anythingllm', 'AnythingLLM')
          .setValue(this.plugin.settings.getSync('defaultAIProvider') || 'openai')
          .onChange(async (value) => {
            await this.plugin.settings.set('defaultAIProvider', value);
            this.plugin.aiOrchestrator.setDefaultProvider(value);
          });
      });

    new Setting(containerEl)
      .setName('Language')
      .setDesc('เลือกภาษาสำหรับการแสดงผล')
      .addDropdown(dropdown => {
        dropdown
          .addOption('th', 'ไทย')
          .addOption('en', 'English')
          .setValue(this.plugin.settings.getSync('language') || 'th')
          .onChange(async (value) => {
            await this.plugin.settings.set('language', value);
          });
      });

    new Setting(containerEl)
      .setName('Theme')
      .setDesc('เลือกธีมสำหรับ UI')
      .addDropdown(dropdown => {
        dropdown
          .addOption('auto', 'Auto (ตามระบบ)')
          .addOption('light', 'Light')
          .addOption('dark', 'Dark')
          .setValue(this.plugin.settings.getSync('theme') || 'auto')
          .onChange(async (value) => {
            await this.plugin.settings.set('theme', value);
          });
      });
  }

  private createAIProviderSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'AI Provider Settings' });

    // OpenAI Settings
    new Setting(containerEl)
      .setName('OpenAI API Key')
      .setDesc('API key สำหรับ OpenAI (sk-...)')
      .addText(text => {
        text
          .setPlaceholder('sk-...')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('openai', value);
            }
          });
      });

    // Claude Settings
    new Setting(containerEl)
      .setName('Claude API Key')
      .setDesc('API key สำหรับ Anthropic Claude (sk-ant-...)')
      .addText(text => {
        text
          .setPlaceholder('sk-ant-...')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('claude', value);
            }
          });
      });

    // Gemini Settings
    new Setting(containerEl)
      .setName('Gemini API Key')
      .setDesc('API key สำหรับ Google Gemini (AIza...)')
      .addText(text => {
        text
          .setPlaceholder('AIza...')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('gemini', value);
            }
          });
      });

    // Ollama Settings
    new Setting(containerEl)
      .setName('Ollama Endpoint')
      .setDesc('URL ของ Ollama server (http://localhost:11434)')
      .addText(text => {
        text
          .setPlaceholder('http://localhost:11434')
          .setValue('http://localhost:11434')
          .onChange(async (value) => {
            await this.plugin.settings.set('ollamaEndpoint', value);
          });
      });

    // AnythingLLM Settings
    new Setting(containerEl)
      .setName('AnythingLLM URL')
      .setDesc('URL ของ AnythingLLM server')
      .addText(text => {
        text
          .setPlaceholder('http://localhost:3001')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('anythingllm_url', value);
            }
          });
      });

    new Setting(containerEl)
      .setName('AnythingLLM API Key')
      .setDesc('API key สำหรับ AnythingLLM')
      .addText(text => {
        text
          .setPlaceholder('API Key')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('anythingllm_key', value);
            }
          });
      });
  }

  private createIntegrationSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Integration Settings' });

    // Notion Settings
    new Setting(containerEl)
      .setName('Notion Integration Token')
      .setDesc('Token สำหรับ Notion integration')
      .addText(text => {
        text
          .setPlaceholder('secret_...')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('notion', value);
            }
          });
      });

    // Airtable Settings
    new Setting(containerEl)
      .setName('Airtable API Key')
      .setDesc('API key สำหรับ Airtable')
      .addText(text => {
        text
          .setPlaceholder('key...')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('airtable', value);
            }
          });
      });

    // ClickUp Settings
    new Setting(containerEl)
      .setName('ClickUp API Token')
      .setDesc('API token สำหรับ ClickUp')
      .addText(text => {
        text
          .setPlaceholder('pk_...')
          .setValue('')
          .onChange(async (value) => {
            if (value.trim()) {
              await this.plugin.credentialManager.storeCredentials('clickup', value);
            }
          });
      });
  }

  private createPerformanceSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Performance Settings' });

    new Setting(containerEl)
      .setName('Enable Caching')
      .setDesc('เปิดใช้งาน caching เพื่อเพิ่มประสิทธิภาพ')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.getSync('enableCaching') !== false)
          .onChange(async (value) => {
            await this.plugin.settings.set('enableCaching', value);
          });
      });

    new Setting(containerEl)
      .setName('Cache TTL (minutes)')
      .setDesc('เวลาหมดอายุของ cache (นาที)')
      .addSlider(slider => {
        slider
          .setLimits(1, 60, 1)
          .setValue(this.plugin.settings.getSync('cacheTTL') / 60000 || 5)
          .setDynamicTooltip()
          .onChange(async (value) => {
            await this.plugin.settings.set('cacheTTL', value * 60000);
          });
      });

    new Setting(containerEl)
      .setName('Max Chat History')
      .setDesc('จำนวนข้อความสูงสุดในประวัติการสนทนา')
      .addSlider(slider => {
        slider
          .setLimits(10, 1000, 10)
          .setValue(this.plugin.settings.getSync('maxChatHistory') || 100)
          .setDynamicTooltip()
          .onChange(async (value) => {
            await this.plugin.settings.set('maxChatHistory', value);
          });
      });

    new Setting(containerEl)
      .setName('Max File Size (MB)')
      .setDesc('ขนาดไฟล์สูงสุดที่สามารถแนบได้ (MB)')
      .addSlider(slider => {
        slider
          .setLimits(1, 100, 1)
          .setValue((this.plugin.settings.getSync('maxFileSize') || 10485760) / 1048576)
          .setDynamicTooltip()
          .onChange(async (value) => {
            await this.plugin.settings.set('maxFileSize', value * 1048576);
          });
      });
  }

  private createSecuritySettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Security Settings' });

    new Setting(containerEl)
      .setName('Enable Encryption')
      .setDesc('เข้ารหัสข้อมูลที่สำคัญ')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.getSync('enableEncryption') !== false)
          .onChange(async (value) => {
            await this.plugin.settings.set('enableEncryption', value);
          });
      });

    new Setting(containerEl)
      .setName('Session Timeout (minutes)')
      .setDesc('เวลาหมดอายุของ session (นาที)')
      .addSlider(slider => {
        slider
          .setLimits(5, 480, 5)
          .setValue((this.plugin.settings.getSync('sessionTimeout') || 3600000) / 60000)
          .setDynamicTooltip()
          .onChange(async (value) => {
            await this.plugin.settings.set('sessionTimeout', value * 60000);
          });
      });

    new Setting(containerEl)
      .setName('Enable Error Reporting')
      .setDesc('ส่งรายงานข้อผิดพลาดเพื่อปรับปรุงคุณภาพ')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.getSync('enableErrorReporting') !== false)
          .onChange(async (value) => {
            await this.plugin.settings.set('enableErrorReporting', value);
          });
      });
  }

  private createAdvancedSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'Advanced Settings' });

    new Setting(containerEl)
      .setName('Enable Analytics')
      .setDesc('เก็บข้อมูลการใช้งานเพื่อปรับปรุงคุณภาพ')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.getSync('enableAnalytics') !== false)
          .onChange(async (value) => {
            await this.plugin.settings.set('enableAnalytics', value);
          });
      });

    new Setting(containerEl)
      .setName('Show Quick Start on Startup')
      .setDesc('แสดง Quick Start Guide เมื่อเปิด Obsidian')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.getSync('showQuickStartOnStartup') !== false)
          .onChange(async (value) => {
            await this.plugin.settings.set('showQuickStartOnStartup', value);
          });
      });

    // Reset Settings Button
    new Setting(containerEl)
      .setName('Reset All Settings')
      .setDesc('รีเซ็ตการตั้งค่าทั้งหมดเป็นค่าเริ่มต้น')
      .addButton(button => {
        button
          .setButtonText('Reset')
          .setWarning()
          .onClick(async () => {
            if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าทั้งหมด?')) {
              await this.plugin.settings.clear();
              this.display(); // Refresh the settings tab
            }
          });
      });

    // Export/Import Settings
    const exportImportContainer = containerEl.createEl('div', { cls: 'setting-item-control' });
    
    const exportButton = exportImportContainer.createEl('button', { text: 'Export Settings' });
    exportButton.addEventListener('click', async () => {
      try {
        const settings = await this.plugin.settings.exportData();
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ultima-orb-settings.json';
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export settings:', error);
      }
    });

    const importButton = exportImportContainer.createEl('button', { text: 'Import Settings' });
    importButton.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const text = await file.text();
            await this.plugin.settings.importData(text);
            this.display(); // Refresh the settings tab
          } catch (error) {
            console.error('Failed to import settings:', error);
          }
        }
      };
      input.click();
    });
  }
}
