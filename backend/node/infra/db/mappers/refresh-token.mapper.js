const { toPlain } = require('./utils');

function toRefreshToken(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  return {
    id_refresh_token: plain.id_refresh_token,
    id_user: plain.id_user,
    token: plain.token,
    user_agent: plain.user_agent || '',
    ip_address: plain.ip_address || '',
    expires_at: plain.expires_at || null,
    revoked: Boolean(plain.revoked),
    revoked_at: plain.revoked_at || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

module.exports = {
  toRefreshToken,
};
