import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, CalendarDays, Check, CircleAlert, Clock3, FileText, Plus, Search, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import { services, getTranslatedService } from '../data/services';
import { statuses, type ApplicationStatus } from '../data/applications';
import { useApp } from '../context/AppContext';
import { ApplicationCard, EmptyState, Notice, PageTitle, ServiceCard, ServiceIcon, StatusBadge } from '../components/shared';
import { useLanguage } from '../i18n/LanguageContext';

const activeStatus = (s: ApplicationStatus) => !['Approved', 'Rejected', 'Completed'].includes(s);
const completedStatus = (s: ApplicationStatus) => s === 'Approved' || s === 'Completed';

export function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="tag" style={{ background: '#fff', color: '#123c73' }}>
              {t('home.heroTag', 'Citizen service organizer')}
            </span>
            <h1>{t('home.heroTitle', 'Manage your government applications in one place.')}</h1>
            <p>{t('home.heroDescription', 'Discover services, understand common requirements, access official portals yourself, and keep your application references organized in a personal dashboard.')}</p>
            <div className="hero-actions">
              <Link href="/services" className="btn btn-primary" data-testid="button-explore-services">
                {t('home.exploreServices', 'Explore Services')} <ArrowRight size={16} />
              </Link>
              <Link href="/applications" className="btn btn-secondary" data-testid="button-track-application">
                {t('home.trackApplication', 'Track an Application')}
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 22, color: '#687587', fontSize: 11 }}>
              <ShieldCheck size={16} color="#123c73" /> {t('home.manualStatusNotice', 'Your application status is entered by you, never fetched automatically.')}
            </div>
          </div>
          <div className="preview-panel">
            <div className="preview-top">
              <span>{t('home.previewTitle', 'My application records')}</span>
              <span className="tag">{t('home.previewTag', 'DEMO PREVIEW')}</span>
            </div>
            {[
              { title: t('svc.income-certificate.name', 'Income Certificate'), ref: 'INC-2026-839201', status: 'In Progress', icon: 'FileCheck2' },
              { title: t('svc.driving-licence.name', 'Driving Licence'), ref: 'DL-2026-782193', status: 'Approved', icon: 'CarFront' },
            ].map((a) => (
              <div className="preview-line" key={a.ref}>
                <span className="preview-symbol"><ServiceIcon name={a.icon} /></span>
                <div className="app-meta">
                  <strong style={{ color: '#263b58', fontSize: 13 }}>{a.title}</strong>
                  <br />{a.ref}
                </div>
                <StatusBadge status={a.status as ApplicationStatus} />
              </div>
            ))}
            <div className="small muted" style={{ paddingTop: 14 }}>{t('home.previewFooter', 'Example records only · statuses are personal organizational information')}</div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        {[
          [t('home.stat1Num', '50+'), t('home.stat1Text', 'Demo service guides')],
          [t('home.stat2Num', '1'), t('home.stat2Text', 'Personal dashboard')],
          [t('home.stat3Num', 'Official'), t('home.stat3Text', 'Portal access')],
          [t('home.stat4Num', 'Your status'), t('home.stat4Text', 'Manual tracking')],
        ].map(([n, tStr]) => (
          <div className="stat-item" key={tStr}>
            <strong>{n}</strong>
            <span>{tStr}</span>
          </div>
        ))}
      </div>

      <div className="page">
        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{t('home.howItWorksEyebrow', 'Simple by design')}</div>
              <h2>{t('home.howItWorksTitle', 'How DocumentTrack works')}</h2>
              <p>{t('home.howItWorksSub', 'From finding a service to keeping your own record in one place.')}</p>
            </div>
            <Link href="/how-it-works" className="btn btn-secondary">
              {t('home.seeFullGuide', 'See the full guide')} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="steps-grid">
            {[
              ['01', t('home.step1Title', 'Find a service'), t('home.step1Desc', 'Search for the certificate, licence or permit you need.')],
              ['02', t('home.step2Title', 'Understand requirements'), t('home.step2Desc', 'Review common eligibility, documents, fees and timeframes.')],
              ['03', t('home.step3Title', 'Apply officially'), t('home.step3Desc', 'Continue to the relevant government portal yourself.')],
              ['04', t('home.step4Title', 'Track your record'), t('home.step4Desc', 'Save your reference and choose a personal status.')],
            ].map(([n, title, d]) => (
              <article className="card step-card" key={n}>
                <div className="step-num">{n}</div>
                <h3>{title}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{t('home.featEyebrow', 'Made for everyday tasks')}</div>
              <h2>{t('home.featTitle', 'Less searching. More clarity.')}</h2>
              <p>{t('home.featSub', 'A dependable place for the information and personal reminders you need.')}</p>
            </div>
          </div>
          <div className="feature-grid">
            {[
              [t('home.feat1Title', 'All applications together'), t('home.feat1Desc', 'Keep references, dates and notes in one personal space.'), FileText],
              [t('home.feat2Title', 'Clear requirements'), t('home.feat2Desc', 'Review a practical checklist before continuing to an official channel.'), Check],
              [t('home.feat3Title', 'Official portal access'), t('home.feat3Desc', 'Open configured official links when available; we do not submit for you.'), ShieldCheck],
              [t('home.feat4Title', 'User-managed status'), t('home.feat4Desc', 'Keep a status beside each application reference.'), Clock3],
              [t('home.feat5Title', 'Important dates'), t('home.feat5Desc', 'Add expected dates as reminders, not guarantees.'), CalendarDays],
              [t('home.feat6Title', 'Designed for mobile'), t('home.feat6Desc', 'Manage your records wherever you are.'), UserRound],
            ].map(([title, desc, Icon]) => (
              <article className="card feature-card" key={title as string}>
                <Icon size={20} />
                <div>
                  <strong style={{ fontSize: 13 }}>{title as string}</strong>
                  <p>{desc as string}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">{t('home.popularEyebrow', 'Browse the catalogue')}</div>
              <h2>{t('home.popularTitle', 'Popular service guides')}</h2>
              <p>{t('home.popularSub', 'General demo information only. Rules and fees differ across India.')}</p>
            </div>
            <Link href="/services" className="btn btn-secondary">
              {t('home.allServicesBtn', 'All services')} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid service-grid">
            {services.slice(0, 5).map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>

        <section className="section" id="about">
          <Notice>
            <strong>{t('home.importantNoticeTitle', 'Important to know')}</strong>
            <br />
            {t('home.importantNoticeContent', 'DocumentTrack does not process government applications. Submit through official government portals or authorized service channels. We help citizens organize information and track application references; status is user-entered, not automatically retrieved.')}
          </Notice>
        </section>

        <section className="section card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div className="eyebrow">{t('home.readyEyebrow', 'Start with what you need')}</div>
            <h2 style={{ margin: '8px 0' }}>{t('home.readyTitle', 'Ready to organize your applications?')}</h2>
            <p className="muted" style={{ margin: 0 }}>{t('home.readySub', 'Browse common services and keep your own records together.')}</p>
          </div>
          <Link href="/services" className="btn btn-primary">
            {t('home.readyBtn', 'Explore government services')} <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}

export function ServicesPage() {
  const { t } = useLanguage();
  const initial = new URLSearchParams(window.location.search).get('q') || '';
  const [query, setQuery] = useState(initial);
  const [category, setCategory] = useState('All');

  const cats = ['All', 'Certificates', 'Licenses', 'Permits', 'Identity', 'Other Services'];

  const filtered = services.filter(
    (s) =>
      (category === 'All' || s.category === category) &&
      `${s.name} ${s.description} ${s.department}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <PageTitle
        eyebrow={t('services.eyebrow', 'Service directory')}
        title={t('services.title', 'Government Services')}
        description={t('services.description', 'Find the service you need and understand common requirements before applying.')}
      />
      <Notice>{t('services.caveat', 'Service information is a general demo guide. Eligibility, documents, fees and processing times vary by state, department and individual case. Confirm current rules with the relevant authority.')}</Notice>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('services.searchPlaceholder', 'Search services...')}
            aria-label={t('services.searchPlaceholder', 'Search services...')}
            data-testid="input-services-search"
          />
        </div>
        <SlidersHorizontal size={17} color="#7c8796" />
        {cats.map((c) => {
          let label = c;
          if (c === 'All') label = t('services.allCategories', 'All Services');
          else if (c === 'Certificates') label = t('services.catCertificates', 'Certificates');
          else if (c === 'Licenses') label = t('services.catLicenses', 'Licenses');
          else if (c === 'Permits') label = t('services.catPermits', 'Permits');
          else if (c === 'Identity') label = t('services.catIdentity', 'Identity');
          else if (c === 'Other Services') label = t('services.catOther', 'Other Services');

          return (
            <button
              key={c}
              className={`filter-chip ${category === c ? 'selected' : ''}`}
              onClick={() => setCategory(c)}
              data-testid={`filter-category-${c.toLowerCase().replaceAll(' ', '-')}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="small muted" style={{ marginBottom: 15 }}>
        {filtered.length} {filtered.length === 1 ? t('services.countGuide', 'service guide') : t('services.countGuides', 'service guides')}
      </div>

      {filtered.length ? (
        <div className="grid service-grid">
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      ) : (
        <EmptyState title={t('services.noMatchTitle', 'No matching services')} description={t('services.noMatchDesc', 'Try another search or choose a different category.')} />
      )}
    </div>
  );
}

export function LoginPage() {
  const { login } = useApp();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    login(email);
    setLocation('/dashboard');
  };

  return (
    <div className="auth-wrap">
      <section className="card auth-card">
        <div className="eyebrow">{t('auth.welcomeBack', 'Welcome back')}</div>
        <h1>{t('auth.loginTitle', 'Sign in to your workspace')}</h1>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.65 }}>
          {t('auth.loginSub', 'This demo uses a local mock session on this device. Do not enter a real password; passwords are never stored.')}
        </p>
        <form onSubmit={submit} className="grid" style={{ gap: 15, marginTop: 23 }}>
          <div className="field">
            <label htmlFor="login-email">{t('auth.labelEmail', 'Email')}</label>
            <input id="login-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="input-login-email" />
          </div>
          <div className="field">
            <label htmlFor="login-password">{t('auth.labelPassword', 'Password')}</label>
            <input id="login-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="input-login-password" />
          </div>
          {error && <div className="error-text" role="alert">{error}</div>}
          <button className="btn btn-primary" type="submit" data-testid="button-login-submit">
            {t('auth.btnSignIn', 'Sign in')}
          </button>
          <button className="btn btn-secondary" type="button" disabled title="Not available in this demo" data-testid="button-google-login">
            {t('auth.btnGoogle', 'Continue with Google · unavailable')}
          </button>
        </form>
        <button className="btn btn-ghost" style={{ paddingLeft: 0, marginTop: 10 }} onClick={() => setError('Password recovery is not available in this local demo.')}>
          {t('auth.forgotPassword', 'Forgot password?')}
        </button>
        <div className="small muted" style={{ marginTop: 10 }}>
          {t('auth.newHere', 'New here?')} <Link href="/signup" style={{ color: '#123c73', fontWeight: 700 }}>{t('auth.createDemoProfile', 'Create a demo profile')}</Link>
        </div>
        <div style={{ marginTop: 20 }}>
          <Notice>{t('auth.mockAuthNotice', 'Mock authentication is for demonstration only. It does not provide account security.')}</Notice>
        </div>
      </section>
    </div>
  );
}

export function SignupPage() {
  const { signup } = useApp();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError('Please agree to the Terms and Privacy Policy.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for this demo password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    signup({ name, email, mobile, memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) });
    setLocation('/dashboard');
  };

  return (
    <div className="auth-wrap">
      <section className="card auth-card">
        <div className="eyebrow">{t('auth.signupEyebrow', 'A local demo profile')}</div>
        <h1>{t('auth.signupTitle', 'Create your profile')}</h1>
        <p className="muted small">{t('auth.signupSub', 'Your profile and application records remain in this browser only. Passwords are not persisted. This is not production authentication.')}</p>
        <form onSubmit={submit} className="grid" style={{ gap: 13, marginTop: 21 }}>
          <div className="field">
            <label htmlFor="signup-name">{t('auth.labelName', 'Full name')}</label>
            <input id="signup-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-signup-name" />
          </div>
          <div className="field">
            <label htmlFor="signup-email">{t('auth.labelEmail', 'Email')}</label>
            <input id="signup-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="input-signup-email" />
          </div>
          <div className="field">
            <label htmlFor="signup-mobile">{t('auth.labelMobile', 'Mobile number')}</label>
            <input id="signup-mobile" className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} data-testid="input-signup-mobile" />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="signup-password">{t('auth.labelPassword', 'Password (demo only)')}</label>
              <input id="signup-password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="input-signup-password" />
            </div>
            <div className="field">
              <label htmlFor="signup-confirm">{t('auth.labelConfirm', 'Confirm password')}</label>
              <input id="signup-confirm" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required data-testid="input-signup-confirm" />
            </div>
          </div>
          <label style={{ display: 'flex', gap: 9, fontSize: 12, alignItems: 'center' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} data-testid="checkbox-signup-terms" /> {t('auth.agreeTerms', 'I agree to the Terms and Privacy Policy.')}
          </label>
          {error && <div className="error-text" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary" data-testid="button-signup-submit">
            {t('auth.btnCreateProfile', 'Create demo profile')}
          </button>
        </form>
        <div className="small muted" style={{ marginTop: 15 }}>
          {t('auth.alreadyHaveProfile', 'Already have a profile?')} <Link href="/login" style={{ color: '#123c73', fontWeight: 700 }}>{t('nav.login', 'Sign in')}</Link>
        </div>
      </section>
    </div>
  );
}

export function DashboardPage() {
  const { applications, user } = useApp();
  const { t } = useLanguage();
  const recent = applications.slice(0, 4);
  const inProgress = applications.filter((a) => activeStatus(a.status)).length;
  const completed = applications.filter((a) => completedStatus(a.status)).length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t('dash.eyebrow', 'Personal overview')}</div>
          <h1>{t('dash.goodMorning', 'Good morning')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p>{t('dash.sub', 'Here’s an overview of your application records. Status is managed by you.')}</p>
        </div>
        <Link href="/applications/add" className="btn btn-primary" data-testid="button-add-application">
          <Plus size={16} /> {t('app.addApplication', 'Add application')}
        </Link>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', margin: '24px 0 35px' }}>
        {[
          [t('dash.totalApps', 'Total applications'), applications.length, 'FileText'],
          [t('dash.inProgress', 'In progress'), inProgress, 'Clock3'],
          [t('dash.completed', 'Completed'), completed, 'Check'],
          [t('dash.rejected', 'Rejected'), rejected, 'CircleAlert'],
        ].map(([label, value, icon]) => (
          <div className="card" key={label as string} style={{ padding: 19, display: 'flex', gap: 13, alignItems: 'center' }}>
            <div className="service-icon" style={{ margin: 0 }}>
              {icon === 'FileText' ? <FileText size={20} /> : icon === 'Clock3' ? <Clock3 size={20} /> : icon === 'Check' ? <Check size={20} /> : <CircleAlert size={20} />}
            </div>
            <div>
              <div className="small muted">{label as string}</div>
              <strong style={{ fontSize: 23, color: '#123c73' }}>{value as number}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <div>
          <h2 style={{ marginBottom: 3 }}>{t('dash.recentHead', 'Recent applications')}</h2>
          <p>{t('dash.recentSub', 'Records you added to DocumentTrack.')}</p>
        </div>
        <Link href="/applications" className="btn btn-secondary">
          {t('dash.viewAll', 'View all')} <ArrowRight size={15} />
        </Link>
      </div>
      {recent.length ? (
        <div className="card">
          {recent.map((a) => (
            <ApplicationCard key={a.id} application={a} />
          ))}
        </div>
      ) : (
        <EmptyState title={t('app.emptyTitle', 'No applications yet')} description={t('app.emptyDesc', 'Once you apply for a service, add your application number here and manage your personal record.')} action={t('home.exploreServices', 'Explore services')} />
      )}
      <div style={{ marginTop: 23 }}>
        <Notice>{t('app.manualNotice', 'Only you update these records. To check official status, visit the relevant department portal yourself.')}</Notice>
      </div>
    </div>
  );
}

export function ApplicationFormPage() {
  const { addApplication } = useApp();
  const { t } = useLanguage();
  const searchService = new URLSearchParams(window.location.search).get('service') || '';
  const [, setLocation] = useLocation();
  const [serviceId, setServiceId] = useState(searchService);
  const [number, setNumber] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Submitted');
  const [expected, setExpected] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!serviceId) errs.push('Select a service.');
    if (!number.trim()) errs.push('Application number is required.');
    if (!date) errs.push('Application date is required.');
    if (!status) errs.push('Choose a status.');
    setErrors(errs);
    if (errs.length) return;
    addApplication({ serviceId, applicationNumber: number.trim(), applicationDate: date, status, expectedCompletionDate: expected, notes });
    setLocation('/dashboard');
  };

  return (
    <div className="page narrow">
      <div className="eyebrow">{t('form.eyebrow', 'Personal application record')}</div>
      <h1>{t('form.title', 'Add an application')}</h1>
      <p className="lead">{t('form.lead', 'Store the reference you received after applying through an official channel. Nothing is submitted from this form.')}</p>
      <div className="card" style={{ padding: 25, marginTop: 24 }}>
        <form onSubmit={submit} className="form-grid">
          <div className="field full">
            <label htmlFor="app-service">{t('form.labelService', 'Service')} <span style={{ color: '#d32f2f' }}>*</span></label>
            <select id="app-service" className="select" value={serviceId} onChange={(e) => setServiceId(e.target.value)} data-testid="select-application-service">
              <option value="">{t('form.selectServicePlaceholder', 'Select a service')}</option>
              {services.map((s) => {
                const translated = getTranslatedService(s, t);
                return <option key={s.id} value={s.id}>{translated.name}</option>;
              })}
            </select>
          </div>
          <div className="field">
            <label htmlFor="app-number">{t('form.labelNumber', 'Application / reference number')} *</label>
            <input id="app-number" className="input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder={t('form.placeholderNumber', 'Enter the reference you received')} data-testid="input-application-number" />
          </div>
          <div className="field">
            <label htmlFor="app-date">{t('form.labelDate', 'Application date')} *</label>
            <input id="app-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-application-date" />
          </div>
          <div className="field">
            <label htmlFor="app-status">{t('form.labelStatus', 'Current status')} *</label>
            <select id="app-status" className="select" value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)} data-testid="select-application-status">
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="app-expected">{t('form.labelExpected', 'Expected completion date (optional)')}</label>
            <input id="app-expected" className="input" type="date" value={expected} onChange={(e) => setExpected(e.target.value)} data-testid="input-expected-date" />
          </div>
          <div className="field full">
            <label htmlFor="app-notes">{t('form.labelNotes', 'Notes')}</label>
            <textarea id="app-notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('form.placeholderNotes', 'Personal reminders, not official messages')} data-testid="input-application-notes" />
          </div>
          {errors.length > 0 && (
            <div className="field full">
              <div role="alert" className="error-text">
                {errors.map((e) => <div key={e}>{e}</div>)}
              </div>
            </div>
          )}
          <div className="field full">
            <Notice>{t('form.notice', 'Your application is handled by the relevant department. DocumentTrack saves a personal reference and current status on this device only.')}</Notice>
          </div>
          <div className="field full" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Link href="/applications" className="btn btn-secondary">{t('form.btnCancel', 'Cancel')}</Link>
            <button className="btn btn-primary" type="submit" data-testid="button-save-application">{t('form.btnSave', 'Save application')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  const { t } = useLanguage();
  const steps = [
    [t('how.step1Title', 'Discover a service'), t('how.step1Desc', 'Search the service directory for a certificate, licence, permit or other service.')],
    [t('how.step2Title', 'Check requirements'), t('how.step2Desc', 'Use the general guide to prepare questions and documents; confirm details with the relevant authority.')],
    [t('how.step3Title', 'Apply through an official channel'), t('how.step3Desc', 'Open a configured official portal link when available, or follow the department’s instructions. Complete and submit the application yourself.')],
    [t('how.step4Title', 'Receive your reference'), t('how.step4Desc', 'Keep the acknowledgement or application number issued by the government service.')],
    [t('how.step5Title', 'Add the reference here'), t('how.step5Desc', 'Create a personal record with the service, reference number, date and any reminders.')],
    [t('how.step6Title', 'Check official status yourself'), t('how.step6Desc', 'Visit the relevant official portal directly whenever you need current status.')],
    [t('how.step7Title', 'Choose a personal status'), t('how.step7Desc', 'Set a status when you add the record; it is an organizational note, not a government update.')],
  ];

  return (
    <div className="page narrow">
      <PageTitle eyebrow={t('how.eyebrow', 'A clear, citizen-led process')} title={t('how.title', 'How it works')} description={t('how.sub', 'DocumentTrack keeps your own application information organized. The official process remains between you and the relevant authority.')} />
      <div className="grid" style={{ gap: 12, marginTop: 27 }}>
        {steps.map(([title, desc], i) => (
          <article className="card" key={title} style={{ padding: 19, display: 'flex', gap: 17 }}>
            <div className="step-num" style={{ flex: 'none' }}>{String(i + 1).padStart(2, '0')}</div>
            <div>
              <h3>{title}</h3>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          </article>
        ))}
      </div>
      <div style={{ marginTop: 25 }}>
        <Notice>
          <strong>{t('how.noticeTitle', 'DocumentTrack is not a government department and does not directly process applications.')}</strong> {t('how.notice', 'Government applications are submitted and processed by the relevant government department or authorized service provider. We do not fetch government status or access private records.')}
        </Notice>
      </div>
      <div className="section">
        <h2>{t('how.practiceTitle', 'What this means in practice')}</h2>
        <p className="lead" style={{ fontSize: 14 }}>{t('how.practiceLead', 'Your saved status is a personal note, not a government notification. Date estimates are reminders, not guarantees. Service rules, fees and timelines vary by state, department and individual case.')}</p>
        <Link href="/services" className="btn btn-primary">{t('how.btnBrowse', 'Browse service guides')} <ArrowRight size={15} /></Link>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateProfile, logout } = useApp();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Citizen');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [emailReminders, setEmailReminders] = useState(true);
  const [dateReminders, setDateReminders] = useState(true);

  const save = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, mobile, memberSince: user?.memberSince || 'Today' });
    setEditing(false);
  };

  return (
    <div className="page narrow">
      <PageTitle eyebrow={t('prof.eyebrow', 'Your device profile')} title={t('prof.title', 'Profile & settings')} description={t('prof.sub', 'Manage the local profile and reminder preferences for this demo.')} />
      <section className="card detail-block">
        <div className="profile-head">
          <div className="avatar">{(user?.name || 'C').slice(0, 1).toUpperCase()}</div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 23 }}>{user?.name || t('prof.guest', 'Guest profile')}</h2>
            <div className="muted small">{user?.email || 'No signed-in profile'} · {t('prof.memberSince', 'Member since')} {user?.memberSince || '—'}</div>
          </div>
        </div>
        {editing ? (
          <form className="form-grid" onSubmit={save}>
            <div className="field">
              <label htmlFor="profile-name">{t('prof.fullName', 'Full name')}</label>
              <input id="profile-name" className="input" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" />
            </div>
            <div className="field">
              <label htmlFor="profile-email">{t('prof.email', 'Email')}</label>
              <input id="profile-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-profile-email" />
            </div>
            <div className="field full">
              <label htmlFor="profile-mobile">{t('prof.mobile', 'Mobile')}</label>
              <input id="profile-mobile" className="input" value={mobile} onChange={(e) => setMobile(e.target.value)} data-testid="input-profile-mobile" />
            </div>
            <div className="field full" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>{t('prof.cancelBtn', 'Cancel')}</button>
              <button type="submit" className="btn btn-primary" data-testid="button-save-profile">{t('prof.saveBtn', 'Save changes')}</button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 17, marginBottom: 18 }}>
              <div>
                <div className="small muted">{t('prof.email', 'Email')}</div>
                <strong>{user?.email || 'Not provided'}</strong>
              </div>
              <div>
                <div className="small muted">{t('prof.mobile', 'Mobile')}</div>
                <strong>{user?.mobile || 'Not provided'}</strong>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setEditing(true)} data-testid="button-edit-profile">{t('prof.editBtn', 'Edit profile')}</button>
          </>
        )}
      </section>

      <section className="card detail-block">
        <div className="eyebrow">{t('prof.notifEyebrow', 'Notification preferences')}</div>
        <h2 style={{ fontSize: 22, marginTop: 8 }}>{t('prof.notifTitle', 'Personal reminders')}</h2>
        <p>{t('prof.notifSub', 'These preferences are only for demo UI. No emails or government notifications are sent.')}</p>
        <label style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid #edf0f4', fontSize: 13 }}>
          {t('prof.appReminders', 'Application reminders')} <input type="checkbox" checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} data-testid="toggle-reminders" />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderTop: '1px solid #edf0f4', fontSize: 13 }}>
          {t('prof.dateReminders', 'Expected date reminders')} <input type="checkbox" checked={dateReminders} onChange={(e) => setDateReminders(e.target.checked)} data-testid="toggle-date-reminders" />
        </label>
      </section>

      <section className="card detail-block">
        <div className="eyebrow">{t('prof.secEyebrow', 'Security & privacy')}</div>
        <h2 style={{ fontSize: 22, marginTop: 8 }}>{t('prof.secTitle', 'Local demo storage')}</h2>
        <p>{t('prof.secDesc', 'Your profile and application records are stored in this browser’s localStorage. This mock session is not secure authentication; never save sensitive identifiers or passwords here.')}</p>
        <div className="small muted">{t('prof.secSub', 'This demonstration does not connect to a backend, government API or external tracking system.')}</div>
      </section>

      <button className="btn btn-danger" onClick={() => { logout(); setLocation('/'); }} data-testid="button-profile-logout">
        {t('prof.signOutBtn', 'Sign out of demo')}
      </button>
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="page">
      <EmptyState title="Page not found" description="That page is not part of DocumentTrack. Return to the service directory to continue." action={t('services.allCategories', 'Browse services')} />
    </div>
  );
}
