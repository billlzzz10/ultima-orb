import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../../src/services/Logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    logger = new Logger();
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
    };
  });

  describe('info', () => {
    it('should log info message with prefix', () => {
      const message = 'Test info message';
      logger.info(message);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🔮 Ultima-Orb [INFO]:',
        message
      );
    });

    it('should log info message with additional arguments', () => {
      const message = 'Test info message';
      const additional = { key: 'value' };
      
      logger.info(message, additional);
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🔮 Ultima-Orb [INFO]:',
        message,
        additional
      );
    });
  });

  describe('warn', () => {
    it('should log warning message with prefix', () => {
      const message = 'Test warning message';
      logger.warn(message);
      
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '🔮 Ultima-Orb [WARN]:',
        message
      );
    });
  });

  describe('error', () => {
    it('should log error message with prefix', () => {
      const message = 'Test error message';
      logger.error(message);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '🔮 Ultima-Orb [ERROR]:',
        message
      );
    });
  });

  describe('debug', () => {
    it('should log debug message with prefix', () => {
      const message = 'Test debug message';
      logger.debug(message);
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '🔮 Ultima-Orb [DEBUG]:',
        message
      );
    });
  });

  describe('log', () => {
    it('should call info method', () => {
      const message = 'Test log message';
      const infoSpy = vi.spyOn(logger, 'info');
      
      logger.log(message);
      
      expect(infoSpy).toHaveBeenCalledWith(message);
    });
  });
});
