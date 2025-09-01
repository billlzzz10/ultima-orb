import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger, LogLevel } from '../../../src/services/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('[Test]', LogLevel.INFO);
    vi.restoreAllMocks();
  });

  it('logs info when level allows', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('hello');
    expect(spy).toHaveBeenCalled();
  });

  it('does not log debug when level is info', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('debug');
    expect(spy).not.toHaveBeenCalled();
  });

  it('logs debug after level is changed', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('debug');
    expect(spy).toHaveBeenCalled();
  });
});
