import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, BookUser, Building2, CarFront, ChevronRight, CircleAlert, ExternalLink, FileCheck2, FileText, Landmark, LogOut, MapPin, Menu, Search, ShieldCheck, UserRound, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { services, getTranslatedService, type Service } from '../data/services';
import { addRecentActivity } from '../lib/recentActivity';
import { type Application, type ApplicationStatus } from '../data/applications';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';

const icons: Record<string, typeof FileText> = { FileCheck2, Landmark, FileText, MapPin, CarFront, BookUser, Building2 };

export function ServiceIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = icons[name] || FileText;
  return <Icon size={size} strokeWidth={1.8} />;
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useLanguage();
  let translatedStatus = String(status);
  if (status === ('Submitted' as ApplicationStatus)) translatedStatus = t('app.submitted', 'Submitted');
  else if (status === ('Under Review' as ApplicationStatus)) translatedStatus = t('app.underReview', 'Under Review');
  else if (status === 'Approved') translatedStatus = t('app.approved', 'Approved');
  else if (status === 'Rejected') translatedStatus = t('app.rejected', 'Rejected');
  else if (status === 'In Progress') translatedStatus = t('app.inProgress', 'In Progress');
  else if (status === 'Completed') translatedStatus = t('app.completed', 'Completed');

  return (
    <span className={`status status-${status.toLowerCase().replaceAll(' ', '-')}`} data-testid={`status-${status.toLowerCase().replaceAll(' ', '-')}`}>
      {translatedStatus}
    </span>
  );
}

