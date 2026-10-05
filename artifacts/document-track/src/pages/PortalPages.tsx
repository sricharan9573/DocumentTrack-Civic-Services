import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Check, Trash2 } from 'lucide-react';
import { services } from '../data/services';
import { useApp } from '../context/AppContext';
import {
  EmptyState,
  Notice,
  PortalButton,
  ServiceIcon,
  StatusBadge,
  StatusModal,
} from '../components/shared';

const transparencyNotice =
  'DocumentTrack does not submit applications to government departments or access government systems directly. Applications are submitted through official government portals. Use the official portal link above to apply or check your status.';

function serviceTransparencyNotice(serviceId: string, hasPortal: boolean) {
  if (serviceId === 'birth-certificate') {
    return 'DocumentTrack does not submit applications to government departments or access government systems directly. The government-services directory can help you find the appropriate location-specific service; it is not a direct application or tracking portal.';
  }
  if (!hasPortal) {
    return 'DocumentTrack does not submit applications to government departments or access government systems directly. No verified portal link is configured for this location-dependent service.';
  }
  return transparencyNotice;
}

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = services.find((item) => item.id === serviceId);

  if (!service) {
    return (
      <div className="page">
        <EmptyState
          title="Service guide not found"
          description="This service may have been removed from the demo catalogue."
          action="Browse services"
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="eyebrow">
        <Link href="/services">Services</Link> / {service.category}
      </div>
      <div style={{ display: 'flex', gap: 17, alignItems: 'center', marginTop: 15 }}>
        <div className="service-icon" style={{ width: 58, height: 58 }}>
          <ServiceIcon name={service.icon} size={27} />
        </div>
        <div>
          <h1 style={{ margin: '0 0 5px' }}>{service.name}</h1>
          <div className="muted" style={{ fontSize: 13 }}>
            {service.department} · {service.category}
          </div>
        </div>
      </div>
      <p className="lead" style={{ marginTop: 20 }}>{service.description}</p>

      <div className="detail-layout" style={{ marginTop: 27 }}>
        <div>
          <section className="card detail-block">
            <div className="eyebrow">01 · Overview</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>About this service</h2>
            <p>{service.description} Service procedures depend on your location and individual circumstances.</p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">02 · Eligibility</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>Who may apply</h2>
            <p>{service.eligibility}</p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">03 · Prepare</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>Common documents</h2>
            <ul className="check-list">
              {service.requiredDocuments.map((document) => (
                <li key={document}><Check size={17} />{document}</li>
              ))}
            </ul>
            <p className="small" style={{ marginTop: 16 }}>
              This is a general guide. Check the exact checklist with the relevant authority before applying.
            </p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">04 · Fees and timing</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>What to expect</h2>
            <div style={{ display: 'flex', gap: 35, flexWrap: 'wrap' }}>
              <div><div className="small muted">Application fee</div><strong>{service.fee}</strong></div>
              <div><div className="small muted">Typical processing</div><strong>{service.processingTime}</strong></div>
            </div>
            <p className="small" style={{ marginTop: 15 }}>
              These figures are not universal or guaranteed. Current rules and fees vary by state and department.
            </p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">05 · Application process</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>Apply through the relevant authority</h2>
            <p>
              Review current instructions with the issuing department, submit your application through its official
              portal or an authorized service channel, and save the reference number you receive.
            </p>
          </section>
          <Notice>{serviceTransparencyNotice(service.id, Boolean(service.officialPortalUrl))}</Notice>
        </div>

        <aside className="detail-aside">
          <div className="card detail-block">
            <div className="eyebrow">NEXT STEPS</div>
            <h3 style={{ marginTop: 10 }}>Continue when ready</h3>
            <p>
              {service.portalActionLabel === 'Open Government Services'
                ? 'DocumentTrack does not submit or process your application. Open the government-services directory to find the appropriate local service.'
                : 'DocumentTrack does not submit or process your government application. Continue to the official government portal to apply.'}
            </p>
            <PortalButton
              url={service.officialPortalUrl}
              label={service.portalActionLabel}
              disabledLabel={service.portalActionLabel}
              className="btn btn-primary"
              testId={`button-apply-${service.id}`}
            />
            <Link
              href={`/applications/add?service=${service.id}`}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: 10 }}
              data-testid="button-add-application"
            >
              Already applied? Add record
            </Link>
            <div style={{ height: 1, background: '#edf0f4', margin: '18px 0' }} />
            <div className="small muted">Official Portal</div>
            <strong className="small" style={{ display: 'block', marginTop: 5 }}>
              {service.portalLabel}
            </strong>
            <p className="small muted" style={{ margin: '8px 0 12px' }}>{service.portalNote}</p>
            <PortalButton
              url={service.officialPortalUrl}
              label={service.portalActionLabel === 'Open Government Services' ? 'Open Government Services' : 'Open Official Portal'}
              disabledLabel={service.portalActionLabel}
              className="btn btn-secondary"
              testId={`button-open-portal-${service.id}`}
            />
          </div>
          <div className="small muted" style={{ padding: '0 5px' }}>
            Confirm current eligibility and requirements with the relevant department before applying.
          </div>
        </aside>
      </div>
    </div>
  );
}

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { applications, deleteApplication } = useApp();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const application = applications.find((item) => item.id === applicationId);
  const service = services.find((item) => item.id === application?.serviceId);

  if (!application) {
    return (
      <div className="page">
        <EmptyState
          title="Application record not found"
          description="This record may have been removed from this device."
          action="View all applications"
          href="/applications"
        />
      </div>
    );
  }

  const orderedHistory = [...application.statusHistory].sort(
    (left, right) => left.changedAt.localeCompare(right.changedAt),
  );
  const trackingUrl = application.trackingUrl || service?.trackingUrl || '';
  const trackingUnavailableLabel =
    service?.trackingUnavailableLabel || 'Official portal varies by location.';

  return (
    <div className="page">
      <div className="eyebrow">
        <Link href="/applications">My applications</Link> / Record details
      </div>
      <div className="section-heading" style={{ marginTop: 10 }}>
        <div>
          <h1>{service?.name || 'Application record'}</h1>
          <p>Reference {application.applicationNumber} · Status managed by you</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="detail-layout">
        <div>
          <section className="card detail-block">
            <div className="eyebrow">Status history</div>
            <h2 style={{ fontSize: 23, marginTop: 8 }}>Your timeline</h2>
            <p>Status shown here is manually updated by the citizen and does not represent live government data.</p>
            <div className="timeline" style={{ marginTop: 26 }}>
              {orderedHistory.map((event, index) => (
                <div
                  className={`timeline-item ${index === orderedHistory.length - 1 ? 'current' : 'complete'}`}
                  key={event.id}
                >
                  <span className="timeline-dot" />
                  <strong>{event.status}</strong>
                  <p>
                    {new Date(event.changedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {' · Updated by you'}
                    {event.remarks ? ` — ${event.remarks}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">Personal notes</div>
            <p style={{ marginTop: 10 }}>{application.notes || 'No personal notes added.'}</p>
          </section>
        </div>

        <aside className="detail-aside">
          <section className="card detail-block">
            <div className="eyebrow">Application information</div>
            <div style={{ display: 'grid', gap: 15, marginTop: 17 }}>
              {[
                ['Application ID', application.id],
                ['Service', service?.name || '—'],
                ['Department', service?.department || '—'],
                ['Application number', application.applicationNumber],
                ['Current status', application.status],
                ['Application date', new Date(`${application.applicationDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                ['Last updated', new Date(application.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="small muted">{label}</div>
                  <strong style={{ fontSize: 13 }}>{value}</strong>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 9, marginTop: 21 }}>
              <PortalButton
                url={trackingUrl}
                label="Track on Official Portal"
                disabledLabel={trackingUnavailableLabel}
                className="btn btn-primary"
                testId={`button-track-application-detail-${application.id}`}
              />
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(true)}
                data-testid="button-detail-update-status"
              >
                Update status
              </button>
              <Link
                href={`/applications/${application.id}/edit`}
                className="btn btn-secondary"
                data-testid="button-edit-application"
              >
                Edit application
              </Link>
              <button
                className="btn btn-danger"
                onClick={() => setConfirm(true)}
                data-testid="button-delete-application"
              >
                <Trash2 size={15} /> Delete application
              </button>
            </div>
          </section>
          <Notice>
            {trackingUrl
              ? transparencyNotice
              : 'DocumentTrack does not submit applications to government departments or access government systems directly. No verified tracking portal is configured for this location-dependent service. Status shown here is manually updated by the citizen and does not represent live government data.'}
          </Notice>
        </aside>
      </div>

      {editing && <StatusModal application={application} onClose={() => setEditing(false)} />}
      {confirm && (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="eyebrow">Remove personal record</div>
            <h2 id="delete-title" style={{ marginTop: 8 }}>Delete this application?</h2>
            <p>This permanently removes the application record and status history from this browser’s local data.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirm(false)}>Keep record</button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteApplication(application.id);
                  setLocation('/applications');
                }}
                data-testid="button-confirm-delete"
              >
                Delete record
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
