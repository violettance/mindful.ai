import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DailyMood from './pages/DailyMood';
import TriggerLog from './pages/TriggerLog';
import CycleTracker from './pages/CycleTracker';
import QuarterlyOutput from './pages/QuarterlyOutput';
import AnnualPlan from './pages/AnnualPlan';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import VoiceSession from './pages/VoiceSession';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DailyMood />} />
          <Route path="/voice" element={<VoiceSession />} />
          <Route path="/triggers" element={<TriggerLog />} />
          <Route path="/cycle" element={<CycleTracker />} />
          <Route path="/outputs" element={<QuarterlyOutput />} />
          <Route path="/annual" element={<AnnualPlan />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;