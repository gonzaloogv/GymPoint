const { RefreshToken } = require('../../../models');
const { toRefreshToken } = require('../../db/mappers/refresh-token.mapper');

async function createRefreshToken(payload, options = {}) {
  const token = await RefreshToken.create(payload, {
    transaction: options.transaction,
  });
  return toRefreshToken(token);
}

async function findByToken(token, options = {}) {
  const refreshToken = await RefreshToken.findOne({
    where: { token },
    transaction: options.transaction,
  });
  return toRefreshToken(refreshToken);
}

async function findActiveByToken(token, options = {}) {
  const refreshToken = await RefreshToken.findOne({
    where: { token, is_revoked: false },
    transaction: options.transaction,
  });
  return toRefreshToken(refreshToken);
}

async function revokeByToken(token, options = {}) {
  await RefreshToken.update(
    { is_revoked: true },
    {
      where: { token },
      transaction: options.transaction,
    }
  );
}

async function revokeById(idRefreshToken, options = {}) {
  await RefreshToken.update(
    { is_revoked: true },
    {
      where: { id_refresh_token: idRefreshToken },
      transaction: options.transaction,
    }
  );
}

async function revokeAllByAccount(idAccount, options = {}) {
  await RefreshToken.update(
    { is_revoked: true },
    {
      where: { id_account: idAccount },
      transaction: options.transaction,
    }
  );
}

module.exports = {
  createRefreshToken,
  findByToken,
  findActiveByToken,
  revokeByToken,
  revokeById,
  revokeAllByAccount,
};
