import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, Package, Phone, Star, Plus, Search, 
  ArrowUpRight, ArrowDownLeft, Trash2, History, 
  DollarSign, AlertCircle, X, Check,
  LayoutDashboard, Edit, Printer, Filter, Factory, Settings,
  Menu, Bell, ChevronDown, MoreHorizontal, Home, Briefcase, 
  Calendar, TrendingUp, Wallet, ShieldCheck, LogOut, UserCheck, Lock,
  FileSpreadsheet, CreditCard, CalendarCheck, CheckCircle2, BarChart3,
  Trello, CheckSquare, Wrench, Clock, Activity, Hammer, CalendarDays, AlertTriangle,
  ChevronRight, ChevronLeft, GripVertical, Move, Box, Truck, Database, Save, Download, Upload
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, 
  doc, onSnapshot, serverTimestamp, query, orderBy, deleteDoc, getDocs, setDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, signOut } from 'firebase/auth';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyBrhp-6gg5MSv5VTbueq5lnQJCk_EO1i-8",
  authDomain: "crm-nsp-e80c4.firebaseapp.com",
  projectId: "crm-nsp-e80c4",
  storageBucket: "crm-nsp-e80c4.firebasestorage.app",
  messagingSenderId: "219863177118",
  appId: "1:219863177118:web:9b2240e2ce5745b3f9288f",
  measurementId: "G-MCT0EEKGKV"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Constants & Config ---
const DEAL_STAGES = [
  { id: 'new', label: 'سرنخ جدید', color: 'border-slate-300 bg-slate-50', icon: Star },
  { id: 'qualification', label: 'ارزیابی کیفی', color: 'border-blue-300 bg-blue-50', icon: Search },
  { id: 'proposal', label: 'پیش‌فاکتور', color: 'border-orange-300 bg-orange-50', icon: FileSpreadsheet },
  { id: 'negotiation', label: 'مذاکره نهایی', color: 'border-purple-300 bg-purple-50', icon: Users },
  { id: 'won', label: 'فروش موفق', color: 'border-emerald-400 bg-emerald-50', icon: CheckCircle2 },
  { id: 'lost', label: 'لغو شده', color: 'border-rose-300 bg-rose-50', icon: X }
];

const formatCurrency = (amount) => amount ? Number(amount).toLocaleString() : '0';

// --- Helper Components ---

const FormInput = ({ label, className = "", ...props }) => (
  <div className={className}>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <input 
        {...props} 
        className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400" 
      />
  </div>
);

const DatePicker = ({ label, value, onChange }) => {
  const toPersianDate = (date) => {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  useEffect(() => {
    if (!value) {
      onChange(toPersianDate(new Date()));
    }
  }, []);

  const handleCalendarPick = (e) => {
    const date = new Date(e.target.value);
    if (!isNaN(date)) {
      onChange(toPersianDate(date));
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="1403/xx/xx"
          className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm text-center font-mono" 
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 overflow-hidden w-6 h-6">
           <CalendarDays className="text-slate-400 pointer-events-none absolute z-10" size={20} />
           <input 
             type="date" 
             className="absolute inset-0 opacity-0 cursor-pointer z-20"
             onChange={handleCalendarPick}
           />
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ type, text }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    role: 'bg-slate-800 text-white border-slate-700', 
    brand: 'bg-orange-100 text-orange-700 border-orange-200' 
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${styles[type] || styles.neutral} inline-flex items-center gap-1`}>
      {text}
    </span>
  );
};

const Modal = ({ title, onClose, children, maxWidth = "max-w-lg" }) => (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity animate-in fade-in duration-200">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col transform transition-all scale-100 animate-in zoom-in-95 duration-200`}>
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-rose-100 hover:text-rose-600 rounded-full text-slate-400 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="p-6 overflow-y-auto bg-white rounded-b-2xl">
        {children}
      </div>
    </div>
  </div>
);

const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
    <div>
      <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{title}</h1>
      {subtitle && <div className="text-slate-500 mt-1.5 font-medium text-sm">{subtitle}</div>}
    </div>
    <div className="flex gap-3 flex-wrap">
      {actions}
    </div>
  </div>
);

