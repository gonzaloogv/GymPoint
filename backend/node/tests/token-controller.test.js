jest.mock('../services/token-service');

const tokenController = require('../controllers/token-controller');
const tokenService = require('../services/token-service');
beforeEach(() => {
  jest.clearAllMocks();
});


describe('token-controller.otorgarTokens', () => {
  it('returns 201 with result', async () => {
    const req = { body: { id_user: 1, amount: 5, motive: 'test' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    tokenService.otorgarTokens.mockResolvedValue({ ok: true });

    await tokenController.otorgarTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it('returns 400 when missing fields', async () => {
    const req = { body: { id_user: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await tokenController.otorgarTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos requeridos.' });
    expect(tokenService.otorgarTokens).not.toHaveBeenCalled();
  });

  it('handles service errors', async () => {
    const req = { body: { id_user: 1, amount: 1, motive: 'a' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    tokenService.otorgarTokens.mockRejectedValue(new Error('bad'));

    await tokenController.otorgarTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'bad' });
  });
});

describe('token-controller.obtenerResumenTokens', () => {
  it('returns user token summary', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    tokenService.obtenerResumenTokens.mockResolvedValue({ total: 10 });

    await tokenController.obtenerResumenTokens(req, res);

    expect(tokenService.obtenerResumenTokens).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ total: 10 });
  });

  it('handles errors', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    tokenService.obtenerResumenTokens.mockRejectedValue(new Error('no'));

    await tokenController.obtenerResumenTokens(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'no' });
  });
});