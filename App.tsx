
// import React, { useState, useEffect, useMemo } from 'react';
// import { MOCK_EMPLOYEES, MASTER_PASSWORD } from './constants';
// import { appsScriptService } from './services/googleAppsScriptService';

// const OFFICE_LAT = 24.530833;
// const OFFICE_LNG = 73.682943;
// const ALLOWED_RADIUS_METERS = 300;

// export default function App() {
//   const [view, setView] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
//   const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
//   const [adminPass, setAdminPass] = useState('');
  
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
//   const [password, setPassword] = useState('');
  
//   // Status codes tracked by the v16.9 backend summary auditor
//   const LEAVE_OPTIONS = [ 
//     { label: 'Present', code: 'P' },
//     { label: 'Absent (Uninformed)', code: 'A' },
//     { label: 'Paid Leave', code: 'PL' },
//     { label: 'Unpaid Leave', code: 'UL' },
//     { label: 'Sick Leave', code: 'SL' },
//     { label: 'Half Day', code: 'HD' },
//     { label: 'Office Holiday', code: 'OH' },
//     { label: 'Weekend Off', code: 'WEH' }
//   ];
  
//   const [adminSelectedCode, setAdminSelectedCode] = useState('P');
//   const [loading, setLoading] = useState(false);
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [actionType, setActionType] = useState<'signIn' | 'signOut'>('signIn');
  
//   const [locationState, setLocationState] = useState<{
//     status: 'idle' | 'checking' | 'in_range' | 'out_of_range' | 'error';
//     distance?: number;
//   }>({ status: 'idle' });

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     checkProximity();
//     return () => clearInterval(timer);
//   }, []);

//   const rules = useMemo(() => {
//     const date = currentTime;
//     const day = date.getDay(); 
//     let ruleName = "Normal Shift Active";
//     if (day === 0) ruleName = "Sunday: Weekly Off";
//     else if (day === 6) {
//       const weekOfMonth = Math.ceil(date.getDate() / 7);
//       if (weekOfMonth === 1 || weekOfMonth === 3 || weekOfMonth === 5) {
//         ruleName = `${weekOfMonth}${weekOfMonth === 1 ? 'st' : weekOfMonth === 3 ? 'rd' : 'th'} Sat: Off`;
//       }
//     }
//     return { ruleName };
//   }, [currentTime]);

//   const checkProximity = () => {
//     if (!navigator.geolocation) return setLocationState({ status: 'error' });
//     setLocationState(prev => ({ ...prev, status: 'checking' }));
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const R = 6371e3;
//         const φ1 = pos.coords.latitude * Math.PI / 180;
//         const φ2 = OFFICE_LAT * Math.PI / 180;
//         const Δφ = (OFFICE_LAT - pos.coords.latitude) * Math.PI / 180;
//         const Δλ = (OFFICE_LNG - pos.coords.longitude) * Math.PI / 180;
//         const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const dist = R * c;
//         setLocationState({ status: dist <= ALLOWED_RADIUS_METERS ? 'in_range' : 'out_of_range', distance: Math.round(dist) });
//       },
//       () => setLocationState({ status: 'error' }),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleEmployeeAction = async () => {
//     const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
//     if (!emp) return showFeedback('error', 'Please select your identity.');
//     if (locationState.status !== 'in_range') return showFeedback('error', `Location Mismatch: ${locationState.distance}m.`);
//     if (actionType === 'signIn' && emp.password !== password) return showFeedback('error', 'Wrong Access PIN.');
    
//     setLoading(true);
//     try {
//       if (actionType === 'signIn') {
//         await appsScriptService.saveSignIn(emp.id, emp.name);
//         showFeedback('success', `Signed In! Punctuality verified.`);
//       } else {
//         await appsScriptService.saveSignOut(emp.id, emp.name);
//         showFeedback('success', `Signed Out! TT updated.`);
//       }
//       setPassword('');
//     } catch (err) {
//       showFeedback('error', 'Sync failed. Check connection.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminAction = async () => {
//     const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
//     if (!emp) return showFeedback('error', 'Choose personnel.');

