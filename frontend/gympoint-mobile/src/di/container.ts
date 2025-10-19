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
import { RoutineLocal } from '@features/routines/data/datasources/RoutineLocal';
import { GetRoutines } from '@features/routines/domain/usecases/GetRoutines';
import { GetRoutineById } from '@features/routines/domain/usecases/GetRoutineById';
import { ExecuteRoutine } from '@features/routines/domain/usecases/ExecuteRoutine';
import { GetRoutineHistory } from '@features/routines/domain/usecases/GetRoutineHistory';

// ===== Rewards =====
import { RewardRepository } from '@features/rewards/domain/repositories/RewardRepository';
import { RewardRepositoryImpl } from '@features/rewards/data/RewardRepositoryImpl';
import { RewardLocal } from '@features/rewards/data/datasources/RewardLocal';
import { GetAvailableRewards } from '@features/rewards/domain/usecases/GetAvailableRewards';
import { GenerateRewardCode } from '@features/rewards/domain/usecases/GenerateRewardCode';
import { GetGeneratedCodes } from '@features/rewards/domain/usecases/GetGeneratedCodes';

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

// ===== Progress =====
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
  routineLocal: RoutineLocal;
  routineRepository: RoutineRepository;
  getRoutines: GetRoutines;
  getRoutineById: GetRoutineById;
  executeRoutine: ExecuteRoutine;
  getRoutineHistory: GetRoutineHistory;

  // Rewards
  rewardLocal: RewardLocal;
  rewardRepository: RewardRepository;
  getAvailableRewards: GetAvailableRewards;
  generateRewardCode: GenerateRewardCode;
  getGeneratedCodes: GetGeneratedCodes;

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

  // Progress
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
    this.routineLocal = new RoutineLocal();
    this.routineRepository = new RoutineRepositoryImpl(this.routineLocal);
    this.getRoutines = new GetRoutines(this.routineRepository);
    this.getRoutineById = new GetRoutineById(this.routineRepository);
    this.executeRoutine = new ExecuteRoutine(this.routineRepository);
    this.getRoutineHistory = new GetRoutineHistory(this.routineRepository);

    // Rewards
    this.rewardLocal = new RewardLocal();
    this.rewardRepository = new RewardRepositoryImpl(this.rewardLocal);
    this.getAvailableRewards = new GetAvailableRewards(this.rewardRepository);
    this.generateRewardCode = new GenerateRewardCode(this.rewardRepository);
    this.getGeneratedCodes = new GetGeneratedCodes(this.rewardRepository);

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

    // Progress
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
  }
}

// 👇 export NOMBRE → import con llaves { DI }
export const DI = new Container();
