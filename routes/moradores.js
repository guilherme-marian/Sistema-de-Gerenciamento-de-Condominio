import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moradorRouter = (connection) => {

    const router = Router();

    router.get('/moradores', (req, res) => {
        const select = 'SELECT * FROM morador INNER JOIN apartamento ON morador.apartamentoID = apartamento.ID_Apartamento;';

        connection.query(select, (err, rows) => {
            if(err) {
                console.error("Erro ao listar moradores: ", err);
                res.status(500).send('Erro ao listar moradores');
                return;
            }
            else {
                const apartamentos = rows.map(a => `<li value="${a.ID_Apartamento}">${a.numero_apartamento}</li>`).join('');

                console.log("Moradores listados com sucesso");
                res.send(`
                    <h1>Lista de Moradores</h1>
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>CPF</th>
                            <th>Nome</th>
                            <th>Apartamento</th>
                            <th>bloco</th>
                            <th>Ações</th>
                        <tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Morador}</td>
                                <td>${row.cpf}</td>
                                <td>${row.nome}</td>
                                <td>${row.numero_apartamento}</td>
                                <td>${row.blocoID}</td>  
                                <td><a href="/deletar/${row.ID}">Deletar</a></td>
                                <td><a href="/atualizar/${row.ID}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a href="http://localhost:3000/cadastroMorador">Cadastrar Morador</a>
                    <a href="/">Voltar</a>
                `)
            }
        });
    });
    
    router.get('/cadastroMorador', (req, res) => {
        const apartamentoSelect = 'SELECT * FROM Apartamento;';

        connection.query(apartamentoSelect, (err, rows) => {
            if(err) {
                console.error("Erro ao listar apartamentos: ", err);
                res.status(500).send('Erro ao listar apartamentos');
                return;
            }
            else {
                const apartamentosOptions = rows.map(a => `<option value="${a.ID_Apartamento}">${a.numero_apartamento}</option>`).join('');

                res.send(`
                    <h1>Condomínio</h1>
                <form action="/cadastrarMorador" method="POST">
                    <fieldset>
                        <legend>Cadastrar Morador</legend>
                        <label for="cpf">CPF:</label>
                        <input type="text" id="cpf" name="cpf" required>
                        <br>
                        <label for="nome">Nome:</label>
                        <input type="text" id="nome" name="nome" required>
                        <br>
                        <label for="telefone">Telefone:</label>
                        <input type="text" id="telefone" name="telefone" required>
                        <br>
                        <label for="apartamento">Apartamento:</label>
                        <select id="apartamento" name="apartamentoID" required>
                            ${apartamentosOptions}
                        </select>
                        <br>
                        <label for="responsavel">Responsável pelo apartamento?</label>
                        <input type="radio" id="simResponsavel" name="responsavel" value="sim" required>
                        <label for="simResponsavel">Sim</label>
                        <input type="radio" id="naoResponsavel" name="responsavel" value="nao" required>
                        <label for="naoResponsavel">Não</label>
                        <br>
                        <label for="proprietario">Proprietário do apartamento?</label>
                        <input type="radio" id="simProprietario" name="proprietario" value="sim" required>
                        <label for="simProprietario">Sim</label>
                        <input type="radio" id="naoProprietario" name="proprietario" value="nao" required>
                        <label for="naoProprietario">Não</label>
                        <br>
                        <label for="veiculo">Possui veículo?</label>
                        <input type="radio" id="simVeiculo" name="veiculo" value="sim" onClick="showCarInfo()" required>
                        <label for="simVeiculo">Sim</label>
                        <input type="radio" id="naoVeiculo" name="veiculo" value="nao" onClick="hideCarInfo()" required>
                        <label for="naoVeiculo">Não</label>
                        <br>
                    </fieldset>
                    <div id="carInfo" style="display:none;">
                        <fieldset>
                            <legend>Dados do Veículo</legend>
                            <label for="quantidadeVagas">Quantidade de vagas de garagem: </label>
                            <input type="number" name="quantidadeVagas" id="quantidadeVagas" min="0" value="0">
                            <br>
                            <label for="numeroVaga">Número da vaga: </label>
                            <input type="text" name="numeroVaga" id="numeroVaga">
                            <br>
                            <label for="placa">Placa:</label>
                            <input type="text" id="placa" name="placa">
                            <label for="marca">Marca:</label>
                            <input type="text" id="marca" name="marca">
                            <br>
                            <label for="modelo">Modelo:</label>
                            <input type="text" id="modelo" name="modelo">
                            <br>
                        </fieldset>
                    </div>
                
                    <input type="submit">
                </form>
                <p><a href="http://localhost:3000/">Voltar para Home</a></p>

            <script src="/js/app.js"></script>
            `);
            }
        });
        
    });

    router.post('/cadastrarMorador', (req, res) => {
        const { cpf, nome, apartamentoID, blocoID, responsavel, proprietario, veiculo } = req.body;
        
        const insert = 'INSERT INTO morador (cpf, nome, apartamentoID, blocoID, responsavel, proprietario, possui_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?);';

        connection.query(insert, [cpf, nome, apartamentoID, blocoID, responsavel, proprietario, veiculo], (err, result) => {
            if(err) {
                console.error("Erro ao cadastrar morador: ", err);
                res.status(500).send('Erro ao cadastrar morador');
                return;
            }
            else {
                console.log("Morador cadastrado com sucesso");
                res.redirect('/moradores');
            }
            if(veiculo === 'sim')
        {
            const donoID = result.insertId;
            const {quantidadeVagas, numeroVaga, Placa, marca, modelo} = req.body;
            const insertVeiculo = 'INSERT INTO Veiculos (donoID, placa, marca, modelo) VALUES (?, ?, ?, ?);';

            connection.query(insertVeiculo, [donoID, Placa, marca, modelo], (err, result) => {
                if(err) {
                    console.error("Erro ao cadastrar veiculo: ", err);
                    res.status(500).send('Erro ao cadastrar veiculo');
                    return;
                }
                else {
                    console.log("Veiculo cadastrado com sucesso");
                }
            });
        }
        });
    });

    return router;
}

export default moradorRouter;