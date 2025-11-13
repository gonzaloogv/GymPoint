/**
 * Commands para Daily Challenges
 * Representan intenciones de modificación del estado del dominio de desafíos.
 */

class CreateDailyChallengeCommand {
  constructor({
    challengeDate,
    title,
    description,
    challengeType,
    targetValue,
    targetUnit,
    tokensReward,
    difficulty,
    idTemplate
  }) {
    this.challengeDate = challengeDate;
    this.title = title;
    this.description = description;
    this.challengeType = challengeType;
    this.targetValue = targetValue;
    this.targetUnit = targetUnit;
    this.tokensReward = tokensReward;
    this.difficulty = difficulty;
    this.idTemplate = idTemplate;
  }
}

class UpdateDailyChallengeCommand {
  constructor({
    idChallenge,
    title,
    description,
    challengeType,
    targetValue,
    targetUnit,
    tokensReward,
    difficulty,
    isActive
  }) {
    this.idChallenge = idChallenge;
    this.title = title;
    this.description = description;
    this.challengeType = challengeType;
    this.targetValue = targetValue;
    this.targetUnit = targetUnit;
    this.tokensReward = tokensReward;
    this.difficulty = difficulty;
    this.isActive = isActive;
  }
}

class StartChallengeCommand {
  constructor({ idUserProfile, idChallenge }) {
    this.idUserProfile = idUserProfile;
    this.idChallenge = idChallenge;
  }
}

class UpdateChallengeProgressCommand {
  constructor({
    idUserProfile,
    idChallenge,
    currentValue
  }) {
    this.idUserProfile = idUserProfile;
    this.idChallenge = idChallenge;
    this.currentValue = currentValue;
  }
}

class ClaimChallengeRewardCommand {
  constructor({ idUserProfile, idChallenge }) {
    this.idUserProfile = idUserProfile;
    this.idChallenge = idChallenge;
  }
}

class CreateChallengeTemplateCommand {
  constructor({
    name,
    description,
    challengeType,
    targetValue,
    targetUnit,
    tokensReward,
    difficulty,
    rotationWeight,
    isActive
  }) {
    this.name = name;
    this.description = description;
    this.challengeType = challengeType;
    this.targetValue = targetValue;
    this.targetUnit = targetUnit;
    this.tokensReward = tokensReward;
    this.difficulty = difficulty;
    this.rotationWeight = rotationWeight;
    this.isActive = isActive;
  }
}

class UpdateChallengeTemplateCommand {
  constructor({
    idTemplate,
    name,
    description,
    challengeType,
    targetValue,
    targetUnit,
    tokensReward,
    difficulty,
    rotationWeight,
    isActive
  }) {
    this.idTemplate = idTemplate;
    this.name = name;
    this.description = description;
    this.challengeType = challengeType;
    this.targetValue = targetValue;
    this.targetUnit = targetUnit;
    this.tokensReward = tokensReward;
    this.difficulty = difficulty;
    this.rotationWeight = rotationWeight;
    this.isActive = isActive;
  }
}

class UpdateChallengeSettingsCommand {
  constructor({
    enabledDays,
    autoGenerate,
    autoGenerateTime,
    defaultTokensReward
  }) {
    this.enabledDays = enabledDays;
    this.autoGenerate = autoGenerate;
    this.autoGenerateTime = autoGenerateTime;
    this.defaultTokensReward = defaultTokensReward;
  }
}

module.exports = {
  CreateDailyChallengeCommand,
  UpdateDailyChallengeCommand,
  StartChallengeCommand,
  UpdateChallengeProgressCommand,
  ClaimChallengeRewardCommand,
  CreateChallengeTemplateCommand,
  UpdateChallengeTemplateCommand,
  UpdateChallengeSettingsCommand
};
