import { NavLink } from 'react-router-dom'
import {
  Compass,
  Home,
  LayoutDashboard,
  LogIn,
  PlusSquare,
  Shield,
  UserCircle,
  UserPlus,
} from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import { isAdminUser, isCreatorCapable } from '../../lib/apiHelpers'

function NavItem({ to, label, icon: Icon, end, emphasize }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition sm:text-[11px]',
          emphasize
            ? 'text-navy-950'
            : isActive
              ? 'text-navy-950'
              : 'text-navy-400 hover:text-navy-600',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-xl transition sm:h-9 sm:w-9',
              emphasize ? 'rounded-2xl bg-navy-950 text-white shadow-md shadow-navy-900/25' : '',
              !emphasize && isActive ? 'bg-navy-50 text-navy-950' : '',
              !emphasize && !isActive ? 'text-current' : '',
            ].join(' ')}
          >
            <Icon className="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6" strokeWidth={isActive || emphasize ? 2.25 : 2} />
          </span>
          <span className="max-w-[4.25rem] truncate sm:max-w-[5rem]">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const creator = isCreatorCapable(user)
  const admin = isAdminUser(user)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy-100 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 sm:max-w-2xl sm:px-2">
        {!isAuthenticated ? (
          <>
            <NavItem to="/" label="Home" icon={Home} end />
            <NavItem to="/explore" label="Explore" icon={Compass} end />
            <NavItem to="/login" label="Log in" icon={LogIn} />
            <NavItem to="/register" label="Join" icon={UserPlus} />
          </>
        ) : creator ? (
          <>
            <NavItem to="/explore" label="Explore" icon={Compass} end />
            <NavItem to="/creator" label="Studio" icon={LayoutDashboard} end />
            <NavItem to="/creator/upload" label="New" icon={PlusSquare} emphasize />
            {admin ? <NavItem to="/admin" label="Admin" icon={Shield} end /> : null}
            <NavItem to="/profile" label="Profile" icon={UserCircle} end />
          </>
        ) : (
          <>
            <NavItem to="/" label="Home" icon={Home} end />
            <NavItem to="/explore" label="Explore" icon={Compass} end />
            {admin ? <NavItem to="/admin" label="Admin" icon={Shield} end /> : null}
            <NavItem to="/profile" label="Profile" icon={UserCircle} end />
          </>
        )}
      </div>
    </nav>
  )
}
