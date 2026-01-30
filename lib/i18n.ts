export type SupportedLanguage = 'en' | 'fa'

type StepCopy = { title: string; description: string }
type PersonaCopy = { title: string; type: string; description: string; badge?: string }

interface LandingCopy {
  nav: {
    brand: string
    process: string
    boardroom: string
    pricing: string
    cta: string
  }
  hero: {
    badge: string
    heading: string
    subheading: string
    cta: string
    highlights: [string, string]
  }
  process: {
    heading: string
    subheading: string
    steps: StepCopy[]
    deepEyebrow: string
    deepHeading: string
    deepBody: string
    deepBullets: string[]
  }
  boardroom: {
    heading: string
    subheading: string
    personas: Record<'vc' | 'mentor' | 'brainstorm' | 'practice' | 'founder_test', PersonaCopy>
  }
  pricing: {
    heading: string
    subtitle: string
    starter: {
      name: string
      price: string
      period: string
      blurb: string
      features: string[]
      cta: string
    }
    pro: {
      name: string
      price: string
      period: string
      badge: string
      blurb: string
      features: string[]
      cta: string
    }
  }
  footer: {
    rights: string
  }
}

interface DashboardCopy {
  sidebar: {
    brand: string
    practice: string
    recorder: string
    history: string
    profile: string
    upgrade: string
    signOut: string
  }
  header: {
    practiceTitle: string
    practiceSubtitle: string
    historySubtitle: string
    genericSubtitle: string
  }
  selection: {
    heading: string
    subheading: string
    fileOnly: StepCopy
    speechOnly: StepCopy
    full: StepCopy
  }
  context: {
    heading: string
    subheading: string
    stage: string
    audience: string
    industry: string
    back: string
    cta: string
    stageOptions: { id: string; label: string; desc: string }[]
    audienceOptions: { id: string; label: string; desc: string }[]
    industries: string[]
  }
  recording: {
    changeMode: string
    liveBadge: string
  }
  analyzing: {
    title: string
  }
  roleSelection: {
    heading: string
    subheading: string
    returnToResults: string
  }
  roleSelector: {
    cards: Record<'vc' | 'mentor' | 'brainstorm' | 'practice' | 'founder_test', { title: string; desc: string; isPremium?: boolean }>
  }
  history: {
    heading: string
    empty: string
    loading: string
    signin: string
    back: string
    noAccess: string
    scoreLabel: string
    sessionFallback: string
    durationSuffix: string
  }
  profile: {
    signinTitle: string
    signinSubtitle: string
    signinButton: string
    planLabel: string
    planNote: string
    sessionsLabel: string
    avgScoreLabel: string
    analysisCredits: string
    roleplayMinutes: string
    logout: string
  }
  settings: {
    heading: string
    generalTitle: string
    generalSubtitle: string
    notificationsTitle: string
    notificationsSubtitle: string
    privacyTitle: string
    privacySubtitle: string
    edit: string
    manage: string
  }
  pricing: {
    heading: string
    blurb: string
    starterFeatures: string[]
    proFeatures: string[]
    starterCTA: string
    proCTA: string
  }
  liveQnA: {
    title: string
    subtitle: string
    placeholder: string
    send: string
    loading: string
    ending: string
    startMessage: string
    error: string
    instructionsTitle: string
    instructions: string[]
    end: string
    userLabel: string
    assistantLabel: string
  }
  realtime: {
    connecting: string
    connected: string
    roleSubtitle: string
    end: string
  }
  recorderView: {
    title: string
    subtitle: string
    uploadCta: string
    slideIndicator: string
    recordingComplete: string
    changeFile: string
    downloadCta: string
    recordAnother: string
    startButton: string
    stopButton: string
    errors: {
      cameraAccess: string
      cameraInUse: string
      cameraDenied: string
      pdfOnly: string
      pdfLoad: string
    }
  }
}

