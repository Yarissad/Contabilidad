import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinancialProvider } from './context/FinancialContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import DatosHistoricos from './pages/DatosHistoricos';
import Proyecciones from './pages/Proyecciones';
import Estacionalidad from './pages/Estacionalidad';
import Rentabilidad from './pages/Rentabilidad';
import VanTir from './pages/VanTir';
// import RazonesFinancieras from './pages/RazonesFinancieras'; // DESHABILITADO

function App() {
  return (
    <FinancialProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datos-historicos" element={<DatosHistoricos />} />
              <Route path="/proyecciones" element={<Proyecciones />} />
              <Route path="/estacionalidad" element={<Estacionalidad />} />
              <Route path="/rentabilidad" element={<Rentabilidad />} />
              <Route path="/van-tir" element={<VanTir />} />
              {/* <Route path="/razones" element={<RazonesFinancieras />} /> */} {/* DESHABILITADO */}
            </Routes>
          </main>
        </div>
      </Router>
    </FinancialProvider>
  );
}

export default App;
