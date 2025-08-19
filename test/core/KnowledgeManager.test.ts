import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KnowledgeManager } from '../../src/core/KnowledgeManager';
import { Logger } from '../../src/services/Logger';
import { CredentialManager } from '../../src/services/CredentialManager';

// Mock dependencies
vi.mock('../../src/services/CredentialManager');
vi.mock('../../src/services/Logger');

describe('KnowledgeManager', () => {
  let knowledgeManager: KnowledgeManager;
  let mockLogger: Logger;
  let mockCredentialManager: CredentialManager;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn()
    } as unknown as Logger;

    mockCredentialManager = {} as CredentialManager;

    knowledgeManager = new KnowledgeManager(mockCredentialManager, mockLogger);
  });

  describe('createWorkspace', () => {
    it('should create a workspace successfully', async () => {
      const name = 'Test Workspace';
      const description = 'Test Description';

      const result = await knowledgeManager.createWorkspace(name, description);

      expect(result).toEqual({
        id: 'workspace-1',
        name,
        description
      });
      expect(mockLogger.info).toHaveBeenCalledWith(`Creating workspace: ${name}`);
    });

    it('should create a workspace without description', async () => {
      const name = 'Test Workspace';

      const result = await knowledgeManager.createWorkspace(name);

      expect(result).toEqual({
        id: 'workspace-1',
        name,
        description: undefined
      });
    });

    it('should handle errors during workspace creation', async () => {
      const name = 'Test Workspace';
      const error = new Error('Creation failed');

      vi.spyOn(knowledgeManager as any, '_createWorkspaceInternal').mockRejectedValueOnce(error);

      await expect(knowledgeManager.createWorkspace(name)).rejects.toThrow('Creation failed');
      expect(mockLogger.error).toHaveBeenCalledWith(`Failed to create workspace ${name}:`, error);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const workspaceId = 'workspace-1';
      const filePath = '/path/to/document.pdf';

      const result = await knowledgeManager.uploadDocument(workspaceId, filePath);

      expect(result).toEqual({
        success: true,
        documentId: 'doc-1'
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Uploading document to workspace ${workspaceId}: ${filePath}`
      );
    });

    it('should handle errors during document upload', async () => {
      const workspaceId = 'workspace-1';
      const filePath = '/path/to/document.pdf';
      const error = new Error('Upload failed');

      vi.spyOn(knowledgeManager as any, '_uploadDocumentInternal').mockRejectedValueOnce(error);

      await expect(knowledgeManager.uploadDocument(workspaceId, filePath)).rejects.toThrow('Upload failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to upload document:', error);
    });
  });

  describe('queryWorkspace', () => {
    it('should query a workspace successfully', async () => {
      const workspaceId = 'workspace-1';
      const query = 'test query';

      const result = await knowledgeManager.queryWorkspace(workspaceId, query);

      expect(result).toEqual([
        { content: 'Sample response', score: 0.95 }
      ]);
      expect(mockLogger.info).toHaveBeenCalledWith(`Querying workspace ${workspaceId}: ${query}`);
    });

    it('should handle errors during workspace query', async () => {
      const workspaceId = 'workspace-1';
      const query = 'test query';
      const error = new Error('Query failed');

      vi.spyOn(knowledgeManager as any, '_queryWorkspaceInternal').mockRejectedValueOnce(error);

      await expect(knowledgeManager.queryWorkspace(workspaceId, query)).rejects.toThrow('Query failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to query workspace:', error);
    });
  });

  describe('getWorkspaces', () => {
    it('should return list of workspaces', async () => {
      const result = await knowledgeManager.getWorkspaces();

      expect(result).toEqual([
        { id: 'workspace-1', name: 'Project Documentation', documentCount: 5 },
        { id: 'workspace-2', name: 'Research Papers', documentCount: 12 }
      ]);
    });
  });

  describe('dispose', () => {
    it('should log disposal message', () => {
      knowledgeManager.dispose();

      expect(mockLogger.info).toHaveBeenCalledWith('KnowledgeManager disposed');
    });
  });
});
