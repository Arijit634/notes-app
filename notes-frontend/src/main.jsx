import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import store from './store';

// Add toast custom properties to CSS
const toastVariables = `
  :root {
    --toast-bg: #ffffff;
    --toast-color: #1f2937;
    --toast-border: #e5e7eb;
  }
  
  [data-theme="dark"] {
    --toast-bg: #1f2937;
    --toast-color: #f9fafb;
    --toast-border: #374151;
  }
`;

// Inject toast styles
const style = document.createElement('style');
style.textContent = toastVariables;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
