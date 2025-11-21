import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/datos-historicos', label: 'Datos Históricos', icon: '📈' },
    { path: '/proyecciones', label: 'Proyecciones', icon: '🔮' },
    { path: '/estacionalidad', label: 'Estacionalidad (IVE)', icon: '🌊' },
    { path: '/rentabilidad', label: 'Rentabilidad', icon: '💰' },
    { path: '/van-tir', label: 'VAN y TIR', icon: '📉' },
    // { path: '/razones', label: 'Razones Financieras', icon: '⚖️' }, // DESHABILITADO
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💼</span>
            <h1 className="text-xl font-bold">Sistema de Análisis Financiero</h1>
          </div>
        </div>

        <div className="flex space-x-1 pb-2 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-all whitespace-nowrap ${
                location.pathname === item.path
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'hover:bg-blue-500 hover:bg-opacity-50'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
