import { Inject, Module, Provides, ViewModelProvider, createModuleFromClass } from '@kvt/core'
import { RoomExistsByIdUseCase } from '@features/room/domain/usecases/RoomExistsByIdUseCase'
import { CreateRoomFlowUseCase } from './domain/usecases/CreateRoomFlowUseCase'
import { JoinRoomFlowUseCase } from './domain/usecases/JoinRoomFlowUseCase'
import { ValidateRoomIdInputUseCase } from './domain/usecases/ValidateRoomIdInputUseCase'
import { HomeViewModel } from './presentation/view_model/HomeViewModel'
import { CreateRoomUseCase } from '@features/room/domain/usecases/CreateRoomUseCase'

@Module({ name: 'HomeModule' })
class HomeModule {
  @Provides(CreateRoomFlowUseCase)
  static provideCreateRoomFlowUseCase(@Inject(CreateRoomUseCase) useCase: CreateRoomUseCase) {
    return new CreateRoomFlowUseCase(useCase)
  }

  @Provides(ValidateRoomIdInputUseCase)
  static provideValidateRoomIdInputUseCase() {
    return new ValidateRoomIdInputUseCase()
  }

  @Provides(JoinRoomFlowUseCase)
  static provideJoinRoomFlowUseCase(
    @Inject(ValidateRoomIdInputUseCase) validate: ValidateRoomIdInputUseCase,
    @Inject(RoomExistsByIdUseCase) exists: RoomExistsByIdUseCase
  ) {
    return new JoinRoomFlowUseCase(validate, exists)
  }

  @Provides(HomeViewModel)
  @ViewModelProvider()
  static provideHomeViewModel(
    @Inject(CreateRoomFlowUseCase) createRoom: CreateRoomFlowUseCase,
    @Inject(JoinRoomFlowUseCase) joinRoom: JoinRoomFlowUseCase
  ) {
    return new HomeViewModel(createRoom, joinRoom)
  }
}

export const homeModule = createModuleFromClass(HomeModule)
export default homeModule