//     setLoading(true);
//     try {
//       await appsScriptService.adminMarkStatus(emp.name, adminSelectedCode);
//       showFeedback('success', `${emp.name} set to ${adminSelectedCode}. Matrix Refreshed.`);
//     } catch (err) {
//       showFeedback('error', 'Admin override failure.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForceSync = async () => {
//     setLoading(true);
//     try {
//       await appsScriptService.syncSummary();
//       showFeedback('success', 'Full Sheet Recalculated Successfully.');
//     } catch (err) {
//       showFeedback('error', 'Refresh failure.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminAuth = () => {
//     if (adminPass === MASTER_PASSWORD) {
//       setIsAdminAuthenticated(true);
//       setAdminPass('');
//     } else {
//       showFeedback('error', 'Invalid Master Password.');
//     }
//   };

//   const showFeedback = (type: 'success' | 'error', msg: string) => {
//     setFeedback({ type, msg });
//     setTimeout(() => setFeedback(null), 5000);
//   };

//   return (
//     <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
//       <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
//         <div className="flex bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">
//           <button onClick={() => setView('EMPLOYEE')} className={`flex-1 py-4 transition-all ${view === 'EMPLOYEE' ? 'bg-slate-800 text-white' : ''}`}>Secure Station</button>
//           <button onClick={() => setView('ADMIN')} className={`flex-1 py-4 transition-all ${view === 'ADMIN' ? 'bg-slate-800 text-white' : ''}`}>HR Command</button>
//         </div>

//         <div className={`${view === 'ADMIN' ? 'bg-[#312e81]' : 'bg-slate-900'} p-8 text-white transition-colors duration-500`}>
//           <div className="flex justify-between items-end">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <div className={`w-2 h-2 rounded-full ${locationState.status === 'in_range' ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
//                 <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Matrix Protocol v16.9</span>
//               </div>
//               <h1 className="text-2xl font-bold">{view === 'ADMIN' ? 'Master Controls' : 'Biometric Access'}</h1>
//             </div>
//             <div className="text-right">
//               <p className="text-3xl font-mono text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//               <p className="text-[10px] font-bold text-white/40 uppercase">{currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
//             </div>
//           </div>
//         </div>

//         <div className="p-8 space-y-6">
//           {feedback && (
//             <div className={`p-4 rounded-2xl text-xs font-bold border animate-bounce ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
//               {feedback.msg}
//             </div>
//           )}

//           {view === 'ADMIN' && !isAdminAuthenticated ? (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Authorization</label>
//                 <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 focus:ring-4 focus:ring-indigo-100 outline-none text-center tracking-widest font-bold" />
//               </div>
//               <button onClick={handleAdminAuth} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Authorize Admin Access</button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identify Yourself</label>
//                 <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-semibold outline-none appearance-none">
//                   <option value="">Select Personnel...</option>
//                   {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
//                 </select>
//               </div>

//               {view === 'EMPLOYEE' ? (
//                 <>
//                   <div className="flex bg-slate-100 rounded-2xl p-1">
//                     <button onClick={() => setActionType('signIn')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${actionType === 'signIn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Clock In</button>
//                     <button onClick={() => setActionType('signOut')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${actionType === 'signOut' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Clock Out</button>
//                   </div>
//                   {actionType === 'signIn' && (
//                     <div className="space-y-2">
//                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee PIN</label>
//                       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-center font-bold tracking-[1.5rem] outline-none" />
//                     </div>
//                   )}
//                   <button onClick={handleEmployeeAction} disabled={loading || locationState.status !== 'in_range'} className="w-full h-20 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30 transition-all active:scale-95">
//                     {loading ? 'Transmitting...' : `Execute ${actionType === 'signIn' ? 'Sign-In' : 'Sign-Out'}`}
//                   </button>
//                 </>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Override</label>
//                     <div className="grid grid-cols-2 gap-2">
//                       {LEAVE_OPTIONS.map(opt => (
//                         <button key={opt.code} onClick={() => setAdminSelectedCode(opt.code)} className={`py-3 px-2 rounded-xl font-bold text-[9px] border transition-all text-left ${adminSelectedCode === opt.code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
//                           {opt.label} ({opt.code})
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 gap-3">
//                     <button onClick={handleAdminAction} disabled={loading} className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95">
//                       {loading ? 'Updating Master...' : 'Confirm Override'}
//                     </button>
//                     <button onClick={handleForceSync} disabled={loading} className="w-full h-12 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-md transition-all active:scale-95">
//                       {loading ? 'Auditing Records...' : 'Full Dynamic Summary Refresh'}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
//             <div className="space-y-1">
//                <p className="text-[8px] font-bold text-slate-400 uppercase">Operational Status</p>
//                <p className="text-[10px] font-bold text-slate-700">{rules.ruleName}</p>
//             </div>
//             <button onClick={checkProximity} className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors">
//                GPS Sync
//             </button>
//           </div>
//         </div>

