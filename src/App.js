import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Target, Clock, Trophy, ExternalLink, Calendar, FileText, Download, Settings, X, Edit3, Save, LogIn, LogOut, User } from 'lucide-react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const roadmapData = [
  {
    month: 1,
    title: "Python Foundations + Real Data",
    hours: 20,
    skills: ["Python basics", "Pandas fundamentals", "Google Sheets & CSV"],
    weeks: [
      { week: 1, title: "Python Fundamentals", tasks: ["Variables, loops, functions, data structures", "Write function to calculate parking revenue splits"] },
      { week: 2, title: "Pandas Introduction", tasks: ["DataFrames, reading CSV/Excel, filtering, groupby", "Load budget CSV, filter by month, calculate totals"] },
      { week: 3, title: "Data Cleaning", tasks: ["Handle missing values, data types, string operations", "Clean garage names (38-level nested formula)"] },
      { week: 4, title: "File Operations", tasks: ["Reading/writing files, working with multiple files", "Script to combine multiple location budgets"] }
    ],
    project: "Automated Budget Consolidator - Python script that reads budget CSVs, standardizes garage names, combines all locations, calculates totals",
    resources: [
      { name: "Kaggle Pandas Tutorial", url: "https://www.kaggle.com/learn/pandas" },
      { name: "Real Python", url: "https://realpython.com" },
      { name: "Python for Data Analysis (Book)", url: "https://wesmckinney.com/book/" }
    ]
  },
  {
    month: 2,
    title: "SQL Mastery + Database Connections",
    hours: 20,
    skills: ["Advanced SQL", "Window functions", "Python + Snowflake"],
    weeks: [
      { week: 1, title: "SQL Fundamentals Review", tasks: ["JOINs, GROUP BY, subqueries", "Practice on Snowflake data"] },
      { week: 2, title: "Window Functions", tasks: ["ROW_NUMBER(), RANK(), running totals", "Calculate month-over-month revenue growth"] },
      { week: 3, title: "CTEs & Complex Queries", tasks: ["WITH statements, recursive CTEs", "Build query for invoice aging buckets"] },
      { week: 4, title: "Python + Snowflake", tasks: ["snowflake.connector, pandas integration", "Pull data → manipulate → write back"] }
    ],
    project: "Invoice Aging Dashboard Data - Connect to Snowflake, calculate aging buckets, add priority flags, write to clean table",
    resources: [
      { name: "Mode Analytics SQL Tutorial", url: "https://mode.com/sql-tutorial/" },
      { name: "Snowflake Python Connector", url: "https://docs.snowflake.com/en/developer-guide/python-connector/python-connector" },
      { name: "Window Functions Tutorial", url: "https://www.postgresql.org/docs/current/tutorial-window.html" }
    ]
  },
  {
    month: 3,
    title: "API Integrations + Error Handling",
    hours: 24,
    skills: ["REST APIs", "OAuth", "Error handling", "Logging"],
    weeks: [
      { week: 1, title: "REST API Basics", tasks: ["requests library, GET/POST, headers", "Call a simple public API"] },
      { week: 2, title: "Stripe API", tasks: ["List invoices, customers, charges", "Pull all Stripe invoices from last month"] },
      { week: 3, title: "Error Handling & Logging", tasks: ["try/except, logging module, retry logic", "Add error handling to Stripe script"] },
      { week: 4, title: "OAuth & Complex APIs", tasks: ["OAuth 2.0 flow", "Authenticate with Google Sheets API"] }
    ],
    project: "Stripe Data Sync - Production-ready pipeline with pagination, error handling, retry logic, logging to Snowflake",
    resources: [
      { name: "Real Python REST APIs", url: "https://realpython.com/api-integration-in-python/" },
      { name: "Stripe Python Library", url: "https://stripe.com/docs/api?lang=python" },
      { name: "Tenacity (retry library)", url: "https://tenacity.readthedocs.io/" }
    ]
  },
  {
    month: 4,
    title: "Apache Airflow Introduction",
    hours: 25,
    skills: ["DAG concepts", "Local Airflow", "Task dependencies"],
    weeks: [
      { week: 1, title: "Airflow Concepts", tasks: ["DAGs, operators, executors, scheduling", "Watch intro videos"] },
      { week: 2, title: "Local Setup", tasks: ["Install Airflow with Docker", "Run example DAGs, explore UI"] },
      { week: 3, title: "First DAG", tasks: ["PythonOperator, BashOperator", "Hello World → Log → Email DAG"] },
      { week: 4, title: "Data Pipeline DAG", tasks: ["Convert Stripe script to Airflow", "XCom, monitoring, alerts"] }
    ],
    project: "Stripe DAG in Airflow - 5-task DAG: Fetch → Validate → Load → Transform → Notify, scheduled daily at 6am",
    resources: [
      { name: "Astronomer Academy", url: "https://academy.astronomer.io/" },
      { name: "Apache Airflow Docs", url: "https://airflow.apache.org/docs/" },
      { name: "Docker Desktop", url: "https://www.docker.com/products/docker-desktop/" }
    ]
  },
  {
    month: 5,
    title: "Production Airflow + More Integrations",
    hours: 25,
    skills: ["Cloud deployment", "Sensors", "Multiple data sources"],
    weeks: [
      { week: 1, title: "Astronomer Setup", tasks: ["Deploy DAG to cloud", "Environment variables, secrets"] },
      { week: 2, title: "External API DAGs", tasks: ["Build Bill.com API DAG", "ExternalTaskSensor, TriggerDagRunOperator"] },
      { week: 3, title: "Google Sheets Integration", tasks: ["Pull expense data from Sheets", "Service accounts, OAuth"] },
      { week: 4, title: "Monitoring & Alerting", tasks: ["Slack/email alerts, SLAs", "Custom alert callbacks"] }
    ],
    project: "Multi-Source Expense Pipeline - 4 DAGs: Bill.com + Xero + Google Sheets → Consolidation DAG",
    resources: [
      { name: "Astronomer Documentation", url: "https://docs.astronomer.io/" },
      { name: "Bill.com API", url: "https://developer.bill.com/" },
      { name: "Google Sheets API", url: "https://developers.google.com/sheets/api" }
    ]
  },
  {
    month: 6,
    title: "dbt Introduction + Data Modeling",
    hours: 25,
    skills: ["dbt fundamentals", "Data modeling", "Testing"],
    weeks: [
      { week: 1, title: "dbt Basics", tasks: ["Models, materializations, refs", "Set up dbt with Snowflake"] },
      { week: 2, title: "Data Modeling", tasks: ["Staging → intermediate → marts", "Star schema design"] },
      { week: 3, title: "Testing & Documentation", tasks: ["dbt tests (unique, not_null)", "Generate documentation site"] },
      { week: 4, title: "Incremental Models", tasks: ["Incremental loading strategies", "Snapshots for slowly changing dimensions"] }
    ],
    project: "dbt Models for Vend Park - Complete project: staging/, intermediate/, marts/ with fct_budget, fct_pl_by_garage, dim_garages",
    resources: [
      { name: "dbt Learn (Free)", url: "https://learn.getdbt.com/" },
      { name: "dbt Documentation", url: "https://docs.getdbt.com/" },
      { name: "dbt Slack Community", url: "https://www.getdbt.com/community/" }
    ]
  },
  {
    month: 7,
    title: "Advanced dbt + Data Quality",
    hours: 25,
    skills: ["Macros", "Advanced testing", "Performance"],
    weeks: [
      { week: 1, title: "Macros & Jinja", tasks: ["Write custom macros", "Garage name standardization macro"] },
      { week: 2, title: "Advanced Testing", tasks: ["Custom schema tests", "Cross-model relationships"] },
      { week: 3, title: "dbt Packages", tasks: ["dbt-utils, dbt-expectations", "audit_helper for comparisons"] },
      { week: 4, title: "Performance Tuning", tasks: ["Incremental strategies", "Optimize slow models"] }
    ],
    project: "Complete Data Quality Framework - 50+ tests, all models documented, performance optimized",
    resources: [
      { name: "dbt-utils Package", url: "https://hub.getdbt.com/dbt-labs/dbt_utils/" },
      { name: "dbt-expectations", url: "https://hub.getdbt.com/calogica/dbt_expectations/" },
      { name: "dbt Discourse", url: "https://discourse.getdbt.com/" }
    ]
  },
  {
    month: 8,
    title: "Streamlit + Custom Dashboards",
    hours: 25,
    skills: ["Streamlit basics", "Interactive viz", "Deployment"],
    weeks: [
      { week: 1, title: "Streamlit Basics", tasks: ["st.write, st.dataframe, layouts", "Hello world app"] },
      { week: 2, title: "Connecting to Snowflake", tasks: ["st.connection, caching", "Query and display budget data"] },
      { week: 3, title: "Interactive Features", tasks: ["Buttons, selectbox, slider", "Editable dataframes"] },
      { week: 4, title: "Deployment", tasks: ["Deploy to Streamlit Cloud", "Secrets management"] }
    ],
    project: "Custom Budget Entry App - View/edit budgets, write overrides to Snowflake, visualizations, mobile-responsive",
    resources: [
      { name: "Streamlit Documentation", url: "https://docs.streamlit.io/" },
      { name: "Streamlit Cloud", url: "https://streamlit.io/cloud" },
      { name: "Streamlit Gallery", url: "https://streamlit.io/gallery" }
    ]
  },
  {
    month: 9,
    title: "Git, CI/CD, & Production Practices",
    hours: 25,
    skills: ["Git workflows", "GitHub Actions", "Code quality"],
    weeks: [
      { week: 1, title: "Git Fundamentals", tasks: ["commit, branch, merge, pull requests", "Version control Airflow DAGs"] },
      { week: 2, title: "Git Workflows", tasks: ["Feature branches, Git Flow", "Merge conflict resolution"] },
      { week: 3, title: "CI/CD Setup", tasks: ["GitHub Actions for dbt", "Automated testing on commit"] },
      { week: 4, title: "Code Quality", tasks: ["Linting (pylint, black)", "Pre-commit hooks"] }
    ],
    project: "Production-Ready Repository - Organized repo with .github/workflows, airflow/, dbt/, scripts/, streamlit/",
    resources: [
      { name: "GitHub Learning Lab", url: "https://skills.github.com/" },
      { name: "GitHub Actions", url: "https://docs.github.com/en/actions" },
      { name: "Pre-commit", url: "https://pre-commit.com/" }
    ]
  },
  {
    month: 10,
    title: "Monitoring, Logging, & Observability",
    hours: 25,
    skills: ["Logging", "Pipeline monitoring", "Data observability"],
    weeks: [
      { week: 1, title: "Python Logging", tasks: ["logging module, handlers, formatters", "Add logging to all scripts"] },
      { week: 2, title: "Airflow Monitoring", tasks: ["Airflow metrics, SLAs", "Alerts for failed tasks"] },
      { week: 3, title: "dbt Monitoring", tasks: ["dbt artifacts, run results", "Elementary Data observability"] },
      { week: 4, title: "Snowflake Monitoring", tasks: ["Query history, warehouse usage", "Cost alerts"] }
    ],
    project: "Complete Observability Stack - Custom logging module, Airflow alerts, monitoring dashboard, dbt test tracking",
    resources: [
      { name: "Elementary Data", url: "https://www.elementary-data.com/" },
      { name: "Python Logging", url: "https://docs.python.org/3/library/logging.html" },
      { name: "Snowflake Usage Views", url: "https://docs.snowflake.com/en/sql-reference/account-usage" }
    ]
  },
  {
    month: 11,
    title: "Scaling & Optimization",
    hours: 25,
    skills: ["Query tuning", "Parallel processing", "Cost optimization"],
    weeks: [
      { week: 1, title: "Snowflake Optimization", tasks: ["Clustering keys, materialized views", "Optimize slow queries"] },
      { week: 2, title: "Airflow Scaling", tasks: ["Pools, executor types", "Parallel task execution"] },
      { week: 3, title: "Python Performance", tasks: ["Multiprocessing, async", "Profile and find bottlenecks"] },
      { week: 4, title: "Cost Optimization", tasks: ["Analyze credit usage", "Auto-suspend warehouses"] }
    ],
    project: "Performance & Cost Optimization - 30% cost reduction, 50% faster DAGs, 10x data capacity",
    resources: [
      { name: "Snowflake Performance Guide", url: "https://docs.snowflake.com/en/user-guide/performance-query" },
      { name: "Airflow Best Practices", url: "https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html" },
      { name: "Python Profiling", url: "https://docs.python.org/3/library/profile.html" }
    ]
  },
  {
    month: 12,
    title: "Multi-Location Rollout",
    hours: 25,
    skills: ["Data governance", "Multi-tenancy", "ML basics"],
    weeks: [
      { week: 1, title: "Data Governance", tasks: ["Row-level security, RBAC", "Document data lineage"] },
      { week: 2, title: "Multi-Location Architecture", tasks: ["Scalable schema for 38+ garages", "Dynamic DAGs"] },
      { week: 3, title: "Advanced Orchestration", tasks: ["Branching, dynamic task mapping", "Event-driven workflows"] },
      { week: 4, title: "Future Skills Preview", tasks: ["Basic ML with parking data", "Time series forecasting"] }
    ],
    project: "Complete System for All Locations - 38 automated pipelines, company-wide reports, owner portal",
    resources: [
      { name: "Airflow Dynamic DAGs", url: "https://airflow.apache.org/docs/apache-airflow/stable/howto/dynamic-dag-generation.html" },
      { name: "Snowflake Row Access Policies", url: "https://docs.snowflake.com/en/user-guide/security-row" },
      { name: "scikit-learn", url: "https://scikit-learn.org/" }
    ]
  }
];

