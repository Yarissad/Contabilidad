// ============= REGRESIÓN LINEAL =============
export const calcularRegresionLineal = (data, variable) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  data.forEach((item, index) => {
    const x = index + 1; // Periodos: 1, 2, 3...
    const y = item[variable];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const interseccion = (sumY - pendiente * sumX) / n;

  // Calcular R²
  const promY = sumY / n;
  let ssRes = 0, ssTot = 0;

  data.forEach((item, index) => {
    const x = index + 1;
    const y = item[variable];
    const yPred = pendiente * x + interseccion;
    ssRes += Math.pow(y - yPred, 2);
    ssTot += Math.pow(y - promY, 2);
  });

  const r2 = 1 - (ssRes / ssTot);

  return { pendiente, interseccion, r2 };
};

export const proyectarConRegresion = (data, variable, periodosAdelante) => {
  const { pendiente, interseccion, r2 } = calcularRegresionLineal(data, variable);
  const proyecciones = [];

  const ultimoYear = data[data.length - 1].year;

  for (let i = 1; i <= periodosAdelante; i++) {
    const x = data.length + i;
    const valor = pendiente * x + interseccion;
    proyecciones.push({
      year: ultimoYear + i,
      [variable]: Math.max(0, Math.round(valor)), // No valores negativos
      tipo: 'proyectado'
    });
  }

  return { proyecciones, pendiente, interseccion, r2 };
};

// ============= ANÁLISIS DE RENTABILIDAD =============
export const calcularIndicadoresRentabilidad = (data) => {
  return data.map(item => {
    const utilidadBruta = item.ventas - item.costoVentas;
    const utilidadOperativa = utilidadBruta - item.gastosOperativos;
    const utilidadNeta = utilidadOperativa - item.gastosFinancieros;
    const activoTotal = item.activoCirculante + item.activoFijo;
    const pasivoTotal = item.pasivoCirculante + item.pasivoLargoPlazo;

    return {
      year: item.year,
      // Márgenes
      margenBruto: (utilidadBruta / item.ventas) * 100,
      margenOperativo: (utilidadOperativa / item.ventas) * 100,
      margenNeto: (utilidadNeta / item.ventas) * 100,

      // Rentabilidad
      ROA: (utilidadNeta / activoTotal) * 100, // Return on Assets
      ROE: (utilidadNeta / item.patrimonio) * 100, // Return on Equity

      // Valores absolutos
      utilidadBruta,
      utilidadOperativa,
      utilidadNeta,
      activoTotal,
      pasivoTotal,
    };
  });
};

// ============= RAZONES FINANCIERAS =============
export const calcularRazonesFinancieras = (data) => {
  return data.map(item => {
    const activoTotal = item.activoCirculante + item.activoFijo;
    const pasivoTotal = item.pasivoCirculante + item.pasivoLargoPlazo;

    return {
      year: item.year,
      // Liquidez
      razonCorriente: item.activoCirculante / item.pasivoCirculante,
      pruebaAcida: (item.activoCirculante * 0.7) / item.pasivoCirculante, // Asumiendo 30% inventario

      // Endeudamiento
      razonDeuda: pasivoTotal / activoTotal,
      razonDeudaPatrimonio: pasivoTotal / item.patrimonio,

      // Cobertura
      coberturaIntereses: (item.ventas - item.costoVentas - item.gastosOperativos) / item.gastosFinancieros,
    };
  });
};

// ============= VAN (Valor Actual Neto) =============
export const calcularVAN = (inversionInicial, flujos, tasaDescuento) => {
  let van = -inversionInicial;

  flujos.forEach((flujo, index) => {
    const periodo = index + 1;
    van += flujo / Math.pow(1 + tasaDescuento, periodo);
  });

  return van;
};

// ============= TIR (Tasa Interna de Retorno) =============
export const calcularTIR = (inversionInicial, flujos, precision = 0.0001) => {
  let tirBaja = 0;
  let tirAlta = 1;
  let tir = 0.1;
  let van = 0;
  let iteraciones = 0;
  const maxIteraciones = 1000;

  // Método de bisección
  while (iteraciones < maxIteraciones) {
    van = calcularVAN(inversionInicial, flujos, tir);

    if (Math.abs(van) < precision) {
      return tir;
    }

    if (van > 0) {
      tirBaja = tir;
    } else {
      tirAlta = tir;
    }

    tir = (tirBaja + tirAlta) / 2;
    iteraciones++;
  }

  return tir;
};

// ============= PERIODO DE RECUPERACIÓN (PAYBACK) =============
export const calcularPayback = (inversionInicial, flujos) => {
  let acumulado = 0;

  for (let i = 0; i < flujos.length; i++) {
    acumulado += flujos[i];
    if (acumulado >= inversionInicial) {
      // Calcular la fracción del año
      const flujoAnterior = i > 0 ? flujos.slice(0, i).reduce((a, b) => a + b, 0) : 0;
      const fraccion = (inversionInicial - flujoAnterior) / flujos[i];
      return i + fraccion;
    }
  }

  return -1; // No se recupera
};

// ============= ÍNDICE DE RENTABILIDAD =============
export const calcularIndiceRentabilidad = (inversionInicial, flujos, tasaDescuento) => {
  let vpFlujos = 0;

  flujos.forEach((flujo, index) => {
    const periodo = index + 1;
    vpFlujos += flujo / Math.pow(1 + tasaDescuento, periodo);
  });

  return vpFlujos / inversionInicial;
};

// ============= ANÁLISIS DE SENSIBILIDAD =============
export const calcularAnalisisSensibilidad = (inversionInicial, flujos, tasaBase) => {
  const variaciones = [-0.05, -0.03, -0.01, 0, 0.01, 0.03, 0.05];

  return variaciones.map(variacion => {
    const tasa = tasaBase + variacion;
    const van = calcularVAN(inversionInicial, flujos, tasa);

    return {
      tasa: tasa * 100,
      variacion: variacion * 100,
      van: van,
    };
  });
};

// ============= PUNTO DE EQUILIBRIO =============
export const calcularPuntoEquilibrio = (costosVentas, gastosOperativos, precioVenta, costoVariable) => {
  const costosVariables = costosVentas;
  const costosFijos = gastosOperativos;
  const margenContribucion = precioVenta - costoVariable;

  const unidadesEquilibrio = costosFijos / margenContribucion;
  const ventasEquilibrio = unidadesEquilibrio * precioVenta;

  return {
    unidadesEquilibrio,
    ventasEquilibrio,
    margenContribucion,
    margenContribucionPorcentaje: (margenContribucion / precioVenta) * 100,
  };
};

// ============= FORMATO DE MONEDA =============
export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

export const formatearPorcentaje = (valor, decimales = 2) => {
  return `${valor.toFixed(decimales)}%`;
};
