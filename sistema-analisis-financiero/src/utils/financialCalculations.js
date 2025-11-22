// ============= REGRESIÓN LINEAL =============
export const calcularRegresionLineal = (data, variable) => {
  const n = data.length;
  
  // CRÍTICO: Ordenar datos por año antes de procesar
  const datosOrdenados = [...data].sort((a, b) => a.year - b.year);
  
  // Validación de entrada
  if (n < 2) {
    return { pendiente: 0, interseccion: 0, r2: 0 };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  datosOrdenados.forEach((item, index) => {
    const x = index + 1; // Periodos: 1, 2, 3...
    const y = item[variable] || 0; // Protección contra valores undefined/null
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  // Calcular pendiente e intersección con protección contra división por cero
  const denominador = (n * sumX2 - sumX * sumX);
  const pendiente = denominador !== 0 ? (n * sumXY - sumX * sumY) / denominador : 0;
  const interseccion = n !== 0 ? (sumY - pendiente * sumX) / n : 0;

  // Calcular R²
  const promY = sumY / n;
  let ssRes = 0, ssTot = 0;

  datosOrdenados.forEach((item, index) => {
    const x = index + 1;
    const y = item[variable] || 0;
    const yPred = pendiente * x + interseccion;
    ssRes += Math.pow(y - yPred, 2);
    ssTot += Math.pow(y - promY, 2);
  });

  // Protección contra división por cero en R²
  const r2 = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - (ssRes / ssTot))) : 0;

  return { pendiente, interseccion, r2 };
};

export const proyectarConRegresion = (data, variable, periodosAdelante) => {
  // Ordenar datos por año antes de procesar
  const datosOrdenados = [...data].sort((a, b) => a.year - b.year);
  
  const { pendiente, interseccion, r2 } = calcularRegresionLineal(datosOrdenados, variable);
  const proyecciones = [];

  const ultimoYear = Math.max(...datosOrdenados.map(item => item.year));

  for (let i = 1; i <= periodosAdelante; i++) {
    const x = datosOrdenados.length + i;
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
      // Márgenes (protección contra división por cero)
      margenBruto: item.ventas !== 0 ? (utilidadBruta / item.ventas) * 100 : 0,
      margenOperativo: item.ventas !== 0 ? (utilidadOperativa / item.ventas) * 100 : 0,
      margenNeto: item.ventas !== 0 ? (utilidadNeta / item.ventas) * 100 : 0,

      // Rentabilidad (protección contra división por cero)
      ROA: activoTotal !== 0 ? (utilidadNeta / activoTotal) * 100 : 0, // Return on Assets
      ROE: item.patrimonio !== 0 ? (utilidadNeta / item.patrimonio) * 100 : 0, // Return on Equity

      // Valores absolutos
      utilidadBruta,
      utilidadOperativa,
      utilidadNeta,
      activoTotal,
      pasivoTotal,
    };
  });
};


// ============= RAZONES FINANCIERAS (DESHABILITADO) =============
/*
export const calcularRazonesFinancieras = (data) => {
  return data.map(item => {
    const activoTotal = item.activoCirculante + item.activoFijo;
    const pasivoTotal = item.pasivoCirculante + item.pasivoLargoPlazo;
    
    // Calcular EBIT (Earnings Before Interest and Taxes)
    const utilidadBruta = item.ventas - item.costoVentas;
    const ebit = utilidadBruta - item.gastosOperativos;
    
    // Estimación de inventario (asumiendo 30% del activo circulante)
    const inventarioEstimado = item.activoCirculante * 0.3;
    const activoLiquido = item.activoCirculante - inventarioEstimado;

    return {
      year: item.year,
      // Liquidez
      razonCorriente: item.pasivoCirculante !== 0 ? item.activoCirculante / item.pasivoCirculante : 0,
      pruebaAcida: item.pasivoCirculante !== 0 ? activoLiquido / item.pasivoCirculante : 0,

      // Endeudamiento
      razonDeuda: activoTotal !== 0 ? pasivoTotal / activoTotal : 0,
      razonDeudaPatrimonio: item.patrimonio !== 0 ? pasivoTotal / item.patrimonio : 0,

      // Cobertura
      coberturaIntereses: item.gastosFinancieros !== 0 ? ebit / item.gastosFinancieros : 0,
    };
  });
};
*/