//         <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between text-[8px] font-black uppercase text-slate-400">
//           <span>{locationState.status === 'in_range' ? '✅ Biometric Match' : '❌ Location Blocked'}</span>
//           <span>Protocol: V16.9 FINAL</span>
//         </div>
//       </div>
//     </div>
//   );
// }


































// import React, { useState, useEffect, useMemo } from 'react';
// import { MOCK_EMPLOYEES, MASTER_PASSWORD } from './constants';
// import { appsScriptService } from './services/googleAppsScriptService';

// const OFFICE_LAT = 24.530833;
// const OFFICE_LNG = 73.682943;
// const ALLOWED_RADIUS_METERS = 300;

// export default function App() {
//   const [view, setView] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
//   const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
//   const [adminPass, setAdminPass] = useState('');
  
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
//   const [password, setPassword] = useState('');
  
//   // Status codes tracked by the v17.0 backend summary auditor
//   const LEAVE_OPTIONS = [ 
//     { label: 'Present', code: 'P' },
//     { label: 'Absent (Uninformed)', code: 'A' },
//     { label: 'Paid Leave', code: 'PL' },
//     { label: 'Unpaid Leave', code: 'UL' },
//     { label: 'Sick Leave', code: 'SL' },
//     { label: 'Half Day', code: 'HD' },
//     { label: 'Office Holiday', code: 'OH' },
//     { label: 'Weekend Off', code: 'WEH' }
//   ];
  
//   const [adminSelectedCode, setAdminSelectedCode] = useState('P');
//   const [loading, setLoading] = useState(false);
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [actionType, setActionType] = useState<'signIn' | 'signOut'>('signIn');
      
//   const [locationState, setLocationState] = useState<{
//     status: 'idle' | 'checking' | 'in_range' | 'out_of_range' | 'error';
//     distance?: number;
//   }>({ status: 'idle' });

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     checkProximity();
//     return () => clearInterval(timer);
//   }, []);

//   const rules = useMemo(() => {
//     const date = currentTime;
//     const day = date.getDay(); 
//     let ruleName = "Active Shift";
//     if (day === 0) ruleName = "Sunday: Weekly Off";
//     else if (day === 6) {
//       const weekOfMonth = Math.ceil(date.getDate() / 7);
//       if (weekOfMonth === 1 || weekOfMonth === 3 || weekOfMonth === 5) {
//         ruleName = `${weekOfMonth}${weekOfMonth === 1 ? 'st' : weekOfMonth === 3 ? 'rd' : 'th'} Sat: Off`;
//       }
//     }
//     return { ruleName };
//   }, [currentTime]);

