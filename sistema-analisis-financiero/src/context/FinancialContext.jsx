import { createContext, useContext, useState } from 'react';

const FinancialContext = createContext();

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

export const FinancialProvider = ({ children }) => {
  // Datos históricos de estados financieros (inicia vacío)
  const [historicalData, setHistoricalData] = useState([]);

  // Datos de proyectos de inversión
  const [projectData, setProjectData] = useState({
    inversionInicial: 0,
    tasaDescuento: 0.12,
    periodos: 5,
    flujosEfectivo: [0, 0, 0, 0, 0],
  });

  // Proyecciones
  const [projections, setProjections] = useState([]);

  const addHistoricalYear = (yearData) => {
    setHistoricalData([...historicalData, yearData]);
  };

  const updateHistoricalYear = (year, updatedData) => {
    setHistoricalData(
      historicalData.map(item =>
        item.year === year ? { ...item, ...updatedData } : item
      )
    );
  };

  const deleteHistoricalYear = (year) => {
    setHistoricalData(historicalData.filter(item => item.year !== year));
  };

  const updateProjectData = (data) => {
    setProjectData({ ...projectData, ...data });
  };

  const updateProjections = (newProjections) => {
    setProjections(newProjections);
  };

  const value = {
    historicalData,
    setHistoricalData,
    addHistoricalYear,
    updateHistoricalYear,
    deleteHistoricalYear,
    projectData,
    updateProjectData,
    projections,
    updateProjections,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};
