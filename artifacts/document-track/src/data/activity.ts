export type ActivityType =
  | 'signup'
  | 'login'
  | 'logout'
  | 'service_view'
  | 'application_add'
  | 'official_portal_visit'
  | 'service_center_view'
  | 'search'
  | 'language_change';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
