const { toPlain } = require('./utils');
const { toRoles } = require('./role.mapper');
const { toUserProfile } = require('./user-profile.mapper');

function toAdminProfile(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;
  return {
    id_admin_profile: plain.id_admin_profile,
    id_account: plain.id_account,
    department: plain.department || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };
}

function toAccount(instance) {
  const plain = toPlain(instance);
  if (!plain) return null;

  const account = {
    id_account: plain.id_account,
    email: plain.email,
    password_hash: plain.password_hash || null,
    auth_provider: plain.auth_provider,
    google_id: plain.google_id || null,
    email_verified: Boolean(plain.email_verified),
    email_verification_deadline: plain.email_verification_deadline || null,
    is_active: Boolean(plain.is_active),
    last_login: plain.last_login || null,
    created_at: plain.created_at || null,
    updated_at: plain.updated_at || null,
  };

  if (plain.roles) {
    account.roles = toRoles(plain.roles);
  }

  if (plain.userProfile) {
    account.userProfile = toUserProfile(plain.userProfile);
  }

  if (plain.adminProfile) {
    account.adminProfile = toAdminProfile(plain.adminProfile);
  }

  return account;
}

module.exports = {
  toAccount,
};
