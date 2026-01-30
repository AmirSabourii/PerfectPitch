# Design Document: Admin Panel Redesign

## Overview

This design document outlines the comprehensive redesign of PerfectPitch's admin panels to implement a modern, minimal, black and white design system. The redesign transforms the existing Platform Admin and Organization Admin interfaces from traditional colored UI to a sophisticated monochrome aesthetic with glass morphism effects, subtle animations, and premium visual hierarchy.

The design maintains all existing functionality while elevating the visual experience to match PerfectPitch's brand identity. The implementation uses React, Next.js, TypeScript, Tailwind CSS, and Framer Motion to create a cohesive, performant, and accessible admin experience.

### Design Goals

1. **Visual Cohesion**: Match the modern design system used in PerfectPitch's landing page
2. **Premium Feel**: Create a sophisticated, professional interface that inspires confidence
3. **Clarity**: Improve information hierarchy and scannability through typography and spacing
4. **Performance**: Maintain fast load times and smooth interactions
5. **Accessibility**: Ensure WCAG AA compliance and full keyboard navigation
6. **Maintainability**: Build reusable components that follow consistent patterns

## Architecture

### Component Hierarchy

```
Admin Application
├── Layout Components
│   ├── AdminLayout (floating nav, container)
│   ├── FloatingNav (glass morphism navigation)
│   └── PageContainer (max-w-7xl, padding)
│
├── Dashboard Components
│   ├── PlatformAdminDashboard
│   │   ├── StatCard (total orgs, users, pitches)
│   │   ├── OrganizationGrid
│   │   └── CreateOrgButton (floating action)
│   │
│   └── OrganizationAdminDashboard
│       ├── OrganizationGrid
│       └── QuickSetupButton
│
├── Organization Detail Components
│   ├── OrganizationDetailLayout
│   ├── TabNavigation (pill-style tabs)
│   ├── OverviewTab
│   ├── ProgramsTab
│   ├── ParticipantsTab
│   ├── InvitationsTab
│   ├── AnalyticsTab
│   └── PitchesTab
│
├── Shared UI Components
│   ├── Card (base card with design system)
│   ├── StatCard (metric display)
│   ├── Button (primary, secondary, ghost)
│   ├── Input (floating label)
│   ├── Select (dropdown)
│   ├── Modal (backdrop blur)
│   ├── Toast (corner notifications)
│   └── Skeleton (loading states)
│
└── Data Display Components
    ├── DataTable (sortable, paginated)
    ├── Chart (monochrome visualizations)
    ├── FilterPanel (collapsible filters)
    └── PitchCard (pitch display)
```

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts (customized for monochrome)
- **State Management**: React hooks, Context API
- **Data Fetching**: Server Components, Server Actions
- **Forms**: React Hook Form with Zod validation

### Design System Architecture

The design system is implemented through Tailwind CSS configuration and reusable component patterns:

```typescript
// Design tokens
const designTokens = {
  colors: {
    background: '#030303',
    card: '#0A0A0A',
    border: 'rgba(255, 255, 255, 0.05)',
    borderHover: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA', // zinc-400
      tertiary: '#71717A',  // zinc-500
    },
    status: {
      success: 'rgba(16, 185, 129, 0.1)', // emerald/10
      warning: 'rgba(245, 158, 11, 0.1)', // amber/10
      error: 'rgba(239, 68, 68, 0.1)',    // red/10
    }
  },
  spacing: {
    container: '2rem',      // p-8
    card: '1.5rem',         // p-6
    section: '2rem',        // space-y-8
    grid: '1.5rem',         // gap-6
  },
  borderRadius: {
    card: '1.5rem',         // rounded-3xl
  },
  typography: {
    hero: '6rem',           // text-8xl
    heading: '2.25rem',     // text-4xl
    body: '0.875rem',       // text-sm
  }
}
```

## Components and Interfaces

### Core UI Components

#### 1. Card Component

