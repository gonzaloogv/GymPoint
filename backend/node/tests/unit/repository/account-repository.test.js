jest.mock('../../../models', () => ({
  Account: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Role: {
    findOne: jest.fn(),
  },
  AccountRole: {
    findOrCreate: jest.fn(),
  },
  UserProfile: {},
  AdminProfile: {},
}));

jest.mock('../../../infra/db/mappers/account.mapper', () => ({
  toAccount: jest.fn((account) => account),
}));

jest.mock('../../../infra/db/mappers/role.mapper', () => ({
  toRole: jest.fn((role) => role),
}));

const accountRepository = require('../../../infra/db/repositories/account.repository');
const { Account, Role, AccountRole } = require('../../../models');
const { toAccount } = require('../../../infra/db/mappers/account.mapper');
const { toRole } = require('../../../infra/db/mappers/role.mapper');

describe('account-repository findByEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encuentra una cuenta por email', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'test@example.com',
      password_hash: 'hashed',
      auth_provider: 'local',
      email_verified: true,
      is_active: true,
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findByEmail('test@example.com');

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      transaction: undefined,
    });
    expect(toAccount).toHaveBeenCalledWith(mockAccount);
    expect(result).toEqual(mockAccount);
  });

  it('encuentra una cuenta con roles incluidos', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'test@example.com',
      roles: [{ id_role: 1, role_name: 'USER' }],
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findByEmail('test@example.com', {
      includeRoles: true,
    });

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      transaction: undefined,
      include: expect.arrayContaining([
        expect.objectContaining({ as: 'roles' }),
      ]),
    });
    expect(result).toEqual(mockAccount);
  });

  it('encuentra una cuenta con userProfile incluido', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'test@example.com',
      userProfile: { id_user_profile: 10 },
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findByEmail('test@example.com', {
      includeUserProfile: true,
    });

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      transaction: undefined,
      include: expect.arrayContaining([
        expect.objectContaining({ as: 'userProfile' }),
      ]),
    });
    expect(result).toEqual(mockAccount);
  });

  it('retorna null cuando no encuentra la cuenta', async () => {
    Account.findOne.mockResolvedValue(null);
    toAccount.mockReturnValue(null);

    const result = await accountRepository.findByEmail('notfound@example.com');

    expect(result).toBeNull();
  });
});

describe('account-repository findByGoogleId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encuentra una cuenta por google_id', async () => {
    const mockAccount = {
      id_account: 2,
      email: 'google@example.com',
      auth_provider: 'google',
      google_id: 'google_123456',
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findByGoogleId('google_123456');

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { google_id: 'google_123456' },
      transaction: undefined,
    });
    expect(toAccount).toHaveBeenCalledWith(mockAccount);
    expect(result).toEqual(mockAccount);
  });

  it('encuentra una cuenta con adminProfile incluido', async () => {
    const mockAccount = {
      id_account: 2,
      email: 'admin@example.com',
      google_id: 'google_123',
      adminProfile: { id_admin_profile: 5 },
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findByGoogleId('google_123', {
      includeAdminProfile: true,
    });

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { google_id: 'google_123' },
      transaction: undefined,
      include: expect.arrayContaining([
        expect.objectContaining({ as: 'adminProfile' }),
      ]),
    });
    expect(result).toEqual(mockAccount);
  });

  it('retorna null cuando no encuentra la cuenta', async () => {
    Account.findOne.mockResolvedValue(null);
    toAccount.mockReturnValue(null);

    const result = await accountRepository.findByGoogleId('notfound');

    expect(result).toBeNull();
  });
});

