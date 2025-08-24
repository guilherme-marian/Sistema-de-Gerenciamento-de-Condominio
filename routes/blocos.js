import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blocoRoute = (connection) => {
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
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Bloco}</td>
                                <td>${row.descricao}</td>
                                <td>${row.qtd_apartamento}</td>
                                <td><a href="/deletarBloco/${row.ID_Bloco}">Deletar</a></td>
                                <td><a href="/atualizarBloco/${row.ID_Bloco}">Atualizar</a></td>
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
                res.redirect('/blocos');
            }
        })
    });

    router.get('/deletarBloco/:ID_Bloco', (req, res) => {
        const id = req.params.ID_Bloco;
        const deletar = 'DELETE FROM Bloco WHERE ID_Bloco = ?';
        connection.query(deletar, [id], (err, results) => {
            if(err) {
                 if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    console.error("Erro ao deletar bloco: Existem apartamentos associados a este bloco.");
                    res.status(400).send("Erro ao deletar bloco: Existem apartamentos associados a este bloco.");
                    return;
                }
                else {
                    console.error("Erro ao deletar bloco: ", err);
                    res.status(500).send("Erro ao deletar bloco");
                    return;
                }
                
            }
            else {
                console.log("Bloco deletado com sucesso");
                res.redirect('/blocos');
            }
        });
    });

    router.get('/atualizarBloco/:ID_Bloco', (req, res) => {
        const id = req.params.ID_Bloco;
        console.log(id);
        const select = 'SELECT * FROM Bloco WHERE ID_Bloco = ?';

        connection.query(select, [id], (err, rows) => {
            if (!err && rows.length > 0)
            {
                const bloco = rows[0];
                res.send(
                    `
                    <html>
                        <head>
                            <title>Atualizar Bloco</title>
                        </head>
                        <body>
                            <h1>Atualizar Bloco</h1>
                            <form action="/atualizarBloco/${bloco.ID_Bloco}" method="POST">
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

    router.post('/atualizarBloco/:ID_Bloco', (req, res) => {
        const id = req.params.ID_Bloco;
        const bloco = req.body.nome;
        const quantidade = req.body.quantidade;

        const update = 'UPDATE Bloco SET descricao = ?, qtd_apartamento = ? WHERE ID_Bloco = ?';
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

export default blocoRoute;