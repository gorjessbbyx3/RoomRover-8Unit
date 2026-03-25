import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/status-badge';
import { DashboardStats, RoomWithDetails, CleaningTaskWithDetails, PropertyWithRooms } from '@/lib/types';
import { useLocation } from 'wouter';
import {
  CheckCircle,
  Clock,
  Bed,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Fan,
  HandCoins,
  Key,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  UserPlus,
  LogIn,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import FrontDoorManager from '@/components/front-door-manager';
import AddTaskDialog from '@/components/add-task-dialog';

const fetchWithAuth = async (url: string) => {
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
};

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => fetchWithAuth('/api/dashboard/stats'),
    refetchInterval: 30000,
    staleTime: 5000,
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery<RoomWithDetails[]>({
    queryKey: ['/api/rooms'],
    queryFn: () => fetchWithAuth('/api/rooms'),
    refetchInterval: 30000,
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<PropertyWithRooms[]>({
    queryKey: ['/api/properties'],
    queryFn: () => fetchWithAuth('/api/properties'),
    refetchInterval: 30000,
  });

  const { data: cleaningTasks, isLoading: tasksLoading } = useQuery<CleaningTaskWithDetails[]>({
    queryKey: ['/api/cleaning-tasks'],
    queryFn: () => fetchWithAuth('/api/cleaning-tasks'),
    refetchInterval: 30000,
  });

  const { data: inquiries } = useQuery<any[]>({
    queryKey: ['/api/inquiries'],
    queryFn: () => fetchWithAuth('/api/inquiries'),
    refetchInterval: 60000,
  });

  if (!user) return null;

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const pendingTasks = cleaningTasks?.filter(t => t.status === 'pending') || [];
  const highPriorityTasks = pendingTasks.filter(t => ['high', 'critical'].includes(t.priority));

  const occupiedRooms = rooms?.filter(r => r.status === 'occupied') || [];
  const availableRooms = rooms?.filter(r => r.status === 'available') || [];
  const cleaningRooms = rooms?.filter(r => r.status === 'cleaning') || [];
  const maintenanceRooms = rooms?.filter(r => r.status === 'maintenance') || [];
  const totalRooms = rooms?.length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms.length / totalRooms) * 100) : 0;

  const propertiesWithRooms: PropertyWithRooms[] = properties?.map(p => ({
    ...p,
    rooms: rooms?.filter(r => r.propertyId === p.id) || [],
  })) || [];

  const recentInquiries = (inquiries || [])
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

      {/* ═══════════ HERO HEADER ═══════════ */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5f5f 50%, #3a7565 100%)' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <MapPin className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {greeting}, {user.name}
                </h1>
                <p className="text-white/50 text-sm mt-0.5 flex items-center gap-1.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  <span className="text-white/30">&middot;</span>
                  <span className="text-amber-300/80">{user.role === 'admin' ? 'All Properties' : user.property || '934 Kapahulu'}</span>
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white/8 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-white/60">System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setLocation('/inhouse')}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 h-9 text-xs font-medium"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" /> Check In / Out
            </Button>
            <Button
              size="sm"
              onClick={() => setLocation('/inquiries')}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 h-9 text-xs font-medium"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Inquiries
              {recentInquiries.filter((i: any) => i.status === 'received').length > 0 && (
                <span className="ml-1.5 bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {recentInquiries.filter((i: any) => i.status === 'received').length}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setLocation('/payments')}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 h-9 text-xs font-medium"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Payments
            </Button>
            {(user.role === 'admin' || user.role === 'manager') && (
              <AddTaskDialog
                trigger={
                  <Button size="sm" className="rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/20 h-9 text-xs font-medium">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> New Task
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">

        {/* ═══════════ STAT CARDS ═══════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Occupancy */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Occupancy</span>
              </div>
              {statsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">{occupancyRate}%</span>
                  <span className="text-[11px] text-slate-400 mb-1">{occupiedRooms.length}/{totalRooms}</span>
                </div>
              )}
              <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-700" style={{ width: `${occupancyRate}%` }} />
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Available</span>
              </div>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">{availableRooms.length}</span>
              )}
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">Ready for guests</p>
            </div>
          </div>

          {/* Active Guests */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Guests</span>
              </div>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">{stats?.activeBookings || 0}</span>
              )}
              <p className="text-[11px] text-violet-600 mt-1 font-medium">Active guests</p>
            </div>
          </div>

          {/* Revenue Today */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today</span>
              </div>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">{fmt(stats?.todayRevenue || 0)}</span>
              )}
              {stats?.paymentMethodBreakdown && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Cash {fmt(stats.paymentMethodBreakdown.cash || 0)} &middot; App {fmt(stats.paymentMethodBreakdown.cashApp || 0)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════ ROOM MAP + SIDEBAR ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

          {/* Room Status Map — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Room Status</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live overview across properties</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Available</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Occupied</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Cleaning</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Maint.</span>
              </div>
            </div>
            <div className="p-5">
              {roomsLoading || propertiesLoading ? (
                <div className="grid grid-cols-2 gap-4"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
              ) : (
                <div className="space-y-5">
                  {propertiesWithRooms
                    .filter(p => user.role === 'admin' || user.property === p.id)
                    .map(property => (
                    <div key={property.id}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-700">{property.name}</h3>
                        <span className="text-[11px] text-slate-400 ml-1">
                          {property.rooms.filter(r => r.status === 'occupied').length}/{property.rooms.length} occupied
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {property.rooms.map(room => {
                          const colors = room.status === 'available' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            room.status === 'occupied' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            room.status === 'cleaning' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            'bg-red-50 border-red-200 text-red-700';
                          return (
                            <div
                              key={room.id}
                              className={`${colors} border rounded-xl p-2.5 text-center cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
                              title={`${room.roomNumber} - ${room.status}`}
                            >
                              <div className="text-xs font-bold">{room.roomNumber}</div>
                              <div className="text-[10px] opacity-70 capitalize mt-0.5">{room.status}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar — Alerts + Recent Inquiries */}
          <div className="space-y-4">

            {/* Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> Alerts
                </h2>
              </div>
              <div className="p-3.5 space-y-2.5">
                {statsLoading ? <Skeleton className="h-14" /> : (
                  <>
                    {(stats?.overduePaymentsCount || 0) > 0 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-red-50 rounded-xl border border-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">{stats?.overduePaymentsCount} Overdue</p>
                          <p className="text-xs text-red-600">{fmt(stats?.overduePaymentsAmount || 0)} outstanding</p>
                        </div>
                      </div>
                    )}
                    {(stats?.pendingPaymentsCount || 0) > 0 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                        <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">{stats?.pendingPaymentsCount} Pending</p>
                          <p className="text-xs text-amber-600">{fmt(stats?.pendingPaymentsAmount || 0)} awaiting</p>
                        </div>
                      </div>
                    )}
                    {highPriorityTasks.length > 0 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                        <Fan className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">{highPriorityTasks.length} Urgent Tasks</p>
                          <p className="text-xs text-orange-600">Requires immediate attention</p>
                        </div>
                      </div>
                    )}
                    {(stats?.overduePaymentsCount || 0) === 0 && (stats?.pendingPaymentsCount || 0) === 0 && highPriorityTasks.length === 0 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">All Clear</p>
                          <p className="text-xs text-emerald-600">No issues right now</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" /> Recent Inquiries
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/inquiries')}
                  className="text-xs text-slate-400 hover:text-slate-600 h-7 px-2"
                >
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <div className="p-3.5">
                {recentInquiries.length > 0 ? (
                  <div className="space-y-2">
                    {recentInquiries.map((inquiry: any) => {
                      const statusColor = inquiry.status === 'received' ? 'bg-blue-100 text-blue-700' :
                        inquiry.status === 'payment_confirmed' ? 'bg-amber-100 text-amber-700' :
                        inquiry.status === 'booking_confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600';
                      return (
                        <div key={inquiry.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">{inquiry.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{inquiry.preferredPlan} &middot; {new Date(inquiry.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`${statusColor} text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ml-2`}>
                            {inquiry.status.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-200" />
                    <p className="text-xs text-slate-400">No inquiries yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">System Status</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Payments</span>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Cleaning Queue</span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{cleaningRooms.length} rooms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Maintenance</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${maintenanceRooms.length > 0 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
                    {maintenanceRooms.length > 0 ? `${maintenanceRooms.length} issues` : 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ TASKS + CASH DRAWER ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Pending Tasks</h2>
                <p className="text-xs text-slate-400 mt-0.5">{pendingTasks.length} tasks &middot; {highPriorityTasks.length} high priority</p>
              </div>
              {(user.role === 'admin' || user.role === 'manager') && (
                <AddTaskDialog
                  trigger={
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-8 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  }
                />
              )}
            </div>
            <div className="p-4">
              {tasksLoading ? (
                <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
              ) : pendingTasks.length > 0 ? (
                <div className="space-y-2">
                  {pendingTasks.slice(0, 5).map(task => (
                    <div
                      key={task.id}
                      className={`rounded-xl p-3 border transition-colors ${
                        task.priority === 'critical' ? 'bg-red-50/50 border-red-200' :
                        task.priority === 'high' ? 'bg-amber-50/50 border-amber-200' :
                        'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate">{task.title}</h4>
                          {task.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>}
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </span>
                        </div>
                        <StatusBadge status={task.priority} type="priority" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-200" />
                  <p className="text-sm text-slate-400">All clear — no pending tasks</p>
                </div>
              )}
            </div>
          </div>

          {/* Cash Drawer (Admin) or Front Door (Manager) */}
          {user.role === 'admin' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HandCoins className="h-4 w-4 text-amber-500" /> Cash Drawer
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time manager holdings</p>
              </div>
              <div className="p-4">
                {statsLoading ? (
                  <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
                ) : stats?.cashDrawerStats && stats.cashDrawerStats.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[11px] text-slate-400">Total Holdings</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">
                          {fmt(stats.cashDrawerStats.reduce((s, d) => s + d.currentCashHolding, 0))}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[11px] text-slate-400">Today's Collections</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">
                          {fmt(stats.cashDrawerStats.reduce((s, d) => s + d.totalCashCollectedToday, 0))}
                        </p>
                      </div>
                    </div>
                    {stats.cashDrawerStats.map(d => (
                      <div key={d.managerId} className="rounded-xl p-3 border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{d.managerName}</p>
                            <p className="text-xs text-slate-400">{d.property}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            d.currentCashHolding > 200 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {fmt(d.currentCashHolding)}
                          </span>
                        </div>
                        {d.currentCashHolding > 200 && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600">
                            <AlertTriangle className="h-3 w-3" /> Consider requesting turn-in
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <HandCoins className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm text-slate-400">No active cash holdings</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-400" /> Front Door Codes
                </h2>
              </div>
              <div className="p-4">
                {propertiesLoading ? <Skeleton className="h-20" /> : <FrontDoorManager properties={properties || []} />}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ FRONT DOOR (Admin) ═══════════ */}
        {user.role === 'admin' && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-400" /> Front Door Code Management
              </h2>
            </div>
            <div className="p-5">
              {propertiesLoading ? <Skeleton className="h-20" /> : <FrontDoorManager properties={properties || []} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
