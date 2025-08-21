import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apartamentoRouter = (connection) => {
    const router = Router();

    router.get('/apartamentos', (req, res) => {
        const select = 'SELECT * FROM apartamento;';
        
        connection.query(select, (err, rows) => {
            if(err) {
                console.error("Erro ao listar apartamentos: ", err);
                res.status(500).send('Erro ao listar apartamentos');
                return;
            }
            else {
                res.send(`
                    <h1>Lista de Apartamentos</h1>
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Bloco</th>
                            <th>Número do apartamento</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID}</td>
                                <td value>${row.blocoID}</td>
                                <td>${row.numero_apartamento}</td>
                                <td><a href="/deletarApartamento/${row.ID}">Deletar</a></td>
                                <td><a href="/atualizarApartamento/${row.ID}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a href="/cadastroApartamento">Cadastrar Apartamento</a>
                    <a href="/">Voltar</a>
                `)
            }
        });
    });
    
    router.get('/cadastroApartamento', (req, res) => {
        connection.query('SELECT ID, descricao FROM Bloco', (err, blocos) => {
            if (err) {
                console.error("Erro ao buscar blocos: ", err);
                res.status(500).send("Erro ao buscar blocos");
                return;
            }
            else{
                const blocoOptions = blocos.map(b => `<option value="${b.ID}">${b.descricao}</option>`).join('');
                res.send(`
                    <html>
                        <head><title>Cadastrar Apartamento</title></head>
                        <body>
                            <h1>Cadastrar Apartamento</h1>
                            <form action="/cadastrarApartamento" method="POST">
                                <label for="bloco">Bloco:</label>
                                <select id="bloco" name="BlocoID" required>
                                    ${blocoOptions}
                                </select><br><br>
                                <label for="numero_apartamento">Número do Apartamento:</label>
                                <input type="text" id="numero_apartamento" name="numero_apartamento" required><br><br>
                                <input type="submit" value="Cadastrar">
                            </form>
                            <a href="/apartamentos">Voltar</a>
                        </body>
                    </html>
                `);
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

    router.get('/atualizarApartamento/:ID', (req, res) => {
        const id = req.params.ID;
        const select = 'SELECT * FROM apartamento WHERE ID = ?';
        const blocoOptions = blocos.map(b => `<option value="${b.blocoID}">${b.descricao}</option>`).join('');

        connection.query(select, [id], (err, rows) => {
            if (!err && rows.length > 0)
            {
                const bloco = rows[0];
                res.send(
                    `
                    <html>
                        <head>
                            <title>Atualizar Apartamento</title>
                        </head>
                        <body>
                            <h1>Atualizar Apartamento</h1>
                            <form action="/atualizarApartamento/${ID}" method="POST">
                               <label for="bloco">Bloco:</label>
                                <select id="bloco" name="BlocoID" required>
                                    ${blocoOptions}
                                </select><br><br>
                                <label for="numero_apartamento">Número do Apartamento:</label>
                                <input type="text" id="numero_apartamento" name="numero_apartamento" required><br><br>

                                <input type="submit" value="Atualizar">
                            </form>
                            <a href="/apartamentos">Voltar</a>
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

    router.post('/atualizarApartamento/:ID', (req, res) => {
        const id = req.params.ID;
        const bloco = req.body.blocoID;
        const numero_apartamento = req.body.numero_apartamento;

        const update = 'UPDATE apartamento SET blocoID = ?, numero_apartamento = ? WHERE ID = ?';
        connection.query(update, [bloco, numero_apartamento, id], (err, results) => {
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
};

export default apartamentoRouter;