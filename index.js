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
    database: 'controleEstoque'
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
    const produto = req.body.nome;
    const quantidade = req.body.quantidade;
    const preco = req.body.preco;

    const insert = 
        'INSERT INTO produtos (produto, quantidade, preco) VALUES (?, ?, ?)';
    connection.query(insert, [produto, quantidade, preco], (err, results) => {
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
    const select = 'SELECT * FROM produtos;';

    connection.query(select, (err, rows) => {
        if(err) {
            console.error("Erro ao listar produtos: ", err);
            res.status(500).send('Erro ao listar produtos');
            return;
        }
        else {
            console.log("Produtos listados com sucesso");
            res.send(`
                <h1>Lista de Produtos</h1>
                <table border="1">
                    <tr>
                        <th>ID</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preçoo</th>
                        <th>Ações</th>
                    <tr>
                    ${rows.map(row => `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.produto}</td>
                            <td>${row.quantidade}</td>
                            <td>${row.preco}</td>
                            <td><a href="/deletar/${row.id}">Deletar</a></td>
                        </tr>    
                    `).join('')}
                </table>    
                <a href="/">Voltar</a>
            `)
        }
    });
});

app.get('/deletar/:id', (req, res) => {
    const id = req.params.id;
    const deletar = 'DELETE FROM produtos WHERE id = ?';
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

app.get('/atualizar/:id', (req, res) => {
    const id = req.params.id;
    const select = 'SELECT * FROM produtor WHERE id = ?';

    connection.query(select, [id], (err, rows) => {
        if (!err && rows.length > 0)
        {
            const produto = rows[0];
            res.send(
                `
                <html>
                    <head>
                        <title>Atualizar Produto</title>
                    </head>
                    <body>
                        <h1>Atualizar Produto</h1>
                        <form action="/atualizar/${produto.id}" method="POST">
                            <label for="nome">Nome:</label>
                            <input type="text" id="nome" name="nome=" 
                            value ="${produto.produto}" required><br><br>

                            <label for="quantidade">Quantidade:</label>
                            <input type="number" id="quantidade" name="quantidade"
                            value="${produto.quantidade}" required><br><br>

                            <label for="preco">Preço:</label>
                            <input type="number" step="0.01" id="preco" name="preco"
                            value="${produto.preco}" required><br><br>

                            <input type="submite" value="Atualizar">
                        </form>

                        <a href="/relatorio">Voltar</a>
                    </body>
                </html>
                `
            );
        } 
        else {
            res.status(404).send("Produto não encontrado");
        }
    });
});

app.listen(3000, () => {
    console.log('Server running http://localhost:3000');
});
