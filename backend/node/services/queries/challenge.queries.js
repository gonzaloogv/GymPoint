/**
 * Queries para Daily Challenges
 * Representan intenciones de lectura del estado del dominio de desafíos.
 */

class GetTodayChallengeQuery {
  constructor({ idUserProfile }) {
    this.idUserProfile = idUserProfile;
  }
}

class GetChallengeByIdQuery {
  constructor({ idChallenge }) {
    this.idChallenge = idChallenge;
  }
}

class ListChallengesQuery {
  constructor({
    page = 1,
    limit = 20,
    sortBy = 'challenge_date',
    order = 'DESC',
    startDate = null,
    endDate = null,
    challengeType = null,
    difficulty = null,
    isActive = null
  }) {
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
    this.startDate = startDate;
    this.endDate = endDate;
    this.challengeType = challengeType;
    this.difficulty = difficulty;
    this.isActive = isActive;
  }
}

class GetUserChallengeProgressQuery {
  constructor({ idUserProfile, idChallenge }) {
    this.idUserProfile = idUserProfile;
    this.idChallenge = idChallenge;
  }
}

class ListUserChallengesQuery {
  constructor({
    idUserProfile,
    page = 1,
    limit = 20,
    status = null
  }) {
    this.idUserProfile = idUserProfile;
    this.page = page;
    this.limit = limit;
    this.status = status;
  }
}

class GetChallengeTemplateByIdQuery {
  constructor({ idTemplate }) {
    this.idTemplate = idTemplate;
  }
}

class ListChallengeTemplatesQuery {
  constructor({
    page = 1,
    limit = 20,
    isActive = null
  }) {
    this.page = page;
    this.limit = limit;
    this.isActive = isActive;
  }
}

class GetChallengeSettingsQuery {
  constructor() {
    // No necesita parámetros, es un singleton
  }
}

module.exports = {
  GetTodayChallengeQuery,
  GetChallengeByIdQuery,
  ListChallengesQuery,
  GetUserChallengeProgressQuery,
  ListUserChallengesQuery,
  GetChallengeTemplateByIdQuery,
  ListChallengeTemplatesQuery,
  GetChallengeSettingsQuery
};