The base card component provides consistent styling for all card-based layouts.

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <motion.div
      className={cn(
        "bg-[#0A0A0A] border border-white/5 rounded-3xl p-6",
        hover && "hover:scale-105 hover:border-white/10 transition-all duration-300 cursor-pointer",
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.05 } : undefined}
    >
      {children}
    </motion.div>
  );
}
```

#### 2. StatCard Component

Displays a single metric with large number and label.

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

function StatCard({ label, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 tracking-wider uppercase">{label}</p>
          <p className="text-8xl font-light tracking-tight mt-4">{value}</p>
          {subtitle && (
            <p className="text-sm text-zinc-400 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-zinc-600">{icon}</div>
        )}
      </div>
      {trend && (
        <div className={cn(
          "mt-4 text-sm",
          trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
        )}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
}
```

#### 3. TabNavigation Component

Pill-style tab navigation with smooth transitions.

```typescript
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 p-2 bg-[#0A0A0A] border border-white/5 rounded-3xl backdrop-blur-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
            activeTab === tab.id
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <div className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </div>
        </button>
      ))}
    </div>
  );
}
```

#### 4. Input Component

Minimal input with floating label.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          setHasValue(!!e.target.value);
          props.onBlur?.(e);
        }}
        className={cn(
          "w-full px-4 py-3 bg-transparent border rounded-2xl",
          "text-white placeholder-transparent",
          "focus:outline-none transition-all duration-300",
          error
            ? "border-red-500/50 focus:border-red-500"
            : "border-white/10 focus:border-white/20"
        )}
      />
      <label
        className={cn(
          "absolute left-4 transition-all duration-300 pointer-events-none",
          "text-zinc-400",
          focused || hasValue
            ? "-top-2 text-xs bg-[#030303] px-2"
            : "top-3 text-sm"
        )}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
```

#### 5. Modal Component

Modal with backdrop blur and smooth animations.

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Page Components

#### Platform Admin Dashboard

```typescript
interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalPitches: number;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  participantCount: number;
  pitchCount: number;
}

function PlatformAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtered organizations
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#030303] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Platform Admin</h1>
          <p className="text-zinc-400 mt-2">Manage all organizations and system settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Organizations"
            value={stats?.totalOrganizations ?? 0}
            subtitle="Active organizations"
          />
          <StatCard
            label="Users"
            value={stats?.totalUsers ?? 0}
            subtitle="Total platform users"
          />
          <StatCard
            label="Pitches"
            value={stats?.totalPitches ?? 0}
            subtitle="Total submissions"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <Input
            label="Search organizations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <OrganizationCard key={org.id} organization={org} />
          ))}
        </div>

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 bg-white text-black px-6 py-4 rounded-2xl shadow-2xl"
        >
          + Create Organization
        </motion.button>
      </div>
    </div>
  );
}
```

#### Organization Detail Page with Tabs

```typescript
function OrganizationDetailPage({ orgId }: { orgId: string }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'programs', label: 'Programs' },
    { id: 'participants', label: 'Participants' },
    { id: 'invitations', label: 'Invitations' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'pitches', label: 'Pitches' }
  ];

  return (
    <div className="min-h-screen bg-[#030303] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Floating Tab Navigation */}
        <div className="sticky top-4 z-30">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <OverviewTab orgId={orgId} />}
            {activeTab === 'programs' && <ProgramsTab orgId={orgId} />}
            {activeTab === 'participants' && <ParticipantsTab orgId={orgId} />}
            {activeTab === 'invitations' && <InvitationsTab orgId={orgId} />}
            {activeTab === 'analytics' && <AnalyticsTab orgId={orgId} />}
            {activeTab === 'pitches' && <PitchesTab orgId={orgId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

## Data Models

### Component Props Interfaces

```typescript
// Stat Card Data
interface StatData {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

// Organization Data
interface OrganizationData {
  id: string;
  name: string;
  type: 'accelerator' | 'incubator' | 'vc' | 'corporate' | 'university';
  status: 'active' | 'inactive';
  participantCount: number;
  pitchCount: number;
  programCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Data
interface AnalyticsData {
  totalPitches: number;
  averageScore: number;
  completionRate: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  pitchTrend: {
    date: string;
    count: number;
  }[];
}

// Pitch Filter Data
interface PitchFilterData {
  programId?: string;
  scoreRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Pitch Card Data
interface PitchCardData {
  id: string;
  title: string;
  score: number;
  category: string;
  submittedAt: Date;
  participantName: string;
  programName: string;
}
```

### State Management

```typescript
// Context for design system theme
interface DesignSystemContext {
  colors: typeof designTokens.colors;
  spacing: typeof designTokens.spacing;
  borderRadius: typeof designTokens.borderRadius;
  typography: typeof designTokens.typography;
}

// Context for admin navigation
interface AdminNavigationContext {
  currentOrg: OrganizationData | null;
  setCurrentOrg: (org: OrganizationData | null) => void;
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

// Toast notification state
interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}
```


## Analytics Dashboard Design

### Chart Components

The analytics dashboard uses monochrome charts with subtle gradients for visual interest while maintaining the minimal aesthetic.

```typescript
// Score Distribution Chart
function ScoreDistributionChart({ data }: { data: AnalyticsData }) {
  return (
    <Card>
      <h3 className="text-xl font-medium mb-6">Score Distribution</h3>
      <div className="space-y-4">
        {data.scoreDistribution.map((item) => (
          <div key={item.range} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{item.range}</span>
              <span className="text-white">{item.count}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / data.totalPitches) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="h-full bg-gradient-to-r from-white/50 to-white/20"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Category Distribution Grid
function CategoryDistributionGrid({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.categoryDistribution.map((category) => (
        <Card key={category.category}>
          <p className="text-sm text-zinc-500 uppercase tracking-wider">
            {category.category}
          </p>
          <p className="text-4xl font-light mt-2">{category.count}</p>
          <p className="text-sm text-zinc-400 mt-1">
            {category.percentage}% of total
          </p>
        </Card>
      ))}
    </div>
  );
}

// Pitch Trend Chart
function PitchTrendChart({ data }: { data: AnalyticsData }) {
  return (
    <Card>
      <h3 className="text-xl font-medium mb-6">Pitch Submissions Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data.pitchTrend}>
          <defs>
            <linearGradient id="pitchGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity={0.3} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0A0A0A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: 'white'
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="white"
            strokeWidth={2}
            fill="url(#pitchGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

### Pitches Filter Component

```typescript
interface FilterPanelProps {
  filters: PitchFilterData;
  onFilterChange: (filters: PitchFilterData) => void;
  programs: { id: string; name: string }[];
}

function PitchesFilterPanel({ filters, onFilterChange, programs }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6"
          >
            {/* Program Filter */}
            <div>
              <label className="text-sm text-zinc-400 uppercase tracking-wider mb-2 block">
                Program
              </label>
              <Select
                value={filters.programId}
                onChange={(value) => onFilterChange({ ...filters, programId: value })}
                options={[
                  { value: '', label: 'All Programs' },
                  ...programs.map(p => ({ value: p.id, label: p.name }))
                ]}
              />
            </div>

            {/* Score Range Filter */}
            <div>
              <label className="text-sm text-zinc-400 uppercase tracking-wider mb-2 block">
                Score Range
              </label>
              <div className="flex gap-4">
                <Input
                  type="number"
                  label="Min"
                  value={filters.scoreRange?.min}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    scoreRange: { ...filters.scoreRange, min: Number(e.target.value) }
                  })}
                />
                <Input
                  type="number"
                  label="Max"
                  value={filters.scoreRange?.max}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    scoreRange: { ...filters.scoreRange, max: Number(e.target.value) }
                  })}
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm text-zinc-400 uppercase tracking-wider mb-2 block">
                Date Range
              </label>
              <div className="flex gap-4">
                <Input
                  type="date"
                  label="Start Date"
                  value={filters.dateRange?.start?.toISOString().split('T')[0]}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: new Date(e.target.value) }
                  })}
                />
                <Input
                  type="date"
                  label="End Date"
                  value={filters.dateRange?.end?.toISOString().split('T')[0]}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: new Date(e.target.value) }
                  })}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => onFilterChange({})}
              className="w-full py-3 text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
