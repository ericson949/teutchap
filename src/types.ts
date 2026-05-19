export interface Photo {
  id: string;
  event_id: string;
  url_thumb: string;
  url_original?: string;
  challenge_id?: string | null;
  uploader_name?: string;
  contributor_name?: string;
  reaction_count?: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  event_id: string;
  title: string;
  created_at: string;
}

export interface Guest {
  id?: string;
  event_id?: string;
  pseudo: string;
  created_at?: string;
}

export interface EventData {
  id: string;
  name: string;
  token?: string;
  event_type?: string;
  event_date: string;
  status?: string;
  plan?: string;
  access_password?: string;
  auto_moderation?: boolean;
  allow_guest_challenges?: boolean;
  gamification_mode?: 'adaptive' | 'party' | 'sober' | 'off';
  enable_leaderboard?: boolean;
  enable_awards?: boolean;
  creator_device_id?: string;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  phase: 'before_start' | 'active' | 'finished';
  label: string;
}
