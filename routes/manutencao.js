import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manutencaoRoute = (connection) => {

    const router = Router();

    router.get('/manutencao', (req, res) => {

        const search = req.query.search || ''; 
        const select = `SELECT T.descricao, M.ID_Manutencao, M.tipo_manutencaoID, M.local_manutencao, DATE_FORMAT(M.data_manutencao, "%d/%m/%Y") AS data 
        FROM Manutencao M 
        JOIN TiposManutencao T ON M.tipo_manutencaoID = T.ID_TipoManutencao
        WHERE T.descricao LIKE ? OR M.local_manutencao LIKE ?;`;
        const searchParam = `%${search}%`;

        connection.query(select, [searchParam, searchParam], (err, rows) => {
            if(err) {
                console.error("Erro ao listar manutenções: ", err);
                res.status(500).send('Erro ao listar manutenções');
                return;
            }
            else {
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Condomínio</h1>

                    <h2 class="subtitle">Manutenções</h2>

                    <form class="search" method="GET" action="/manutencao">
                        <input type="text" name="search" placeholder="Buscar por descrição ou local" value="${search}">
                        <button type="submit">Buscar</button>
                    </form>

                    <table class="tables" border="1">
                        <tr>
                            <th>ID</th>
                            <th>Descrição</th>
                            <th>Local</th>
                            <th>Data</th>
                            <th colspan="2">Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Manutencao}</td>
                                <td>${row.descricao}</td>
                                <td>${row.local_manutencao}</td>
                                <td>${row.data}</td>
                                <td><a href="/confirmarDeletarManutencao/${row.ID_Manutencao}">Deletar</a></td>
                                <td><a href="/atualizarManutencao/${row.ID_Manutencao}">Atualizar</a></td>
                            </tr> 
                        `).join('')}
                    </table> 
                    <a class="selections" href="/cadastroManutencao">Cadastrar Manutenção</a>
                    <a class="selections" href="/tipoManutencao">Ver Tipos de Manutenção registradas</a>
                    <a class="selections" href="/">Voltar</a>
                `)
            }
        });
    });

    router.get('/tipoManutencao', (req, res) => {

        const search = req.query.search || '';
        const select = 'SELECT * FROM TiposManutencao WHERE descricao LIKE ?;';
        const searchParam = `%${search}%`;

        connection.query(select, searchParam, (err, rows) => {
            if(err) {
                console.error("Erro ao listar tipos de manutenção: ", err);
                res.status(500).send('Erro ao listar tipos de manutenção');
                return;
            }
            else {
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Condomínio</h1>

                    <h2 class="subtitle">Tipos de Manuteção</h2>

                    <form class="search" method="GET" action="/tipoManutencao">
                        <input type="text" name="search" placeholder="Buscar por descrição" value="${search}">
                        <button type="submit">Buscar</button>
                    </form>

                    <table class="tables" border="1">
                        <tr>
                            <th>ID</th>
                            <th>Descrição</th>
                            <th colspan="2">Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_TipoManutencao}</td>
                                <td>${row.descricao}</td>
                                <td><a href="/confirmarDeletarTipoManutencao/${row.ID_TipoManutencao}">Deletar</a></td>
                                <td><a href="/atualizarTipoManutencao/${row.ID_TipoManutencao}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a class="selections" href="/cadastroTipoManutencao">Cadastrar Tipo de Manutenção</a>
                    <a class="selections" href="/manutencao">Voltar</a>
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
                    res.status(400).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Nenhum tipo de manutenção cadastrado. Cadastre um tipo antes de cadastrar uma manutenção.</p> 
                        <br>
                        <a class="selections" href="/cadastroTipoManutencao">Ir para cadastro de tipo de manutenção</a>`);
                    return;
                }
                else {
                    res.send(`
                        <link rel="stylesheet" href="/css/style.css">

                        <h1 class="title">Condomínio</h1>

                        <form class="cadastro" action="/cadastrarManutencao" method="POST">
                            <fieldset>
                                <legend>Cadastro de Manutenção</legend>
                                <label for="tipoManutencaoID">Tipo de Manutenção:</label>
                                <select id="tipoManutencaoID" name="tipoManutencaoID" required>
                                    <option value="" disabled selected>Selecione um Tipo de Manutenção</option>   
                                    ${tipoOptions} 
                                </select>
                                <br>
                                <label for="localManutencao">Local da Manutenção:</label>
                                <input type="text" id="localManutencao" name="localManutencao" required>
                                <br>
                                <label for="dataManutencao">Data da Manutenção:</label>
                                <input type="date" id="dataManutencao" name="dataManutencao" required>
                                <br>
                                <input class="submit" type="submit" value="Cadastrar">
                            </fieldset>
                        </form>
                        <a class="selections" href="/manutencao">Voltar</a>
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
                if(err.code === 'ER_DUP_ENTRY') {
                    console.error("Erro ao inserir tipo de manutenção: Tipo já existe.");
                    res.status(400).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Erro ao inserir tipo de manutenção: Tipo já existe.</p>
                        <br>
                        <a class="selections" href='/cadastroTipoManutencao'>Voltar</a>`);
                    return;
                }
                else {
                    console.error("Erro ao cadastrar tipo de manutenção: ", err);
                    res.status(500).send('Erro ao cadastrar tipo de manutenção');
                    return;
                }
            }
            else {

                res.redirect('/tipoManutencao');
            }
        });
    });

    router.get('/confirmarDeletarManutencao/:ID_Manutencao', (req, res) => {
        const id = req.params.ID_Manutencao;
        res.send(`
            <link rel="stylesheet" href="/css/style.css">
            <h1 class="title">Confirmar</h1>
            <p>Tem certeza que deseja deletar a manutenção?</p>
            <form action="/deletarManutencao/${id}" method="POST">
                <input class="submit" type="submit" value="Deletar">
            </form>
            <a class="selections" href="/manutencao">Cancelar</a>
        `);
    });

    router.post('/deletarManutencao/:ID_Manutencao', (req, res) => {
        const id = req.params.ID_Manutencao;
        const deleteQuery = 'DELETE FROM Manutencao WHERE ID_Manutencao = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if(err) {
                console.error("Erro ao deletar manutenção: ", err);
                res.status(500).send('Erro ao deletar manutenção');
                return;
            }
            else {
                res.redirect('/manutencao');
            }
        });
    });

    router.get('/atualizarManutencao/:ID_Manutencao', (req, res) => {
        const id = req.params.ID_Manutencao;
        const select = 'SELECT * FROM Manutencao WHERE ID_Manutencao = ?';

        connection.query(select, [id], (err, rows) => {
            if(err) {
                console.error("Erro ao buscar manutenção: ", err);
                res.status(500).send('Erro ao buscar manutenção');
                return;
            }
            else if(rows.length === 0) {
                res.status(404).send('Manutenção não encontrada');
                return;
            }
            else {
                const manutencao = rows[0];
                connection.query('SELECT ID_TipoManutencao, descricao FROM TiposManutencao', (err, tipos) => {
                    if (err) {
                        console.error("Erro ao buscar tipos de manutenção: ", err);
                        res.status(500).send("Erro ao buscar tipos de manutenção");
                        return;
                    }
                    else{
                        const tipoOptions = tipos.map(t => `
                            <option value="${t.ID_TipoManutencao}" ${t.ID_TipoManutencao === manutencao.tipo_manutencaoID ? 'selected' : ''}>${t.descricao}</option>
                        `).join('');
                        res.send(`
                            <link rel="stylesheet" href="/css/style.css">

                            <h1 class="title">Condomínio</h1>

                            <form class="cadastro" action="/atualizarManutencao/${id}" method="POST">
                                <fieldset>
                                    <legend>Atualizar Manutenção</legend>
                                    <label for="tipoManutencaoID">Tipo de Manutenção:</label>
                                    <select id="tipoManutencaoID" name="tipoManutencaoID" required>
                                        <option value="" disabled>Selecione um Tipo de Manutenção</option>   
                                        ${tipoOptions}
                                    </select>
                                    <br>
                                    <label for="localManutencao">Local da Manutenção:</label>
                                    <input type="text" id="localManutencao" name="localManutencao" value="${manutencao.local_manutencao}" required>
                                    <br>
                                    <label for="dataManutencao">Data da Manutenção:</label>
                                    <input type="date" id="dataManutencao" name="dataManutencao" value="${manutencao.data_manutencao.toISOString().split('T')[0]}" required>
                                    <br>
                                    <input class="submit" type="submit" value="Atualizar">
                                </fieldset>
                            </form>
                            <a class="selections" href="/manutencao">Voltar</a>
                        `);
                    }
                });
            }   
        });
    });

    router.post('/atualizarManutencao/:ID_Manutencao', (req, res) => {
        const id = req.params.ID_Manutencao;
        const { tipoManutencaoID, localManutencao, dataManutencao } = req.body;
        const update = 'UPDATE Manutencao SET tipo_manutencaoID = ?, local_manutencao = ?, data_manutencao = ? WHERE ID_Manutencao = ?';

        connection.query(update, [tipoManutencaoID, localManutencao, dataManutencao, id], (err, result) => {
            if(err) {
                console.error("Erro ao atualizar manutenção: ", err);
                res.status(500).send('Erro ao atualizar manutenção');
                return;
            }
            else {
                res.redirect('/manutencao');
            }
        });
    });

    router.get('/confirmarDeletarTipoManutencao/:ID_TipoManutencao', (req, res) => {
        const id = req.params.ID_TipoManutencao;
        res.send(`
            <link rel="stylesheet" href="/css/style.css">
            <h1>Confirmar</h1>
            <p>Tem certeza que deseja deletar o tipo de manutenção?</p>
            <form action="/deletarTipoManutencao/${id}" method="POST">
                <input class="submit" type="submit" value="Deletar">
            </form>
            <a class="selections" href="/tipoManutencao">Cancelar</a>
        `);
    });

    router.post('/deletarTipoManutencao/:ID_TipoManutencao', (req, res) => {
        const id = req.params.ID_TipoManutencao;
        const deleteQuery = 'DELETE FROM TiposManutencao WHERE ID_TipoManutencao = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if(err) {
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    console.error(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Erro ao deletar tipo de manutenção: Existem manutenções associadas a este tipo.</p>
                        <br>
                        <a class="selections" href="/tipoManutencao">Voltar</a>`);
                    res.status(400).send("Erro ao deletar tipo de manutenção: Existem manutenções associadas a este tipo.");
                    return;
                }
                else {
                    console.error("Erro ao deletar tipo de manutenção: ", err);
                    res.status(500).send('Erro ao deletar tipo de manutenção');
                    return;
                }
            }
            else {
                res.redirect('/tipoManutencao');
            }
        });
    });

    router.get('/atualizarTipoManutencao/:ID_TipoManutencao', (req, res) => {
        const id = req.params.ID_TipoManutencao;

        const select = 'SELECT * FROM TiposManutencao WHERE ID_TipoManutencao = ?';

        connection.query(select, [id], (err, rows) => {
            if(err) {
                console.error("Erro ao buscar tipo de manutenção: ", err);
                res.status(500).send('Erro ao buscar tipo de manutenção');
                return;
            }
            else if(rows.length === 0) {
                res.status(404).send('Tipo de manutenção não encontrado');
                return;
            }
            else {
                const tipoManutencao = rows[0];
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Condomínio</h1>
                    <form class="cadastro" action="/atualizarTipoManutencao/${id}" method="POST">
                        <fieldset>
                            <legend>Atualizar Tipo de Manutenção</legend>
                            <label for="descricao">Descrição:</label>
                            <input type="text" id="descricao" name="descricao" value="${tipoManutencao.descricao}" required>
                            <br>
                            <input class="submit" type="submit" value="Atualizar">
                        </fieldset>
                    </form>
                    <a class="selections" href="/tipoManutencao">Voltar</a>
                `);
            }
        });
    });

    router.post('/atualizarTipoManutencao/:ID_TipoManutencao', (req, res) => {
        const id = req.params.ID_TipoManutencao;
        const { descricao } = req.body;
        const update = 'UPDATE TiposManutencao SET descricao = ? WHERE ID_TipoManutencao = ?';
        
        connection.query(update, [descricao, id], (err, result) => {
            if(err) {
                if(err.code === 'ER_DUP_ENTRY') {
                    console.error("Erro ao atualizar tipo de manutenção: Tipo já existe.");
                    res.status(400).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Erro ao atualizar tipo de manutenção: Esse tipo de manutenção já existe</p>
                        <br>
                        <a class="selections" href="/tipoManutencao">Voltar</a>`);
                    return;
                }
                else {
                    console.error("Erro ao atualizar tipo de manutenção: ", err);
                    res.status(500).send('Erro ao atualizar tipo de manutenção');
                    return;
                }
               
            }
            else {
                res.redirect('/tipoManutencao');
            }
        });
    });

    return router;
};

export default manutencaoRoute;