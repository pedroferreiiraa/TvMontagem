// backend/app.js
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./database');

const sql = require('mssql')

const app = express();
app.use(cors());
app.use(express.json());

connectToDatabase();


app.get('/api/tvmontagem', async (req, res) => {

    try {    
        const query = `
SELECT distinct  a.cdmaquina,
    case when a.cdmaquina = 000061 then 'Linha 01'
     when a.cdmaquina = 000062 then 'Linha 02'
     when a.cdmaquina = 000063 then 'Linha 03'
     when a.cdmaquina = 000064 then 'Linha 04'
     when a.cdmaquina = 000065 then 'Linha 05'
     when a.cdmaquina = 000066 then 'Linha 06' end 'linha',
    
    a.nrop, 
    a.DsParada, 
    b.ciclopadrao, 
    a.ciclomedio, 
    b.prodbruta, 
    a.prodplan,
    CASE 
        WHEN c.prodplan = 0 THEN NULL 
        ELSE (CAST(c.prodbruta AS FLOAT) / c.prodplan) * 100 
    END AS percentualconcluido,
    c.cdproduto, 
    c.DsProduto,
      CASE 
        WHEN a.StMaquina = 0 THEN 'Máquina Parada'  
        WHEN a.StMaquina = 1 THEN 'Máquina Trabalhando'   
        WHEN a.StMaquina = 2 THEN 'Máquina Sem Conexão' 
    END AS status,
    CASE 
        WHEN a.ciclomedio = 0 THEN NULL 
        ELSE (b.ciclopadrao / a.ciclomedio) * 100 
    END AS ciclo

FROM 
    ViewWMTR a
    LEFT JOIN 
    wmVIndHH b ON a.nrop = b.nrop
    LEFT JOIN 
    ViewWMTRFichaPro c ON a.nrop = c.nrop
    WHERE 
    a.cdgalpao = '000004'
    AND b.dthrinihora >= CAST(GETDATE() AS DATE)
    AND b.dthrinihora < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
    AND DATEPART(HOUR, b.dthrinihora) = DATEPART(HOUR, GETDATE())
order by a.cdmaquina
        `;
        
        // Conexão com o banco de dados e execução da consulta
        const pool = await sql.connect(/* suas configurações de conexão */);
        const result = await pool.request()
        .query(query)
          
        res.json(result.recordset); // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } 
});




const PORT = 8005;
app.listen(PORT,  () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