// ============= ANÁLISIS DE ESTACIONALIDAD (IVE) =============
export const calcularIVE = (datosMenuales) => {
  // datosMenuales debe ser un array de objetos: { year, month, ventas }
  if (!datosMenuales || datosMenuales.length === 0) {
    return { ive: [], promedioMensual: 0, coeficienteVariacion: 0 };
  }

  // Agrupar por mes
  const ventasPorMes = {};
  for (let mes = 1; mes <= 12; mes++) {
    ventasPorMes[mes] = [];
  }

  datosMenuales.forEach(dato => {
    if (ventasPorMes[dato.month]) {
      ventasPorMes[dato.month].push(dato.ventas);
    }
  });

  // Calcular promedios mensuales
  const promediosPorMes = {};
  let sumaPromedios = 0;
  let mesesConDatos = 0;

  for (let mes = 1; mes <= 12; mes++) {
    if (ventasPorMes[mes].length > 0) {
      const promedio = ventasPorMes[mes].reduce((a, b) => a + b, 0) / ventasPorMes[mes].length;
      promediosPorMes[mes] = promedio;
      sumaPromedios += promedio;
      mesesConDatos++;
    } else {
      promediosPorMes[mes] = 0;
    }
  }

  const promedioAnual = sumaPromedios / mesesConDatos;

  // Calcular IVE para cada mes
  const ive = [];
  let sumaDesviaciones = 0;

  for (let mes = 1; mes <= 12; mes++) {
    const indice = promedioAnual !== 0 ? promediosPorMes[mes] / promedioAnual : 1;
    const desviacion = Math.abs(indice - 1);
    sumaDesviaciones += desviacion;
    
    ive.push({
      mes,
      nombreMes: getNombreMes(mes),
      promedio: promediosPorMes[mes],
      ive: indice,
      porcentaje: (indice - 1) * 100
    });
  }

  const coeficienteVariacion = (sumaDesviaciones / 12) * 100;

  return {
    ive,
    promedioMensual: promedioAnual,
    coeficienteVariacion,
    interpretacion: interpretarEstacionalidad(coeficienteVariacion)
  };
};

export const proyectarConIVE = (datosHistoricos, variable, añosAProyectar, datosMenuales = null) => {
  // Primero hacer regresión lineal con datos anuales
  const regresion = calcularRegresionLineal(datosHistoricos, variable);
  
  // Si no hay datos mensuales, usar solo regresión lineal
  if (!datosMenuales) {
    return proyectarConRegresion(datosHistoricos, variable, añosAProyectar);
  }

  // Calcular IVE
  const resultadoIVE = calcularIVE(datosMenuales);
  
  // Generar proyecciones anuales base
  const ultimoAño = datosHistoricos[datosHistoricos.length - 1].year;
  const proyeccionesAnuales = [];

  for (let i = 1; i <= añosAProyectar; i++) {
    const x = datosHistoricos.length + i;
    const valorBase = regresion.pendiente * x + regresion.interseccion;
    proyeccionesAnuales.push({
      year: ultimoAño + i,
      valorAnual: Math.max(0, valorBase)
    });
  }

  // Distribuir anualmente según patrones estacionales
  const proyeccionesDetalladas = [];

  proyeccionesAnuales.forEach(proyeccionAnual => {
    const proyeccionesMensuales = [];
    
    resultadoIVE.ive.forEach(mesIVE => {
      const valorMensual = (proyeccionAnual.valorAnual / 12) * mesIVE.ive;
      proyeccionesMensuales.push({
        year: proyeccionAnual.year,
        month: mesIVE.mes,
        nombreMes: mesIVE.nombreMes,
        [variable]: Math.max(0, Math.round(valorMensual)),
        ive: mesIVE.ive,
        tipo: 'proyectado'
      });
    });

    proyeccionesDetalladas.push({
      year: proyeccionAnual.year,
      valorAnual: proyeccionAnual.valorAnual,
      meses: proyeccionesMensuales,
      [variable]: proyeccionAnual.valorAnual
    });
  });

  return {
    proyeccionesAnuales: proyeccionesDetalladas,
    ive: resultadoIVE,
    regresion,
    metodologia: 'Regresión Lineal + Índice de Variación Estacional'
  };
};

