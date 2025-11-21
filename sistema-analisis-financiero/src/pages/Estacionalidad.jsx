import { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import {
  calcularIVE,
  proyectarConIVE,
  analizarProyeccionCompleta,
  formatearMoneda,
  formatearPorcentaje
} from '../utils/financialCalculations';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import ValidationAlert from '../components/common/ValidationAlert';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Estacionalidad = () => {
  const { historicalData } = useFinancial();
  const [datosMenuales, setDatosMenuales] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [añosAProyectar, setAñosAProyectar] = useState(3);
  const [variableAnalisis, setVariableAnalisis] = useState('ventas');
  const [analisisCompleto, setAnalisisCompleto] = useState(null);

  // Datos mensuales de ejemplo basados en tu tabla
  const datosEjemplo = [
    // 2020
    { year: 2020, month: 1, ventas: 8000 }, { year: 2020, month: 2, ventas: 8000 },
    { year: 2020, month: 3, ventas: 8000 }, { year: 2020, month: 4, ventas: 8000 },
    { year: 2020, month: 5, ventas: 8000 }, { year: 2020, month: 6, ventas: 8000 },
    { year: 2020, month: 7, ventas: 8000 }, { year: 2020, month: 8, ventas: 8000 },
    { year: 2020, month: 9, ventas: 8000 }, { year: 2020, month: 10, ventas: 8000 },
    { year: 2020, month: 11, ventas: 8000 }, { year: 2020, month: 12, ventas: 8000 },
    // 2021
    { year: 2021, month: 1, ventas: 9000 }, { year: 2021, month: 2, ventas: 9500 },
    { year: 2021, month: 3, ventas: 10000 }, { year: 2021, month: 4, ventas: 10000 },
    { year: 2021, month: 5, ventas: 10000 }, { year: 2021, month: 6, ventas: 10000 },
    { year: 2021, month: 7, ventas: 10000 }, { year: 2021, month: 8, ventas: 10000 },
    { year: 2021, month: 9, ventas: 10000 }, { year: 2021, month: 10, ventas: 10000 },
    { year: 2021, month: 11, ventas: 10000 }, { year: 2021, month: 12, ventas: 10500 },
    // 2022  
    { year: 2022, month: 1, ventas: 11000 }, { year: 2022, month: 2, ventas: 11500 },
    { year: 2022, month: 3, ventas: 12000 }, { year: 2022, month: 4, ventas: 12000 },
    { year: 2022, month: 5, ventas: 12000 }, { year: 2022, month: 6, ventas: 12000 },
    { year: 2022, month: 7, ventas: 12000 }, { year: 2022, month: 8, ventas: 12000 },
    { year: 2022, month: 9, ventas: 12000 }, { year: 2022, month: 10, ventas: 12000 },
    { year: 2022, month: 11, ventas: 12000 }, { year: 2022, month: 12, ventas: 12500 },
    // 2023
    { year: 2023, month: 1, ventas: 13000 }, { year: 2023, month: 2, ventas: 13500 },
    { year: 2023, month: 3, ventas: 14000 }, { year: 2023, month: 4, ventas: 14000 },
    { year: 2023, month: 5, ventas: 14000 }, { year: 2023, month: 6, ventas: 14000 },
    { year: 2023, month: 7, ventas: 14000 }, { year: 2023, month: 8, ventas: 14000 },
    { year: 2023, month: 9, ventas: 14000 }, { year: 2023, month: 10, ventas: 14000 },
    { year: 2023, month: 11, ventas: 14000 }, { year: 2023, month: 12, ventas: 14500 },
    // 2024
    { year: 2024, month: 1, ventas: 15000 }, { year: 2024, month: 2, ventas: 15500 },
    { year: 2024, month: 3, ventas: 16000 }, { year: 2024, month: 4, ventas: 16000 },
    { year: 2024, month: 5, ventas: 16000 }, { year: 2024, month: 6, ventas: 16000 },
    { year: 2024, month: 7, ventas: 16000 }, { year: 2024, month: 8, ventas: 16000 },
    { year: 2024, month: 9, ventas: 16000 }, { year: 2024, month: 10, ventas: 16000 },
    { year: 2024, month: 11, ventas: 16000 }, { year: 2024, month: 12, ventas: 16500 },
  ];

  useEffect(() => {
    if (datosMenuales.length === 0) {
      setDatosMenuales(datosEjemplo);
    }
  }, []);

  const calcularAnalisis = () => {
    if (historicalData.length === 0) return;

    const resultado = analizarProyeccionCompleta(historicalData, datosMenuales, añosAProyectar);
    setAnalisisCompleto(resultado);
  };

  useEffect(() => {
    if (historicalData.length > 0 && datosMenuales.length > 0) {
      calcularAnalisis();
    }
  }, [historicalData, datosMenuales, añosAProyectar]);

  const resultadoIVE = datosMenuales.length > 0 ? calcularIVE(datosMenuales) : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Análisis de Estacionalidad</h2>
        <p className="text-orange-100">Índice de Variación Estacional (IVE) y Proyecciones Ajustadas</p>
      </div>

      <ValidationAlert data={historicalData}>
        <EstacionalidadContent 
          historicalData={historicalData}
          datosMenuales={datosMenuales}
          setDatosMenuales={setDatosMenuales}
          mostrarFormulario={mostrarFormulario}
          setMostrarFormulario={setMostrarFormulario}
          añosAProyectar={añosAProyectar}
          setAñosAProyectar={setAñosAProyectar}
          variableAnalisis={variableAnalisis}
          setVariableAnalisis={setVariableAnalisis}
          analisisCompleto={analisisCompleto}
          resultadoIVE={resultadoIVE}
          datosEjemplo={datosEjemplo}
        />
      </ValidationAlert>
    </div>
  );
};

