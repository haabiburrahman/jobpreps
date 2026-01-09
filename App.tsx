import React, { useState, useEffect } from 'react';
import { Category, Question, AppView, UserProfile } from './types';
import { CATEGORIES, MOCK_QUESTIONS, SUB_CATEGORIES as INITIAL_SUB_CATEGORIES } from './constants';
import QuizCard from './components/QuizCard';
import AdminPanel from './components/AdminPanel';
import QuestionItem from './components/QuestionItem';
import { 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  Trophy, 
  LogOut, 
  ChevronLeft,
  Calendar,
  ChevronRight,
  RefreshCcw,
  CheckCircle2,
  FileText,
  Tags,
  Bookmark,
  Zap,
  Clock,
  Search
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('jobprep_questions');
    return saved ? JSON.parse(saved) : MOCK_QUESTIONS;
  });
  
  const [subCategories, setSubCategories] = useState<Record<Category, string[]>>(() => {
    const saved = localStorage.getItem('jobprep_subcategories');
    return saved ? JSON.parse(saved) : INITIAL_SUB_CATEGORIES;
  });
  
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('jobprep_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const guestUser: UserProfile = {
        uid: 'guest',
        email: 'guest@jobprep.bd',
        displayName: 'পরীক্ষার্থী (অতিথি)',
        isAdmin: false,
        bookmarks: [],
        activity: []
      };
      setUser(guestUser);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jobprep_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('jobprep_subcategories', JSON.stringify(subCategories));
  }, [subCategories]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jobprep_user', JSON.stringify(user));
    }
  }, [user]);

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setView('SUB_CATEGORY_LIST');
  };

  const startQuiz = (subCat: string) => {
    const filtered = questions.filter(q => q.category === selectedCategory && q.subCategory === subCat);
    if (filtered.length === 0) {
      alert("এই সাব-ক্যাটাগরিতে কোনো প্রশ্ন পাওয়া যায়নি!");
      return;
    }
    setActiveQuestions(filtered.sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setUserScore(0);
    setQuizFinished(false);
    setSelectedSubCategory(subCat);
    setView('QUIZ');
  };

  const showYearlyQuestions = (year: string) => {
    const filtered = questions.filter(q => q.year === year);
    setActiveQuestions(filtered);
    setSelectedYear(year);
    setView('YEAR_LIST');
    
    if (user) {
      const newActivity = {
        type: 'STUDY' as const,
        label: `${year} সালের প্রশ্ন স্টাডি`,
        timestamp: Date.now()
      };
      setUser({ ...user, activity: [newActivity, ...user.activity].slice(0, 10) });
    }
  };

  const showBookmarks = () => {
    if (!user) return;
    const filtered = questions.filter(q => user.bookmarks.includes(q.id));
    setActiveQuestions(filtered);
    setView('BOOKMARKS');
  };

  const toggleBookmark = (id: string) => {
    if (!user) return;
    const isBookmarked = user.bookmarks.includes(id);
    const newBookmarks = isBookmarked 
      ? user.bookmarks.filter(b => b !== id)
      : [...user.bookmarks, id];
    setUser({ ...user, bookmarks: newBookmarks });
  };

  const handleNext = (isCorrect: boolean) => {
    if (isCorrect) setUserScore(s => s + 1);
    setCurrentIdx(i => i + 1);
  };

  const handleFinish = () => {
    setQuizFinished(true);
    if (user && selectedSubCategory) {
      const newActivity = {
        type: 'QUIZ' as const,
        label: `${selectedSubCategory} কুইজ`,
        timestamp: Date.now(),
        score: userScore,
        total: activeQuestions.length
      };
      setUser({ ...user, activity: [newActivity, ...user.activity].slice(0, 10) });
    }
  };

  const addQuestion = (newQ: Omit<Question, 'id' | 'createdAt'>) => {
    const q: Question = {
      ...newQ,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setQuestions([q, ...questions]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addSubCategory = (category: Category, subCategoryName: string) => {
    if (subCategories[category].includes(subCategoryName)) return;
    setSubCategories({
      ...subCategories,
      [category]: [...subCategories[category], subCategoryName]
    });
  };

  const deleteSubCategory = (category: Category, subCategoryName: string) => {
    setSubCategories({
      ...subCategories,
      [category]: subCategories[category].filter(s => s !== subCategoryName)
    });
  };

  const handleLogin = () => {
    const mockUser: UserProfile = {
      uid: 'admin-1',
      email: 'admin@jobprep.bd',
      displayName: 'অ্যাডমিন ইউজার',
      isAdmin: true,
      bookmarks: user?.bookmarks || [],
      activity: user?.activity || []
    };
    setUser(mockUser);
    setView('HOME');
  };

  const handleLogout = () => {
    const guestUser: UserProfile = {
      uid: 'guest',
      email: 'guest@jobprep.bd',
      displayName: 'পরীক্ষার্থী (অতিথি)',
      isAdmin: false,
      bookmarks: [],
      activity: []
    };
    setUser(guestUser);
    setView('HOME');
  };

  const uniqueYears = (Array.from(new Set(questions.map(q => q.year))) as string[]).sort((a, b) => b.localeCompare(a));

  const filteredQuestionsBySearch = searchQuery.trim() === '' 
    ? [] 
    : questions.filter(q => 
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col font-['Hind_Siliguri',_sans-serif] bg-[#f8fafc] text-gray-900">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div onClick={() => setView('HOME')} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:rotate-3 transition-transform shadow-lg shadow-blue-200">JP</div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">JobPrep <span className="text-blue-600">BD</span></h1>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => setView('HOME')} className={`text-sm font-bold transition-colors ${view === 'HOME' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>হোম</button>
            <button onClick={showBookmarks} className={`text-sm font-bold transition-colors flex items-center gap-1.5 ${view === 'BOOKMARKS' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}><Bookmark className="w-4 h-4" /> বুকমার্ক</button>
            <button onClick={() => setView('ADMIN')} className={`text-sm font-bold transition-colors ${view === 'ADMIN' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>অ্যাডমিন প্যানেল</button>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input type="text" placeholder="প্রশ্ন খুঁজুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-full text-sm outline-none transition-all w-48 focus:w-64" />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {filteredQuestionsBySearch.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 border-b bg-gray-50 text-[10px] font-black uppercase text-gray-400">অনুসন্ধানের ফলাফল</div>
                  {filteredQuestionsBySearch.map(q => (
                    <button key={q.id} onClick={() => { setActiveQuestions([q]); setView('YEAR_LIST'); setSearchQuery(''); }} className="w-full p-3 text-left hover:bg-blue-50 transition-colors border-b last:border-0">
                      <p className="text-sm font-bold text-gray-700 truncate">{q.questionText}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase">{q.category} - {q.subCategory}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-gray-800 leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.isAdmin ? 'অ্যাডমিন' : 'পরীক্ষার্থী'}</p>
                </div>
                {user.uid !== 'guest' ? (
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
                ) : (
                  <button onClick={handleLogin} className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">লগইন</button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 pb-24 md:pb-8">
        {view === 'HOME' && (
          <div className="max-w-7xl mx-auto p-4 py-8 md:py-12 space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20"><Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />বিগত ১৫ বছরের সকল প্রশ্ন এক জায়গায়</div>
                  <h2 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">সেরা প্রস্তুতি <br/> স্বপ্ন ছোঁয়ার পথে</h2>
                  <p className="text-blue-100 max-w-md text-lg font-medium">বিসিএস, ব্যাংক এবং প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার পূর্ণাঙ্গ ডিজিটাল গাইড।</p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button onClick={() => selectCategory('BCS')} className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:-translate-y-1 transition-all active:scale-95">প্রস্তুতি শুরু করুন</button>
                    <button onClick={() => showYearlyQuestions(uniqueYears[0])} className="px-8 py-4 bg-blue-500/30 backdrop-blur-md border border-white/30 text-white rounded-2xl font-black text-lg hover:bg-blue-500/50 transition-all">বিগত বছরের প্রশ্ন</button>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute right-12 top-12 opacity-20 rotate-12"><BookOpen className="w-48 h-48" /></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6"><h3 className="font-black text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> সাম্প্রতিক অ্যাক্টিভিটি</h3></div>
                  <div className="space-y-4">
                    {user?.activity && user.activity.length > 0 ? (
                      user.activity.map((act, i) => (
                        <div key={i} className="flex gap-4 items-start group">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${act.type === 'QUIZ' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{act.type === 'QUIZ' ? <Trophy className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}</div>
                          <div className="flex-1 border-b border-gray-50 pb-3 group-last:border-0">
                            <p className="text-sm font-bold text-gray-700">{act.label}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] font-bold text-gray-400">{new Date(act.timestamp).toLocaleDateString('bn-BD')}</p>
                              {act.score !== undefined && <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">স্কোর: {act.score}/{act.total}</span>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : ( <div className="text-center py-8"><p className="text-xs font-bold text-gray-400 italic">এখনো কোনো অ্যাক্টিভিটি নেই</p></div> )}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Bookmark className="w-5 h-5" /></div>
                    <div><h4 className="font-black text-sm">আপনার বুকমার্কস</h4><p className="text-[10px] opacity-80 uppercase font-bold">কঠিন প্রশ্নগুলো এখানে আছে</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black">{user?.bookmarks.length || 0}</span>
                    <button onClick={showBookmarks} className="px-4 py-2 bg-white text-purple-700 rounded-xl font-bold text-xs hover:bg-purple-50 transition-colors">সবগুলো দেখুন</button>
                  </div>
                </div>
              </div>
            </div>
            <section className="space-y-6">
              <div className="flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-600" /><h3 className="text-2xl font-black text-gray-800 tracking-tight">সাল অনুযায়ী প্রশ্নব্যাংক</h3></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {uniqueYears.map(year => (
                  <button key={year} onClick={() => showYearlyQuestions(year)} className="p-5 bg-white border border-gray-100 rounded-3xl font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1 transition-all flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><FileText className="w-6 h-6" /></div>
                    <span className="text-lg font-black">{year}</span>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">২০+ প্রশ্ন</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-blue-600" /><h3 className="text-2xl font-black text-gray-800 tracking-tight">বিষয় ভিত্তিক প্রস্তুতি</h3></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} onClick={() => selectCategory(cat.id as Category)} className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-50 border border-gray-100 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center">
                    <div className={`w-16 h-16 ${cat.color} rounded-[1.25rem] flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg`}>{cat.icon}</div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">{cat.label}</h3>
                    <p className="text-xs text-gray-400 mb-6 font-bold uppercase tracking-wider">৫টি সাব-ক্যাটাগরি</p>
                    <div className="mt-auto px-6 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-full flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">প্র্যাকটিস শুরু করুন <ChevronRight className="w-3 h-3" /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        {view === 'BOOKMARKS' && (
          <div className="max-w-4xl mx-auto p-4 py-8 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('HOME')} className="flex items-center gap-1 text-blue-600 font-bold mb-6 hover:underline"><ChevronLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান</button>
            <div className="mb-8 p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <h2 className="text-3xl font-black mb-2">আপনার বুকমার্ক করা প্রশ্নসমূহ</h2>
              <p className="opacity-90 font-medium">আপনার সেভ করা {activeQuestions.length} টি প্রশ্ন এখানে সংরক্ষিত আছে।</p>
              <Bookmark className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
            </div>
            <div className="space-y-6">
              {activeQuestions.map((q, idx) => ( <QuestionItem key={q.id} question={q} index={idx} isBookmarked={true} onToggleBookmark={() => toggleBookmark(q.id)} /> ))}
              {activeQuestions.length === 0 && ( <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"><div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4"><Bookmark className="w-8 h-8" /></div><p className="text-gray-400 font-bold">আপনি এখনো কোনো প্রশ্ন বুকমার্ক করেননি।</p></div> )}
            </div>
          </div>
        )}
        {view === 'SUB_CATEGORY_LIST' && selectedCategory && (
          <div className="max-w-4xl mx-auto p-4 py-8 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('HOME')} className="flex items-center gap-1 text-blue-600 font-bold mb-6 hover:underline"><ChevronLeft className="w-4 h-4" /> ফিরে যান</button>
            <div className="mb-8 p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex items-center gap-6">
              <div className={`w-20 h-20 ${CATEGORIES.find(c => c.id === selectedCategory)?.color} rounded-3xl flex items-center justify-center text-white text-4xl shadow-lg`}>{CATEGORIES.find(c => c.id === selectedCategory)?.icon}</div>
              <div><h2 className="text-3xl font-black text-gray-800">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</h2><p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">অনুগ্রহ করে একটি বিষয় নির্বাচন করুন</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subCategories[selectedCategory].map((sub) => (
                <button key={sub} onClick={() => startQuiz(sub)} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-400 text-left transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><Tags className="w-6 h-6" /></div>
                    <div><span className="font-black text-gray-800 block text-lg">{sub}</span><span className="text-[10px] text-gray-400 font-bold uppercase">১০টি প্রশ্ন উপলব্ধ</span></div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-blue-500" /></div>
                </button>
              ))}
            </div>
          </div>
        )}
        {view === 'YEAR_LIST' && (
          <div className="max-w-4xl mx-auto p-4 py-8 animate-in slide-in-from-right duration-300">
            <button onClick={() => setView('HOME')} className="flex items-center gap-1 text-blue-600 font-bold mb-6 hover:underline"><ChevronLeft className="w-4 h-4" /> ফিরে যান</button>
            <div className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <h2 className="text-3xl font-black mb-2">{selectedYear} সালের সকল প্রশ্ন</h2>
              <p className="opacity-70 font-medium">নিচের সকল প্রশ্ন একই পাতায় উত্তরসহ প্র্যাকটিস করতে পারেন।</p>
              <Calendar className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
            </div>
            <div className="space-y-6">
              {activeQuestions.map((q, idx) => ( <QuestionItem key={q.id} question={q} index={idx} isBookmarked={user?.bookmarks.includes(q.id)} onToggleBookmark={() => toggleBookmark(q.id)} /> ))}
            </div>
            {activeQuestions.length === 0 && ( <div className="text-center py-20"><p className="text-gray-400 font-bold italic">এই সালের কোনো প্রশ্ন ডাটাবেসে নেই।</p></div> )}
          </div>
        )}
        {view === 'QUIZ' && (
          <div className="max-w-3xl mx-auto p-4 py-8 animate-in zoom-in duration-300">
            {!quizFinished ? ( <QuizCard question={activeQuestions[currentIdx]} currentIndex={currentIdx} total={activeQuestions.length} onNext={handleNext} onFinish={handleFinish} /> ) : (
              <div className="bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50"><CheckCircle2 className="w-12 h-12" /></div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">অভিনন্দন!</h2>
                <p className="text-gray-500 font-medium mb-10">কুইজটি সফলভাবে শেষ হয়েছে।</p>
                <div className="flex justify-center gap-8 mb-12">
                  <div className="p-6 bg-blue-50 rounded-[2rem] px-12 border border-blue-100 shadow-sm"><p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">সঠিক উত্তর</p><p className="text-5xl font-black text-blue-700">{userScore}</p></div>
                  <div className="p-6 bg-gray-50 rounded-[2rem] px-12 border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">মোট প্রশ্ন</p><p className="text-5xl font-black text-gray-600">{activeQuestions.length}</p></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => startQuiz(selectedSubCategory!)} className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:-translate-y-1"><RefreshCcw className="w-6 h-6" /> আবার শুরু করুন</button>
                  <button onClick={() => setView('SUB_CATEGORY_LIST')} className="px-10 py-5 bg-gray-100 text-gray-700 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all">ফিরে যান</button>
                </div>
              </div>
            )}
          </div>
        )}
        {view === 'ADMIN' && ( <AdminPanel questions={questions} subCategories={subCategories} onAddQuestion={addQuestion} onDeleteQuestion={deleteQuestion} onAddSubCategory={addSubCategory} onDeleteSubCategory={deleteSubCategory} /> )}
      </main>
      <footer className="md:hidden bg-white/80 backdrop-blur-md border-t py-4 px-8 flex justify-between items-center fixed bottom-0 left-0 right-0 z-50">
        <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-1.5 ${view === 'HOME' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-wider">হোম</span></button>
        <button onClick={showBookmarks} className={`flex flex-col items-center gap-1.5 ${view === 'BOOKMARKS' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'}`}><Bookmark className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-wider">বুকমার্ক</span></button>
        <button onClick={() => setView('ADMIN')} className={`flex flex-col items-center gap-1.5 ${view === 'ADMIN' ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'}`}><Settings className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-wider">সেটিংস</span></button>
        <button className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-blue-400"><Trophy className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-wider">স্কোর</span></button>
      </footer>
    </div>
  );
};

export default App;