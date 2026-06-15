import { chat, resolveModel, hasOpenRouter, OpenRouterProvider } from './openrouter';

const OLD_KEY = process.env.OPENROUTER_API_KEY;

afterEach(() => {
  process.env.OPENROUTER_API_KEY = OLD_KEY;
  delete (global as any).fetch;
});

describe('resolveModel', () => {
  it('uses the default model when none given', () => {
    delete process.env.OPENROUTER_MODEL;
    expect(resolveModel()).toBe('openai/gpt-4o-mini');
  });
  it('appends :online for web search', () => {
    expect(resolveModel({ model: 'x/y', web: true })).toBe('x/y:online');
  });
  it('does not double-append :online', () => {
    expect(resolveModel({ model: 'x/y:online', web: true })).toBe('x/y:online');
  });
  it('honors OPENROUTER_MODEL env', () => {
    process.env.OPENROUTER_MODEL = 'anthropic/claude-3.5-sonnet';
    expect(resolveModel()).toBe('anthropic/claude-3.5-sonnet');
  });
});

describe('hasOpenRouter', () => {
  it('reflects presence of the key', () => {
    process.env.OPENROUTER_API_KEY = 'k';
    expect(hasOpenRouter()).toBe(true);
    delete process.env.OPENROUTER_API_KEY;
    expect(hasOpenRouter()).toBe(false);
  });
});

describe('chat', () => {
  it('throws without an API key', async () => {
    delete process.env.OPENROUTER_API_KEY;
    await expect(chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('not configured');
  });

  it('posts the request and returns the message content', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello world' } }] }),
    });
    (global as any).fetch = fetchMock;

    const out = await chat([{ role: 'user', content: 'hi' }], { json: true, web: true, maxTokens: 100 });
    expect(out).toBe('hello world');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('openrouter.ai');
    const body = JSON.parse(init.body);
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.model).toContain(':online');
    expect(body.max_tokens).toBe(100);
    expect(init.headers.Authorization).toBe('Bearer test-key');
  });

  it('throws a sanitized error on a non-OK response', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'rate limited',
    });
    await expect(chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('OpenRouter 429');
  });

  it('returns empty string when no content is present', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) });
    expect(await chat([{ role: 'user', content: 'hi' }])).toBe('');
  });
});

describe('OpenRouterProvider', () => {
  it('builds messages and returns a GenerationResponse', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'coached' } }] }),
    });
    (global as any).fetch = fetchMock;

    const provider = new OpenRouterProvider('openai/gpt-4o-mini');
    const res = await provider.generate({
      systemInstruction: 'sys',
      userInput: 'user',
      context: 'ctx',
      maxTokens: 50,
      temperature: 0.2,
    });
    expect(res.provider).toBe('openrouter');
    expect(res.text).toBe('coached');

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0]).toEqual({ role: 'system', content: 'sys' });
    expect(body.messages.some((m: any) => m.content === 'ctx')).toBe(true);
    expect(body.messages[body.messages.length - 1]).toEqual({ role: 'user', content: 'user' });
  });
});
