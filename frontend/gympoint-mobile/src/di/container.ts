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
  }
}

// 👇 export NOMBRE → import con llaves { DI }
export const DI = new Container();
