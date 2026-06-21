// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, CheckCircle, Clock, Sparkles, Send, Radio, Plus,
  Award, ShieldAlert, X, ChevronRight, Briefcase, Lock, Eye,
  Play, Compass, HelpCircle, UserPlus, LogOut, Coffee, EyeOff,
  ChevronLeft, ArrowUpRight, CheckSquare, Bell, Smartphone,
  Circle, Trash2, ShieldCheck, Mail, Megaphone, Info, CheckCircle2,
  TrendingUp, Wallet, ArrowDownRight, Percent, Users, FileText, DollarSign, ArrowUp, Star,
  AlertTriangle, Stethoscope, Shield, Key, FileInput, Target, Check, RefreshCw, Camera, UploadCloud,
  LayoutDashboard
} from 'lucide-react';

const INITIAL_STAFF = [
  { id: 'st-01', name: 'Sarah Al-Mansoori', loginId: 'sarah.admin', email: 'sarah@usthad.com', role: 'Manager', dept: 'Administration', avatar: '👩‍💼', leads: 95, conversions: 24, target: 30 },
  { id: 'st-02', name: 'Zayn Malik', loginId: 'zayn.finance', email: 'zayn@usthad.com', role: 'Staff', dept: 'Finance', avatar: '👨‍💻', leads: 80, conversions: 18, target: 20 },
  { id: 'st-03', name: 'Layla Rashid', loginId: 'layla.sales', email: 'layla@usthad.com', role: 'Staff', dept: 'Sales', avatar: '👩‍🎨', leads: 150, conversions: 48, target: 80 },
  { id: 'st-04', name: 'Faris Ibrahim', loginId: 'faris.sales', email: 'faris@usthad.com', role: 'Manager', dept: 'Sales', avatar: '👨‍💼', leads: 190, conversions: 85, target: 100 }
];

const INITIAL_TASKS = [
  { id: 'task-1', title: 'Prepare Live QA slides', desc: 'Draft interactive slidedeck for the upcoming cohort launch.', assigneeId: 'st-03', priority: 'Urgent', progress: 85, status: 'In Progress', assignedBy: 'Faris Ibrahim', assignerRole: 'CEO', isDaily: true, due_date: '06/10/2026' },
  { id: 'task-2', title: 'Review Enrollment Drop-offs', desc: 'Analyze mid-funnel conversion drops for Python Mastery.', assigneeId: 'st-03', priority: 'Medium', progress: 100, status: 'Completed', assignedBy: 'Sarah Al-Mansoori', assignerRole: 'Manager', isDaily: false, due_date: '06/05/2026', reviewedBy: 'Sarah Al-Mansoori' },
  { id: 'task-3', title: 'Validate ledger balance sheets', desc: 'Verify financial sync for May commissions.', assigneeId: 'st-02', priority: 'Urgent', progress: 0, status: 'Pending', assignedBy: 'Faris Ibrahim', assignerRole: 'CEO', isDaily: false, due_date: '06/04/2026' },
  { id: 'task-4', title: 'Campaign Outreach Pitch', desc: 'Design new targeted leads strategy for the GCC region.', assigneeId: 'st-03', priority: 'Routine', progress: 30, status: 'In Progress', assignedBy: 'Sarah Al-Mansoori', assignerRole: 'Manager', isDaily: true, due_date: '06/15/2026' }
];

const INITIAL_REQUESTS = [
  { id: 'req-1', staffId: 'st-01', staffName: 'Sarah Al-Mansoori', type: 'leave', title: 'Casual Leave Request', description: '[Casual Leave] 2 day(s): Family function attendance.', status: 'pending', date: 'June 01, 2026' },
  { id: 'req-2', staffId: 'st-02', staffName: 'Zayn Malik', type: 'access_elevation', title: 'Access Request: Admin Panel', description: 'System: admin_panel | Duration: temporary | Justification: Staging db check', status: 'pending', date: 'May 31, 2026' }
];

