import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  FireIcon,
  ScaleIcon,
  FlagIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  ChartBarIcon as ChartBarSolid,
  FireIcon as FireSolid,
  ScaleIcon as ScaleSolid,
  FlagIcon as FlagSolid,
  UserIcon as UserSolid,
  UsersIcon as UsersSolid
} from '@heroicons/react/24/solid';

import { useAuthStore } from '../store/useAuthStore';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isCoach } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Navigation pour les élèves
  const studentNavigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeSolid,
      current: location.pathname === '/'
    },
    {
      name: 'Nutrition',
      href: '/nutrition',
      icon: ChartBarIcon,
      iconSolid: ChartBarSolid,
      current: location.pathname === '/nutrition'
    },
    {
      name: 'Exercices',
      href: '/exercise',
      icon: FireIcon,
      iconSolid: FireSolid,
      current: location.pathname === '/exercise'
    },
    {
      name: 'Mesures',
      href: '/measurements',
      icon: ScaleIcon,
      iconSolid: ScaleSolid,
      current: location.pathname === '/measurements'
    },
    {
      name: 'Objectifs',
      href: '/goals',
      icon: FlagIcon,
      iconSolid: FlagSolid,
      current: location.pathname === '/goals'
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: UserIcon,
      iconSolid: UserSolid,
      current: location.pathname === '/profile'
    },
  ];

  // Navigation pour les coachs
  const coachNavigation = [
    {
      name: 'Dashboard Coach',
      href: '/coach',
      icon: HomeIcon,
      iconSolid: HomeSolid,
      current: location.pathname === '/coach'
    },
    {
      name: 'Mes Élèves',
      href: '/coach/students',
      icon: UsersIcon,
      iconSolid: UsersSolid,
      current: location.pathname === '/coach/students'
    },
    {
      name: 'Mon Profil',
      href: '/profile',
      icon: UserIcon,
      iconSolid: UserSolid,
      current: location.pathname === '/profile'
    },
  ];

  const navigation = isCoach() ? coachNavigation : studentNavigation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <img src="/logo192.png" alt="InShape Logo" className="h-8 w-8 mr-2" />
                  <span className="text-2xl font-bold text-primary-600">InShape</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${item.current
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-left text-sm text-gray-600 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img src="/logo192.png" alt="InShape Logo" className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold text-primary-600">InShape</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${item.current
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-left text-sm text-gray-600 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <img src="/logo192.png" alt="InShape Logo" className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold text-primary-600">InShape</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 