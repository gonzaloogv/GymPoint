// ===== Auth (ya existente) =====
import { AuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { AuthRepositoryImpl } from '@features/auth/data/AuthRepositoryImpl';
import { LoginUser } from '@features/auth/domain/usecases/LoginUser';
import { GetMe } from '@features/auth/domain/usecases/GetMe';

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

class Container {
  // Auth
  authRepository: AuthRepository;
  loginUser: LoginUser;
  getMe: GetMe;

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

  constructor() {
    // Auth
    this.authRepository = new AuthRepositoryImpl();
    this.loginUser = new LoginUser(this.authRepository);
    this.getMe = new GetMe(this.authRepository);

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
  }
}

// 👇 export NOMBRE → import con llaves { DI }
export const DI = new Container();
