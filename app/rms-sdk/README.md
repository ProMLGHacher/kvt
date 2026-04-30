# Kvatum RMS Browser SDK

Framework-agnostic browser SDK for Kvatum Realtime Media Service.

The package intentionally has no React, KVT, ViewModel, routing, localStorage or UI dependencies.
Product apps wrap it in their own clean architecture layer: repositories/use cases/ViewModels own app state,
while the SDK owns only WebRTC, signaling protocol, media slots and diagnostics.

## Public entrypoint

```ts
import { createKvatumRealtimeClient } from '@kvatum/rms-sdk'
```

The current v1 SDK exposes the low-level `ConferenceClient` contract used by the webapp adapter. Future
iterations should keep the SDK UI-agnostic and expand the high-level client facade instead of moving product
logic into the package.
