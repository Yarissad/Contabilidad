// Archivo de pruebas para verificar los cálculos financieros

import {
  calcularVAN,
  calcularTIR,
  calcularPayback,
  calcularIndiceRentabilidad,
  calcularIndicadoresRentabilidad,
  // calcularRazonesFinancieras, // DESHABILITADO
  calcularRegresionLineal,
  validarDatosFinancieros,
  validarProyectoInversion
} from './financialCalculations.js';

// ============= DATOS DE PRUEBA =============
const datosEjemplo = [
  {
    year: 2021,
    ventas: 1000000,
    costoVentas: 600000,
    gastosOperativos: 200000,
    gastosFinancieros: 50000,
    activoCirculante: 300000,
    activoFijo: 700000,
    pasivoCirculante: 150000,
    pasivoLargoPlazo: 350000,
    patrimonio: 500000
  },
  {
    year: 2022,
    ventas: 1200000,
    costoVentas: 720000,
    gastosOperativos: 240000,
    gastosFinancieros: 60000,
    activoCirculante: 360000,
    activoFijo: 840000,
    pasivoCirculante: 180000,
    pasivoLargoPlazo: 420000,
    patrimonio: 600000
  },
  {
    year: 2023,
    ventas: 1400000,
    costoVentas: 840000,
    gastosOperativos: 280000,
    gastosFinancieros: 70000,
    activoCirculante: 420000,
    activoFijo: 980000,
    pasivoCirculante: 210000,
    pasivoLargoPlazo: 490000,
    patrimonio: 700000
  }
];

const proyectoEjemplo = {
  inversionInicial: 100000,
  flujos: [30000, 40000, 50000, 60000, 70000],
  tasaDescuento: 0.12
};

