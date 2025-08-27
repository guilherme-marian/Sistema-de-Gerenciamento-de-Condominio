import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pagamentoRoute = (connection) => {
    const router = Router();

    router.get('/pagamentos', (req, res) => {
        const select = 'SELECT * FROM Pagamento';

        connection.query(select, (err, rows) => {
            if(err) {
                console.error("Erro ao listar pagamentos: ", err);
                res.status(500).send('Erro ao listar pagamentos');
                return;
            }
            else {
                res.send(`
                    <h1>Lista de Pagamentos</h1>
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Apartamento ID</th>
                            <th>Data do Pagamento</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Pagamento}</td>
                                <td>${row.apartamentoID}</td>
                                <td>${row.data_pagamento}</td>
                                <td>${row.valor}</td>
                                <td><a href="/deletarPagamento/${row.ID_Pagamento}">Deletar</a></td>
                                <td><a href="/atualizarPagamento/${row.ID_Pagamento}">Atualizar</a></td>
                            </tr> 
                        `).join('')}
                    </table> 
                    <a href="/cadastroPagamento">Cadastrar Pagamento</a>
                    <br>
                    <a href="/">Voltar</a>
                `)
            }
        });
    });

    router.get('/cadastroPagamento', (req, res) => {
        connection.query('SELECT ID_Apartamento, numero_apartamento FROM Apartamento', (err, apartamentos) => {
            if (err) {
                console.error("Erro ao buscar apartamentos: ", err);
                res.status(500).send("Erro ao buscar apartamentos");
                return;
            }
            else{
                const apartamentoOptions = apartamentos.map(a => `<option value="${a.ID_Apartamento}">${a.numero_apartamento}</option>`).join('');
                if(apartamentoOptions.length === 0) {
                    res.status(400).send('Nenhum apartamento cadastrado. Cadastre um apartamento antes de cadastrar um pagamento. <br> <a href="/apartamentos">Ir para apartamentos</a>');
                    return;
                }
                res.send(`
                    <h1>Cadastro de Pagamento</h1>
                    <form action="/cadastrarPagamento" method="POST">
                        <label for="apartamentoID">Apartamento:</label>
                        <select id="apartamentoID" name="apartamentoID" required>
                            ${apartamentoOptions}
                        </select>
                        <br>
                        <label for="cpf">CPF do Morador:</label>
                        <input type="text" id="cpf" name="cpf" minLength="14" pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" \ required><br><br>
                        <label for="data_pagamento">Data do Pagamento:</label>
                        <input type="month" id="data_pagamento" name="data_pagamento" required><br><br>
                        <label for="valor">Valor:</label>
                        <input type="number" step="0.01" id="valor" name="valor" required><br><br>
                        <input type="submit" value="Cadastrar Pagamento">
                    </form>
                    <a href="/pagamentos">Voltar para lista de pagamentos</a>

                    <script src="/js/app.js"></script>
                `);
            }
        });
    });

    return router;
};

export default pagamentoRoute;