import { useFinancial } from '../context/FinancialContext';
import { calcularRazonesFinancieras, formatearPorcentaje, formatearMoneda } from '../utils/financialCalculations';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const RazonesFinancieras = () => {
  const { historicalData } = useFinancial();

  // Validar que haya datos históricos
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">Razones Financieras</h2>
          <p className="text-cyan-100">Análisis de liquidez, endeudamiento y cobertura</p>
        </div>
        <Card title="Sin Datos">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay datos históricos disponibles. Por favor, agregue datos en la sección de Datos Históricos.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const razones = calcularRazonesFinancieras(historicalData);
  const ultimoAnio = razones[razones.length - 1];

  // Datos para gráficos
  const datosLiquidez = razones.map(item => ({
    year: item.year,
    'Razón Corriente': item.razonCorriente,
    'Prueba Ácida': item.pruebaAcida,
  }));

  const datosEndeudamiento = razones.map(item => ({
    year: item.year,
    'Razón de Deuda': item.razonDeuda * 100,
    'Deuda/Patrimonio': item.razonDeudaPatrimonio,
  }));

  const datosCobertura = razones.map(item => ({
    year: item.year,
    'Cobertura de Intereses': item.coberturaIntereses,
  }));

  // Datos para radar del último año
  const datosRadar = [
    {
      indicador: 'Liquidez',
      valor: Math.min(ultimoAnio.razonCorriente * 50, 100),
      referencia: 100,
    },
    {
      indicador: 'Solvencia',
      valor: Math.max(0, 100 - (ultimoAnio.razonDeuda * 100)),
      referencia: 50,
    },
    {
      indicador: 'Cobertura',
      valor: Math.min(ultimoAnio.coberturaIntereses * 10, 100),
      referencia: 50,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Razones Financieras</h2>
        <p className="text-cyan-100">Análisis de liquidez, endeudamiento y cobertura</p>
      </div>

      {/* Métricas principales */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Indicadores de Liquidez</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Razón Corriente"
            value={ultimoAnio.razonCorriente.toFixed(2)}
            subtitle={
              ultimoAnio.razonCorriente >= 2
                ? 'Liquidez Excelente ✓'
                : ultimoAnio.razonCorriente >= 1
                ? 'Liquidez Aceptable'
                : 'Problemas de Liquidez ✗'
            }
            icon="💧"
            color={
              ultimoAnio.razonCorriente >= 2
                ? 'green'
                : ultimoAnio.razonCorriente >= 1
                ? 'blue'
                : 'red'
            }
          />
          <MetricCard
            title="Prueba Ácida"
            value={ultimoAnio.pruebaAcida.toFixed(2)}
            subtitle={
              ultimoAnio.pruebaAcida >= 1
                ? 'Liquidez Inmediata Buena ✓'
                : 'Dependencia de Inventario'
            }
            icon="🧪"
            color={ultimoAnio.pruebaAcida >= 1 ? 'green' : 'orange'}
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Indicadores de Endeudamiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Razón de Deuda"
            value={formatearPorcentaje(ultimoAnio.razonDeuda * 100)}
            subtitle={
              ultimoAnio.razonDeuda <= 0.5
                ? 'Endeudamiento Saludable ✓'
                : ultimoAnio.razonDeuda <= 0.7
                ? 'Endeudamiento Moderado'
                : 'Alto Endeudamiento ⚠'
            }
            icon="📊"
            color={
              ultimoAnio.razonDeuda <= 0.5
                ? 'green'
                : ultimoAnio.razonDeuda <= 0.7
                ? 'orange'
                : 'red'
            }
          />
          <MetricCard
            title="Deuda/Patrimonio"
            value={ultimoAnio.razonDeudaPatrimonio.toFixed(2)}
            subtitle={
              ultimoAnio.razonDeudaPatrimonio <= 1
                ? 'Apalancamiento Bajo ✓'
                : ultimoAnio.razonDeudaPatrimonio <= 2
                ? 'Apalancamiento Moderado'
                : 'Alto Apalancamiento ⚠'
            }
            icon="⚖️"
            color={
              ultimoAnio.razonDeudaPatrimonio <= 1
                ? 'green'
                : ultimoAnio.razonDeudaPatrimonio <= 2
                ? 'blue'
                : 'red'
            }
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Indicador de Cobertura</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Cobertura de Intereses"
            value={ultimoAnio.coberturaIntereses.toFixed(2)}
            subtitle={
              ultimoAnio.coberturaIntereses >= 3
                ? 'Cobertura Excelente ✓'
                : ultimoAnio.coberturaIntereses >= 1.5
                ? 'Cobertura Aceptable'
                : 'Problemas de Cobertura ✗'
            }
            icon="🛡️"
            color={
              ultimoAnio.coberturaIntereses >= 3
                ? 'green'
                : ultimoAnio.coberturaIntereses >= 1.5
                ? 'orange'
                : 'red'
            }
          />
          <Card title="Perfil Financiero">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={datosRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicador" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Empresa"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Referencia"
                  dataKey="referencia"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Evolución de Indicadores de Liquidez">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={datosLiquidez}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Razón Corriente"
                stroke="#10b981"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="Prueba Ácida"
                stroke="#3b82f6"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                data={[
                  { year: datosLiquidez[0].year, referencia: 1 },
                  { year: datosLiquidez[datosLiquidez.length - 1].year, referencia: 1 }
                ]}
                dataKey="referencia"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Mínimo Aceptable"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Razón Corriente:</strong> Mide la capacidad de pagar obligaciones a corto plazo.
              Ideal {'>'} 2.0
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Prueba Ácida:</strong> Liquidez sin considerar inventarios. Ideal {'>'} 1.0
            </p>
          </div>
        </Card>

        <Card title="Evolución del Endeudamiento">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={datosEndeudamiento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Razón de Deuda" fill="#f59e0b" />
              <Bar dataKey="Deuda/Patrimonio" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Razón de Deuda:</strong> Porcentaje de activos financiados con deuda.
              Ideal {'<'} 50%
            </p>
            <p className="text-sm text-gray-700 mt-2">
              <strong>Deuda/Patrimonio:</strong> Relación entre financiamiento ajeno y propio.
              Ideal {'<'} 1.0
            </p>
          </div>
        </Card>
      </div>

      <Card title="Evolución de Cobertura de Intereses">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={datosCobertura}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Cobertura de Intereses"
              stroke="#8b5cf6"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              data={[
                { year: datosCobertura[0].year, minimo: 1.5 },
                { year: datosCobertura[datosCobertura.length - 1].year, minimo: 1.5 }
              ]}
              dataKey="minimo"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Mínimo Recomendado"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Cobertura de Intereses:</strong> Veces que la utilidad operativa puede cubrir gastos financieros.
            Ideal {'>'} 3.0. Mínimo aceptable: 1.5
          </p>
        </div>
      </Card>

      {/* Interpretaciones detalladas */}
      <Card title="Interpretación Detallada">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">
              Liquidez - Razón Corriente: {ultimoAnio.razonCorriente.toFixed(2)}
            </h4>
            <p className="text-sm text-gray-700">
              {ultimoAnio.razonCorriente >= 2 && (
                <>
                  ✓ <strong>Excelente:</strong> Por cada peso de deuda a corto plazo, la empresa tiene{' '}
                  {formatearMoneda(ultimoAnio.razonCorriente)} en activos circulantes. Muy buena capacidad de pago.
                </>
              )}
              {ultimoAnio.razonCorriente >= 1 && ultimoAnio.razonCorriente < 2 && (
                <>
                  → <strong>Aceptable:</strong> Puede cubrir obligaciones a corto plazo, pero con poco margen de seguridad.
                  Se recomienda incrementar el activo circulante.
                </>
              )}
              {ultimoAnio.razonCorriente < 1 && (
                <>
                  ⚠ <strong>Crítico:</strong> Los activos circulantes no alcanzan a cubrir pasivos a corto plazo.
                  Riesgo de insolvencia. Acción inmediata requerida.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2">
              Prueba Ácida: {ultimoAnio.pruebaAcida.toFixed(2)}
            </h4>
            <p className="text-sm text-gray-700">
              {ultimoAnio.pruebaAcida >= 1 && (
                <>
                  ✓ <strong>Buena:</strong> Sin considerar inventarios, la empresa puede cubrir sus obligaciones inmediatas.
                  No depende de la venta de inventario para cumplir compromisos.
                </>
              )}
              {ultimoAnio.pruebaAcida < 1 && ultimoAnio.pruebaAcida >= 0.5 && (
                <>
                  → <strong>Moderada:</strong> Dependencia parcial del inventario para liquidez.
                  Mejorar cuentas por cobrar y efectivo disponible.
                </>
              )}
              {ultimoAnio.pruebaAcida < 0.5 && (
                <>
                  ⚠ <strong>Baja:</strong> Alta dependencia del inventario. Riesgo si los inventarios no se venden rápido.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-800 mb-2">
              Razón de Deuda: {formatearPorcentaje(ultimoAnio.razonDeuda * 100)}
            </h4>
            <p className="text-sm text-gray-700">
              {ultimoAnio.razonDeuda <= 0.5 && (
                <>
                  ✓ <strong>Saludable:</strong> Solo el {formatearPorcentaje(ultimoAnio.razonDeuda * 100)} de los activos
                  está financiado con deuda. Baja dependencia de acreedores.
                </>
              )}
              {ultimoAnio.razonDeuda > 0.5 && ultimoAnio.razonDeuda <= 0.7 && (
                <>
                  → <strong>Moderado:</strong> El {formatearPorcentaje(ultimoAnio.razonDeuda * 100)} de activos está financiado
                  con deuda. Aceptable pero vigilar crecimiento de pasivos.
                </>
              )}
              {ultimoAnio.razonDeuda > 0.7 && (
                <>
                  ⚠ <strong>Alto:</strong> El {formatearPorcentaje(ultimoAnio.razonDeuda * 100)} de activos es deuda.
                  Alto riesgo financiero. Reducir endeudamiento o aumentar patrimonio.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-800 mb-2">
              Deuda/Patrimonio: {ultimoAnio.razonDeudaPatrimonio.toFixed(2)}
            </h4>
            <p className="text-sm text-gray-700">
              {ultimoAnio.razonDeudaPatrimonio <= 1 && (
                <>
                  ✓ <strong>Conservador:</strong> Los acreedores financian menos que los accionistas.
                  Estructura financiera sólida.
                </>
              )}
              {ultimoAnio.razonDeudaPatrimonio > 1 && ultimoAnio.razonDeudaPatrimonio <= 2 && (
                <>
                  → <strong>Moderado:</strong> Apalancamiento moderado. Los acreedores tienen más participación
                  que los dueños. Vigilar capacidad de servicio de deuda.
                </>
              )}
              {ultimoAnio.razonDeudaPatrimonio > 2 && (
                <>
                  ⚠ <strong>Agresivo:</strong> Alto apalancamiento. Riesgo financiero elevado.
                  Los acreedores tienen mucho más participación que los accionistas.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2">
              Cobertura de Intereses: {ultimoAnio.coberturaIntereses.toFixed(2)}
            </h4>
            <p className="text-sm text-gray-700">
              {ultimoAnio.coberturaIntereses >= 3 && (
                <>
                  ✓ <strong>Excelente:</strong> La utilidad operativa puede cubrir los intereses{' '}
                  {ultimoAnio.coberturaIntereses.toFixed(2)} veces. Muy bajo riesgo de impago.
                </>
              )}
              {ultimoAnio.coberturaIntereses >= 1.5 && ultimoAnio.coberturaIntereses < 3 && (
                <>
                  → <strong>Aceptable:</strong> Puede cubrir intereses pero con poco margen.
                  Vulnerable ante caídas en utilidad operativa.
                </>
              )}
              {ultimoAnio.coberturaIntereses < 1.5 && (
                <>
                  ⚠ <strong>Crítico:</strong> Dificultad para cubrir gastos financieros.
                  Alto riesgo de default. Reestructurar deuda o mejorar operación urgentemente.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabla comparativa */}
      <Card title="Tabla Comparativa por Año">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón Corriente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prueba Ácida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón Deuda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deuda/Patrim.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cob. Intereses</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {razones.map((item) => (
                <tr key={item.year} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {item.razonCorriente.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {item.pruebaAcida.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                    {formatearPorcentaje(item.razonDeuda * 100)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {item.razonDeudaPatrimonio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">
                    {item.coberturaIntereses.toFixed(2)}
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

export default RazonesFinancieras;
