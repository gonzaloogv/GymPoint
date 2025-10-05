jest.mock('../models/Exercise', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
}));

const exerciseService = require('../services/exercise-service');
const {Exercise} = require('../models');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('updateExercise', () => {
    it('updates existing exercise', async () => {
        const inst = { update: jest.fn().mockResolvedValue('ok') };
        Exercise.findByPk.mockResolvedValue(inst);

        const result = await exerciseService.updateExercise(1, { name: 'x' });

        expect(inst.update).toHaveBeenCalledWith({ name: 'x' });
        expect(result).toBe('ok');
});

    it('throws when not found', async () => {
        Exercise.findByPk.mockResolvedValue(null);
        await expect(exerciseService.updateExercise(1, {})).rejects.toThrow('Exercise not found');
    });
});