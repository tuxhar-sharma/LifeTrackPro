import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'LifeTrack Pro | High-Performance Life & Financial Telemetry',
  '/login': 'LifeTrack Pro | Sign In',
  '/register': 'LifeTrack Pro | Create Account',
  '/app': 'LifeTrack Pro | Dashboard',
  '/app/dashboard': 'LifeTrack Pro | Dashboard',
  '/app/expenses': 'LifeTrack Pro | Financial Ledger',
  '/app/income': 'LifeTrack Pro | Income & Inflow Streams',
  '/app/habits': 'LifeTrack Pro | Discipline & Habits',
  '/app/analytics': 'LifeTrack Pro | Financial Analytics & Cash Flow',
  '/app/settings': 'LifeTrack Pro | Settings',
};

export const RouteTitleSynchronizer: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const matchedTitle = ROUTE_TITLES[pathname] || 'LifeTrack Pro | Telemetry OS';
    document.title = matchedTitle;
  }, [location]);

  return null;
};
