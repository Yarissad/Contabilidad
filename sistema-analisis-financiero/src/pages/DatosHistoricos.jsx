import { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import Card from '../components/common/Card';
import { formatearMoneda } from '../utils/financialCalculations';

const DatosHistoricos = () => {
  const { historicalData, addHistoricalYear, updateHistoricalYear, deleteHistoricalYear } = useFinancial();

  const [nuevoAnio, setNuevoAnio] = useState({
    year: new Date().getFullYear(),
    ventas: 0,
    costoVentas: 0,
    gastosOperativos: 0,
    gastosFinancieros: 0,
    activoCirculante: 0,
    activoFijo: 0,
    pasivoCirculante: 0,
    pasivoLargoPlazo: 0,
    patrimonio: 0,
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [anioEditando, setAnioEditando] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoAnio(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modoEdicion) {
      updateHistoricalYear(anioEditando, nuevoAnio);
      setModoEdicion(false);
      setAnioEditando(null);
    } else {
      // Verificar que el año no exista ya
      if (historicalData.some(item => item.year === nuevoAnio.year)) {
        alert('Este año ya existe. Por favor usa la opción de editar o elige otro año.');
        return;
      }
      addHistoricalYear(nuevoAnio);
    }

    setMostrarFormulario(false);
    resetForm();
  };

  const resetForm = () => {
    setNuevoAnio({
      year: new Date().getFullYear(),
      ventas: 0,
      costoVentas: 0,
      gastosOperativos: 0,
      gastosFinancieros: 0,
      activoCirculante: 0,
      activoFijo: 0,
      pasivoCirculante: 0,
      pasivoLargoPlazo: 0,
      patrimonio: 0,
    });
  };

  const handleEditar = (anio) => {
    setNuevoAnio(anio);
    setAnioEditando(anio.year);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = (year) => {
    if (window.confirm(`¿Estás seguro de eliminar los datos del año ${year}?`)) {
      deleteHistoricalYear(year);
    }
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setAnioEditando(null);
    resetForm();
  };

  const campos = [
    { name: 'year', label: 'Año', type: 'number', category: 'general', disabled: modoEdicion },
    { name: 'ventas', label: 'Ventas', type: 'number', category: 'Estado de Resultados' },
    { name: 'costoVentas', label: 'Costo de Ventas', type: 'number', category: 'Estado de Resultados' },
    { name: 'gastosOperativos', label: 'Gastos Operativos', type: 'number', category: 'Estado de Resultados' },
    { name: 'gastosFinancieros', label: 'Gastos Financieros', type: 'number', category: 'Estado de Resultados' },
    { name: 'activoCirculante', label: 'Activo Circulante', type: 'number', category: 'Balance General' },
    { name: 'activoFijo', label: 'Activo Fijo', type: 'number', category: 'Balance General' },
    { name: 'pasivoCirculante', label: 'Pasivo Circulante', type: 'number', category: 'Balance General' },
    { name: 'pasivoLargoPlazo', label: 'Pasivo a Largo Plazo', type: 'number', category: 'Balance General' },
    { name: 'patrimonio', label: 'Patrimonio', type: 'number', category: 'Balance General' },
  ];

  const categorias = [...new Set(campos.map(c => c.category))];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2">Datos Históricos</h2>
        <p className="text-blue-100">Gestión de información financiera histórica de la empresa</p>
      </div>

      {historicalData.length === 0 && !mostrarFormulario && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay datos registrados</h3>
            <p className="text-gray-500 mb-6">
              Comienza agregando información financiera de tu empresa para realizar análisis y proyecciones
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              + Agregar Primer Año
            </button>
          </div>
        </Card>
      )}

      {historicalData.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            {mostrarFormulario ? 'Cancelar' : '+ Agregar Año'}
          </button>
        </div>
      )}

      {mostrarFormulario && (
        <Card title={modoEdicion ? `Editar Año ${anioEditando}` : 'Agregar Nuevo Año'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {categorias.map(categoria => (
              <div key={categoria}>
                <h4 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">
                  {categoria}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campos.filter(c => c.category === categoria).map(campo => (
                    <div key={campo.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {campo.label}
                      </label>
                      <input
                        type={campo.type}
                        name={campo.name}
                        value={nuevoAnio[campo.name]}
                        onChange={handleChange}
                        disabled={campo.disabled}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          campo.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCancelar}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {historicalData.length > 0 && (
        <Card title="Historial de Datos Financieros">
          <div className="space-y-8">
            {historicalData.sort((a, b) => b.year - a.year).map((anio) => {
              const activoTotal = anio.activoCirculante + anio.activoFijo;
              const pasivoTotal = anio.pasivoCirculante + anio.pasivoLargoPlazo;
              const utilidadBruta = anio.ventas - anio.costoVentas;
              const utilidadOperativa = utilidadBruta - anio.gastosOperativos;
              const utilidadNeta = utilidadOperativa - anio.gastosFinancieros;

              return (
                <div key={anio.year} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-r-lg relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-blue-600">Año {anio.year}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditar(anio)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(anio.year)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Estado de Resultados */}
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-semibold text-lg text-gray-800 mb-3 border-b pb-2">
                        Estado de Resultados
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ventas:</span>
                          <span className="font-semibold">{formatearMoneda(anio.ventas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">- Costo de Ventas:</span>
                          <span className="text-red-600">({formatearMoneda(anio.costoVentas)})</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-gray-600 font-medium">= Utilidad Bruta:</span>
                          <span className="font-semibold text-green-600">{formatearMoneda(utilidadBruta)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">- Gastos Operativos:</span>
                          <span className="text-red-600">({formatearMoneda(anio.gastosOperativos)})</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-gray-600 font-medium">= Utilidad Operativa:</span>
                          <span className="font-semibold text-green-600">{formatearMoneda(utilidadOperativa)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">- Gastos Financieros:</span>
                          <span className="text-red-600">({formatearMoneda(anio.gastosFinancieros)})</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-blue-500 pt-2">
                          <span className="text-gray-800 font-bold">= Utilidad Neta:</span>
                          <span className="font-bold text-blue-600">{formatearMoneda(utilidadNeta)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Balance General */}
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-semibold text-lg text-gray-800 mb-3 border-b pb-2">
                        Balance General
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-semibold text-blue-600 mb-1">ACTIVOS</p>
                          <div className="pl-3 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Activo Circulante:</span>
                              <span>{formatearMoneda(anio.activoCirculante)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Activo Fijo:</span>
                              <span>{formatearMoneda(anio.activoFijo)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-semibold">
                              <span>Total Activos:</span>
                              <span className="text-blue-600">{formatearMoneda(activoTotal)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-red-600 mb-1">PASIVOS</p>
                          <div className="pl-3 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pasivo Circulante:</span>
                              <span>{formatearMoneda(anio.pasivoCirculante)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pasivo Largo Plazo:</span>
                              <span>{formatearMoneda(anio.pasivoLargoPlazo)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-semibold">
                              <span>Total Pasivos:</span>
                              <span className="text-red-600">{formatearMoneda(pasivoTotal)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-gray-300 pt-2">
                          <div className="flex justify-between font-bold">
                            <span className="text-green-600">PATRIMONIO:</span>
                            <span className="text-green-600">{formatearMoneda(anio.patrimonio)}</span>
                          </div>
                        </div>

                        <div className="border-t-2 border-blue-500 pt-2 bg-blue-50 -mx-4 px-4 py-2 rounded">
                          <div className="flex justify-between font-bold text-blue-700">
                            <span>Pasivo + Patrimonio:</span>
                            <span>{formatearMoneda(pasivoTotal + anio.patrimonio)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DatosHistoricos;