const getNombreMes = (mes) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || 'Desconocido';
};

// ============= PROYECCIÓN MENSUAL CON IVE Y META ANUAL =============
export const proyectarVentasMensualesConMeta = (datosMenuales, metaAnual, añoProyeccion) => {
  // Validación de entrada
  if (!datosMenuales || datosMenuales.length === 0 || !metaAnual || metaAnual <= 0) {
    return {
      proyeccionMensual: [],
      ive: null,
      resumen: {
        metaAnual,
        añoProyeccion,
        totalProyectado: 0,
        diferencia: 0
      }
    };
  }

  // Calcular IVE primero
  const resultadoIVE = calcularIVE(datosMenuales);
  
  // Distribuir la meta anual usando los índices IVE
  const proyeccionMensual = [];
  let totalProyectado = 0;
  
  resultadoIVE.ive.forEach(mesIVE => {
    // Calcular ventas mensuales: (Meta Anual / 12) * IVE del mes
    const ventasDelMes = (metaAnual / 12) * mesIVE.ive;
    totalProyectado += ventasDelMes;
    
    proyeccionMensual.push({
      year: añoProyeccion,
      month: mesIVE.mes,
      nombreMes: mesIVE.nombreMes,
      ventas: Math.round(ventasDelMes),
      ive: mesIVE.ive,
      porcentajeDelAño: (ventasDelMes / metaAnual) * 100,
      tipo: 'proyectado'
    });
  });

  // Ajustar para que la suma exacta sea igual a la meta anual
  const diferencia = metaAnual - totalProyectado;
  if (Math.abs(diferencia) > 1) {
    // Distribuir la diferencia proporcionalmente
    proyeccionMensual.forEach(mes => {
      const ajuste = (mes.ventas / totalProyectado) * diferencia;
      mes.ventas = Math.round(mes.ventas + ajuste);
    });
  }

  // Recalcular total después del ajuste
  const totalFinal = proyeccionMensual.reduce((sum, mes) => sum + mes.ventas, 0);

  return {
    proyeccionMensual,
    ive: resultadoIVE,
    resumen: {
      metaAnual,
      añoProyeccion,
      totalProyectado: totalFinal,
      diferencia: metaAnual - totalFinal,
      metodologia: 'Distribución con IVE personalizada'
    }
  };
};

const interpretarEstacionalidad = (coeficiente) => {
  if (coeficiente < 5) {
    return {
      nivel: 'Baja',
      descripcion: 'Los datos muestran poca variación estacional',
      recomendacion: 'La regresión lineal simple puede ser suficiente'
    };
  } else if (coeficiente < 15) {
    return {
      nivel: 'Moderada',
      descripcion: 'Existe variación estacional moderada',
      recomendacion: 'El análisis con IVE mejorará la precisión de las proyecciones'
    };
  } else {
    return {
      nivel: 'Alta',
      descripcion: 'Los datos muestran alta variabilidad estacional',
      recomendacion: 'Es fundamental usar IVE para proyecciones precisas'
    };
  }
};

