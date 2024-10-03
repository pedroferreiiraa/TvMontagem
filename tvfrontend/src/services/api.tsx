import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer, LabelList } from 'recharts';

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
  const [eficiencia, setEficiencia] = useState<number | ''>(95);
  const [eficiencia2, setEficiencia2] = useState<number | ''>(110);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.16.240:8005/api/tvmontagem');
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
    }, 65000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{`Erro ao carregar os dados: ${error}`}</p>;
  }

 return (
    <div className="text-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
        {data.length > 0 ? (
          data.map((machineData, index) => {
            const cicloValue = typeof machineData.ciclo === 'number' 
              ? machineData.ciclo 
              : Number(machineData.ciclo);
        
            const eficienciaValue = typeof eficiencia === 'number' 
              ? eficiencia 
              : Number(eficiencia);
    
            const eficienciaValue2 = typeof eficiencia2 === 'number' 
              ? eficiencia2 
              : Number(eficiencia2);
    
            const isMachineStopped = machineData.status !== "Máquina Trabalhando";
            const isCycleBelowEfficiency = !isNaN(cicloValue) && cicloValue < eficienciaValue;
            const isCycleAboveEfficiency = !isNaN(cicloValue) && cicloValue > eficienciaValue2;
    
            const isUninformedStop = isMachineStopped && machineData.DsParada === "PARADA NÃO INFORMADA";
    
            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg  flex flex-col h-[450px] ${isUninformedStop ? '!bg-red-500' : ''}`}
              >
                <h2 className="text-lg text-center font-bold text-black-600 mb-2">{machineData.linha}</h2>
                <p className="text-black-800 text-2xl  text-center font-bold mb-2">{machineData.DsProduto}</p>
                
                {isMachineStopped ? (
                  <div className="flex flex-col items-center justify-center flex-grow">
                    <p className="text-3xl font-bold text-center text-black">
                      {machineData.DsParada}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-0">
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between">
                          <span 
                         className={`text-xs 2xl:text-lg font-semibold inline-block px-2 rounded-full mb-1 ${machineData.percentualconcluido}`} 
                         > 
                           Evolução da O.P - {machineData.percentualconcluido.toFixed(2)}%
                          </span>
                          <span className="text-xs 2xl:text-2xl font-semibold inline-block text-black-600">
                            100%
                          </span>
                        </div>
                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${machineData.percentualconcluido}%`,
                            backgroundColor: machineData.percentualconcluido <= 100 ? 'blue' : 'yellow'
                          }}
                          />
                        </div>
                      </div>
                    </div>
    
                    <div className="flex-grow">
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
                          <YAxis domain={[0, 150]} tickCount={4} tick={{ fill: '#666' }} />
                          <Bar 
                            barSize={100}
                            dataKey="ciclo" 
                            fill={isCycleBelowEfficiency ? "green" : (isCycleAboveEfficiency ? "red" : "green")}
                          >
                            <LabelList
                              dataKey="ciclo"
                              position="top"
                              formatter={(value: number) => `${value ? value.toFixed(2) : ''}%`}
                              fill="#000"
                              style={{
                              fontSize: '2.3rem',
                              fontWeight: 'bold',
                              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                              }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-lg p-4 flex items-center justify-center h-[450px]">
            <p className="text-lg font-semibold text-gray-800">Nenhum dado disponível</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <input
          type="number"
          value={eficiencia}
          onChange={(e) => setEficiencia(e.target.value ? Number(e.target.value) : '')}
          placeholder="Defina a eficiência"
          className="p-2 border border-gray-300 rounded w-full max-w-[180px]"
        />
        <input
          type="number"
          value={eficiencia2}
          onChange={(e) => setEficiencia2(e.target.value ? Number(e.target.value) : '')}
          placeholder="Defina a eficiência"
          className="p-2 border border-gray-300 rounded w-full max-w-[180px]"
        />
      </div>
    </div>
  );
};

export default TvMontagem;