const defaultData = { progress: {}, notes: {}, hoursLogged: {}, startDate: null };

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(defaultData);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [activeTab, setActiveTab] = useState('roadmap');
  const [showSettings, setShowSettings] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [tempNote, setTempNote] = useState('');
  const [tempHours, setTempHours] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } else {
        setData(defaultData);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveToFirebase = async (newData) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), newData);
    } catch (e) {
      console.error('Save error:', e);
    }
    setSaving(false);
  };

  const updateData = (newData) => {
    setData(newData);
    saveToFirebase(newData);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setData(defaultData);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const toggleTask = (monthIdx, weekIdx, taskIdx) => {
    const key = `${monthIdx}-${weekIdx}-${taskIdx}`;
    updateData({ ...data, progress: { ...data.progress, [key]: !data.progress[key] } });
  };

  const toggleProject = (monthIdx) => {
    const key = `project-${monthIdx}`;
    updateData({ ...data, progress: { ...data.progress, [key]: !data.progress[key] } });
  };

  const saveNote = (monthIdx) => {
    updateData({ ...data, notes: { ...data.notes, [monthIdx]: tempNote } });
    setEditingNote(null);
    setTempNote('');
  };

  const saveHours = (monthIdx) => {
    const hours = parseFloat(tempHours[monthIdx]) || 0;
    updateData({ ...data, hoursLogged: { ...data.hoursLogged, [monthIdx]: hours } });
  };

  const setStartDate = (date) => updateData({ ...data, startDate: date });

  const toggleMonth = (monthIdx) => setExpandedMonths(prev => ({ ...prev, [monthIdx]: !prev[monthIdx] }));

  const getMonthProgress = (monthIdx) => {
    const month = roadmapData[monthIdx];
    let total = 1, completed = data.progress[`project-${monthIdx}`] ? 1 : 0;
    month.weeks.forEach((week, wIdx) => {
      week.tasks.forEach((_, tIdx) => {
        total++;
        if (data.progress[`${monthIdx}-${wIdx}-${tIdx}`]) completed++;
      });
    });
    return { completed, total, percent: Math.round((completed / total) * 100) };
  };

  const getOverallProgress = () => {
    let total = 0, completed = 0;
    roadmapData.forEach((_, idx) => {
      const mp = getMonthProgress(idx);
      total += mp.total;
      completed += mp.completed;
    });
    return { completed, total, percent: Math.round((completed / total) * 100) };
  };

  const getScheduleStatus = () => {
    if (!data.startDate) return null;
    const start = new Date(data.startDate), now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const expectedMonth = Math.min(Math.floor(diffDays / 30) + 1, 12);
    const completedMonths = roadmapData.filter((_, idx) => getMonthProgress(idx).percent === 100).length;
    return { expectedMonth, completedMonths, diff: completedMonths - expectedMonth, daysIn: diffDays };
  };

  const getTargetEndDate = () => {
    if (!data.startDate) return null;
    const end = new Date(data.startDate);
    end.setMonth(end.getMonth() + 12);
    return end;
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const resetProgress = () => {
    if (window.confirm('Reset all progress, notes, and hours? This cannot be undone.')) {
      updateData({ progress: {}, notes: {}, hoursLogged: {}, startDate: data.startDate });
    }
  };

  const exportReport = () => {
    const overall = getOverallProgress();
    const totalPlanned = roadmapData.reduce((s, m) => s + m.hours, 0);
    const totalLogged = Object.values(data.hoursLogged).reduce((s, h) => s + (h || 0), 0);
    let report = `# Data Engineering Roadmap Progress Report\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
    report += `## Overall Progress\n- Tasks: ${overall.completed}/${overall.total} (${overall.percent}%)\n- Hours: ${totalLogged}/${totalPlanned}\n\n`;
    roadmapData.forEach((month, idx) => {
      const mp = getMonthProgress(idx);
      report += `### Month ${month.month}: ${month.title}\n- Progress: ${mp.percent}%\n- Project: ${data.progress[`project-${idx}`] ? '✅' : '⬜'}\n\n`;
    });
    const blob = new Blob([report], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `roadmap-progress-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Data Engineering Roadmap</h1>
          <p className="text-slate-400 mb-8">12-Month Learning Journey for Vend Park</p>
          <button onClick={handleLogin} className="w-full py-3 bg-white text-slate-900 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-slate-100 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign in with Google
          </button>
          <p className="text-slate-500 text-sm mt-6">Your progress syncs across all devices</p>
        </div>
      </div>
    );
  }

  const overall = getOverallProgress();
  const schedule = getScheduleStatus();
  const totalHours = roadmapData.reduce((sum, m) => sum + m.hours, 0);
  const totalLogged = Object.values(data.hoursLogged).reduce((s, h) => s + (h || 0), 0);
  const completedMonths = roadmapData.filter((_, idx) => getMonthProgress(idx).percent === 100).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Data Engineering Roadmap</h1>
            <p className="text-slate-400">12-Month Learning Journey for Vend Park</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-emerald-400">Saving...</span>}
            <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <Settings size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Settings</h3>
                <button onClick={() => setShowSettings(false)}><X size={20} className="text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.displayName}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input type="date" value={data.startDate || ''} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                </div>
                {data.startDate && <div className="bg-slate-700 rounded-lg p-3 text-sm"><p className="text-slate-300">Target End: <span className="text-emerald-400 font-medium">{formatDate(getTargetEndDate())}</span></p></div>}
                <button onClick={resetProgress} className="w-full py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900">Reset All Progress</button>
                <button onClick={handleLogout} className="w-full py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {data.startDate && schedule && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${schedule.diff >= 0 ? 'bg-emerald-900/30 border border-emerald-800' : 'bg-amber-900/30 border border-amber-800'}`}>
            <Calendar size={18} className={schedule.diff >= 0 ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="text-sm text-slate-300">
              Day {schedule.daysIn} • Should be on Month {schedule.expectedMonth} • 
              <span className={`ml-1 font-medium ${schedule.diff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {schedule.diff >= 0 ? `${schedule.diff} month(s) ahead` : `${Math.abs(schedule.diff)} month(s) behind`}
              </span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Target size={16} /><span>Progress</span></div>
            <div className="text-2xl font-bold text-emerald-400">{overall.percent}%</div>
            <div className="text-xs text-slate-500">{overall.completed}/{overall.total} tasks</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Trophy size={16} /><span>Months</span></div>
            <div className="text-2xl font-bold text-amber-400">{completedMonths}/12</div>
            <div className="text-xs text-slate-500">completed</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Clock size={16} /><span>Hours</span></div>
            <div className="text-2xl font-bold text-blue-400">{totalLogged}<span className="text-lg text-slate-500">/{totalHours}</span></div>
            <div className="text-xs text-slate-500">logged</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><BookOpen size={16} /><span>Resources</span></div>
            <div className="text-2xl font-bold text-purple-400">{roadmapData.reduce((s, m) => s + m.resources.length, 0)}</div>
            <div className="text-xs text-slate-500">curated links</div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-emerald-400 font-medium">{overall.percent}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${overall.percent}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setActiveTab('roadmap')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'roadmap' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Roadmap</button>
          <button onClick={() => setActiveTab('resources')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'resources' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Resources</button>
          <button onClick={exportReport} className="ml-auto px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-400 hover:bg-blue-900 hover:text-blue-300 flex items-center gap-1"><Download size={14} />Export</button>
        </div>

        {activeTab === 'roadmap' && (
          <div className="space-y-3">
            {roadmapData.map((month, monthIdx) => {
              const mp = getMonthProgress(monthIdx);
              const isExpanded = expandedMonths[monthIdx];
              const logged = data.hoursLogged[monthIdx] || 0;
              return (
                <div key={monthIdx} className="bg-slate-800 rounded-lg overflow-hidden">
                  <button onClick={() => toggleMonth(monthIdx)} className="w-full p-4 flex items-center gap-3 hover:bg-slate-750 text-left">
                    {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">M{month.month}</span>
                        <span className="font-semibold text-white truncate">{month.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{logged}/{month.hours}h</span>
                        <div className="flex-1 max-w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${mp.percent}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{mp.percent}%</span>
                      </div>
                    </div>
                    {mp.percent === 100 && <CheckCircle2 size={20} className="text-emerald-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-700">
                      <div className="flex flex-wrap gap-1 mt-3 mb-4">
                        {month.skills.map((skill, i) => <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{skill}</span>)}
                      </div>

                      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-900 rounded-lg">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-sm text-slate-400">Hours logged:</span>
                        <input type="number" min="0" max="100" value={tempHours[monthIdx] ?? data.hoursLogged[monthIdx] ?? ''} onChange={(e) => setTempHours({ ...tempHours, [monthIdx]: e.target.value })} onBlur={() => saveHours(monthIdx)} className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" placeholder="0" />
                        <span className="text-sm text-slate-500">/ {month.hours} target</span>
                      </div>
                      
                      {month.weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Week {week.week}: {week.title}</h4>
                          <div className="space-y-1 ml-2">
                            {week.tasks.map((task, taskIdx) => {
                              const isComplete = data.progress[`${monthIdx}-${weekIdx}-${taskIdx}`];
                              return (
                                <button key={taskIdx} onClick={() => toggleTask(monthIdx, weekIdx, taskIdx)} className="w-full flex items-start gap-2 text-left p-2 rounded hover:bg-slate-700">
                                  {isComplete ? <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" /> : <Circle size={18} className="text-slate-500 mt-0.5 shrink-0" />}
                                  <span className={`text-sm ${isComplete ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{task}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-4 p-3 bg-slate-900 rounded-lg">
                        <button onClick={() => toggleProject(monthIdx)} className="w-full flex items-start gap-2 text-left">
                          {data.progress[`project-${monthIdx}`] ? <CheckCircle2 size={18} className="text-amber-400 mt-0.5 shrink-0" /> : <Circle size={18} className="text-amber-600 mt-0.5 shrink-0" />}
                          <div>
                            <span className="text-xs text-amber-500 font-medium">PROJECT</span>
                            <p className={`text-sm ${data.progress[`project-${monthIdx}`] ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{month.project}</p>
                          </div>
                        </button>
                      </div>

                      <div className="mt-4 p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><FileText size={16} className="text-purple-400" /><span className="text-sm font-medium text-slate-300">Notes</span></div>
                          {editingNote !== monthIdx && <button onClick={() => { setEditingNote(monthIdx); setTempNote(data.notes[monthIdx] || ''); }} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"><Edit3 size={12} /> Edit</button>}
                        </div>
                        {editingNote === monthIdx ? (
                          <div className="space-y-2">
                            <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm min-h-20 resize-none" placeholder="Add notes..." />
                            <div className="flex gap-2">
                              <button onClick={() => saveNote(monthIdx)} className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-500 flex items-center gap-1"><Save size={12} /> Save</button>
                              <button onClick={() => setEditingNote(null)} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600">Cancel</button>
                            </div>
                          </div>
                        ) : <p className="text-sm text-slate-400">{data.notes[monthIdx] || 'No notes yet. Click edit to add.'}</p>}
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Resources</h4>
                        <div className="space-y-1">
                          {month.resources.map((res, i) => <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 p-1"><ExternalLink size={14} />{res.name}</a>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-4">All Learning Resources</h3>
            <div className="space-y-4">
              {roadmapData.map((month, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-medium text-emerald-400 mb-2">Month {month.month}: {month.title}</h4>
                  <div className="space-y-1 ml-2">
                    {month.resources.map((res, i) => <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 py-1"><ExternalLink size={14} className="shrink-0" />{res.name}</a>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-600">Signed in as {user.email} • Progress syncs automatically</div>
      </div>
    </div>
  );
}

export default App;