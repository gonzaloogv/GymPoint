// ===== Auth (ya existente) =====
import { AuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { AuthRepositoryImpl } from '@features/auth/data/AuthRepositoryImpl';
import { LoginUser } from '@features/auth/domain/usecases/LoginUser';
import { GetMe } from '@features/auth/domain/usecases/GetMe';
import { RegisterUser } from '@features/auth/domain/usecases/RegisterUser';

// ===== Gyms (ya existente) =====
import { GymRepository } from '@features/gyms/domain/repositories/GymRepository';
import { GymRepositoryImpl } from '@features/gyms/data/GymRepositoryImpl';
import { ListNearbyGyms } from '@features/gyms/domain/usecases/ListNearbyGyms';

// ===== Schedules (NUEVO) =====
import { ScheduleRepository } from '@features/gyms/domain/repositories/ScheduleRepository';
import { ScheduleRepositoryImpl } from '@features/gyms/data/ScheduleRepositoryImpl';
import { GetSchedulesForGyms } from '@features/gyms/domain/usecases/GetSchedulesForGyms';

// ===== Routines =====
import { RoutineRepository } from '@features/routines/domain/repositories/RoutineRepository';
import { RoutineRepositoryImpl } from '@features/routines/data/RoutineRepositoryImpl';
import { GetRoutines } from '@features/routines/domain/usecases/GetRoutines';
import { GetRoutineById } from '@features/routines/domain/usecases/GetRoutineById';
import { ExecuteRoutine } from '@features/routines/domain/usecases/ExecuteRoutine';
import { GetRoutineHistory } from '@features/routines/domain/usecases/GetRoutineHistory';

// ===== Rewards =====
import { RewardRepository } from '@features/rewards/domain/repositories/RewardRepository';
import { RewardRepositoryImpl } from '@features/rewards/data/RewardRepositoryImpl';
import { RewardRemote } from '@features/rewards/data/reward.remote';
import { RewardLocal } from '@features/rewards/data/datasources/RewardLocal';
import { GetAvailableRewards } from '@features/rewards/domain/usecases/GetAvailableRewards';
import { GetRewardInventory } from '@features/rewards/domain/usecases/GetRewardInventory';
import { GetActiveRewardEffects } from '@features/rewards/domain/usecases/GetActiveRewardEffects';
import { GenerateRewardCode } from '@features/rewards/domain/usecases/GenerateRewardCode';
import { GetGeneratedCodes } from '@features/rewards/domain/usecases/GetGeneratedCodes';
import { ClaimReward } from '@features/rewards/domain/usecases/ClaimReward';
import { GetClaimedRewards } from '@features/rewards/domain/usecases/GetClaimedRewards';
import { MarkClaimedRewardAsUsed } from '@features/rewards/domain/usecases/MarkClaimedRewardAsUsed';

// ===== Home =====
import { HomeRepository } from '@features/home/domain/repositories/HomeRepository';
import { HomeRepositoryImpl } from '@features/home/data/HomeRepositoryImpl';
import { GetHomeStats } from '@features/home/domain/usecases/GetHomeStats';
import { GetWeeklyProgress } from '@features/home/domain/usecases/GetWeeklyProgress';
import { GetDailyChallenge } from '@features/home/domain/usecases/GetDailyChallenge';

// ===== User =====
import { UserRepository } from '@features/user/domain/repositories/UserRepository';
import { UserRepositoryImpl } from '@features/user/data/UserRepositoryImpl';
import { GetUserProfile } from '@features/user/domain/usecases/GetUserProfile';
import { UpdateUserSettings } from '@features/user/domain/usecases/UpdateUserSettings';
import { UpgradeToPremium } from '@features/user/domain/usecases/UpgradeToPremium';

// ===== Achievements =====
import { AchievementRepository } from '@features/progress/domain/repositories/AchievementRepository';
import { AchievementRepositoryImpl } from '@features/progress/data/AchievementRepositoryImpl';
import { AchievementRemote } from '@features/progress/data/achievement.remote';
import { GetAchievements } from '@features/progress/domain/useCases/GetAchievements';
import { SyncAchievements } from '@features/progress/domain/useCases/SyncAchievements';
import { UnlockAchievement } from '@features/progress/domain/useCases/UnlockAchievement';

// ===== Tokens =====
import { TokenRepository } from '@features/tokens/domain/repositories/TokenRepository';
import { TokenRepositoryImpl } from '@features/tokens/data/TokenRepositoryImpl';
import { TokenRemote } from '@features/tokens/data/token.remote';
import { GetTokenHistory } from '@features/tokens/domain/useCases/GetTokenHistory';
import { GetTokenBalance } from '@features/tokens/domain/useCases/GetTokenBalance';

/* ===== Progress =====
import { ProgressRepository } from '@features/progress/domain/repositories/ProgressRepository';
import { ProgressRepositoryImpl } from '@features/progress/data/ProgressRepositoryImpl';
import { ProgressLocal } from '@features/progress/data/datasources/ProgressLocal';
import { GetProgress } from '@features/progress/domain/usecases/GetProgress';
import { ExerciseProgressRepository } from '@features/progress/domain/repositories/ExerciseProgressRepository';
import { ExerciseProgressRepositoryImpl } from '@features/progress/data/ExerciseProgressRepositoryImpl';
import { ExerciseProgressLocal } from '@features/progress/data/datasources/ExerciseProgressLocal';
import { GetExerciseProgress } from '@features/progress/domain/usecases/GetExerciseProgress';
import { AchievementRepository } from '@features/progress/domain/repositories/AchievementRepository';
import { AchievementRepositoryImpl } from '@features/progress/data/AchievementRepositoryImpl';
import { AchievementLocal } from '@features/progress/data/datasources/AchievementLocal';
import { GetAchievements } from '@features/progress/domain/usecases/GetAchievements';
import { TokenHistoryRepository } from '@features/progress/domain/repositories/TokenHistoryRepository';
import { TokenHistoryRepositoryImpl } from '@features/progress/data/TokenHistoryRepositoryImpl';
import { TokenHistoryLocal } from '@features/progress/data/datasources/TokenHistoryLocal';
import { GetTokenHistory } from '@features/progress/domain/usecases/GetTokenHistory';
*/
class Container {
  // Auth
  authRepository: AuthRepository;
  loginUser: LoginUser;
  getMe: GetMe;
  registerUser: RegisterUser;

  // Gyms
  gymRepository: GymRepository;
  listNearbyGyms: ListNearbyGyms;

  // Schedules
  scheduleRepository: ScheduleRepository;
  getSchedulesForGyms: GetSchedulesForGyms;

  // Routines
  routineRepository: RoutineRepository;
  getRoutines: GetRoutines;
  getRoutineById: GetRoutineById;
  executeRoutine: ExecuteRoutine;
  getRoutineHistory: GetRoutineHistory;

  // Rewards
  rewardRemote: RewardRemote;
  rewardLocal: RewardLocal;
  rewardRepository: RewardRepository;
  getAvailableRewards: GetAvailableRewards;
  getRewardInventory: GetRewardInventory;
  getActiveRewardEffects: GetActiveRewardEffects;
  generateRewardCode: GenerateRewardCode;
  getGeneratedCodes: GetGeneratedCodes;
  claimReward: ClaimReward;
  getClaimedRewards: GetClaimedRewards;
  markClaimedRewardAsUsed: MarkClaimedRewardAsUsed;

  // Home
  homeRepository: HomeRepository;
  getHomeStats: GetHomeStats;
  getWeeklyProgress: GetWeeklyProgress;
  getDailyChallenge: GetDailyChallenge;

  // User
  userRepository: UserRepository;
  getUserProfile: GetUserProfile;
  updateUserSettings: UpdateUserSettings;
  upgradeToPremium: UpgradeToPremium;

  // Achievements
  achievementRemote: AchievementRemote;
  achievementRepository: AchievementRepository;
  getAchievements: GetAchievements;
  syncAchievements: SyncAchievements;
  unlockAchievement: UnlockAchievement;

  // Tokens
  tokenRemote: TokenRemote;
  tokenRepository: TokenRepository;
  getTokenHistory: GetTokenHistory;
  getTokenBalance: GetTokenBalance;

  /* Progress
  progressLocal: ProgressLocal;
  progressRepository: ProgressRepository;
  getProgress: GetProgress;
  exerciseProgressLocal: ExerciseProgressLocal;
  exerciseProgressRepository: ExerciseProgressRepository;
  getExerciseProgress: GetExerciseProgress;
  achievementLocal: AchievementLocal;
  achievementRepository: AchievementRepository;
  getAchievements: GetAchievements;
  tokenHistoryLocal: TokenHistoryLocal;
  tokenHistoryRepository: TokenHistoryRepository;
  getTokenHistory: GetTokenHistory;
*/
  constructor() {
    // Auth
    this.authRepository = new AuthRepositoryImpl();
    this.loginUser = new LoginUser(this.authRepository);
    this.getMe = new GetMe(this.authRepository);
    this.registerUser = new RegisterUser(this.authRepository);

    // Gyms
    this.gymRepository = new GymRepositoryImpl();
    this.listNearbyGyms = new ListNearbyGyms(this.gymRepository);

    // Schedules (IMPORTANTE)
    this.scheduleRepository = new ScheduleRepositoryImpl();
    this.getSchedulesForGyms = new GetSchedulesForGyms(this.scheduleRepository);

    // Routines
    this.routineRepository = new RoutineRepositoryImpl();
    this.getRoutines = new GetRoutines(this.routineRepository);
    this.getRoutineById = new GetRoutineById(this.routineRepository);
    this.executeRoutine = new ExecuteRoutine(this.routineRepository);
    this.getRoutineHistory = new GetRoutineHistory(this.routineRepository);

    // Rewards
    this.rewardRemote = new RewardRemote();
    this.rewardLocal = new RewardLocal();
    this.rewardRepository = new RewardRepositoryImpl(this.rewardRemote, this.rewardLocal);
    this.getAvailableRewards = new GetAvailableRewards(this.rewardRepository);
    this.getRewardInventory = new GetRewardInventory(this.rewardRepository);
    this.getActiveRewardEffects = new GetActiveRewardEffects(this.rewardRepository);
    this.generateRewardCode = new GenerateRewardCode(this.rewardRepository);
    this.getGeneratedCodes = new GetGeneratedCodes(this.rewardRepository);
    this.claimReward = new ClaimReward(this.rewardRepository);
    this.getClaimedRewards = new GetClaimedRewards(this.rewardRepository);
    this.markClaimedRewardAsUsed = new MarkClaimedRewardAsUsed(this.rewardRepository);

    // Home
    this.homeRepository = new HomeRepositoryImpl();
    this.getHomeStats = new GetHomeStats(this.homeRepository);
    this.getWeeklyProgress = new GetWeeklyProgress(this.homeRepository);
    this.getDailyChallenge = new GetDailyChallenge(this.homeRepository);

    // User
    this.userRepository = new UserRepositoryImpl();
    this.getUserProfile = new GetUserProfile(this.userRepository);
    this.updateUserSettings = new UpdateUserSettings(this.userRepository);
    this.upgradeToPremium = new UpgradeToPremium(this.userRepository);

    // Achievements
    this.achievementRemote = new AchievementRemote();
    this.achievementRepository = new AchievementRepositoryImpl(this.achievementRemote);
    this.getAchievements = new GetAchievements(this.achievementRepository);
    this.syncAchievements = new SyncAchievements(this.achievementRepository);
    this.unlockAchievement = new UnlockAchievement(this.achievementRepository);

    // Tokens
    this.tokenRemote = new TokenRemote();
    this.tokenRepository = new TokenRepositoryImpl(this.tokenRemote);
    this.getTokenHistory = new GetTokenHistory(this.tokenRepository);
    this.getTokenBalance = new GetTokenBalance(this.tokenRepository);

    /* Progress
    this.progressLocal = new ProgressLocal();
    this.progressRepository = new ProgressRepositoryImpl(this.progressLocal);
    this.getProgress = new GetProgress(this.progressRepository);

    this.exerciseProgressLocal = new ExerciseProgressLocal();
    this.exerciseProgressRepository = new ExerciseProgressRepositoryImpl(this.exerciseProgressLocal);
    this.getExerciseProgress = new GetExerciseProgress(this.exerciseProgressRepository);

    this.achievementLocal = new AchievementLocal();
    this.achievementRepository = new AchievementRepositoryImpl(this.achievementLocal);
    this.getAchievements = new GetAchievements(this.achievementRepository);

    this.tokenHistoryLocal = new TokenHistoryLocal();
    this.tokenHistoryRepository = new TokenHistoryRepositoryImpl(this.tokenHistoryLocal);
    this.getTokenHistory = new GetTokenHistory(this.tokenHistoryRepository);
    */
  }
}

// 👇 export NOMBRE → import con llaves { DI }
export const DI = new Container();