describe('account-repository findById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encuentra una cuenta por id_account', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'test@example.com',
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findById(1);

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { id_account: 1 },
      transaction: undefined,
    });
    expect(toAccount).toHaveBeenCalledWith(mockAccount);
    expect(result).toEqual(mockAccount);
  });

  it('encuentra una cuenta con todas las relaciones incluidas', async () => {
    const mockAccount = {
      id_account: 1,
      email: 'test@example.com',
      roles: [],
      userProfile: {},
      adminProfile: {},
    };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.findById(1, {
      includeRoles: true,
      includeUserProfile: true,
      includeAdminProfile: true,
    });

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { id_account: 1 },
      transaction: undefined,
      include: expect.arrayContaining([
        expect.objectContaining({ as: 'roles' }),
        expect.objectContaining({ as: 'userProfile' }),
        expect.objectContaining({ as: 'adminProfile' }),
      ]),
    });
    expect(result).toEqual(mockAccount);
  });

  it('maneja transacciones correctamente', async () => {
    const mockTransaction = { id: 'tx1' };
    const mockAccount = { id_account: 1, email: 'test@example.com' };

    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    await accountRepository.findById(1, { transaction: mockTransaction });

    expect(Account.findOne).toHaveBeenCalledWith({
      where: { id_account: 1 },
      transaction: mockTransaction,
    });
  });

  it('retorna null cuando no encuentra la cuenta', async () => {
    Account.findOne.mockResolvedValue(null);
    toAccount.mockReturnValue(null);

    const result = await accountRepository.findById(999);

    expect(result).toBeNull();
  });
});

describe('account-repository createAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea una nueva cuenta local', async () => {
    const payload = {
      email: 'new@example.com',
      password_hash: 'hashed_password',
      auth_provider: 'local',
    };
    const mockAccount = { id_account: 1, ...payload };

    Account.create.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.createAccount(payload);

    expect(Account.create).toHaveBeenCalledWith(payload, {
      transaction: undefined,
    });
    expect(toAccount).toHaveBeenCalledWith(mockAccount);
    expect(result).toEqual(mockAccount);
  });

  it('crea una cuenta con Google OAuth', async () => {
    const payload = {
      email: 'google@example.com',
      auth_provider: 'google',
      google_id: 'google_12345',
      email_verified: true,
    };
    const mockAccount = { id_account: 2, ...payload };

    Account.create.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.createAccount(payload);

    expect(Account.create).toHaveBeenCalledWith(payload, {
      transaction: undefined,
    });
    expect(result).toEqual(mockAccount);
  });

  it('crea una cuenta con transacción', async () => {
    const mockTransaction = { id: 'tx2' };
    const payload = { email: 'test@example.com', auth_provider: 'local' };
    const mockAccount = { id_account: 3, ...payload };

    Account.create.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    await accountRepository.createAccount(payload, { transaction: mockTransaction });

    expect(Account.create).toHaveBeenCalledWith(payload, {
      transaction: mockTransaction,
    });
  });
});

describe('account-repository updateAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('actualiza una cuenta y retorna el resultado', async () => {
    const payload = { email_verified: true };
    const mockUpdatedAccount = {
      id_account: 1,
      email: 'test@example.com',
      email_verified: true,
    };

    Account.update.mockResolvedValue([1]);
    Account.findOne.mockResolvedValue(mockUpdatedAccount);
    toAccount.mockReturnValue(mockUpdatedAccount);

    const result = await accountRepository.updateAccount(1, payload);

    expect(Account.update).toHaveBeenCalledWith(payload, {
      where: { id_account: 1 },
      transaction: undefined,
    });
    expect(Account.findOne).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedAccount);
  });

  it('actualiza sin retornar cuando returning es false', async () => {
    const payload = { is_active: false };

    Account.update.mockResolvedValue([1]);

    const result = await accountRepository.updateAccount(1, payload, {
      returning: false,
    });

    expect(Account.update).toHaveBeenCalledWith(payload, {
      where: { id_account: 1 },
      transaction: undefined,
    });
    expect(Account.findOne).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('actualiza con transacción', async () => {
    const mockTransaction = { id: 'tx3' };
    const payload = { last_login: new Date() };
    const mockAccount = { id_account: 1, email: 'test@example.com' };

    Account.update.mockResolvedValue([1]);
    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    await accountRepository.updateAccount(1, payload, {
      transaction: mockTransaction,
    });

    expect(Account.update).toHaveBeenCalledWith(payload, {
      where: { id_account: 1 },
      transaction: mockTransaction,
    });
  });
});

