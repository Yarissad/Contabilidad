import { useFinancial } from '../context/FinancialContext';
import { calcularIndicadoresRentabilidad, formatearMoneda, formatearPorcentaje } from '../utils/financialCalculations';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import ValidationAlert from '../components/common/ValidationAlert';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Rentabilidad = () => {
  const { historicalData } = useFinancial();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Análisis de Rentabilidad</h2>
        <p className="text-green-100">Evaluación de márgenes, ROA, ROE y otros indicadores de desempeño</p>
      </div>

      <ValidationAlert data={historicalData}>
        <RentabilidadContent historicalData={historicalData} />
      </ValidationAlert>
    </div>
  );
};

const RentabilidadContent = ({ historicalData }) => {
  const indicadores = calcularIndicadoresRentabilidad(historicalData);
  const ultimoAnio = indicadores[indicadores.length - 1];

  // Datos para gráfico de márgenes
  const datosMargenes = indicadores.map(item => ({
    year: item.year,
    'Margen Bruto': item.margenBruto,
    'Margen Operativo': item.margenOperativo,
    'Margen Neto': item.margenNeto,
  }));

  // Datos para gráfico de ROA y ROE
  const datosRentabilidad = indicadores.map(item => ({
    year: item.year,
    ROA: item.ROA,
    ROE: item.ROE,
  }));

  // Datos para gráfico de utilidades
  const datosUtilidades = indicadores.map(item => ({
    year: item.year,
    'Utilidad Bruta': item.utilidadBruta,
    'Utilidad Operativa': item.utilidadOperativa,
    'Utilidad Neta': item.utilidadNeta,
  }));

  // Datos para radar chart del último año
  const datosRadar = [
    {
      indicador: 'Margen Bruto',
      valor: ultimoAnio.margenBruto,
      referencia: 40,
    },
    {
      indicador: 'Margen Operativo',
      valor: ultimoAnio.margenOperativo,
      referencia: 25,
    },
    {
      indicador: 'Margen Neto',
      valor: ultimoAnio.margenNeto,
      referencia: 15,
    },
    {
      indicador: 'ROA',
      valor: ultimoAnio.ROA,
      referencia: 10,
    },
    {
      indicador: 'ROE',
      valor: ultimoAnio.ROE,
      referencia: 15,
    },
  ];

  return (
    <>
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Margen Bruto"
          value={formatearPorcentaje(ultimoAnio.margenBruto)}
          subtitle={`Año ${ultimoAnio.year}`}
          icon="📊"
          color="green"
        />
        <MetricCard
          title="Margen Operativo"
          value={formatearPorcentaje(ultimoAnio.margenOperativo)}
          subtitle={`Año ${ultimoAnio.year}`}
          icon="⚙️"
          color="blue"
        />
        <MetricCard
          title="Margen Neto"
          value={formatearPorcentaje(ultimoAnio.margenNeto)}
          subtitle={`Año ${ultimoAnio.year}`}
          icon="💰"
          color="purple"
        />
        <MetricCard
          title="ROA"
          value={formatearPorcentaje(ultimoAnio.ROA)}
          subtitle="Return on Assets"
          icon="🎯"
          color="orange"
        />
        <MetricCard
          title="ROE"
          value={formatearPorcentaje(ultimoAnio.ROE)}
          subtitle="Return on Equity"
          icon="💎"
          color="red"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolución de Márgenes de Rentabilidad">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={datosMargenes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => formatearPorcentaje(value)} />
              <Legend />
              <Line type="monotone" dataKey="Margen Bruto" stroke="#10b981" strokeWidth={3} />
              <Line type="monotone" dataKey="Margen Operativo" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="Margen Neto" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="ROA vs ROE">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={datosRentabilidad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => formatearPorcentaje(value)} />
              <Legend />
              <Line type="monotone" dataKey="ROA" stroke="#f59e0b" strokeWidth={3} />
              <Line type="monotone" dataKey="ROE" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Evolución de Utilidades">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={datosUtilidades}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => formatearMoneda(value)} />
            <Legend />
            <Bar dataKey="Utilidad Bruta" fill="#10b981" />
            <Bar dataKey="Utilidad Operativa" fill="#3b82f6" />
            <Bar dataKey="Utilidad Neta" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Perfil de Rentabilidad ${ultimoAnio.year}`}>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={datosRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="indicador" />
              <PolarRadiusAxis />
              <Radar name="Empresa" dataKey="valor" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Radar name="Referencia" dataKey="referencia" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Legend />
              <Tooltip formatter={(value) => formatearPorcentaje(value)} />
            </RadarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Nota:</strong> Los valores de referencia son estándares generales de la industria.
              Compare el desempeño de su empresa contra estos valores.
            </p>
          </div>
        </Card>

        <Card title="Interpretación de Indicadores">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-2">Margen Bruto ({formatearPorcentaje(ultimoAnio.margenBruto)})</h4>
              <p className="text-sm text-gray-700">
                Indica el porcentaje de ventas que queda después de cubrir el costo de los productos vendidos.
                {ultimoAnio.margenBruto > 40 && ' ✓ Excelente capacidad para cubrir costos de producción.'}
                {ultimoAnio.margenBruto > 25 && ultimoAnio.margenBruto <= 40 && ' → Margen adecuado, puede mejorar.'}
                {ultimoAnio.margenBruto <= 25 && ' ⚠ Margen bajo, revisar estrategia de precios o costos.'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-800 mb-2">Margen Operativo ({formatearPorcentaje(ultimoAnio.margenOperativo)})</h4>
              <p className="text-sm text-gray-700">
                Mide la eficiencia operativa después de gastos de operación.
                {ultimoAnio.margenOperativo > 20 && ' ✓ Operación muy eficiente.'}
                {ultimoAnio.margenOperativo > 10 && ultimoAnio.margenOperativo <= 20 && ' → Eficiencia operativa moderada.'}
                {ultimoAnio.margenOperativo <= 10 && ' ⚠ Gastos operativos altos, revisar estructura de costos.'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-800 mb-2">Margen Neto ({formatearPorcentaje(ultimoAnio.margenNeto)})</h4>
              <p className="text-sm text-gray-700">
                Porcentaje de ventas que se convierte en utilidad neta.
                {ultimoAnio.margenNeto > 15 && ' ✓ Rentabilidad excelente.'}
                {ultimoAnio.margenNeto > 5 && ultimoAnio.margenNeto <= 15 && ' → Rentabilidad aceptable.'}
                {ultimoAnio.margenNeto <= 5 && ' ⚠ Rentabilidad baja, necesita mejorar.'}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-800 mb-2">ROA ({formatearPorcentaje(ultimoAnio.ROA)})</h4>
              <p className="text-sm text-gray-700">
                Rentabilidad sobre activos totales. Mide qué tan eficiente es la empresa usando sus activos.
                {ultimoAnio.ROA > 10 && ' ✓ Uso muy eficiente de activos.'}
                {ultimoAnio.ROA > 5 && ultimoAnio.ROA <= 10 && ' → Eficiencia moderada en uso de activos.'}
                {ultimoAnio.ROA <= 5 && ' ⚠ Baja eficiencia, revisar gestión de activos.'}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold text-red-800 mb-2">ROE ({formatearPorcentaje(ultimoAnio.ROE)})</h4>
              <p className="text-sm text-gray-700">
                Rentabilidad sobre patrimonio. Rendimiento que obtienen los accionistas.
                {ultimoAnio.ROE > 15 && ' ✓ Excelente retorno para accionistas.'}
                {ultimoAnio.ROE > 8 && ultimoAnio.ROE <= 15 && ' → Retorno aceptable para accionistas.'}
                {ultimoAnio.ROE <= 8 && ' ⚠ Bajo retorno, podría buscar mejores inversiones.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla detallada */}
      <Card title="Tabla Comparativa de Indicadores">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad Bruta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad Neta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mg. Bruto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mg. Operativo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mg. Neto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicadores.map((item) => (
                <tr key={item.year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearMoneda(item.utilidadBruta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearMoneda(item.utilidadNeta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {formatearPorcentaje(item.margenBruto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {formatearPorcentaje(item.margenOperativo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    {formatearPorcentaje(item.margenNeto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                    {formatearPorcentaje(item.ROA)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {formatearPorcentaje(item.ROE)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default Rentabilidad;