const Stat = ({ label, value, icon: Icon, color, trend }) => (
  <Card className="p-5 relative overflow-hidden group border border-slate-100 hover:border-orange-200 transition-colors">
      <div className="flex justify-between items-start mb-3 relative z-10">
          <div className={`p-3 rounded-xl ${color.bg || 'bg-slate-50'} ${color.text || 'text-slate-600'} shadow-sm`}>
              <Icon size={22} />
          </div>
          {trend && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-emerald-100"><TrendingUp size={12}/> {trend}</span>}
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-1 relative z-10 tracking-tight">{value}</h3>
      <p className="text-slate-500 text-xs font-bold relative z-10 uppercase tracking-wide">{label}</p>
  </Card>
);

// --- Login Screen ---
const LoginScreen = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 1. Check Hardcoded Super Admin
    if (username === 'admin' && password === 'admin123') {
      onLogin({ uid: 'super_admin', name: 'مدیر سیستم', role: 'manager', username: 'admin' });
      return;
    }

    // 2. Check Database Users
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      onLogin({ ...foundUser, uid: foundUser.id });
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-800"></div>
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-500 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-orange-500 mb-4 overflow-hidden relative">
             <div className="absolute inset-0 flex items-center justify-center">
                <Factory size={48} className="text-slate-800" />
             </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-2">NAVID SANAT</h1>
          <p className="text-orange-600 font-bold tracking-widest text-xs uppercase">PLAST COMPANY</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput label="نام کاربری" placeholder="نام کاربری خود را وارد کنید" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          <FormInput label="رمز عبور" type="password" placeholder="•••••••" value={password} onChange={e => setPassword(e.target.value)} />
          
          {error && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 p-2 rounded-lg">{error}</p>}

          <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg shadow-slate-300 hover:shadow-xl mt-4 flex items-center justify-center gap-2">
            ورود ایمن
            <Lock size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Customizable Invoice Component ---
const InvoiceBuilder = ({ transaction, customer, item, onClose, userProfile }) => {
  const printRef = useRef();
  const [settings, setSettings] = useState({
    title: 'فاکتور فروش',
    color: '#f97316', // Default Orange
    showLogo: true,
    note: 'این فاکتور تا 48 ساعت دارای اعتبار است.\nهزینه حمل به عهده خریدار می‌باشد.',
    footer: 'آدرس: تهران، شهرک صنعتی، خیابان صنعت، پلاک ۱۱۰ | تلفن: ۰۲۱-۱۲۳۴۵۶۷۸'
  });

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=900');
    printWindow.document.write('<html><head><title>چاپ فاکتور</title><style>body{font-family:tahoma, sans-serif; direction:rtl; text-align:right; padding: 40px; background: #fff;} .print-container{width:100%;} table{width:100%; border-collapse: collapse; margin-top: 20px;} th, td{border: 1px solid #ddd; padding: 12px; text-align: center;} th{background-color: #f8f9fa;} .no-print{display:none;}</style></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal title="تنظیمات و چاپ فاکتور" onClose={onClose} maxWidth="max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4 bg-slate-50 p-4 rounded-xl h-fit">
           <h4 className="font-bold text-slate-700 mb-2 border-b pb-2">شخصی‌سازی</h4>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">عنوان سند</label>
             <select className="w-full border rounded p-2 text-sm" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})}>
               <option>فاکتور فروش</option>
               <option>پیش فاکتور</option>
               <option>صورتحساب</option>
               <option>حواله انبار</option>
             </select>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">رنگ سازمانی</label>
             <div className="flex gap-2">
               {['#f97316', '#3b82f6', '#10b981', '#6366f1', '#1e293b'].map(c => (
                 <button key={c} onClick={() => setSettings({...settings, color: c})} className={`w-6 h-6 rounded-full border-2 ${settings.color === c ? 'border-slate-800 scale-110' : 'border-white'}`} style={{backgroundColor: c}}></button>
               ))}
             </div>
           </div>
           <div className="flex items-center gap-2">
             <input type="checkbox" checked={settings.showLogo} onChange={e => setSettings({...settings, showLogo: e.target.checked})} />
             <span className="text-sm">نمایش لوگو</span>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">توضیحات / شرایط</label>
             <textarea className="w-full border rounded p-2 text-xs h-20" value={settings.note} onChange={e => setSettings({...settings, note: e.target.value})} />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">پاورقی (آدرس/تلفن)</label>
             <textarea className="w-full border rounded p-2 text-xs h-16" value={settings.footer} onChange={e => setSettings({...settings, footer: e.target.value})} />
           </div>
           <button onClick={handlePrint} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition mt-4">
             <Printer size={18} /> چاپ نهایی
           </button>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 border rounded-xl overflow-hidden bg-white shadow-inner p-4 bg-slate-100 overflow-y-auto max-h-[600px]">
           <div ref={printRef} className="bg-white p-8 shadow-lg min-h-[600px] relative text-sm print-container">
              {/* Header Bar */}
              <div className="absolute top-0 left-0 w-full h-2" style={{backgroundColor: '#1e293b'}}></div>
              <div className="absolute top-2 left-0 w-full h-1" style={{backgroundColor: settings.color}}></div>

              <div className="flex justify-between items-start mb-8 mt-6 border-b-2 pb-4" style={{borderColor: '#f1f5f9'}}>
                <div className="flex items-center gap-4">
                   {settings.showLogo && (
                     <div className="text-center border-l-2 pl-4" style={{borderColor: settings.color}}>
                        <h2 className="text-xl font-black text-slate-800">NAVID SANAT</h2>
                        <p className="text-[10px] font-bold tracking-widest uppercase" style={{color: settings.color}}>PLAST COMPANY</p>
                     </div>
                   )}
                   <div>
                      <h1 className="font-bold text-lg text-slate-800">{settings.title}</h1>
                      <p className="text-slate-500 text-xs mt-1">تاریخ: {transaction.createdAt?.toDate().toLocaleDateString('fa-IR')}</p>
                   </div>
                </div>
                <div className="text-left">
                   <div className="bg-slate-50 px-3 py-2 rounded border border-slate-200">
                     <span className="block text-[10px] text-slate-500 mb-1">شماره سند</span>
                     <span className="font-mono font-bold text-base text-slate-800">{transaction.id.slice(0, 8).toUpperCase()}</span>
                   </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-2 border-b pb-1 text-xs">فروشنده</h4>
                  <p className="font-bold text-sm text-slate-800">مجموعه نوید صنعت پلاست</p>
                  <p className="text-slate-500 text-xs mt-1">کارشناس: {transaction.creatorName || userProfile.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-2 border-b pb-1 text-xs">خریدار</h4>
                  <p className="font-bold text-sm text-slate-800">{customer?.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{customer?.company}</p>
                  <p className="text-slate-500 text-xs font-mono">{customer?.phone}</p>
                </div>
              </div>

              <table className="w-full mb-8 text-sm">
                <thead>
                  <tr style={{backgroundColor: '#1e293b', color: 'white'}}>
                    <th className="p-2 text-right">شرح کالا</th>
                    <th className="p-2 text-center">تعداد</th>
                    <th className="p-2 text-center">فی</th>
                    <th className="p-2 text-center">مبلغ کل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b font-bold text-slate-700">{item?.name}</td>
                    <td className="p-3 border-b text-center text-slate-600">{transaction.quantity} <span className="text-[10px]">{item?.unit}</span></td>
                    <td className="p-3 border-b text-center font-mono text-slate-600">{formatCurrency(item?.price)}</td>
                    <td className="p-3 border-b text-center font-mono font-bold text-slate-800">{formatCurrency(transaction.totalPrice)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mb-8">
                <div className="w-1/2 bg-slate-50 p-4 rounded border border-slate-200">
                  <div className="flex justify-between text-xs mb-2"><span>جمع کل:</span><span className="font-mono font-bold">{formatCurrency(transaction.totalPrice)} ت</span></div>
                  <div className="flex justify-between text-xs mb-2 text-emerald-600"><span>پرداختی:</span><span className="font-mono font-bold">{formatCurrency(transaction.paidAmount)} ت</span></div>
                  <div className="h-px bg-slate-200 my-2"></div>
                  <div className="flex justify-between text-sm font-black">
                      <span>مانده:</span>
                      <span style={{color: (transaction.totalPrice - transaction.paidAmount) > 0 ? '#e11d48' : '#10b981'}}>
                          {formatCurrency(transaction.totalPrice - transaction.paidAmount)} ت
                      </span>
                  </div>
                </div>
              </div>

              {(settings.note || settings.footer) && (
                <div className="mt-auto pt-4 border-t border-dashed border-slate-300">
                   {settings.note && <p className="text-xs text-slate-600 whitespace-pre-wrap mb-4 font-medium">{settings.note}</p>}
                   {settings.footer && <p className="text-[10px] text-slate-400 text-center">{settings.footer}</p>}
                </div>
              )}
           </div>
        </div>
      </div>
    </Modal>
  );
};

// --- Settings Module (Admin Only) ---
const SettingsModule = ({ users, onAddUser, onBackup, onRestore }) => {
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'expert' });
  const fileInputRef = useRef(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    onAddUser(newUser);
    setNewUser({ name: '', username: '', password: '', role: 'expert' });
    alert('کاربر جدید با موفقیت ساخته شد.');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(confirm("آیا مطمئن هستید؟ این عملیات داده‌های فعلی را با داده‌های فایل جایگزین/ترکیب می‌کند.")) {
        onRestore(file);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader title="تنظیمات سیستم" subtitle="مدیریت کاربران و داده‌ها (دسترسی مدیر)" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
           <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800"><UserCheck className="text-indigo-600"/> تعریف کاربر جدید</h3>
           <form onSubmit={handleCreate} className="space-y-4">
              <FormInput label="نام و نام خانوادگی" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                 <FormInput label="نام کاربری (انگلیسی)" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="text-left" dir="ltr" />
                 <FormInput label="رمز عبور" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">نقش</label>
                <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="expert">کارشناس فروش</option>
                  <option value="manager">مدیر (دسترسی کامل)</option>
                </select>
              </div>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">ایجاد کاربر</button>
           </form>
        </Card>

        <div className="space-y-6">
           <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Database className="text-emerald-600"/> مدیریت داده‌ها</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                می‌توانید از تمام اطلاعات سیستم پشتیبان بگیرید یا فایل پشتیبان قبلی را بازگردانی کنید.
              </p>
              <div className="flex gap-3">
                <button onClick={onBackup} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                   <Download size={20} /> دانلود بک‌آپ
                </button>
                <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
                   <Upload size={20} /> بازگردانی (Restore)
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleFileChange}
                />
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-800">لیست کاربران سیستم</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                 {users.map((u, i) => (
                   <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-bold text-sm text-slate-700">{u.name}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-400 font-mono">{u.username}</span>
                         <Badge type={u.role === 'manager' ? 'role' : 'neutral'} text={u.role === 'manager' ? 'مدیر' : 'کارشناس'} />
                      </div>
                   </div>
                 ))}
                 {users.length === 0 && <p className="text-slate-400 text-sm">فقط مدیر اصلی فعال است.</p>}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

