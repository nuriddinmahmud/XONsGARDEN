import {
  BarChart3,
  BatteryCharging,
  Droplets,
  Gauge,
  HandCoins,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Tractor,
  Truck,
  Users,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'
import type { NavItem } from '../types'

export const navigationItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workers', label: 'Ishchilar', icon: Users },
  { path: '/food', label: 'Oziq-ovqat', icon: UtensilsCrossed },
  { path: '/fertilizer', label: "O'g'it", icon: Tractor },
  { path: '/transport', label: 'Transport', icon: Truck },
  { path: '/energy', label: 'Energiya', icon: BatteryCharging },
  { path: '/oil', label: "Yog'", icon: Droplets },
  { path: '/remont', label: 'Remont', icon: Wrench },
  { path: '/tax', label: 'Soliq', icon: HandCoins },
  { path: '/drainage', label: 'Drenaj', icon: Gauge },
  { path: '/debts', label: 'Qarzdorlik', icon: ReceiptText },
  { path: '/reports', label: 'Hisobotlar', icon: BarChart3 },
  { path: '/settings', label: 'Sozlamalar', icon: Settings },
]