```

### Pitch Results Grid

```typescript
function PitchResultsGrid({ pitches }: { pitches: PitchCardData[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pitches.map((pitch, index) => (
        <motion.div
          key={pitch.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card hover onClick={() => router.push(`/pitches/${pitch.id}`)}>
            <div className="space-y-4">
              {/* Score Badge */}
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-white/5 rounded-full">
                  <span className="text-sm text-zinc-400">{pitch.category}</span>
                </div>
                <div className="text-2xl font-light">{pitch.score}</div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-medium line-clamp-2">{pitch.title}</h3>

              {/* Meta Info */}
              <div className="space-y-1 text-sm text-zinc-400">
                <p>{pitch.participantName}</p>
                <p>{pitch.programName}</p>
                <p>{new Date(pitch.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
```

## Loading and Error States

### Skeleton Loaders

```typescript
function StatCardSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="h-16 bg-white/5 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </Card>
  );
}

function OrganizationCardSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="flex gap-4 mt-4">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-8 bg-white/5 rounded w-1/3" />
        </div>
      </div>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-white/5 rounded w-1/3" />
        <div className="h-64 bg-white/5 rounded" />
      </div>
    </Card>
  );
}
```

### Toast Notifications

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 space-y-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              "px-6 py-4 rounded-2xl backdrop-blur-xl border",
              "flex items-center gap-3 min-w-[300px]",
              toast.type === 'success' && "bg-emerald-500/10 border-emerald-500/20",
              toast.type === 'error' && "bg-red-500/10 border-red-500/20",
              toast.type === 'info' && "bg-white/10 border-white/20"
            )}
          >
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### Error States

```typescript
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl">⚠️</div>
        <p className="text-zinc-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300"
          >
            Try Again
          </button>
        )}
      </div>
    </Card>
  );
}

function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <Card>
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl">📭</div>
        <p className="text-zinc-400">{message}</p>
        {action}
      </div>
    </Card>
  );
}
```

## Responsive Design Patterns

### Mobile Navigation

```typescript
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-[#0A0A0A] border border-white/10 rounded-2xl"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="lg:hidden fixed inset-y-0 right-0 w-64 bg-[#0A0A0A] border-l border-white/10 z-40 p-6"
          >
            <nav className="space-y-4">
              {/* Navigation items */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Responsive Grid Patterns

```typescript
// Adaptive grid that changes columns based on viewport
const responsiveGridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

// Adaptive stat cards that stack on mobile
const responsiveStatGrid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";

// Adaptive table that becomes cards on mobile
function ResponsiveTable({ data }: { data: any[] }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          {/* Table content */}
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <Card key={item.id}>
            {/* Card content */}
          </Card>
        ))}
      </div>
    </>
  );
}
```

## Accessibility Implementation

### Keyboard Navigation

```typescript
// Focus management for modals
function useModalFocus(isOpen: boolean) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  return modalRef;
}

// Keyboard shortcuts
function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Open search
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        // Close active modal
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### ARIA Labels and Roles

```typescript
// Accessible tab navigation
function AccessibleTabs({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div role="tablist" aria-label="Organization sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={/* styles */}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Accessible stat card
function AccessibleStatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <div role="region" aria-label={label}>
        <p id={`${label}-label`} className="text-sm text-zinc-500">
          {label}
        </p>
        <p aria-labelledby={`${label}-label`} className="text-8xl font-light">
          {value}
        </p>
      </div>
    </Card>
  );
}
```

## Performance Optimization

### Code Splitting and Lazy Loading

```typescript
// Lazy load tab content
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const ProgramsTab = lazy(() => import('./tabs/ProgramsTab'));
const AnalyticsTab = lazy(() => import('./tabs/AnalyticsTab'));

function OrganizationDetail() {
  return (
    <Suspense fallback={<TabContentSkeleton />}>
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'programs' && <ProgramsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </Suspense>
  );
}

// Lazy load charts
const ChartComponent = lazy(() => import('./charts/ChartComponent'));
```

### Memoization

```typescript
// Memoize expensive calculations
const filteredPitches = useMemo(() => {
  return pitches.filter(pitch => {
    // Filter logic
  });
}, [pitches, filters]);

// Memoize components
const OrganizationCard = memo(({ organization }: { organization: OrganizationData }) => {
  return <Card>{/* content */}</Card>;
});

// Memoize callbacks
const handleFilterChange = useCallback((newFilters: PitchFilterData) => {
  setFilters(newFilters);
}, []);
```

### Debouncing

```typescript
// Debounce search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Perform search with debouncedSearch
  }, [debouncedSearch]);

  return <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

