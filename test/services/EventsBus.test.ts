import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventsBus } from '../../src/services/EventsBus';

describe('EventsBus', () => {
  let eventsBus: EventsBus;

  beforeEach(() => {
    eventsBus = new EventsBus();
  });

  describe('plugin lifecycle events', () => {
    it('should emit plugin:load event', () => {
      const listener = vi.fn();
      eventsBus.on('plugin:load', listener);
      
      eventsBus.emit('plugin:load');
      
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should emit plugin:unload event', () => {
      const listener = vi.fn();
      eventsBus.on('plugin:unload', listener);
      
      eventsBus.emit('plugin:unload');
      
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('AI events', () => {
    it('should emit ai:provider:changed event', () => {
      const listener = vi.fn();
      eventsBus.on('ai:provider:changed', listener);
      
      eventsBus.emit('ai:provider:changed', 'openai');
      
      expect(listener).toHaveBeenCalledWith('openai');
    });

    it('should emit ai:request:start event', () => {
      const listener = vi.fn();
      eventsBus.on('ai:request:start', listener);
      
      const payload = { message: 'test', provider: 'openai' };
      eventsBus.emit('ai:request:start', payload);
      
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should emit ai:request:complete event', () => {
      const listener = vi.fn();
      eventsBus.on('ai:request:complete', listener);
      
      const payload = { response: 'test response', provider: 'openai' };
      eventsBus.emit('ai:request:complete', payload);
      
      expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should emit ai:request:error event', () => {
      const listener = vi.fn();
      eventsBus.on('ai:request:error', listener);
      
      const error = new Error('Test error');
      eventsBus.emit('ai:request:error', error);
      
      expect(listener).toHaveBeenCalledWith(error);
    });
  });

  describe('tool events', () => {
    it('should emit tool:execute:start event', () => {
      const listener = vi.fn();
      eventsBus.on('tool:execute:start', listener);
      
      eventsBus.emit('tool:execute:start', 'notion:search_pages', { query: 'test' });
      
      expect(listener).toHaveBeenCalledWith('notion:search_pages', { query: 'test' });
    });

    it('should emit tool:execute:complete event', () => {
      const listener = vi.fn();
      eventsBus.on('tool:execute:complete', listener);
      
      eventsBus.emit('tool:execute:complete', 'notion:search_pages', { results: [] });
      
      expect(listener).toHaveBeenCalledWith('notion:search_pages', { results: [] });
    });

    it('should emit tool:execute:error event', () => {
      const listener = vi.fn();
      eventsBus.on('tool:execute:error', listener);
      
      const error = new Error('Tool execution failed');
      eventsBus.emit('tool:execute:error', 'notion:search_pages', error);
      
      expect(listener).toHaveBeenCalledWith('notion:search_pages', error);
    });
  });

  describe('knowledge events', () => {
    it('should emit knowledge:workspace:created event', () => {
      const listener = vi.fn();
      eventsBus.on('knowledge:workspace:created', listener);
      
      const workspace = { id: 'workspace-1', name: 'Test Workspace' };
      eventsBus.emit('knowledge:workspace:created', workspace);
      
      expect(listener).toHaveBeenCalledWith(workspace);
    });

    it('should emit knowledge:query:start event', () => {
      const listener = vi.fn();
      eventsBus.on('knowledge:query:start', listener);
      
      eventsBus.emit('knowledge:query:start', 'test query');
      
      expect(listener).toHaveBeenCalledWith('test query');
    });
  });

  describe('UI events', () => {
    it('should emit ui:chat:message event', () => {
      const listener = vi.fn();
      eventsBus.on('ui:chat:message', listener);
      
      const message = { type: 'user', content: 'Hello' };
      eventsBus.emit('ui:chat:message', message);
      
      expect(listener).toHaveBeenCalledWith(message);
    });

    it('should emit ui:settings:changed event', () => {
      const listener = vi.fn();
      eventsBus.on('ui:settings:changed', listener);
      
      const settings = { openaiKey: 'new-key' };
      eventsBus.emit('ui:settings:changed', settings);
      
      expect(listener).toHaveBeenCalledWith(settings);
    });
  });

  describe('event removal', () => {
    it('should remove event listeners', () => {
      const listener = vi.fn();
      eventsBus.on('plugin:load', listener);
      eventsBus.off('plugin:load', listener);
      
      eventsBus.emit('plugin:load');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