// ============= ANÁLISIS COMBINADO (REGRESIÓN + IVE + RENTABILIDAD) =============
export const analizarProyeccionCompleta = (datosHistoricos, datosMenuales, añosAProyectar = 3) => {
  if (!datosHistoricos || datosHistoricos.length === 0) {
    return {
      analisisPorVariable: {},
      datosProyectados: [],
      indicadoresRentabilidad: [],
      resumen: {
        metodologia: 'Sin datos históricos disponibles',
        añosHistoricos: 0,
        añosProyectados: 0,
        variablesAnalizadas: []
      }
    };
  }

  const variables = ['ventas', 'costoVentas', 'gastosOperativos'];
  const analisisCompleto = {};

  variables.forEach(variable => {
    // Verificar si la variable existe en los datos históricos
    if (datosHistoricos.some(item => item[variable] !== undefined)) {
      const datosMenualesVariable = datosMenuales?.filter(item => item[variable] !== undefined);
      
      analisisCompleto[variable] = proyectarConIVE(
        datosHistoricos, 
        variable, 
        añosAProyectar, 
        datosMenualesVariable
      );
    }
  });

  // Construir datos financieros proyectados completos manteniendo ecuación contable
  const datosProyectados = [];
  const ultimoDatoHistorico = datosHistoricos[datosHistoricos.length - 1];
  
  for (let i = 1; i <= añosAProyectar; i++) {
    const año = ultimoDatoHistorico.year + i;
    
    // Obtener valores proyectados o usar regresión simple si no hay IVE
    const ventasProyectadas = analisisCompleto.ventas?.proyeccionesAnuales.find(p => p.year === año)?.ventas || 
                             proyectarConRegresion(datosHistoricos, 'ventas', i).proyecciones[i-1]?.ventas || 
                             ultimoDatoHistorico.ventas * (1.05 ** i); // Crecimiento 5% anual por defecto

    const costoVentasProyectado = analisisCompleto.costoVentas?.proyeccionesAnuales.find(p => p.year === año)?.costoVentas || 
                                 proyectarConRegresion(datosHistoricos, 'costoVentas', i).proyecciones[i-1]?.costoVentas ||
                                 ventasProyectadas * 0.6; // 60% de ventas por defecto

    const gastosOperativosProyectados = analisisCompleto.gastosOperativos?.proyeccionesAnuales.find(p => p.year === año)?.gastosOperativos || 
                                       proyectarConRegresion(datosHistoricos, 'gastosOperativos', i).proyecciones[i-1]?.gastosOperativos ||
                                       ultimoDatoHistorico.gastosOperativos * (1.03 ** i); // Crecimiento 3% anual

    // Calcular utilidad neta proyectada
    const utilidadBruta = ventasProyectadas - costoVentasProyectado;
    const utilidadOperativa = utilidadBruta - gastosOperativosProyectados;
    const utilidadNeta = utilidadOperativa - ultimoDatoHistorico.gastosFinancieros;

    // Proyectar activos manteniendo proporciones
    const ratioActivoCirculante = ultimoDatoHistorico.activoCirculante / ultimoDatoHistorico.ventas;
    const ratioActivoFijo = ultimoDatoHistorico.activoFijo / ultimoDatoHistorico.ventas;
    
    const activoCirculanteProyectado = ventasProyectadas * ratioActivoCirculante;
    const activoFijoProyectado = ventasProyectadas * ratioActivoFijo;
    const activoTotalProyectado = activoCirculanteProyectado + activoFijoProyectado;

    // Mantener la misma estructura de pasivos
    const pasivoCirculanteProyectado = ultimoDatoHistorico.pasivoCirculante;
    const pasivoLargoPlazoProyectado = ultimoDatoHistorico.pasivoLargoPlazo;
    const pasivoTotalProyectado = pasivoCirculanteProyectado + pasivoLargoPlazoProyectado;

    // Calcular patrimonio para mantener ecuación contable: Activos = Pasivos + Patrimonio
    const patrimonioProyectado = activoTotalProyectado - pasivoTotalProyectado;

    const datosAño = {
      year: año,
      ventas: Math.round(ventasProyectadas),
      costoVentas: Math.round(costoVentasProyectado),
      gastosOperativos: Math.round(gastosOperativosProyectados),
      gastosFinancieros: ultimoDatoHistorico.gastosFinancieros,
      activoCirculante: Math.round(activoCirculanteProyectado),
      activoFijo: Math.round(activoFijoProyectado),
      pasivoCirculante: pasivoCirculanteProyectado,
      pasivoLargoPlazo: pasivoLargoPlazoProyectado,
      patrimonio: Math.round(patrimonioProyectado),
      tipo: 'proyectado'
    };

    datosProyectados.push(datosAño);
  }

  // Calcular indicadores de rentabilidad proyectados
  const todosLosDatos = [...datosHistoricos, ...datosProyectados];
  const indicadoresCompletos = calcularIndicadoresRentabilidad(todosLosDatos);

  return {
    analisisPorVariable: analisisCompleto,
    datosProyectados,
    indicadoresRentabilidad: indicadoresCompletos,
    resumen: {
      metodologia: 'Análisis Integral: Regresión Lineal + IVE + Rentabilidad',
      añosHistoricos: datosHistoricos.length,
      añosProyectados: añosAProyectar,
      variablesAnalizadas: Object.keys(analisisCompleto)
    }
  };
};