//   const checkProximity = () => {
//     if (!navigator.geolocation) return setLocationState({ status: 'error' });
//     setLocationState(prev => ({ ...prev, status: 'checking' }));
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const R = 6371e3;
//         const φ1 = pos.coords.latitude * Math.PI / 180;
//         const φ2 = OFFICE_LAT * Math.PI / 180;
//         const Δφ = (OFFICE_LAT - pos.coords.latitude) * Math.PI / 180;
//         const Δλ = (OFFICE_LNG - pos.coords.longitude) * Math.PI / 180;
//         const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const dist = R * c;
//         setLocationState({ status: dist <= ALLOWED_RADIUS_METERS ? 'in_range' : 'out_of_range', distance: Math.round(dist) });
//       },
//       () => setLocationState({ status: 'error' }),
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const handleEmployeeAction = async () => {
//     const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
//     if (!emp) return showFeedback('error', 'Select your name.');
//     if (locationState.status !== 'in_range') return showFeedback('error', `Location Mismatch: ${locationState.distance}m.`);
//     if (actionType === 'signIn' && emp.password !== password) return showFeedback('error', 'Wrong Access PIN.');
    
//     setLoading(true);
//     try {
//       if (actionType === 'signIn') {
//         await appsScriptService.saveSignIn(emp.id, emp.name);
//         showFeedback('success', `Signed In! Attendance marked.`);
//       } else {
//         await appsScriptService.saveSignOut(emp.id, emp.name);
//         showFeedback('success', `Signed Out! TT calculated.`);
//       }
//       setPassword('');
//     } catch (err) {
//       showFeedback('error', 'Sync failed. Retry required.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminAction = async () => {
//     const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
//     if (!emp) return showFeedback('error', 'Select personnel.');

//     setLoading(true);
//     try {
//       await appsScriptService.adminMarkStatus(emp.name, adminSelectedCode);
//       showFeedback('success', `${emp.name} updated to ${adminSelectedCode}. Matrix Refreshed.`);
//     } catch (err) {
//       showFeedback('error', 'Admin sync error.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForceSync = async () => {
//     setLoading(true);
//     try {
//       await appsScriptService.syncSummary();
//       showFeedback('success', 'Global Audit Recalculated Successfully.');
//     } catch (err) {
//       showFeedback('error', 'Refresh failure.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminAuth = () => {
//     if (adminPass === MASTER_PASSWORD) {
//       setIsAdminAuthenticated(true);
//       setAdminPass('');
//     } else {
//       showFeedback('error', 'Access Denied.');
//     }
//   };

//   const showFeedback = (type: 'success' | 'error', msg: string) => {
//     setFeedback({ type, msg });
//     setTimeout(() => setFeedback(null), 5000);
//   };

//   return (
//     <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
//       <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
//         <div className="flex bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">
//           <button onClick={() => setView('EMPLOYEE')} className={`flex-1 py-4 transition-all ${view === 'EMPLOYEE' ? 'bg-slate-800 text-white' : ''}`}>Secure Station</button>
//           <button onClick={() => setView('ADMIN')} className={`flex-1 py-4 transition-all ${view === 'ADMIN' ? 'bg-slate-800 text-white' : ''}`}>System Command</button>
//         </div>

//         <div className={`${view === 'ADMIN' ? 'bg-[#312e81]' : 'bg-slate-900'} p-8 text-white transition-colors duration-500`}>
//           <div className="flex justify-between items-end">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <div className={`w-2 h-2 rounded-full ${locationState.status === 'in_range' ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
//                 <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Matrix v17.0 Stable</span>
//               </div>
//               <h1 className="text-2xl font-bold">{view === 'ADMIN' ? 'HR Dashboard' : 'Biometric Access'}</h1>
//             </div>
//             <div className="text-right">
//               <p className="text-3xl font-mono text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//               <p className="text-[10px] font-bold text-white/40 uppercase">{currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
//             </div>
//           </div>
//         </div>

//         <div className="p-8 space-y-6">
//           {feedback && (
//             <div className={`p-4 rounded-2xl text-xs font-bold border animate-bounce ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
//               {feedback.msg}
//             </div>
//           )}

//           {view === 'ADMIN' && !isAdminAuthenticated ? (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Key</label>
//                 <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 focus:ring-4 focus:ring-indigo-100 outline-none text-center tracking-widest font-bold" />
//               </div>
//               <button onClick={handleAdminAuth} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Authorize Admin Access</button>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               <div className="space-y-2">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Personnel</label>
//                 <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-semibold outline-none appearance-none">
//                   <option value="">Identify Personnel...</option>
//                   {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
//                 </select>
//               </div>

//               {view === 'EMPLOYEE' ? (
//                 <>
//                   <div className="flex bg-slate-100 rounded-2xl p-1">
//                     <button onClick={() => setActionType('signIn')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${actionType === 'signIn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Clock In</button>
//                     <button onClick={() => setActionType('signOut')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${actionType === 'signOut' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Clock Out</button>
//                   </div>
//                   {actionType === 'signIn' && (
//                     <div className="space-y-2">
//                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee PIN</label>
//                       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-center font-bold tracking-[1.5rem] outline-none" />
//                     </div>
//                   )}
//                   <button onClick={handleEmployeeAction} disabled={loading || locationState.status !== 'in_range'} className="w-full h-20 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30 transition-all active:scale-95">
//                     {loading ? 'Transmitting...' : `Execute ${actionType === 'signIn' ? 'Sign-In' : 'Sign-Out'}`}
//                   </button>
//                 </>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Override</label>
//                     <div className="grid grid-cols-2 gap-2">
//                       {LEAVE_OPTIONS.map(opt => (
//                         <button key={opt.code} onClick={() => setAdminSelectedCode(opt.code)} className={`py-3 px-2 rounded-xl font-bold text-[9px] border transition-all text-left ${adminSelectedCode === opt.code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
//                           {opt.label} ({opt.code})
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 gap-3">
//                     <button onClick={handleAdminAction} disabled={loading} className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95">
//                       {loading ? 'Updating Matrix...' : 'Commit Status Update'}
//                     </button>
//                     <button onClick={handleForceSync} disabled={loading} className="w-full h-12 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-md transition-all active:scale-95">
//                       {loading ? 'Auditing History...' : 'Force Global Summary Refresh'}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
//             <div className="space-y-1">
//                <p className="text-[8px] font-bold text-slate-400 uppercase">Operational Rules</p>
//                <p className="text-[10px] font-bold text-slate-700">{rules.ruleName}</p>
//             </div>
//             <button onClick={checkProximity} className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors">
//                GPS Audit
//             </button>
//           </div>
//         </div>

//         <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between text-[8px] font-black uppercase text-slate-400">
//           <span>{locationState.status === 'in_range' ? '✅ Security Verified' : '❌ Signal Blocked'}</span>
//           <span>Security Protocol: V17.0 FINAL</span>
//         </div>
//       </div>
//     </div>
//   );
// }



























import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_EMPLOYEES, MASTER_PASSWORD } from './constants';
import { appsScriptService } from './services/googleAppsScriptService';

