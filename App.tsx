
import React, { useState, useEffect } from 'react';
import { Nav } from './components/Nav';
import { Dashboard } from './components/views/Dashboard';
import { MenuManager } from './components/views/MenuManager';
import { SalesEntry } from './components/views/SalesEntry';
import { Expenses } from './components/views/Expenses';
import { Receivables } from './components/views/Receivables';
import { Reports } from './components/views/Reports';
import { AIInsights } from './components/views/AIInsights';
import { CostCalculator } from './components/views/CostCalculator';
import { MenuItem, SaleEntry, ExpenseEntry } from './types';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  // ------------------------------------------------------------------
  // DATA STATE
  // ------------------------------------------------------------------
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);

  // ------------------------------------------------------------------
  // INITIALIZATION & SYNC
  // ------------------------------------------------------------------

  useEffect(() => {
    const init = async () => {
      const connected = supabaseService.init();
      setIsConnected(connected);

      if (connected) {
        // Load from Cloud
        try {
          const [dbMenu, dbSales, dbExpenses] = await Promise.all([
            supabaseService.fetchMenu(),
            supabaseService.fetchSales(),
            supabaseService.fetchExpenses()
          ]);
          setMenuItems(dbMenu);
          setSales(dbSales);
          setExpenses(dbExpenses);
        } catch (e) {
          console.error("Error fetching data", e);
        }
      } else {
        // Load from LocalStorage
        const savedMenu = localStorage.getItem('menuItems');
        const savedSales = localStorage.getItem('sales');
        const savedExpenses = localStorage.getItem('expenses');

        setMenuItems(savedMenu ? JSON.parse(savedMenu) : [
          { id: '1', name: 'Vazhaikkai Podimas', category: 'Side Dish', price: 193, myShare: 68, sheroShare: 125 },
          { id: '2', name: 'Beans Poriyal', category: 'Side Dish', price: 202, myShare: 72, sheroShare: 130 }
        ]);
        setSales(savedSales ? JSON.parse(savedSales) : []);
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      }
      setLoading(false);
    };

    // Slight delay to ensure CDN script loads
    setTimeout(init, 500);
  }, []);

  // ------------------------------------------------------------------
  // DATA PERSISTENCE HANDLERS
  // ------------------------------------------------------------------
  
  useEffect(() => {
    if (!isConnected && !loading) {
      localStorage.setItem('menuItems', JSON.stringify(menuItems));
      localStorage.setItem('sales', JSON.stringify(sales));
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [menuItems, sales, expenses, isConnected, loading]);


  // ------------------------------------------------------------------
  // ACTION HANDLERS (Hybrid)
  // ------------------------------------------------------------------

  const handleUpdateMenu = async (items: MenuItem[]) => {
    setMenuItems(items);
  };

  // WRAPPERS for Menu
  const saveMenuItem = async (item: MenuItem) => {
    if (isConnected) await supabaseService.upsertMenuItem(item);
    setMenuItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      return idx >= 0 ? prev.map(i => i.id === item.id ? item : i) : [...prev, item];
    });
  };
  const deleteMenuItem = async (id: string) => {
    if (isConnected) await supabaseService.deleteMenuItem(id);
    setMenuItems(prev => prev.filter(i => i.id !== id));
  };
  const bulkAddMenuItems = async (items: MenuItem[]) => {
    if (isConnected) {
       await Promise.all(items.map(i => supabaseService.upsertMenuItem(i)));
    }
    setMenuItems(prev => [...prev, ...items]);
  };

  // WRAPPERS for Sales
  const saveSale = async (sale: SaleEntry) => {
    if (isConnected) await supabaseService.upsertSale(sale);
    setSales(prev => {
      const idx = prev.findIndex(s => s.id === sale.id);
      return idx >= 0 ? prev.map(s => s.id === sale.id ? sale : s) : [sale, ...prev];
    });
  };
  const deleteSale = async (id: string) => {
    if (isConnected) await supabaseService.deleteSale(id);
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // WRAPPERS for Expenses
  const saveExpense = async (exp: ExpenseEntry) => {
    if (isConnected) await supabaseService.upsertExpense(exp);
    setExpenses(prev => {
      const idx = prev.findIndex(e => e.id === exp.id);
      return idx >= 0 ? prev.map(e => e.id === exp.id ? exp : e) : [exp, ...prev];
    });
  };
  const deleteExpense = async (id: string) => {
    if (isConnected) await supabaseService.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ------------------------------------------------------------------
  // ROUTING
  // ------------------------------------------------------------------

  const renderView = () => {
    if (loading) return <div className="flex h-screen items-center justify-center text-stone-500">Loading data...</div>;

    switch(currentView) {
      case 'dashboard': return <Dashboard sales={sales} expenses={expenses} />;
      case 'menu': return <MenuManager menuItems={menuItems} onSave={saveMenuItem} onDelete={deleteMenuItem} onBulkAdd={bulkAddMenuItems} />;
      case 'sales_entry': return <SalesEntry sales={sales} menuItems={menuItems} onSave={saveSale} onDelete={deleteSale} />;
      case 'expenses': return <Expenses expenses={expenses} onSave={saveExpense} onDelete={deleteExpense} />;
      // Pass menuItems, onSave, onDelete to Receivables for CRUD
      case 'receivables': return <Receivables sales={sales} menuItems={menuItems} onSave={saveSale} onDelete={deleteSale} />;
      case 'calculator': return <CostCalculator />;
      case 'reports': return <Reports sales={sales} expenses={expenses} />;
      case 'ai': return <AIInsights sales={sales} expenses={expenses} />;
      default: return <Dashboard sales={sales} expenses={expenses} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 font-sans text-stone-900">
      <Nav currentView={currentView} setView={setCurrentView} />
      
      {/* Adjusted margin to account for collapsed sidebar (handled via CSS/JS mostly but added transition class on Nav, so here we use a safe margin for mobile or base desktop) */}
      {/* We need to dynamically adjust margin based on collapse state if we want perfection, but simpler to just use a larger margin or flex. 
          The Nav component uses 'fixed', so main needs margin. 
          Let's assume default expanded for simplicity in CSS structure or use 'md:pl-20' / 'md:pl-64' if we passed state up.
          To keep it simple without passing state up deeply: I will make the Nav position:sticky or similar, OR just rely on the 'md:ml-64' class being standard. 
          Actually, since Nav manages its own state, the Main content won't know to expand. 
          FIX: Let's remove the margin from Main and put the Nav and Main in a Flex Row container. */}
      
      {/* Since Nav is fixed in previous code, let's keep it fixed but we can't easily animate the main content width without lifting state. 
          For now, I'll stick to standard margin. If the user collapses, there will be whitespace. 
          To do it properly, I'll modify the layout structure below to use Flex instead of fixed positioning for the sidebar. */}

      <div className="flex w-full">
         {/* Nav is self-contained. I will modify Nav to NOT be fixed, but sticky or relative, OR accept a callback to notify parent. 
             Actually, easiest way: The Nav component previously had 'fixed'. I will change Nav to be 'sticky' h-screen. */}
         
         <div className="flex-none z-50">
           <Nav currentView={currentView} setView={setCurrentView} />
         </div>

         <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0 w-full">
            <div className="max-w-6xl mx-auto">
              {renderView()}
            </div>
         </main>
      </div>
    </div>
  );
};

export default App;
