import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Warning as WarningIcon } from '@mui/icons-material';

interface CustomTooltip {
  active?: boolean;
  payload?: {
    payload: MontagemData;
  }[];
  label?: string;
}

interface MontagemData {
  prodbruta_completo: number;
  linha: string;
  cdmaquina: number;
  nrop: number;
  DsParada: string;
  ciclopadrao: number;
  ciclomedio: number;
  prodbruta: string;
  prodplan: number;
  percentualconcluido: number;
  cdproduto: string;
  DsProduto: string;
  status: string;
  ciclo: number;
}

const TvMontagem: React.FC = () => {
  const [data, setData] = useState<MontagemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [eficiencia, setEficiencia] = useState<number | ''>(90);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8005/api/tvmontagem');
      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }
      const result: MontagemData[] = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{`Erro ao carregar os dados: ${error}`}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-3 2xl:text-2xl gap-2 mb-2 overflow-hidden">
      {data.map((machineData, index) => {
        const cicloValue = typeof machineData.ciclo === 'number' 
          ? machineData.ciclo 
          : Number(machineData.ciclo); // Converter para número
      
        const eficienciaValue = typeof eficiencia === 'number' 
          ? eficiencia 
          : Number(eficiencia); // Converter para número
      
        const isMachineStopped = machineData.status !== "Máquina Trabalhando";
        const isCycleBelowEfficiency = !isNaN(cicloValue) && !isNaN(eficienciaValue) && cicloValue < eficienciaValue;
        const isCycleEqualEfficiency = cicloValue === eficienciaValue;

        return (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-lg p-0 flex flex-col h-auto ${isMachineStopped ? 'animate-pulse bg-red-500' : ''}`}
          >
            <h2 className="text-xl font-bold text-black-600 mb-0">{machineData.linha}</h2>
            <div className="flex justify-between items-center mb-0">
              <p className="text-black-800 font-bold">{machineData.DsProduto}</p>
            </div>
            <p className='text-gray-700'>
              {machineData.status}
              {isMachineStopped && (
                <span className="text-red-600 ml-2">
                  <WarningIcon />
                </span>
              )}
            </p>
            <div className="my-3">
              <div className="relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs 2xl:text-2xl font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200 mb-1">
                      {machineData.percentualconcluido.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs 2xl:text-2xl font-semibold inline-block text-teal-600">
                      100%
                    </span>
                  </div>
                </div>
                <div className="flex h-4 mb-4 bg-gray-200 rounded">
                  <div className="bg-teal-600 h-full rounded" style={{ width: `${machineData.percentualconcluido}%` }} />
                </div>
              </div>
            </div>
            <div className="flex-grow w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[machineData]}
                  margin={{
                    top: 30,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis dataKey="cdinjetora" tick={{ fill: '#000' }} />
                  <YAxis domain={[0, 130]} tickCount={14} tick={{ fill: '#666' }} />
                  {/* <Tooltip content={<CustomTooltip />} /> */}
                  <Legend
                    formatter={(value) => value === 'ciclo' ? 'Eficiência de Ciclo' : value}
                  />
                  <Bar 
                    dataKey="ciclo" 
                    fill={isCycleBelowEfficiency ? "#FF0000" : (isCycleEqualEfficiency ? "#FFFF00" : "#008000")}
                    barSize={100}
                  >
                    <LabelList
                      dataKey="ciclo"
                      position="top"
                      formatter={(value: number) => `${value ? value.toFixed(2) : ''}%`}
                      fill="#000"
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
      <div className="overflow-auto mt-4 mx-5">
        <input
          type="number"
          value={eficiencia}
          onChange={(e) => setEficiencia(e.target.value ? Number(e.target.value) : '')}
          placeholder="Defina a eficiência"
          className="p-2 border-black border-2 rounded"
        />
      </div>
    </div>
  );
};

// const CustomTooltip: React.FC<CustomTooltip> = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     return (
//       <div className="bg-white border border-gray-300 p-4 rounded shadow-lg">
//         <p className="text-sm font-semibold">{`Linha: ${data.cdmaquina}`}</p>
//         <p className="text-sm">{`Ciclo Padrão: ${data.ciclopadrao}`}</p>
//         <p className="text-sm">{`Ciclo Médio: ${data.ciclomedio.toFixed(2)}`}</p>
//         <p className="text-sm">{`Produção Bruta: ${data.prodbruta_completo}`}</p>
//         <p className="text-sm">{`Ciclo: ${data.ciclo !== null ? data.ciclo.toFixed(2) : ''}`}</p>
//         <p className="text-sm">{`Status: ${data.status}`}</p>
//       </div>
//     );
//   }

//   return null;
// };

export default TvMontagem;