const INITIAL_BROADCASTS = [
  { id: 'b-1', text: '🔥 CEO DIRECTIVE: Finalize all outstanding course curriculum syncs by tonight.', type: 'Urgent', timestamp: '5 mins ago' },
  { id: 'b-2', text: '🏆 Retain Rate Peak: Usthad Academy hit an outstanding 94.2% course completion rate this morning!', type: 'Community', timestamp: '3 hours ago' },
  { id: 'b-3', text: '⚡ Operational Notice: Server infrastructure migration is successfully completed. Zero downtime observed.', type: 'System', timestamp: '1 day ago' }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeRole, setActiveRole] = useState('CEO'); // CEO | Administrator | Staff
  const [selectedStaffId, setSelectedStaffId] = useState('st-03'); // Layla Rashid default for fast testing

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [trustWorkstation, setTrustWorkstation] = useState(true);

  const [ceoTab, setCeoTab] = useState('home'); // home | tasks | approvals | staff | finance | sales
  const [adminTab, setAdminTab] = useState('home'); // home | tasks | staff | finance | sales
  const [staffTab, setStaffTab] = useState('home'); // home | tasks | portal | specialized

  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [broadcasts, setBroadcasts] = useState(INITIAL_BROADCASTS);

  // Expanded card tracking for the premium task cards
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Task filter active state
  const [taskFilterStatus, setTaskFilterStatus] = useState('All'); // All | Pending | In Progress | Under Review | Completed

  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isGeneralReqModalOpen, setIsGeneralReqModalOpen] = useState(false);
  const [isLeaveReqModalOpen, setIsLeaveReqModalOpen] = useState(false);
  const [isCommunityBoardOpen, setIsCommunityBoardOpen] = useState(false); // Notifications bell popup
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Profile setting bottom sheet

  const [notification, setNotification] = useState(null);
  const [congratsData, setCongratsData] = useState(null); 

  // Add staff parameters
  const [formFullName, setFormFullName] = useState('');
  const [formLoginId, setFormLoginId] = useState('');
  const [formGmail, setFormGmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formDept, setFormDept] = useState('Administration'); // Administration | Accounts | Sales | Marketing
  const [formRole, setFormRole] = useState('Staff'); // Staff | Manager
  const [formDesignation, setFormDesignation] = useState('');
  const [isDeployingStaff, setIsDeployingStaff] = useState(false);

  // Deploy task parameters
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(''); // Selected Staff object ID
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium'); // Low | Medium | High | Urgent
  const [newTaskDeadlineDate, setNewTaskDeadlineDate] = useState('');
  const [newTaskDeadlineTime, setNewTaskDeadlineTime] = useState('');
  const [isTaskDaily, setIsTaskDaily] = useState(false);

  const [profileImages, setProfileImages] = useState(() => {
    const saved = localStorage.getItem('usthad_profile_images');
    return saved ? JSON.parse(saved) : {}; // Key: userLoginId / role, Value: Base64 URI
  });

  const fileInputRef = useRef(null);

  // Unified financial state (localStorage linked)
  const [finUloomX, setFinUloomX] = useState(() => localStorage.getItem('fin_uloomx') || '12000');
  const [finUsthad, setFinUsthad] = useState(() => localStorage.getItem('fin_usthad') || '24000');
  const [finExpenses, setFinExpenses] = useState(() => localStorage.getItem('fin_expenses') || '20000');
  const [finHistory, setFinHistory] = useState([
    { date: 'May 30, 2026', income: 36000, expenses: 20000, status: 'verified', revenue: 16000, breakdown: "Income: ₹36,000 | Exp: ₹20,000" },
    { date: 'May 28, 2026', income: 14000, expenses: 8000, status: 'verified', revenue: 6000, breakdown: "Income: ₹14,000 | Exp: ₹8,000" }
  ]);

  // Unified sales state (localStorage linked as required by spec)
  const [salesLeads, setSalesLeads] = useState(() => localStorage.getItem('sales_totalLeads') || '150');
  const [salesConversions, setSalesConversions] = useState(() => localStorage.getItem('sales_conversions') || '50');
  const [salesEvaluations, setSalesEvaluations] = useState(() => localStorage.getItem('sales_evaluations') || '25');
  const [salesLostLeads, setSalesLostLeads] = useState(() => localStorage.getItem('sales_lostLeads') || '12');
  const [salesLeadQuality, setSalesLeadQuality] = useState(() => {
    const val = localStorage.getItem('sales_leadQuality');
    return val ? JSON.parse(val) : [7];
  });
  const [isSalesLocked, setIsSalesLocked] = useState(() => localStorage.getItem('sales_locked') === 'true');

  useEffect(() => {
    localStorage.setItem('sales_totalLeads', salesLeads);
    localStorage.setItem('sales_conversions', salesConversions);
    localStorage.setItem('sales_evaluations', salesEvaluations);
    localStorage.setItem('sales_lostLeads', salesLostLeads);
    localStorage.setItem('sales_leadQuality', JSON.stringify(salesLeadQuality));
    localStorage.setItem('sales_locked', isSalesLocked.toString());
  }, [salesLeads, salesConversions, salesEvaluations, salesLostLeads, salesLeadQuality, isSalesLocked]);

  useEffect(() => {
    localStorage.setItem('fin_uloomx', finUloomX);
    localStorage.setItem('fin_usthad', finUsthad);
    localStorage.setItem('fin_expenses', finExpenses);
  }, [finUloomX, finUsthad, finExpenses]);

  useEffect(() => {
    localStorage.setItem('usthad_profile_images', JSON.stringify(profileImages));
  }, [profileImages]);

  // Automatic midnight shift reset loop
  useEffect(() => {
    const checkMidnightReset = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setSalesLeads('0');
        setSalesConversions('0');
        setSalesEvaluations('0');
        setSalesLostLeads('0');
        setSalesLeadQuality([7]);
        setIsSalesLocked(false);
        localStorage.removeItem('sales_locked');
        triggerToast("Shift reset automatically for safety.", "info");
      }
    };
    const resetInterval = setInterval(checkMidnightReset, 60000);
    return () => clearInterval(resetInterval);
  }, []);

  // Captured checklist state
  const [todoList, setTodoList] = useState([
    { id: 'td-1', text: 'Review Q3 curriculum deployment strategy', completed: false },
    { id: 'td-2', text: 'Audit May commissions ledger accounts', completed: true }
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  // Long press indicators
  const [longPressActiveId, setLongPressActiveId] = useState(null);
  const [longPressTodoId, setLongPressTodoId] = useState(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState(null);
  const [progressInterval, setProgressInterval] = useState(null);

  // General request wizard states
  const [genReqStep, setGenReqStep] = useState(1);
  const [genReqType, setGenReqType] = useState('budget');
  const [budgetAmt, setBudgetAmt] = useState('');
  const [budgetCat, setBudgetCat] = useState('marketing');
  const [budgetCatOther, setBudgetCatOther] = useState('');
  const [budgetReason, setBudgetReason] = useState('');
  const [accessSystem, setAccessSystem] = useState('finance');
  const [accessSystemOther, setAccessSystemOther] = useState('');
  const [accessDuration, setAccessDuration] = useState('temporary');
  const [accessJustification, setAccessJustification] = useState('');
  const [roleDesignation, setRoleDesignation] = useState('');
  const [roleEffectiveDate, setRoleEffectiveDate] = useState('');
  const [roleReason, setRoleReason] = useState('');
  const [permAction, setPermAction] = useState('delete_records');
  const [permActionOther, setPermActionOther] = useState('');
  const [permUrgency, setPermUrgency] = useState('medium');
  const [permJustification, setPermJustification] = useState('');

  // Leave request wizard states
  const [leaveStep, setLeaveStep] = useState(1);
  const [leaveType, setLeaveType] = useState('medical');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveEarlyTime, setLeaveEarlyTime] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveTotalDays, setLeaveTotalDays] = useState(1);

  useEffect(() => {
    if (leaveStartDate && leaveEndDate) {
      const start = new Date(leaveStartDate);
      const end = new Date(leaveEndDate);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setLeaveTotalDays(diffDays);
      } else {
        setLeaveTotalDays(1);
      }
    }
  }, [leaveStartDate, leaveEndDate]);

  const triggerToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const triggerCongrats = (title, desc) => {
    setCongratsData({ title, desc });
  };

  const totalLeads = staff.reduce((sum, member) => sum + (member.leads || 0), 0);
  const totalConversions = staff.reduce((sum, member) => sum + (member.conversions || 0), 0);
  const totalActiveTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  
  const getGreetingText = () => {
    const hrs = new Date().getHours();
    if (hrs >= 5 && hrs < 12) return 'Good Morning';
    if (hrs >= 12 && hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 3MB = 3,145,728 bytes
    const maxLimit = 3 * 1024 * 1024;
    if (file.size > maxLimit) {
      triggerToast('Upload Failed: Size must be under 3MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const currentKey = activeRole === 'Staff' ? selectedStaffId : activeRole;
      setProfileImages(prev => ({
        ...prev,
        [currentKey]: base64String
      }));
      triggerToast('Profile image updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const getCurrentUserAvatar = () => {
    const currentKey = activeRole === 'Staff' ? selectedStaffId : activeRole;
    if (profileImages[currentKey]) {
      return (
        <img 
          src={profileImages[currentKey]} 
          className="w-full h-full object-cover rounded-full border border-slate-200" 
          alt="Avatar" 
        />
      );
    }
    
    // Fallback default emoji
    if (activeRole === 'CEO') return <span className="text-sm">👑</span>;
    if (activeRole === 'Administrator') return <span className="text-sm">👩‍💼</span>;
    const currentStaffObj = staff.find(s => s.id === selectedStaffId);
    return <span className="text-sm">{currentStaffObj?.avatar || '👤'}</span>;
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      triggerToast('Please provide an access identifier', 'error');
      return;
    }

    const normalizedInput = loginUsername.toLowerCase().trim();
    if (normalizedInput === 'ceo') {
      setActiveRole('CEO');
      setCeoTab('home');
      setIsLoggedIn(true);
      triggerToast('Authenticated as Chief Executive', 'success');
    } else if (normalizedInput === 'admin' || normalizedInput === 'sarah.admin') {
      setActiveRole('Administrator');
      setSelectedStaffId('st-01');
      setAdminTab('home');
      setIsLoggedIn(true);
      triggerToast('Authenticated as Administrator', 'success');
    } else {
      const foundStaff = staff.find(s => 
        s.loginId.toLowerCase() === normalizedInput || 
        s.name.toLowerCase().includes(normalizedInput)
      );
      if (foundStaff) {
        setSelectedStaffId(foundStaff.id);
        if (foundStaff.role === 'Manager') {
          setActiveRole('Administrator');
          setAdminTab('home');
        } else {
          setActiveRole('Staff');
          setStaffTab('home');
        }
        setIsLoggedIn(true);
        triggerToast(`Welcome back, ${foundStaff.name}!`, 'success');
      } else {
        setSelectedStaffId('st-03'); 
        setActiveRole('Staff');
        setStaffTab('home');
        setIsLoggedIn(true);
        triggerToast(`Logged in as default Staff portal`, 'success');
      }
    }
  };

  const handleQuickLogin = (roleKey) => {
    if (roleKey === 'CEO') {
      setLoginUsername('ceo');
      setLoginPassword('•••••••••');
    } else if (roleKey === 'Administrator') {
      setLoginUsername('sarah.admin');
      setLoginPassword('•••••••••');
    } else if (roleKey === 'Finance') {
      setLoginUsername('zayn.finance');
      setLoginPassword('•••••••••');
    } else if (roleKey === 'Sales') {
      setLoginUsername('layla.sales');
      setLoginPassword('•••••••••');
    }
    triggerToast('Credentials loaded! Tap Access Console.', 'info');
  };

  const handleDeployTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskAssignee) {
      triggerToast('Mission needs title and assigned staff!', 'error');
      return;
    }
    
    // Grab the name and designation of the active assigner
    let assignerName = "Faris Ibrahim";
    let assignerDesignation = "CEO";

    if (activeRole === 'Administrator') {
      assignerName = "Sarah Al-Mansoori";
      assignerDesignation = "Manager";
    }

    const assignedToObj = staff.find(s => s.id === newTaskAssignee);

    const nTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      desc: newTaskDesc || 'No details provided.',
      assigneeId: newTaskAssignee,
      priority: newTaskPriority,
      progress: 0,
      status: 'Pending',
      assignedBy: assignerName,
      assignerRole: assignerDesignation,
      isDaily: isTaskDaily,
      due_date: newTaskDeadlineDate ? new Date(newTaskDeadlineDate).toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}) : 'Flexible'
    };

    setTasks([nTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskAssignee('');
    setStaffSearchQuery('');
    setIsTaskDaily(false);
    setIsAssignTaskModalOpen(false);
    triggerCongrats(`Mission Deployed! 🎯`, `Task successfully assigned to ${assignedToObj ? assignedToObj.name : 'staff'}.`);
  };

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!formFullName.trim() || !formLoginId.trim() || !formGmail.trim() || !formPassword.trim()) {
      triggerToast('Please complete all security fields', 'error');
      return;
    }

    setIsDeployingStaff(true);

    setTimeout(() => {
      const newMember = {
        id: `st-${Date.now()}`,
        name: formFullName,
        loginId: formLoginId,
        email: formGmail,
        role: formRole,
        dept: formDept,
        avatar: formDept === 'Finance' ? '👨‍💻' : formDept === 'Sales' ? '👩‍🎨' : formDept === 'Marketing' ? '📢' : '👩&zwj;💼',
        leads: formDept === 'Sales' ? 100 : 0,
        conversions: formDept === 'Sales' ? 50 : 0,
        target: formDept === 'Sales' ? 100 : 0
      };

      setStaff([...staff, newMember]);
      setFormFullName('');
      setFormLoginId('');
      setFormGmail('');
      setFormPassword('');
      setFormDesignation('');
      setIsDeployingStaff(false);
      setIsAddStaffModalOpen(false);
      triggerToast(`🧑‍💼 ${formFullName} securely provisioned to ${formDept}!`, 'success');
    }, 1200);
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newTodo = {
      id: `td-${Date.now()}`,
      text: newTodoText,
      completed: false
    };
    setTodoList([newTodo, ...todoList]);
    setNewTodoText('');
    triggerToast('💡 Idea captured successfully!', 'success');
  };

  const handleToggleTodo = (id) => {
    setTodoList(prev => prev.map(todo => {
      if (todo.id === id) {
        const nextVal = !todo.completed;
        if (nextVal) {
          setTimeout(() => {
            triggerCongrats("Checkpoint Cleared! 🚀", `"${todo.text}" has been successfully completed.`);
          }, 200);
        }
        return { ...todo, completed: nextVal };
      }
      return todo;
    }));
  };

  const handleTodoPressStart = (id) => {
    setLongPressTodoId(id);
    setLongPressProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setLongPressProgress(progress);
      }
    }, 80);
    setProgressInterval(interval);

    const timer = setTimeout(() => {
      setTodoList(prev => prev.filter(t => t.id !== id));
      triggerToast('🗑️ Idea removed from checklist.', 'error');
      handleTodoPressCancel(interval, timer);
    }, 800);
    setPressTimer(timer);
  };

  const handleTodoPressCancel = (incomingInterval = null, incomingTimer = null) => {
    const activeInt = incomingInterval || progressInterval;
    const activeTime = incomingTimer || pressTimer;
    if (activeInt) clearInterval(activeInt);
    if (activeTime) clearTimeout(activeTime);
    setProgressInterval(null);
    setPressTimer(null);
    setLongPressTodoId(null);
    setLongPressProgress(0);
  };

  const handleStaffPressStart = (id) => {
    setLongPressActiveId(id);
    setLongPressProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setLongPressProgress(progress);
      }
    }, 80);
    setProgressInterval(interval);

    const timer = setTimeout(() => {
      setStaff(prev => prev.filter(member => member.id !== id));
      triggerToast('🗑️ Staff member deleted from roster.', 'error');
      handleStaffPressCancel(interval, timer);
    }, 800);
    setPressTimer(timer);
  };

  const handleStaffPressCancel = (incomingInterval = null, incomingTimer = null) => {
    const activeInt = incomingInterval || progressInterval;
    const activeTime = incomingTimer || pressTimer;
    if (activeInt) clearInterval(activeInt);
    if (activeTime) clearTimeout(activeTime);
    setProgressInterval(null);
    setPressTimer(null);
    setLongPressActiveId(null);
    setLongPressProgress(0);
  };

  const handleProgressSlider = (taskId, newProgress) => {
    const progressVal = parseInt(newProgress, 10);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        let status = t.status;
        if (progressVal > 0 && t.status === 'Pending') status = 'In Progress';
        if (progressVal === 100) {
          status = 'Completed';
          setTimeout(() => {
            triggerCongrats("Task Completed! 🚀", `"${t.title}" is officially 100% finished.`);
          }, 200);
        }
        return { ...t, progress: progressVal, status };
      }
      return t;
    }));
  };

  const handleTaskSubmitForReview = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        triggerToast(`📝 Submitted for administration review!`, 'success');
        return { ...t, status: 'Under Review' };
      }
      return t;
    }));
  };

  const handleProcessRequest = (requestId, action) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        triggerToast(`Request ${action} ✅`, 'success');
        return { ...r, status: action.toLowerCase() };
      }
      return r;
    }));
  };

  const floatLeads = Math.max(1, parseFloat(salesLeads) || 0);
  const floatConversions = parseFloat(salesConversions) || 0;
  const floatEvaluations = parseFloat(salesEvaluations) || 0;
  const floatLostLeads = parseFloat(salesLostLeads) || 0;

  const liveConversionRate = Math.round((floatConversions / floatLeads) * 100);
  const rawEfficiency = ((floatConversions / floatLeads) * 50) + ((floatEvaluations / floatLeads) * 30) + ((floatLostLeads / floatLeads) * 20);
  const liveEfficiencyScore = Math.min(100, Math.max(0, Math.round(rawEfficiency)));

  const scoreVal = salesLeadQuality[0];
  const dynamicSalesLabel = scoreVal >= 8 ? "Exceptional" : scoreVal >= 6 ? "Good" : scoreVal >= 4 ? "Average" : "Needs Work";

  const handleTransmitSalesReport = () => {
    setIsSalesLocked(true);
    triggerToast("Daily Sales Report locked and transmitted to HQ!", "success");
    triggerCongrats("Report Locked! 📤", "Your daily metrics have been verified by the ledger stream.");
  };

  const floatUloomX = parseFloat(finUloomX) || 0;
  const floatUsthad = parseFloat(finUsthad) || 0;
  const floatExpenses = parseFloat(finExpenses) || 0;
  const computedNetRevenue = floatUloomX + floatUsthad - floatExpenses;

  const totalIncomeSum = Math.max(1, floatUloomX + floatUsthad);
  const uloomxPercentage = Math.round((floatUloomX / totalIncomeSum) * 100);
  const usthadPercentage = Math.round((floatUsthad / totalIncomeSum) * 100);
  const expenseRatio = Math.round((floatExpenses / totalIncomeSum) * 100);

  const handleTransmitFinancialReport = () => {
    const floatUloomX = parseFloat(finUloomX) || 0;
    const floatUsthad = parseFloat(finUsthad) || 0;
    const floatExpenses = parseFloat(finExpenses) || 0;
    const computedNetRevenue = floatUloomX + floatUsthad - floatExpenses;

    setFinHistory(prev => [
      {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        income: floatUloomX + floatUsthad,
        expenses: floatExpenses,
        status: 'verified',
        revenue: computedNetRevenue,
        breakdown: `Income: ₹${(floatUloomX + floatUsthad).toLocaleString()} | Exp: ₹${floatExpenses.toLocaleString()}`
      },
      ...prev
    ]);

    triggerToast("Daily Ledger transaction synchronized successfully!", "success");
    triggerCongrats("Ledger Synchronized! 💸", "Financial distributions locked and compiled for audit review.");
  };

  const handleGeneralRequestSubmit = (e) => {
    e.preventDefault();
    let title = '';
    let description = '';
    let amountVal = null;

    if (genReqType === 'budget') {
      if (!budgetAmt || !budgetReason) { triggerToast('Complete details first', 'error'); return; }
      const finalCat = budgetCat === 'other' ? budgetCatOther : budgetCat;
      title = "Budget Request: " + finalCat.toUpperCase();
      description = "Amount: $" + budgetAmt + " | Category: " + finalCat + " | Reason: " + budgetReason;
      amountVal = parseFloat(budgetAmt);
    } 
    else if (genReqType === 'access_elevation') {
      if (!accessJustification) { triggerToast('Complete system justification', 'error'); return; }
      const finalSys = accessSystem === 'other' ? accessSystemOther : accessSystem;
      title = "Access Request: " + finalSys.toUpperCase();
      description = "System: " + finalSys + " | Duration: " + accessDuration + " | Justification: " + accessJustification;
    }
    else if (genReqType === 'role_change') {
      if (!roleDesignation || !roleEffectiveDate || !roleReason) { triggerToast('Fill required fields', 'error'); return; }
      title = "Role Change: " + roleDesignation;
      description = "New Designation: " + roleDesignation + " | Effective: " + roleEffectiveDate + " | Reason: " + roleReason;
    }
    else if (genReqType === 'permission') {
      if (!permJustification) { triggerToast('Please clarify permissions required', 'error'); return; }
      const finalAct = permAction === 'custom' ? permActionOther : permAction;
      title = "Permission: " + finalAct.toUpperCase();
      description = "Action: " + finalAct + " | Urgency: " + permUrgency + " | Justification: " + permJustification;
    }

    const newReq = {
      id: `req-${Date.now()}`,
      staffId: selectedStaffId,
      staffName: staff.find(s => s.id === selectedStaffId)?.name || 'Guest User',
      type: genReqType,
      title,
      description,
      amount: amountVal,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setRequests([newReq, ...requests]);
    setGenReqStep(4);
    triggerToast("Your system request has been filed!", "success");
  };

  const handleLeaveRequestSubmit = (e) => {
    e.preventDefault();
    if (!leaveReason) { triggerToast('Provide CEO Note reason', 'error'); return; }

    let title = '';
    let description = '';

    const currentStaffObj = staff.find(s => s.id === selectedStaffId);
    const categoryLabel = leaveType.toUpperCase() + " LEAVE";

    if (leaveType === 'early') {
      if (!leaveEarlyTime) { triggerToast('Select Departure Time', 'error'); return; }
      title = "Early Leave: " + leaveEarlyTime;
      description = "[EARLY LEAVE] Departure Time: " + leaveEarlyTime + " | Reason: " + leaveReason;
    } else {
      if (!leaveStartDate || !leaveEndDate) { triggerToast('Select Dates', 'error'); return; }
      title = categoryLabel + ": " + leaveStartDate + " - " + leaveEndDate;
      description = "[" + categoryLabel + "] " + leaveTotalDays + " day(s): " + leaveReason;
    }

    const newLeaveReq = {
      id: `req-${Date.now()}`,
      staffId: selectedStaffId,
      staffName: currentStaffObj?.name || 'Guest User',
      type: 'leave',
      title,
      description,
      status: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setRequests([newLeaveReq, ...requests]);
    setLeaveStep(3);
    triggerToast("Your leave request has been submitted!", "success");
  };

  const handleApplyQuickDays = (daysCount) => {
    if (!leaveStartDate) {
      triggerToast("Select Start Date first!", "error");
      return;
    }
    const start = new Date(leaveStartDate);
    let end = new Date(leaveStartDate);

    if (daysCount === 1) {
      // Sets End = Start
    } else if (daysCount === 3) {
      end.setDate(start.getDate() + 2);
    } else if (daysCount === 7) {
      end.setDate(start.getDate() + 6);
    }

    const endYear = end.getFullYear();
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDateStr = String(end.getDate()).padStart(2, '0');
    setLeaveEndDate(`${endYear}-${endMonth}-${endDateStr}`);
  };

  const currentStaffProfile = staff.find(s => s.id === selectedStaffId) || staff[0];

  const renderPremiumTaskCard = (task) => {
    const isExpanded = expandedTaskId === task.id;
    const assignee = staff.find(s => s.id === task.assigneeId);

    // Left status highlight configurations
    let statusBorderColor = "border-l-[#3F3F46]"; // Pending routine
    if (task.status === "Completed") statusBorderColor = "border-l-[#10B981]";
    else if (task.status === "In Progress") statusBorderColor = "border-l-[#3B82F6]";
    else if (task.status === "Under Review") statusBorderColor = "border-l-[#A855F7]";
    else if (task.priority === "Urgent") statusBorderColor = "border-l-[#F43F5E]";
    else if (task.priority === "Medium") statusBorderColor = "border-l-[#F59E0B]";

    // Icon Selector
    let iconBoxBg = "bg-slate-100 text-slate-600";
    let HeaderIcon = LayoutDashboard;
    if (task.status === "Completed") {
      iconBoxBg = "bg-emerald-50 text-emerald-600";
      HeaderIcon = CheckCircle2;
    } else if (task.priority === "Urgent") {
      iconBoxBg = "bg-rose-50 text-rose-600";
      HeaderIcon = AlertTriangle;
    }

    // SVG Digital Gauge attributes
    const indicatorColor = 
      task.status === "Completed" ? "#10B981" : 
      task.status === "Under Review" ? "#A855F7" : 
      task.status === "In Progress" ? "#3B82F6" : "#F59E0B";

    let GaugeIcon = Zap;
    if (task.status === "Completed") GaugeIcon = Check;
    else if (task.status === "Under Review") GaugeIcon = Clock;
    else if (task.status === "In Progress") GaugeIcon = Circle;

    return (
      <div 
        key={task.id} 
        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
        className={`w-full text-left bg-white/95 backdrop-blur-[24px] border border-slate-200/50 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] border-l-[6px] ${statusBorderColor} transition-all duration-300 ease-in-out select-none cursor-pointer overflow-hidden mb-3`}
      >
        <div className="p-4 flex justify-between items-start">
          <div className="flex gap-3 flex-1 min-w-0">
            <div className={`w-11 h-11 ${iconBoxBg} rounded-xl flex items-center justify-center shrink-0 shadow-xs`}>
              <HeaderIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className={`tracking-widest text-[8px] font-black border px-1.5 py-0.5 rounded uppercase ${
                  task.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  task.priority === "Urgent" ? "bg-rose-50 text-rose-700 border-rose-100" :
                  "bg-slate-50 text-slate-500 border-slate-100"
                }`}>
                  {task.status === "Completed" ? "Completed" : task.priority}
                </span>

                {task.isDaily && (
                  <span className="flex items-center gap-0.5 text-[8px] font-black bg-orange-500/10 text-orange-600 border border-orange-500/20 px-1.5 py-0.5 rounded uppercase">
                    <Star className="w-2.5 h-2.5 fill-current" /> Daily
                  </span>
                )}

                {task.status === "Completed" && task.reviewedBy && (
                  <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded animate-pulse">
                    ✓ APPROVED
                  </span>
                )}
              </div>

              <h4 className="font-black text-[12px] text-slate-900 leading-snug truncate">{task.title}</h4>
              
              <div className="flex flex-col gap-0.5 text-[8.5px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-red-500" /> Due: {task.due_date || 'Flexible'}
                </span>
                <span>Assigned by: {task.assignedBy || 'Faris Ibrahim'} ({task.assignerRole || 'CEO'})</span>
                
                {/* Visualizing specific user allocation details */}
                {activeRole === 'Administrator' && (
                  <span className="text-[#2E2A75] font-black bg-indigo-50/60 px-1 py-0.5 rounded w-max mt-0.5">
                    Assigned to: {assignee ? assignee.name : 'Unknown Staff'} ({assignee ? assignee.dept : 'Admin'})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative w-11 h-11 flex items-center justify-center ml-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <svg className="w-11 h-11 transform -rotate-90">
              <circle cx="22" cy="22" r="16" stroke="#E5E7EB" strokeWidth="3" fill="transparent" />
              <circle 
                cx="22" cy="22" r="16" 
                stroke={indicatorColor} 
                strokeWidth="3" 
                fill="transparent" 
                strokeDasharray="100.5" 
                strokeDashoffset={100.5 - task.progress} 
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[8.5px] font-black text-slate-800 leading-none">{task.progress}%</span>
              <GaugeIcon className="w-2.5 h-2.5 mt-0.5 text-slate-400" />
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100/50 bg-slate-50/50 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block mb-1">Task Deliverables</span>
              <p className="text-[10px] text-slate-650 leading-normal font-medium">{task.desc}</p>
              <div className="text-[8px] text-slate-400 font-bold mt-2">
                Owner: {assignee ? assignee.name : 'System Queue'} ({assignee ? assignee.dept : 'N/A'})
              </div>
            </div>

            {task.status === "Pending" && (
              <button
                onClick={() => {
                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'In Progress', progress: 10 } : t));
                  triggerToast("Mission officially started! 🚀", "success");
                }}
                className="w-full bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white font-black text-[9.5px] py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm animate-pulse"
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> START MISSION
              </button>
            )}

            {task.status === "In Progress" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold">
                    <span>Slide to adjust progression</span>
                    <span className="text-[#3B82F6] font-black">{task.progress}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={task.progress}
                    onChange={(e) => handleProgressSlider(task.id, e.target.value)}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map(val => (
                    <button
                      type="button" key={val}
                      onClick={() => handleProgressSlider(task.id, val)}
                      className={`py-1.5 text-[8.5px] font-black rounded-lg uppercase transition ${
                        task.progress === val ? 'bg-[#3B82F6] text-white shadow-sm ring-1 ring-blue-300' : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {val === 100 ? '100%' : `${val}%`}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {(activeRole === 'CEO' || activeRole === 'Administrator') && (
                    <button
                      onClick={() => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Completed', progress: 100, reviewedBy: activeRole } : t));
                        triggerToast("Task marked completed successfully!", "success");
                        triggerCongrats("Task Cleared! 🏆", `"${task.title}" has been completed directly by Administration.`);
                      }}
                      className="flex-1 bg-emerald-600 text-white font-black text-[9px] py-2.5 rounded-xl uppercase tracking-wider"
                    >
                      Mark Completed
                    </button>
                  )}

                  {activeRole === 'Staff' && (
                    <button
                      onClick={() => handleTaskSubmitForReview(task.id)}
                      className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-black text-[9px] py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Submit for Review
                    </button>
                  )}
                </div>
              </div>
            )}

            {task.status === "Under Review" && (
              <div className="space-y-3">
                <div className="bg-purple-500/[0.05] border border-purple-100 p-3 rounded-xl flex items-start gap-2 text-purple-800 text-[9.5px]">
                  <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <span className="font-black block uppercase text-[8px] text-purple-700">Verification Pending</span>
                    <p className="font-semibold leading-relaxed text-purple-900">AWAITING VERIFICATION - Lock enabled. A CEO/Administrator is reviewing your completion.</p>
                  </div>
                </div>

                {(activeRole === 'CEO' || activeRole === 'Administrator') && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Completed', progress: 100, reviewedBy: activeRole === 'CEO' ? 'Faris Ibrahim' : 'Sarah Al-Mansoori' } : t));
                        triggerToast("Task approved and locked!", "success");
                        triggerCongrats("Verification Success! 🏆", `"${task.title}" has been signed off by management.`);
                      }}
                      className="flex-1 bg-emerald-600 text-white font-black text-[9px] py-2.5 rounded-xl uppercase tracking-wider"
                    >
                      Approve & Complete
                    </button>
                    <button
                      onClick={() => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'In Progress', progress: 50 } : t));
                        triggerToast("Task sent back for revisions.", "info");
                      }}
                      className="flex-1 bg-red-50 text-red-600 border border-red-150 font-black text-[9px] py-2.5 rounded-xl uppercase"
                    >
                      Send Back
                    </button>
                  </div>
                )}
              </div>
            )}

            {task.status === "Completed" && (
              <div className="space-y-2">
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 rounded-xl text-[9.5px] font-bold flex justify-between items-center">
                  <span>Reviewed by {task.reviewedBy || 'Sarah Al-Mansoori'}</span>
                  <span className="text-emerald-600 font-black uppercase text-[8px]">Closed</span>
                </div>

                {(activeRole === 'CEO' || activeRole === 'Administrator') && (
                  <button
                    onClick={() => {
                      setTasks(prev => prev.filter(t => t.id !== task.id));
                      triggerToast("Task permanently deleted.", "error");
                    }}
                    className="w-full bg-red-50 text-red-700 hover:bg-red-100 text-[9px] font-black py-2.5 rounded-xl uppercase flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getFilteredTasks = (taskList) => {
    if (taskFilterStatus === 'All') return taskList;
    if (taskFilterStatus === 'Pending') return taskList.filter(t => t.status === 'Pending');
    if (taskFilterStatus === 'In Progress') return taskList.filter(t => t.status === 'In Progress');
    if (taskFilterStatus === 'Under Review') return taskList.filter(t => t.status === 'Under Review');
    if (taskFilterStatus === 'Completed') return taskList.filter(t => t.status === 'Completed');
    return taskList;
  };

  const getSalesOverviewStats = () => {
    const salesStaff = staff.filter(s => s.dept === 'Sales');
    const staffPerformance = salesStaff.map(member => {
      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        leads: member.leads || 150,
        conversions: member.conversions || 48
      };
    });

    const todaysLeadsCount = salesStaff.reduce((sum, s) => sum + (s.id === 'st-03' ? 12 : 18), 0);
    const todaysConversionsCount = salesStaff.reduce((sum, s) => sum + (s.id === 'st-03' ? 4 : 5), 0);

    return {
      todaysLeadsCount,
      todaysConversionsCount,
      staffPerformance
    };
  };

  const getAdminFilteredTasks = () => {
    const isManager = currentStaffProfile?.role === 'Manager';
    const dept = currentStaffProfile?.dept || 'Sales';

    let list = tasks;

    if (isManager && dept !== 'Administration') {
      if (taskFilterStatus === 'My Tasks') {
        return list.filter(t => t.assigneeId === currentStaffProfile?.id);
      } else {
        return list.filter(t => {
          const assignee = staff.find(s => s.id === t.assigneeId);
          return assignee?.dept?.toLowerCase() === dept.toLowerCase();
        });
      }
    }

    if (taskFilterStatus === 'All') return list;
    if (taskFilterStatus === 'My Tasks') return list.filter(t => t.assigneeId === currentStaffProfile?.id);
    
    return list.filter(t => {
      const assignee = staff.find(s => s.id === t.assigneeId);
      return assignee?.dept?.toLowerCase() === taskFilterStatus.toLowerCase();
    });
  };

  const renderRequestHub = () => {
    const activeUserId = activeRole === 'CEO' ? 'ceo' : activeRole === 'Administrator' ? 'st-01' : selectedStaffId;
    const filedRequests = requests.filter(r => r.staffId === activeUserId);
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
          <span className="text-[9.5px] font-black text-[#2E2A75] uppercase block tracking-wider">
            Communication & Requests Hub
          </span>
          <p className="text-[8px] text-slate-450 leading-relaxed font-bold">
            Submit operational leaves or request access authorizations directly into the central database.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setLeaveStep(1);
                setIsLeaveReqModalOpen(true);
              }}
              className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-rose-100/50 transition duration-200"
            >
              <span className="p-1.5 bg-rose-500 rounded-xl text-white mb-2 shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </span>
              <span className="text-[9.5px] font-black text-rose-900 uppercase">
                Request Leave
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGenReqStep(1);
                setIsGeneralReqModalOpen(true);
              }}
              className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-indigo-100/50 transition duration-200"
            >
              <span className="p-1.5 bg-[#2E2A75] rounded-xl text-white mb-2 shadow-sm">
                <Plus className="w-5 h-5" />
              </span>
              <span className="text-[9.5px] font-black text-indigo-900 uppercase">
                New Request
              </span>
            </button>
          </div>
        </div>

        {/* Display recent Request statuses */}
        <div className="space-y-2">
          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block px-1">
            Your Filed Applications
          </span>
          {filedRequests.length === 0 ? (
            <div className="p-4 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[8.5px] font-semibold">
              No requests filed yet.
            </div>
          ) : (
            filedRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center text-[9px]"
              >
                <div className="truncate pr-4">
                  <p className="font-bold text-slate-800 truncate">{req.title}</p>
                  <span className="text-[7.5px] text-slate-400 uppercase block">
                    {req.date}
                  </span>
                </div>
                <span
                  className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${
                    req.status === "Approved" || req.status === "approved"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      : req.status === "Declined" || req.status === "rejected"
                      ? "bg-red-50 text-red-800 border border-red-100"
                      : "bg-amber-50 text-amber-800 border border-amber-100"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F111E] flex flex-col items-center justify-center py-6 px-4 font-sans text-slate-800 selection:bg-orange-200">
      
      {/* Android emulation frame */}
      <div className="relative w-[390px] h-[844px] bg-[#FAFAFC] rounded-[42px] border-[10px] border-slate-950 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Status bar */}
        <div className="h-10 bg-white flex items-center justify-between px-5 shrink-0 relative z-50 select-none text-slate-800 text-[11px] font-medium border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900">08:08 AM</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A20] animate-pulse"></div>
          </div>
          
          {/* Selfie camera punch-hole */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#1a1c2e] rounded-full"></div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Radio className="w-3.5 h-3.5 text-[#FF5A20] animate-pulse" />
            <span className="text-[10px] font-bold">5G</span>
            <span className="text-[10px] font-bold">94%</span>
            <div className="w-4 h-2.5 border border-slate-900 rounded-2xs p-px flex items-center">
              <div className="w-3/4 h-full bg-slate-900 rounded-3xs"></div>
            </div>
          </div>
        </div>

        {/* Floating validation notification box */}
        {notification && (
          <div className="absolute top-14 left-4 right-4 z-55 pointer-events-none animate-bounce">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border text-[10px] font-black ${
              notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A20] shrink-0" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Congrats animation panel */}
        {congratsData && (
          <div className="absolute inset-0 bg-[#2E2A75]/95 z-[200] flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i} className="absolute w-2 h-4 bg-amber-400 opacity-80"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-20px',
                    animation: `confettiFall ${2 + Math.random() * 2}s linear infinite`,
                    animationDelay: `${Math.random() * 1.5}s`
                  }}
                />
              ))}
            </div>

            <Award className="w-12 h-12 text-[#FF5A20] animate-pulse mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">{congratsData.title}</h2>
            <p className="text-xs text-indigo-150 mt-2 font-medium px-4">{congratsData.desc}</p>

            <button
              onClick={() => setCongratsData(null)}
              className="mt-8 bg-gradient-to-r from-[#FF5A20] to-orange-500 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Identity authentication block (Login) */}
        {!isLoggedIn ? (
          <div className="flex-1 bg-white overflow-y-auto flex flex-col justify-between px-6 py-5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ANDROID SECURITY ACTIVE</span>
                <span className="text-[7.5px] bg-slate-100 text-[#2E2A75] font-black px-2 py-0.5 rounded-md">V4.2.0 STABLE</span>
              </div>

              <div className="flex items-center gap-3">
                <img 
                  src="Usthad Logo - favicon circle.png" 
                  className="w-11 h-11 object-contain rounded-full border border-slate-100 shadow-md" 
                  alt="Usthad Academy" 
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-[#2E2A75] tracking-tight uppercase">Usthad</span>
                    <span className="text-lg font-black text-[#FF5A20] tracking-tight uppercase">Console</span>
                  </div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Android Core Roster Node</p>
                </div>
              </div>

              <p className="text-[9.5px] text-slate-500 leading-relaxed font-medium bg-slate-50 border border-slate-100 rounded-xl p-3">
                Welcome to the central node. This interface is reserved for Executive Management to orchestrate Academy operations.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 my-4">
              <div className="space-y-1">
                <h2 className="text-[14px] font-black text-[#2E2A75] uppercase tracking-tight">Identity Authentication</h2>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Verify security clearance to proceed.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">Access Identifier</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Username or Email"
                    className="w-full bg-slate-50 text-[10.5px] pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">Security Key</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-slate-50 text-[10.5px] px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" required
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button" onClick={() => setTrustWorkstation(!trustWorkstation)}
                  className={`w-7 h-4 rounded-full p-0.5 transition-all duration-200 flex ${
                    trustWorkstation ? 'bg-[#FF5A20] justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-sm"></span>
                </button>
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Trust This Workstation</span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF5A20] to-[#2E2A75] text-white font-black text-[10px] py-3 rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Access Console <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[7px] font-black text-slate-400 uppercase block tracking-wider text-center">Quick Access bypass</span>
              <div className="grid grid-cols-4 gap-1">
                <button type="button" onClick={() => handleQuickLogin('CEO')} className="bg-orange-50 text-[#FF5A20] font-black text-[7px] py-1 rounded">👑 CEO</button>
                <button type="button" onClick={() => handleQuickLogin('Administrator')} className="bg-indigo-50 text-[#2E2A75] font-black text-[7px] py-1 rounded">🧠 Admin</button>
                <button type="button" onClick={() => handleQuickLogin('Finance')} className="bg-emerald-50 text-emerald-800 font-black text-[7px] py-1 rounded">💸 Finance</button>
                <button type="button" onClick={() => handleQuickLogin('Sales')} className="bg-amber-50 text-amber-800 font-black text-[7px] py-1 rounded">📈 Sales</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Premium Corporate Glassmorphic Header */}
            {!isProfileModalOpen && (
              <header className="mx-4 mb-2 mt-4 rounded-[24px] px-5 py-3 bg-white/80 backdrop-blur-md border border-slate-100 flex items-center justify-between shrink-0 relative z-40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all">
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="relative w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden hover:scale-105 transition bg-gradient-to-tr from-[#e86123] to-[#351e6a] text-white"
                  >
                    {getCurrentUserAvatar()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                  </button>
                  <div>
                    <div className="flex items-center gap-0.5 leading-none">
                      <span className="text-[11px] font-black text-[#2E2A75] uppercase">Usthad</span>
                      <span className="text-[11px] font-black text-[#FF5A20] uppercase">Academy</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsCommunityBoardOpen(true)} 
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl relative transition-all active:scale-95"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF5A20] rounded-full animate-pulse"></span>
                  </button>
                  {activeRole === "CEO" && (
                    <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                      CEO
                    </span>
                  )}
                  {activeRole === "Administrator" && (
                    <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
                      Admin
                    </span>
                  )}
                  {activeRole === "Staff" && (
                    <span className="text-[8px] font-black text-orange-700 bg-orange-50 border border-orange-150 px-2.5 py-1 rounded-lg">
                      Staff
                    </span>
                  )}
                </div>
              </header>
            )}

            {/* Viewports Containers */}
            <div className="flex-1 overflow-y-auto bg-[#FAFAFC] p-4">

              {/* ========================================================= */}
              {/* 1. CEO SUITE DASHBOARD VIEWPORT */}
              {/* ========================================================= */}
              {activeRole === 'CEO' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {ceoTab === 'home' && (
                    <>
                      {/* Premium Personalized Greeting Card */}
                      <div className="bg-gradient-to-br from-[#2E2A75] via-[#24215C] to-[#141236] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden border-b-4 border-[#FF5A20]">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF5A20]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 space-y-1">
                          <span className="text-[7px] bg-[#FF5A20] text-white font-extrabold tracking-widest px-2 py-0.5 rounded uppercase">
                            Executive Suite
                          </span>
                          <h2 className="text-[17px] font-black tracking-tight text-white leading-tight pt-1">
                            {getGreetingText()}, Chief!
                          </h2>
                          <p className="text-[8.5px] text-slate-300 font-medium">
                            Control strategic architecture, manage ledger validations, and monitor targets.
                          </p>
                        </div>
                      </div>

                      {/* Operational Metrics Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Active Roster</span>
                            <Users className="w-4 h-4 text-[#2E2A75]" />
                          </div>
                          <span className="text-base font-black text-[#2E2A75] mt-1.5 block">{staff.length} Staffs</span>
                          <p className="text-[7px] text-slate-400 mt-1 font-semibold">Registered Team Members</p>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-black">Global Backlog</span>
                            <Briefcase className="w-4 h-4 text-[#FF5A20]" />
                          </div>
                          <span className="text-base font-black text-[#FF5A20] mt-1.5 block">{totalActiveTasksCount} tasks</span>
                          <p className="text-[7px] text-slate-400 mt-1 font-semibold">Pending completion</p>
                        </div>
                      </div>

                      {/* Channel navigations */}
                      <div className="space-y-2">
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block px-1">Analytical Channels</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button 
                            onClick={() => setCeoTab('finance')}
                            className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left"
                          >
                            <div>
                              <span className="text-[7px] font-black text-[#FF5A20] uppercase block">Ledger Stats</span>
                              <p className="text-[10px] font-black text-[#2E2A75] mt-0.5">Finance Dashboard</p>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button 
                            onClick={() => setCeoTab('sales')}
                            className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left"
                          >
                            <div>
                              <span className="text-[7px] font-black text-[#2E2A75] uppercase block">Conversions Log</span>
                              <p className="text-[10px] font-black text-[#FF5A20] mt-0.5">Sales Performance</p>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* PREMIUM ADAPTIVE TASKS ON HOME SCREEN */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Missions Pipeline</span>
                          <span className="text-[8px] bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded font-black">{tasks.length} active</span>
                        </div>

                        {/* Task Status Filters Bar */}
                        <div className="flex gap-1 overflow-x-auto pb-1 select-none no-scrollbar">
                          {['All', 'Pending', 'In Progress', 'Under Review', 'Completed'].map(filterState => {
                            const matchingCount = filterState === 'All' ? tasks.length : tasks.filter(t => t.status === filterState).length;
                            return (
                              <button
                                key={filterState}
                                onClick={() => setTaskFilterStatus(filterState)}
                                className={`px-2.5 py-1 text-[8.5px] font-extrabold uppercase rounded-full transition shrink-0 ${
                                  taskFilterStatus === filterState 
                                    ? 'bg-[#FF5A20] text-white shadow-xs' 
                                    : 'bg-white text-slate-500 border border-slate-200'
                                }`}
                              >
                                {filterState} ({matchingCount})
                              </button>
                            );
                          })}
                        </div>

                        {getFilteredTasks(tasks).length === 0 ? (
                          <div className="p-6 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[9.5px] font-semibold">
                            No tasks found matching filter criteria.
                          </div>
                        ) : (
                          getFilteredTasks(tasks).map(task => renderPremiumTaskCard(task))
                        )}
                      </div>

                      {/* Captured ideas desk */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF5A20]" />
                            <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">Ideas & Checkpoints</span>
                          </div>
                          <span className="text-[7px] text-slate-400 font-bold uppercase">Hold down to Delete</span>
                        </div>

                        <form onSubmit={handleAddTodo} className="flex gap-2">
                          <input
                            type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                            placeholder="Capture tactical idea or checklist..."
                            className="flex-1 bg-slate-50 text-[9px] px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium placeholder-slate-400"
                          />
                          <button type="submit" className="bg-[#2E2A75] text-white px-3 rounded-lg text-[10px] font-black">+</button>
                        </form>

                        <div className="space-y-2 pt-1">
                          {todoList.map(todo => {
                            const isHolding = longPressTodoId === todo.id;
                            return (
                              <div
                                key={todo.id}
                                onMouseDown={() => handleTodoPressStart(todo.id)}
                                onMouseUp={() => handleTodoPressCancel()}
                                onMouseLeave={() => handleTodoPressCancel()}
                                onTouchStart={() => handleTodoPressStart(todo.id)}
                                onTouchEnd={() => handleTodoPressCancel()}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                  isHolding ? 'border-red-300 bg-red-50/10' : 'border-slate-100 bg-slate-50/60'
                                }`}
                              >
                                {isHolding && (
                                  <div 
                                    className="absolute bottom-0 left-0 top-0 bg-red-500/10 transition-all ease-linear"
                                    style={{ width: `${longPressProgress}%` }}
                                  />
                                )}
                                <div className="flex items-center gap-2 relative z-10">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleTodo(todo.id); }}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                      todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {todo.completed && <Check className="w-2.5 h-2.5" />}
                                  </button>
                                  <span className={`text-[9px] font-semibold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                    {todo.text}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {renderRequestHub()}
                    </>
                  )}

                  {/* CEO TAB: TASKS (PIPELINE VIEW) */}
                  {ceoTab === 'tasks' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Global Pipeline</span>
                        <span className="text-[8px] bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded font-black">{tasks.length} active</span>
                      </div>

                      {/* Task Status Filters Bar for dedicated tasks page */}
                      <div className="flex gap-1 overflow-x-auto pb-1 select-none no-scrollbar">
                        {['All', 'Pending', 'In Progress', 'Under Review', 'Completed'].map(filterState => {
                          const matchingCount = filterState === 'All' ? tasks.length : tasks.filter(t => t.status === filterState).length;
                          return (
                            <button
                              key={filterState}
                              onClick={() => setTaskFilterStatus(filterState)}
                              className={`px-2.5 py-1 text-[8.5px] font-extrabold uppercase rounded-full transition shrink-0 ${
                                taskFilterStatus === filterState 
                                  ? 'bg-[#FF5A20] text-white shadow-xs' 
                                  : 'bg-white text-slate-500 border border-slate-200'
                              }`}
                            >
                              {filterState} ({matchingCount})
                            </button>
                          );
                        })}
                      </div>

                      {getFilteredTasks(tasks).length === 0 ? (
                        <div className="p-6 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[9.5px] font-semibold">
                          No tasks matching filters.
                        </div>
                      ) : (
                        getFilteredTasks(tasks).map(task => renderPremiumTaskCard(task))
                      )}
                    </div>
                  )}

                  {/* CEO TAB: APPROVALS */}
                  {ceoTab === 'approvals' && (
                    <div className="space-y-3 animate-fadeIn">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">Inbox Approvals Queue</span>
                      {requests.map(req => (
                        <div key={req.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                          <div className="flex justify-between text-[7px] font-bold">
                            <span className="text-[#2E2A75] font-black">{req.staffName}</span>
                            <span className="text-slate-400">{req.date}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[6.5px] text-[#FF5A20] font-black block uppercase">{req.type}</span>
                            <p className="text-[8.5px] text-slate-600 font-medium leading-relaxed">{req.description}</p>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[8px] font-black uppercase text-slate-400">Status: {req.status}</span>
                            {req.status === 'pending' && (
                              <div className="flex gap-1.5">
                                <button onClick={() => handleProcessRequest(req.id, 'Approved')} className="bg-emerald-600 text-white font-black text-[8px] px-2.5 py-1 rounded">Approve</button>
                                <button onClick={() => handleProcessRequest(req.id, 'Declined')} className="bg-red-50 text-red-600 border border-red-100 text-[8px] px-2.5 py-1 rounded">Decline</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CEO TAB: STAFF (MATRIX) */}
                  {ceoTab === 'staff' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest px-1">Staff Matrix</span>
                        <button
                          onClick={() => setIsAddStaffModalOpen(true)}
                          className="bg-[#2E2A75] text-white text-[8px] font-black uppercase px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-3 h-3" /> Onboard Staff
                        </button>
                      </div>

                      <p className="text-[7.5px] text-[#FF5A20] font-black uppercase bg-orange-50/50 p-2 rounded-lg text-center tracking-wider leading-relaxed">
                        ⚠️ Hold down a staff card to delete them.
                      </p>

                      <div className="space-y-2.5">
                        {staff.map(member => {
                          const pendingCount = tasks.filter(t => t.assigneeId === member.id && t.status !== 'Completed').length;
                          const completedCount = tasks.filter(t => t.assigneeId === member.id && t.status === 'Completed').length;
                          const isHolding = longPressActiveId === member.id;

                          return (
                            <div
                              key={member.id}
                              onMouseDown={() => handleStaffPressStart(member.id)}
                              onMouseUp={() => handleStaffPressCancel()}
                              onMouseLeave={() => handleStaffPressCancel()}
                              onTouchStart={() => handleStaffPressStart(member.id)}
                              onTouchEnd={() => handleStaffPressCancel()}
                              className={`bg-white p-3 rounded-2xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                isHolding ? 'border-red-300 bg-red-50/10' : 'border-slate-100 shadow-sm'
                              }`}
                            >
                              {isHolding && (
                                <div 
                                  className="absolute bottom-0 left-0 top-0 bg-red-500/15 transition-all ease-linear"
                                  style={{ width: `${longPressProgress}%` }}
                                />
                              )}

                              <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl bg-slate-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                                    {member.avatar}
                                  </span>
                                  <div>
                                    <h4 className="text-[10px] font-black text-slate-950">{member.name}</h4>
                                    <p className="text-[8px] font-bold text-slate-400 mt-0.5">{member.dept} · <span className="text-[#FF5A20] font-black">{member.role}</span></p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[7.5px] text-slate-400 font-bold block">Tasks Pipeline</span>
                                  <div className="flex gap-1.5 mt-0.5 justify-end">
                                    <span className="bg-amber-50 text-amber-700 font-black text-[7px] px-1.5 py-0.5 rounded">
                                      {pendingCount} Pending
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 font-black text-[7px] px-1.5 py-0.5 rounded">
                                      {completedCount} Completed
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CEO TAB: FINANCE */}
                  {ceoTab === 'finance' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="border-l-4 border-[#FF5A20] pl-2">
                        <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">Live Ledger Dashboard</h3>
                        <p className="text-[7.5px] text-slate-400 font-bold uppercase">Visibility Into Revenue</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="text-[8px] text-slate-400 font-bold block">Today's UloomX Income</span>
                          <p className="text-base font-black text-[#2E2A75] mt-1">₹{parseFloat(finUloomX || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                          <span className="text-[8px] text-slate-400 font-bold block">Today's Usthad Income</span>
                          <p className="text-base font-black text-[#FF5A20] mt-1">₹{parseFloat(finUsthad || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                        <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">Monthly Performance</span>
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[6.5px] font-bold text-slate-400 block">UloomX</span>
                            <span className="text-[9px] font-black text-slate-900 block mt-0.5">₹12,000</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[6.5px] font-bold text-slate-400 block">Usthad</span>
                            <span className="text-[9px] font-black text-slate-900 block mt-0.5">₹24,000</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[6.5px] font-bold text-slate-400 block">Expenses</span>
                            <span className="text-[9px] font-black text-slate-900 block mt-0.5">₹20,000</span>
                          </div>
                        </div>

                        <div className="border border-[#FF5A20] bg-orange-50/20 p-3 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="text-[7px] font-black text-[#FF5A20] uppercase block">Current Balance</span>
                            <span className="text-sm font-black text-[#FF5A20]">₹16,000</span>
                          </div>
                          <span className="text-[7.5px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
                            🟢 18% Growth
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CEO TAB: SALES */}
                  {ceoTab === 'sales' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="border-l-4 border-[#2E2A75] pl-2">
                        <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">Sales Intelligence</h3>
                        <p className="text-[7.5px] text-slate-400 font-bold uppercase">Conversions & achievements</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">Total Assigned Leads</span>
                          <span className="text-base font-black text-[#2E2A75] mt-1 block">{totalLeads}</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">Total Conversions</span>
                          <span className="text-base font-black text-[#FF5A20] mt-1 block">{totalConversions}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <span className="text-[8.5px] font-black text-[#2E2A75] uppercase block tracking-wider">Sales Team Targets Overview</span>
                        <div className="space-y-2.5">
                          {staff.filter(s => s.dept === 'Sales').map(member => {
                            const targetVal = member.target || 100;
                            const achieved = member.conversions || 0;
                            const percent = Math.min(100, Math.round((achieved / targetVal) * 100));
                            return (
                              <div key={member.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center text-[9px]">
                                  <div>
                                    <span className="font-black text-slate-900 block">{member.name}</span>
                                    <span className="text-[7px] text-slate-400 uppercase block font-bold">Role: {member.role}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[#FF5A20] font-black">{achieved}</span>
                                    <span className="text-slate-400 font-bold"> / {targetVal} Target</span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                  <div className="bg-[#2E2A75] h-full" style={{ width: `${percent}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[7.5px] font-bold text-slate-400">
                                  <span>Progress Ratio</span>
                                  <span>{percent}% Met</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ========================================================= */}
              {/* 2. ADMINISTRATOR SUITE DASHBOARD VIEWPORT */}
              {/* ========================================================= */}
              {activeRole === 'Administrator' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {adminTab === 'home' && (
                    <>
                      {/* Dynamic Administrator Greeting Card */}
                      <div className="bg-gradient-to-br from-[#1E293B] to-[#2E2A75] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A20]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 space-y-1">
                          <span className="text-[7px] bg-[#FF5A20] text-white font-extrabold tracking-widest px-2 py-0.5 rounded uppercase">
                            ⚡ Operations Control
                          </span>
                          <h2 className="text-[17px] font-black tracking-tight text-white leading-tight pt-1">
                            {getGreetingText()}, Sarah!
                          </h2>
                          <p className="text-[8.5px] text-indigo-100 font-medium">
                            Manage daily rosters, direct task lists, and delegate executive operations.
                          </p>
                        </div>
                      </div>

                      {/* Operational metrics stats cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Team Count</span>
                            <Users className="w-4 h-4 text-[#2E2A75]" />
                          </div>
                          <span className="text-base font-black text-[#2E2A75] mt-1.5 block">{staff.length} Staffs</span>
                          <p className="text-[7px] text-slate-400 mt-1 font-semibold">Active Roster</p>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Tasks Stream</span>
                            <Briefcase className="w-4 h-4 text-[#FF5A20]" />
                          </div>
                          <span className="text-base font-black text-[#FF5A20] mt-1.5 block">{totalActiveTasksCount} tasks</span>
                          <p className="text-[7px] text-slate-400 mt-1 font-semibold">Assigned missions</p>
                        </div>
                      </div>

                      {/* PREMIUM ADAPTIVE TASKS ON HOME SCREEN */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Missions Pipeline</span>
                          <span className="text-[8px] bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded font-black">{tasks.length} active</span>
                        </div>

                        {/* Task Status Filters Bar */}
                        <div className="flex gap-1 overflow-x-auto pb-1 select-none no-scrollbar">
                          {['All', 'Pending', 'In Progress', 'Under Review', 'Completed'].map(filterState => {
                            const matchingCount = filterState === 'All' ? tasks.length : tasks.filter(t => t.status === filterState).length;
                            return (
                              <button
                                key={filterState}
                                onClick={() => setTaskFilterStatus(filterState)}
                                className={`px-2.5 py-1 text-[8.5px] font-extrabold uppercase rounded-full transition shrink-0 ${
                                  taskFilterStatus === filterState 
                                    ? 'bg-[#FF5A20] text-white shadow-xs' 
                                    : 'bg-white text-slate-500 border border-slate-200'
                                }`}
                              >
                                {filterState} ({matchingCount})
                              </button>
                            );
                          })}
                        </div>

                        {getFilteredTasks(tasks).length === 0 ? (
                          <div className="p-6 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[9.5px] font-semibold">
                            No tasks found matching filter criteria.
                          </div>
                        ) : (
                          getFilteredTasks(tasks).map(task => renderPremiumTaskCard(task))
                        )}
                      </div>

                      {/* Operations checkpoints checklist */}
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF5A20]" />
                            <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">Operations Checkpoints</span>
                          </div>
                          <span className="text-[7px] text-slate-400 font-bold uppercase">Hold down to Delete</span>
                        </div>

                        <form onSubmit={handleAddTodo} className="flex gap-2">
                          <input
                            type="text" value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)}
                            placeholder="Add system update checklist..."
                            className="flex-1 bg-slate-50 text-[9px] px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium placeholder-slate-400"
                          />
                          <button type="submit" className="bg-[#2E2A75] text-white px-3 rounded-lg text-[10px] font-black">+</button>
                        </form>

                        <div className="space-y-2 pt-1">
                          {todoList.map(todo => {
                            const isHolding = longPressTodoId === todo.id;
                            return (
                              <div
                                key={todo.id}
                                onMouseDown={() => handleTodoPressStart(todo.id)}
                                onMouseUp={() => handleTodoPressCancel()}
                                onMouseLeave={() => handleTodoPressCancel()}
                                onTouchStart={() => handleTodoPressStart(todo.id)}
                                onTouchEnd={() => handleTodoPressCancel()}
                                className={`flex items-center justify-between p-2 rounded-xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                  isHolding ? 'border-red-300 bg-red-50/10' : 'border-slate-100 bg-slate-50/60'
                                }`}
                              >
                                {isHolding && (
                                  <div 
                                    className="absolute bottom-0 left-0 top-0 bg-red-500/10 transition-all"
                                    style={{ width: `${longPressProgress}%` }}
                                  />
                                )}
                                <div className="flex items-center gap-2 relative z-10">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleTodo(todo.id); }}
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                      todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {todo.completed && <Check className="w-2.5 h-2.5" />}
                                  </button>
                                  <span className={`text-[9px] font-semibold ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                    {todo.text}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {renderRequestHub()}
                    </>
                  )}

                  {/* ADMIN ACTIVE TASKS */}
                  {adminTab === 'tasks' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Assigned Tasks Log</span>
                        <span className="text-[8px] bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded font-black">{tasks.length} active</span>
                      </div>

                      {/* Manager-safe Filter Pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
                        {(
                          currentStaffProfile?.role === 'Manager' && currentStaffProfile?.dept !== 'Administration'
                            ? ['All', 'My Tasks']
                            : ['All', 'My Tasks', 'Sales', 'Finance', 'Marketing', 'Administration']
                        ).map((filterVal) => {
                          const isActive = taskFilterStatus === filterVal;
                          return (
                            <button
                              key={filterVal}
                              type="button"
                              onClick={() => setTaskFilterStatus(filterVal)}
                              className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full transition-all shrink-0 border ${
                                isActive
                                  ? 'bg-[#2E2A75] text-white border-[#2E2A75]'
                                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              {filterVal}
                            </button>
                          );
                        })}
                      </div>

                      {getAdminFilteredTasks().length === 0 ? (
                        <div className="p-6 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[9.5px] font-semibold">
                          No matching items.
                        </div>
                      ) : (
                        getAdminFilteredTasks().map(task => renderPremiumTaskCard(task))
                      )}
                    </div>
                  )}

                  {/* ADMIN STAFF ROSTER */}
                  {adminTab === 'staff' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest px-1">Roster Matrix</span>
                        <button
                          onClick={() => setIsAddStaffModalOpen(true)}
                          className="bg-[#2E2A75] text-white text-[8px] font-black uppercase px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-3 h-3" /> Provision Personnel
                        </button>
                      </div>

                      <p className="text-[7.5px] text-[#FF5A20] font-black uppercase bg-orange-50/50 p-2 rounded-lg text-center tracking-wider">
                        ⚠️ Hold down card to remove staff member.
                      </p>

                      <div className="space-y-2.5">
                        {staff.map(member => {
                          const pendingCount = tasks.filter(t => t.assigneeId === member.id && t.status !== 'Completed').length;
                          const completedCount = tasks.filter(t => t.assigneeId === member.id && t.status === 'Completed').length;
                          const isHolding = longPressActiveId === member.id;

                          return (
                            <div
                              key={member.id}
                              onMouseDown={() => handleStaffPressStart(member.id)}
                              onMouseUp={() => handleStaffPressCancel()}
                              onMouseLeave={() => handleStaffPressCancel()}
                              onTouchStart={() => handleStaffPressStart(member.id)}
                              onTouchEnd={() => handleStaffPressCancel()}
                              className={`bg-white p-3 rounded-2xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                isHolding ? 'border-red-300 scale-98 bg-red-50/10' : 'border-slate-100 shadow-sm'
                              }`}
                            >
                              {isHolding && (
                                <div 
                                  className="absolute bottom-0 left-0 top-0 bg-red-500/15 transition-all ease-linear"
                                  style={{ width: `${longPressProgress}%` }}
                                />
                              )}

                              <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl bg-slate-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                                    {member.avatar}
                                  </span>
                                  <div>
                                    <h4 className="text-[10px] font-black text-slate-950">{member.name}</h4>
                                    <p className="text-[8px] font-bold text-slate-400 mt-0.5">{member.dept} · <span className="text-[#FF5A20] font-black">{member.role}</span></p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[7.5px] bg-slate-50 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                                    P: {pendingCount} | C: {completedCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ADMIN TAB: SALES VIEWPORT */}
                  {adminTab === 'sales' && (() => {
                    const { todaysLeadsCount, todaysConversionsCount, staffPerformance } = getSalesOverviewStats();
                    return (
                      <div className="space-y-3.5 animate-fadeIn text-left">
                        <div className="border-l-4 border-[#2E2A75] pl-2">
                          <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">
                            Sales intelligence
                          </h3>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase">
                            Assigned conversions & achievements
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">
                              Today's Total Leads
                            </span>
                            <span className="text-base font-black text-[#2E2A75] mt-1 block">
                              {todaysLeadsCount}
                            </span>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">
                              Today's Conversions
                            </span>
                            <span className="text-base font-black text-[#FF5A20] mt-1 block">
                              {todaysConversionsCount}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                          <span className="text-[8.5px] font-black text-[#2E2A75] uppercase block tracking-wider">
                            Sales Staff Performance
                          </span>
                          <div className="space-y-2.5">
                            {staffPerformance.map((member) => (
                              <div
                                key={member.id}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-[9px]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{member.avatar}</span>
                                  <div>
                                    <span className="font-black text-slate-900 block">
                                      {member.name}
                                    </span>
                                    <span className="text-[7px] text-slate-400 uppercase block font-bold">
                                      {member.role}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <span className="text-slate-400 font-bold block text-[7px] uppercase">Leads</span>
                                    <span className="text-[#2E2A75] font-black block">{member.leads}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold block text-[7px] uppercase">Conversions</span>
                                    <span className="text-[#FF5A20] font-black block">{member.conversions}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* ========================================================= */}
              {/* 3. STAFF PORTAL SUITE VIEWPORT */}
              {/* ========================================================= */}
              {activeRole === 'Staff' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* STAFF TAB: HOME */}
                  {staffTab === 'home' && (
                    <div className="space-y-4">
                      {/* Dynamic Personalized Staff Greeting Card */}
                      <div className="bg-gradient-to-br from-[#2E2A75] via-[#24215C] to-[#141236] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A20]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 space-y-1">
                          <span className="text-[7px] bg-[#FF5A20] text-white font-extrabold tracking-widest px-2 py-0.5 rounded uppercase">
                            Staff Suite
                          </span>
                          <h2 className="text-[17px] font-black tracking-tight text-white leading-tight pt-1">
                            {getGreetingText()}, {currentStaffProfile.name.split(' ')[0]}!
                          </h2>
                          <p className="text-[8.5px] text-slate-300 font-semibold">
                            Dept: <span className="text-white font-black">{currentStaffProfile.dept}</span> · Pos: <span className="text-[#FF5A20] font-black">{currentStaffProfile.role}</span>
                          </p>
                        </div>
                      </div>

                      {/* PREMIUM ADAPTIVE TASKS ON HOME SCREEN */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">Your Assigned Targets</span>
                          <span className="text-[8px] bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded font-black">
                            {tasks.filter(t => t.assigneeId === currentStaffProfile.id).length} active
                          </span>
                        </div>

                        {/* Task Status Filters Bar */}
                        <div className="flex gap-1 overflow-x-auto pb-1 select-none no-scrollbar">
                          {['All', 'Pending', 'In Progress', 'Under Review', 'Completed'].map(filterState => {
                            const currentStaffTasks = tasks.filter(t => t.assigneeId === currentStaffProfile.id);
                            const matchingCount = filterState === 'All' ? currentStaffTasks.length : currentStaffTasks.filter(t => t.status === filterState).length;
                            return (
                              <button
                                key={filterState}
                                onClick={() => setTaskFilterStatus(filterState)}
                                className={`px-2.5 py-1 text-[8.5px] font-extrabold uppercase rounded-full transition shrink-0 ${
                                  taskFilterStatus === filterState 
                                    ? 'bg-[#FF5A20] text-white shadow-xs' 
                                    : 'bg-white text-slate-500 border border-slate-200'
                                }`}
                              >
                                {filterState} ({matchingCount})
                              </button>
                            );
                          })}
                        </div>

                        {getFilteredTasks(tasks.filter(t => t.assigneeId === currentStaffProfile.id)).length === 0 ? (
                          <div className="p-6 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[9.5px] font-semibold">
                            No tasks found matching filter criteria.
                          </div>
                        ) : (
                          getFilteredTasks(tasks.filter(t => t.assigneeId === currentStaffProfile.id)).map(task => renderPremiumTaskCard(task))
                        )}
                      </div>
                    </div>
                  )}

                  {/* STAFF TAB: ASSIGNED TASKS */}
                  {staffTab === 'tasks' && (
                    <div className="space-y-3 animate-fadeIn">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">Assigned Targets</span>
                      {tasks.filter(t => t.assigneeId === currentStaffProfile.id).map(task => renderPremiumTaskCard(task))}
                    </div>
                  )}

                  {/* STAFF TAB: PORTAL */}
                  {staffTab === 'portal' && (
                    renderRequestHub()
                  )}

                  {/* STAFF TAB: DEPARTMENT SPECIALIZED WORKSPACES */}
                  {staffTab === 'specialized' && (
                    <div className="space-y-4 animate-fadeIn">
                      
                      {/* FINANCE DEPT STAFF WORKSPACE (2026-05-29_08-08-17.jpg Replication) */}
                      {currentStaffProfile.dept === 'Finance' && (
                        <div className="space-y-3.5">
                          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#FF5A20]/10 p-2 rounded-2xl text-[#FF5A20] font-black">AC</span>
                                <div>
                                  <span className="text-[8px] bg-orange-50 text-[#FF5A20] px-1.5 py-0.5 rounded font-black uppercase">ACCOUNTS</span>
                                  <h3 className="text-[12px] font-black text-slate-950 mt-0.5">Good Morning</h3>
                                  <p className="text-[8px] text-slate-400 font-semibold">Ready to record today's flow</p>
                                </div>
                              </div>
                              <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded-full">08:08 AM</span>
                            </div>

                            <div className="space-y-3 border-t border-slate-100 pt-3">
                              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Daily Entry</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5 relative">
                                  <label className="text-[6.5px] text-[#2E2A75] font-black uppercase block">UloomX Income</label>
                                  <div className="relative">
                                    <input 
                                      type="number" value={finUloomX} onChange={(e) => setFinUloomX(e.target.value)}
                                      className="w-full bg-slate-50 text-[10px] pl-2 pr-6 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" 
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-[9px]">₹</span>
                                  </div>
                                </div>
                                <div className="space-y-0.5 relative">
                                  <label className="text-[6.5px] text-[#2E2A75] font-black uppercase block">Usthad Academy Income</label>
                                  <div className="relative">
                                    <input 
                                      type="number" value={finUsthad} onChange={(e) => setFinUsthad(e.target.value)}
                                      className="w-full bg-slate-50 text-[10px] pl-2 pr-6 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-900" 
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-[9px]">₹</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-0.5 relative">
                                <label className="text-[6.5px] text-slate-400 font-black uppercase block">Total Expenses</label>
                                <div className="relative">
                                  <input 
                                    type="number" value={finExpenses} onChange={(e) => setFinExpenses(e.target.value)}
                                    className={`w-full bg-slate-50 text-[10px] pl-2 pr-6 py-2 border rounded-xl outline-none font-bold text-slate-900 ${
                                      expenseRatio > 50 ? 'border-red-400 bg-red-50/10' : 'border-slate-200'
                                    }`} 
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-[9px]">₹</span>
                                </div>
                              </div>

                              <div className={`p-3 rounded-xl flex justify-between items-center ${
                                computedNetRevenue >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                <span className="text-[8px] font-black uppercase tracking-wider">📈 Revenue</span>
                                <span className="text-[12px] font-black">₹{computedNetRevenue.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                              <span className="text-[7.5px] text-slate-400 font-black uppercase block">Monthly Target Split Ratio</span>
                              <div className="space-y-1.5">
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                                  <div className="bg-[#ff4d00] h-full" style={{ width: `${uloomxPercentage}%` }}></div>
                                  <div className="bg-[#2C2171] h-full" style={{ width: `${usthadPercentage}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[7px] text-slate-500 font-bold">
                                  <span className="text-[#ff4d00]">UloomX: {uloomxPercentage}%</span>
                                  <span className="text-[#2C2171]">Usthad: {usthadPercentage}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 rounded-2xl border text-[8.5px] font-bold">
                              {expenseRatio > 50 ? (
                                <div className="flex items-center gap-2 text-red-700 bg-red-50 border-red-100 p-2 rounded-xl">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span>High Expense Alert: {expenseRatio}% of income exhausted.</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border-emerald-100 p-2 rounded-xl">
                                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                                  <span>Ready for Review. Metrics optimized.</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={handleTransmitFinancialReport}
                              className="w-full text-white text-[9px] py-2.5 rounded-xl uppercase font-black tracking-wider bg-[#2E2A75] hover:opacity-95 shadow-sm"
                            >
                              Transmit Report
                            </button>

                            {/* Quick History List */}
                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2 mt-3.5 text-left">
                              <span className="text-[7.5px] text-slate-400 font-black uppercase block">
                                Quick History (Last entries)
                              </span>
                              <div className="space-y-1.5">
                                {finHistory.map((hist, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-[8.5px] border-b border-slate-50 pb-1.5 last:border-0"
                                  >
                                    <div>
                                      <p className="font-bold text-slate-800">{hist.date}</p>
                                      <span className="text-[7px] text-slate-400 font-semibold">
                                        Income: ₹{hist.income.toLocaleString()}
                                      </span>
                                    </div>
                                    <span className="text-red-600 font-bold">
                                      Exp: ₹{hist.expenses.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SALES DEPT STAFF WORKSPACE (image_0fd23a.jpg Replication) */}
                      {currentStaffProfile.dept === 'Sales' && (
                        <div className="space-y-3.5 animate-fadeIn">
                          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[7px] bg-indigo-50 text-[#2E2A75] px-1.5 py-0.5 rounded font-black uppercase">SALES COMMAND</span>
                                <h3 className="text-[12px] font-black text-slate-950 mt-1 uppercase">Today's Entry</h3>
                                <p className="text-[7.5px] text-slate-400 font-bold block">Log daily conversions outcome</p>
                              </div>
                              <span className="text-[8.5px] font-black text-[#FF5A20] bg-orange-50 px-2 py-1 rounded">May 2026</span>
                            </div>

                            <div className="space-y-3 pt-2">
                              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Daily Metrics Input</span>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[6.5px] text-[#2E2A75] font-black uppercase block">Total Leads Today</label>
                                  <input 
                                    type="number" value={salesLeads} onChange={(e) => setSalesLeads(e.target.value)} disabled={isSalesLocked}
                                    className="w-full bg-slate-50 text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-xl outline-none font-bold" 
                                    placeholder="Total Leads" required
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[6.5px] text-[#2E2A75] font-black uppercase block">Evaluations Taken</label>
                                  <input 
                                    type="number" value={salesEvaluations} onChange={(e) => setSalesEvaluations(e.target.value)} disabled={isSalesLocked}
                                    className="w-full bg-slate-50 text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-xl outline-none font-bold" 
                                    placeholder="Evaluations" required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                  <label className="text-[6.5px] text-[#2E2A75] font-black uppercase block">Daily Conversions</label>
                                  <input 
                                    type="number" value={salesConversions} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSalesConversions(val);
                                      if (parseInt(val) >= (currentStaffProfile.target || 80)) {
                                        triggerCongrats("Target Achieved! 🏆", "You have successfully achieved your daily conversions limit!");
                                      }
                                    }} 
                                    disabled={isSalesLocked}
                                    className="w-full bg-slate-50 text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-xl outline-none font-bold text-emerald-700" 
                                    placeholder="Conversions" required
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[6.5px] text-[#2E2A75] font-black uppercase block">Lost Leads</label>
                                  <input 
                                    type="number" value={salesLostLeads} onChange={(e) => setSalesLostLeads(e.target.value)} disabled={isSalesLocked}
                                    className="w-full bg-slate-50 text-[10px] px-2.5 py-1.5 border border-slate-200 rounded-xl outline-none font-bold text-red-700" 
                                    placeholder="Lost Leads" required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest block">Conversion Rate</span>
                                <span className="text-sm font-black text-[#FF5A20]">{liveConversionRate}%</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest block">Efficiency Score</span>
                                <span className="text-sm font-black text-[#2E2A75]">{liveEfficiencyScore}%</span>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 space-y-2">
                              <div className="flex justify-between items-center text-[7.5px] font-bold">
                                <span className="text-slate-400 uppercase">Quality Assessment</span>
                                <span className="bg-orange-50 text-[#FF5A20] px-1.5 py-0.5 rounded uppercase">{dynamicSalesLabel} ({scoreVal}/10)</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" step="1" value={scoreVal}
                                onChange={(e) => setSalesLeadQuality([parseInt(e.target.value, 10)])}
                                disabled={isSalesLocked}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF5A20]" 
                              />
                            </div>

                            <button
                              onClick={handleTransmitSalesReport}
                              disabled={isSalesLocked}
                              className={`w-full text-[8.5px] font-black py-2.5 rounded-xl uppercase transition ${
                                isSalesLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#FF5A20] text-white hover:opacity-95 shadow-sm'
                              }`}
                            >
                              {isSalesLocked ? 'Report Transmitted' : 'Transmit Report'}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ========================================================= */}
            {/* NEW REQUEST WIZARD MODAL (Z-INDEX ELEVATION AND SCROLL FIX) */}
            {/* ========================================================= */}
            {isGeneralReqModalOpen && (
              <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">General Request</h3>
                      <p className="text-[7.5px] text-slate-400 font-extrabold uppercase">Step {genReqStep} of 4</p>
                    </div>
                    <button onClick={() => setIsGeneralReqModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {genReqStep === 1 && (
                    <div className="space-y-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Choose Request Purpose</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setGenReqType('budget'); setGenReqStep(2); }}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <Wallet className="w-6 h-6 text-[#FF5A20] mb-1" />
                          <span className="text-[9px] font-black uppercase text-slate-900">Budget Request</span>
                        </button>
                        <button
                          onClick={() => { setGenReqType('access_elevation'); setGenReqStep(2); }}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <Key className="w-6 h-6 text-[#2E2A75] mb-1" />
                          <span className="text-[9px] font-black uppercase text-slate-900">Access Elevation</span>
                        </button>
                        <button
                          onClick={() => { setGenReqType('role_change'); setGenReqStep(2); }}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <Users className="w-6 h-6 text-emerald-600 mb-1" />
                          <span className="text-[9px] font-black uppercase text-slate-900">Role Change</span>
                        </button>
                        <button
                          onClick={() => { setGenReqType('permission'); setGenReqStep(2); }}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <ShieldCheck className="w-6 h-6 text-indigo-600 mb-1" />
                          <span className="text-[9px] font-black uppercase text-slate-900">Permissions</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {genReqStep === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); setGenReqStep(3); }} className="space-y-3 text-left">
                      {genReqType === 'budget' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Requested Amount ($)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-[#FF5A20]">$</span>
                              <input
                                type="number" step="0.01" value={budgetAmt} onChange={(e) => setBudgetAmt(e.target.value)}
                                className="w-full bg-slate-50 text-[10px] pl-7 pr-3 py-2 border border-slate-200 rounded-xl font-black outline-none" placeholder="0.00" required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Category</label>
                            <div className="grid grid-cols-4 gap-1">
                              {['marketing', 'development', 'office', 'other'].map(cat => (
                                <button
                                  type="button" key={cat} onClick={() => setBudgetCat(cat)}
                                  className={`py-1.5 text-[8px] font-black rounded-lg uppercase ${
                                    budgetCat === cat ? 'bg-[#FF5A20] text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          {budgetCat === 'other' && (
                            <div>
                              <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Custom Category Name</label>
                              <input
                                type="text" value={budgetCatOther} onChange={(e) => setBudgetCatOther(e.target.value)}
                                className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold" placeholder="Specific category" required
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Justification Reason</label>
                            <textarea
                              rows={4} value={budgetReason} onChange={(e) => setBudgetReason(e.target.value)}
                              className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-800" placeholder="Provide cost details..." required
                            />
                          </div>
                        </div>
                      )}

                      {genReqType === 'access_elevation' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Select Targeted System</label>
                            <div className="space-y-1.5">
                              {['finance', 'student_db', 'admin_panel', 'other'].map(sys => (
                                <label key={sys} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                                  <input 
                                    type="radio" name="access_system" checked={accessSystem === sys} onChange={() => setAccessSystem(sys)}
                                    className="accent-[#FF5A20]"
                                  />
                                  <span className="text-[9px] font-bold text-slate-700 uppercase">{sys.replace('_', ' ')}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {accessSystem === 'other' && (
                            <div>
                              <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Custom System Name</label>
                              <input
                                type="text" value={accessSystemOther} onChange={(e) => setAccessSystemOther(e.target.value)}
                                className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold" placeholder="System key identifier" required
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Duration Constraints</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['temporary', 'permanent'].map(dur => (
                                <button
                                  type="button" key={dur} onClick={() => setAccessDuration(dur)}
                                  className={`py-2 text-[8px] font-black rounded-lg uppercase ${
                                    accessDuration === dur ? 'bg-[#2E2A75] text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {dur}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Administrative Justification</label>
                            <textarea
                              rows={3} value={accessJustification} onChange={(e) => setAccessJustification(e.target.value)}
                              className="w-full bg-slate-50 text-[9.5px] p-2.5 border border-slate-200 rounded-xl resize-none font-semibold text-slate-800" placeholder="Describe reasons..." required
                            />
                          </div>
                        </div>
                      )}

                      {genReqType === 'role_change' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">New Designation Title</label>
                            <input
                              type="text" value={roleDesignation} onChange={(e) => setRoleDesignation(e.target.value)}
                              placeholder="e.g. Senior Curriculum Specialist" className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none" required
                            />
                          </div>

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Effective Date</label>
                            <input
                              type="date" value={roleEffectiveDate} onChange={(e) => setRoleEffectiveDate(e.target.value)}
                              className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none" required
                            />
                          </div>

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Executive Motives / Reason</label>
                            <textarea
                              rows={4} value={roleReason} onChange={(e) => setRoleReason(e.target.value)}
                              className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-800" placeholder="Detail history track justifications..." required
                            />
                          </div>
                        </div>
                      )}

                      {genReqType === 'permission' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Action Specific Authority</label>
                            <div className="space-y-1">
                              {['delete_records', 'export_data', 'modify_financial', 'approve_expenses', 'custom'].map(act => (
                                <label key={act} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                                  <input 
                                    type="radio" name="perm_action" checked={permAction === act} onChange={() => setPermAction(act)}
                                    className="accent-[#FF5A20]"
                                  />
                                  <span className="text-[9px] font-bold text-slate-700 uppercase">{act.replace('_', ' ')}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {permAction === 'custom' && (
                            <div>
                              <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Specify Custom Action</label>
                              <input
                                type="text" value={permActionOther} onChange={(e) => setPermActionOther(e.target.value)}
                                className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold" placeholder="Describe scope" required
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Administrative Urgency Level</label>
                            <div className="grid grid-cols-4 gap-1">
                              {['low', 'medium', 'high', 'urgent'].map(urg => (
                                <button
                                  type="button" key={urg} onClick={() => setPermUrgency(urg)}
                                  className={`py-1.5 text-[8px] font-black rounded-lg uppercase ${
                                    permUrgency === urg ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {urg}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Justification Analysis</label>
                            <textarea
                              rows={4} value={permJustification} onChange={(e) => setPermJustification(e.target.value)}
                              className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-800" placeholder="Detail risk assessments..." required
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setGenReqStep(1)} className="flex-1 bg-slate-100 text-slate-650 text-[9px] font-black py-2.5 rounded-xl uppercase">Back</button>
                        <button type="submit" className="flex-1 bg-[#2E2A75] text-white text-[9px] font-black py-2.5 rounded-xl uppercase">Save details</button>
                      </div>
                    </form>
                  )}

                  {genReqStep === 3 && (
                    <div className="space-y-4 text-left">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Review entries</span>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 font-bold block">Application Type:</span>
                          <span className="font-extrabold text-[#2E2A75] uppercase">{genReqType}</span>
                        </div>
                        {genReqType === 'budget' && (
                          <>
                            <div>
                              <span className="text-slate-400 font-bold block">Budget Limit:</span>
                              <span className="font-extrabold text-[#FF5A20]">${budgetAmt}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block">Reason Justified:</span>
                              <p className="text-slate-600 italic">"{budgetReason}"</p>
                            </div>
                          </>
                        )}
                        {genReqType === 'access_elevation' && (
                          <>
                            <div>
                              <span className="text-slate-400 font-bold block">Target System:</span>
                              <span className="font-extrabold text-slate-800 uppercase">{accessSystem}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block">Access Justification:</span>
                              <p className="text-slate-600 italic">"{accessJustification}"</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setGenReqStep(2)} className="flex-1 bg-slate-100 text-slate-650 text-[9px] font-black py-2.5 rounded-xl uppercase">Modify</button>
                        <button onClick={handleGeneralRequestSubmit} className="flex-1 bg-[#2E2A75] text-white text-[9px] font-black py-2.5 rounded-xl uppercase">Confirm & Transmit</button>
                      </div>
                    </div>
                  )}

                  {genReqStep === 4 && (
                    <div className="space-y-4 text-center py-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-sm">
                        <CheckSquare className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-[#2E2A75] uppercase">Application Filed!</h4>
                      <button onClick={() => setIsGeneralReqModalOpen(false)} className="w-full bg-[#2E2A75] text-white text-[9.5px] py-2.5 rounded-xl uppercase font-black">Return to Hub</button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* LEAVE REQUEST WIZARD SHEET MODAL (SCROLL AND POSITION FIX) */}
            {/* ========================================================= */}
            {isLeaveReqModalOpen && (
              <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">Leave Request Portal</h3>
                      <p className="text-[7.5px] text-slate-400 font-extrabold uppercase">Step {leaveStep} of 3</p>
                    </div>
                    <button onClick={() => setIsLeaveReqModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {leaveStep === 1 && (
                    <div className="space-y-3">
                      <span className="text-[8px] font-black text-slate-400 uppercase block">Select Leave Type</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setLeaveType('medical'); setLeaveStep(2); }}
                          className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <span className="p-1.5 bg-rose-500 rounded-xl text-white mb-2"><Stethoscope className="w-5 h-5" /></span>
                          <span className="text-[9.5px] font-black text-rose-900 uppercase">Medical Leave</span>
                        </button>
                        <button
                          onClick={() => { setLeaveType('casual'); setLeaveStep(2); }}
                          className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <span className="p-1.5 bg-amber-500 rounded-xl text-white mb-2"><Coffee className="w-5 h-5" /></span>
                          <span className="text-[9.5px] font-black text-amber-900 uppercase">Casual Leave</span>
                        </button>
                        <button
                          onClick={() => { setLeaveType('early'); setLeaveStep(2); }}
                          className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <span className="p-1.5 bg-orange-600 rounded-xl text-white mb-2"><LogOut className="w-5 h-5" /></span>
                          <span className="text-[9.5px] font-black text-orange-900 uppercase">Early Leave</span>
                        </button>
                        <button
                          onClick={() => { setLeaveType('emergency'); setLeaveStep(2); }}
                          className="bg-red-50 border border-red-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                        >
                          <span className="p-1.5 bg-red-600 rounded-xl text-white mb-2"><AlertTriangle className="w-5 h-5" /></span>
                          <span className="text-[9.5px] font-black text-red-900 uppercase">Emergency</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {leaveStep === 2 && (
                    <form onSubmit={handleLeaveRequestSubmit} className="space-y-3 text-left">
                      {leaveType === 'early' ? (
                        <div>
                          <label className="text-[7.5px] font-black text-[#2E2A75] uppercase block mb-1">Requested Departure Time</label>
                          <input
                            type="time" value={leaveEarlyTime} onChange={(e) => setLeaveEarlyTime(e.target.value)}
                            className="w-full bg-slate-50 text-[10px] px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold" required
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Start Date</label>
                              <input
                                type="date" value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)}
                                className="w-full bg-slate-50 text-[9.5px] px-2 py-2 border border-slate-200 rounded-xl font-bold" required
                              />
                            </div>
                            <div>
                              <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">End Date</label>
                              <input
                                type="date" value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} min={leaveStartDate}
                                className="w-full bg-slate-50 text-[9.5px] px-2 py-2 border border-slate-200 rounded-xl font-bold" required
                              />
                            </div>
                          </div>

                          {leaveStartDate && (
                            <div className="space-y-1">
                              <span className="text-[6.5px] text-slate-400 font-extrabold uppercase block">Quick Duration</span>
                              <div className="flex gap-1.5">
                                <button type="button" onClick={() => handleApplyQuickDays(1)} className="bg-slate-100 text-slate-700 text-[8px] font-black px-2.5 py-1 rounded">1 Day</button>
                                <button type="button" onClick={() => handleApplyQuickDays(3)} className="bg-slate-100 text-slate-700 text-[8px] font-black px-2.5 py-1 rounded">3 Days</button>
                                <button type="button" onClick={() => handleApplyQuickDays(7)} className="bg-slate-100 text-slate-700 text-[8px] font-black px-2.5 py-1 rounded">1 Week</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">CEO Note & Reason</label>
                        <textarea
                          rows={4} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-800" placeholder="Provide note..." required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button type="button" onClick={() => setLeaveStep(1)} className="flex-1 bg-slate-100 text-slate-650 text-[9px] font-black py-2.5 rounded-xl uppercase">Back</button>
                        <button type="submit" className="flex-1 bg-[#2E2A75] text-white text-[9px] font-black py-2.5 rounded-xl uppercase">Apply Leave</button>
                      </div>
                    </form>
                  )}

                  {leaveStep === 3 && (
                    <div className="space-y-4 text-center py-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto">
                        <CheckSquare className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-[#2E2A75] uppercase">Leave Request Sent!</h4>
                      <button onClick={() => setIsLeaveReqModalOpen(false)} className="w-full bg-[#2E2A75] text-white text-[9.5px] py-2.5 rounded-xl uppercase font-black">Got it</button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* COMMUNITY BOARD POPUP MODAL (NOTIFICATIONS OVERLAY) */}
            {/* ========================================================= */}
            {isCommunityBoardOpen && (
              <div className="absolute inset-0 bg-slate-950/50 z-[100] flex items-center justify-center p-4 backdrop-blur-xs text-slate-800">
                <div className="bg-white w-full rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[80%] overflow-y-auto animate-fadeIn text-slate-800">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-[#FF5A20]" />
                      <span className="text-[10px] font-black text-[#2E2A75] uppercase">Community Board Alerts</span>
                    </div>
                    <button onClick={() => setIsCommunityBoardOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full">
                      <X className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {broadcasts.map(b => (
                      <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 text-[9px] leading-relaxed space-y-1">
                        <div className="flex justify-between items-center text-[7.5px] font-black text-slate-400 uppercase">
                          <span className="text-[#FF5A20]">{b.type} ALERT</span>
                          <span>{b.timestamp}</span>
                        </div>
                        <p className="font-semibold text-slate-800">{b.text}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      triggerToast("Marked all board notifications read!", "info");
                      setIsCommunityBoardOpen(false);
                    }}
                    className="w-full bg-[#2E2A75] text-white font-black text-[9.5px] py-2 rounded-xl uppercase"
                  >
                    Clear & Close
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* PROFILE BOTTOM SHEET CUSTOMIZER (Uploader & Validation) */}
            {/* ========================================================= */}
            {isProfileModalOpen && (
              <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[80%] overflow-y-auto animate-slideUp text-slate-800 text-left">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">Profile Customizer</h3>
                      <p className="text-[8px] text-slate-400 uppercase font-black">Identity Details</p>
                    </div>
                    <button onClick={() => setIsProfileModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 space-y-3 bg-slate-50 rounded-2xl border border-slate-150">
                    <div className="relative w-20 h-20 rounded-full border-2 border-[#2E2A75] flex items-center justify-center overflow-hidden bg-white shadow-md">
                      {getCurrentUserAvatar()}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center space-y-0.5">
                      <h4 className="text-xs font-black text-[#2E2A75] uppercase">
                        {activeRole === 'CEO' ? 'Faris Ibrahim' : activeRole === 'Administrator' ? 'Sarah Al-Mansoori' : currentStaffProfile?.name}
                      </h4>
                      <p className="text-[8px] text-[#FF5A20] font-bold uppercase">{activeRole} · Usthad Console</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[7.5px] font-black text-slate-400 uppercase block tracking-wider">Set Profile Image</label>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#FF5A20] rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 transition"
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                      <span className="text-[9.5px] font-bold text-[#2E2A75]">Upload custom image</span>
                      <span className="text-[7px] font-black text-slate-400 uppercase">Limit under 3 MB</span>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="w-full bg-[#2E2A75] text-white text-[9.5px] font-black uppercase py-2.5 rounded-xl shadow-xs"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* PROVISION PERSONNEL ("ADD STAFF") SECURE ADMIN DIALOG */}
            {/* ========================================================= */}
            {isAddStaffModalOpen && (
              <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                <div className="bg-white/95 backdrop-blur-[24px] w-full rounded-t-[32px] shadow-2xl relative overflow-hidden max-h-[85%] overflow-y-auto animate-slideUp text-slate-800 text-left">
                  
                  {/* Top orange-to-violet accent strip */}
                  <div className="h-[3px] w-full bg-gradient-to-r from-[#F15A24] to-[#2D2A77]"></div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-[#2D2A77]" />
                        <div>
                          <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Provision Personnel</h3>
                          <span className="text-[7px] text-slate-400 font-bold block uppercase tracking-wider">Deploying Credentials to UA Digital Nervous System</span>
                        </div>
                      </div>
                      <button onClick={() => setIsAddStaffModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>

                    <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 text-left">
                      
                      {/* Double Column Form Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Full Name</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text" value={formFullName} onChange={(e) => setFormFullName(e.target.value)}
                              placeholder="Sarah Malik" className="w-full bg-slate-50 text-[10px] pl-8 pr-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#2D2A77]" required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Login ID</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">@</span>
                            <input
                              type="text" value={formLoginId} onChange={(e) => setFormLoginId(e.target.value)}
                              placeholder="sarah.admin" className="w-full bg-slate-50 text-[10px] pl-7 pr-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#2D2A77]" required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Designation</label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text" value={formDesignation} onChange={(e) => setFormDesignation(e.target.value)}
                              placeholder="Operations Lead" className="w-full bg-slate-50 text-[10px] pl-8 pr-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#2D2A77]" required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="email" value={formGmail} onChange={(e) => setFormGmail(e.target.value)}
                              placeholder="sarah@usthad.com" className="w-full bg-slate-50 text-[10px] pl-8 pr-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#2D2A77]" required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Department Selector Grid (4 boxes) */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Department</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: 'Administration', icon: ShieldCheck },
                            { name: 'Accounts', icon: Wallet },
                            { name: 'Sales', icon: TrendingUp },
                            { name: 'Marketing', icon: Megaphone }
                          ].map(d => {
                            const DeptIcon = d.icon;
                            const isActive = formDept === d.name;
                            return (
                              <button
                                type="button" key={d.name} onClick={() => setFormDept(d.name)}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                  isActive ? 'border-[#2D2A77] bg-violet-50/20' : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <DeptIcon className={`w-4 h-4 ${isActive ? 'text-[#2D2A77]' : 'text-slate-400'}`} />
                                  <span className="text-[10px] font-bold uppercase">{d.name}</span>
                                </div>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#2D2A77]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Privilege Role Upgrades (Staff vs Manager) */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Privilege Tier</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Staff', 'Manager'].map(r => {
                            const isActive = formRole === r;
                            return (
                              <button
                                type="button" key={r} onClick={() => setFormRole(r)}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                  isActive ? 'border-[#F15A24] bg-orange-50/10' : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase">{r} Level</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#F15A24]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Security Access Key Input with Toggle */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Initial Security Access Key</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type={showFormPassword ? 'text' : 'password'} value={formPassword} onChange={(e) => setFormPassword(e.target.value)}
                            placeholder="Set entry security key" className="w-full bg-slate-50 text-[10px] pl-8 pr-10 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#2D2A77]" required
                          />
                          <button
                            type="button" onClick={() => setShowFormPassword(!showFormPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          >
                            {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Actions and submit with dynamic states */}
                      <div className="flex gap-2 pt-3">
                        <button 
                          type="button" onClick={() => setIsAddStaffModalOpen(false)} 
                          className="flex-1 bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl uppercase text-[10px]"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" disabled={isDeployingStaff}
                          className="flex-1 bg-gradient-to-r from-[#F15A24] to-[#2D2A77] text-white font-black py-2.5 rounded-xl uppercase text-[10px] flex items-center justify-center gap-1 shadow-md"
                        >
                          {isDeployingStaff ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Deploying...</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Initialize Access</span>
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>

                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* DEPLOY MISSION ("ASSIGN TASK") HIGH-FIDELITY MOBILE DIALOG */}
            {/* ========================================================= */}
            {isAssignTaskModalOpen && (
              <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800 text-left">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F15A24]/10 to-[#2F1E73]/10 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 text-[#F15A24]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#1a1a2e] uppercase tracking-tight">Deploy Mission</h3>
                        <p className="text-[7.5px] text-slate-400 font-black uppercase tracking-widest">UA STRATEGIC DEPLOYMENT MODULE</p>
                      </div>
                    </div>
                    <button onClick={() => setIsAssignTaskModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <form onSubmit={handleDeployTaskSubmit} className="space-y-4 text-left">
                    
                    {/* Task Title field with highlight configs */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Task Title</label>
                      <input
                        type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Critical System Audit"
                        className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none focus:ring-2 focus:ring-[#F15A24]/30 text-slate-900" required
                      />
                    </div>

                    {/* Objective textarea */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Objective</label>
                      <textarea
                        rows={3} value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)}
                        placeholder="Define purpose and expected outcome..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium outline-none resize-none focus:ring-2 focus:ring-[#F15A24]/30 text-slate-900" required
                      />
                    </div>

                    {/* TWO-STATE Assign Staff Selector */}
                    <div className="space-y-1 relative">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Assign Staff</label>
                      
                      {!newTaskAssignee ? (
                        /* STATE 1: UNSELECTED SEARCH MODE */
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text" value={staffSearchQuery} onChange={(e) => setStaffSearchQuery(e.target.value)}
                            placeholder="Type to search and select staff..."
                            className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none text-slate-900"
                          />
                          
                          {/* Filtered dropdown based on search state */}
                          {staffSearchQuery.trim() !== '' && (
                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-lg max-h-40 overflow-y-auto z-55 divide-y divide-slate-100">
                              {staff.filter(s => s.name.toLowerCase().includes(staffSearchQuery.toLowerCase())).map(sObj => (
                                <button
                                  type="button" key={sObj.id}
                                  onClick={() => {
                                    setNewTaskAssignee(sObj.id);
                                    setStaffSearchQuery('');
                                  }}
                                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{sObj.avatar}</span>
                                    <div>
                                      <p className="text-[10px] font-black text-slate-900 leading-none">{sObj.name}</p>
                                      <p className="text-[7.5px] text-slate-400 font-bold mt-1 uppercase">{sObj.dept} · {sObj.role}</p>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-slate-400" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* STATE 2: SELECTED STATIC CAPSULE */
                        <div className="flex items-center justify-between p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 text-[#2E2A75] rounded-full flex items-center justify-center text-[10px] font-black font-mono">
                              {staff.find(s => s.id === newTaskAssignee)?.name.split(' ').map(n => n[0]).join('')}
                            </span>
                            <div>
                              <p className="text-[10px] font-black text-[#2E2A75]">
                                {staff.find(s => s.id === newTaskAssignee)?.name}
                              </p>
                              <p className="text-[7px] text-slate-450 uppercase font-bold">
                                {staff.find(s => s.id === newTaskAssignee)?.dept} Division
                              </p>
                            </div>
                          </div>
                          <button
                            type="button" onClick={() => setNewTaskAssignee('')}
                            className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full"
                          >
                            <X className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Deadline date/time pickers */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Deadline Date</label>
                        <input
                          type="date" value={newTaskDeadlineDate} onChange={(e) => setNewTaskDeadlineDate(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none text-slate-900" required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Deadline Time</label>
                        <input
                          type="time" value={newTaskDeadlineTime} onChange={(e) => setNewTaskDeadlineTime(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none text-slate-900" required
                        />
                      </div>
                    </div>

                    {/* Touch chips layout for Task Priority */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Priority Selection</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { name: 'Low', color: 'border-emerald-500 text-emerald-600', active: 'bg-emerald-500 text-white border-emerald-500' },
                          { name: 'Medium', color: 'border-amber-500 text-amber-600', active: 'bg-amber-500 text-white border-amber-500' },
                          { name: 'High', color: 'border-orange-500 text-orange-600', active: 'bg-orange-500 text-white border-orange-500' },
                          { name: 'Urgent', color: 'border-red-500 text-red-600', active: 'bg-red-500 text-white border-red-500' }
                        ].map(pOpt => {
                          const isActive = newTaskPriority === pOpt.name;
                          return (
                            <button
                              type="button" key={pOpt.name} onClick={() => setNewTaskPriority(pOpt.name)}
                              className={`py-2 text-[9px] font-black uppercase rounded-lg border transition ${
                                isActive ? pOpt.active : `bg-transparent ${pOpt.color} border-slate-200`
                              }`}
                            >
                              {pOpt.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* IOS style switch Repeat Daily Option */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-[10px] font-black text-slate-800 uppercase block">Repeat Daily</span>
                        <p className="text-[7.5px] text-slate-400 font-bold leading-normal">Assign this mission task to the selected staff member every single day automatically.</p>
                      </div>
                      <button
                        type="button" onClick={() => setIsTaskDaily(!isTaskDaily)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-all duration-200 flex ${
                          isTaskDaily ? 'bg-[#F97316] justify-end' : 'bg-slate-200 justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white shadow-sm"></span>
                      </button>
                    </div>

                    {/* Dialogue trigger buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button 
                        type="button" onClick={() => setIsAssignTaskModalOpen(false)}
                        className="flex-1 text-slate-400 font-bold py-2.5 text-[10px] uppercase bg-slate-50 hover:bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit" disabled={!newTaskTitle.trim() || !newTaskAssignee}
                        className={`flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5 transition text-[10px] font-black uppercase tracking-wider ${
                          (newTaskTitle.trim() && newTaskAssignee) 
                            ? 'bg-gradient-to-r from-[#2F1E73] to-[#F15A24] text-white shadow-md hover:opacity-95' 
                            : 'bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <Target className="w-4 h-4 text-white" />
                        <span>Deploy Mission</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* NATIVE 5-BUTTON ANDROID SYSTEM NAVIGATION BAR */}
            {/* ========================================================= */}
            <nav className="bg-white border-t border-slate-100 py-2 px-3 flex justify-around items-center shrink-0 relative z-40 shadow-sm">
              
              {/* FOR CEO */}
              {activeRole === 'CEO' && (
                <>
                  <button
                    onClick={() => setCeoTab('home')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      ceoTab === 'home' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>HQ</span>
                  </button>

                  <button
                    onClick={() => setCeoTab('tasks')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      ceoTab === 'tasks' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Tasks</span>
                  </button>

                  {/* Centered deployment overlay trigger */}
                  <button
                    onClick={() => {
                      setNewTaskTitle('');
                      setNewTaskDesc('');
                      setNewTaskAssignee('');
                      setStaffSearchQuery('');
                      setIsAssignTaskModalOpen(true);
                    }}
                    className="w-10 h-10 bg-[#FF5A20] text-white rounded-full flex items-center justify-center shadow-md relative -top-3 z-55 border-4 border-white transition-all shrink-0 animate-pulse"
                  >
                    <Plus className="w-5 h-5 font-black text-white" />
                  </button>

                  <button
                    onClick={() => setCeoTab('approvals')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      ceoTab === 'approvals' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Inbox</span>
                  </button>

                  <button
                    onClick={() => { setIsLoggedIn(false); triggerToast('Securely signed out', 'info'); }}
                    className="flex flex-col items-center gap-0.5 text-[7px] font-black uppercase text-red-550 flex-1"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Exit</span>
                  </button>
                </>
              )}

              {/* FOR ADMINISTRATOR */}
              {activeRole === 'Administrator' && (
                <>
                  <button
                    onClick={() => setAdminTab('home')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      adminTab === 'home' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>HQ</span>
                  </button>

                  <button
                    onClick={() => setAdminTab('tasks')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      adminTab === 'tasks' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Tasks</span>
                  </button>

                  <button
                    onClick={() => {
                      setNewTaskTitle('');
                      setNewTaskDesc('');
                      setNewTaskAssignee('');
                      setStaffSearchQuery('');
                      setIsAssignTaskModalOpen(true);
                    }}
                    className="w-10 h-10 bg-[#FF5A20] text-white rounded-full flex items-center justify-center shadow-md relative -top-3 z-55 border-4 border-white transition-all shrink-0"
                  >
                    <Plus className="w-5 h-5 font-black text-white" />
                  </button>

                  <button
                    onClick={() => setAdminTab('staff')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      adminTab === 'staff' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Staff</span>
                  </button>

                  {currentStaffProfile?.role === 'Manager' && ['Sales', 'Marketing'].includes(currentStaffProfile?.dept) ? (
                    <button
                      onClick={() => setAdminTab('sales')}
                      className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                        adminTab === 'sales' ? 'text-[#2E2A75]' : 'text-slate-400'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Sales</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { setIsLoggedIn(false); triggerToast('Securely signed out', 'info'); }}
                      className="flex flex-col items-center gap-0.5 text-[7px] font-black uppercase text-red-550 flex-1 hover:text-red-700 transition-all"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Exit</span>
                    </button>
                  )}
                </>
              )}

              {/* FOR STAFF */}
              {activeRole === 'Staff' && (
                <>
                  <button
                    onClick={() => setStaffTab('home')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      staffTab === 'home' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Home</span>
                  </button>

                  <button
                    onClick={() => setStaffTab('tasks')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      staffTab === 'tasks' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Tasks</span>
                  </button>

                  <button
                    onClick={() => setStaffTab('portal')}
                    className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                      staffTab === 'portal' ? 'text-[#2E2A75]' : 'text-slate-400'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Portal</span>
                  </button>

                  {/* Specialized Dept Button (Sales/Marketing/Finance only) */}
                  {(currentStaffProfile.dept === 'Sales' || currentStaffProfile.dept === 'Marketing') && (
                    <button
                      onClick={() => setStaffTab('specialized')}
                      className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                        staffTab === 'specialized' ? 'text-[#2E2A75]' : 'text-slate-400'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Daily Update</span>
                    </button>
                  )}

                  {currentStaffProfile.dept === 'Finance' && (
                    <button
                      onClick={() => setStaffTab('specialized')}
                      className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                        staffTab === 'specialized' ? 'text-[#2E2A75]' : 'text-slate-400'
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Finance</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setIsLoggedIn(false); triggerToast('Securely signed out', 'info'); }}
                    className="flex flex-col items-center gap-0.5 text-[7px] font-black uppercase text-red-550 flex-1"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Exit</span>
                  </button>
                </>
              )}

            </nav>
          </>
        )}

        {/* Android bottom gesture bar pill */}
        <div className="bg-white pb-3 pt-1 shrink-0 flex items-center justify-center">
          <div className="w-32 h-1 bg-slate-900 rounded-full opacity-90"></div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FF5A20;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 50%;
          background: #FF5A20;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        /* Custom scrollbar configurations */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}} />

    </div>
  );
}