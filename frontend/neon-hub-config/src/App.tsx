import React, { useState, useEffect } from 'react';
import './App.css'
import { BrowserRouter as Router } from 'react-router-dom';
import HubManagementUI from './components/HubManagementUI'
import NodeServices from './components/NodeServices';
import ConnectedDevices from './components/ConnectedDevices';
import SystemUpdates from './components/SystemUpdates';
import Header from './components/Header';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <Router>
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
        <Header isDark={isDark} toggleDarkMode={toggleDarkMode} />
        
        <div className="tab-navigation">
          <button onClick={() => setActiveTab('config')}>Configuration</button>
          <button onClick={() => setActiveTab('services')}>Node Services</button>
          <button onClick={() => setActiveTab('devices')}>Connected Devices</button>
          <button onClick={() => setActiveTab('updates')}>System Updates</button>
        </div>

        <div className="content-area">
          {activeTab === 'config' && <HubManagementUI isDark={isDark} />}
          {activeTab === 'services' && <NodeServices isDark={isDark} />}
          {activeTab === 'devices' && <ConnectedDevices isDark={isDark} />}
          {activeTab === 'updates' && <SystemUpdates isDark={isDark} />}
        </div>
      </div>
    </Router>
  )
}

export default App
