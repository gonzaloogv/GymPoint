function toPlain(instance) {
  if (!instance) {
    return null;
  }

  if (typeof instance.get === 'function') {
    return instance.get({ plain: true });
  }

  if (instance.dataValues) {
    return { ...instance.dataValues };
  }

  return instance;
}

module.exports = {
  toPlain,
};
