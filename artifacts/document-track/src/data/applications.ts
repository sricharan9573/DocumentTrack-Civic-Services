export type ApplicationStatus = 'Draft'|'Submitted'|'In Progress'|'Approved'|'Rejected'|'Completed';
export type Application = {
  id:string; serviceId:string; applicationNumber:string; applicationDate:string; status:ApplicationStatus;
  expectedCompletionDate:string; notes:string; createdAt:string; updatedAt:string;
};
export const demoApplications:Application[] = [
 {id:'app-income-839201',serviceId:'income-certificate',applicationNumber:'INC-2026-839201',applicationDate:'2026-10-05',status:'In Progress',expectedCompletionDate:'2026-10-20',notes:'Keep a copy of the acknowledgement for reference.',createdAt:'2026-10-05T09:00:00.000Z',updatedAt:'2026-10-06T09:30:00.000Z'},
 {id:'app-driving-782193',serviceId:'driving-licence',applicationNumber:'DL-2026-782193',applicationDate:'2026-09-28',status:'Approved',expectedCompletionDate:'',notes:'Please check the official channel for collection instructions.',createdAt:'2026-09-28T10:00:00.000Z',updatedAt:'2026-10-04T10:00:00.000Z'},
 {id:'app-caste-182739',serviceId:'caste-certificate',applicationNumber:'CAST-2026-182739',applicationDate:'2026-10-02',status:'Submitted',expectedCompletionDate:'',notes:'',createdAt:'2026-10-02T11:15:00.000Z',updatedAt:'2026-10-02T11:15:00.000Z'}
];
export const statuses:ApplicationStatus[]=['Draft','Submitted','In Progress','Approved','Rejected','Completed'];
