import { AuthRepository } from '@features/auth/domain/repositories/AuthRepository';
import { AuthRepositoryImpl } from '@features/auth/data/AuthRepositoryImpl';
import { LoginUser } from '@features/auth/domain/usecases/LoginUser';
import { GetMe } from '@features/auth/domain/usecases/GetMe';


import { GymRepository } from '@features/gyms/domain/repositories/GymRepository';
import { GymRepositoryImpl } from '@features/gyms/data/GymRepositoryImpl';
import { ListNearbyGyms } from '@features/gyms/domain/usecases/ListNearbyGyms';


class Container {
authRepository: AuthRepository;
loginUser: LoginUser;
getMe: GetMe;


gymRepository: GymRepository;
listNearbyGyms: ListNearbyGyms;


constructor() {
this.authRepository = new AuthRepositoryImpl();
this.loginUser = new LoginUser(this.authRepository);
this.getMe = new GetMe(this.authRepository);


this.gymRepository = new GymRepositoryImpl();
this.listNearbyGyms = new ListNearbyGyms(this.gymRepository);
}
}


export const DI = new Container();