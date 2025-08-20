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

app.get('/cadastroBloco', (req, res) => {
    res.sendFile(__dirname + '/cadastroBloco.html');
});

app.post('/cadastrarBloco', (req, res) => {
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

app.get('/blocos', (req, res) => {
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
                <a href="http://localhost:3000/cadastro">Cadastrar Bloco</a>
                <a href="/">Voltar</a>
            `)
        }
    });
});

app.get('/deletarBloco/:ID', (req, res) => {
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
            res.redirect('/relatorio');
        }
    });
});

app.get('/atualizarBloco/:ID', (req, res) => {
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

                        <a href="/relatorio">Voltar</a>
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

app.post('/atualizarBloco/:ID', (req, res) => {
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
            res.redirect('/relatorio');
        }
    });
});

app.get('/apartamentos', (req, res) => {
    const select = 'SELECT * FROM apartamento;';

    connection.query(select, (err, rows) => {
        if(err) {
            console.error("Erro ao listar apartamentos: ", err);
            res.status(500).send('Erro ao listar apartamentos');
            return;
        }
        else {
            console.log("Apartamentos listados com sucesso");
            res.send(`
                <h1>Lista de Apartamentos</h1>
                <table border="1">
                    <tr>
                        <th>ID</th>
                        <th>Bloco</th>
                        <th>Número do apartamento</th>
                        <th>Ações</th>
                    <tr>
                    ${rows.map(row => `
                        <tr>
                            <td>${row.ID}</td>
                            <td>${row.BlocoID}</td>
                            <td>${row.numero_apartamento}</td>
                            <td><a href="/deletar/${row.ID}">Deletar</a></td>
                            <td><a href="/atualizar/${row.ID}">Atualizar</a></td>
                        </tr>    
                    `).join('')}
                </table>    
                <a href="http://localhost:3000/cadastroApartamento">Cadastrar Apartamento</a>
                <a href="/">Voltar</a>
            `)
        }
    });
});

app.get('/moradores', (req, res) => {
    const select = 'SELECT * FROM morador;';

    connection.query(select, (err, rows) => {
        if(err) {
            console.error("Erro ao listar moradores: ", err);
            res.status(500).send('Erro ao listar moradores');
            return;
        }
        else {
            console.log("Moradores listados com sucesso");
            res.send(`
                <h1>Lista de Moradores</h1>
                <table border="1">
                    <tr>
                        <th>ID</th>
                        <th>CPF</th>
                        <th>Nome</th>
                        <th>Apartamento</th>
                        <th>Bloco</th>
                        <th>Ações</th>
                    <tr>
                    ${rows.map(row => `
                        <tr>
                            <td>${row.ID}</td>
                            <td>${row.cpf}</td>
                            <td>${row.nome}</td>
                            <th>${apartamentoID}</td>
                            <td>${blocoID}</td>
                            <td><a href="/deletar/${row.ID}">Deletar</a></td>
                            <td><a href="/atualizar/${row.ID}">Atualizar</a></td>
                        </tr>    
                    `).join('')}
                </table>    
                <a href="http://localhost:3000/cadastroMorador>Cadastrar Morador</a>
                <a href="/">Voltar</a>
            `);
        }
    });
});

app.listen(3000, () => {
    console.log('Server running http://localhost:3000');
});