### Virtual Scrolling

```typescript
// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {/* Render item */}
          </div>
        ))}
      </div>
    </div>
  );
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Data Display Properties

**Property 1: Complete organization display**
*For any* set of organizations provided to the dashboard, all organizations should appear in the rendered grid with no omissions.
**Validates: Requirements 4.4, 5.1**

**Property 2: Organization card completeness**
*For any* organization data, the rendered organization card should contain all required fields: name, type, status badge, participant count, and pitch count.
**Validates: Requirements 4.5, 5.2**

**Property 3: Pitch card completeness**
*For any* pitch data, the rendered pitch card should contain all required fields: title, score, category, and submission date.
**Validates: Requirements 8.4**

### Navigation Properties

**Property 4: Card navigation consistency**
*For any* clickable card (organization or pitch), clicking the card should trigger navigation to the corresponding detail page with the correct ID in the URL.
**Validates: Requirements 4.6, 5.3, 8.5**

**Property 5: Tab URL synchronization**
*For any* tab selection in the organization detail page, the URL should update to reflect the active tab, and navigating to a URL with a tab parameter should activate that tab.
**Validates: Requirements 6.6**

### Filtering and Search Properties

**Property 6: Search result accuracy**
*For any* search query, all displayed results should match the search criteria (organization name contains query string), and all matching items should be included in results.
**Validates: Requirements 4.8**

**Property 7: Filter result accuracy**
*For any* combination of filters (program, score range, date range), all displayed pitches should satisfy all active filter criteria, and all pitches matching the criteria should be included.
**Validates: Requirements 8.3**

**Property 8: Analytics program filter**
*For any* program selection in the analytics dashboard, the displayed metrics and charts should only include data from the selected program.
**Validates: Requirements 7.5**

### Tab Behavior Properties

**Property 9: Tab content loading**
*For any* tab in the organization detail page, clicking that tab should load and display its corresponding content.
**Validates: Requirements 6.2**

**Property 10: Active tab highlighting**
*For any* active tab, that tab should have visual distinction (pill-style background) while inactive tabs should not.
**Validates: Requirements 6.4**

### Conditional Rendering Properties

**Property 11: Role-based button visibility**
*For any* user with platform admin role, the create organization button should be visible; for users without platform admin role, the button should not be visible.
**Validates: Requirements 5.4**

**Property 12: Pagination threshold**
*For any* list with more than 50 items, pagination controls should be present; for lists with 50 or fewer items, pagination should not be present.
**Validates: Requirements 14.2**

**Property 13: Virtual scrolling threshold**
*For any* list with more than 100 items, virtual scrolling should be implemented; for lists with 100 or fewer items, standard rendering should be used.
**Validates: Requirements 14.6**

### Form Validation Properties

**Property 14: Validation message display**
*For any* form input with invalid data, inline validation messages should be displayed indicating the validation error.
**Validates: Requirements 9.3**

**Property 15: Submit button loading state**
*For any* form submission in progress, the submit button should display a loading state and be disabled until submission completes.
**Validates: Requirements 9.4**

**Property 16: Form accessibility**
*For any* form input component, proper ARIA labels should be present for screen reader accessibility.
**Validates: Requirements 9.6**

### Component Library Properties

**Property 17: Component className customization**
*For any* reusable component in the component library, it should accept a className prop that applies additional CSS classes without overriding base styles.
**Validates: Requirements 10.6**

### Accessibility Properties

**Property 18: Interactive element ARIA labels**
*For any* interactive element (button, link, input), proper ARIA labels or aria-label attributes should be present.
**Validates: Requirements 13.1**

**Property 19: Keyboard navigation completeness**
*For any* interactive element, it should be reachable and operable using only keyboard navigation (Tab, Enter, Space, Arrow keys).
**Validates: Requirements 13.2**

**Property 20: Focus indicator visibility**
*For any* focusable element, when focused via keyboard, a visible focus indicator should be displayed.
**Validates: Requirements 13.3**

**Property 21: Dynamic content announcements**
*For any* dynamic content change (loading complete, error occurred, data updated), screen reader announcements should be triggered using ARIA live regions.
**Validates: Requirements 13.4**

**Property 22: Color contrast compliance**
*For any* text element, the color contrast ratio between text and background should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
**Validates: Requirements 13.5**

**Property 23: Data table accessibility**
*For any* data table, proper ARIA roles (table, row, cell) and labels should be present for screen reader navigation.
**Validates: Requirements 13.6**

### Responsive Design Properties

**Property 24: Touch target sizing**
*For any* interactive element on mobile viewports (width < 768px), the touch target should be at least 44x44 pixels.
**Validates: Requirements 12.5**

**Property 25: RTL layout support**
*For any* page when language is set to Persian (fa), the layout direction should be right-to-left with appropriate text alignment and element positioning.
**Validates: Requirements 12.6**

### Animation Properties

**Property 26: Reduced motion respect**
*For any* animated element, when the user has prefers-reduced-motion enabled, animations should be disabled or significantly reduced.
**Validates: Requirements 11.6**

**Property 27: Loading state animations**
*For any* content in loading state, pulse animations or skeleton loaders should be displayed.
**Validates: Requirements 11.3, 15.1**

### State Management Properties

**Property 28: Error notification display**
*For any* error that occurs, a toast notification should be displayed in the corner with error details.
**Validates: Requirements 15.2**

**Property 29: Form error display**
*For any* form submission that fails, inline error messages should be displayed on the relevant form fields.
**Validates: Requirements 15.3**

**Property 30: Success notification auto-dismiss**
*For any* success notification displayed, it should automatically dismiss after 3 seconds.
**Validates: Requirements 15.5**

**Property 31: Error notification manual dismiss**
*For any* error notification displayed, the user should be able to manually dismiss it by clicking a close button.
**Validates: Requirements 15.6**

### Performance Properties

**Property 32: Tab content lazy loading**
*For any* inactive tab in the organization detail page, its content should not be loaded or rendered until the tab is activated.
**Validates: Requirements 14.1**

## Error Handling

### Error Categories

1. **Data Fetching Errors**
   - Network failures
   - API errors (4xx, 5xx)
   - Timeout errors
   - Invalid response format

2. **Validation Errors**
   - Form input validation
   - Data type mismatches
   - Required field violations
   - Format violations (email, date, etc.)

3. **Authorization Errors**
   - Insufficient permissions
   - Session expiration
   - Invalid tokens

4. **Client-Side Errors**
   - Component render errors
   - State management errors
   - Browser compatibility issues

### Error Handling Strategies

#### Network Error Handling

```typescript
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        router.push('/login');
        throw new Error('Session expired');
      }
      
      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      
      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}
