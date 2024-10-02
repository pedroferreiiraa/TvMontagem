// backend/app.js
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./database');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

connectToDatabase();

// app.get('/api/tvmontagem', async (req, res) => {
//     try {    
//         const query = `
// SELECT DISTINCT  
//     a.cdmaquina,
//     CASE 
//         WHEN a.cdmaquina = 000061 THEN 'Linha 01'
//         WHEN a.cdmaquina = 000062 THEN 'Linha 02'
//         WHEN a.cdmaquina = 000063 THEN 'Linha 03'
//         WHEN a.cdmaquina = 000064 THEN 'Linha 04'
//         WHEN a.cdmaquina = 000065 THEN 'Linha 05'
//         WHEN a.cdmaquina = 000066 THEN 'Linha 06' 
//     END AS 'linha',    
//     a.nrop,
//     CASE 
//         WHEN a.StMaquina = 0 THEN 'Máquina Parada'  
//         WHEN a.StMaquina = 1 THEN 'Máquina Trabalhando'   
//         WHEN a.StMaquina = 2 THEN 'Máquina Sem Conexão' 
//     END AS status,
//     a.DsParada,
//     CASE
//         WHEN b.prodbruta = 0 THEN NULL
//         ELSE b.tempotrabalhado / (b.prodbruta * b.prodporciclo)
//     END as tempotrabalhado,
//     b.prodporciclo,
//     b.ciclopadrao, 
//     a.ciclomedio, 
//     b.prodbruta,  -- campo original com filtro de data
//     COALESCE(b_full.prodbruta, 0) AS prodbruta_completo, -- campo adicional sem filtro de data
//     a.prodplan,
//     a.prodprev, 
//     CASE 
//         WHEN c.prodplan = 0 THEN NULL 
//         ELSE (COALESCE(b_full.prodbruta, 0) / c.prodplan) * 100  -- Substituído por prodbruta_completo
//     END AS percentualconcluido,
//     c.cdproduto, 
//     c.DsProduto,
//     CASE 
//         WHEN a.ciclomedio = 0 THEN NULL 
//         ELSE (b.ciclopadrao / a.ciclomedio) * 100 
//     END AS ciclo

// FROM 
//     ViewWMTR a
//     LEFT JOIN 
//     wmVIndHH b ON a.nrop = b.nrop
//     LEFT JOIN 
//     ViewWMTRFichaPro c ON a.nrop = c.nrop
//     LEFT JOIN 
//     (SELECT nrop, SUM(prodbruta) AS prodbruta FROM wmVIndHH GROUP BY nrop) b_full ON a.nrop = b_full.nrop  -- Subconsulta para pegar prodbruta completo

// WHERE 
//     a.cdgalpao = '000004'
//     AND b.dthrinihora >= CAST(GETDATE() AS DATE)
//     AND b.dthrinihora < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
//     AND DATEPART(HOUR, b.dthrinihora) = DATEPART(HOUR, GETDATE())

// ORDER BY a.cdmaquina;
//         `;
        
//         // Conexão com o banco de dados e execução da consulta
//         const pool = await sql.connect(/* suas configurações de conexão */);
//         const result = await pool.request().query(query);
          
//         res.json(result.recordset); // Retorna os dados
//     } catch (error) {
//         console.error('Erro ao buscar dados:', error);
//         res.status(500).json({ error: 'Erro interno do servidor' });
//     } 
// });

app.get('/api/tvmontagem', async (req, res) => {
    try {    
        const query = `
SELECT DISTINCT  
    a.cdmaquina,
    CASE 
        WHEN a.cdmaquina = 000061 THEN 'Linha 01'
        WHEN a.cdmaquina = 000062 THEN 'Linha 02'
        WHEN a.cdmaquina = 000063 THEN 'Linha 03'
        WHEN a.cdmaquina = 000064 THEN 'Linha 04'
        WHEN a.cdmaquina = 000065 THEN 'Linha 05'
        WHEN a.cdmaquina = 000066 THEN 'Linha 06' 
    END AS 'linha',    
    a.nrop,
    CASE 
        WHEN a.StMaquina = 0 THEN 'Máquina Parada'  
        WHEN a.StMaquina = 1 THEN 'Máquina Trabalhando'   
        WHEN a.StMaquina = 2 THEN 'Máquina Sem Conexão' 
    END AS status,
    a.DsParada,
    CASE
        WHEN b.prodbruta = 0 THEN NULL
        ELSE b.tempotrabalhado / (b.prodbruta * b.prodporciclo)
    END as ciclomedio,
    b.prodporciclo,
    b.ciclopadrao, 
    b.prodbruta,  -- campo original com filtro de data
    COALESCE(b_full.prodbruta, 0) AS prodbruta_completo, -- campo adicional sem filtro de data
    a.prodplan,
    a.prodprev, 
    CASE 
        WHEN c.prodplan = 0 THEN NULL 
        ELSE (COALESCE(b_full.prodbruta, 0) / c.prodplan) * 100  -- Substituído por prodbruta_completo
    END AS percentualconcluido,
    c.cdproduto, 
    c.DsProduto,
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
    LEFT JOIN 
    (SELECT nrop, SUM(prodbruta) AS prodbruta FROM wmVIndHH GROUP BY nrop) b_full ON a.nrop = b_full.nrop  -- Subconsulta para pegar prodbruta completo

WHERE 
    a.cdgalpao = '000004'
    AND b.dthrinihora >= CAST(GETDATE() AS DATE)
    AND b.dthrinihora < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
    AND DATEPART(HOUR, b.dthrinihora) = DATEPART(HOUR, GETDATE())

ORDER BY a.cdmaquina;
        `;
        
        // Conexão com o banco de dados e execução da consulta
        const pool = await sql.connect(/* suas configurações de conexão */);
        const result = await pool.request().query(query);
          
        res.json(result.recordset); // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } 
});

const PORT = 8005;


app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em ${PORT}`);
});
