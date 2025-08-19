import { Plugin, Notice } from 'obsidian';
import { UltimaOrbPlugin } from './UltimaOrbPlugin';
import { OnboardingFlow } from './ui/OnboardingFlow';

/**
 * 🔮 Ultima-Orb: Main Plugin Entry Point
 * AI-powered Obsidian plugin with multiple AI providers and external integrations
 */

export default class UltimaOrb extends Plugin {
  private ultimaOrbPlugin!: UltimaOrbPlugin;
  private onboardingFlow!: OnboardingFlow;

  async onload() {
    console.log('🚀 Loading Ultima-Orb plugin...');

    try {
      // Initialize main plugin
      this.ultimaOrbPlugin = new UltimaOrbPlugin(this);
      await this.ultimaOrbPlugin.initialize();

      // Initialize onboarding flow
      this.onboardingFlow = new OnboardingFlow(this.ultimaOrbPlugin);

      // Register commands
      this.registerCommands();

      // Start onboarding if first time
      await this.handleFirstTimeSetup();

      console.log('✅ Ultima-Orb plugin loaded successfully!');
    } catch (error) {
      console.error('❌ Error loading Ultima-Orb plugin:', error);
      new Notice('❌ Error loading Ultima-Orb plugin. Please check console for details.');
    }
  }

  async onunload() {
    console.log('🔄 Unloading Ultima-Orb plugin...');

    try {
      // Cleanup main plugin
      if (this.ultimaOrbPlugin) {
        await this.ultimaOrbPlugin.cleanup();
      }

      console.log('✅ Ultima-Orb plugin unloaded successfully!');
    } catch (error) {
      console.error('❌ Error unloading Ultima-Orb plugin:', error);
    }
  }

  private registerCommands(): void {
    // Core commands
    this.addCommand({
      id: 'ultima-orb-open-chat',
      name: 'Open Chat Interface',
      callback: () => this.ultimaOrbPlugin.openChatInterface(),
    });

    this.addCommand({
      id: 'ultima-orb-ai-generation',
      name: 'AI Generation Tools',
      callback: () => this.ultimaOrbPlugin.openAIGeneration(),
    });

    this.addCommand({
      id: 'ultima-orb-tool-management',
      name: 'Tool Management',
      callback: () => this.ultimaOrbPlugin.openToolManagement(),
    });

    this.addCommand({
      id: 'ultima-orb-knowledge-base',
      name: 'Knowledge Base',
      callback: () => this.ultimaOrbPlugin.openKnowledgeBase(),
    });

    this.addCommand({
      id: 'ultima-orb-analytics',
      name: 'Analytics Dashboard',
      callback: () => this.ultimaOrbPlugin.openAnalytics(),
    });

    // Onboarding commands
    this.addCommand({
      id: 'ultima-orb-onboarding',
      name: 'Start Onboarding',
      callback: () => this.onboardingFlow.start(),
    });

    this.addCommand({
      id: 'ultima-orb-quick-start',
      name: 'Quick Start Guide',
      callback: () => this.onboardingFlow.showQuickStartGuide(),
    });

    // Settings command
    this.addCommand({
      id: 'ultima-orb-settings',
      name: 'Open Settings',
      callback: () => this.ultimaOrbPlugin.openSettings(),
    });
  }

  private async handleFirstTimeSetup(): Promise<void> {
    try {
      // ตรวจสอบว่าเคยผ่าน onboarding แล้วหรือไม่
      const hasCompletedOnboarding = await this.ultimaOrbPlugin.settings.get('hasCompletedOnboarding');
      const showQuickStartOnStartup = await this.ultimaOrbPlugin.settings.get('showQuickStartOnStartup');

      if (!hasCompletedOnboarding) {
        // แสดง onboarding flow สำหรับผู้ใช้ใหม่
        console.log('🎉 First time user detected. Starting onboarding flow...');
        await this.onboardingFlow.start();
      } else if (showQuickStartOnStartup !== false) {
        // แสดง quick start guide สำหรับผู้ใช้ที่เคยผ่าน onboarding แล้ว
        console.log('🚀 Showing quick start guide...');
        await this.onboardingFlow.showQuickStartGuide();
      }
    } catch (error) {
      console.error('❌ Error handling first time setup:', error);
    }
  }

  // Public methods for external access
  public getUltimaOrbPlugin(): UltimaOrbPlugin {
    return this.ultimaOrbPlugin;
  }

  public getOnboardingFlow(): OnboardingFlow {
    return this.onboardingFlow;
  }
}