const OFFICE_LAT = 24.530833;
const OFFICE_LNG = 73.682943;
const ALLOWED_RADIUS_METERS = 300;

export default function App() {
  const [view, setView] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  
  const LEAVE_OPTIONS = [ 
    { label: 'Present', code: 'P' },
    { label: 'Absent (Uninformed)', code: 'A' },
    { label: 'Paid Leave', code: 'PL' },
    { label: 'Unpaid Leave', code: 'UL' },
    { label: 'Sick Leave', code: 'SL' },
    { label: 'Half Day', code: 'HD' },
    { label: 'Office Holiday', code: 'OH' },
    { label: 'Weekend Off', code: 'WEH' }
  ];
  
  const [adminSelectedCode, setAdminSelectedCode] = useState('P');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionType, setActionType] = useState<'signIn' | 'signOut'>('signIn');
  
  const [locationState, setLocationState] = useState<{
    status: 'idle' | 'checking' | 'in_range' | 'out_of_range' | 'error';
    distance?: number;
  }>({ status: 'idle' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    checkProximity();
    return () => clearInterval(timer);
  }, []);

  const rules = useMemo(() => {
    const date = currentTime;
    const day = date.getDay(); 
    let ruleName = "Standard Working Shift";
    if (day === 0) ruleName = "Sunday: Weekly Holiday";
    else if (day === 6) {
      const weekOfMonth = Math.ceil(date.getDate() / 7);
      if (weekOfMonth === 1 || weekOfMonth === 3 || weekOfMonth === 5) {
        ruleName = `${weekOfMonth}${weekOfMonth === 1 ? 'st' : weekOfMonth === 3 ? 'rd' : 'th'} Sat: Office Off`;
      }
    }
    return { ruleName };
  }, [currentTime]);

  const checkProximity = () => {
    if (!navigator.geolocation) return setLocationState({ status: 'error' });
    setLocationState(prev => ({ ...prev, status: 'checking' }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const R = 6371e3;
        const φ1 = pos.coords.latitude * Math.PI / 180;
        const φ2 = OFFICE_LAT * Math.PI / 180;
        const Δφ = (OFFICE_LAT - pos.coords.latitude) * Math.PI / 180;
        const Δλ = (OFFICE_LNG - pos.coords.longitude) * Math.PI / 180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        setLocationState({ status: dist <= ALLOWED_RADIUS_METERS ? 'in_range' : 'out_of_range', distance: Math.round(dist) });
      },
      () => setLocationState({ status: 'error' }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleEmployeeAction = async () => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
    if (!emp) return showFeedback('error', 'Identify yourself.');
    if (locationState.status !== 'in_range') return showFeedback('error', `Location denied: ${locationState.distance}m away.`);
    if (actionType === 'signIn' && emp.password !== password) return showFeedback('error', 'Incorrect Access PIN.');
    
    setLoading(true);
    try {
      if (actionType === 'signIn') {
        await appsScriptService.saveSignIn(emp.id, emp.name);
        showFeedback('success', `Signed In! Data synced to cloud.`);
      } else {
        await appsScriptService.saveSignOut(emp.id, emp.name);
        showFeedback('success', `Signed Out! Session completed.`);
      }
      setPassword('');
    } catch (err) {
      showFeedback('error', 'Cloud sync failure. Retry recommended.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async () => {
    const emp = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
    if (!emp) return showFeedback('error', 'Select personnel.');

    setLoading(true);
    try {
      await appsScriptService.adminMarkStatus(emp.name, adminSelectedCode);
      showFeedback('success', `${emp.name} updated to ${adminSelectedCode}. Summary refreshed.`);
    } catch (err) {
      showFeedback('error', 'Sync error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setLoading(true);
    try {
      await appsScriptService.syncSummary();
      showFeedback('success', 'Full Audit Recalculated for this month.');
    } catch (err) {
      showFeedback('error', 'Refresh failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleRebuildCalendar = async () => {
    if (!confirm("This will RESET the calendar structure for the CURRENT month to fix day counts. Proceed?")) return;
    setLoading(true);
    try {
      await appsScriptService.postToScript({ 
        action: 'rebuildCalendar', 
        dateHeader: appsScriptService.getDateHeaderFormat(),
        employee: 'Admin'
      });
      showFeedback('success', 'Calendar Repaired (Feb is now 28 days).');
    } catch (err) {
      showFeedback('error', 'Repair failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = () => {
    if (adminPass === MASTER_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminPass('');
    } else {
      showFeedback('error', 'Invalid Master Key.');
    }
  };

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <button onClick={() => setView('EMPLOYEE')} className={`flex-1 py-4 transition-all ${view === 'EMPLOYEE' ? 'bg-slate-800 text-white' : ''}`}>Secure Station</button>
          <button onClick={() => setView('ADMIN')} className={`flex-1 py-4 transition-all ${view === 'ADMIN' ? 'bg-slate-800 text-white' : ''}`}>HR Command</button>
        </div>

        <div className={`${view === 'ADMIN' ? 'bg-[#312e81]' : 'bg-slate-900'} p-8 text-white transition-colors duration-500`}>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${locationState.status === 'in_range' ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
                <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Matrix v17.5 Pro</span>
              </div>
              <h1 className="text-2xl font-bold">{view === 'ADMIN' ? 'Admin Dashboard' : 'Digital Punch-In'}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-mono text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[10px] font-bold text-white/40 uppercase">{currentTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold border animate-bounce ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
              {feedback.msg}
            </div>
          )}

          {view === 'ADMIN' && !isAdminAuthenticated ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Access Code</label>
                <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="••••" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 focus:ring-4 focus:ring-indigo-100 outline-none text-center tracking-widest font-bold" />
              </div>
              <button onClick={handleAdminAuth} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Unlock HR System</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Personnel</label>
                <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-semibold outline-none appearance-none">
                  <option value="">Choose Employee...</option>
                  {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              {view === 'EMPLOYEE' ? (
                <>
                  <div className="flex bg-slate-100 rounded-2xl p-1">
                    <button onClick={() => setActionType('signIn')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${actionType === 'signIn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Clock In</button>
                    <button onClick={() => setActionType('signOut')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${actionType === 'signOut' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Clock Out</button>
                  </div>
                  {actionType === 'signIn' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal PIN</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-center font-bold tracking-[1.5rem] outline-none" />
                    </div>
                  )}
                  <button onClick={handleEmployeeAction} disabled={loading || locationState.status !== 'in_range'} className="w-full h-20 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-30 transition-all active:scale-95">
                    {loading ? 'Processing...' : `Execute ${actionType === 'signIn' ? 'Sign-In' : 'Sign-Out'}`}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Override</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LEAVE_OPTIONS.map(opt => (
                        <button key={opt.code} onClick={() => setAdminSelectedCode(opt.code)} className={`py-3 px-2 rounded-xl font-bold text-[9px] border transition-all text-left ${adminSelectedCode === opt.code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {opt.label} ({opt.code})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={handleAdminAction} disabled={loading} className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95">
                      {loading ? 'Updating...' : 'Commit Status Update'}
                    </button>
                    <div className="flex gap-2">
                      <button onClick={handleForceSync} disabled={loading} className="flex-1 h-12 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-md transition-all active:scale-95">
                        {loading ? 'Processing...' : 'Recalculate Summary'}
                      </button>
                      <button onClick={handleRebuildCalendar} disabled={loading} className="flex-1 h-12 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-md transition-all active:scale-95">
                        Repair Calendar Days
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[8px] font-bold text-slate-400 uppercase">Policy Check</p>
               <p className="text-[10px] font-bold text-slate-700">{rules.ruleName}</p>
            </div>
            <button onClick={checkProximity} className="text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors">
               GPS Audit
            </button>
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between text-[8px] font-black uppercase text-slate-400">
          <span>{locationState.status === 'in_range' ? '✅ Security Verified' : '❌ Signal Blocked'}</span>
          <span>Security Protocol: V17.5 FINAL</span>
        </div>
      </div>
    </div>
  );
}
