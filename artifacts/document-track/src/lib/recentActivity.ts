import type { Service } from '../data/services';

export type RecentActivity = {
  serviceId: string;
  serviceName: string;
  department: string;
  officialPortalUrl: string;
  visitedAt: string;
};

const STORAGE_KEY = 'documenttrack_recent_activity';
const MAX_ACTIVITIES = 10;

export function getRecentActivity(): RecentActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((item): RecentActivity[] => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Partial<RecentActivity>;
      if (
        typeof record.serviceId !== 'string' ||
        typeof record.serviceName !== 'string' ||
        typeof record.department !== 'string' ||
        typeof record.officialPortalUrl !== 'string' ||
        typeof record.visitedAt !== 'string'
      ) {
        return [];
      }
      return [{
        serviceId: record.serviceId,
        serviceName: record.serviceName,
        department: record.department,
        officialPortalUrl: record.officialPortalUrl,
        visitedAt: record.visitedAt,
      }];
    });
  } catch {
    return [];
  }
}

/** Records a service portal visit. Re-visiting updates the timestamp and moves it to the top. */
export function addRecentActivity(service: Service): void {
  const entry: RecentActivity = {
    serviceId: service.id,
    serviceName: service.name,
    department: service.department,
    officialPortalUrl: service.officialPortalUrl,
    visitedAt: new Date().toISOString(),
  };
  const rest = getRecentActivity().filter((item) => item.serviceId !== service.id);
  const updated = [entry, ...rest].slice(0, MAX_ACTIVITIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage unavailable (e.g. private mode); activity simply isn't persisted.
  }
}
