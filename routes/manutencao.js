import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manutencaoRoute = (connection) => {

    const router = Router();

    router.get('/manutencao', (req, res) => {
        const select = 'SELECT * FROM Manutencao';

        connection.query(select, (err, rows) => {
            if(err) {
                console.error("Erro ao listar manutenções: ", err);
                res.status(500).send('Erro ao listar manutenções');
                return;
            }
            else {
                res.send(`
                    <h1>Lista de Manutenções</h1>
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Descrição</th>
                            <th>Local</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Manutencao}</td>
                                <td>${row.tipo_manutencaoID}</td>
                                <td>${row.local_manutencao}</td>
                                <td>${row.data_manutencao}</td>
                                <td><a href="/deletarManutencao/${row.IDManutencao}">Deletar</a></td>
                                <td><a href="/atualizarManutencao/${row.IDManutencao}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a href="/cadastroManutencao">Cadastrar Manutenção</a>
                    <br>
                    <a href="/cadastroTipoManutencao">Cadastrar Tipo de Manutenção</a>
                    <a href="/">Voltar</a>
                `)
            }
        });
    });

    router.get('/cadastroManutencao', (req, res) => {
        connection.query('SELECT ID_TipoManutencao, descricao FROM TiposManutencao', (err, tipos) => {
            if (err) { 
                console.error("Erro ao buscar tipos de manutenção: ", err);
                res.status(500).send("Erro ao buscar tipos de manutenção");
                return;
            }
            else{
                const tipoOptions = tipos.map(t => `<option value="${t.ID_TipoManutencao}">${t.descricao}</option>`).join('');
                if(tipoOptions.length === 0) {
                    res.status(400).send('Nenhum tipo de manutenção cadastrado. Cadastre um tipo antes de cadastrar uma manutenção. <br> <a href="/cadastroTipoManutencao">Ir para cadastro de tipo de manutenção</a>');
                    return;
                }
                else {
                    res.send(`
                        <h1>Cadastro de Manutenção</h1>
                        <form action="/cadastrarManutencao" method="POST">
                            <label for="tipoManutencaoID">Tipo de Manutenção:</label>
                            <select id="tipoManutencaoID" name="tipoManutencaoID" required>
                                ${tipoOptions} 
                            </select>
                            <br>
                            <label for="localManutencao">Local da Manutenção:</label>
                            <input type="text" id="localManutencao" name="localManutencao" required>
                            <br>
                            <label for="dataManutencao">Data da Manutenção:</label>
                            <input type="date" id="dataManutencao" name="dataManutencao" required>
                            <br>
                            <input type="submit" value="Cadastrar">
                        </form>
                        <a href="/manutencao">Voltar</a>
                    `);
                }
            }
        });
    });

    router.post('/cadastrarManutencao', (req, res) => {
        const { tipoManutencaoID, localManutencao, dataManutencao } = req.body;
        const insert = 'INSERT INTO Manutencao (tipo_manutencaoID, local_manutencao, data_manutencao) VALUES (?, ?, ?)';
        connection.query(insert, [tipoManutencaoID, localManutencao, dataManutencao], (err, result) => {
            if(err) {
                console.error("Erro ao cadastrar manutenção: ", err);
                res.status(500).send('Erro ao cadastrar manutenção');
                return;
            }
            else {
                res.redirect('/manutencao');
            }
        });
    });

    router.get('/cadastroTipoManutencao', (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/cadastroTipoManutencao.html'));
    });

    router.post('/cadastrarTipoManutencao', (req, res) => {
        const tipoManutencao = req.body.tipoManutencao;
        const insert = 'INSERT INTO TiposManutencao (descricao) VALUES (?)';

        connection.query(insert, [tipoManutencao], (err, result) => {
            if(err) {
                console.error("Erro ao cadastrar tipo de manutenção: ", err);
                res.status(500).send('Erro ao cadastrar tipo de manutenção');
                return;
            }
            else {

                res.redirect('/manutencao');
            }
        });
    });
    return router;
};

export default manutencaoRoute;