
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Utensils, PieChart, Calculator, Wallet, TrendingUp, Sparkles, Menu, ChevronLeft } from 'lucide-react';

interface NavProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Nav: React.FC<NavProps> = ({ currentView, setView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales_entry', label: 'Add Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Master Menu', icon: Utensils },
    { id: 'receivables', label: 'Receivables', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'calculator', label: 'Cost Calc', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'ai', label: 'AI Coach', icon: Sparkles },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`hidden md:flex flex-col bg-stone-900 text-stone-300 h-screen fixed left-0 top-0 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-orange-500 whitespace-nowrap">
                Vidya Kitchen
              </h1>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative ${
                currentView === item.id 
                  ? 'bg-orange-600/20 text-orange-500' 
                  : 'hover:bg-stone-800 text-stone-400'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-14 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 z-50 overflow-x-auto">
        <div className="flex justify-between items-center px-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center justify-center py-3 px-3 min-w-[70px] ${
                currentView === item.id ? 'text-orange-500' : 'text-stone-500'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