```

#### Form Validation Error Handling

```typescript
function validateForm(data: FormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Required field validation
  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  // Email format validation
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Custom validation rules
  if (data.score && (data.score < 0 || data.score > 100)) {
    errors.score = 'Score must be between 0 and 100';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

#### Component Error Boundaries

```typescript
class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin panel error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="Something went wrong. Please refresh the page."
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
```

#### Toast Notification System

```typescript
interface ToastManager {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

function useToast(): ToastManager {
  const { addToast } = useToastContext();
  
  return {
    success: (message: string) => {
      addToast({
        id: generateId(),
        type: 'success',
        message,
        duration: 3000
      });
    },
    error: (message: string) => {
      addToast({
        id: generateId(),
        type: 'error',
        message,
        duration: null // Manual dismiss only
      });
    },
    info: (message: string) => {
      addToast({
        id: generateId(),
        type: 'info',
        message,
        duration: 5000
      });
    }
  };
}
```

### Error Recovery Patterns

1. **Retry with Exponential Backoff**
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 1000);
      }
    }
  }
  
  throw lastError!;
}
```

2. **Graceful Degradation**
```typescript
function OrganizationDashboard() {
  const { data, error, isLoading } = useOrganizations();
  
  if (error) {
    // Show error state but allow navigation to other sections
    return (
      <div>
        <ErrorState message="Failed to load organizations" />
        <QuickActions /> {/* Still functional */}
      </div>
    );
  }
  
  if (isLoading) {
    return <OrganizationGridSkeleton />;
  }
  
  return <OrganizationGrid organizations={data} />;
}
```

3. **Optimistic Updates with Rollback**
```typescript
async function updateOrganization(id: string, updates: Partial<Organization>) {
  const previousData = queryClient.getQueryData(['organization', id]);
  
  // Optimistically update UI
  queryClient.setQueryData(['organization', id], (old) => ({
    ...old,
    ...updates
  }));
  
  try {
    await api.updateOrganization(id, updates);
  } catch (error) {
    // Rollback on error
    queryClient.setQueryData(['organization', id], previousData);
    toast.error('Failed to update organization');
    throw error;
  }
}
```

## Testing Strategy

### Dual Testing Approach

The admin panel redesign requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing

Unit tests focus on:
- Specific component rendering examples
- Integration between components
- Edge cases (empty states, error states)
- User interaction flows
- Accessibility features

**Example Unit Tests:**

```typescript
describe('StatCard', () => {
  it('displays the label and value', () => {
    render(<StatCard label="Organizations" value={42} />);
    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
  
  it('displays subtitle when provided', () => {
    render(<StatCard label="Users" value={100} subtitle="Active users" />);
    expect(screen.getByText('Active users')).toBeInTheDocument();
  });
  
  it('displays trend indicator when provided', () => {
    render(<StatCard label="Pitches" value={50} trend={{ value: 10, direction: 'up' }} />);
    expect(screen.getByText('↑ 10%')).toBeInTheDocument();
  });
});

describe('OrganizationCard', () => {
  it('displays all organization fields', () => {
    const org = {
      id: '1',
      name: 'Test Org',
      type: 'accelerator',
      status: 'active',
      participantCount: 25,
      pitchCount: 50
    };
    
    render(<OrganizationCard organization={org} />);
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('accelerator')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
  
  it('navigates to detail page on click', () => {
    const org = { id: '1', name: 'Test Org', /* ... */ };
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });
    
    render(<OrganizationCard organization={org} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPush).toHaveBeenCalledWith('/admin/organizations/1');
  });
});

describe('PitchesFilter', () => {
  it('filters pitches by score range', () => {
    const pitches = [
      { id: '1', score: 85, /* ... */ },
      { id: '2', score: 65, /* ... */ },
      { id: '3', score: 45, /* ... */ }
    ];
    
    render(<PitchesFilter pitches={pitches} />);
    
    // Set score range filter
    fireEvent.change(screen.getByLabelText('Min'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Max'), { target: { value: '90' } });
    
    // Should only show pitches with scores 60-90
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.queryByText('45')).not.toBeInTheDocument();
  });
});
```

### Property-Based Testing

Property tests verify universal properties across many generated inputs. Each property test should run a minimum of 100 iterations.

**Testing Library**: Use `fast-check` for TypeScript/JavaScript property-based testing.

**Property Test Configuration:**
- Minimum 100 iterations per test
- Each test must reference its design document property
- Tag format: `Feature: admin-panel-redesign, Property {number}: {property_text}`

**Example Property Tests:**

```typescript
import fc from 'fast-check';

// Feature: admin-panel-redesign, Property 1: Complete organization display
describe('Property 1: Complete organization display', () => {
  it('displays all organizations in the grid', () => {
    fc.assert(
      fc.property(
        fc.array(organizationArbitrary(), { minLength: 1, maxLength: 50 }),
        (organizations) => {
          const { container } = render(<OrganizationGrid organizations={organizations} />);
          
          // All organizations should be rendered
          organizations.forEach(org => {
            expect(container).toHaveTextContent(org.name);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: admin-panel-redesign, Property 2: Organization card completeness
describe('Property 2: Organization card completeness', () => {
  it('displays all required fields for any organization', () => {
    fc.assert(
      fc.property(
        organizationArbitrary(),
        (organization) => {
          const { container } = render(<OrganizationCard organization={organization} />);
          
          // All required fields should be present
          expect(container).toHaveTextContent(organization.name);
          expect(container).toHaveTextContent(organization.type);
          expect(container).toHaveTextContent(organization.status);
          expect(container).toHaveTextContent(String(organization.participantCount));
          expect(container).toHaveTextContent(String(organization.pitchCount));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: admin-panel-redesign, Property 7: Filter result accuracy
describe('Property 7: Filter result accuracy', () => {
  it('returns only pitches matching all filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(pitchArbitrary(), { minLength: 10, maxLength: 100 }),
        fc.record({
          scoreMin: fc.integer({ min: 0, max: 100 }),
          scoreMax: fc.integer({ min: 0, max: 100 }),
          programId: fc.option(fc.uuid(), { nil: undefined })
        }),
        (pitches, filters) => {
          const filtered = applyPitchFilters(pitches, filters);
          
          // All results should match criteria
          filtered.forEach(pitch => {
            if (filters.scoreMin !== undefined) {
              expect(pitch.score).toBeGreaterThanOrEqual(filters.scoreMin);
            }
            if (filters.scoreMax !== undefined) {
              expect(pitch.score).toBeLessThanOrEqual(filters.scoreMax);
            }
            if (filters.programId) {
              expect(pitch.programId).toBe(filters.programId);
            }
          });
          
          // All matching pitches should be included
          const matchingPitches = pitches.filter(pitch => {
            if (filters.scoreMin !== undefined && pitch.score < filters.scoreMin) return false;
            if (filters.scoreMax !== undefined && pitch.score > filters.scoreMax) return false;
            if (filters.programId && pitch.programId !== filters.programId) return false;
            return true;
          });
          
          expect(filtered.length).toBe(matchingPitches.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: admin-panel-redesign, Property 17: Component className customization
describe('Property 17: Component className customization', () => {
  it('accepts className prop without overriding base styles', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (customClass) => {
          const { container } = render(<Card className={customClass}>Content</Card>);
          const card = container.firstChild as HTMLElement;
          
          // Should have custom class
          expect(card.classList.contains(customClass)).toBe(true);
          
          // Should still have base classes
          expect(card.classList.contains('bg-[#0A0A0A]')).toBe(true);
          expect(card.classList.contains('rounded-3xl')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Arbitrary generators for property tests
function organizationArbitrary() {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    type: fc.constantFrom('accelerator', 'incubator', 'vc', 'corporate', 'university'),
    status: fc.constantFrom('active', 'inactive'),
    participantCount: fc.integer({ min: 0, max: 1000 }),
    pitchCount: fc.integer({ min: 0, max: 5000 }),
    programCount: fc.integer({ min: 0, max: 50 }),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });
}

function pitchArbitrary() {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 200 }),
    score: fc.integer({ min: 0, max: 100 }),
    category: fc.string({ minLength: 1, maxLength: 50 }),
    submittedAt: fc.date(),
    participantName: fc.string({ minLength: 1, maxLength: 100 }),
    programName: fc.string({ minLength: 1, maxLength: 100 }),
    programId: fc.uuid()
  });
}
```

### Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('has no accessibility violations in dashboard', async () => {
    const { container } = render(<PlatformAdminDashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('supports keyboard navigation', () => {
    render(<OrganizationGrid organizations={mockOrgs} />);
    
    const firstCard = screen.getAllByRole('button')[0];
    firstCard.focus();
    expect(firstCard).toHaveFocus();
    
    // Tab to next card
    userEvent.tab();
    const secondCard = screen.getAllByRole('button')[1];
    expect(secondCard).toHaveFocus();
  });
});
```

### Visual Regression Testing

While not part of automated unit/property tests, visual regression testing should be performed:

- Use Chromatic or Percy for visual diffs
- Test at multiple viewport sizes (mobile, tablet, desktop)
- Test in light and dark modes (if applicable)
- Test RTL layout for Persian language
- Test with different data states (empty, loading, error, populated)

### Test Coverage Goals

- Unit test coverage: Minimum 80% for component logic
- Property test coverage: All properties from design document
- Accessibility test coverage: All interactive components
- Integration test coverage: Critical user flows (create org, filter pitches, view analytics)