// ============= VAN (Valor Actual Neto) =============
export const calcularVAN = (inversionInicial, flujos, tasaDescuento) => {
  // Validación de entrada
  if (tasaDescuento < 0 || flujos.length === 0) {
    return -inversionInicial;
  }

  let van = -inversionInicial;

  flujos.forEach((flujo, index) => {
    const periodo = index + 1;
    const factorDescuento = Math.pow(1 + tasaDescuento, periodo);
    van += flujo / factorDescuento;
  });

  return van;
};

// ============= TIR (Tasa Interna de Retorno) =============
export const calcularTIR = (inversionInicial, flujos, precision = 0.0001) => {
  // Validación de entrada
  if (inversionInicial <= 0 || flujos.length === 0) {
    return 0;
  }

  // Verificar si hay flujos positivos
  const hayFlujosPositivos = flujos.some(flujo => flujo > 0);
  if (!hayFlujosPositivos) {
    return 0;
  }

  let tirBaja = 0;
  let tirAlta = 5; // Aumentamos el rango superior
  let tir = 0.1;
  let iteraciones = 0;
  const maxIteraciones = 1000;

  // Encontrar un rango válido primero
  let vanAlta = calcularVAN(inversionInicial, flujos, tirAlta);
  while (vanAlta > 0 && tirAlta < 10) {
    tirAlta *= 2;
    vanAlta = calcularVAN(inversionInicial, flujos, tirAlta);
  }

  // Método de bisección mejorado
  while (iteraciones < maxIteraciones) {
    tir = (tirBaja + tirAlta) / 2;
    const van = calcularVAN(inversionInicial, flujos, tir);

    if (Math.abs(van) < precision) {
      return tir;
    }

    if (van > 0) {
      tirBaja = tir;
    } else {
      tirAlta = tir;
    }

    // Evitar que el rango se vuelva demasiado pequeño
    if (Math.abs(tirAlta - tirBaja) < precision) {
      break;
    }

    iteraciones++;
  }

  return tir;
};

// ============= PERIODO DE RECUPERACIÓN (PAYBACK) =============
export const calcularPayback = (inversionInicial, flujos) => {
  if (inversionInicial <= 0 || flujos.length === 0) {
    return -1;
  }

  let acumulado = 0;

  for (let i = 0; i < flujos.length; i++) {
    const flujoAnterior = acumulado;
    acumulado += flujos[i];
    
    if (acumulado >= inversionInicial) {
      // Calcular la fracción del año correctamente
      if (flujos[i] === 0) {
        return i; // Si el flujo es cero, no hay fracción
      }
      
      const faltantePorRecuperar = inversionInicial - flujoAnterior;
      const fraccion = faltantePorRecuperar / flujos[i];
      return i + fraccion;
    }
  }

  return -1; // No se recupera en el horizonte de tiempo
};