// --- Sidebar ---
const Sidebar = ({ activeModule, setModule, userProfile, onLogout, tasks }) => {
  const urgentTasksCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-300 h-screen sticky top-0 overflow-y-auto shrink-0 z-50">
      <div className="p-6 pb-2 border-b border-slate-800/50">
        <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-orange-500 relative overflow-hidden"><Factory className="text-slate-800" size={28} /></div><div><h1 className="font-black text-lg text-white tracking-tight leading-tight">نوید صنعت</h1><p className="text-[10px] text-orange-500 font-bold tracking-wider">PLAST COMPANY</p></div></div>
      </div>
      <div className="flex-1 px-4 space-y-1 mt-6">
         <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">مدیریت فروش</p>
         {[{ id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد' }, { id: 'deals', icon: Trello, label: 'کاریز فروش' }, { id: 'customers', icon: Users, label: 'مشتریان' }].map(item => (
           <button key={item.id} onClick={() => setModule(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeModule === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 translate-x-1' : 'hover:bg-slate-800 hover:text-white'}`}><item.icon size={18} /> {item.label}</button>
         ))}
         <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">عملیات و انبار</p>
         {[{ id: 'inventory', icon: Package, label: 'انبار و محصولات' }, { id: 'transactions', icon: Wallet, label: 'امور مالی' }, { id: 'tasks', icon: CheckSquare, label: 'وظایف و تقویم', badge: urgentTasksCount }, { id: 'support', icon: Wrench, label: 'پشتیبانی و نصب' }].map(item => (
           <button key={item.id} onClick={() => setModule(item.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeModule === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 translate-x-1' : 'hover:bg-slate-800 hover:text-white'}`}><div className="flex items-center gap-3"><item.icon size={18} /> {item.label}</div>{item.badge > 0 && <span className="bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">{item.badge}</span>}</button>
         ))}
         {userProfile.role === 'manager' && (
           <>
             <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-8">مدیریت</p>
             <button onClick={() => setModule('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${activeModule === 'settings' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Settings size={18} /> تنظیمات و کاربران</button>
           </>
         )}
      </div>
      <div className="p-4 mt-auto"><div className="bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between border border-slate-700/50"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-slate-700 ${userProfile.role === 'manager' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>{userProfile.name[0]}</div><div className="overflow-hidden"><p className="text-xs text-white font-bold truncate w-20">{userProfile.name}</p><p className="text-[9px] text-slate-400 font-bold opacity-80">{userProfile.role === 'manager' ? 'مدیر فروش' : 'کارشناس'}</p></div></div><button onClick={onLogout} className="text-slate-400 hover:text-rose-400 p-2 transition"><LogOut size={16} /></button></div></div>
    </aside>
  );
};

const MobileNav = ({ activeModule, setModule, tasks }) => {
    const urgentTasksCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center z-50 shadow-2xl safe-area-bottom">
         {[{id:'dashboard', icon:LayoutDashboard}, {id:'deals', icon:Trello}, {id:'tasks', icon:CheckSquare, badge:urgentTasksCount}, {id:'customers', icon:Users}].map(item=><button key={item.id} onClick={() => setModule(item.id)} className={`p-3 rounded-2xl transition-all relative ${activeModule === item.id ? 'text-orange-500 bg-slate-800' : 'text-slate-400'}`}><item.icon size={24} />{item.badge > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>}</button>)}
      </div>
    );
};

// --- MODULES ---

// 1. Dashboard Module
const DashboardModule = ({ customers, inventory, transactions, userProfile }) => {
  const myCustomers = userProfile.role === 'manager' ? customers : customers.filter(c => c.createdBy === userProfile.uid);
  const totalDebt = myCustomers.reduce((sum, c) => c.debt > 0 ? sum + c.debt : sum, 0);
  const upcomingCheques = transactions.filter(t => t.paymentMethod === 'cheque' && t.chequeDate).slice(0, 3);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <PageHeader title={`داشبورد ${userProfile.name}`} subtitle="نمای کلی وضعیت شرکت" />
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><Stat label="طلبکاری کل" value={`${(totalDebt/1000000).toFixed(1)} M`} icon={ArrowUpRight} color={{bg:'bg-rose-50', text:'text-rose-600'}} trend="+5%" /><Stat label="مشتریان من" value={myCustomers.length} icon={Users} color={{bg:'bg-slate-50', text:'text-slate-600'}} /><Stat label="محصولات انبار" value={inventory.length} icon={Package} color={{bg:'bg-emerald-50', text:'text-emerald-600'}} /><Stat label="چک‌های در راه" value={upcomingCheques.length} icon={CalendarCheck} color={{bg:'bg-orange-50', text:'text-orange-600'}} /></div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Card className="p-6"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><History className="text-orange-500"/> آخرین تراکنش‌ها</h3><div className="space-y-3">{transactions.slice(0, 5).map(t => (<div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${t.type==='in'?'bg-emerald-100 text-emerald-600':'bg-rose-100 text-rose-600'}`}>{t.type==='in'?<ArrowDownLeft size={16}/>:<ArrowUpRight size={16}/>}</div><span className="text-sm font-bold text-slate-700">{t.type==='in'?'شارژ انبار':'فروش کالا'}</span></div><span className="font-mono text-sm font-bold">{formatCurrency(t.totalPrice)}</span></div>))}</div></Card><Card className="p-6"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CalendarCheck className="text-orange-500"/> چک‌های نزدیک</h3><div className="space-y-3">{upcomingCheques.map(t => (<div key={t.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100"><span className="text-sm font-bold text-slate-700">سررسید: {t.chequeDate}</span><span className="font-mono text-sm font-bold text-orange-700">{formatCurrency(t.totalPrice)}</span></div>))}</div></Card></div>
    </div>
  );
};

// 2. Tasks Module
const TasksModule = ({ tasks, onAddTask, onCompleteTask, userProfile }) => {
  const [taskForm, setTaskForm] = useState({ title: '', date: '', priority: 'normal' });
  const myTasks = userProfile.role === 'manager' ? tasks : tasks.filter(t => t.createdBy === userProfile.uid);
  const handleSubmit = (e) => { e.preventDefault(); onAddTask(taskForm); setTaskForm({ title: '', date: '', priority: 'normal' }); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6"><Card className="p-6 border-t-4 border-slate-800"><h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800"><Plus className="text-orange-600"/> وظیفه جدید</h3><form onSubmit={handleSubmit} className="space-y-5"><FormInput label="عنوان کار" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} /><DatePicker label="مهلت (ددلاین)" value={taskForm.date} onChange={val => setTaskForm({...taskForm, date: val})} /><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">اولویت</label><div className="flex gap-2"><button type="button" onClick={() => setTaskForm({...taskForm, priority: 'normal'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${taskForm.priority === 'normal' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400'}`}>معمولی</button><button type="button" onClick={() => setTaskForm({...taskForm, priority: 'high'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border ${taskForm.priority === 'high' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400'}`}>فوری</button></div></div><button className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 shadow-lg transition">ثبت در تقویم</button></form></Card></div>
      <div className="lg:col-span-2"><PageHeader title="تقویم کاری" subtitle="مدیریت زمان" /><div className="space-y-3">{myTasks.filter(t => !t.completed).map(task => (<div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all hover:translate-x-1 ${task.priority === 'high' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'}`}><div className="flex items-center gap-4"><button onClick={() => onCompleteTask(task.id)} className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center justify-center text-emerald-600"><Check size={14} className="opacity-0 hover:opacity-100"/></button><div><p className="font-bold text-sm text-slate-800">{task.title}</p><p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><CalendarDays size={12}/> مهلت: {task.date}</p></div></div>{task.priority === 'high' && <Badge type="danger" text="فوری" />}</div>))}</div></div>
    </div>
  );
};

// 3. Support Module
const SupportModule = ({ tickets, customers, onAddTicket, onUpdateTicket, userProfile }) => {
  const [view, setView] = useState('tickets');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInstallModalOpen, setInstallModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', customerId: '', priority: 'medium', status: 'open', description: '' });
  const [installForm, setInstallForm] = useState({ customerId: '', deviceName: '', date: '', installer: '' });
  const [installations, setInstallations] = useState([]); // Mock, normally in DB

  const handleSubmit = (e) => { e.preventDefault(); onAddTicket(form); setModalOpen(false); setForm({ subject: '', customerId: '', priority: 'medium', status: 'open', description: '' }); };
  const handleInstallSubmit = (e) => { e.preventDefault(); setInstallations([...installations, { ...installForm, id: Date.now() }]); setInstallModalOpen(false); setInstallForm({ customerId: '', deviceName: '', date: '', installer: '' }); };

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader title="پشتیبانی و نصب" subtitle="خدمات پس از فروش" actions={<div className="flex gap-2"><button onClick={() => setView('installations')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${view === 'installations' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>نصب و راه‌اندازی</button><button onClick={() => setView('tickets')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${view === 'tickets' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>تیکت‌ها</button></div>} />
      {view === 'tickets' ? (
        <>
          <div className="mb-6 flex justify-end"><button onClick={() => setModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg"><Plus size={18} /> ثبت درخواست</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{tickets.map(ticket => (<Card key={ticket.id} className="p-5 border-l-4 border-l-indigo-500"><div className="flex justify-between items-start mb-3"><Badge type={ticket.status === 'open' ? 'warning' : 'success'} text={ticket.status === 'open' ? 'در حال بررسی' : 'تکمیل شده'} /><span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">{ticket.createdAt?.toDate().toLocaleDateString('fa-IR')}</span></div><h3 className="font-bold text-slate-800 mb-1">{ticket.subject}</h3><p className="text-xs text-slate-500 mb-4 flex items-center gap-1"><Users size={12}/> {customers.find(c => c.id === ticket.customerId)?.name}</p><p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl mb-4 line-clamp-3 leading-relaxed">{ticket.description}</p>{ticket.status === 'open' && (<button onClick={() => onUpdateTicket(ticket.id, { status: 'closed' })} className="w-full py-2.5 border-2 border-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-50 text-sm font-bold transition">بستن تیکت</button>)}</Card>))}</div>
        </>
      ) : (
        <>
          <div className="mb-6 flex justify-end"><button onClick={() => setInstallModalOpen(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg"><Hammer size={18} /> زمان‌بندی نصب</button></div>
          <div className="space-y-4">{installations.map(inst => (<div key={inst.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Hammer size={24} /></div><div><h4 className="font-bold text-slate-800">{inst.deviceName}</h4><p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Users size={12}/> {customers.find(c => c.id === inst.customerId)?.name}</p></div></div><div className="text-left"><div className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg mb-1">{inst.date}</div><p className="text-xs text-slate-400">نصاب: {inst.installer}</p></div></div>))}</div>
        </>
      )}
      {isModalOpen && (<Modal title="ثبت تیکت تعمیرات" onClose={() => setModalOpen(false)}><form onSubmit={handleSubmit} className="space-y-5"><FormInput label="موضوع" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">مشتری</label><select required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}><option value="">انتخاب کنید...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">شرح مشکل</label><textarea className="w-full bg-white border border-slate-300 rounded-lg p-3 h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div><button className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold mt-2 shadow-lg">ثبت درخواست</button></form></Modal>)}
      {isInstallModalOpen && (<Modal title="برنامه‌ریزی نصب دستگاه" onClose={() => setInstallModalOpen(false)}><form onSubmit={handleInstallSubmit} className="space-y-5"><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">مشتری</label><select required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3" value={installForm.customerId} onChange={e => setInstallForm({...installForm, customerId: e.target.value})}><option value="">انتخاب کنید...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><FormInput label="نام دستگاه" value={installForm.deviceName} onChange={e => setInstallForm({...installForm, deviceName: e.target.value})} /><DatePicker label="تاریخ نصب" value={installForm.date} onChange={val => setInstallForm({...installForm, date: val})} /><FormInput label="نام نصاب" value={installForm.installer} onChange={e => setInstallForm({...installForm, installer: e.target.value})} /><button className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-bold mt-2">ثبت نصب</button></form></Modal>)}
    </div>
  );
};

// 4. Customers Module
const CustomersModule = ({ customers, onAdd, onEdit, onSelect, onToggleStar, userProfile }) => {
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState({ name: '', phone: '', company: '' });
  const filteredCustomers = userProfile.role === 'manager' ? customers : customers.filter(c => c.createdBy === userProfile.uid);
  const handleSubmit = (e) => { e.preventDefault(); onAdd(formData); setFormData({ name: '', phone: '', company: '' }); setView('list'); };
  return (
    <div className="animate-in fade-in duration-500"><PageHeader title="مشتریان" actions={view === 'list' ? <button onClick={() => setView('create')} className="bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 flex items-center gap-2"><Plus size={18} /> افزودن</button> : <button onClick={() => setView('list')} className="bg-white border px-5 py-2.5 rounded-xl text-sm font-bold">بازگشت</button>} />{view === 'create' ? (<div className="max-w-xl mx-auto mt-10"><Card className="p-8 border-t-4 border-slate-800"><h3 className="text-xl font-black text-slate-800 mb-8">اطلاعات مشتری</h3><form onSubmit={handleSubmit} className="space-y-6"><FormInput label="نام و نام خانوادگی" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus /><FormInput label="شرکت / فروشگاه" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /><FormInput label="تلفن" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="text-left" dir="ltr" /><button type="submit" className="bg-slate-800 text-white w-full py-4 rounded-xl font-bold mt-4 hover:bg-slate-900">ذخیره</button></form></Card></div>) : (<Card className="overflow-hidden"><table className="w-full text-right"><thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200"><tr><th className="px-6 py-4">مشتری</th><th className="px-6 py-4">تلفن</th><th className="px-6 py-4">وضعیت</th><th className="px-6 py-4">عملیات</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredCustomers.map(c => (<tr key={c.id} className="hover:bg-slate-50 group cursor-pointer" onClick={() => onSelect(c)}><td className="px-6 py-4 font-bold text-slate-800">{c.name}</td><td className="px-6 py-4 font-mono text-slate-500">{c.phone}</td><td className="px-6 py-4"><Badge type={c.debt > 0 ? 'danger' : 'success'} text={c.debt > 0 ? 'بدهکار' : 'تسویه'} /></td><td className="px-6 py-4"><button onClick={(e) => {e.stopPropagation(); onEdit(c)}} className="p-2 bg-slate-100 rounded-lg hover:bg-orange-100 hover:text-orange-600"><Edit size={16}/></button></td></tr>))}</tbody></table></Card>)}</div>
  );
};

// 5. Customer Detail
const CustomerDetail = ({ customer, onBack, interactions, onAddInteraction, transactions }) => {
  const [note, setNote] = useState('');
  const custInteractions = interactions.filter(i => i.customerId === customer.id).sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds);
  return (
    <div className="animate-in slide-in-from-right-4 duration-500"><PageHeader title={customer.name} actions={<button onClick={onBack} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold">بازگشت</button>} /><div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><Card className="p-6 h-fit"><h4 className="font-bold mb-4">ثبت تعامل</h4><textarea className="w-full border rounded-xl p-3 h-32 text-sm" value={note} onChange={e=>setNote(e.target.value)}/><button onClick={()=>{if(note) onAddInteraction(customer.id, note)}} className="mt-3 w-full bg-orange-600 text-white py-2 rounded-xl font-bold">ذخیره</button></Card><Card className="lg:col-span-2 p-6"><h4 className="font-bold mb-4">تاریخچه</h4><div className="space-y-4">{custInteractions.map(i=><div key={i.id} className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700">{i.note}</div>)}</div></Card></div></div>
  );
};

// 6. Deals Module (FIXED DELETE BUTTON)
const DealsModule = ({ deals, customers, onAddDeal, onUpdateDealStatus, onDeleteDeal, userProfile }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: '', value: 0, customerId: '', description: '' });
  const [activeDraggable, setActiveDraggable] = useState(null);
  const myDeals = userProfile.role === 'manager' ? deals : deals.filter(d => d.createdBy === userProfile.uid);
  const handleAdd = (e) => { e.preventDefault(); onAddDeal({ ...newDeal, stage: 'new' }); setModalOpen(false); setNewDeal({ title: '', value: 0, customerId: '', description: '' }); };
  const moveStage = (dealId, currentStageId, direction) => { const currentIndex = DEAL_STAGES.findIndex(s => s.id === currentStageId); if (direction === 'next' && currentIndex < DEAL_STAGES.length - 1) onUpdateDealStatus(dealId, DEAL_STAGES[currentIndex + 1].id); else if (direction === 'prev' && currentIndex > 0) onUpdateDealStatus(dealId, DEAL_STAGES[currentIndex - 1].id); };
  const handleDragStart = (e, dealId) => { e.dataTransfer.setData("dealId", dealId); e.dataTransfer.effectAllowed = "move"; setActiveDraggable(dealId); };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e, stageId) => { e.preventDefault(); const dealId = e.dataTransfer.getData("dealId"); if (dealId) onUpdateDealStatus(dealId, stageId); setActiveDraggable(null); };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500"><PageHeader title="کاریز فروش" subtitle="نمای بصری از وضعیت پروژه‌ها" actions={<button onClick={() => setModalOpen(true)} className="bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-orange-700 flex items-center gap-2 shadow-lg"><Plus size={18} /> فرصت جدید</button>} /><div className="flex-1 overflow-x-auto overflow-y-hidden pb-4"><div className="flex gap-5 h-full min-w-max px-1">{DEAL_STAGES.map((stage, idx) => { const stageDeals = myDeals.filter(d => d.stage === stage.id); const stageValue = stageDeals.reduce((sum, d) => sum + (parseInt(d.value) || 0), 0); return (<div key={stage.id} className="w-80 flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm transition-colors" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)}><div className="p-4 border-b border-slate-200 bg-white/50 rounded-t-2xl backdrop-blur-sm"><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><div className={`p-1.5 rounded-lg ${stage.color} bg-opacity-20`}><stage.icon size={14} className="text-slate-600" /></div><h3 className="font-bold text-sm text-slate-800">{stage.label}</h3></div><span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-bold">{stageDeals.length}</span></div><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2"><div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((stageDeals.length/(myDeals.length||1))*100, 100)}%` }}></div></div><p className="text-[10px] text-slate-400 font-mono font-bold mt-2 text-left">{formatCurrency(stageValue)} ت</p></div><div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-50/30">{stageDeals.map(deal => (<div key={deal.id} draggable="true" onDragStart={(e) => handleDragStart(e, deal.id)} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative ${activeDraggable === deal.id ? 'opacity-50 scale-95 border-orange-300 border-dashed' : ''}`}><div className="absolute top-4 left-2 text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div><h4 className="font-bold text-sm text-slate-800 mb-1 pr-4">{deal.title}</h4><p className="text-xs text-slate-500 mb-3 flex items-center gap-1 font-medium"><Users size={12}/> {customers.find(c => c.id === deal.customerId)?.name || 'مشتری نامشخص'}</p><div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100"><span className="font-bold text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md font-mono">{formatCurrency(deal.value)}</span><div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity"><button onClick={() => moveStage(deal.id, stage.id, 'prev')} disabled={idx === 0} className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500"><ChevronRight size={16} /></button><button onClick={() => moveStage(deal.id, stage.id, 'next')} disabled={idx === DEAL_STAGES.length - 1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500"><ChevronLeft size={16} /></button><button onClick={(e) => { e.stopPropagation(); if(confirm('حذف شود؟')) onDeleteDeal(deal.id) }} className="p-1 rounded hover:bg-rose-100 text-rose-500 ml-2" title="حذف"><Trash2 size={14} /></button></div></div></div>))}</div></div>); })}</div></div>{isModalOpen && (<Modal title="ایجاد فرصت فروش" onClose={() => setModalOpen(false)}><form onSubmit={handleAdd} className="space-y-5"><FormInput label="عنوان پروژه" value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} autoFocus /><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">مشتری مرتبط</label><select required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm" value={newDeal.customerId} onChange={e => setNewDeal({...newDeal, customerId: e.target.value})}><option value="">انتخاب کنید...</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><FormInput label="ارزش برآوردی" type="number" value={newDeal.value} onChange={e => setNewDeal({...newDeal, value: parseInt(e.target.value)||0})} /><button type="submit" className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold mt-4 shadow-lg">شروع پیگیری</button></form></Modal>)}</div>
  );
};

// 7. Inventory Module
const InventoryModule = ({ inventory, customers, onAdd, onTransaction, userProfile }) => {
   const [view, setView] = useState('list');
   const [itemForm, setItemForm] = useState({ name: '', count: 0, price: 0, unit: 'عدد', description: '' });
   const [isModalOpen, setModalOpen] = useState(false);
   const [txType, setTxType] = useState('out');
   const [txForm, setTxForm] = useState({ itemId: '', customerId: '', quantity: 1, totalPrice: 0, paidAmount: 0, paymentMethod: 'cash', chequeDate: '' });

   const filteredCustomers = userProfile.role === 'manager' ? customers : customers.filter(c => c.createdBy === userProfile.uid);
   const uniqueInventory = useMemo(() => { const seen = new Set(); return inventory.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; }); }, [inventory]);

   const handleSaveItem = (e) => { e.preventDefault(); onAdd(itemForm); setItemForm({ name: '', count: 0, price: 0, unit: 'عدد', description: '' }); setView('list'); };
   const handleTxSubmit = (e) => {
       e.preventDefault();
       if (txType === 'out') { const item = inventory.find(i => i.id === txForm.itemId); if (item && item.count < txForm.quantity) { alert(`موجودی کافی نیست! موجودی فعلی: ${item.count}`); return; } }
       onTransaction({ ...txForm, type: txType, invoiceType: 'formal' }); setModalOpen(false); setTxForm({ itemId: '', customerId: '', quantity: 1, totalPrice: 0, paidAmount: 0, paymentMethod: 'cash', chequeDate: '' });
   };
   const selectedItemForTx = uniqueInventory.find(i => i.id === txForm.itemId);

   return (
     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <PageHeader title="انبار و محصولات" subtitle="مدیریت موجودی" actions={<div className="flex gap-2"><button onClick={() => { setTxType('in'); setModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"><ArrowDownLeft size={18} /> شارژ انبار</button><button onClick={() => { setTxType('out'); setModalOpen(true); }} className="bg-rose-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"><ArrowUpRight size={18} /> فروش جدید</button><button onClick={() => setView('create')} className="bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2"><Plus size={18} /> کالا جدید</button></div>} />
        {view === 'create' ? (
             <div className="max-w-2xl mx-auto"><Card className="p-8"><h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">تعریف کالای جدید</h3><form onSubmit={handleSaveItem} className="space-y-6"><FormInput label="نام کالا" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} /><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">توضیحات فنی</label><textarea className="w-full bg-white border border-slate-300 rounded-lg p-3 h-24" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} /></div><div className="grid grid-cols-3 gap-4"><FormInput label="موجودی" type="number" value={itemForm.count} onChange={e => setItemForm({...itemForm, count: parseInt(e.target.value)||0})} /><FormInput label="واحد" value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} /><FormInput label="قیمت پایه" type="number" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: parseInt(e.target.value)||0})} /></div><div className="flex justify-end pt-4 gap-3"><button type="button" onClick={() => setView('list')} className="px-6 py-3 border rounded-2xl text-slate-600 font-bold">انصراف</button><button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">ذخیره</button></div></form></Card></div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{uniqueInventory.map(item => (<Card key={item.id} className="p-5 flex flex-col justify-between group"><div className="flex justify-between items-start mb-4"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Package size={24} /></div><Badge type={item.count < 5 ? 'danger' : 'success'} text={`${item.count} ${item.unit || ''}`} /></div><div><h3 className="font-bold text-lg text-slate-800 mb-1">{item.name}</h3><p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{item.description || 'بدون توضیحات'}</p></div><div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center"><span className="text-slate-400 text-xs font-mono">{item.id.slice(0,6)}</span><span className="font-bold text-slate-700 font-mono">{formatCurrency(item.price)} <span className="text-xs font-medium text-slate-400">ت</span></span></div></Card>))}</div>
        )}
        {isModalOpen && (
           <Modal title={txType === 'in' ? 'شارژ موجودی انبار' : 'صدور فاکتور فروش'} onClose={() => setModalOpen(false)}>
              <form onSubmit={handleTxSubmit} className="space-y-5">
                 <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">انتخاب محصول</label><select required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3" value={txForm.itemId} onChange={e => setTxForm({...txForm, itemId: e.target.value})}><option value="">انتخاب کنید...</option>{uniqueInventory.map(i => <option key={i.id} value={i.id}>{i.name} (موجودی: {i.count})</option>)}</select></div>
                 {txType === 'out' && <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">انتخاب مشتری</label><select required className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3" value={txForm.customerId} onChange={e => setTxForm({...txForm, customerId: e.target.value})}><option value="">انتخاب مشتری...</option>{filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
                 <div className="grid grid-cols-2 gap-4"><div><FormInput label="تعداد" type="number" className="text-center" value={txForm.quantity} onChange={e => setTxForm({...txForm, quantity: parseInt(e.target.value)||0})} />{selectedItemForTx && <p className="text-[10px] text-slate-400 mt-1 text-center font-bold">موجودی: {selectedItemForTx.count}</p>}</div>{txType === 'out' && <FormInput label="مبلغ کل" type="number" value={txForm.totalPrice} onChange={e => setTxForm({...txForm, totalPrice: parseInt(e.target.value)||0})} />}</div>
                 {txType === 'out' && <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4"><div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">شیوه پرداخت</label><div className="flex gap-2"><button type="button" onClick={() => setTxForm({...txForm, paymentMethod: 'cash'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${txForm.paymentMethod === 'cash' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>نقد</button><button type="button" onClick={() => setTxForm({...txForm, paymentMethod: 'cheque'})} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${txForm.paymentMethod === 'cheque' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-slate-200'}`}>چک</button></div></div>{txForm.paymentMethod === 'cheque' && <DatePicker label="تاریخ سررسید چک" value={txForm.chequeDate} onChange={val => setTxForm({...txForm, chequeDate: val})} />}<div><FormInput label="مبلغ دریافتی" type="number" value={txForm.paidAmount} onChange={e => setTxForm({...txForm, paidAmount: parseInt(e.target.value)||0})} /></div></div>}
                 <button type="submit" className="w-full text-white py-3.5 rounded-2xl font-bold shadow-lg mt-2 bg-slate-800">تایید نهایی</button>
              </form>
           </Modal>
        )}
     </div>
   );
};

// 8. Finance Module
const FinanceModule = ({ transactions, customers, inventory, userProfile }) => {
  const [selectedTx, setSelectedTx] = useState(null);
  const myTransactions = userProfile.role === 'manager' ? transactions : transactions.filter(t => t.createdBy === userProfile.uid);
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="امور مالی" subtitle="آرشیو تراکنش‌ها" actions={<button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><FileSpreadsheet size={16}/> خروجی اکسل</button>} />
      <Card className="overflow-hidden">
        <table className="w-full text-right">
           <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider"><tr><th className="px-6 py-5">نوع</th><th className="px-6 py-5">مشتری</th><th className="px-6 py-5">مبلغ</th><th className="px-6 py-5">وضعیت</th><th className="px-6 py-5">چاپ</th></tr></thead>
           <tbody className="divide-y divide-slate-50">
             {myTransactions.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(t => (
               <tr key={t.id} className="hover:bg-slate-50 transition"><td className="px-6 py-4"><Badge type={t.type === 'in' ? 'info' : 'warning'} text={t.type === 'in' ? 'ورودی' : 'فاکتور'} /></td><td className="px-6 py-4 font-bold text-slate-700">{customers.find(c => c.id === t.customerId)?.name || '-'}</td><td className="px-6 py-4 font-mono font-bold text-slate-800">{formatCurrency(t.totalPrice)}</td><td className="px-6 py-4 text-xs">{t.type === 'out' && (<div className="flex flex-col gap-1"><span className="font-bold flex items-center gap-1 text-slate-600">{t.paymentMethod === 'cheque' ? <CreditCard size={12}/> : <CheckCircle2 size={12}/>} {t.paymentMethod === 'cheque' ? 'چک' : 'نقدی'}</span>{t.paymentMethod === 'cheque' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded w-fit">{t.chequeDate}</span>}</div>)}</td><td className="px-6 py-4">{t.type === 'out' && (<button onClick={() => setSelectedTx(t)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition"><Printer size={16} /></button>)}</td></tr>
             ))}
           </tbody>
        </table>
      </Card>
      {selectedTx && <InvoiceBuilder transaction={selectedTx} customer={customers.find(c => c.id === selectedTx.customerId)} item={inventory.find(i => i.id === selectedTx.itemId)} userProfile={userProfile} onClose={() => setSelectedTx(null)} />}
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [deals, setDeals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => { const savedProfile = localStorage.getItem('crm_user_profile'); if (savedProfile) setUserProfile(JSON.parse(savedProfile)); const initAuth = async () => { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); }; initAuth(); return onAuthStateChanged(auth, setUser); }, []);
  
  useEffect(() => { if (!user) return; const q = (n) => collection(db, 'artifacts', appId, 'public', 'data', n); const unsubs = [ onSnapshot(q('customers'), s => setCustomers(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('inventory'), s => setInventory(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('interactions'), s => setInteractions(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('transactions'), s => setTransactions(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('deals'), s => setDeals(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('tasks'), s => setTasks(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('tickets'), s => setTickets(s.docs.map(d => ({id:d.id,...d.data()})))), onSnapshot(q('users'), s => setUsers(s.docs.map(d => ({id:d.id,...d.data()})))) ]; return () => unsubs.forEach(u => u()); }, [user]);

  // Handlers
  const handleAddCustomer = async (d) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'customers'), {...d, isStarred: false, debt: 0, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id, creatorName: userProfile.name}); };
  const handleAddDeal = async (d) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'deals'), {...d, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id}); };
  const handleUpdateDealStatus = async (id, s) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'deals', id), {stage: s});
  const handleDeleteDeal = async (id) => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'deals', id));
  const handleAddTask = async (d) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {...d, completed: false, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id}); };
  const handleCompleteTask = async (id) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', id), {completed: true});
  const handleAddInteraction = async (cid, n) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'interactions'), {customerId: cid, note: n, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id, creatorName: userProfile.name}); };
  const handleAddItem = async (d) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), {...d, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id}); };
  const handleTransaction = async (d) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {...d, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id, creatorName: userProfile.name}); };
  const handleAddTicket = async (d) => { if(!userProfile) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), {...d, createdAt: serverTimestamp(), createdBy: userProfile.uid || userProfile.id}); };
  const handleUpdateTicket = async (id, d) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id), d);
  const handleAddUser = async (userData) => { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), { ...userData, createdAt: serverTimestamp() }); };
  const handleBackup = () => {
    const data = { customers, inventory, deals, transactions, users, tasks, tickets, exportDate: new Date().toLocaleString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const collections = ['customers', 'inventory', 'interactions', 'transactions', 'deals', 'tasks', 'tickets', 'users'];
        for (const colName of collections) {
          if (data[colName] && Array.isArray(data[colName])) {
             for (const item of data[colName]) {
               // Use setDoc with item.id to preserve ID, or addDoc if no ID
               if (item.id) {
                 await setDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, item.id), item);
               } else {
                 await addDoc(collection(db, 'artifacts', appId, 'public', 'data', colName), item);
               }
             }
          }
        }
        alert('بازگردانی اطلاعات با موفقیت انجام شد!');
      } catch (err) {
        console.error(err);
        alert('خطا در بازگردانی فایل. لطفاً از فایل صحیح بک‌آپ استفاده کنید.');
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = (p) => { setUserProfile(p); localStorage.setItem('crm_user_profile', JSON.stringify(p)); };
  const handleLogout = () => { setUserProfile(null); localStorage.removeItem('crm_user_profile'); };

  if (!user) return <div className="h-screen flex items-center justify-center bg-slate-100 text-slate-400">اتصال به سرور...</div>;
  if (!userProfile) return <LoginScreen onLogin={handleLogin} users={users} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-right text-slate-600 overflow-hidden" dir="rtl">
      <Sidebar activeModule={activeModule} setModule={setActiveModule} userProfile={userProfile} onLogout={handleLogout} tasks={tasks} />
      <main className="flex-1 overflow-y-auto relative h-full">
         <div className="p-6 pb-24 lg:pb-6 max-w-7xl mx-auto">
            {selectedCustomer ? (
                <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} interactions={interactions} onAddInteraction={handleAddInteraction} />
            ) : (
                <>
                    {activeModule === 'dashboard' && <DashboardModule customers={customers} inventory={inventory} transactions={transactions} userProfile={userProfile} />}
                    {activeModule === 'deals' && <DealsModule deals={deals} customers={customers} onAddDeal={handleAddDeal} onUpdateDealStatus={handleUpdateDealStatus} onDeleteDeal={handleDeleteDeal} userProfile={userProfile} />}
                    {activeModule === 'tasks' && <TasksModule tasks={tasks} onAddTask={handleAddTask} onCompleteTask={handleCompleteTask} userProfile={userProfile} />}
                    {activeModule === 'customers' && <CustomersModule customers={customers} onAdd={handleAddCustomer} onSelect={setSelectedCustomer} userProfile={userProfile} />}
                    {activeModule === 'inventory' && <InventoryModule inventory={inventory} customers={customers} onAdd={handleAddItem} onTransaction={handleTransaction} userProfile={userProfile} />}
                    {activeModule === 'transactions' && <FinanceModule transactions={transactions} customers={customers} inventory={inventory} userProfile={userProfile} />}
                    {activeModule === 'support' && <SupportModule tickets={tickets} customers={customers} onAddTicket={handleAddTicket} onUpdateTicket={handleUpdateTicket} userProfile={userProfile} />}
                    {activeModule === 'settings' && userProfile.role === 'manager' && <SettingsModule users={users} onAddUser={handleAddUser} onBackup={handleBackup} onRestore={handleRestore} />}
                </>
            )}
         </div>
      </main>
      <MobileNav activeModule={activeModule} setModule={setActiveModule} tasks={tasks} />
    </div>
  );
}
