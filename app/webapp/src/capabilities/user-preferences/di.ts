import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { LocalStorageUserSettingsRepository } from './data/repository/LocalStorageUserSettingsRepository'
import { userSettingsRepositoryToken } from './domain/repository/tokens'
import { GetUserPreferencesUseCase } from './domain/usecases/GetUserPreferencesUseCase'
import { SaveDefaultCameraEnabledUseCase } from './domain/usecases/SaveDefaultCameraEnabledUseCase'
import { SaveDefaultMicEnabledUseCase } from './domain/usecases/SaveDefaultMicEnabledUseCase'
import { SaveDisplayNameUseCase } from './domain/usecases/SaveDisplayNameUseCase'
import { SavePreferredCameraUseCase } from './domain/usecases/SavePreferredCameraUseCase'
import { SavePreferredMicrophoneUseCase } from './domain/usecases/SavePreferredMicrophoneUseCase'
import type { UserSettingsRepository } from './domain/repository/UserSettingsRepository'

@Module({ name: 'UserPreferencesModule' })
class UserPreferencesModule {
  @Provides(userSettingsRepositoryToken)
  @Singleton({ lazy: true })
  static provideUserSettingsRepository(): UserSettingsRepository {
    return new LocalStorageUserSettingsRepository()
  }

  @Provides(GetUserPreferencesUseCase)
  static provideGetUserPreferencesUseCase(
    @Inject(userSettingsRepositoryToken) repository: UserSettingsRepository
  ) {
    return new GetUserPreferencesUseCase(repository)
  }

  @Provides(SaveDefaultCameraEnabledUseCase)
  static provideSaveDefaultCameraEnabledUseCase(
    @Inject(userSettingsRepositoryToken) repository: UserSettingsRepository
  ) {
    return new SaveDefaultCameraEnabledUseCase(repository)
  }

  @Provides(SaveDefaultMicEnabledUseCase)
  static provideSaveDefaultMicEnabledUseCase(
    @Inject(userSettingsRepositoryToken) repository: UserSettingsRepository
  ) {
    return new SaveDefaultMicEnabledUseCase(repository)
  }

  @Provides(SaveDisplayNameUseCase)
  static provideSaveDisplayNameUseCase(
    @Inject(userSettingsRepositoryToken) repository: UserSettingsRepository
  ) {
    return new SaveDisplayNameUseCase(repository)
  }

  @Provides(SavePreferredCameraUseCase)
  static provideSavePreferredCameraUseCase(
    @Inject(userSettingsRepositoryToken) repository: UserSettingsRepository
  ) {
    return new SavePreferredCameraUseCase(repository)
  }

  @Provides(SavePreferredMicrophoneUseCase)
  static provideSavePreferredMicrophoneUseCase(
    @Inject(userSettingsRepositoryToken) repository: UserSettingsRepository
  ) {
    return new SavePreferredMicrophoneUseCase(repository)
  }
}

export const userPreferencesModule = createModuleFromClass(UserPreferencesModule)
export default userPreferencesModule
