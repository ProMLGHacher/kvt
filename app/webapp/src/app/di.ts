import { Module, createModuleFromClass } from '@kvt/core'
import { clientLogsModule } from '@capabilities/client-logs/di'
import { clipboardModule } from '@capabilities/clipboard/di'
import { conferenceAudioModule } from '@capabilities/conference-audio/di'
import { mediaModule } from '@capabilities/media/di'
import { rtcModule } from '@capabilities/rtc/di'
import { sessionModule } from '@capabilities/session/di'
import { userPreferencesModule } from '@capabilities/user-preferences/di'
import { voiceActivityModule } from '@capabilities/voice-activity/di'
import { roomCoreModule } from '@features/room/core-di'
import { settingsModule } from '@features/settings/di'

@Module({
  name: 'AppModule',
  includes: [
    clipboardModule,
    clientLogsModule,
    conferenceAudioModule,
    mediaModule,
    rtcModule,
    sessionModule,
    userPreferencesModule,
    voiceActivityModule,
    roomCoreModule,
    // Settings доступен и с главной, и из комнаты, поэтому живет в app-level DI.
    settingsModule
  ]
})
class AppModule {}

export const appModule = createModuleFromClass(AppModule)
