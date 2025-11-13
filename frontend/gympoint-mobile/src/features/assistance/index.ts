// Hooks
export { useCheckIn } from './presentation/hooks/useCheckIn';
export type { UseCheckInResult } from './presentation/hooks/useCheckIn';
export { useTodayCheckInStatus } from './presentation/hooks/useTodayCheckInStatus';
export type { TodayCheckInStatus } from './presentation/hooks/useTodayCheckInStatus';

// API
export { AssistanceRemote } from './data/assistance.remote';

// DTOs
export type {
  CheckInRequestDTO,
  CheckInResponseDTO,
  AssistanceDTO,
  AssistanceHistoryResponseDTO,
  CheckInError,
  TodayStatusResponseDTO,
} from './data/dto/assistance.api.dto';
