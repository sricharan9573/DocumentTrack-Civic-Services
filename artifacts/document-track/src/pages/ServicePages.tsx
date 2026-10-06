import { Link, useParams } from 'wouter';
import { Check } from 'lucide-react';
import { services, getTranslatedService } from '../data/services';
import { EmptyState, Notice, PortalButton, ServiceIcon } from '../components/shared';
import { useLanguage } from '../i18n/LanguageContext';

export function ServiceDetailPage() {
  const { t } = useLanguage();
  const { serviceId } = useParams<{ serviceId: string }>();
  const rawService = services.find((item) => item.id === serviceId);

  if (!rawService) {
    return (
      <div className="page">
        <EmptyState
          title={t('detail.notFoundTitle', 'Service guide not found')}
          description={t('detail.notFoundDesc', 'This service may have been removed from the demo catalogue.')}
          action={t('services.allCategories', 'Browse services')}
        />
      </div>
    );
  }

  const service = getTranslatedService(rawService, t);

  return (
    <div className="page">
      <div className="eyebrow">
        <Link href="/services">{t('nav.services', 'Services')}</Link> / {service.category}
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
            <div className="eyebrow">{t('detail.sec1Eyebrow', '01 · Overview')}</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>{t('detail.sec1Title', 'About this service')}</h2>
            <p>{service.description} {t('detail.sec1Note', 'Service procedures depend on your location and individual circumstances.')}</p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">{t('detail.sec2Eyebrow', '02 · Eligibility')}</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>{t('detail.sec2Title', 'Who may apply')}</h2>
            <p>{service.eligibility}</p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">{t('detail.sec3Eyebrow', '03 · Prepare')}</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>{t('detail.sec3Title', 'Common documents')}</h2>
            <ul className="check-list">
              {service.requiredDocuments.map((document) => (
                <li key={document}><Check size={17} />{document}</li>
              ))}
            </ul>
            <p className="small" style={{ marginTop: 16 }}>
              {t('detail.sec3Note', 'This is a general guide. Check the exact checklist with the relevant authority before applying.')}
            </p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">{t('detail.sec4Eyebrow', '04 · Fees and timing')}</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>{t('detail.sec4Title', 'What to expect')}</h2>
            <div style={{ display: 'flex', gap: 35, flexWrap: 'wrap' }}>
              <div>
                <div className="small muted">{t('detail.feeLabel', 'Application fee')}</div>
                <strong>{service.fee}</strong>
              </div>
              <div>
                <div className="small muted">{t('detail.processingLabel', 'Typical processing')}</div>
                <strong>{service.processingTime}</strong>
              </div>
            </div>
            <p className="small" style={{ marginTop: 15 }}>
              {t('detail.sec4Note', 'These figures are not universal or guaranteed. Current rules and fees vary by state and department.')}
            </p>
          </section>
          <section className="card detail-block">
            <div className="eyebrow">{t('detail.sec5Eyebrow', '05 · Application process')}</div>
            <h2 style={{ fontSize: 22, marginTop: 9 }}>{t('detail.sec5Title', 'Apply through the relevant authority')}</h2>
            <p>
              {t('detail.sec5Desc', 'Review current instructions with the issuing department, submit your application through its official portal or an authorized service channel, and save the reference number you receive.')}
            </p>
          </section>

          <Notice>
            {service.officialPortalUrl
              ? t('detail.transparencyPortal', 'DocumentTrack does not submit applications to government departments or access government systems directly. Applications are submitted through official government portals. Use the official portal link above to apply or check your status.')
              : t('detail.transparencyNoPortal', 'DocumentTrack does not submit applications to government departments or access government systems directly. No portal link is configured for this location-dependent service.')}
          </Notice>
        </div>

        <aside className="detail-aside">
          <div className="card detail-block">
            <div className="eyebrow">{t('detail.asideNextSteps', 'NEXT STEPS')}</div>
            <h3 style={{ marginTop: 10 }}>{t('detail.asideHeading', 'Continue when ready')}</h3>
            <p>
              {t('detail.asideDesc', 'DocumentTrack does not submit or process your government application. Continue to the official government portal to apply.')}
            </p>
            <PortalButton
              url={service.officialPortalUrl}
              label={service.portalActionLabel}
              disabledLabel={service.portalActionLabel}
              className="btn btn-primary"
              service={rawService}
              testId={`button-apply-${service.id}`}
            />
            <Link
              href={`/applications/add?service=${service.id}`}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: 10 }}
              data-testid="button-add-application"
            >
              {t('detail.alreadyApplied', 'Already applied? Add record')}
            </Link>
            <div style={{ height: 1, background: '#edf0f4', margin: '18px 0' }} />
            <div className="small muted">{t('detail.officialPortalLabel', 'Official Portal')}</div>
            <strong className="small" style={{ display: 'block', marginTop: 5 }}>
              {service.portalLabel}
            </strong>
            <p className="small muted" style={{ margin: '8px 0 12px' }}>{service.portalNote}</p>
            <PortalButton
              url={service.officialPortalUrl}
              label="Open Official Portal"
              disabledLabel={service.portalActionLabel}
              className="btn btn-secondary"
              service={rawService}
              testId={`button-open-portal-${service.id}`}
            />
          </div>
          <div className="small muted" style={{ padding: '0 5px' }}>
            {t('detail.confirmNotice', 'Confirm current eligibility and requirements with the relevant department before applying.')}
          </div>
        </aside>
      </div>
    </div>
  );
}
