/**
 * Epigram related types
 */

/**
 * Complete epigram data
 */
export interface Epigram {
  id: number;
  text: string;
  author?: string;
  status: EpigramStatus;
  client_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Epigram creation data
 */
export interface EpigramCreate {
  text: string;
  author?: string;
}

/**
 * Epigram data returned from API
 */
export interface EpigramRead {
  id: number;
  text: string;
  author?: string;
  status: EpigramStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Epigram status enum
 */
export enum EpigramStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
}
