import { useFinancial } from '../context/FinancialContext';
import { calcularIndicadoresRentabilidad, formatearMoneda, formatearPorcentaje } from '../utils/financialCalculations';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { historicalData } = useFinancial();
  const navigate = useNavigate();

  // Si no hay datos, mostrar pantalla de bienvenida
  if (historicalData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard Financiero</h2>
          <p className="text-blue-100">Bienvenido al Sistema de Análisis Financiero</p>
        </div>

        <Card>
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📊</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Comienza tu Análisis Financiero!
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Este sistema te permite realizar análisis financieros completos, incluyendo proyecciones con regresión lineal,
              evaluación de proyectos con VAN y TIR, análisis de rentabilidad y razones financieras.
            </p>
            <div className="mb-8">
              <button
                onClick={() => navigate('/datos-historicos')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-colors text-lg"
              >
                📝 Agregar Datos Financieros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-4xl mb-3">📈</div>
                <h4 className="font-bold text-blue-900 mb-2">Proyecciones</h4>
                <p className="text-sm text-gray-700">Regresión lineal y análisis predictivo</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-4xl mb-3">💰</div>
                <h4 className="font-bold text-green-900 mb-2">VAN y TIR</h4>
                <p className="text-sm text-gray-700">Evaluación de proyectos de inversión</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-4xl mb-3">📊</div>
                <h4 className="font-bold text-purple-900 mb-2">Razones Financieras</h4>
                <p className="text-sm text-gray-700">Liquidez, endeudamiento y rentabilidad</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Calcular indicadores del último año
  const indicadores = calcularIndicadoresRentabilidad(historicalData);
  const ultimoAnio = indicadores[indicadores.length - 1];

  // Preparar datos para gráficos
  const datosVentas = historicalData.map(item => ({
    year: item.year,
    Ventas: item.ventas,
    'Costo de Ventas': item.costoVentas,
    'Utilidad Bruta': item.ventas - item.costoVentas,
  }));

  const datosRentabilidad = indicadores.map(item => ({
    year: item.year,
    'Margen Bruto': item.margenBruto,
    'Margen Operativo': item.margenOperativo,
    'Margen Neto': item.margenNeto,
  }));

  const datosROA_ROE = indicadores.map(item => ({
    year: item.year,
    ROA: item.ROA,
    ROE: item.ROE,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard Financiero</h2>
        <p className="text-blue-100">Análisis y métricas clave de desempeño financiero</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ventas del último año"
          value={formatearMoneda(historicalData[historicalData.length - 1].ventas)}
          subtitle={`Año ${historicalData[historicalData.length - 1].year}`}
          icon="💵"
          color="blue"
        />
        <MetricCard
          title="Utilidad Neta"
          value={formatearMoneda(ultimoAnio.utilidadNeta)}
          subtitle={`Margen: ${formatearPorcentaje(ultimoAnio.margenNeto)}`}
          icon="📈"
          color="green"
        />
        <MetricCard
          title="ROE"
          value={formatearPorcentaje(ultimoAnio.ROE)}
          subtitle="Return on Equity"
          icon="💎"
          color="purple"
        />
        <MetricCard
          title="ROA"
          value={formatearPorcentaje(ultimoAnio.ROA)}
          subtitle="Return on Assets"
          icon="🎯"
          color="orange"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolución de Ventas y Costos">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosVentas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => formatearMoneda(value)} />
              <Legend />
              <Bar dataKey="Ventas" fill="#3b82f6" />
              <Bar dataKey="Costo de Ventas" fill="#ef4444" />
              <Bar dataKey="Utilidad Bruta" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Márgenes de Rentabilidad">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosRentabilidad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => formatearPorcentaje(value)} />
              <Legend />
              <Line type="monotone" dataKey="Margen Bruto" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Margen Operativo" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="Margen Neto" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="ROA vs ROE">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosROA_ROE}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => formatearPorcentaje(value)} />
            <Legend />
            <Line type="monotone" dataKey="ROA" stroke="#f59e0b" strokeWidth={3} />
            <Line type="monotone" dataKey="ROE" stroke="#7c3aed" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabla de resumen */}
      <Card title="Resumen de Indicadores por Año">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad Neta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen Neto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicadores.map((item) => (
                <tr key={item.year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearMoneda(historicalData.find(d => d.year === item.year).ventas)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearMoneda(item.utilidadNeta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearPorcentaje(item.margenNeto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearPorcentaje(item.ROA)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearPorcentaje(item.ROE)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
