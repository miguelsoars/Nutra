import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Camera, 
  ScanLine, 
  Home, 
  BookOpen, 
  UserCircle, 
  TrendingUp, 
  Sparkles, 
  Target, 
  ChevronLeft, 
  Trash2, 
  Edit3, 
  Zap, 
  RotateCcw, 
  LogOut, 
  ShieldCheck, 
  EyeOff, 
  Eye,
  Loader2,
  Heart,
  Wand2,
  CheckCircle2,
  Bell,
  Scan,
  Utensils,
  Focus,
  Check,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  analyzeFoodImage, 
  analyzeMealImpact, 
  generateNutraInsights, 
  getDietStrategy,
  getMealSuggestions,
  estimateBodyType,
  FoodAnalysis 
} from './services/geminiService';
import { User, UserProfile, DiaryEntry, WeightRecord } from './types';

// --- UTILS ---
const getAge = (birthDateStr: string) => {
  if (!birthDateStr) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// --- COMPONENTS ---

function CircularProgress({ percent, size = 80, strokeWidth = 6, color = "text-black", label, value }: { percent: number, size?: number, strokeWidth?: number, color?: string, label: string, value: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-[#F2F2F7]"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-bold tracking-tight">{Math.round(percent)}%</span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-[#8E8E93] capitalize mt-3 tracking-widest">{label}</span>
      <span className="text-[15px] font-bold text-[#1C1C1E] mt-0.5">{value}</span>
    </div>
  );
}

function AppIcon({ size = "md", iconColor = "text-white", outline = false }: { size?: "sm" | "md" | "lg", iconColor?: string, outline?: boolean }) {
  const containerClass = size === "sm" ? "w-9 h-9 rounded-[8px]" : size === "md" ? "w-16 h-16 rounded-[12px]" : "w-24 h-24 rounded-[16px]";
  const heartSize = size === "sm" ? 18 : size === "md" ? 34 : 52;
  const focusSize = size === "sm" ? 26 : size === "md" ? 54 : 76;
  
  return (
    <div className={`${containerClass} bg-black flex items-center justify-center shadow-sm relative overflow-hidden`}>
      <Focus size={focusSize} className="absolute text-white/10" />
      <Heart size={heartSize} className={`${iconColor} ${outline ? '' : 'fill-current'} relative z-10`} />
    </div>
  );
}

function OptionsStep({ title, options, field, currentValue, onSelect }: { title: string, options: string[], field: string, currentValue: any, onSelect: (field: string, val: string) => void, key?: string }) {
  return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6 w-full"
      >
        <h2 className="text-[34px] font-[800] tracking-tighter text-[#1C1C1E] leading-tight text-center">{title}</h2>
        <div className="grid grid-cols-1 gap-3">
          {options.map((opt: string) => (
            <button 
              key={opt} 
              onClick={() => onSelect(field, opt)} 
              className={`w-full py-5 px-7 rounded-[12px] text-[17px] font-bold transition-all duration-300 text-left flex items-center justify-between shadow-sm ${currentValue === opt ? 'bg-black text-white shadow-lg' : 'bg-white text-[#1C1C1E] active:bg-[#F2F2F7]'}`}
            >
              {opt}
              {currentValue === opt && <CheckCircle2 size={24} />}
            </button>
          ))}
        </div>
      </motion.div>
  );
}

function WeightChart({ history }: { history: WeightRecord[] }) {
  if (!history || history.length === 0) return <div className="text-[14px] text-[#8E8E93] mt-2 font-bold">Nenhum registro.</div>;
  const chartData = history.slice(-7);
  if (chartData.length < 2) return <div className="text-[14px] text-[#8E8E93] mt-2 font-bold">Histórico insuficiente para gráfico.</div>;
  
  const minW = Math.min(...chartData.map(d => d.weight)) - 0.5;
  const maxW = Math.max(...chartData.map(d => d.weight)) + 0.5;
  const range = maxW - minW || 1;
  const points = chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100},${85 - (((d.weight - minW) / range) * 70)}`);
  const pathData = `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ');
  
  return (
    <div className="mt-6">
      <div className="relative w-full h-32">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity="0.04"/>
              <stop offset="100%" stopColor="#000" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={`${pathData} L 100,100 L 0,100 Z`} fill="url(#chartGradient)" />
          <path d={pathData} fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="2" fill="#fff" stroke="#000" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-[#8E8E93] mt-4 font-bold capitalize tracking-widest opacity-60">
        <span>{chartData[0].date}</span>
        <span>{chartData[chartData.length - 1].date}</span>
      </div>
    </div>
  );
}

export default function App() {
  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<FoodAnalysis | null>(null);
  const [originalResults, setOriginalResults] = useState<FoodAnalysis | null>(null);
  const [foodDescription, setFoodDescription] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState<string | null>(null);
  const [isAnalyzingImpact, setIsAnalyzingImpact] = useState(false);
  const [nutraInsights, setNutraInsights] = useState<any[] | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState('');
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [isFetchingStrategy, setIsFetchingStrategy] = useState(false);
  const [mealSuggestions, setMealSuggestions] = useState<string | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isFinishingOnboarding, setIsFinishingOnboarding] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('pt-BR'));

  const [profileForm, setProfileForm] = useState<any>({
    name: '', birthDate: '', height: '', weight: '', gender: 'M', 
    goal: 'manter', activity: 'sedentario', abdomen: '', loveHandles: '', upperBody: '', lowerBody: '', faceNeck: ''
  });

  // Memoized Calculations
  const todayStr = useMemo(() => new Date().toLocaleDateString('pt-BR'), []);
  const todaysEntries = useMemo(() => diaryEntries.filter(e => e.date === todayStr), [diaryEntries, todayStr]);
  const selectedEntries = useMemo(() => diaryEntries.filter(e => e.date === selectedDate), [diaryEntries, selectedDate]);
  
  const dailyTotals = useMemo(() => selectedEntries.reduce((acc, curr) => ({
    calories: acc.calories + (curr.totals?.calories || 0),
    protein: acc.protein + (curr.totals?.protein || 0),
    carbs: acc.carbs + (curr.totals?.carbs || 0),
    fat: acc.fat + (curr.totals?.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [selectedEntries]);
  
  const targets = useMemo(() => profile?.targets || { calories: 2000, protein: 150, carbs: 200, fat: 65 }, [profile]);
  const getProgress = (curr: number, max: number) => Math.min((curr / (max || 1)) * 100, 100);

  // Handlers
  const loadUserData = (userId: string) => {
    const savedProfile = localStorage.getItem(`profile_v20_${userId}`);
    if (savedProfile) {
      const data = JSON.parse(savedProfile);
      setProfile(data);
      setProfileForm(prev => ({...prev, ...data.inputs}));
      setShowOnboarding(false);
      setActiveTab('home');
    } else {
      setShowOnboarding(true);
    }
    const savedDiary = localStorage.getItem(`diary_v20_${userId}`);
    if (savedDiary) setDiaryEntries(JSON.parse(savedDiary));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanUsername = authUsername.trim().toLowerCase().replace(/\s/g, '');
    if (!cleanUsername) return setAuthError('Informe um nome de usuário.');
    if (authPassword.length < 6) return setAuthError('Senha deve ter 6+ caracteres.');

    const userDbKey = `nutrascan_user_db_v20_${cleanUsername}`;
    const savedUserStr = localStorage.getItem(userDbKey);

    if (isLoginMode) {
      if (!savedUserStr) return setAuthError('Usuário não encontrado.');
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser.password !== authPassword) return setAuthError('Senha incorreta.');
      
      const sessionUser = { username: cleanUsername, id: cleanUsername };
      localStorage.setItem('nutrascan_session_v20', JSON.stringify(sessionUser));
      setUser(sessionUser);
      loadUserData(cleanUsername);
    } else {
      if (savedUserStr) return setAuthError('Este nome de usuário já está sendo usado.');
      const newUser = { id: cleanUsername, username: cleanUsername, password: authPassword };
      localStorage.setItem(userDbKey, JSON.stringify(newUser));
      localStorage.setItem('nutrascan_session_v20', JSON.stringify({ username: newUser.username, id: newUser.id }));
      setUser(newUser);
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nutrascan_session_v20');
    setUser(null); setProfile(null); setDiaryEntries([]); setAuthUsername(''); setAuthPassword('');
    setShowOnboarding(false); setActiveTab('home');
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setIsFinishingOnboarding(true);
    try {
      const isMale = profileForm.gender === 'M';
      const sMap: any = { "Bem definido": -4, "Leve contorno": -1, "Normal": 1, "Pequena camada de gordura": 4, "Gordura bastante evidente": 7 };
      let score = (sMap[profileForm.abdomen] || 0) + (sMap[profileForm.upperBody] || 0) + (sMap[profileForm.lowerBody] || 0);
      let bf = Math.max(5, Math.min((isMale ? 14 : 22) + score, 45));
      let weightVal = parseFloat(profileForm.weight) || 70;
      let heightVal = parseFloat(profileForm.height) || 170;
      let ageVal = getAge(profileForm.birthDate);
      
      // AI Biotype Analysis
      const biotypeData = await estimateBodyType(ageVal, heightVal, weightVal, bf, profileForm.gender);

      // Simple TDEE calculation
      let tdee = Math.round((370 + (21.6 * (weightVal * (1 - (bf/100))))) * 1.35);
      let targetCals = profileForm.goal === 'emagrecer' ? tdee - 500 : profileForm.goal === 'hipertrofia' ? tdee + 400 : tdee;
      
      const newT = { 
        calories: targetCals, 
        protein: Math.round(weightVal * 2.2), 
        fat: Math.round(weightVal * 0.9), 
        carbs: Math.round((targetCals - (weightVal*2.2*4) - (weightVal*0.9*9))/4) 
      };
      
      const newP: UserProfile = { 
        name: profileForm.name,
        birthDate: profileForm.birthDate,
        height: profileForm.height,
        weight: profileForm.weight,
        gender: profileForm.gender,
        goal: profileForm.goal,
        activity: profileForm.activity,
        estimatedBF: bf, 
        tdee,
        bodyType: biotypeData.bodyType,
        bodyTypeInfluence: biotypeData.influence,
        targets: newT, 
        weightHistory: [{ weight: weightVal, date: new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}), timestamp: Date.now() }] 
      };
      
      const profileToSave = { ...newP, inputs: profileForm };
      
      setProfile(newP);
      localStorage.setItem(`profile_v20_${user.id}`, JSON.stringify(profileToSave));
      setShowOnboarding(false); 
      setActiveTab('home');
    } catch (err) {
      console.error("Erro ao finalizar onboarding:", err);
      setError("Erro ao processar sua avaliação. Tente novamente.");
    } finally {
      setIsFinishingOnboarding(false);
    }
  };

  const handleAddNewWeight = () => {
    if (!newWeightInput || !user || !profile) return;
    const nw = parseFloat(newWeightInput);
    const history = [...(profile.weightHistory || []), { weight: nw, date: new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}), timestamp: Date.now() }];
    const updated = { ...profile, weight: nw.toString(), weightHistory: history };
    setProfile(updated);
    localStorage.setItem(`profile_v20_${user.id}`, JSON.stringify({ ...updated, inputs: { ...profileForm, weight: nw.toString() } }));
    setShowWeightModal(false); setNewWeightInput('');
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      const compressed = await compressImage(result);
      setImagePreview(compressed);
      setResults(null);
      setImpactAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true); 
    setError(null);
    setResults(null); // Clear previous results
    try {
      const parsed = await analyzeFoodImage(base64, foodDescription);
      if (parsed && parsed.items && parsed.totals) {
        setResults(parsed); 
        setOriginalResults(parsed);
      } else {
        throw new Error("Dados nutricionais incompletos");
      }
    } catch (e) { 
      console.error("Erro na análise de imagem:", e);
      setError("Não foi possível analisar a imagem. Tente novamente ou descreva o prato."); 
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const handleWeightChangeLocal = (index: number, val: string) => {
    const nw = parseFloat(val); if (isNaN(nw) || !originalResults || !results) return;
    const item = originalResults.items[index];
    const ratio = nw / (item.weight || 1);
    const newItems = [...results.items];
    newItems[index] = { 
      ...item, 
      weight: nw, 
      calories: Math.round(item.calories * ratio), 
      protein: Number((item.protein * ratio).toFixed(1)), 
      carbs: Number((item.carbs * ratio).toFixed(1)), 
      fat: Number((item.fat * ratio).toFixed(1)) 
    };
    const nt = newItems.reduce((acc, curr) => ({ 
      calories: acc.calories + curr.calories, 
      protein: acc.protein + curr.protein, 
      carbs: acc.carbs + curr.carbs, 
      fat: acc.fat + curr.fat 
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    setResults({ items: newItems, totals: nt });
  };

  const addToDiary = () => {
    if (!user || !results) return;
    const newE: DiaryEntry = { 
      id: Date.now(), 
      time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), 
      date: new Date().toLocaleDateString('pt-BR'), 
      totals: results.totals, 
      items: results.items, 
      timestamp: Date.now() 
    };
    const updated = [newE, ...diaryEntries];
    setDiaryEntries(updated); 
    localStorage.setItem(`diary_v20_${user.id}`, JSON.stringify(updated));
    setImagePreview(null); setResults(null); setFoodDescription(''); setActiveTab('diary');
  };

  const handleAnalyzeImpact = async () => {
    if (!results) return;
    setIsAnalyzingImpact(true);
    try {
      const text = await analyzeMealImpact(results.totals, profileForm.goal);
      setImpactAnalysis(text);
    } catch (err) { setImpactAnalysis("Erro."); } finally { setIsAnalyzingImpact(false); }
  };

  const handleGenerateNutraInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const insights = await generateNutraInsights(diaryEntries);
      setNutraInsights(insights);
    } catch (e) {} finally { setIsGeneratingInsights(false); }
  };

  const removeEntry = (id: number) => {
    if (!user) return;
    const updated = diaryEntries.filter(e => e.id !== id);
    setDiaryEntries(updated); localStorage.setItem(`diary_v20_${user.id}`, JSON.stringify(updated));
  };

  const saveEditedEntry = () => {
    if (!user || !editingEntry) return;
    const updated = diaryEntries.map(e => e.id === editingEntry.id ? editingEntry : e);
    setDiaryEntries(updated); localStorage.setItem(`diary_v20_${user.id}`, JSON.stringify(updated));
    setEditingEntry(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const avatarData = event.target?.result as string;
      setProfileForm((prev: any) => ({ ...prev, avatar: avatarData }));
      if (profile) {
        const upProfile = { ...profile, avatar: avatarData };
        setProfile(upProfile);
        localStorage.setItem(`profile_v20_${user.id}`, JSON.stringify({ ...upProfile, inputs: { ...profileForm, avatar: avatarData } }));
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchDietStrategy = async (currentProfile: UserProfile) => {
    if (!user) return;
    
    // Check if 30 days have passed
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (currentProfile.lastStrategyUpdate && (now - currentProfile.lastStrategyUpdate < thirtyDaysInMs)) {
      const daysLeft = Math.ceil((thirtyDaysInMs - (now - currentProfile.lastStrategyUpdate)) / (24 * 60 * 60 * 1000));
      setError(`Estratégia disponível em ${daysLeft} dias.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsFetchingStrategy(true);
    try {
      // Get last 30 days of diary entries
      const thirtyDaysAgo = now - thirtyDaysInMs;
      const recentDiary = diaryEntries.filter(e => e.timestamp >= thirtyDaysAgo);
      
      const strategy = await getDietStrategy(currentProfile, recentDiary);
      const updatedProfile = { 
        ...currentProfile, 
        dietStrategy: strategy, 
        bodyType: strategy.bodyType, 
        bodyTypeInfluence: strategy.bodyTypeInfluence,
        lastStrategyUpdate: now 
      };
      setProfile(updatedProfile);
      localStorage.setItem(`profile_v20_${user.id}`, JSON.stringify({ ...updatedProfile, inputs: profileForm }));
    } catch (err) {
      console.error("Erro ao buscar estratégia:", err);
      setError("Erro ao gerar estratégia.");
    } finally {
      setIsFetchingStrategy(false);
    }
  };

  const applyRecommendedTargets = () => {
    if (!profile?.dietStrategy?.recommendedTargets) return;
    updateTargets(profile.dietStrategy.recommendedTargets);
    setError("Metas atualizadas com sucesso!");
    setTimeout(() => setError(null), 3000);
  };

  const fetchMealSuggestions = async () => {
    if (!profile) return;
    setIsFetchingSuggestions(true);
    try {
      const remaining = {
        calories: Math.max(0, targets.calories - dailyTotals.calories),
        protein: Math.max(0, targets.protein - dailyTotals.protein),
        carbs: Math.max(0, targets.carbs - dailyTotals.carbs),
        fat: Math.max(0, targets.fat - dailyTotals.fat)
      };
      const suggestions = await getMealSuggestions(remaining, profile.goal);
      setMealSuggestions(suggestions);
    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const updateProfileField = (field: string, value: any) => {
    if (!user || !profile) return;
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    localStorage.setItem(`profile_v20_${user.id}`, JSON.stringify({ ...updatedProfile, inputs: { ...profileForm, [field]: value } }));
    
    // If goal changed, maybe re-fetch strategy
    if (field === 'goal') {
      fetchDietStrategy(updatedProfile);
    }
  };

  const updateTargets = (newTargets: any) => {
    if (!user || !profile) return;
    const updatedProfile = { ...profile, targets: newTargets };
    setProfile(updatedProfile);
    localStorage.setItem(`profile_v20_${user.id}`, JSON.stringify({ ...updatedProfile, inputs: profileForm }));
  };

  useEffect(() => {
    const session = localStorage.getItem('nutrascan_session_v20');
    if (session) {
      const parsed = JSON.parse(session);
      setUser(parsed);
      loadUserData(parsed.id);
    }
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  // --- UI RENDER ---

  if (isLoadingAuth) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="text-black animate-spin" size={48} /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#F2F2F7]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-sm ios-card p-10"
        >
          <div className="flex flex-col items-center mb-10">
            <AppIcon size="md" />
            <h1 className="text-[32px] font-bold mt-6 tracking-tight leading-none text-[#1C1C1E]">NutraScan</h1>
            <p className="text-[#8E8E93] text-[17px] mt-3 font-semibold">{isLoginMode ? 'Bem-vindo de volta' : 'Crie sua conta inteligente'}</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="flex items-center bg-[#F2F2F7] rounded-[20px] px-6 py-5 focus-within:bg-white focus-within:ring-4 focus-within:ring-black/5 transition-all">
              <span className="text-[#8E8E93] font-bold mr-2 text-[18px]">@</span>
              <input 
                type="text" 
                required 
                placeholder="usuário" 
                value={authUsername} 
                onChange={e => setAuthUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                className="w-full bg-transparent outline-none text-[18px] font-semibold text-[#1C1C1E]" 
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="Senha" 
                value={authPassword} 
                onChange={e => setAuthPassword(e.target.value)} 
                className="w-full bg-[#F2F2F7] rounded-[20px] py-5 px-6 outline-none text-[18px] font-semibold text-[#1C1C1E] focus:bg-white focus:ring-4 focus:ring-black/5 transition-all" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] p-2 active:scale-90 transition-transform">
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {authError && <div className="text-[#FF3B30] text-[14px] font-bold ml-2 text-left">{authError}</div>}
            <button type="submit" className="ios-button-primary w-full py-5 text-[18px]">
              {isLoginMode ? 'Entrar' : 'Registrar'}
            </button>
          </form>
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="w-full text-[#1C1C1E] text-[16px] font-bold mt-8 hover:opacity-70 transition-opacity">
            {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Entrar'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    const qOpts = ["Bem definido", "Leve contorno", "Normal", "Pequena camada de gordura", "Gordura bastante evidente"];
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-12">
            <div className="flex gap-2.5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= onboardingStep ? 'w-8 bg-black' : 'w-2 bg-[#C7C7CC]'}`}></div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {onboardingStep === 0 ? (
              <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center flex flex-col items-center">
                <AppIcon size="lg" />
                <h2 className="text-[36px] font-[800] mt-10 mb-4 tracking-tighter text-[#1C1C1E] leading-tight">Olá, vamos começar sua jornada</h2>
                <p className="text-[#8E8E93] text-[18px] mb-12 leading-relaxed max-w-[300px] font-medium">Precisamos de algumas informações para personalizar sua experiência.</p>
                <button onClick={() => setOnboardingStep(1)} className="ios-button-primary w-full py-5 text-[18px]">Começar avaliação</button>
              </motion.div>
            ) : onboardingStep === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <h2 className="text-[34px] font-[800] tracking-tighter text-[#1C1C1E] leading-tight">Sobre você</h2>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#8E8E93] ml-2 capitalize tracking-widest">Nome completo</label>
                    <input 
                      type="text" 
                      placeholder="Como quer ser chamado?" 
                      value={profileForm.name} 
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                      className="w-full bg-white rounded-[16px] p-5 outline-none shadow-sm text-[17px] font-semibold text-[#1C1C1E] border border-transparent focus:border-[#E5E5EA] transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8E8E93] ml-2 capitalize tracking-widest">Nascimento</label>
                      <input 
                        type="date" 
                        value={profileForm.birthDate} 
                        onChange={e => setProfileForm({...profileForm, birthDate: e.target.value})} 
                        className="w-full bg-white rounded-[16px] p-5 outline-none shadow-sm text-[17px] font-semibold text-[#1C1C1E] border border-transparent focus:border-[#E5E5EA] transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8E8E93] ml-2 capitalize tracking-widest">Gênero</label>
                      <select 
                        value={profileForm.gender} 
                        onChange={e => setProfileForm({...profileForm, gender: e.target.value})} 
                        className="bg-white rounded-[16px] p-5 outline-none shadow-sm text-[17px] font-semibold text-[#1C1C1E] border border-transparent focus:border-[#E5E5EA] transition-all h-[64px]"
                      >
                        <option value="M">Homem</option>
                        <option value="F">Mulher</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8E8E93] ml-2 capitalize tracking-widest">Altura (cm)</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 175" 
                        value={profileForm.height} 
                        onChange={e => setProfileForm({...profileForm, height: e.target.value})} 
                        className="bg-white rounded-[16px] p-5 outline-none shadow-sm text-[17px] font-semibold text-[#1C1C1E] border border-transparent focus:border-[#E5E5EA] transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8E8E93] ml-2 capitalize tracking-widest">Peso (kg)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="Ex: 70.5" 
                        value={profileForm.weight} 
                        onChange={e => setProfileForm({...profileForm, weight: e.target.value})} 
                        className="bg-white rounded-[16px] p-5 outline-none shadow-sm text-[17px] font-semibold text-[#1C1C1E] border border-transparent focus:border-[#E5E5EA] transition-all" 
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setOnboardingStep(2)} 
                  disabled={!profileForm.name || !profileForm.birthDate || !profileForm.height || !profileForm.weight} 
                  className="ios-button-primary w-full py-5 text-[18px] mt-4 disabled:opacity-30"
                >
                  Continuar
                </button>
              </motion.div>
            ) : onboardingStep === 9 ? (
              <motion.div key="step9" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center flex flex-col items-center w-full">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-10 text-black shadow-xl">
                  {isFinishingOnboarding ? <Loader2 className="animate-spin" size={48} /> : <CheckCircle2 size={48} />}
                </div>
                <h2 className="text-[36px] font-[800] mb-4 tracking-tighter text-[#1C1C1E] leading-tight text-center">Tudo pronto!</h2>
                <p className="text-[#8E8E93] text-[18px] mb-12 leading-relaxed max-w-[300px] font-medium text-center">
                  {isFinishingOnboarding ? 'Nossa IA está analisando seu biotipo e gerando seu plano personalizado...' : 'Analisamos seus dados e geramos um plano personalizado para seus objetivos.'}
                </p>
                <button 
                  onClick={finishOnboarding} 
                  disabled={isFinishingOnboarding}
                  className="ios-button-primary w-full py-5 text-[18px] flex items-center justify-center gap-3"
                >
                  {isFinishingOnboarding ? <Loader2 className="animate-spin" size={24} /> : 'Ver meu plano'}
                </button>
              </motion.div>
            ) : (
              <OptionsStep 
                key={`step${onboardingStep}`}
                title={onboardingStep === 2 ? "Qual seu objetivo?" : onboardingStep === 3 ? "Nível de atividade" : onboardingStep === 4 ? "Como está seu abdômen?" : onboardingStep === 5 ? "Cintura / Pneuzinhos" : onboardingStep === 6 ? "Braços e peitoral" : onboardingStep === 7 ? "Pernas" : "Rosto e pescoço"}
                options={onboardingStep === 2 ? ["Emagrecer", "Manter", "Hipertrofia"] : onboardingStep === 3 ? ["Sedentário", "Leve", "Moderado", "Intenso"] : qOpts}
                field={onboardingStep === 2 ? "goal" : onboardingStep === 3 ? "activity" : onboardingStep === 4 ? "abdomen" : onboardingStep === 5 ? "loveHandles" : onboardingStep === 6 ? "upperBody" : onboardingStep === 7 ? "lowerBody" : "faceNeck"}
                currentValue={profileForm[onboardingStep === 2 ? "goal" : onboardingStep === 3 ? "activity" : onboardingStep === 4 ? "abdomen" : onboardingStep === 5 ? "loveHandles" : onboardingStep === 6 ? "upperBody" : onboardingStep === 7 ? "lowerBody" : "faceNeck"]}
                onSelect={(f,v) => { 
                  setProfileForm((prev: any) => ({...prev, [f]: v})); 
                  setTimeout(() => setOnboardingStep(onboardingStep+1), 300); 
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] selection:bg-black/10 pb-32 text-[#1C1C1E] font-medium">
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#E5E5EA] sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppIcon size="sm" />
            <h1 className="text-[20px] font-bold tracking-tight leading-none">NutraScan</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F2F2F7] text-[#1C1C1E] px-3 py-1.5 rounded-full text-[11px] font-bold capitalize tracking-widest">
            <ShieldCheck size={14} /> Local
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 rounded-full text-[14px] font-bold shadow-2xl ios-blur"
          >
            {error}
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {showInstallBanner && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black text-white p-4 rounded-[20px] flex items-center justify-between shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Download size={20} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold">Instalar NutraScan</p>
                      <p className="text-[11px] opacity-60">Acesse mais rápido da sua tela inicial</p>
                    </div>
                  </div>
                  <button onClick={handleInstallApp} className="bg-white text-black px-4 py-2 rounded-full text-[12px] font-bold active:scale-95 transition-all">
                    Instalar
                  </button>
                </motion.div>
              )}
              <div className="flex justify-between items-end px-1">
                <div>
                  <h1 className="text-[34px] font-[800] tracking-tighter text-[#1C1C1E] leading-tight">Olá, {profileForm.name?.split(' ')[0] || 'Bem-vindo'}!</h1>
                  <p className="text-[#8E8E93] text-[17px] font-semibold mt-0.5">Seu progresso de hoje</p>
                </div>
              </div>
              
              <div className="ios-card p-6">
                <div className="flex justify-between mb-6 items-center">
                  <div>
                    <span className="block text-[11px] text-[#8E8E93] font-bold capitalize tracking-widest mb-1.5">Calorias consumidas</span>
                    <div className="flex items-baseline leading-none">
                      <span className="text-[42px] font-[800] text-[#1C1C1E] tracking-tighter">{Math.round(dailyTotals.calories)}</span>
                      <span className="text-[17px] text-[#8E8E93] font-bold ml-1.5 tracking-tight">/ {targets.calories} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-[#F2F2F7] rounded-full h-[5px] mb-8 overflow-hidden">
                  <div className="h-full bg-black transition-all duration-1000 ease-out" style={{ width: `${getProgress(dailyTotals.calories, targets.calories)}%` }}></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <CircularProgress 
                    percent={getProgress(dailyTotals.protein, targets.protein)} 
                    color="text-[#FF3B30]" 
                    label="Prot" 
                    value={`${Math.round(dailyTotals.protein)}g`} 
                  />
                  <CircularProgress 
                    percent={getProgress(dailyTotals.carbs, targets.carbs)} 
                    color="text-[#FF9500]" 
                    label="Carb" 
                    value={`${Math.round(dailyTotals.carbs)}g`} 
                  />
                  <CircularProgress 
                    percent={getProgress(dailyTotals.fat, targets.fat)} 
                    color="text-[#5856D6]" 
                    label="Gord" 
                    value={`${Math.round(dailyTotals.fat)}g`} 
                  />
                </div>
              </div>

              {profile.dietStrategy && profile.dietStrategy.recommendedFoods && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[12px] font-bold text-[#8E8E93] capitalize tracking-widest">Sugestões NutraIA</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {profile.dietStrategy.recommendedFoods.slice(0, 3).map((food, idx) => {
                      const parts = food.split('(');
                      const name = parts[0].trim();
                      const explanation = parts[1] ? parts[1].replace(')', '').trim() : '';
                      
                      return (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white px-5 py-4 rounded-[12px] flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all border border-transparent hover:border-[#E5E5EA]"
                        >
                          <span className="text-[16px] text-[#1C1C1E] leading-tight tracking-tight">
                            <span className="font-bold">{name}</span>
                            {explanation && <span className="font-normal">: {explanation}</span>}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div 
                className="bg-black rounded-[14px] p-6 text-white relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer shadow-lg" 
                onClick={() => setActiveTab('nutra_ia')}
              >
                <div className="relative z-10 flex flex-col items-start">
                  <h2 className="text-[18px] font-bold flex items-center gap-2">
                    <Sparkles className="text-white/60" size={20} /> NutraIA
                  </h2>
                  <p className="text-[15px] opacity-80 mt-1 mb-4 leading-relaxed max-w-[280px] font-medium">Análise inteligente dos seus padrões alimentares.</p>
                  <button className="bg-white text-black font-bold px-6 py-2 rounded-full text-[13px] shadow-lg">Ver relatório</button>
                </div>
                <Wand2 size={100} className="absolute -bottom-6 -right-6 opacity-10" />
              </div>
            </motion.div>
          )}

          {activeTab === 'scanner' && (
            <motion.div key="scanner" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
              {!imagePreview ? (
                <div className="ios-card p-10 text-center flex flex-col items-center justify-center min-h-[440px]">
                  <div className="w-20 h-20 bg-[#F2F2F7] rounded-[16px] flex items-center justify-center mb-6 text-black">
                    <Scan size={36} />
                  </div>
                  <h2 className="text-[34px] font-[800] mb-2 text-[#1C1C1E] tracking-tighter leading-tight">NutraScan</h2>
                  <p className="text-[#8E8E93] text-[17px] mb-10 leading-relaxed max-w-[260px] font-medium">Capture sua refeição para uma análise nutricional instantânea.</p>
                  <div className="w-full max-w-[240px]">
                    <button onClick={() => cameraInputRef.current?.click()} className="ios-button-primary w-full py-4 flex items-center justify-center gap-3 text-[16px]">
                      <Camera size={22} /> Usar Câmera
                    </button>
                    <input type="file" capture="environment" accept="image/*" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-10">
                  <div className="relative rounded-[12px] overflow-hidden bg-black aspect-square shadow-xl border border-white">
                    <img src={imagePreview} className={`w-full h-full object-cover ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`} alt="Preview" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 backdrop-blur-[4px]">
                        <Loader2 className="animate-spin mb-3 text-white" size={40} />
                        <span className="font-bold text-[15px] mt-2 tracking-tight">Analisando</span>
                      </div>
                    )}
                  </div>
                  
                  {!results && !isAnalyzing && (
                    <div className="ios-card p-6">
                      <textarea 
                        placeholder="Descreva seu prato. Exemplo: Uma omelete de frango com arroz e feijão (Opcional)" 
                        value={foodDescription} 
                        onChange={e => setFoodDescription(e.target.value)} 
                        className="w-full bg-[#F2F2F7] px-5 py-4 rounded-[12px] outline-none text-[17px] mb-6 border border-transparent focus:bg-white focus:border-[#E5E5EA] transition-all min-h-[120px] resize-none font-medium" 
                      />
                      <div className="flex gap-3">
                        <button onClick={() => setImagePreview(null)} className="ios-button-secondary flex-1 py-4 text-[16px]">Cancelar</button>
                        <button onClick={() => analyzeImage(imagePreview)} className="ios-button-primary flex-[2] py-4 text-[16px]">Analisar</button>
                      </div>
                    </div>
                  )}

                  {results && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="ios-card p-6">
                        <h3 className="font-bold text-[11px] mb-6 text-[#8E8E93] text-center capitalize tracking-widest">Análise da sua refeição</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-[#FF9500]/5 p-4 rounded-[16px] border border-[#FF9500]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#FF9500]/10 rounded-full flex items-center justify-center">
                                <Sparkles size={20} className="text-[#FF9500]" />
                              </div>
                              <span className="text-[14px] font-bold text-[#8E8E93] capitalize">Calorias</span>
                            </div>
                            <span className="font-[800] text-[#FF9500] text-[24px] tracking-tighter">{results.totals.calories} <span className="text-[14px] font-bold opacity-60">kcal</span></span>
                          </div>

                          <div className="flex items-center justify-between bg-[#FF3B30]/5 p-4 rounded-[16px] border border-[#FF3B30]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#FF3B30]/10 rounded-full flex items-center justify-center">
                                <Sparkles size={20} className="text-[#FF3B30]" />
                              </div>
                              <span className="text-[14px] font-bold text-[#8E8E93] capitalize">Proteínas</span>
                            </div>
                            <span className="font-[800] text-[#FF3B30] text-[24px] tracking-tighter">{results.totals.protein} <span className="text-[14px] font-bold opacity-60">g</span></span>
                          </div>

                          <div className="flex items-center justify-between bg-[#FFCC00]/5 p-4 rounded-[16px] border border-[#FFCC00]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#FFCC00]/10 rounded-full flex items-center justify-center">
                                <Sparkles size={20} className="text-[#FFCC00]" />
                              </div>
                              <span className="text-[14px] font-bold text-[#8E8E93] capitalize">Carboidratos</span>
                            </div>
                            <span className="font-[800] text-[#FFCC00] text-[24px] tracking-tighter">{results.totals.carbs} <span className="text-[14px] font-bold opacity-60">g</span></span>
                          </div>

                          <div className="flex items-center justify-between bg-[#5856D6]/5 p-4 rounded-[16px] border border-[#5856D6]/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#5856D6]/10 rounded-full flex items-center justify-center">
                                <Sparkles size={20} className="text-[#5856D6]" />
                              </div>
                              <span className="text-[14px] font-bold text-[#8E8E93] capitalize">Gorduras</span>
                            </div>
                            <span className="font-[800] text-[#5856D6] text-[24px] tracking-tighter">{results.totals.fat} <span className="text-[14px] font-bold opacity-60">g</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold px-2 text-[#8E8E93] text-[11px] capitalize tracking-widest">Itens identificados</h3>
                        {results.items?.map((it, i) => (
                          <div key={i} className="ios-card p-5 flex justify-between items-center">
                            <span className="font-bold text-[#1C1C1E] text-[17px] leading-tight tracking-tight">{it.name}</span>
                            <div className="flex items-center gap-2 bg-[#F2F2F7] px-4 py-2 rounded-full border border-transparent focus-within:border-[#E5E5EA] transition-all">
                              <input 
                                type="number" 
                                value={it.weight} 
                                onChange={e => handleWeightChangeLocal(i, e.target.value)} 
                                className="w-12 bg-transparent text-right font-bold text-[16px] outline-none text-[#1C1C1E]" 
                              />
                              <span className="text-[#8E8E93] font-bold text-[11px] capitalize">g</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="ios-card p-6 bg-white border-2 border-black/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-full -mr-16 -mt-16"></div>
                        <h3 className="font-[800] text-[#1C1C1E] mb-4 flex items-center gap-3 text-[18px] tracking-tight relative z-10">
                          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <Sparkles size={18} className="text-white" />
                          </div> 
                          Análise NutraIA
                        </h3>
                        
                        {!impactAnalysis && !isAnalyzingImpact && (
                          <button onClick={handleAnalyzeImpact} className="w-full bg-black text-white font-bold py-4 rounded-[16px] text-[15px] shadow-lg active:scale-95 transition-all relative z-10">
                            Gerar análise inteligente
                          </button>
                        )}
                        
                        {isAnalyzingImpact && (
                          <div className="text-[#8E8E93] text-center py-6 text-[15px] font-bold flex flex-col items-center justify-center gap-3 relative z-10">
                            <Loader2 className="animate-spin text-black" size={32} />
                            <span>Processando dados nutricionais...</span>
                          </div>
                        )}
                        
                        {impactAnalysis && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative z-10"
                          >
                            <div className="bg-[#F2F2F7] p-5 rounded-[16px] border border-black/5">
                              <p className="text-[16px] leading-relaxed text-[#1C1C1E] font-semibold whitespace-pre-line">
                                {impactAnalysis.replace(/^"|"$/g, '')}
                              </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-[#8E8E93] capitalize tracking-widest">
                              <ShieldCheck size={14} /> Sugestão baseada no seu objetivo
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setResults(null); setImagePreview(null); }} className="ios-button-secondary flex-1 py-4 text-[16px]">Descartar</button>
                        <button onClick={addToDiary} className="ios-button-primary flex-[2] py-4 text-[16px]">Salvar no diário</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'nutra_ia' && (
            <motion.div key="nutra_ia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="ios-card p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F2F2F7] rounded-[12px] flex items-center justify-center mb-5 text-black">
                  <Sparkles size={32} className="fill-current" />
                </div>
                <h2 className="text-[34px] font-[800] mb-2 tracking-tighter text-[#1C1C1E] leading-tight">NutraIA</h2>
                <p className="text-[#8E8E93] text-[16px] mb-8 leading-relaxed max-w-[280px] font-semibold">Nossa Inteligência Artificial busca padrões em suas refeições para otimizar seus resultados.</p>
                {!nutraInsights && !isGeneratingInsights && (
                  <button onClick={handleGenerateNutraInsights} className="ios-button-primary w-full max-w-[220px] py-4 text-[16px]">
                    Gerar relatório
                  </button>
                )}
                {isGeneratingInsights && <div className="py-4 text-black"><Loader2 className="animate-spin mx-auto" size={32} /></div>}
              </div>
              
              {nutraInsights && (
                <div className="space-y-3">
                  <h3 className="font-bold text-[#8E8E93] text-[12px] capitalize tracking-widest px-1">Relatório gerado</h3>
                  {nutraInsights.map((ins, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.1 }}
                      className={`ios-card p-5 ${ins.type === 'success' ? 'bg-[#8E8E93]/5' : ins.type === 'warning' ? 'bg-[#FF9500]/5' : 'bg-white'}`}
                    >
                      <h4 className="font-bold text-[18px] flex items-center gap-2.5 mb-2 leading-tight tracking-tighter">
                        {ins.type === 'success' ? <ShieldCheck size={22} className="text-[#8E8E93]" /> : <Target size={22} className="text-[#FF9500]" />} {ins.title}
                      </h4>
                      <p className="text-[16px] leading-relaxed text-[#48484A] font-semibold">{ins.description.replace(/^"|"$/g, '')}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div key="diary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="px-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[34px] font-[800] tracking-tighter text-[#1C1C1E]">Diário</h2>
                  <div className="bg-white p-2.5 rounded-full shadow-sm">
                    <CalendarIcon size={22} className="text-[#1C1C1E]" />
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide no-scrollbar">
                  {(() => {
                    const dates = [];
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    
                    for (let i = 0; i <= 6; i++) {
                      const d = new Date(today);
                      d.setDate(d.getDate() + i);
                      dates.push(d);
                    }
                    
                    return dates.map((d, i) => {
                      const dStr = d.toLocaleDateString('pt-BR');
                      const isSelected = dStr === selectedDate;
                      const isToday = dStr === todayStr;
                      const isFuture = d > today;
                      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                      const dayNum = d.getDate();
                      
                      return (
                        <button 
                          key={i} 
                          onClick={() => !isFuture && setSelectedDate(dStr)}
                          disabled={isFuture}
                          className={`flex flex-col items-center min-w-[56px] py-3.5 rounded-[12px] transition-all duration-300 ${isSelected ? 'bg-black text-white' : isFuture ? 'bg-white text-[#C7C7CC] cursor-not-allowed opacity-40' : 'bg-white text-[#8E8E93] active:bg-[#F2F2F7]'}`}
                        >
                          <span className={`text-[9px] font-bold capitalize tracking-widest mb-1.5 ${isSelected ? 'text-white/50' : isFuture ? 'text-[#C7C7CC]' : 'text-[#8E8E93]'}`}>{dayName}</span>
                          <span className="text-[18px] font-[800] leading-none tracking-tighter">{dayNum}</span>
                          {isToday && !isSelected && <div className="w-1 h-1 bg-black rounded-full mt-1.5"></div>}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="ios-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[18px] font-[800] text-[#1C1C1E] tracking-tighter">
                    {selectedDate === todayStr ? 'Meta de hoje' : `Meta em ${selectedDate}`}
                  </h2>
                  <div className="text-right">
                    <span className="block text-[10px] text-[#8E8E93] font-bold capitalize tracking-widest mb-1">Consumido</span>
                    <span className="text-[24px] font-[800] text-[#1C1C1E] tracking-tighter leading-none">{Math.round(dailyTotals.calories)} <span className="text-[15px] text-[#8E8E93] font-semibold tracking-normal">/ {targets.calories} kcal</span></span>
                  </div>
                </div>

                <div className="w-full bg-[#F2F2F7] rounded-full h-[5px] overflow-hidden mb-8 relative">
                  <div className="bg-black h-full transition-all duration-1000 ease-out" style={{ width: `${getProgress(dailyTotals.calories, targets.calories)}%` }}></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <CircularProgress 
                    percent={getProgress(dailyTotals.protein, targets.protein)} 
                    color="text-[#FF3B30]" 
                    label="Prot" 
                    value={`${Math.round(dailyTotals.protein)}g`} 
                  />
                  <CircularProgress 
                    percent={getProgress(dailyTotals.carbs, targets.carbs)} 
                    color="text-[#FF9500]" 
                    label="Carb" 
                    value={`${Math.round(dailyTotals.carbs)}g`} 
                  />
                  <CircularProgress 
                    percent={getProgress(dailyTotals.fat, targets.fat)} 
                    color="text-[#5856D6]" 
                    label="Gord" 
                    value={`${Math.round(dailyTotals.fat)}g`} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[20px] font-[800] tracking-tighter text-[#1C1C1E]">Refeições</h3>
                  <span className="text-[12px] font-bold text-[#8E8E93] bg-white px-3 py-1 rounded-full shadow-sm">{selectedEntries.length} itens</span>
                </div>
                
                {selectedEntries.length === 0 ? (
                  <div className="ios-card p-12 text-center">
                    <div className="w-16 h-16 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C7C7CC]">
                      <Utensils size={28} />
                    </div>
                    <p className="text-[#8E8E93] text-[17px] font-semibold">Nenhuma refeição registrada.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEntries.map((e) => (
                      <motion.div 
                        layout
                        key={e.id} 
                        className="ios-card p-4 flex items-center gap-4 group active:scale-[0.98] transition-all"
                      >
                        <div className="w-16 h-16 rounded-[12px] overflow-hidden bg-[#F2F2F7] shrink-0 shadow-inner">
                          {e.image ? (
                            <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#C7C7CC]">
                              <Utensils size={28} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-[800] text-[18px] text-[#1C1C1E] truncate mb-0.5 tracking-tighter">{e.name || e.items.map(i=>i.name).join(', ')}</h4>
                          <div className="flex gap-3 text-[12px] font-bold text-[#8E8E93] capitalize tracking-widest">
                            <span>{Math.round(e.totals.calories)} kcal</span>
                            <span className="text-[#E5E5EA]">•</span>
                            <span>{Math.round(e.totals.protein)}g P</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingEntry(e)} className="p-2.5 bg-[#F2F2F7] rounded-full text-[#1C1C1E] active:bg-[#E5E5EA] transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => removeEntry(e.id)} className="p-2.5 bg-[#FF3B30]/10 rounded-full text-[#FF3B30] active:bg-[#FF3B30]/20 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && profile && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="ios-card p-8 text-center relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 left-0 w-full h-24 bg-black opacity-[0.02]"></div>
                <div className="relative group cursor-pointer inline-block mt-4" onClick={() => avatarInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full bg-white border-[4px] border-white shadow-xl overflow-hidden flex items-center justify-center transition-transform active:scale-95">
                    {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" alt="Avatar" /> : <UserCircle size={56} className="text-[#F2F2F7]" />}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full border-2 border-white shadow-lg transition-transform active:scale-90 flex items-center justify-center">
                    <Camera size={14} />
                  </button>
                  <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatarChange} />
                </div>
                <h2 className="text-[28px] font-[800] mt-5 tracking-tighter leading-none text-[#1C1C1E]">{profile.name || 'Seu perfil'}</h2>
                <p className="text-[#8E8E93] text-[17px] mt-2 font-semibold">{getAge(profile.birthDate)} anos • {profile.gender === 'M' ? 'Masculino' : 'Feminino'}</p>
              </div>

              <div className="ios-card p-6">
                <h3 className="text-[20px] font-[800] flex items-center gap-3 mb-6 text-[#1C1C1E] tracking-tighter">
                  <Target className="text-black" size={22} /> Avaliação Corporal
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#F2F2F7] p-5 rounded-[12px] flex flex-col items-center justify-center">
                    <span className="block text-[11px] text-[#8E8E93] font-bold capitalize tracking-widest mb-1.5 leading-none">Gordura (Bf)</span>
                    <span className="text-[28px] font-[800] text-[#1C1C1E] leading-none tracking-tighter">{profile.estimatedBF || '--'}%</span>
                  </div>
                  <div className="bg-[#F2F2F7] p-5 rounded-[12px] flex flex-col items-center justify-center">
                    <span className="block text-[11px] text-[#8E8E93] font-bold capitalize tracking-widest mb-1.5 leading-none">Gasto (Tmb)</span>
                    <span className="text-[28px] font-[800] text-[#1C1C1E] leading-none tracking-tighter">{profile.tdee || '--'}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[12px] font-bold text-[#8E8E93] capitalize tracking-widest">Seu biotipo</span>
                    <span className="text-[16px] font-[800] text-[#1C1C1E] tracking-tight">{profile.bodyType || '--'}</span>
                  </div>
                  {profile.bodyTypeInfluence && (
                    <div className="bg-[#F2F2F7] p-4 rounded-[12px] border border-black/5">
                      <p className="text-[13px] text-[#1C1C1E] font-semibold leading-relaxed">
                        {profile.bodyTypeInfluence.replace(/^"|"$/g, '')}
                      </p>
                    </div>
                  )}
                  <div className="w-full bg-[#F2F2F7] h-[1px]"></div>
                </div>
                <button onClick={() => { setOnboardingStep(0); setShowOnboarding(true); }} className="ios-button-secondary w-full py-4 flex items-center justify-center gap-3 text-[16px]">
                  <RotateCcw size={18} /> Refazer avaliação
                </button>
              </div>

              <div className="bg-white rounded-[12px] p-5 border border-[#F2F2F7] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[17px] font-[800] text-[#1C1C1E] tracking-tighter">Objetivo principal</h3>
                  <button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-black text-[12px] font-bold">
                    {isEditingGoal ? 'Salvar' : 'Alterar'}
                  </button>
                </div>
                {isEditingGoal ? (
                  <div className="grid grid-cols-3 gap-2">
                    {['emagrecer', 'manter', 'hipertrofia'].map(g => (
                      <button 
                        key={g} 
                        onClick={() => updateProfileField('goal', g)}
                        className={`py-2 rounded-[8px] text-[11px] font-bold capitalize border transition-all ${profile.goal === g ? 'bg-black text-white border-black' : 'bg-white border-[#F2F2F7] text-[#8E8E93]'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F2F2F7] px-4 py-3 rounded-[8px]">
                    <span className="text-[16px] font-medium text-[#1C1C1E] capitalize tracking-tight">{profile.goal}</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[12px] p-5 border border-[#F2F2F7] shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[17px] font-[800] text-[#1C1C1E] tracking-tighter">Meta diária</h3>
                  <button onClick={() => setIsEditingTargets(!isEditingTargets)} className="text-black text-[12px] font-bold">
                    {isEditingTargets ? 'Salvar' : 'Alterar'}
                  </button>
                </div>
                {isEditingTargets ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-[#F2F2F7] p-2.5 rounded-[8px]">
                        <label className="text-[9px] text-[#8E8E93] font-bold capitalize block mb-1">Calorias</label>
                        <input 
                          type="number" 
                          value={profile.targets.calories} 
                          onChange={e => updateTargets({...profile.targets, calories: Number(e.target.value)})}
                          className="w-full bg-transparent font-[800] text-[16px] outline-none text-[#1C1C1E] tracking-tighter"
                        />
                      </div>
                      <div className="bg-[#F2F2F7] p-2.5 rounded-[8px]">
                        <label className="text-[9px] text-[#8E8E93] font-bold capitalize block mb-1">Proteína (g)</label>
                        <input 
                          type="number" 
                          value={profile.targets.protein} 
                          onChange={e => updateTargets({...profile.targets, protein: Number(e.target.value)})}
                          className="w-full bg-transparent font-[800] text-[16px] outline-none text-[#1C1C1E] tracking-tighter"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <span className="block text-[9px] text-[#8E8E93] font-bold capitalize mb-0.5 tracking-widest">Kcal</span>
                      <span className="text-[15px] font-[800] text-[#1C1C1E] tracking-tighter">{profile.targets.calories}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[9px] text-[#8E8E93] font-bold capitalize mb-0.5 tracking-widest">Prot</span>
                      <span className="text-[15px] font-[800] text-[#1C1C1E] tracking-tighter">{profile.targets.protein}g</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[9px] text-[#8E8E93] font-bold capitalize mb-0.5 tracking-widest">Carb</span>
                      <span className="text-[15px] font-[800] text-[#1C1C1E] tracking-tighter">{profile.targets.carbs}g</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[9px] text-[#8E8E93] font-bold capitalize mb-0.5 tracking-widest">Gord</span>
                      <span className="text-[15px] font-[800] text-[#1C1C1E] tracking-tighter">{profile.targets.fat}g</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="ios-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[18px] font-[800] text-[#1C1C1E] flex items-center gap-2.5 tracking-tighter">
                    <Sparkles className="text-black" size={22} /> Estratégia NutraIA
                  </h3>
                  {(!profile.dietStrategy || (profile.lastStrategyUpdate && Date.now() - profile.lastStrategyUpdate >= 7 * 24 * 60 * 60 * 1000)) && !isFetchingStrategy && (
                    <button onClick={() => fetchDietStrategy(profile)} className="ios-button-secondary px-4 py-1.5 text-[13px]">
                      Analisar
                    </button>
                  )}
                </div>
                
                {isFetchingStrategy ? (
                  <div className="flex items-center gap-2.5 text-[#8E8E93] text-[15px] py-4 font-semibold">
                    <Loader2 size={18} className="animate-spin" /> Definindo estratégia...
                  </div>
                ) : profile.dietStrategy ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="bg-black text-white px-5 py-1.5 rounded-full text-[14px] font-[800] shadow-md">
                        {profile.dietStrategy.strategy}
                      </div>
                      {profile.lastStrategyUpdate && (
                        <span className="text-[10px] text-[#8E8E93] font-bold capitalize tracking-widest">
                          Próxima em {Math.max(0, 30 - Math.floor((Date.now() - profile.lastStrategyUpdate) / (24 * 60 * 60 * 1000)))} dias
                        </span>
                      )}
                    </div>
                    <div className="bg-[#F2F2F7] p-5 rounded-[12px]">
                      <p className="text-[16px] text-[#1C1C1E] leading-relaxed font-normal tracking-tight">{profile.dietStrategy.explanation.replace(/^"|"$/g, '')}</p>
                    </div>
                    
                    {profile.dietStrategy.recommendedTargets && (
                      <div className="bg-black text-white p-6 rounded-[12px] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Target size={60} />
                        </div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-bold text-white/50 capitalize tracking-widest">Metas recomendadas</span>
                            <button onClick={applyRecommendedTargets} className="bg-white text-black text-[12px] font-bold px-5 py-1.5 rounded-full shadow-md active:scale-95 transition-all">
                              Aplicar
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-center">
                            <div>
                              <span className="block text-[9px] text-white/40 font-bold capitalize mb-1.5 tracking-widest">Kcal</span>
                              <span className="text-[20px] font-[800] tracking-tighter">{profile.dietStrategy.recommendedTargets.calories}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-white/40 font-bold capitalize mb-1.5 tracking-widest">Prot</span>
                              <span className="text-[20px] font-[800] tracking-tighter">{profile.dietStrategy.recommendedTargets.protein}g</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-white/40 font-bold capitalize mb-1.5 tracking-widest">Carb</span>
                              <span className="text-[20px] font-[800] tracking-tighter">{profile.dietStrategy.recommendedTargets.carbs}g</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-white/40 font-bold capitalize mb-1.5 tracking-widest">Gord</span>
                              <span className="text-[20px] font-[800] tracking-tighter">{profile.dietStrategy.recommendedTargets.fat}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[12px] font-bold text-[#8E8E93] capitalize tracking-widest">Sugestões de alimentos</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {profile.dietStrategy.recommendedFoods.map((food, idx) => {
                          const parts = food.split('(');
                          const name = parts[0].trim();
                          const explanation = parts[1] ? parts[1].replace(')', '').trim() : '';

                          return (
                            <motion.div 
                              key={idx} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white px-4 py-3.5 rounded-[10px] flex items-center gap-3.5 shadow-sm active:scale-[0.98] transition-all border border-transparent hover:border-[#E5E5EA]"
                            >
                              <span className="text-[15px] text-[#1C1C1E] leading-tight tracking-tight">
                                <span className="font-bold">{name}</span>
                                {explanation && <span className="font-normal">: {explanation}</span>}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[16px] text-[#8E8E93] leading-relaxed font-semibold">Clique em analisar para que a NutraIA defina sua estratégia ideal (Bulking/Cutting) com base nos seus últimos 7 dias.</p>
                )}
              </div>

              <button onClick={handleLogout} className="w-full bg-white text-[#FF3B30] font-[800] py-4 rounded-[14px] border border-[#FF3B30]/10 flex items-center justify-center gap-2.5 shadow-sm active:scale-95 transition-all text-[16px]">
                <LogOut size={20} /> Sair da conta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 ios-blur z-50 flex items-center justify-center p-6"
          >
                <div className="ios-card p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-[18px] font-[800] mb-1 tracking-tighter text-[#1C1C1E] leading-none text-center">Registrar peso</h3>
                  <p className="text-[#8E8E93] text-[13px] mb-6 font-semibold mt-1.5 text-center">As metas de macros se ajustarão automaticamente.</p>
                  <div className="bg-[#F2F2F7] rounded-[12px] p-5 mb-6 flex items-center border border-transparent">
                    <input 
                      type="number" 
                      step="0.1" 
                      autoFocus 
                      value={newWeightInput} 
                      onChange={e => setNewWeightInput(e.target.value)} 
                      className="w-full bg-transparent text-[28px] font-[800] text-center outline-none tracking-tighter text-[#1C1C1E]" 
                    />
                    <span className="text-[16px] font-[800] text-[#8E8E93] ml-2">kg</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowWeightModal(false)} className="flex-1 bg-[#F2F2F7] py-3.5 rounded-[10px] font-[800] text-[#8E8E93] text-[14px]">Cancelar</button>
                    <button onClick={handleAddNewWeight} className="flex-1 bg-black text-white py-3.5 rounded-[10px] font-[800] shadow-lg active:scale-95 transition-all text-[14px]">Salvar</button>
                  </div>
                </div>
          </motion.div>
        )}

        {editingEntry && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 ios-blur z-50 flex items-center justify-center p-5"
          >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[22px] p-8 w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-[20px] font-bold mb-6 text-center text-[#1C1C1E] tracking-tighter leading-tight">Editar refeição</h3>
                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F2F2F7] p-3 rounded-[12px] border border-transparent">
                      <label className="text-[11px] text-[#8E8E93] font-bold capitalize block mb-1 leading-none">Calorias</label>
                      <input 
                        type="number" 
                        value={editingEntry.totals.calories} 
                        onChange={e => setEditingEntry({...editingEntry, totals: {...editingEntry.totals, calories: Number(e.target.value)}})} 
                        className="w-full bg-transparent font-bold text-[18px] outline-none text-[#1C1C1E]" 
                      />
                    </div>
                    <div className="bg-[#F2F2F7] p-3 rounded-[12px] border border-transparent">
                      <label className="text-[11px] text-[#8E8E93] font-bold capitalize block mb-1 leading-none">Proteína</label>
                      <input 
                        type="number" 
                        value={editingEntry.totals.protein} 
                        onChange={e => setEditingEntry({...editingEntry, totals: {...editingEntry.totals, protein: Number(e.target.value)}})} 
                        className="w-full bg-transparent font-bold text-[18px] outline-none text-[#1C1C1E]" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F2F2F7] p-3 rounded-[12px] border border-transparent">
                      <label className="text-[11px] text-[#8E8E93] font-bold capitalize block mb-1 leading-none">Carboidratos</label>
                      <input 
                        type="number" 
                        value={editingEntry.totals.carbs} 
                        onChange={e => setEditingEntry({...editingEntry, totals: {...editingEntry.totals, carbs: Number(e.target.value)}})} 
                        className="w-full bg-transparent font-bold text-[18px] outline-none text-[#1C1C1E]" 
                      />
                    </div>
                    <div className="bg-[#F2F2F7] p-3 rounded-[12px] border border-transparent">
                      <label className="text-[11px] text-[#8E8E93] font-bold capitalize block mb-1 leading-none">Gorduras</label>
                      <input 
                        type="number" 
                        value={editingEntry.totals.fat} 
                        onChange={e => setEditingEntry({...editingEntry, totals: {...editingEntry.totals, fat: Number(e.target.value)}})} 
                        className="w-full bg-transparent font-bold text-[18px] outline-none text-[#1C1C1E]" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditingEntry(null)} className="flex-1 bg-[#F2F2F7] py-4 rounded-[14px] font-bold text-[#8E8E93] text-[15px]">Voltar</button>
                  <button onClick={saveEditedEntry} className="flex-1 bg-black text-white py-4 rounded-[14px] font-bold active:scale-95 transition-all text-[15px]">Salvar</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 ios-blur bg-white/80 border-t border-[#F2F2F7] pb-safe z-50 pt-3 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-xl mx-auto flex justify-between px-6 pb-4">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center p-2 w-full transition-all duration-300 ${activeTab === 'home' ? 'text-black scale-110' : 'text-[#8E8E93]'}`}>
            <Home className={`${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} mb-1.5`} size={24} />
            <span className="text-[10px] font-bold tracking-widest capitalize">Início</span>
          </button>
          <button onClick={() => setActiveTab('scanner')} className={`flex flex-col items-center p-2 w-full transition-all duration-300 ${activeTab === 'scanner' ? 'text-black scale-110' : 'text-[#8E8E93]'}`}>
            <Scan className={`${activeTab === 'scanner' ? 'stroke-[2.5]' : 'stroke-2'} mb-1.5`} size={24} />
            <span className="text-[10px] font-bold tracking-widest capitalize">Scanner</span>
          </button>
          <button onClick={() => setActiveTab('nutra_ia')} className={`flex flex-col items-center p-2 w-full transition-all duration-300 ${activeTab === 'nutra_ia' ? 'text-black scale-110' : 'text-[#8E8E93]'}`}>
            <Sparkles className={`${activeTab === 'nutra_ia' ? 'stroke-[2.5]' : 'stroke-2'} mb-1.5`} size={24} />
            <span className="text-[10px] font-bold tracking-widest capitalize">NutraIA</span>
          </button>
          <button onClick={() => setActiveTab('diary')} className={`flex flex-col items-center p-2 w-full transition-all duration-300 ${activeTab === 'diary' ? 'text-black scale-110' : 'text-[#8E8E93]'}`}>
            <BookOpen className={`${activeTab === 'diary' ? 'stroke-[2.5]' : 'stroke-2'} mb-1.5`} size={24} />
            <span className="text-[10px] font-bold tracking-widest capitalize">Diário</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center p-2 w-full transition-all duration-300 ${activeTab === 'profile' ? 'text-black scale-110' : 'text-[#8E8E93]'}`}>
            <UserCircle className={`${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} mb-1.5`} size={24} />
            <span className="text-[10px] font-bold tracking-widest capitalize">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
