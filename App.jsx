import React from 'react';
import { useTranslation } from 'react-i18next';
import LaborManagement from './components/LaborManagement';

function App() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <div style={{ padding: '10px', textAlign: 'center', background: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
        <button style={{ margin: '0 5px' }} onClick={() => changeLanguage('en')}>English</button>
        <button style={{ margin: '0 5px' }} onClick={() => changeLanguage('hi')}>हिन्दी</button>
        <button style={{ margin: '0 5px' }} onClick={() => changeLanguage('bn')}>বাংলা</button>
      </div>
      <div className="p-4"><LaborManagement /></div>
    </div>
  );
}

export default App;