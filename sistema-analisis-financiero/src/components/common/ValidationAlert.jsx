import { validarDatosFinancieros } from '../../utils/financialCalculations';

const ValidationAlert = ({ data, children }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Sin datos:</strong> No hay información financiera disponible. 
              Por favor, agregue datos en la sección "Datos Históricos".
            </p>
          </div>
        </div>
      </div>
    );
  }

  const validacion = validarDatosFinancieros(data);

  if (!validacion.valido) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">❌</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              <strong>Error en los datos:</strong> {validacion.mensaje}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Por favor, revise y corrija los datos financieros antes de continuar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si los datos son válidos, mostrar el contenido
  return children;
};

export default ValidationAlert;