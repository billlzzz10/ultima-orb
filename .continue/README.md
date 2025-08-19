# 🔮 Continue AI Configuration for Ultima-Orb

## 📋 Overview

This directory contains configuration files for Continue AI to work optimally with the Ultima-Orb Obsidian plugin project.

## 📁 Files

### `config.json`
Main configuration file that defines:
- **Models**: AI models to use (Claude 3.5 Sonnet)
- **Commands**: Custom commands for project tasks
- **Context Providers**: Project-specific context information
- **Rules**: Coding standards and guidelines
- **Prompts**: Specialized prompts for different tasks

### `ignore`
Specifies files and directories that Continue AI should ignore to avoid:
- Modifying build outputs
- Changing configuration files
- Altering documentation
- Interfering with IDE settings

## 🚀 Available Commands

### Development Commands
```bash
# Run all tests and checks
/test-all

# Start development build
/dev-build

# Fix linting issues
/lint-fix

# Type checking
/type-check

# Production build
/build-prod
```

## 🎯 Context Providers

### Project Structure
Provides context about the Ultima-Orb architecture:
- Obsidian plugin with TypeScript
- Modular architecture with AI providers
- Integration with external services

### Coding Standards
Defines coding conventions:
- TypeScript with strict mode
- ESLint + Prettier
- Vitest for testing
- Obsidian plugin guidelines

### AI Providers
Patterns for implementing AI providers:
- Extend BaseProvider
- Proper error handling
- Timeout and retry logic

## 📝 Rules

1. **Language**: Use Thai for explanations and comments
2. **TypeScript**: Follow best practices with proper types
3. **Error Handling**: Implement comprehensive error handling
4. **Testing**: Write unit tests for all features
5. **Code Quality**: Use ESLint and Prettier
6. **Obsidian Guidelines**: Follow plugin development guidelines
7. **Logging**: Use structured logging
8. **Design Patterns**: Apply appropriate patterns
9. **Type Safety**: Ensure type-safe API calls
10. **Authentication**: Proper auth handling for integrations

## 🎨 Specialized Prompts

### Default Prompt
General development assistance with project context

### Testing Prompt
Focused on writing comprehensive tests with Vitest

### AI Provider Prompt
Specialized for implementing AI provider classes

### Integration Prompt
For creating external service integrations

### UI Component Prompt
For building Obsidian UI components

## 🔧 Usage Tips

1. **Use Commands**: Leverage the custom commands for common tasks
2. **Context Awareness**: Continue AI will understand the project structure
3. **Rule Following**: AI will follow the defined coding standards
4. **Specialized Help**: Use specific prompts for different types of work

## 🚨 Important Notes

- Continue AI will respect the ignore file
- Configuration files are protected from modification
- Documentation files are preserved
- Build outputs are ignored to prevent conflicts

## 📚 Related Files

- `.cursorrules` - Cursor AI configuration
- `.vscode/` - VS Code settings
- `scripts/test-all.js` - Test automation script
- `PROJECT_ROADMAP.md` - Project progress tracking
