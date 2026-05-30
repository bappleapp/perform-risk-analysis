import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/views/Dashboard';
import { AnalysisWizard } from './components/views/AnalysisWizard';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B3D6B',
      light: '#1E6CB3',
      dark: '#082947',
    },
    secondary: {
      main: '#D43A2F',
      light: '#E06666',
      dark: '#A52A2A',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#0B3D6B',
    },
    h6: {
      fontWeight: 600,
      color: '#0B3D6B',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/perform-risk-analysis">
        <div className="min-h-screen bg-gray-50 print:bg-white">
          <div className="container mx-auto px-4">
            <div className="print:hidden"><Header /></div>
            <main className="py-8 print:py-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis" element={<AnalysisWizard />} />
              <Route path="/analysis/:id" element={<AnalysisWizard />} />
            </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#0B3D6B',
//     },
//     secondary: {
//       main: '#D43A2F',
//     },
//   },
// });

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-blue-900 mb-4">
//             PErForM Risk Analysis Tool
//           </h1>
//           <p className="text-gray-600 text-lg">
//             React is working! Now let's fix the components...
//           </p>
//           <div className="mt-6 p-4 bg-green-100 rounded-lg">
//             <p className="text-green-800 font-semibold">
//               ✅ Basic setup is working!
//             </p>
//           </div>
//         </div>
//       </div>
//     </ThemeProvider>
//   );
// }

// export default App;