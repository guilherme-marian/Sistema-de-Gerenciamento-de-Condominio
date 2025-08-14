const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const connection = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio'
});

connection.connect (function(err) {
    if(err) {
        console.error("Error: ", err);
        return;
    }
    else {
        console.log("Ok Connection");
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/cadastro.html');
});

app.post('/cadastrar', (req, res) => {
    const bloco = req.body.nome;
    const quantidade = req.body.quantidade;

    const insert = 
        'INSERT INTO Bloco (descricao, qtd_apartamento) VALUES (?, ?)';
    connection.query(insert, [bloco, quantidade], (err, results) => {
        if(err){
            console.error("Error to insert product: ", err);
            res.status(500).send("Error to register the product");
            return;
        }
        else {
            console.log("Product was insert with success!");
            res.redirect('/');
        }
    })
});

app.get('/relatorio', (req, res) => {
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
                            <td><a href="/deletar/${row.ID}">Deletar</a></td>
                            <td><a href="/atualizar/${row.ID}">Atualizar</a></td>
                        </tr>    
                    `).join('')}
                </table>    
                <a href="/">Voltar</a>
            `)
        }
    });
});

app.get('/deletar/:ID', (req, res) => {
    const id = req.params.ID;
    const deletar = 'DELETE FROM Bloco WHERE ID = ?';
    connection.query(deletar, [id], (err, results) => {
        if(err) {
            console.error("Erro ao deletar produto: ", err);
            res.status(500).send("Erro ao deletar produto");
            return;
        }
        else {
            console.log("Produto deletado com sucesso");
            res.redirect('/relatorio');
        }
    });
});

app.get('/atualizar/:ID', (req, res) => {
    const id = req.params.ID;
    const update = 'UPDATE Bloco SET descricao = ?, qtd_apartamento = ? WHERE ID = ?';
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
                        <form action="/atualizar/${bloco.id}" method="POST">
                            <label for="nome">Nome do Bloco:</label>
                            <input type="text" id="nome" name="nome" 
                            value ="${bloco.descricao}" required><br><br>

                            <label for="quantidade">Quantidade de apartamentos:</label>
                            <input type="number" id="quantidade" name="quantidade"
                            value="${bloco.qtd_apartamento}" required><br><br>

                            <input type="submit" value="Atualizar">
                        </form>

                        <a href="/relatorio">Voltar</a>
                    </body>
                </html>
                `
            );
            connection.query(update, [req.params.nome, req.params.quantidade, id], (err, results) => {
                if(err) {
                    console.error("Erro ao atualizar produto: ", err);
                    res.status(500).send("Erro ao atualizar produto");
                    return;
                }
                else {
                    console.log("Produto atualizado com sucesso");
                    res.redirect('/relatorio');
                }
            });
        } 
        else {
            console.error("Erro ao buscar produto: ", err);
            res.status(404).send("Produto não encontrado");
        }
    });
});

app.listen(3000, () => {
    console.log('Server running http://localhost:3000');
});
