import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// Definimos as interfaces para os dados que esperamos receber da API
interface CustomTooltip {
  active?: boolean;
  payload?: {
    payload: MontagemData;
  }[];
  label?: string;
}

interface MontagemData {
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
  ciclo: number | null;
}



const TvMontagem: React.FC = () => {
  const [data, setData] = useState<MontagemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    
<div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-3  2xl:text-2xl gap-6 mb-5 h-screen overflow-hidden">
  {data.map((machineData, index) => (
    <div key={index} className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-auto">
      <h2 className="text-xl font-medium text-gray-800 mb-2">{machineData.linha}</h2>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">{machineData.DsProduto}</p>
      </div>
      <p className='text-gray-700'>
        {machineData.status}
        {machineData.status !== "Máquina Trabalhando" && ` - ${machineData.DsParada}`}
      </p>
      <div className="my-4 ">
        <div className="relative pt-1 ">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs 2xl:text-2xl font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200 mb-1">
                {machineData.percentualconcluido.toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs 2xl:text-2xl font-semibold inline-block text-teal-600">
                {machineData.percentualconcluido.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex h-2 mb-4 bg-gray-200 rounded">
            <div className="bg-teal-600 h-full rounded" style={{ width: `${machineData.percentualconcluido}%` }} />
          </div>
        </div>
      </div>
      <div className="flex-grow w-full h-64"> {/* Define a altura máxima do gráfico */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[machineData]}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <XAxis dataKey="cdinjetora" tick={{ fill: '#000' }} />
            <YAxis domain={[0, 130]} tickCount={14} tick={{ fill: '#666' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => value === 'ciclo' ? 'Eficiência de Ciclo' : value}
            />
            <Bar dataKey="ciclo" fill={machineData.status === "Máquina Parada" ? "#FF0000" : "#4CAF50"} barSize={100}>
              <LabelList
                dataKey="ciclo"
                position="top"
                formatter={(value: number) => `${value ? value.toFixed(2) : ''}%`}
                fill="#000"
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  ))}
</div>


  );
};

const CustomTooltip: React.FC<CustomTooltip> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-4 rounded shadow-lg">
        <p className="text-sm font-semibold">{`Linha: ${data.cdmaquina}`}</p>
        <p className="text-sm">{`Ciclo Padrão: ${data.ciclopadrao}`}</p>
        <p className="text-sm">{`Ciclo Médio: ${data.ciclomedio.toFixed(2)}`}</p>
        <p className="text-sm">{`Produção Bruta: ${data.prodbruta}`}</p>
        <p className="text-sm">{`Ciclo: ${data.ciclo !== null ? data.ciclo.toFixed(2) : ''}`}</p>
        <p className="text-sm">{`Status: ${data.status}`}</p>
      </div>
    );
  }

  return null;
};

export default TvMontagem;
