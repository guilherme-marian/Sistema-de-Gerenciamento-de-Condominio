import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { send } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pagamentoRoute = (connection) => {
    const router = Router();

    router.get('/pagamentos', (req, res) => {

        const search = req.query.search || '';
        const select = `SELECT P.ID_Pagamento, P.mesAno_referencia, P.valor, P.vencimento, P.data_pagamento,
            A.numero_apartamento, B.descricao AS bloco, M.nome AS morador_nome, M.cpf, M.telefone
            FROM Pagamento P
            JOIN Apartamento A ON P.apartamentoID = A.ID_Apartamento
            JOIN Bloco B ON A.BlocoID = B.ID_Bloco
            LEFT JOIN Morador M ON P.moradorID = M.ID_Morador
            WHERE M.nome LIKE ? OR M.cpf LIKE ?;`;
        const searchParam = `%${search}%`;

        connection.query(select, [searchParam, searchParam], (err, rows) => {
            if(err) {
                console.error("Erro ao listar pagamentos: ", err);
                res.status(500).send('Erro ao listar pagamentos');
                return;
            }
            else {
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Condomínio</h1>

                    <form class="search" method="GET" action="/pagamentos">
                        <input type="text" name="search" placeholder="Buscar por nome ou CPF" value="${search}">
                        <button type="submit">Buscar</button>
                    </form>

                    <table class="tables" border="1">
                        <tr>
                            <th>ID</th>
                            <th>Morador</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>Apartamento</th>
                            <th>Bloco</th>
                            <th>Mês Referência</th>
                            <th>Vencimento</th>
                            <th>Valor</th>
                            <th>Data de Pagamento</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Pagamento}</td>
                                <td>${row.morador_nome || 'Morador deletado'}</td>
                                <td>${row.cpf || '-'}</td>
                                <td>${row.telefone || '-'}</td>
                                <td>${row.numero_apartamento}</td>
                                <td>${row.bloco}</td>
                                <td>${row.mesAno_referencia ? row.mesAno_referencia.toISOString().slice(0, 7) : ''}</td>
                                <td>${row.vencimento ? row.vencimento.toISOString().slice(0, 7) : ''}</td>
                                <td>R$ ${parseFloat(row.valor).toFixed(2)}</td>
                                <td>${row.data_pagamento ? row.data_pagamento.toISOString().slice(0, 10) : 'Não pago'}</td>
                                <td><a href="/deletarPagamento/${row.ID_Pagamento}">Deletar</a></td>
                            </tr> 
                        `).join('')}
                    </table> 
                    <a class="selections" href="/cadastroPagamento">Cadastrar Pagamento</a>
                    <br>
                    <a class="selections" href="/">Voltar</a>
                `)
            }
        });
    });

    router.get('/cadastroPagamento', (req, res) => {

        const search = req.query.search || '';
        const select =  `SELECT A.ID_Apartamento, A.numero_apartamento, M.ID_Morador, M.cpf, M.nome, M.telefone, B.descricao
        FROM Apartamento A 
        JOIN Morador M ON A.ID_Apartamento = M.ApartamentoID 
        JOIN Bloco B ON A.BlocoID = B.ID_Bloco
        WHERE M.responsavel = "Sim";`;


        connection.query(select, (err, apartamentos) => {
            if (err) {
                console.error("Erro ao buscar apartamentos: ", err);
                res.status(500).send("Erro ao buscar apartamentos");
                return;
            }
            else{
                const apartamentoOptions = apartamentos.map(a => `<option value="${a.ID_Apartamento}"
                    data-moradorid="${a.ID_Morador}"
                    data-cpf="${a.cpf}"
                    data-nome="${a.nome} ""
                    data-telefone="${a.telefone}"
                    data-bloco="${a.descricao}">
                    ${a.numero_apartamento}</option>`).join('');

                if(apartamentoOptions.length === 0) {
                    res.status(400).send('Nenhum morador cadastrado. Cadastre um morador antes de cadastrar um pagamento. <br> <a href="/moradores">Ir para moradores</a>');
                    return;
                }
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Caondomínio</h1>

                    <form class="cadastro" action="/cadastrarPagamento" method="POST">
                        <fieldset>
                            <legend>Detalhes do Pagamento</legend>

                                <label for="apartamentoID">Apartamento:</label>
                                <select id="apartamentoID" name="apartamentoID" required>
                                    <option value="" disabled selected>Selecione um Apartamento</option>
                                    ${apartamentoOptions}
                                </select>
                                <br>
                                <br>

                                <input type="hidden" id="moradorID" name="moradorID">

                                <label for="blocoPagamento">Bloco:</label>
                                <input type="text" id="blocoPagamento" name="blocoPagamento" autocomplete="on" readonly>
                                <br><br>
                                
                                <label for="cpfPagamento">CPF do Morador:</label>
                                <input type="text" id="cpfPagamento" name="cpfPagamento" autocomplete="on" readonly><br><br>
                                
                                <label for="nomePagamento">Nome do Morador:</label>
                                <input type="text" id="nomePagamento" name="nomePagamento" autocomplete="on" readonly><br><br>

                                <label for="telefonePagamento">Telefone:</label>
                                <input type="text" id="telefonePagamento" name="telefonePagamento" autocomplete="on" readonly><br><br>

                                <label for="data_referencia">Mês/Ano Referência:</label>
                                <input type="month" id="data_referencia" name="data_referencia" required><br><br>

                                <label for="valor">Valor:</label>
                                <input type="number" step="0.01" id="valor" name="valor" required><br><br>

                                <label for="Vencimento">Vencimento:</label>
                                <input type="month" id="vencimento" name="vencimento" required><br><br>

                                <input class="submit" type="submit" value="Pagar">
                        </fieldset>
                    </form>
                    <a class="selections" href="/pagamentos">Voltar</a>

                    <script src="/js/autoCompletePag.js"></script>
                `);
            }
        });
    });

    router.post('/cadastrarPagamento', (req, res) => {
        const {apartamentoID, cpfPagamento, telefonePagamento, moradorID, valor} = req.body;

        const data_referencia = req.body.data_referencia + '-01';
        const vencimento = req.body.vencimento + '-01';

        const insert = 'INSERT INTO Pagamento (apartamentoID, cpf, telefone, moradorID, mesAno_referencia, valor, vencimento) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(insert, [apartamentoID, cpfPagamento, telefonePagamento, moradorID, data_referencia, valor, vencimento], (err, result) => {
            if(err) {
                console.error("Erro ao cadastrar pagamento: ", err);
                res.status(500).send('Erro ao cadastrar pagamento');
                return;
            }
            else {
                res.send(`
                    <link rel="stylesheet" href="/css/style.css">

                    <h1 class="title">Pagamento efetuado com sucesso!</h1>
                    <a class="selections" href="/pagamentos">Voltar para lista de pagamentos</a>
                `);
            }
        });
    });

    router.get('/deletarPagamento/:id', (req, res) => {
        res.send(`
            <link rel="stylesheet" href="/css/style.css">
            <h1 class="title">Tem certeza que deseja deletar este pagamento?</h1>
            <form action="/confirmarDeletarPagamento/${req.params.id}" method="POST">
                <button class="submit" type="submit">Sim, deletar</button>
            </form>
            <a class="selections" href="/pagamentos">Cancelar</a>
        `)
    });

    router.post('/confirmarDeletarPagamento/:id', (req, res) => {
        const pagamentoID = req.params.id;
        const del = 'DELETE FROM Pagamento WHERE ID_Pagamento = ?';
        connection.query(del, [pagamentoID], (err, result) => {
            if(err) {
                console.error("Erro ao deletar pagamento: ", err);
                res.status(500).send('Erro ao deletar pagamento');
                return;
            }
            else {
                res.redirect('/pagamentos');
            }
        });
    });

    return router;
};

export default pagamentoRoute;