export const landingCopy: Record<SupportedLanguage, LandingCopy> = {
  en: {
    nav: {
      brand: 'PerfectPitch',
      process: 'Process',
      boardroom: 'Boardroom',
      pricing: 'Pricing',
      cta: 'Get Started',
    },
    hero: {
      badge: 'v2.0 Public Beta Included',
      heading: 'PerfectPitch',
      subheading: 'Validate your narrative, delivery, and slide deck with AI investors before you pitch.',
      cta: 'Start Validation',
      highlights: ['No credit card required', 'Free initial analysis'],
    },
    process: {
      heading: 'From Deck to Deal',
      subheading: 'A streamlined, scientific process designed to maximize your funding probability.',
      steps: [
        { title: 'Subscribe', description: 'Create your account and choose your sector for tailored guidance.' },
        { title: 'Upload & Sync', description: 'Upload your deck. We parse every slide and align it with your speech.' },
        { title: 'Active Roleplay', description: 'Pitch to AI investors who challenge your assumptions in real-time.' },
        { title: 'Score & Iterate', description: 'Receive a Funding Readiness Score and precise improvement tips.' },
      ],
      deepEyebrow: 'Deep Analysis Engine',
      deepHeading: 'We see what you say. Literally.',
      deepBody: 'Upload your pitch deck and record your presentation. Our AI keeps narration and slides in sync to uncover weak framing, pacing gaps, and confusing visuals.',
      deepBullets: ['Slide-by-slide sentiment analysis', 'Visual & verbal consistency tracking'],
    },
    boardroom: {
      heading: 'The AI Boardroom',
      subheading: 'Practice with voice-based, real-time personas designed to pressure-test your logic, not just your lines.',
      personas: {
        vc: { title: 'VC Partner', type: 'Pressure Test', description: 'Ruthless and ROI-obsessed. Demands precise numbers and proof.' },
        mentor: { title: 'Startup Mentor', type: 'Growth Focus', description: 'Supportive but honest feedback to refine go-to-market.', },
        brainstorm: { title: 'Co-Founder', type: 'Brainstorming', description: 'Creative sparring partner who explores alternate plays.' },
        practice: { title: 'Practice Mode', type: 'Rapid Fire', description: 'Question-only sprints. Perfect for quick warmups.' },
        founder_test: { title: 'Founder Test', type: 'Premium', description: 'High-pressure stress test of leadership and psychology.', badge: 'Premium' },
      },
    },
    pricing: {
      heading: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that matches your fundraising stage.',
      starter: {
        name: 'Starter',
        price: '$0',
        period: '/month',
        blurb: 'Perfect for early founders shaping the story.',
        features: ['1 Professional Analysis'],
        cta: 'Get Started',
      },
      pro: {
        name: 'Pro',
        price: '$14',
        period: '/month',
        badge: 'Popular',
        blurb: 'For founders raising Seed or Series A.',
        features: ['5 Professional Analyses', 'Priority Support', 'Advanced Insights'],
        cta: 'Upgrade Now',
      },
    },
    footer: {
      rights: '© 2024 PerfectPitch Inc. All rights reserved.',
    },
  },
  fa: {
    nav: {
      brand: 'پرفکت پیچ',
      process: 'فرایند',
      boardroom: 'اتاق ش模ه',
      pricing: 'قیمت‌گذاری',
      cta: 'شروع کنید',
    },
    hero: {
      badge: 'نسخه ۲.۰ + بتای عمومی',
      heading: 'PerfectPitch',
      subheading: 'قبل از جلسه واقعی، روایت و ارائه‌تان را با سرمایه‌گذاران هوش مصنوعی محک بزنید.',
      cta: 'شروع ارزیابی',
      highlights: ['بدون نیاز به کارت بانکی', 'یک تحلیل اولیه رایگان'],
    },
    process: {
      heading: 'از دک تا معامله',
      subheading: 'یک فرایند علمی و فشرده برای حداکثر کردن شانس سرمایه‌گذاری.',
      steps: [
        { title: 'عضویت', description: 'اکانت بسازید و حوزه فعالیت‌تان را مشخص کنید تا راهنمای دقیق بگیرید.' },
        { title: 'آپلود و همگام‌سازی', description: 'دک PDF را بدهید؛ سیستم هر اسلاید را خط‌به‌خط با صحبت شما می‌سنجد.' },
        { title: 'نقش‌آفرینی زنده', description: 'با VCهای هوش مصنوعی صحبت کنید و چالش‌های لحظه‌ای دریافت کنید.' },
        { title: 'امتیاز و Iteration', description: 'اسکور آمادگی جذب سرمایه + چک‌لیست اصلاح دریافت کنید.' },
      ],
      deepEyebrow: 'موتور تحلیل عمیق',
      deepHeading: 'آنچه می‌گویید را می‌بینیم.',
      deepBody: 'دک و ویدیو را بدهید؛ الگوریتم ما روایت و اسلایدها را همزمان دنبال می‌کند تا ضعف فریمینگ یا ریتم را بیرون بکشد.',
      deepBullets: ['تحلیل احساس اسلاید به اسلاید', 'کنترل تطابق تصویر و روایت'],
    },
    boardroom: {
      heading: 'اتاق هیئت‌مدیره‌ی AI',
      subheading: 'با پرسونای صوتی و زنده تمرین کنید تا منطق کسب‌وکار سنجیده شود نه فقط دکلمه.',
      personas: {
        vc: { title: 'همکار سرمایه‌گذار', type: 'فشار سرمایه‌گذاری', description: 'سخت‌گیر و ROI محور. عدد دقیق و اثبات می‌خواهد.' },
        mentor: { title: 'مربی استارتاپ', type: 'تمرکز روی رشد', description: 'صادق و حمایت‌گر برای پالایش استراتژی ورود به بازار.' },
        brainstorm: { title: 'هم‌بنیان‌گذار', type: 'طوفان فکری', description: 'همراه خلاق برای سناریوهای جایگزین و زاویه‌های جدید.' },
        practice: { title: 'حالت تمرین', type: 'سریع و بدون حاشیه', description: 'تنها سؤال پشت سؤال؛ مناسب گرم‌کردن‌های قبل جلسه.' },
        founder_test: { title: 'تست Founder', type: 'ویژه', description: 'استرس‌تست مدیریتی و ذهنی برای بنیان‌گذاران جدی.', badge: 'پریمیوم' },
      },
    },
    pricing: {
      heading: 'قیمت‌گذاری شفاف و ساده',
      subtitle: 'پلنی را انتخاب کنید که با مرحله جذب سرمایه شما هماهنگ است.',
      starter: {
        name: 'استارتر',
        price: 'رایگان',
        period: '/ماه',
        blurb: 'مناسب بنیان‌گذاران در فاز روایت اولیه.',
        features: ['۱ تحلیل حرفه‌ای'],
        cta: 'شروع رایگان',
      },
      pro: {
        name: 'پرو',
        price: '$14',
        period: '/ماه',
        badge: 'محبوب',
        blurb: 'برای تیم‌هایی که در Seed یا Series A هستند.',
        features: ['۵ تحلیل حرفه‌ای', 'پشتیبانی اولویت‌دار', 'بینش‌های پیشرفته'],
        cta: 'ارتقا به پرو',
      },
    },
    footer: {
      rights: '© ۲۰۲۴ پرفکت پیچ. تمامی حقوق محفوظ است.',
    },
  },
}

