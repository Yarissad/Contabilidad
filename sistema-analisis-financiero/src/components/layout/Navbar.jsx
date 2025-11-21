import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard'},
    { path: '/datos-historicos', label: 'Datos Históricos'},
    { path: '/proyecciones', label: 'Proyecciones'},
    { path: '/estacionalidad', label: 'Estacionalidad (IVE)' },
    { path: '/rentabilidad', label: 'Rentabilidad'},
    { path: '/van-tir', label: 'VAN y TIR' },
    // { path: '/razones', label: 'Razones Financieras', icon: '⚖️' }, // DESHABILITADO
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="text-center py-5">
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Análisis Financiero</h1>
          <p className="text-md text-blue-100 opacity-90 mt-1">Gestión Inteligente de Datos</p>
        </div>

        <div className="flex space-x-2 pb-2 overflow-x-auto scrollbar-hide justify-center">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-t-xl transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                location.pathname === item.path
                  ? 'bg-white text-indigo-700 font-bold shadow-lg scale-105'
                  : 'hover:bg-white hover:bg-opacity-20 hover:shadow-md'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
