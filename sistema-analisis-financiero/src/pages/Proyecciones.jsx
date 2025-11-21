import { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { proyectarConRegresion, formatearMoneda, formatearPorcentaje } from '../utils/financialCalculations';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const Proyecciones = () => {
  const { historicalData } = useFinancial();
  const [periodosProyectar, setPeriodosProyectar] = useState(3);
  const [variableSeleccionada, setVariableSeleccionada] = useState('ventas');
  const [proyecciones, setProyecciones] = useState(null);

  // Validar que haya datos históricos
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">Proyecciones Financieras</h2>
          <p className="text-purple-100">Análisis y proyecciones mediante regresión lineal</p>
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

  const variables = [
    { value: 'ventas', label: 'Ventas' },
    { value: 'costoVentas', label: 'Costo de Ventas' },
    { value: 'gastosOperativos', label: 'Gastos Operativos' },
    { value: 'activoCirculante', label: 'Activo Circulante' },
    { value: 'activoFijo', label: 'Activo Fijo' },
    { value: 'patrimonio', label: 'Patrimonio' },
  ];

  useEffect(() => {
    calcularProyecciones();
  }, [variableSeleccionada, periodosProyectar, historicalData]);

  const calcularProyecciones = () => {
    const resultado = proyectarConRegresion(historicalData, variableSeleccionada, periodosProyectar);
    setProyecciones(resultado);
  };

  // Preparar datos para gráficos (ordenados por año)
  const datosHistoricosOrdenados = [...historicalData].sort((a, b) => a.year - b.year);
  
  const datosCompletos = proyecciones ? [
    ...datosHistoricosOrdenados.map(item => ({
      year: item.year,
      valor: item[variableSeleccionada],
      tipo: 'Histórico'
    })),
    ...proyecciones.proyecciones.map(item => ({
      year: item.year,
      valor: item[variableSeleccionada],
      tipo: 'Proyectado'
    }))
  ].sort((a, b) => a.year - b.year) : [];

  // Datos para scatter plot (regresión) - usando datos ordenados
  const datosRegresion = datosHistoricosOrdenados.map((item, index) => {
    const x = index + 1;
    const y = item[variableSeleccionada];
    const yPred = proyecciones ? (proyecciones.pendiente * x + proyecciones.interseccion) : y;

    return {
      periodo: x,
      real: y,
      ajustado: yPred,
      year: item.year,
    };
  });

  // Agregar proyecciones al scatter
  if (proyecciones) {
    proyecciones.proyecciones.forEach((item, index) => {
      const x = datosHistoricosOrdenados.length + index + 1;
      const yPred = proyecciones.pendiente * x + proyecciones.interseccion;
      datosRegresion.push({
        periodo: x,
        proyectado: yPred,
        year: item.year,
      });
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Proyecciones Financieras</h2>
        <p className="text-purple-100">Análisis y proyecciones mediante regresión lineal</p>
      </div>

      {/* Controles */}
      <Card title="Configuración de Proyección">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable a Proyectar
            </label>
            <select
              value={variableSeleccionada}
              onChange={(e) => setVariableSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {variables.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodos a Proyectar
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={periodosProyectar}
              onChange={(e) => setPeriodosProyectar(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </Card>

      {/* Métricas de Regresión */}
      {proyecciones && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Coeficiente R²"
            value={formatearPorcentaje(proyecciones.r2 * 100)}
            subtitle="Bondad de ajuste del modelo"
            icon="📊"
            color={proyecciones.r2 > 0.8 ? 'green' : proyecciones.r2 > 0.6 ? 'orange' : 'red'}
          />
          <MetricCard
            title="Pendiente"
            value={proyecciones.pendiente.toFixed(2)}
            subtitle="Tasa de crecimiento"
            icon="📈"
            color={proyecciones.pendiente > 0 ? 'blue' : 'red'}
          />
          <MetricCard
            title="Intersección"
            value={formatearMoneda(proyecciones.interseccion)}
            subtitle="Valor base"
            icon="🎯"
            color="purple"
          />
        </div>
      )}

      {/* Gráfico de Proyección */}
      <Card title={`Proyección de ${variables.find(v => v.value === variableSeleccionada)?.label}`}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={datosCompletos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => formatearMoneda(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 5 }}
              name={variables.find(v => v.value === variableSeleccionada)?.label}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Interpretación del R²</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {proyecciones && proyecciones.r2 > 0.8 && (
              <p className="text-green-700">
                ✓ El modelo tiene un ajuste <strong>excelente</strong> (R² = {formatearPorcentaje(proyecciones.r2 * 100)}).
                Las proyecciones son altamente confiables.
              </p>
            )}
            {proyecciones && proyecciones.r2 > 0.6 && proyecciones.r2 <= 0.8 && (
              <p className="text-orange-700">
                ⚠ El modelo tiene un ajuste <strong>moderado</strong> (R² = {formatearPorcentaje(proyecciones.r2 * 100)}).
                Las proyecciones deben tomarse con precaución.
              </p>
            )}
            {proyecciones && proyecciones.r2 <= 0.6 && (
              <p className="text-red-700">
                ⚠ El modelo tiene un ajuste <strong>bajo</strong> (R² = {formatearPorcentaje(proyecciones.r2 * 100)}).
                Las proyecciones pueden no ser confiables.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Gráfico de Dispersión y Línea de Regresión */}
      <Card title="Análisis de Regresión Lineal">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="periodo"
              name="Periodo"
              label={{ value: 'Periodo', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              name="Valor"
              label={{ value: 'Valor', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value) => formatearMoneda(value)}
              labelFormatter={(label) => `Periodo ${label}`}
            />
            <Legend />
            <Scatter
              name="Datos Reales"
              data={datosRegresion.filter(d => d.real)}
              fill="#3b82f6"
              line={{ stroke: '#3b82f6', strokeWidth: 2 }}
              dataKey="real"
            />
            <Scatter
              name="Línea de Regresión"
              data={datosRegresion}
              fill="#10b981"
              line={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
              dataKey="ajustado"
              shape="cross"
            />
            <Scatter
              name="Proyección"
              data={datosRegresion.filter(d => d.proyectado)}
              fill="#f59e0b"
              dataKey="proyectado"
              shape="diamond"
            />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Ecuación de Regresión</h4>
          {proyecciones && (
            <div className="font-mono text-lg text-center p-3 bg-white rounded border-2 border-purple-200">
              Y = {proyecciones.pendiente.toFixed(2)} × X + {proyecciones.interseccion.toFixed(2)}
            </div>
          )}
        </div>
      </Card>

      {/* Tabla de Proyecciones */}
      {proyecciones && (
        <Card title="Tabla de Valores Proyectados">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Proyectado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosHistoricosOrdenados.map((item) => (
                  <tr key={item.year} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearMoneda(item[variableSeleccionada])}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Histórico
                      </span>
                    </td>
                  </tr>
                ))}
                {proyecciones.proyecciones.map((item) => (
                  <tr key={item.year} className="hover:bg-purple-50 bg-purple-25">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">
                      {item.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 font-semibold">
                      {formatearMoneda(item[variableSeleccionada])}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Proyectado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Proyecciones;