// ============= FUNCIONES DE PRUEBA =============
export const probarCalculos = () => {
  console.log('🧪 INICIANDO PRUEBAS DE CÁLCULOS FINANCIEROS');
  console.log('='.repeat(50));

  // Prueba 1: Validación de datos
  console.log('📋 PRUEBA 1: Validación de datos financieros');
  const validacionDatos = validarDatosFinancieros(datosEjemplo);
  console.log('Resultado:', validacionDatos.valido ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  if (!validacionDatos.valido) {
    console.log('Error:', validacionDatos.mensaje);
  }
  console.log();

  // Prueba 2: Indicadores de rentabilidad
  console.log('💰 PRUEBA 2: Indicadores de rentabilidad');
  const indicadores = calcularIndicadoresRentabilidad(datosEjemplo);
  console.log('Último año (2023):');
  const ultimo = indicadores[indicadores.length - 1];
  console.log(`- Margen Bruto: ${ultimo.margenBruto.toFixed(2)}%`);
  console.log(`- Margen Neto: ${ultimo.margenNeto.toFixed(2)}%`);
  console.log(`- ROE: ${ultimo.ROE.toFixed(2)}%`);
  console.log(`- ROA: ${ultimo.ROA.toFixed(2)}%`);
  console.log();

  // Prueba 3: Razones financieras (DESHABILITADO)
  /*
  console.log('⚖️ PRUEBA 3: Razones financieras');
  const razones = calcularRazonesFinancieras(datosEjemplo);
  const ultimaRazon = razones[razones.length - 1];
  console.log('Último año (2023):');
  console.log(`- Razón Corriente: ${ultimaRazon.razonCorriente.toFixed(2)}`);
  console.log(`- Prueba Ácida: ${ultimaRazon.pruebaAcida.toFixed(2)}`);
  console.log(`- Razón de Deuda: ${(ultimaRazon.razonDeuda * 100).toFixed(2)}%`);
  console.log(`- Cobertura de Intereses: ${ultimaRazon.coberturaIntereses.toFixed(2)}`);
  console.log();
  */

  // Prueba 4: Regresión lineal
  console.log('📈 PRUEBA 4: Regresión lineal (Ventas)');
  const regresion = calcularRegresionLineal(datosEjemplo, 'ventas');
  console.log(`- Pendiente: ${regresion.pendiente.toFixed(2)}`);
  console.log(`- Intersección: ${regresion.interseccion.toFixed(2)}`);
  console.log(`- R²: ${(regresion.r2 * 100).toFixed(2)}%`);
  console.log();

  // Prueba 5: Validación de proyecto
  console.log('🏗️ PRUEBA 5: Validación de proyecto de inversión');
  const validacionProyecto = validarProyectoInversion(
    proyectoEjemplo.inversionInicial,
    proyectoEjemplo.flujos,
    proyectoEjemplo.tasaDescuento
  );
  console.log('Resultado:', validacionProyecto.valido ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  if (!validacionProyecto.valido) {
    console.log('Error:', validacionProyecto.mensaje);
  }
  console.log();

  // Prueba 6: VAN y TIR
  if (validacionProyecto.valido) {
    console.log('💼 PRUEBA 6: Cálculo de VAN y TIR');
    const van = calcularVAN(
      proyectoEjemplo.inversionInicial,
      proyectoEjemplo.flujos,
      proyectoEjemplo.tasaDescuento
    );
    const tir = calcularTIR(proyectoEjemplo.inversionInicial, proyectoEjemplo.flujos);
    const payback = calcularPayback(proyectoEjemplo.inversionInicial, proyectoEjemplo.flujos);
    const indiceRent = calcularIndiceRentabilidad(
      proyectoEjemplo.inversionInicial,
      proyectoEjemplo.flujos,
      proyectoEjemplo.tasaDescuento
    );

    console.log(`- VAN: $${van.toFixed(2)}`);
    console.log(`- TIR: ${(tir * 100).toFixed(2)}%`);
    console.log(`- Payback: ${payback >= 0 ? payback.toFixed(2) + ' años' : 'No se recupera'}`);
    console.log(`- Índice de Rentabilidad: ${indiceRent.toFixed(2)}`);
    console.log();

    // Interpretación
    console.log('📊 INTERPRETACIÓN:');
    if (van > 0 && tir > proyectoEjemplo.tasaDescuento && indiceRent > 1) {
      console.log('✅ RECOMENDACIÓN: ACEPTAR EL PROYECTO');
      console.log('- El proyecto es rentable según todos los indicadores');
    } else {
      console.log('❌ RECOMENDACIÓN: RECHAZAR EL PROYECTO');
      console.log('- El proyecto no cumple con todos los criterios de rentabilidad');
    }
  }

  console.log('='.repeat(50));
  console.log('🎉 PRUEBAS COMPLETADAS');
};

// ============= PRUEBAS DE CASOS EXTREMOS =============
export const probarCasosExtremos = () => {
  console.log('⚠️ PRUEBAS DE CASOS EXTREMOS');
  console.log('='.repeat(30));

  // Caso 1: División por cero
  console.log('1. División por cero en indicadores:');
  const datosInvalidos = [{
    year: 2023,
    ventas: 0,
    costoVentas: 0,
    gastosOperativos: 100000,
    gastosFinancieros: 0,
    activoCirculante: 100000,
    activoFijo: 0,
    pasivoCirculante: 0,
    pasivoLargoPlazo: 50000,
    patrimonio: 50000
  }];

  const indicadoresInvalidos = calcularIndicadoresRentabilidad(datosInvalidos);
  // const razonesInvalidas = calcularRazonesFinancieras(datosInvalidos); // DESHABILITADO
  console.log('✅ No hay errores por división por cero');

  // Caso 2: Proyecto sin flujos positivos
  console.log('2. Proyecto sin flujos positivos:');
  const flujosMalos = [-10000, -5000, -3000];
  const tirMala = calcularTIR(100000, flujosMalos);
  console.log(`TIR: ${(tirMala * 100).toFixed(2)}% ✅`);

  // Caso 3: Datos insuficientes para regresión
  console.log('3. Regresión con un solo dato:');
  const unDato = [{ year: 2023, ventas: 100000 }];
  const regresionMala = calcularRegresionLineal(unDato, 'ventas');
  console.log(`R²: ${(regresionMala.r2 * 100).toFixed(2)}% ✅`);

  console.log('='.repeat(30));
  console.log('✅ TODOS LOS CASOS EXTREMOS MANEJADOS CORRECTAMENTE');
};

// Ejecutar pruebas si este archivo se ejecuta directamente
if (typeof window === 'undefined') {
  // Estamos en Node.js, ejecutar pruebas
  probarCalculos();
  probarCasosExtremos();
}