import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const MOBILE_BREAKPOINT = 769;

export const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      
      <div 
        className={`
          flex flex-col flex-1 overflow-hidden
          ${isMobile ? 'w-full' : 'w-[calc(100vw-250px)]'}
          transition-all duration-200
        `}
      >
        <Header
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />
        
        <main className="flex-1 overflow-auto bg-bg-base">
          <Outlet />
        </main>
      </div>
    </div>
  );
};