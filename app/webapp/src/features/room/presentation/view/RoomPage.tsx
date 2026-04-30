import { useEffect, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSharedFlow, useStateFlow, useViewModel, type PropsWithVM } from '@kvt/react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@core/design-system'
import { PrejoinModal } from '@features/prejoin/presentation/view/PrejoinModal'
import { SettingsModalHost } from '@features/settings/presentation/view/SettingsModal'
import { RoomViewModel } from '../view_model/RoomViewModel'
import { ConferenceStage } from './ConferenceStage'
import { RoomBottomChrome } from './RoomBottomChrome'
import { RoomErrorState } from './RoomErrorState'
import { RoomFloatingPanel } from './RoomFloatingPanel'
import { RoomChatPanel } from './chat/RoomChatPanel'
import { downloadTextFile } from './download-text-file'

export function RoomPage({ _vm = RoomViewModel }: PropsWithVM<RoomViewModel>): ReactNode {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()
  const viewModel = useViewModel(_vm, { key: `room:${roomId}` })
  const uiState = useStateFlow(viewModel.uiState)
  const toasts = useToast()
  const { t } = useTranslation('voice')

  useEffect(() => {
    viewModel.onEvent({ type: 'room-opened', roomId })
  }, [roomId, viewModel])

  useSharedFlow(viewModel.uiEffect, (effect) => {
    switch (effect.type) {
      case 'navigate-home':
        void navigate('/')
        break
      case 'show-toast':
        toasts.toast(t(effect.message))
        break
      case 'download-logs':
        downloadTextFile(effect.fileName, effect.content)
        toasts.info(t('room.toasts.logsConsole'))
        break
    }
  })

  return (
    <section className="relative mx-auto flex min-h-screen w-full flex-col px-2 py-2 sm:px-3 md:px-4">
      {uiState.error ? (
        <RoomErrorState
          actionLabel={t(uiState.error.actionLabel)}
          description={t(uiState.error.description)}
          title={t(uiState.error.title)}
          onAction={() => viewModel.onEvent({ type: 'go-home-pressed' })}
        />
      ) : (
        <>
          <div className="grid min-h-0 flex-1 gap-3 pb-8 transition-[grid-template-columns] duration-300 lg:grid-cols-[minmax(0,1fr)_auto]">
            <ConferenceStage
              key={`stage:${roomId}`}
              localMediaStreams={uiState.localMediaStreams}
              localParticipantId={uiState.localParticipantId}
              participants={uiState.participants}
              pinnedTileId={uiState.pinnedTileId}
              remoteMediaStreams={uiState.remoteMediaStreams}
              speakingParticipantIds={uiState.speakingParticipantIds}
              t={t}
              onPin={(tileId) => viewModel.onEvent({ type: 'tile-pin-toggled', tileId })}
            />
            {uiState.chat.open && (
              <RoomChatPanel
                chat={uiState.chat}
                localParticipantId={uiState.localParticipantId}
                t={t}
                onDraftChange={(value) => viewModel.onEvent({ type: 'chat-draft-changed', value })}
                onReaction={(messageId, emoji) =>
                  viewModel.onEvent({ type: 'chat-reaction-toggled', messageId, emoji })
                }
                onReply={(messageId) =>
                  viewModel.onEvent({ type: 'chat-reply-started', messageId })
                }
                onReplyCancel={() => viewModel.onEvent({ type: 'chat-reply-cancelled' })}
                onSend={() => viewModel.onEvent({ type: 'chat-message-sent' })}
                onFileSelected={(file) =>
                  viewModel.onEvent({ type: 'chat-file-selected', file })
                }
              />
            )}
          </div>

          <RoomFloatingPanel
            activePanel={uiState.activePanel === 'chat' ? null : uiState.activePanel}
            actionStatus={uiState.actionStatus}
            diagnostics={uiState.diagnostics}
            participantCount={uiState.participants.length}
            participants={uiState.participants}
            roomId={uiState.roomId}
            status={uiState.status}
            t={t}
            onClearLogs={() => viewModel.onEvent({ type: 'clear-logs-pressed' })}
            onClose={() => viewModel.onEvent({ type: 'panel-closed' })}
            onExportLogs={() => viewModel.onEvent({ type: 'export-logs-pressed' })}
          />

          <RoomBottomChrome
            activePanel={uiState.activePanel}
            cameraEnabled={uiState.camera.enabled}
            microphoneEnabled={uiState.microphone.enabled}
            roomId={uiState.roomId}
            screenEnabled={uiState.screenShare.enabled}
            t={t}
            onCamera={() => viewModel.onEvent({ type: 'camera-toggled' })}
            onCopy={() => viewModel.onEvent({ type: 'copy-link-pressed' })}
            onLeave={() => viewModel.onEvent({ type: 'leave-pressed' })}
            onMicrophone={() => viewModel.onEvent({ type: 'microphone-toggled' })}
            onPanelToggle={(panel) => viewModel.onEvent({ type: 'panel-toggled', panel })}
            onScreen={() => viewModel.onEvent({ type: 'screen-share-toggled' })}
            onSettings={() => viewModel.onEvent({ type: 'settings-opened' })}
          />
        </>
      )}

      <PrejoinModal
        open={uiState.prejoinOpen && Boolean(uiState.roomId)}
        role="host"
        roomId={uiState.roomId}
        onJoined={() => viewModel.onEvent({ type: 'prejoin-completed' })}
      />
      <SettingsModalHost
        open={uiState.settingsOpen}
        viewModelKey={`settings:room:${roomId}`}
        onClose={() => viewModel.onEvent({ type: 'settings-closed' })}
      />
    </section>
  )
}
