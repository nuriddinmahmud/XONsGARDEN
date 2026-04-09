import {
  BarChart3,
  BatteryCharging,
  Droplets,
  Gauge,
  HandCoins,
  LayoutDashboard,
  Settings,
  Tractor,
  Truck,
  Users,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'
import type { NavItem } from '../types'

export const navigationItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', description: "Umumiy ko'rsatkichlar", icon: LayoutDashboard },
  { path: '/workers', label: 'Ishchilar', description: 'Ish haqi va brigada nazorati', icon: Users },
  { path: '/food', label: 'Oziq-ovqat', description: 'Kunlik ovqatlanish xarajatlari', icon: UtensilsCrossed },
  { path: '/fertilizer', label: "O'g'it", description: 'Mineral va organik resurslar', icon: Tractor },
  { path: '/transport', label: 'Transport', description: 'Logistika va tashish oqimi', icon: Truck },
  { path: '/energy', label: 'Energiya', description: "Elektr va quvvat to'lovlari", icon: BatteryCharging },
  { path: '/oil', label: "Yog'", description: 'Moylash va servis materiali', icon: Droplets },
  { path: '/remont', label: 'Remont', description: "Ta'mirlash va texnik xizmat", icon: Wrench },
  { path: '/tax', label: 'Soliq', description: "Majburiy to'lovlar va yig'imlar", icon: HandCoins },
  { path: '/drainage', label: 'Drenaj', description: "Suv yo'lagi va kanal ishlari", icon: Gauge },
  { path: '/reports', label: 'Hisobotlar', description: 'Analitika va xarajat trendi', icon: BarChart3 },
  { path: '/settings', label: 'Sozlamalar', description: "Profil va loyiha ma'lumotlari", icon: Settings },
]
