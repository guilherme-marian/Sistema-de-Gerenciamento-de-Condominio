import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moradorRoute = (connection) => {

    const router = Router();

    router.get('/moradores', (req, res) => {
        const select = `SELECT 
            m.ID_Morador, m.cpf, m.nome, m.telefone,
            a.numero_apartamento,
            b.descricao AS bloco_nome
            FROM morador m
            INNER JOIN apartamento a ON m.apartamentoID = a.ID_Apartamento
            INNER JOIN bloco b ON m.blocoID = b.ID_Bloco;`;

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
                            <th>Telefone</th>
                            <th>Apartamento</th>
                            <th>bloco</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Morador}</td>
                                <td>${row.cpf}</td>
                                <td>${row.nome}</td>
                                <td>${row.telefone}</td>
                                <td>${row.numero_apartamento}</td>
                                <td>${row.bloco_nome}</td>  
                                <td><a href="/deletarMorador/${row.ID_Morador}">Deletar</a></td>
                                <td><a href="/atualizarMorador/${row.ID_Morador}">Atualizar</a></td>
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
        const apartamentoSelect = `SELECT A. numero_apartamento 
        FROM Apartamento A
        JOIN Bloco B ON A.BlocoID = B.ID_Bloco;`;

        connection.query(apartamentoSelect, (err, rows) => {
            if(err) {
                console.error("Erro ao listar apartamentos: ", err);
                res.status(500).send('Erro ao listar apartamentos');
                return;
            }
            else {
                const apartamentosOptions = rows.map(a => `<option value="${a.ID_Apartamento}"
                    data-bloco="${a.descricao}">
                    ${a.numero_apartamento}</option>`).join('');
                if(apartamentosOptions.length === 0) {
                    res.status(400).send('Nenhum apartamento cadastrado. Cadastre um apartamento antes de cadastrar um morador. <br> <a href="/apartamentos">Ir para apartamentos</a>');
                    return;
                }
                else {
                    res.send(`
                        <h1>Condomínio</h1>
                    <form action="/cadastrarMorador" method="POST">
                        <fieldset>
                            <legend>Cadastrar Morador</legend>
                            <label for="cpf">CPF:</label>
                            <input type="text" id="cpf" name="cpf" pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" required>
                            <br>
                            
                            <label for="nome">Nome:</label>
                            <input type="text" id="nome" name="nome" required>
                            <br>
                            
                            <label for="telefone">Telefone:</label>
                            <input type="text" id="telefone" name="telefone" pattern="\\(\\d{2}\\) \\d{4}-\\d{4}"  required>
                            <br>
                            
                            <label for="apartamento">Apartamento:</label>
                            <select id="apartamento" name="apartamentoID" required>
                                ${apartamentosOptions}
                            </select>
                            <br>

                            <label for="bloco">Bloco:</label>
                            <input type="text" id="bloco" name="bloco" readonly>

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
                    <script src="/js/autoCompleteMorador.js"></script>
                `);
                }
                
            }
        });
        
    });

    router.post('/cadastrarMorador', (req, res) => {
        const { cpf, nome, telefone, apartamentoID, responsavel, proprietario, veiculo } = req.body;

        const blocoIDQuery = 'SELECT BlocoID FROM Apartamento WHERE ID_Apartamento = ?;';
        connection.query(blocoIDQuery, [apartamentoID], (err, blocoRows) => {
            if(err) {
                console.error("Erro ao buscar bloco do apartamento: ", err);
                res.status(500).send('Erro ao buscar bloco do apartamento');
                return;
            }
            else {
                const blocoID = blocoRows[0].BlocoID;
                const insert = 'INSERT INTO morador (cpf, nome, telefone, apartamentoID, blocoID, responsavel, proprietario, possui_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';

                connection.query(insert, [cpf, nome, telefone, apartamentoID, blocoID, responsavel, proprietario, veiculo], (err, result) => {
                    if(err) {
                        console.error("Erro ao cadastrar morador: ", err);
                        res.status(500).send('Erro ao cadastrar morador');
                        return;
                    }
                    else {
                        console.log("Morador cadastrado com sucesso");
                        res.redirect('/moradores');
                    }
                });
            }
            if(veiculo === 'sim')
            {
                const donoID = req.params.ID_Morador;
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

    router.get('/deletarMorador/:ID_Morador', (req, res) => {
        const id = req.params.ID_Morador;
        const deletar = 'DELETE FROM Morador WHERE ID_Morador = ?';
        connection.query(deletar, [id], (err, results) => {
            if(err) {
                if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                    connection.query('DELETE FROM Veiculos WHERE donoID = ?', [id], (err, results) => {
                        if (err) {
                            console.error("Erro ao deletar veículos associados ao morador: ", err);
                            res.status(500).send("Erro ao deletar veículos associados ao morador");
                            return;
                        }
                    });
                    
                }
                else {
                   console.error("Erro ao deletar morador: ", err);
                    res.status(500).send("Erro ao deletar morador");
                    return;
                }
                
                
            }
            else {
                console.log("Morador deletado com sucesso");
                res.redirect('/moradores');
            }
        });
    });

    router.get('/atualizarMorador/:ID_Morador', (req, res) => {
        const id = req.params.ID_Morador;
        const selectMorador = `SELECT M.cpf, M.nome, M.telefone, M.responsavel, M.proprietario, M.possui_veiculo
        FROM Morador M
        LEFT JOIN Veiculos V ON M.ID_Morador = V.donoID
        WHERE ID_Morador = ?;`;
        const selectApartamento = 'SELECT * FROM Apartamento;';

        connection.query(selectMorador, [id], (err, moradorRows) => {
            if(err) {
                console.error("Erro ao buscar morador: ", err);
                res.status(500).send('Erro ao buscar morador');
                return;
            }
            else if(moradorRows.length === 0) {
                res.status(404).send('Morador não encontrado');
                return;
            }
            else {
                const morador = moradorRows[0];
                connection.query(selectApartamento, (err, apartamentoRows) => {
                    if(err) {
                        console.error("Erro ao listar apartamentos: ", err);
                        res.status(500).send('Erro ao listar apartamentos');
                        return;
                    }
                    else {
                        const apartamentosOptions = apartamentoRows.map(a => `
                            <option value="${a.ID_Apartamento}" ${a.ID_Apartamento === morador.apartamentoID ? 'selected' : ''}>
                                ${a.numero_apartamento}
                            </option>
                        `).join('');
                        res.send(`
                            <h1>Condomínio</h1>
                            <form action="/atualizarMorador/${id}" method="POST">
                                <fieldset>
                                    <legend>Atualizar Morador</legend>
                                    <label for="cpf">CPF:</label>
                                    <input type="text" id="cpf" name="cpf" pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" value="${morador.cpf}" required>
                                    <br>
                                    
                                    <label for="nome">Nome:</label>
                                    <input type="text" id="nome" name="nome" value="${morador.nome}" required>
                                    <br>
                                    
                                    <label for="telefone">Telefone:</label>
                                    <input type="text" id="telefone" name="telefone" value="${morador.telefone}" required>
                                    <br>
                                    
                                    <label for="apartamento">Apartamento:</label>
                                    <select id="apartamento" name="apartamentoID" required>
                                        ${apartamentosOptions}
                                    </select>

                                    <br>
                                    <label for="responsavel">Responsável pelo apartamento?</label>
                                    <input type="radio" id="simResponsavel" name="responsavel" value="sim" ${morador.responsavel === 'Sim' ? 'checked' : ''} required>
                                    <label for="simResponsavel">Sim</label>
                                    <input type="radio" id="naoResponsavel" name="responsavel" value="nao" ${morador.responsavel === 'Não' ? 'checked' : ''} required>
                                    <label for="naoResponsavel">Não</label>
                                    <br>
                                    <label for="proprietario">Proprietário do apartamento?</label>
                                    <input type="radio" id="simProprietario" name="proprietario" value="sim" ${morador.proprietario === 'Sim' ? 'checked' : ''} required>
                                    <label for="simProprietario">Sim</label>
                                    <input type="radio" id="naoProprietario" name="proprietario" value="nao" ${morador.proprietario === 'Não' ? 'checked' : ''} required>
                                    <label for="naoProprietario">Não</label>
                                    <br>
                                    <label for="veiculo">Possui veículo?</label>
                                    <input type="radio" id="simVeiculo" name="veiculo" value="sim" ${morador.possui_veiculo === 'Sim' ? 'checked' : ''} onClick="showCarInfo()" required>
                                    <label for="simVeiculo">Sim</label>
                                    <input type="radio" id="naoVeiculo" name="veiculo" value="nao" ${morador.possui_veiculo === 'Não' ? 'checked' : ''} onClick="hideCarInfo()" required>
                                    <label for="naoVeiculo">Não</label>
                                    <br>
                                </fieldset>
                                <div id="carInfo" style="display:none;">
                                <fieldset>
                                    <legend>Dados do Veículo</legend>                                        <label for="quantidadeVagas">Quantidade de vagas de garagem: </label>
                                    <input type="number" name="quantidadeVagas" id="quantidadeVagas" min="0" value="${morador.quantidadeVagas || 0}">
                                    <br>
                                    <label for="numeroVaga">Número da vaga: </label>
                                    <input type="text" name="numeroVaga" id="numeroVaga" value="${morador.numeroVaga || ''}">
                                    <br>
                                    <label for="placa">Placa:</label>
                                    <input type="text" id="placa" name="placa" value="${morador.placa || ''}">
                                    <label for="marca">Marca:</label>
                                    <input type="text" id="marca" name="marca" value="${morador.marca || ''}">
                                    <br>
                                    <label for="modelo">Modelo:</label>
                                    <input type="text" id="modelo" name="modelo" value="${morador.modelo || ''}">
                                    <br>
                                </fieldset>
                                </div>
                                <input type="submit" value="Atualizar">
                            </form>
                            
                            <script src="/js/app.js"></script>
                            <p><a href="http://localhost:3000/moradores">Voltar para Moradores</a></p>
                        `);
                    }
                });
            }
        });
    });

    router.post('/atualizarMorador/:ID_Morador', (req, res) => {
        const id = req.params.ID_Morador;
        const { cpf, nome, telefone, apartamentoID, responsavel, proprietario, veiculo } = req.body;
        const blocoIDQuery = 'SELECT BlocoID FROM Apartamento WHERE ID_Apartamento = ?;';

        connection.query(blocoIDQuery, [apartamentoID], (err, blocoRows) => {
            if(err) {
                console.error("Erro ao buscar bloco do apartamento: ", err);
                res.status(500).send('Erro ao buscar bloco do apartamento');
                return;
            }
            else {
                const blocoID = blocoRows[0].BlocoID;
                const update = 'UPDATE Morador SET cpf = ?, nome = ?, telefone = ?, apartamentoID = ?, blocoID = ?, responsavel = ?, proprietario = ?, possui_veiculo = ? WHERE ID_MORADOR = ?';

                connection.query(update, [cpf, nome, telefone, apartamentoID, blocoID, responsavel, proprietario, veiculo, id], (err, result) => {
                    if(err) {
                        console.error("Erro ao atualizar morador: ", err);
                        res.status(500).send('Erro ao atualizar morador');
                        return;
                    }
                    else {
                        console.log("Morador atualizado com sucesso");
                    }
                });

                if(veiculo === 'sim')
                {

                    const donoID = req.params.ID_Morador;
                    const {quantidadeVagas, numeroVaga, placa, marca, modelo} = req.body;
                    
                    const checkVeiculo = 'SELECT * FROM Veiculos WHERE donoID = ?;';
                    connection.query(checkVeiculo, [donoID], (err, veiculoRows) => {
                        if(err) {
                            console.error("Erro ao verificar veículo: ", err);
                            res.status(500).send('Erro ao verificar veículo');
                            return;
                        }
                        else if(veiculoRows.length > 0) {
                            const updateVeiculo = 'UPDATE Veiculos SET placa = ?, marca = ?, modelo = ? WHERE donoID = ?;';
                            connection.query(updateVeiculo, [placa, marca, modelo, donoID], (err, result) => {
                                if(err) {
                                    console.error("Erro ao atualizar veículo: ", err);
                                    res.status(500).send('Erro ao atualizar veículo');
                                    return;
                                }
                                else {
                                    console.log("Veículo atualizado com sucesso");
                                }
                            });
                        }
                        else {
                            const insertVeiculo = 'INSERT INTO Veiculos (donoID, placa, marca, modelo) VALUES (?, ?, ?, ?);';

                            connection.query(insertVeiculo, [donoID, placa, marca, modelo], (err, result) => {
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
                }
            }
            res.redirect('/moradores');
        });
    });

    return router;
}

export default moradorRoute;