import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blocoRouter = (connection) => {
    const router = Router();

    router.get('/cadastroBloco', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/cadastroBloco.html'));
    });


    router.get('/blocos', (req, res) => {

        const select = 'SELECT * FROM Bloco;';

        connection.query(select, (err, rows) => {
            if(err) {
                console.error("Erro ao listar blocos: ", err);
                res.status(500).send('Erro ao listar blocos');
                return;
            }
            else {
                console.log("Blocos listados com sucesso");
                res.send(`
                    <h1>Lista de Blocos</h1>
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Descrição</th>
                            <th>Qnt de Apartamentos</th>
                            <th>Ações</th>
                        <tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID}</td>
                                <td>${row.descricao}</td>
                                <td>${row.qtd_apartamento}</td>
                                <td><a href="/deletarBloco/${row.ID}">Deletar</a></td>
                                <td><a href="/atualizarBloco/${row.ID}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a href="http://localhost:3000/cadastroBloco">Cadastrar Bloco</a>
                    <a href="/">Voltar</a>
                `)
                }
            });
        });

    router.post('/cadastrarBloco', (req, res) => {
        const bloco = req.body.nome;
        const quantidade = req.body.quantidade;

        const insert = 
            'INSERT INTO Bloco (descricao, qtd_apartamento) VALUES (?, ?)';
        connection.query(insert, [bloco, quantidade], (err, results) => {
            if(err){
                console.error("Erro ao inserir produto: ", err);
                res.status(500).send("Erro ao inserir bloco");
                return;
            }
            else {
                console.log("Bloco inserido com sucesso!");
                res.redirect('/');
            }
        })
    });

    router.get('/deletarBloco/:ID', (req, res) => {
        const id = req.params.ID;
        const deletar = 'DELETE FROM Bloco WHERE ID = ?';
        connection.query(deletar, [id], (err, results) => {
            if(err) {
                console.error("Erro ao deletar bloco: ", err);
                res.status(500).send("Erro ao deletar bloco");
                return;
            }
            else {
                console.log("Bloco deletado com sucesso");
                res.redirect('/blocos');
            }
        });
    });

    router.get('/atualizarBloco/:ID', (req, res) => {
        const id = req.params.ID;
        const select = 'SELECT * FROM Bloco WHERE ID = ?';

        connection.query(select, [id], (err, rows) => {
            if (!err && rows.length > 0)
            {
                const bloco = rows[0];
                res.send(
                    `
                    <html>
                        <head>
                            <title>Atualizar Produto</title>
                        </head>
                        <body>
                            <h1>Atualizar Produto</h1>
                            <form action="/atualizar/${bloco.ID}" method="POST">
                                <label for="nome">Nome do Bloco:</label>
                                <input type="text" id="nome" name="nome" 
                                value ="${bloco.descricao}" required><br><br>

                                <label for="quantidade">Quantidade de apartamentos:</label>
                                <input type="number" id="quantidade" name="quantidade"
                                value="${bloco.qtd_apartamento}" required><br><br>

                                <input type="submit" value="Atualizar">
                            </form>

                            <a href="/blocos">Voltar</a>
                        </body>
                    </html>
                    `
                );
            } 
            else {
                console.error("Erro ao buscar bloco: ", err);
                res.status(404).send("Bloco não encontrado");
            }
        });
    });

    router.post('/atualizarBloco/:ID', (req, res) => {
        const id = req.params.ID;
        const bloco = req.body.nome;
        const quantidade = req.body.quantidade;

        const update = 'UPDATE Bloco SET descricao = ?, qtd_apartamento = ? WHERE ID = ?';
        connection.query(update, [bloco, quantidade, id], (err, results) => {
            if (err) {
                console.error("Erro ao atualizar bloco: ", err);
                res.status(500).send("Erro ao atualizar bloco");
                return;
            } else {
                console.log("Bloco atualizado com sucesso");
                res.redirect('/blocos');
            }
        });
    });

    return router;
}

export default blocoRouter;