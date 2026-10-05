import { useState } from 'react';
import { Link } from 'wouter';
import { EmptyState, PageTitle, PortalButton, ServiceIcon } from '../components/shared';
import { services } from '../data/services';
import { getRecentActivity, type RecentActivity } from '../lib/recentActivity';

const formatVisited = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Visited recently';
  const day = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `Visited ${day}, ${time}`;
};

function ActivityRow({ activity }: { activity: RecentActivity }) {
  const service = services.find((item) => item.id === activity.serviceId);
  return (
    <div className="app-row" data-testid={`card-activity-${activity.serviceId}`}>
      <div className="app-mark"><ServiceIcon name={service?.icon || 'FileText'} size={19} /></div>
      <div className="app-main">
        <strong>{activity.serviceName}</strong>
        <div className="app-meta">
          {activity.department}<br />{formatVisited(activity.visitedAt)}
        </div>
      </div>
      <div className="app-actions">
        <PortalButton
          url={activity.officialPortalUrl}
          label="Visit Official Portal"
          className="btn btn-primary"
          service={service}
          testId={`button-visit-portal-${activity.serviceId}`}
        />
      </div>
    </div>
  );
}

export function RecentActivityPage() {
  const [activities] = useState(getRecentActivity);

  return (
    <div className="page">
      <PageTitle
        eyebrow="Your visit history"
        title="My Recent Activity"
        description="View the government services you recently visited."
      >
        <Link href="/services" className="btn btn-primary" data-testid="button-view-all-services">
          View All Services
        </Link>
      </PageTitle>
      {activities.length ? (
        <div className="card">
          {activities.slice(0, 10).map((activity) => (
            <ActivityRow key={activity.serviceId} activity={activity} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recent activity"
          description="Services you visit will appear here."
          action="Explore Services"
        />
      )}
      <p className="small muted" style={{ marginTop: 15 }}>
        Recent activity lists official portals you opened from this device. DocumentTrack does not
        submit applications or receive status from government systems.
      </p>
    </div>
  );
}