export const dashboardCopy: Record<SupportedLanguage, DashboardCopy> = {
  en: {
    sidebar: {
      brand: 'PerfectPitch',
      practice: 'Practice',
      recorder: 'Pitch Recorder',
      history: 'History',
      profile: 'Profile',
      upgrade: 'Upgrade Plan',
      signOut: 'Sign Out',
    },
    header: {
      practiceTitle: 'Practice Session',
      practiceSubtitle: 'Record and validate your pitch.',
      historySubtitle: 'Review your past performance.',
      genericSubtitle: 'Manage your workflow.',
    },
    selection: {
      heading: 'Choose your input method',
      subheading: 'How would you like to present your pitch?',
      fileOnly: { title: 'File Only', description: 'Upload a PDF deck for analysis without video.' },
      speechOnly: { title: 'Speech Only', description: 'Record your pitch verbally without slides.' },
      full: { title: 'Full Presentation', description: 'Record video while presenting your slides.' },
    },
    context: {
      heading: 'Context Matters',
      subheading: 'Tell us about your startup so we can analyze with the right lens.',
      stage: 'Current Stage',
      audience: 'Who are you pitching to?',
      industry: 'Industry',
      back: 'Back',
      cta: 'Start Analysis',
      stageOptions: [
        { id: 'Idea', label: 'Idea Stage', desc: 'No product, just a concept.' },
        { id: 'Pre-Seed', label: 'Pre-Seed', desc: 'MVP, early traction, <$10k MRR.' },
        { id: 'Seed', label: 'Seed', desc: 'PMF emerging, <$50k MRR.' },
        { id: 'Series A', label: 'Series A', desc: 'Scaling with proven economics.' },
      ],
      audienceOptions: [
        { id: 'VCs', label: 'Venture Capitalists', desc: 'ROI & exit focused.' },
        { id: 'Angels', label: 'Angel Investors', desc: 'Team & vision focused.' },
        { id: 'Customers', label: 'Customers', desc: 'Value & problem focused.' },
        { id: 'Partners', label: 'Strategic Partners', desc: 'Synergy focused.' },
      ],
      industries: ['SaaS / B2B', 'Consumer App', 'Fintech', 'HealthTech', 'E-commerce', 'Marketplace', 'Deep Tech / AI', 'Hardware', 'Other'],
    },
    recording: {
      changeMode: '← Change Mode',
      liveBadge: 'Live Recording',
    },
    analyzing: {
      title: 'Analyzing',
    },
    roleSelection: {
      heading: 'Enter the Boardroom',
      subheading: 'Select an AI persona to simulate the meeting.',
      returnToResults: '← Return to Analysis Results',
    },
    roleSelector: {
      cards: {
        vc: { title: 'VC Partner', desc: 'Ruthless, critical, ROI focused.' },
        mentor: { title: 'Startup Mentor', desc: 'Helpful, constructive, growth mindset.' },
        brainstorm: { title: 'Co-Founder', desc: 'Creative, devil’s advocate.' },
        practice: { title: 'Practice Mode', desc: 'Rapid-fire questions only.' },
        founder_test: { title: 'Founder Test', desc: 'High-pressure vetting.', isPremium: true },
      },
    },
    history: {
      heading: 'Session History',
      empty: 'No sessions recorded yet. Start practicing!',
      loading: 'Loading history...',
      signin: 'Please sign in to view your history.',
      back: 'Back to History',
      noAccess: 'Please sign in to view your history.',
      scoreLabel: 'Score',
      sessionFallback: 'Pitch Practice',
      durationSuffix: 'duration',
    },
    profile: {
      signinTitle: 'Sign in to PerfectPitch',
      signinSubtitle: 'Save your progress and track improvement over time.',
      signinButton: 'Sign in with Google',
      planLabel: 'Current Plan',
      planNote: 'Manage your subscription in Settings',
      sessionsLabel: 'Total Sessions',
      avgScoreLabel: 'Avg Score',
      analysisCredits: 'Analysis Credits',
      roleplayMinutes: 'Roleplay Minutes',
      logout: 'Sign out',
    },
    settings: {
      heading: 'Settings',
      generalTitle: 'General',
      generalSubtitle: 'Language, Timezone',
      notificationsTitle: 'Notifications',
      notificationsSubtitle: 'Email, Push',
      privacyTitle: 'Privacy',
      privacySubtitle: 'Data usage',
      edit: 'Edit',
      manage: 'Manage',
    },
    pricing: {
      heading: 'Start Your Validation',
      blurb: 'Choose the plan that fits your fundraising stage.',
      starterFeatures: ['1 Professional Analysis', 'Basic Report'],
      proFeatures: ['5 Professional Analyses', 'Priority Support', 'Advanced Insights'],
      starterCTA: 'Current Plan',
      proCTA: 'Upgrade Now',
    },
    liveQnA: {
      title: 'Phase 2: Live conversation with VC AI',
      subtitle: 'Real interview – follow-up questions based on your analysis',
      placeholder: 'Write your response...',
      send: 'Send',
      loading: 'Sending...',
      ending: 'End conversation',
      startMessage: 'Initializing conversation...',
      error: 'An error occurred. Please try again.',
      instructionsTitle: 'Tips',
      instructions: [
        'AI asks based on your pitch analysis.',
        'Answer directly and clearly.',
        'Vague answers trigger follow-ups.',
        'Treat it like a real investor meeting.',
      ],
      end: 'End Conversation',
      userLabel: 'You',
      assistantLabel: 'VC AI',
    },
    realtime: {
      connecting: 'ESTABLISHING SECURE CONNECTION...',
      connected: 'LIVE CONNECTION ESTABLISHED',
      roleSubtitle: 'AI Interviewer',
      end: 'End Session',
    },
    recorderView: {
      title: 'Pitch Recorder',
      subtitle: 'Upload your deck and record synced narration.',
      uploadCta: 'Upload PDF Deck',
      slideIndicator: 'Slide',
      recordingComplete: 'Recording Complete',
      changeFile: 'Change File',
      downloadCta: 'Download Recording',
      recordAnother: 'Record Another',
      startButton: 'Start Recording',
      stopButton: 'Stop & Finish',
      errors: {
        cameraAccess: 'Could not access camera',
        cameraInUse: 'Camera is in use by another app',
        cameraDenied: 'Camera permission denied',
        pdfOnly: 'Please upload a PDF file',
        pdfLoad: 'Error loading PDF',
      },
    },
  },
  fa: {
    sidebar: {
      brand: 'پرفکت پیچ',
      practice: 'تمرین',
      recorder: 'ضبط پیچ',
      history: 'تاریخچه',
      profile: 'پروفایل',
      upgrade: 'ارتقای پلن',
      signOut: 'خروج',
    },
    header: {
      practiceTitle: 'جلسه تمرین',
      practiceSubtitle: 'پیچ خود را ضبط و ارزیابی کنید.',
      historySubtitle: 'عملکرد گذشته را مرور کنید.',
      genericSubtitle: 'مدیریت جریان‌کار.',
    },
    selection: {
      heading: 'روش ورودی را انتخاب کنید',
      subheading: 'می‌خواهید پیچ را چگونه ارائه دهید؟',
      fileOnly: { title: 'فقط فایل', description: 'فقط دک PDF را بدهید؛ بدون نیاز به ویدیو.' },
      speechOnly: { title: 'فقط صدا', description: 'فقط صحبت کنید؛ بدون اسلاید.' },
      full: { title: 'ارائه کامل', description: 'همزمان ویدیو و اسلاید ضبط می‌شود.' },
    },
    context: {
      heading: 'کانتکست مهم است',
      subheading: 'چند سؤال کوتاه تا تحلیل با لنز درست انجام شود.',
      stage: 'مرحله فعلی',
      audience: 'مخاطب ارائه',
      industry: 'صنعت',
      back: 'بازگشت',
      cta: 'شروع تحلیل',
      stageOptions: [
        { id: 'Idea', label: 'Idea', desc: 'ایده روی کاغذ؛ محصولی نیست.' },
        { id: 'Pre-Seed', label: 'Pre-Seed', desc: 'MVP و ترکش early، زیر ۱۰k MRR.' },
        { id: 'Seed', label: 'Seed', desc: 'PMF در حال شکل‌گیری، زیر ۵۰k MRR.' },
        { id: 'Series A', label: 'Series A', desc: 'در حال اسکیل با اکوینامیک ثابت.' },
      ],
      audienceOptions: [
        { id: 'VCs', label: 'VC ها', desc: 'دنبال ROI و خروج.' },
        { id: 'Angels', label: 'Angel', desc: 'روی تیم و ویژن حساس.' },
        { id: 'Customers', label: 'مشتری', desc: 'روی ارزش و درد تمرکز دارد.' },
        { id: 'Partners', label: 'Partner', desc: 'هم‌افزایی و همکاری مهم است.' },
      ],
      industries: ['SaaS / B2B', 'Consumer App', 'Fintech', 'HealthTech', 'E-commerce', 'Marketplace', 'Deep Tech / AI', 'Hardware', 'Other'],
    },
    recording: {
      changeMode: ' تغییر حالت',
      liveBadge: 'ضبط زنده',
    },
    analyzing: {
      title: 'در حال تحلیل',
    },
    roleSelection: {
      heading: 'وارد اتاق هیئت‌مدیره شوید',
      subheading: 'یک پرسونای AI برای شبیه‌سازی انتخاب کنید.',
      returnToResults: ' بازگشت به نتایج تحلیل',
    },
    roleSelector: {
      cards: {
        vc: { title: 'VC Partner', desc: 'بی‌رحم و ROI محور.' },
        mentor: { title: 'مربی استارتاپ', desc: 'سازنده و رشدگرا.' },
        brainstorm: { title: 'هم‌بنیان‌گذار', desc: 'خلاق و آنتاگونیست.' },
        practice: { title: 'حالت تمرین', desc: 'سؤالات سریع پشت سر هم.' },
        founder_test: { title: 'تست Founder', desc: 'استرس‌تست جدی.', isPremium: true },
      },
    },
    history: {
      heading: 'تاریخچه جلسات',
      empty: 'هنوز جلسه‌ای ثبت نشده. همین حالا شروع کنید!',
      loading: 'در حال بارگذاری تاریخچه...',
      signin: 'برای مشاهده تاریخچه وارد شوید.',
      back: 'بازگشت به تاریخچه',
      noAccess: 'برای دسترسی به تاریخچه وارد شوید.',
      scoreLabel: 'امتیاز',
      sessionFallback: 'جلسه تمرین',
      durationSuffix: 'مدت',
    },
    profile: {
      signinTitle: 'وارد پرفکت‌پیچ شوید',
      signinSubtitle: 'پیشرفت خود را ذخیره و روند رشد را رصد کنید.',
      signinButton: 'ورود با گوگل',
      planLabel: 'پلن فعلی',
      planNote: 'مدیریت اشتراک از تنظیمات',
      sessionsLabel: 'تعداد جلسات',
      avgScoreLabel: 'میانگین امتیاز',
      analysisCredits: 'اعتبار تحلیل',
      roleplayMinutes: 'دقایق Roleplay',
      logout: 'خروج',
    },
    settings: {
      heading: 'تنظیمات',
      generalTitle: 'عمومی',
      generalSubtitle: 'زبان، منطقه زمانی',
      notificationsTitle: 'اعلان‌ها',
      notificationsSubtitle: 'ایمیل، پوش',
      privacyTitle: 'حریم خصوصی',
      privacySubtitle: 'مصرف داده',
      edit: 'ویرایش',
      manage: 'مدیریت',
    },
    pricing: {
      heading: 'اعتبارسنجی را شروع کنید',
      blurb: 'پلنی مطابق مرحله جذب سرمایه خود انتخاب کنید.',
      starterFeatures: ['۱ تحلیل حرفه‌ای', 'گزارش پایه'],
      proFeatures: ['۵ تحلیل حرفه‌ای', 'پشتیبانی اولویت‌دار', 'بینش‌های پیشرفته'],
      starterCTA: 'پلن فعلی',
      proCTA: 'ارتقا',
    },
    liveQnA: {
      title: 'فاز ۲: گفتگوی زنده با VC AI',
      subtitle: 'مصاحبه واقعی با دنبال‌گیری مبتنی بر تحلیل',
      placeholder: 'پاسخ خود را بنویسید...',
      send: 'ارسال',
      loading: 'در حال ارسال...',
      ending: 'پایان گفتگو',
      startMessage: 'در حال شروع مکالمه...',
      error: 'خطایی رخ داد. دوباره تلاش کنید.',
      instructionsTitle: 'نکات مهم',
      instructions: [
        'سؤالات بر اساس تحلیل پیچ شماست.',
        'پاسخ دقیق و شفاف بدهید.',
        'جواب مبهم = سؤال پیگیری.',
        'مثل جلسه واقعی سرمایه‌گذار برخورد کنید.',
      ],
      end: 'پایان مکالمه',
      userLabel: 'شما',
      assistantLabel: 'VC AI',
    },
    realtime: {
      connecting: 'در حال برقراری اتصال امن...',
      connected: 'اتصال زنده برقرار شد',
      roleSubtitle: 'مصاحبه‌گر AI',
      end: 'پایان جلسه',
    },
    recorderView: {
      title: 'ضبط پیچ',
      subtitle: 'دک PDF را آپلود کنید تا تصویر و صدا همگام ضبط شود.',
      uploadCta: 'آپلود دک PDF',
      slideIndicator: 'اسلاید',
      recordingComplete: 'ضبط کامل شد',
      changeFile: 'تغییر فایل',
      downloadCta: 'دانلود ویدیو',
      recordAnother: 'ضبط دوباره',
      startButton: 'شروع ضبط',
      stopButton: 'پایان ضبط',
      errors: {
        cameraAccess: 'دسترسی به دوربین ممکن نشد',
        cameraInUse: 'دوربین توسط برنامه دیگری مشغول است',
        cameraDenied: 'دسترسی دوربین رد شد',
        pdfOnly: 'لطفاً فقط فایل PDF بارگذاری کنید',
        pdfLoad: 'خطا در بارگذاری PDF',
      },
    },
  },
}