const EstacionalidadContent = ({ 
  historicalData, datosMenuales, setDatosMenuales, mostrarFormulario, setMostrarFormulario,
  añosAProyectar, setAñosAProyectar, variableAnalisis, setVariableAnalisis, 
  analisisCompleto, resultadoIVE, datosEjemplo 
}) => {

  const cargarDatosEjemplo = () => {
    setDatosMenuales(datosEjemplo);
  };

  const limpiarDatos = () => {
    setDatosMenuales([]);
  };

  return (
    <>
      {/* Controles */}
      <Card title="Configuración del Análisis">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variable a Analizar
            </label>
            <select
              value={variableAnalisis}
              onChange={(e) => setVariableAnalisis(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ventas">Ventas</option>
              <option value="costoVentas">Costo de Ventas</option>
              <option value="gastosOperativos">Gastos Operativos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Años a Proyectar
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={añosAProyectar}
              onChange={(e) => setAñosAProyectar(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {mostrarFormulario ? 'Ocultar' : 'Editar'} Datos
            </button>
            <button
              onClick={cargarDatosEjemplo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Datos Ejemplo
            </button>
          </div>
        </div>

        {mostrarFormulario && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Datos Mensuales</h4>
              <button
                onClick={limpiarDatos}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Limpiar
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p>Formato: Año, Mes (1-12), Ventas</p>
              <p>Los datos mensuales permiten calcular el Índice de Variación Estacional (IVE)</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 mb-2">
                <span>Año</span><span>Mes</span><span>Ventas</span><span>Acciones</span>
              </div>
              {datosMenuales.map((dato, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="number"
                    value={dato.year}
                    onChange={(e) => {
                      const nuevos = [...datosMenuales];
                      nuevos[index].year = parseInt(e.target.value);
                      setDatosMenuales(nuevos);
                    }}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={dato.month}
                    onChange={(e) => {
                      const nuevos = [...datosMenuales];
                      nuevos[index].month = parseInt(e.target.value);
                      setDatosMenuales(nuevos);
                    }}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    value={dato.ventas}
                    onChange={(e) => {
                      const nuevos = [...datosMenuales];
                      nuevos[index].ventas = parseFloat(e.target.value) || 0;
                      setDatosMenuales(nuevos);
                    }}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      const nuevos = datosMenuales.filter((_, i) => i !== index);
                      setDatosMenuales(nuevos);
                    }}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const nuevo = { year: 2025, month: 1, ventas: 0 };
                setDatosMenuales([...datosMenuales, nuevo]);
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Agregar Mes
            </button>
          </div>
        )}
      </Card>

      {/* Métricas IVE */}
      {resultadoIVE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Coeficiente de Variación"
            value={formatearPorcentaje(resultadoIVE.coeficienteVariacion)}
            subtitle={`Estacionalidad ${resultadoIVE.interpretacion.nivel}`}
            icon="📊"
            color={resultadoIVE.coeficienteVariacion < 5 ? 'green' : resultadoIVE.coeficienteVariacion < 15 ? 'orange' : 'red'}
          />
          <MetricCard
            title="Promedio Mensual"
            value={formatearMoneda(resultadoIVE.promedioMensual)}
            subtitle="Base para calcular IVE"
            icon="📈"
            color="blue"
          />
          <MetricCard
            title="Metodología"
            value="IVE + Regresión"
            subtitle={resultadoIVE.interpretacion.recomendacion}
            icon="🔬"
            color="purple"
          />
        </div>
      )}

      {/* Gráfico IVE */}
      {resultadoIVE && (
        <Card title="Índice de Variación Estacional por Mes">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={resultadoIVE.ive}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombreMes" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value.toFixed(3), 'IVE']}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend />
              <Bar dataKey="ive" fill="#f97316" name="Índice IVE" />
              <Line
                type="monotone"
                dataKey={() => 1}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Promedio (1.0)"
              />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Interpretación del IVE</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Nivel de Estacionalidad:</strong> {resultadoIVE.interpretacion.nivel} 
              ({formatearPorcentaje(resultadoIVE.coeficienteVariacion)} de variación)
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Descripción:</strong> {resultadoIVE.interpretacion.descripcion}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Recomendación:</strong> {resultadoIVE.interpretacion.recomendacion}
            </p>
          </div>
        </Card>
      )}

      {/* Radar Chart del IVE */}
      {resultadoIVE && (
        <Card title="Patrón Estacional Anual">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={resultadoIVE.ive}>
              <PolarGrid />
              <PolarAngleAxis dataKey="nombreMes" />
              <PolarRadiusAxis domain={[0.5, 1.5]} />
              <Radar
                name="IVE"
                dataKey="ive"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
              <Tooltip formatter={(value) => [value.toFixed(3), 'IVE']} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Tabla detallada IVE */}
      {resultadoIVE && (
        <Card title="Tabla de Índices de Variación Estacional">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio Histórico</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variación %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultadoIVE.ive.map((mes) => (
                  <tr key={mes.mes} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mes.nombreMes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearMoneda(mes.promedio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                      {mes.ive.toFixed(3)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      mes.porcentaje > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mes.porcentaje > 0 ? '+' : ''}{formatearPorcentaje(mes.porcentaje)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mes.ive > 1.1 ? '📈 Mes alto' : mes.ive < 0.9 ? '📉 Mes bajo' : '➡️ Mes promedio'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Proyecciones con IVE */}
      {analisisCompleto && (
        <Card title="Proyecciones Ajustadas por Estacionalidad">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Metodología: {analisisCompleto.resumen.metodologia}
            </h4>
            <p className="text-sm text-gray-700">
              Se combinó regresión lineal con el análisis de estacionalidad para generar proyecciones más precisas.
              Variables analizadas: {analisisCompleto.resumen.variablesAnalizadas.join(', ')}
            </p>
          </div>

          {analisisCompleto.datosProyectados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Proyectadas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Proyectado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad Bruta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen Bruto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisisCompleto.datosProyectados.map((año) => {
                    const utilidadBruta = año.ventas - año.costoVentas;
                    const margenBruto = año.ventas > 0 ? (utilidadBruta / año.ventas) * 100 : 0;
                    
                    return (
                      <tr key={año.year} className="hover:bg-purple-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">
                          {año.year} 🔮
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatearMoneda(año.ventas)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatearMoneda(año.costoVentas)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                          {formatearMoneda(utilidadBruta)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                          {formatearPorcentaje(margenBruto)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default Estacionalidad;