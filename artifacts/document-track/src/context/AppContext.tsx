import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoApplications, statuses, type Application, type ApplicationStatus } from '../data/applications';
import { services } from '../data/services';

export type UserProfile={name:string;email:string;mobile:string;memberSince:string};
type AppContextValue={
 applications:Application[]; addApplication:(data:Omit<Application,'id'|'createdAt'|'updatedAt'>)=>Application;
 user:UserProfile|null; login:(email:string)=>void; signup:(profile:UserProfile)=>void; logout:()=>void; updateProfile:(p:UserProfile)=>void;
 toast:string; notify:(message:string)=>void;
};
const Context=createContext<AppContextValue|null>(null);
const safeRead=<T,>(key:string,fallback:T):T=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v) as T:fallback;}catch{return fallback;}};
function loadApplications():Application[]{
 const stored=safeRead<unknown>('dt-applications',demoApplications);
 if(!Array.isArray(stored))return demoApplications;
 const supportedServices=new Set(services.map(service=>service.id));
 return stored.flatMap((item):Application[]=>{
  if(!item||typeof item!=='object')return [];
  const record=item as Partial<Application>;
  if(typeof record.id!=='string'||typeof record.serviceId!=='string'||!supportedServices.has(record.serviceId)||typeof record.applicationNumber!=='string'||typeof record.applicationDate!=='string')return [];
  return [{
   id:record.id,serviceId:record.serviceId,applicationNumber:record.applicationNumber,applicationDate:record.applicationDate,
   status:statuses.includes(record.status as ApplicationStatus)?record.status as ApplicationStatus:'In Progress',
   expectedCompletionDate:typeof record.expectedCompletionDate==='string'?record.expectedCompletionDate:'',
   notes:typeof record.notes==='string'?record.notes:'',
   createdAt:typeof record.createdAt==='string'?record.createdAt:new Date().toISOString(),
   updatedAt:typeof record.updatedAt==='string'?record.updatedAt:new Date().toISOString()
  }];
 });
}
export function AppProvider({children}:{children:ReactNode}) {
 const [applications,setApplications]=useState<Application[]>(loadApplications);
 const [user,setUser]=useState<UserProfile|null>(()=>safeRead<UserProfile|null>('dt-user',null));
 const [toast,setToast]=useState('');
 useEffect(()=>{localStorage.setItem('dt-applications',JSON.stringify(applications));},[applications]);
 useEffect(()=>{if(user)localStorage.setItem('dt-user',JSON.stringify(user));else localStorage.removeItem('dt-user');},[user]);
 const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(''),2800);};
 const addApplication=(data:Omit<Application,'id'|'createdAt'|'updatedAt'>)=>{
  const now=new Date().toISOString(), id=`app-${Math.random().toString(36).slice(2,10)}`;
  const item:Application={...data,id,createdAt:now,updatedAt:now};
  setApplications(v=>[item,...v]);notify('Application added successfully.');return item;
 };
  const value=useMemo<AppContextValue>(()=>({applications,addApplication,user,
  login:(email)=>{const u={name:email.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g,s=>s.toUpperCase()),email,mobile:'',memberSince:new Date().toLocaleDateString('en-IN',{month:'short',year:'numeric'})};setUser(u);notify('You are signed in to this local demo.');},
  signup:(p)=>{setUser(p);notify('Demo profile created on this device.');},logout:()=>{setUser(null);notify('You have been signed out.');},updateProfile:(p)=>{setUser(p);notify('Profile updated.');},toast,notify}),[applications,user,toast]);
 return <Context.Provider value={value}>{children}{toast&&<div className="toast" role="status" data-testid="toast-message">{toast}</div>}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('useApp must be used within AppProvider');return value;}
