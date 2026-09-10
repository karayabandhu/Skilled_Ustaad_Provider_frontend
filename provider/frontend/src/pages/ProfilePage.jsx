import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getProviderProfile } from "../services/api";
import { getIncompleteRegistrationStep } from "../utils/registration";
import { Loader2 } from "lucide-react";

const ProfilePage = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkRegistrationStatus = async () => {
      try {
        setChecking(true);
        const res = await getProviderProfile();
        if (!isMounted) return;

        const provider = res.data?.provider || res.provider || res;
        if (provider) {
          const incompleteStep = getIncompleteRegistrationStep(provider);
          if (incompleteStep) {
            // User hasn't completed all registration steps. Redirect to the correct step.
            navigate(`/register?step=${incompleteStep}`, { replace: true });
            return;
          }
        }
        setChecking(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to check provider registration completeness:", err);
        // Fallback: if server checks fail due to unauthorized or token issues, let application security handle it.
        setChecking(false);
      }
    };

    checkRegistrationStatus();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex w-full bg-indigo-50/50 dark:bg-[#070b14] min-h-screen relative transition-colors duration-500 overflow-x-hidden">
        {/* Sidebar Skeleton */}
        <div className="fixed top-16 left-0 h-[calc(100vh-64px)] z-50 bg-white dark:bg-gray-950 lg:translate-x-0 lg:w-56 overflow-y-hidden border-r border-slate-100 dark:border-gray-800 p-6 hidden lg:flex flex-col gap-4">
          <div className="w-full h-10 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse mb-6"></div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full h-8 bg-slate-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
        
        {/* Main Content Skeleton */}
        <main className="flex-1 w-full lg:ml-56 p-4 md:p-8 pt-8 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 animate-pulse font-medium text-sm">Verifying account registration status...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex w-full bg-indigo-50/50 dark:bg-[#070b14] min-h-screen relative transition-colors duration-500 overflow-x-hidden">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, sliding on mobile */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-64px)] z-50 transition-transform duration-300 ease-in-out bg-white dark:bg-gray-950
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-56 overflow-y-hidden
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content - Page scrolls normally, content starts after fixed header */}
      <main className="flex-1 w-full lg:ml-56 p-4 md:p-8 pt-8 min-h-[calc(100vh-64px)]">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
