import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { demoApplications, type Application, type ApplicationStatus } from '../data/applications';

export type UserProfile={name:string;email:string;mobile:string;memberSince:string};
type AppContextValue={
 applications:Application[]; addApplication:(data:Omit<Application,'id'|'createdAt'|'updatedAt'|'statusHistory'>)=>Application;
 updateApplication:(id:string,data:Partial<Application>)=>void; deleteApplication:(id:string)=>void;
 updateStatus:(id:string,status:ApplicationStatus,remarks:string)=>void;
 user:UserProfile|null; login:(email:string)=>void; signup:(profile:UserProfile)=>void; logout:()=>void; updateProfile:(p:UserProfile)=>void;
 toast:string; notify:(message:string)=>void;
};
const Context=createContext<AppContextValue|null>(null);
const safeRead=<T,>(key:string,fallback:T):T=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v) as T:fallback;}catch{return fallback;}};
export function AppProvider({children}:{children:ReactNode}) {
 const [applications,setApplications]=useState<Application[]>(()=>safeRead('dt-applications',demoApplications));
 const [user,setUser]=useState<UserProfile|null>(()=>safeRead<UserProfile|null>('dt-user',null));
 const [toast,setToast]=useState('');
 useEffect(()=>{localStorage.setItem('dt-applications',JSON.stringify(applications));},[applications]);
 useEffect(()=>{if(user)localStorage.setItem('dt-user',JSON.stringify(user));else localStorage.removeItem('dt-user');},[user]);
 const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(''),2800);};
 const addApplication=(data:Omit<Application,'id'|'createdAt'|'updatedAt'|'statusHistory'>)=>{
  const now=new Date().toISOString(), id=`app-${Math.random().toString(36).slice(2,10)}`;
  const item:Application={...data,id,createdAt:now,updatedAt:now,statusHistory:[{id:`${id}-h1`,status:data.status,remarks:'Application record added by you.',changedAt:now}]};
  setApplications(v=>[item,...v]);notify('Application added successfully.');return item;
 };
 const updateApplication=(id:string,data:Partial<Application>)=>{setApplications(v=>v.map(a=>a.id===id?{...a,...data,updatedAt:new Date().toISOString()}:a));notify('Application updated successfully.');};
 const deleteApplication=(id:string)=>{setApplications(v=>v.filter(a=>a.id!==id));notify('Application deleted.');};
 const updateStatus=(id:string,status:ApplicationStatus,remarks:string)=>{const now=new Date().toISOString();setApplications(v=>v.map(a=>a.id===id?{...a,status,updatedAt:now,statusHistory:[...a.statusHistory,{id:`${id}-${Date.now()}`,status,remarks:remarks||'Status updated by you.',changedAt:now}]}:a));notify('Status updated successfully.');};
 const value=useMemo<AppContextValue>(()=>({applications,addApplication,updateApplication,deleteApplication,updateStatus,user,
  login:(email)=>{const u={name:email.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g,s=>s.toUpperCase()),email,mobile:'',memberSince:new Date().toLocaleDateString('en-IN',{month:'short',year:'numeric'})};setUser(u);notify('You are signed in to this local demo.');},
  signup:(p)=>{setUser(p);notify('Demo profile created on this device.');},logout:()=>{setUser(null);notify('You have been signed out.');},updateProfile:(p)=>{setUser(p);notify('Profile updated.');},toast,notify}),[applications,user,toast]);
 return <Context.Provider value={value}>{children}{toast&&<div className="toast" role="status" data-testid="toast-message">{toast}</div>}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('useApp must be used within AppProvider');return value;}