// ============= ÍNDICE DE RENTABILIDAD =============
export const calcularIndiceRentabilidad = (inversionInicial, flujos, tasaDescuento) => {
  // Validación de entrada
  if (inversionInicial <= 0 || tasaDescuento < 0 || flujos.length === 0) {
    return 0;
  }

  let vpFlujos = 0;

  flujos.forEach((flujo, index) => {
    const periodo = index + 1;
    const factorDescuento = Math.pow(1 + tasaDescuento, periodo);
    vpFlujos += flujo / factorDescuento;
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
export const calcularPuntoEquilibrio = (ventas, costosVentas, gastosOperativos, unidadesVendidas = 1) => {
  // Validación de entrada
  if (ventas <= 0 || unidadesVendidas <= 0) {
    return {
      unidadesEquilibrio: 0,
      ventasEquilibrio: 0,
      margenContribucion: 0,
      margenContribucionPorcentaje: 0,
    };
  }

  const precioVentaUnitario = ventas / unidadesVendidas;
  const costoVariableUnitario = costosVentas / unidadesVendidas;
  const costosFijos = gastosOperativos;
  const margenContribucionUnitario = precioVentaUnitario - costoVariableUnitario;

  const unidadesEquilibrio = margenContribucionUnitario !== 0 ? costosFijos / margenContribucionUnitario : 0;
  const ventasEquilibrio = unidadesEquilibrio * precioVentaUnitario;
  const margenContribucionPorcentaje = precioVentaUnitario !== 0 ? (margenContribucionUnitario / precioVentaUnitario) * 100 : 0;

  return {
    unidadesEquilibrio: Math.max(0, unidadesEquilibrio),
    ventasEquilibrio: Math.max(0, ventasEquilibrio),
    margenContribucion: margenContribucionUnitario,
    margenContribucionPorcentaje,
  };
};

// ============= FORMATO DE MONEDA =============
export const formatearMoneda = (valor) => {
  // Validación de entrada
  if (typeof valor !== 'number' || isNaN(valor)) {
    return 'Q0';
  }

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

export const formatearPorcentaje = (valor, decimales = 2) => {
  // Validación de entrada
  if (typeof valor !== 'number' || isNaN(valor)) {
    return '0.00%';
  }
  
  return `${valor.toFixed(decimales)}%`;
};

// ============= FUNCIONES DE VALIDACIÓN =============
export const validarDatosFinancieros = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { valido: false, mensaje: 'No hay datos para procesar' };
  }

  const camposRequeridos = ['year', 'ventas', 'costoVentas', 'gastosOperativos', 'gastosFinancieros', 
                           'activoCirculante', 'activoFijo', 'pasivoCirculante', 'pasivoLargoPlazo', 'patrimonio'];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    for (let campo of camposRequeridos) {
      if (typeof item[campo] !== 'number' || isNaN(item[campo])) {
        return { valido: false, mensaje: `Dato inválido en ${campo} para el año ${item.year}` };
      }
    }
    
    // Validaciones de lógica empresarial
    if (item.ventas < 0) {
      return { valido: false, mensaje: `Las ventas no pueden ser negativas en ${item.year}` };
    }
    
    if (item.costoVentas > item.ventas) {
      return { valido: false, mensaje: `El costo de ventas no puede ser mayor a las ventas en ${item.year}` };
    }
    
    const activoTotal = item.activoCirculante + item.activoFijo;
    const pasivoTotal = item.pasivoCirculante + item.pasivoLargoPlazo;
    const ecuacionContable = Math.abs(activoTotal - (pasivoTotal + item.patrimonio));

    // Tolerancia: 100 pesos para datos históricos, 1000 para proyectados
    const tolerancia = item.tipo === 'proyectado' ? 1000 : 100;

    if (ecuacionContable > tolerancia) {
      return {
        valido: false,
        mensaje: `La ecuación contable no cuadra en ${item.year}: Activos (${new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }).format(activoTotal)}) ≠ Pasivos + Patrimonio (${new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }).format(pasivoTotal + item.patrimonio)}). Diferencia: ${new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 }).format(ecuacionContable)}`
      };
    }
  }

  return { valido: true, mensaje: 'Datos válidos' };
};

export const validarProyectoInversion = (inversionInicial, flujos, tasaDescuento) => {
  if (typeof inversionInicial !== 'number' || inversionInicial <= 0) {
    return { valido: false, mensaje: 'La inversión inicial debe ser un número positivo' };
  }
  
  if (!Array.isArray(flujos) || flujos.length === 0) {
    return { valido: false, mensaje: 'Debe proporcionar flujos de efectivo' };
  }
  
  if (typeof tasaDescuento !== 'number' || tasaDescuento < 0) {
    return { valido: false, mensaje: 'La tasa de descuento debe ser un número no negativo' };
  }
  
  for (let i = 0; i < flujos.length; i++) {
    if (typeof flujos[i] !== 'number' || isNaN(flujos[i])) {
      return { valido: false, mensaje: `El flujo del periodo ${i + 1} debe ser un número válido` };
    }
  }
  
  return { valido: true, mensaje: 'Datos del proyecto válidos' };
};
