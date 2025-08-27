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
        const select =  `SELECT A.ID_Apartamento, A.numero_apartamento, M.cpf, M.nome, M.telefone, B.descricao
        FROM Apartamento A 
        JOIN Morador M ON A.ID_Apartamento = M.ApartamentoID 
        JOIN Bloco B ON A.BlocoID = B.ID_Bloco
        WHERE M.responsavel = "Sim"`;
        connection.query(select , (err, apartamentos) => {
            if (err) {
                console.error("Erro ao buscar apartamentos: ", err);
                res.status(500).send("Erro ao buscar apartamentos");
                return;
            }
            else{
                const apartamentoOptions = apartamentos.map(a => `<option value="${a.ID_Apartamento}"
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
                    <h1>Cadastro de Pagamento</h1>
                    <form action="/cadastrarPagamento" method="POST">
                        <fieldset>
                            <legend>Detalhes do Pagamento</legend>

                                <label for="apartamentoID">Apartamento:</label>
                                <select id="apartamentoID" name="apartamentoID" required>
                                    ${apartamentoOptions}
                                </select>
                                <br>
                                <br>

                                <label for="blocoPagamento">Bloco:</label>
                                <input type="text" id="blocoPagamento" name="blocoPagamento" readonly>
                                <br><br>
                                
                                <label for="cpfPagamento">CPF do Morador:</label>
                                <input type="text" id="cpfPagamento" name="cpfPagamento" readonly><br><br>
                                
                                <label for="nomePagamento">Nome do Morador:</label>
                                <input type="text" id="nomePagamento" name="nomePagamento" readonly><br><br>

                                <label for="telefonePagamento">Telefone:</label>
                                <input type="text" id="telefonePagamento" name="telefonePagamento" readonly><br><br>

                                <label for="data_pagamento">Mês/Ano Referência:</label>
                                <input type="month" id="data_referencia" name="data_pagamento" required><br><br>

                                <label for="valor">Valor:</label>
                                <input type="number" step="0.01" id="valor" name="valor" required><br><br>

                                <label for="Vencimento">Vencimento:</label>
                                <input type="month" id="vencimento" name="vencimento" required><br><br>

                                <input type="submit" value="Pagar">
                        </fieldset>
                    </form>
                    <a href="/pagamentos">Voltar para lista de pagamentos</a>

                    <script src="/js/autoCompletePag.js"></script>
                `);
            }
        });
    });

    return router;
};

export default pagamentoRoute;