import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoApplications, statuses, type Application, type ApplicationStatus } from '../data/applications';
import { services } from '../data/services';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { type ActivityType, type UserActivity } from '../data/activity';

export type UserProfile = {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  memberSince: string;
};

type AppContextValue = {
  applications: Application[];
  addApplication: (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Application;
  user: UserProfile | null;
  loadingAuth: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (profile: UserProfile & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (p: UserProfile) => Promise<void>;
  activities: UserActivity[];
  recordActivity: (
    type: ActivityType,
    title: string,
    description?: string,
    metadata?: Record<string, any>
  ) => Promise<void>;
  fetchActivities: () => Promise<void>;
  toast: string;
  notify: (message: string) => void;
};

const Context = createContext<AppContextValue | null>(null);

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

function loadApplications(): Application[] {
  const stored = safeRead<unknown>('dt-applications', demoApplications);
  if (!Array.isArray(stored)) return demoApplications;
  const supportedServices = new Set(services.map((service) => service.id));
  return stored.flatMap((item): Application[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Partial<Application>;
    if (
      typeof record.id !== 'string' ||
      typeof record.serviceId !== 'string' ||
      !supportedServices.has(record.serviceId) ||
      typeof record.applicationNumber !== 'string' ||
      typeof record.applicationDate !== 'string'
    )
      return [];
    return [
      {
        id: record.id,
        serviceId: record.serviceId,
        applicationNumber: record.applicationNumber,
        applicationDate: record.applicationDate,
        status: statuses.includes(record.status as ApplicationStatus)
          ? (record.status as ApplicationStatus)
          : 'In Progress',
        expectedCompletionDate:
          typeof record.expectedCompletionDate === 'string' ? record.expectedCompletionDate : '',
        notes: typeof record.notes === 'string' ? record.notes : '',
        createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
        updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
      },
    ];
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(loadApplications);
  const [user, setUser] = useState<UserProfile | null>(() => safeRead<UserProfile | null>('dt-user', null));
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activities, setActivities] = useState<UserActivity[]>(() => safeRead<UserActivity[]>('dt-activities', []));
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  // Sync applications to localStorage
  useEffect(() => {
    localStorage.setItem('dt-applications', JSON.stringify(applications));
  }, [applications]);

  // Sync activities to localStorage
  useEffect(() => {
    localStorage.setItem('dt-activities', JSON.stringify(activities));
  }, [activities]);

  // Supabase Persistent Session Listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoadingAuth(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadSupabaseProfile(session.user.id, session.user.email || '');
          await fetchSupabaseApplications(session.user.id);
        }
      } catch (err) {
        console.warn('Error loading Supabase session:', err);
      } finally {
        setLoadingAuth(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadSupabaseProfile(session.user.id, session.user.email || '');
        await fetchSupabaseApplications(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('dt-user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch applications from Supabase 'applications' table
  const fetchSupabaseApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        const loaded: Application[] = data.map((item) => ({
          id: item.id,
          serviceId: item.service_id || item.serviceId,
          applicationNumber: item.application_number || item.applicationNumber,
          applicationDate: item.application_date || item.applicationDate,
          status: (statuses.includes(item.status) ? item.status : 'In Progress') as ApplicationStatus,
          expectedCompletionDate: item.expected_completion_date || item.expectedCompletionDate || '',
          notes: item.notes || '',
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
        }));
        setApplications(loaded);
        localStorage.setItem('dt-applications', JSON.stringify(loaded));
      }
    } catch (err) {
      console.warn('Error fetching applications from Supabase:', err);
    }
  };

  // Fetch profile from Supabase 'profiles' table using auth.uid()
  const loadSupabaseProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const profile: UserProfile = {
          id: userId,
          name: data.name || data.full_name || email.split('@')[0],
          email: data.email || email,
          mobile: data.mobile || data.phone || '',
          memberSince: data.member_since || data.created_at
            ? new Date(data.member_since || data.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
            : 'Recently',
        };
        setUser(profile);
        localStorage.setItem('dt-user', JSON.stringify(profile));
      } else {
        // Default profile if table record is missing
        const fallbackName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase());
        const profile: UserProfile = {
          id: userId,
          name: fallbackName,
          email,
          mobile: '',
          memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        };
        setUser(profile);
        localStorage.setItem('dt-user', JSON.stringify(profile));
      }
    } catch {
      // Ignore read errors
    }
  };

  // Record activity in 'user_activity' table with user_id = auth.uid()
  const recordActivity = async (
    type: ActivityType,
    title: string,
    description: string = '',
    metadata: Record<string, any> = {}
  ) => {
    const now = new Date().toISOString();
    const userId = user?.id || 'guest';
    const newActivity: UserActivity = {
      id: `act-${Math.random().toString(36).slice(2, 10)}`,
      user_id: userId,
      activity_type: type,
      title,
      description,
      metadata,
      created_at: now,
    };

    // Update local state first for immediate UI response
    setActivities((prev) => [newActivity, ...prev]);

    // Save to Supabase 'user_activity' table if authenticated and configured
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('user_activity').insert([
            {
              user_id: session.user.id,
              activity_type: type,
              title,
              description,
              details: metadata,
              created_at: now,
            },
          ]);
        }
      } catch (err) {
        console.warn('Could not insert activity into user_activity table:', err);
      }
    }
  };

  // Fetch activity history from Supabase 'user_activity' for currently authenticated user (user_id = auth.uid())
  const fetchActivities = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const fetched: UserActivity[] = data.map((item) => ({
          id: String(item.id),
          user_id: item.user_id,
          activity_type: item.activity_type as ActivityType,
          title: item.title || item.activity_type,
          description: item.description || '',
          metadata: item.details || item.metadata || {},
          created_at: item.created_at,
        }));
        setActivities(fetched);
      }
    } catch (err) {
      console.warn('Error fetching user_activity from Supabase:', err);
    }
  };

  // Supabase Signup
  const signup = async (profile: UserProfile & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    const { email, password, name, mobile } = profile;

    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, mobile },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Upsert to 'profiles' table
          try {
            await supabase.from('profiles').upsert([
              {
                id: data.user.id,
                email,
                name,
                mobile,
                created_at: new Date().toISOString(),
              },
            ]);
          } catch (profileErr) {
            console.warn('Profiles table insert notice:', profileErr);
          }

          const newUser: UserProfile = {
            id: data.user.id,
            name,
            email,
            mobile,
            memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          };
          setUser(newUser);
          localStorage.setItem('dt-user', JSON.stringify(newUser));

          await recordActivity('signup', 'Account Created', `Registered new profile for ${email}`, { email });
          notify('Account created successfully!');
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Signup failed' };
      }
    }

    // Local fallback signup
    setUser(profile);
    localStorage.setItem('dt-user', JSON.stringify(profile));
    await recordActivity('signup', 'Account Created', `Created local demo profile for ${email}`, { email });
    notify('Demo profile created on this device.');
    return { success: true };
  };

  // Supabase Login
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await loadSupabaseProfile(data.user.id, data.user.email || email);
          await recordActivity('login', 'User Sign In', `Signed in as ${email}`, { email });
          notify('Successfully signed in.');
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local fallback login
    const u: UserProfile = {
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase()),
      email,
      mobile: '',
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    };
    setUser(u);
    localStorage.setItem('dt-user', JSON.stringify(u));
    await recordActivity('login', 'User Sign In', `Signed in as ${email}`, { email });
    notify('Signed in to local demo.');
    return { success: true };
  };

  // Supabase Logout
  const logout = async () => {
    await recordActivity('logout', 'User Sign Out', 'Logged out of account');

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Logout error:', err);
      }
    }

    setUser(null);
    localStorage.removeItem('dt-user');
    notify('You have been signed out.');
  };

  // Update Profile in 'profiles' table
  const updateProfile = async (p: UserProfile) => {
    setUser(p);
    localStorage.setItem('dt-user', JSON.stringify(p));

    if (isSupabaseConfigured && p.id) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: p.id,
            email: p.email,
            name: p.name,
            mobile: p.mobile,
          },
        ]);
      } catch (err) {
        console.warn('Update profile error:', err);
      }
    }

    notify('Profile updated successfully.');
  };

  // Add application reference
  const addApplication = (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `app-${Math.random().toString(36).slice(2, 10)}`;
    const item: Application = { ...data, id, createdAt: now, updatedAt: now };
    setApplications((v) => [item, ...v]);

    // Save to Supabase 'applications' table if configured & signed in
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.from('applications').insert([
            {
              id,
              user_id: session.user.id,
              service_id: data.serviceId,
              application_number: data.applicationNumber,
              application_date: data.applicationDate,
              status: data.status,
              expected_completion_date: data.expectedCompletionDate || null,
              notes: data.notes || '',
              created_at: now,
              updated_at: now,
            },
          ]).then(({ error }) => {
            if (error) {
              console.warn('Could not insert application into Supabase:', error.message);
            }
          });
        }
      });
    }

    // Record activity
    const service = services.find((s) => s.id === data.serviceId);
    recordActivity(
      'application_add',
      `Added Application: ${service?.name || data.serviceId}`,
      `Application Number: ${data.applicationNumber} (Status: ${data.status})`,
      { serviceId: data.serviceId, applicationNumber: data.applicationNumber, status: data.status }
    );

    notify('Application added successfully.');
    return item;
  };

  const value = useMemo<AppContextValue>(
    () => ({
      applications,
      addApplication,
      user,
      loadingAuth,
      login,
      signup,
      logout,
      updateProfile,
      activities,
      recordActivity,
      fetchActivities,
      toast,
      notify,
    }),
    [applications, user, loadingAuth, activities, toast]
  );

  return (
    <Context.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status" data-testid="toast-message">
          {toast}
        </div>
      )}
    </Context.Provider>
  );
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
