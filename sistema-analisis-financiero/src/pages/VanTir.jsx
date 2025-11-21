import { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import {
  calcularVAN,
  calcularTIR,
  calcularPayback,
  calcularIndiceRentabilidad,
  calcularAnalisisSensibilidad,
  validarProyectoInversion,
  formatearMoneda,
  formatearPorcentaje
} from '../utils/financialCalculations';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VanTir = () => {
  const { projectData, updateProjectData } = useFinancial();

  const [formData, setFormData] = useState(projectData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('flujo-')) {
      const index = parseInt(name.split('-')[1]);
      const nuevosFlujos = [...formData.flujosEfectivo];
      nuevosFlujos[index] = parseFloat(value) || 0;
      setFormData({ ...formData, flujosEfectivo: nuevosFlujos });
    } else if (name === 'periodos') {
      const nuevoPeriodos = parseInt(value) || 1;
      const nuevosFlujos = Array(nuevoPeriodos).fill(0).map((_, i) =>
        formData.flujosEfectivo[i] || 0
      );
      setFormData({ ...formData, periodos: nuevoPeriodos, flujosEfectivo: nuevosFlujos });
    } else if (name === 'tasaDescuento') {
      setFormData({ ...formData, [name]: parseFloat(value) / 100 || 0 });
    } else {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProjectData(formData);
  };

  // Validación de datos
  const validacion = validarProyectoInversion(
    formData.inversionInicial, 
    formData.flujosEfectivo, 
    formData.tasaDescuento
  );

  // Cálculos (solo si los datos son válidos)
  const van = validacion.valido ? calcularVAN(formData.inversionInicial, formData.flujosEfectivo, formData.tasaDescuento) : 0;
  const tir = validacion.valido ? calcularTIR(formData.inversionInicial, formData.flujosEfectivo) : 0;
  const payback = validacion.valido ? calcularPayback(formData.inversionInicial, formData.flujosEfectivo) : -1;
  const indiceRentabilidad = validacion.valido ? calcularIndiceRentabilidad(
    formData.inversionInicial,
    formData.flujosEfectivo,
    formData.tasaDescuento
  ) : 0;
  const analisisSensibilidad = calcularAnalisisSensibilidad(
    formData.inversionInicial,
    formData.flujosEfectivo,
    formData.tasaDescuento
  );

  // Datos para gráfico de flujos acumulados
  let acumulado = -formData.inversionInicial;
  const datosFlujos = formData.flujosEfectivo.map((flujo, index) => {
    acumulado += flujo;
    return {
      periodo: index + 1,
      'Flujo del Periodo': flujo,
      'Flujo Acumulado': acumulado,
    };
  });

  // Agregar inversión inicial
  datosFlujos.unshift({
    periodo: 0,
    'Flujo del Periodo': -formData.inversionInicial,
    'Flujo Acumulado': -formData.inversionInicial,
  });

  // Datos para VP de flujos
  const datosVP = formData.flujosEfectivo.map((flujo, index) => {
    const periodo = index + 1;
    const vp = flujo / Math.pow(1 + formData.tasaDescuento, periodo);
    return {
      periodo,
      'Flujo Nominal': flujo,
      'Valor Presente': vp,
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Evaluación de Proyectos de Inversión</h2>
        <p className="text-indigo-100">Análisis de VAN, TIR, Payback y otros indicadores de viabilidad</p>
      </div>

      {/* Formulario */}
      <Card title="Datos del Proyecto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inversión Inicial
              </label>
              <input
                type="number"
                name="inversionInicial"
                value={formData.inversionInicial}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Descuento (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="tasaDescuento"
                value={formData.tasaDescuento * 100}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Periodos
              </label>
              <input
                type="number"
                min="1"
                max="20"
                name="periodos"
                value={formData.periodos}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Flujos de Efectivo por Periodo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {formData.flujosEfectivo.map((flujo, index) => (
                <div key={index}>
                  <label className="block text-xs text-gray-600 mb-1">
                    Periodo {index + 1}
                  </label>
                  <input
                    type="number"
                    name={`flujo-${index}`}
                    value={flujo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Calcular Indicadores
            </button>
          </div>
        </form>
      </Card>

      {/* Indicadores principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="VAN"
          value={formatearMoneda(van)}
          subtitle={van > 0 ? 'Proyecto Rentable ✓' : 'Proyecto No Rentable ✗'}
          icon="💵"
          color={van > 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="TIR"
          value={formatearPorcentaje(tir * 100)}
          subtitle={tir > formData.tasaDescuento ? 'Supera tasa descuento ✓' : 'No supera tasa ✗'}
          icon="📈"
          color={tir > formData.tasaDescuento ? 'blue' : 'orange'}
        />
        <MetricCard
          title="Payback"
          value={payback >= 0 ? `${payback.toFixed(2)} años` : 'No se recupera'}
          subtitle="Periodo de recuperación"
          icon="⏱️"
          color="purple"
        />
        <MetricCard
          title="Índice Rentabilidad"
          value={indiceRentabilidad.toFixed(2)}
          subtitle={indiceRentabilidad > 1 ? 'Acepta proyecto ✓' : 'Rechaza proyecto ✗'}
          icon="📊"
          color={indiceRentabilidad > 1 ? 'green' : 'red'}
        />
      </div>

      {/* Interpretación */}
      <Card title="Interpretación de Resultados">
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-l-4 ${van > 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <h4 className={`font-semibold mb-2 ${van > 0 ? 'text-green-800' : 'text-red-800'}`}>
              VAN: {formatearMoneda(van)}
            </h4>
            <p className="text-sm text-gray-700">
              {van > 0 ? (
                <>
                  ✓ El proyecto es <strong>rentable</strong>. Genera un valor presente neto positivo de {formatearMoneda(van)},
                  lo que significa que recupera la inversión y genera ganancias adicionales.
                </>
              ) : van === 0 ? (
                <>
                  → El proyecto está en <strong>punto de equilibrio</strong>. Recupera exactamente la inversión inicial
                  considerando el valor del dinero en el tiempo.
                </>
              ) : (
                <>
                  ✗ El proyecto <strong>no es rentable</strong>. Genera pérdidas de {formatearMoneda(Math.abs(van))}
                  en valor presente. Se recomienda rechazar el proyecto.
                </>
              )}
            </p>
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${tir > formData.tasaDescuento ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'}`}>
            <h4 className={`font-semibold mb-2 ${tir > formData.tasaDescuento ? 'text-blue-800' : 'text-orange-800'}`}>
              TIR: {formatearPorcentaje(tir * 100)} vs Tasa de Descuento: {formatearPorcentaje(formData.tasaDescuento * 100)}
            </h4>
            <p className="text-sm text-gray-700">
              {tir > formData.tasaDescuento ? (
                <>
                  ✓ La TIR ({formatearPorcentaje(tir * 100)}) es <strong>mayor</strong> que la tasa de descuento
                  ({formatearPorcentaje(formData.tasaDescuento * 100)}). El proyecto genera una rentabilidad superior
                  al costo de oportunidad del capital.
                </>
              ) : tir === formData.tasaDescuento ? (
                <>
                  → La TIR es <strong>igual</strong> a la tasa de descuento. El proyecto está en el punto de
                  indiferencia.
                </>
              ) : (
                <>
                  ✗ La TIR ({formatearPorcentaje(tir * 100)}) es <strong>menor</strong> que la tasa de descuento
                  ({formatearPorcentaje(formData.tasaDescuento * 100)}). El proyecto no alcanza la rentabilidad mínima
                  requerida.
                </>
              )}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2">
              Periodo de Recuperación (Payback): {payback >= 0 ? `${payback.toFixed(2)} años` : 'No se recupera'}
            </h4>
            <p className="text-sm text-gray-700">
              {payback >= 0 ? (
                <>
                  La inversión inicial se recuperará en aproximadamente <strong>{payback.toFixed(2)} años</strong>.
                  {payback < 3 && ' Recuperación rápida, muy favorable.'}
                  {payback >= 3 && payback < 5 && ' Recuperación en tiempo moderado.'}
                  {payback >= 5 && ' Recuperación lenta, evaluar riesgo.'}
                </>
              ) : (
                <>
                  ⚠ La inversión <strong>no se recupera</strong> durante el horizonte del proyecto.
                  Los flujos de efectivo no son suficientes.
                </>
              )}
            </p>
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${indiceRentabilidad > 1 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            <h4 className={`font-semibold mb-2 ${indiceRentabilidad > 1 ? 'text-green-800' : 'text-red-800'}`}>
              Índice de Rentabilidad: {indiceRentabilidad.toFixed(2)}
            </h4>
            <p className="text-sm text-gray-700">
              {indiceRentabilidad > 1 ? (
                <>
                  ✓ Por cada peso invertido, se recuperan <strong>{formatearMoneda(indiceRentabilidad)}</strong> en valor presente.
                  {indiceRentabilidad > 1.5 && ' Excelente retorno sobre la inversión.'}
                  {indiceRentabilidad > 1.2 && indiceRentabilidad <= 1.5 && ' Buen retorno sobre la inversión.'}
                  {indiceRentabilidad > 1 && indiceRentabilidad <= 1.2 && ' Retorno moderado.'}
                </>
              ) : indiceRentabilidad === 1 ? (
                <>
                  → El proyecto recupera exactamente lo invertido en términos de valor presente.
                </>
              ) : (
                <>
                  ✗ Se recuperan solo <strong>{formatearMoneda(indiceRentabilidad)}</strong> por cada peso invertido.
                  No es rentable.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Flujos de Efectivo Acumulados">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={datosFlujos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" label={{ value: 'Periodo', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip formatter={(value) => formatearMoneda(value)} />
              <Legend />
              <Line type="monotone" dataKey="Flujo del Periodo" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Flujo Acumulado" stroke="#10b981" strokeWidth={3} />
              <Line
                type="monotone"
                data={[{ periodo: 0, referencia: 0 }, { periodo: formData.periodos, referencia: 0 }]}
                dataKey="referencia"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Línea de Equilibrio"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Valor Presente de Flujos">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={datosVP}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value) => formatearMoneda(value)} />
              <Legend />
              <Bar dataKey="Flujo Nominal" fill="#8b5cf6" />
              <Bar dataKey="Valor Presente" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Análisis de Sensibilidad */}
      <Card title="Análisis de Sensibilidad del VAN">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={analisisSensibilidad}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="tasa"
              label={{ value: 'Tasa de Descuento (%)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: 'VAN', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value) => formatearMoneda(value)}
              labelFormatter={(label) => `Tasa: ${label}%`}
            />
            <Legend />
            <Line type="monotone" dataKey="van" stroke="#f59e0b" strokeWidth={3} name="VAN" />
            <Line
              type="monotone"
              data={[
                { tasa: analisisSensibilidad[0].tasa, referencia: 0 },
                { tasa: analisisSensibilidad[analisisSensibilidad.length - 1].tasa, referencia: 0 }
              ]}
              dataKey="referencia"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="VAN = 0"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Análisis de Sensibilidad</h4>
          <p className="text-sm text-gray-700 mb-3">
            Este gráfico muestra cómo varía el VAN ante cambios en la tasa de descuento.
            Permite evaluar el riesgo del proyecto ante diferentes escenarios de costo de capital.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-2 text-left">Variación</th>
                  <th className="px-4 py-2 text-left">Tasa</th>
                  <th className="px-4 py-2 text-left">VAN</th>
                  <th className="px-4 py-2 text-left">Decisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analisisSensibilidad.map((item, index) => (
                  <tr key={index} className="hover:bg-white">
                    <td className="px-4 py-2">{item.variacion > 0 ? '+' : ''}{formatearPorcentaje(item.variacion)}</td>
                    <td className="px-4 py-2 font-semibold">{formatearPorcentaje(item.tasa)}</td>
                    <td className={`px-4 py-2 font-semibold ${item.van > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatearMoneda(item.van)}
                    </td>
                    <td className="px-4 py-2">
                      {item.van > 0 ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Aceptar</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rechazar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Resumen ejecutivo */}
      <Card title="Resumen Ejecutivo">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recomendación Final</h3>

          {van > 0 && tir > formData.tasaDescuento && indiceRentabilidad > 1 ? (
            <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg">
              <p className="text-lg font-semibold text-green-800 mb-2">
                ✓ SE RECOMIENDA ACEPTAR EL PROYECTO
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>VAN positivo: {formatearMoneda(van)}</li>
                <li>TIR ({formatearPorcentaje(tir * 100)}) mayor que tasa de descuento ({formatearPorcentaje(formData.tasaDescuento * 100)})</li>
                <li>Índice de rentabilidad mayor a 1: {indiceRentabilidad.toFixed(2)}</li>
                <li>Recuperación de inversión en {payback >= 0 ? `${payback.toFixed(2)} años` : 'N/A'}</li>
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-lg font-semibold text-red-800 mb-2">
                ✗ SE RECOMIENDA RECHAZAR EL PROYECTO
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                {van <= 0 && <li>VAN negativo o nulo: {formatearMoneda(van)}</li>}
                {tir <= formData.tasaDescuento && (
                  <li>TIR ({formatearPorcentaje(tir * 100)}) menor o igual que tasa de descuento ({formatearPorcentaje(formData.tasaDescuento * 100)})</li>
                )}
                {indiceRentabilidad <= 1 && <li>Índice de rentabilidad menor o igual a 1: {indiceRentabilidad.toFixed(2)}</li>}
                {payback < 0 && <li>No se recupera la inversión</li>}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VanTir;