export function PageTitle({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice" role="note" data-testid="notice-transparency">
      <ShieldCheck className="notice-icon" size={20} />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, description, action, href = '/services' }: { title: string; description: string; action?: string; href?: string }) {
  return (
    <div className="card empty-state" data-testid="empty-state">
      <div className="empty-icon"><FileText size={23} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <Link href={href} className="btn btn-primary" data-testid="link-empty-action">
          {action} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function ServiceCard({ service: rawService }: { service: Service }) {
  const { t } = useLanguage();
  const service = getTranslatedService(rawService, t);

  return (
    <article className="card service-card" data-testid={`card-service-${service.id}`}>
      <div className="service-icon"><ServiceIcon name={service.icon} size={22} /></div>
      <div className="tag" style={{ alignSelf: 'flex-start', marginBottom: 10 }}>{service.category}</div>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div className="service-card-foot">
        <span>{service.department}</span>
        <Link className="btn btn-ghost" style={{ minHeight: 28, padding: '0 3px' }} href={`/services/${service.id}`} data-testid={`link-service-${service.id}`}>
          {t('general.details', 'Details')} <ChevronRight size={14} />
        </Link>
      </div>
    </article>
  );
}

export function ApplicationCard({ application }: { application: Application }) {
  const { t } = useLanguage();
  const rawService = services.find((s) => s.id === application.serviceId);
  const service = rawService ? getTranslatedService(rawService, t) : null;
  const trackingUrl = rawService?.trackingUrl || '';

  return (
    <div className="app-row" data-testid={`card-application-${application.id}`}>
      <div className="app-mark"><ServiceIcon name={rawService?.icon || 'FileText'} size={19} /></div>
      <div className="app-main">
        <strong>{service?.name || 'Service application'}</strong>
        <div className="app-meta">
          {application.applicationNumber} · {service?.department || 'Department'}
          <br />
          Applied {new Date(application.applicationDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
      <StatusBadge status={application.status} />
      <div className="app-actions">
        <PortalButton
          url={trackingUrl}
          label={t('app.trackOfficialPortal', 'Track on Official Portal')}
          disabledLabel={rawService?.trackingUnavailableLabel || 'Official portal varies by location.'}
          className="btn btn-primary"
          service={rawService}
          testId={`button-track-application-${application.id}`}
        />
      </div>
    </div>
  );
}

export function PortalButton({ url, label = 'Open Official Portal', disabledLabel = 'Official portal varies by location', className = 'btn btn-secondary', testId = 'button-official-link', service }: { url: string; label?: string; disabledLabel?: string; className?: string; testId?: string; service?: Service }) {
  const { recordActivity } = useApp();
  if (!url) return <button className={className} disabled data-testid={testId}>{disabledLabel}</button>;
  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (service) addRecentActivity(service);
        recordActivity(
          'official_portal_visit',
          `Visited Official Portal: ${service?.name || label}`,
          `Opened official portal link: ${url}`,
          { serviceId: service?.id, url }
        );
      }}
      data-testid={testId}
    >
      {label} <ExternalLink size={15} />
    </a>
  );
}

export function Navbar() {
  const { user, logout, recordActivity } = useApp();
  const { t } = useLanguage();
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useLocation();

  const links = [
    [t('nav.home', 'Home'), '/'],
    [t('nav.services', 'Services'), '/services'],
    [t('nav.recentActivity', 'Recent Activity'), '/applications'],
    [t('nav.howItWorks', 'How It Works'), '/how-it-works'],
    [t('nav.about', 'About'), '/#about'],
  ];

  const goSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      recordActivity(
        'search',
        `Searched for "${query}"`,
        `Global search query: ${query}`,
        { query }
      );
    }
    setLocation(`/services${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    setSearchOpen(false);
  };

  return (
    <header className="topbar">
      <div className="nav-wrap">
        <Link href="/" className="brand" data-testid="link-home">
          <span className="brand-mark"><Landmark size={19} /></span>
          <span>DocumentTrack</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map(([label, path]) => (
            <Link key={path} href={path} className={`nav-link ${location === path ? 'active' : ''}`} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          {/* Language Selector Dropdown */}
          <LanguageSelector />

          <button className="icon-button desktop-only" aria-label="Search services" onClick={() => setSearchOpen((v) => !v)} data-testid="button-global-search">
            <Search size={17} />
          </button>
          {user && (
            <>
              <Link href="/profile" className="icon-button desktop-only" aria-label={t('nav.profile', 'Profile')} data-testid="link-profile">
                <UserRound size={17} />
              </Link>
              <button className="btn btn-ghost desktop-only" onClick={logout} style={{ minHeight: 37, padding: '0 8px' }} data-testid="button-logout">
                <LogOut size={15} />
              </button>
            </>
          )}
          <button className="icon-button mobile-toggle" aria-label={menu ? 'Close navigation' : 'Open navigation'} onClick={() => setMenu((v) => !v)} data-testid="button-mobile-menu">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[...links, ...(user ? [[t('nav.profile', 'Profile'), '/profile']] : [])].map(([name, path]) => (
            <Link key={path} href={path} onClick={() => setMenu(false)}>
              {name}
            </Link>
          ))}
          {user && (
            <button className="btn btn-secondary" onClick={() => { logout(); setMenu(false); }}>
              {t('nav.logout', 'Sign out')}
            </button>
          )}
        </nav>
      )}
      {searchOpen && (
        <div style={{ maxWidth: 1150, margin: '0 auto', padding: '0 28px 14px' }}>
          <form className="search-box" onSubmit={goSearch}>
            <Search size={16} />
            <input className="input" autoFocus placeholder={t('nav.searchPlaceholder', 'Search government services')} value={query} onChange={(e) => setQuery(e.target.value)} data-testid="input-global-search" />
            <button className="btn btn-primary" style={{ position: 'absolute', right: 4, top: 4, minHeight: 36 }}>
              {t('general.search', 'Search')}
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand">
            <span className="brand-mark"><Landmark size={18} /></span>DocumentTrack
          </div>
          <div style={{ marginTop: 9 }}>{t('footer.brandSlogan', 'An independent citizen-side organizer.')}</div>
        </div>
        <div className="footer-note">{t('footer.disclaimer', 'Not a government service. We do not submit applications or automatically receive official status. Government rules vary by state and department.')}</div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function LoadingState() {
  const { t } = useLanguage();
  return (
    <div className="page">
      <div className="card" style={{ padding: 24 }}>
        <div style={{ height: 20, width: '40%', background: '#e9eef4', borderRadius: 6, marginBottom: 16 }} />
        <div style={{ height: 70, background: '#f0f3f7', borderRadius: 9 }} />
        <span className="small muted">{t('general.loading', 'Loading your local records…')}</span>
      </div>
    </div>
  );
}

export function ErrorState({ retry }: { retry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="page">
      <div className="card empty-state">
        <div className="empty-icon"><CircleAlert /></div>
        <h3>{t('general.error', 'Something went wrong')}</h3>
        <p>Please try again. Your saved records remain on this device.</p>
        <button className="btn btn-primary" onClick={retry} data-testid="button-retry">
          {t('general.retry', 'Retry')}
        </button>
      </div>
    </div>
  );
}