describe('account-repository updateLastLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('actualiza el last_login de una cuenta', async () => {
    const lastLogin = new Date('2024-01-15T10:00:00.000Z');
    const mockAccount = {
      id_account: 1,
      email: 'test@example.com',
      last_login: lastLogin,
    };

    Account.update.mockResolvedValue([1]);
    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    const result = await accountRepository.updateLastLogin(1, lastLogin);

    expect(Account.update).toHaveBeenCalledWith(
      { last_login: lastLogin },
      {
        where: { id_account: 1 },
        transaction: undefined,
      }
    );
    expect(result).toEqual(mockAccount);
  });

  it('actualiza last_login con transacción', async () => {
    const mockTransaction = { id: 'tx4' };
    const lastLogin = new Date();
    const mockAccount = { id_account: 1, last_login: lastLogin };

    Account.update.mockResolvedValue([1]);
    Account.findOne.mockResolvedValue(mockAccount);
    toAccount.mockReturnValue(mockAccount);

    await accountRepository.updateLastLogin(1, lastLogin, {
      transaction: mockTransaction,
    });

    expect(Account.update).toHaveBeenCalledWith(
      { last_login: lastLogin },
      {
        where: { id_account: 1 },
        transaction: mockTransaction,
      }
    );
  });
});

describe('account-repository findRoleByName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('encuentra un rol por nombre', async () => {
    const mockRole = { id_role: 1, role_name: 'USER' };

    Role.findOne.mockResolvedValue(mockRole);
    toRole.mockReturnValue(mockRole);

    const result = await accountRepository.findRoleByName('USER');

    expect(Role.findOne).toHaveBeenCalledWith({
      where: { role_name: 'USER' },
      transaction: undefined,
    });
    expect(toRole).toHaveBeenCalledWith(mockRole);
    expect(result).toEqual(mockRole);
  });

  it('encuentra un rol con transacción', async () => {
    const mockTransaction = { id: 'tx5' };
    const mockRole = { id_role: 2, role_name: 'ADMIN' };

    Role.findOne.mockResolvedValue(mockRole);
    toRole.mockReturnValue(mockRole);

    await accountRepository.findRoleByName('ADMIN', {
      transaction: mockTransaction,
    });

    expect(Role.findOne).toHaveBeenCalledWith({
      where: { role_name: 'ADMIN' },
      transaction: mockTransaction,
    });
  });

  it('retorna null cuando no encuentra el rol', async () => {
    Role.findOne.mockResolvedValue(null);
    toRole.mockReturnValue(null);

    const result = await accountRepository.findRoleByName('NONEXISTENT');

    expect(result).toBeNull();
  });
});

describe('account-repository linkRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('vincula un rol a una cuenta', async () => {
    AccountRole.findOrCreate.mockResolvedValue([
      { id_account: 1, id_role: 1 },
      true,
    ]);

    await accountRepository.linkRole(1, 1);

    expect(AccountRole.findOrCreate).toHaveBeenCalledWith({
      where: {
        id_account: 1,
        id_role: 1,
      },
      defaults: {
        id_account: 1,
        id_role: 1,
      },
      transaction: undefined,
    });
  });

  it('vincula un rol con transacción', async () => {
    const mockTransaction = { id: 'tx6' };

    AccountRole.findOrCreate.mockResolvedValue([
      { id_account: 2, id_role: 3 },
      false,
    ]);

    await accountRepository.linkRole(2, 3, { transaction: mockTransaction });

    expect(AccountRole.findOrCreate).toHaveBeenCalledWith({
      where: {
        id_account: 2,
        id_role: 3,
      },
      defaults: {
        id_account: 2,
        id_role: 3,
      },
      transaction: mockTransaction,
    });
  });

  it('no crea duplicado si la relación ya existe (findOrCreate)', async () => {
    AccountRole.findOrCreate.mockResolvedValue([
      { id_account: 1, id_role: 1 },
      false, // segundo elemento false indica que no fue creado
    ]);

    await accountRepository.linkRole(1, 1);

    expect(AccountRole.findOrCreate).toHaveBeenCalled();
  });
});
