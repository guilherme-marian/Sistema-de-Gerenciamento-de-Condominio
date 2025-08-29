import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apartamentoRoute = (connection) => {
    const router = Router();

    router.get('/apartamentos', (req, res) => {

        const search = req.query.search || '';
        const searchQuery = [`%${search}%`];
        const select = `SELECT *, Bloco.ID_Bloco, Bloco.descricao AS bloco_nome 
        FROM apartamento 
        JOIN Bloco ON apartamento.BlocoID = Bloco.ID_Bloco
        WHERE numero_apartamento LIKE ?`;
        
        connection.query(select, searchQuery, (err, rows) => {
            if(err) {
                console.error("Erro ao listar apartamentos: ", err);
                res.status(500).send('Erro ao listar apartamentos');
                return;
            }
            else {
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">
                    
                    <h1 class="title">Condomínio</h1>

                    <h2 class="subtitle">Apartamentos<h2>

                    <form class="search" action="/apartamentos" method="GET">
                        <input type="text" name="search" placeholder="Pesquisar por número do apartamento">
                        <button type="submit">Pesquisar</button>
                    </form>
                    <table class="tables" border="1">
                        <tr>
                            <th>ID</th>
                            <th>Bloco</th>
                            <th>Número do apartamento</th>
                            <th colspan="2">Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Apartamento}</td>
                                <td value>${row.bloco_nome}</td>
                                <td>${row.numero_apartamento}</td>
                                <td><a href="/confirmarDeletarApartamento/${row.ID_Apartamento}">Deletar</a></td>
                                <td><a href="/atualizarApartamento/${row.ID_Apartamento}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a class="selections" href="/cadastroApartamento">Cadastrar Apartamento</a>
                    <a class="selections" href="/">Voltar</a>
                `)
            }
        });
    });
    
    router.get('/cadastroApartamento', (req, res) => {
        connection.query('SELECT ID_Bloco, descricao FROM Bloco', (err, blocos) => {
            if (err) {
                console.error("Erro ao buscar blocos: ", err);
                res.status(500).send("Erro ao buscar blocos");
                return;
            }
            else{
                const blocoOptions = blocos.map(b => `<option value="${b.ID_Bloco}">${b.descricao}</option>`).join('');
                if(blocoOptions.length === 0) {
                    res.status(400).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Nenhum bloco cadastrado. Cadastre um bloco antes de cadastrar um apartamento.</p>
                        <br>
                        <a class="selections" href="/blocos">Ir para blocos</a>`);
                    return;
                }
                else {
                    res.send(`
                        <html>
                            <link rel="stylesheet" href="/css/style.css">

                            <head>
                            <title>Condomínio</title></head>
                            <body>

                                <h1 class="title">Condomínio</h1>

                                <form class="cadastro" action="/cadastrarApartamento" method="POST">
                                    <fieldset>
                                        <legend>Dados do Apartamento</legend>
                                        <label for="bloco">Bloco:</label>
                                        <select id="blocoID" name="BlocoID" required>
                                            <option value="" disabled selected>Selecione um Bloco</option>
                                            ${blocoOptions}
                                        </select><br><br>
                                        <label for="numero_apartamento">Número do Apartamento:</label>
                                        <input type="text" id="numero_apartamento" name="numero_apartamento" required><br><br>
                                        <input class="submit" type="submit" value="Cadastrar">
                                    </fieldset>
                                </form>
                                <a class="selections" href="/apartamentos">Voltar</a>
                            </body>
                        </html>
                    `);
                }
                
            }
            
        });
    });

    router.post('/cadastrarApartamento', (req, res) => {
        const { BlocoID, numero_apartamento } = req.body;
        const insert = 'INSERT INTO apartamento (BlocoID, numero_apartamento) VALUES (?, ?)';
        connection.query(insert, [BlocoID, numero_apartamento], (err, results) => {
            if(err) {
                console.error("Erro ao inserir apartamento: ", err);
                res.status(500).send("Erro ao inserir apartamento");
            }
            else {
                console.log("Apartamento inserido com sucesso!");
                res.redirect('/apartamentos');
            }
        });
    });

    router.get('/atualizarApartamento/:ID_Apartamento', (req, res) => {
        const id = req.params.ID_Apartamento;
        const select = 'SELECT * FROM apartamento WHERE ID_Apartamento = ?';
        
        connection.query(select, [id], (err, aptRows) => {
            if (err || aptRows.length === 0) {
                console.error("Erro ao buscar apartamento: ", err);
                res.status(404).send("Apartamento não encontrado");
                return;
            }

        const apartamento = aptRows[0];

            connection.query('SELECT ID_Bloco, descricao FROM Bloco', (err, blocos) => {
            if (err) {
                console.error("Erro ao buscar blocos: ", err);
                res.status(500).send("Erro ao buscar blocos");
                return;
            }

            const blocoOptions = blocos.map(b => 
                `<option value="${b.ID_Bloco}" ${b.ID_Bloco === apartamento.BlocoID ? 'selected' : ''}>${b.descricao}</option>`
            ).join('');
            if(blocoOptions.length === 0) {
                res.status(400).send("Nenhum bloco cadastrado. Cadastre um bloco antes de atualizar um apartamento.");
                return;
            }
            else {
                res.send(`
                    <html>
                        <link rel="stylesheet" href="/css/style.css">
                        <head>
                            <title>Condomínio</title>
                        </head>
                        <body>
                            <h1 class="title">Condomínio</h1>
                            <form class="cadastro" action="/atualizarApartamento/${id}" method="POST">
                                <fieldset>
                                    <legend>Dados do Apartamento</legend>
                                    <label for="bloco">Bloco:</label>
                                    <select id="bloco" name="BlocoID" required>
                                        ${blocoOptions}
                                    </select><br><br>
                                    <label for="numero_apartamento">Número do Apartamento:</label>
                                    <input type="text" id="numero_apartamento" name="numero_apartamento" value="${apartamento.numero_apartamento}" required><br><br>
                                    <input class="submit" type="submit" value="Atualizar">
                                </fieldset>
                            </form>
                            <a class="selections" href="/apartamentos">Voltar</a>
                        </body>
                    </html>
                `);
            }
            
        });
        });
    });

    router.post('/atualizarApartamento/:ID_Apartamento', (req, res) => {
        const id = req.params.ID_Apartamento;
        const bloco = req.body.BlocoID;
        const numero_apartamento = req.body.numero_apartamento;

        const update = 'UPDATE apartamento SET blocoID = ?, numero_apartamento = ? WHERE ID_Apartamento = ?';
        connection.query(update, [bloco, numero_apartamento, id], (err, results) => {
            if (err) {
                console.error("Erro ao atualizar apartamento: ", err);
                res.status(500).send(`
                    <link rel="stylesheet" href="/css/style.css">
                    Erro ao atualizar apartamento
                    <br>
                    <a class="selections" href="/apartamentos">Voltar</a>`);
                return;
            } else {
                console.log("Apartamento atualizado com sucesso");
                res.redirect('/apartamentos');
            }
        });
    });

    router.get('/confirmarDeletarApartamento/:ID_Apartamento', (req, res) => {
        const id = req.params.ID_Apartamento;

        res.send(`
            <link rel="stylesheet" href="/css/style.css">

            <h1>Confirmar</h1>
            <p>Tem certeza que deseja deletar o apartamento?</p>
            <form action="/deletarApartamento/${id}" method="GET">
                <button class="submit" type="submit">Confirmar</button>
            </form>
            <a class="selections" href="/apartamentos">Cancelar</a>
        `);
    });

    router.get('/deletarApartamento/:ID_Apartamento', (req, res) => {
        const id = req.params.ID_Apartamento;
        const del = 'DELETE FROM apartamento WHERE ID_Apartamento = ?';

        connection.query(del, [id], (err, results) => {
            if(err) {
                if(err.code === 'ER_ROW_IS_REFERENCED_2') {
                    res.status(400).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Não é possível deletar este apartamento pois ele possuí um morador.</p>
                        <br>
                        <a class="selections" href="/apartamentos">Voltar</a>`);
                    return;
                }
                else{
                    console.error("Erro ao deletar apartamento: ", err);
                    res.status(500).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Erro ao deletar apartamento</p>
                        <br>
                        <a class="selections" href="/apartamentos">Voltar</a>`);
                    return;
                }
                
            }
            else {
                console.log("Apartamento deletado com sucesso");
                res.redirect('/apartamentos');
            }
        });
    });

    return router;
};

export default apartamentoRoute;