import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { connect } from "http2";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const  garagemRoute = (connection) => {

    const router = Router();    

    router.get('/garagem', (req, res) => { 
        const search = req.query.search || '';
        const select = `SELECT V.ID_Veiculos, V.donoID, V.quantidade_vagas,
         V.numero_vaga, V.placa, V.marca, V.modelo, M.nome, A.numero_apartamento, B.descricao AS bloco_nome
        FROM Veiculos V
        JOIN Morador M ON V.donoID = M.ID_Morador
        JOIN Apartamento A ON M.apartamentoID = A.ID_Apartamento
        JOIN Bloco B ON M.blocoID = B.ID_Bloco
        WHERE placa LIKE ? OR nome LIKE ?;`;
        const searchParam = `%${search}%`;

        connection.query(select, [searchParam, searchParam], (err, rows) => {
            if(err) {
                console.error("Erro ao listar veículos: ", err);
                res.status(500).send('Erro ao listar veículos');
            }
            else {
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Condomínio</h1>

                    <h2 class="subtitle">Lista de Veículos na Garagem</h2>

                    <form class="search" method="GET" action="/garagem">
                        <input type="text" name="search" placeholder="Buscar por placa ou nome do morador" value="${search}">
                        <button type="submit">Buscar</button>
                    </form>

                    <table class="tables" border="1">
                        <tr>
                            <th>ID</th>
                            <th>Nome do Dono</th>
                            <th>Bloco</th>
                            <th>Apartamento</th>
                            <th>Número da Vaga</th>
                            <th>Placa</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Veiculos}</td>
                                <td>${row.nome}</td>
                                <td>${row.bloco_nome}</td>
                                <td>${row.numero_apartamento}</td>
                                <td>${row.numero_vaga}</td>
                                <td>${row.placa}</td>
                                <td>${row.marca}</td>
                                <td>${row.modelo}</td>
                            </tr>
                        `).join('')}
                    </table>

                    <p><a class="selections" href="/">Voltar</a></p>
                `);
            }
        });
    });
    return router;
}

export default garagemRoute;