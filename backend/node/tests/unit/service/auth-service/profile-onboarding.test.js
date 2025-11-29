const {
  authService,
  accountRepository,
  userProfileRepository,
  streakRepository,
  frequencyService,
  mockTransaction,
} = require('./test-setup');

describe('auth-service completeOnboarding', () => {
  it('completa el onboarding creando frecuencia y streak', async () => {
    const account = {
      id_account: 10,
      profile_completed: false,
      userProfile: {
        id_user_profile: 20,
        id_streak: null,
      },
    };

    accountRepository.findById
      .mockResolvedValueOnce(account)
      .mockResolvedValueOnce({
        ...account,
        profile_completed: true,
      });
    frequencyService.createWeeklyGoal = jest.fn().mockResolvedValue({ id_frequency: 5 });
    streakRepository.createStreak.mockResolvedValue({ id_streak: 10 });

    await authService.completeOnboarding(10, {
      frequencyGoal: 3,
      birthDate: '2000-01-01',
      gender: 'M',
    });

    expect(userProfileRepository.updateUserProfile).toHaveBeenCalledWith(
      20,
      expect.objectContaining({
        birth_date: '2000-01-01',
        gender: 'M',
      }),
      { transaction: mockTransaction }
    );
    expect(frequencyService.createWeeklyGoal).toHaveBeenCalled();
    expect(streakRepository.createStreak).toHaveBeenCalled();
    expect(accountRepository.updateAccount).toHaveBeenCalledWith(
      10,
      { profile_completed: true },
      { transaction: mockTransaction }
    );
  });

  it('lanza error si la frecuencia es inválida', async () => {
    await expect(
      authService.completeOnboarding(10, {
        frequencyGoal: 10,
        birthDate: '2000-01-01',
      })
    ).rejects.toThrow('Frecuencia debe ser un entero entre 1 y 7');
  });

  it('lanza error si la edad es menor a 13 años', async () => {
    const account = {
      id_account: 10,
      profile_completed: false,
      userProfile: { id_user_profile: 20 },
    };

    accountRepository.findById.mockResolvedValue(account);

    const recentDate = new Date();
    recentDate.setFullYear(recentDate.getFullYear() - 10);

    await expect(
      authService.completeOnboarding(10, {
        frequencyGoal: 3,
        birthDate: recentDate.toISOString().slice(0, 10),
      })
    ).rejects.toThrow('Debes tener al menos 13 años');
  });

  it('lanza error si el perfil ya fue completado', async () => {
    const account = {
      id_account: 10,
      profile_completed: true,
      userProfile: { id_user_profile: 20 },
    };

    accountRepository.findById.mockResolvedValue(account);

    await expect(
      authService.completeOnboarding(10, {
        frequencyGoal: 3,
        birthDate: '2000-01-01',
      })
    ).rejects.toThrow('El perfil ya fue completado');
  });
});
