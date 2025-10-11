export interface Epigram {
  id: number;
  text: string;
  author?: string;
  status: EpigramStatus;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface EpigramCreate {
  text: string;
  author?: string;
}

export interface EpigramRead {
  id: number;
  text: string;
  author?: string;
  status: EpigramStatus;
  created_at: string;
  updated_at: string;
}

export enum EpigramStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export interface ApiError {
  detail: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
