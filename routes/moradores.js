import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moradorRoute = (connection) => {

    const router = Router();

    router.get('/moradores', (req, res) => {

        const search = req.query.search || '';
        const select = `SELECT 
            m.ID_Morador, m.cpf, m.nome, m.telefone,
            a.numero_apartamento,
            b.descricao AS bloco_nome
            FROM morador m
            INNER JOIN apartamento a ON m.apartamentoID = a.ID_Apartamento
            INNER JOIN bloco b ON m.blocoID = b.ID_Bloco
            WHERE m.nome LIKE ? OR m.cpf LIKE ?;`;

        const searchParam = `%${search}%`;
        connection.query(select, [searchParam, searchParam], (err, rows) => {
            if(err) {
                console.error("Erro ao listar moradores: ", err);
                res.status(500).send('Erro ao listar moradores');
                return;
            }
            else {

                console.log("Moradores listados com sucesso");
                res.send(`

                    <title>Moradores</title>

                    <link rel="stylesheet" href="/css/style.css">
                    <h1 class="title">Condomínio</h1>

                    <h2 class="subtitle">Moradores<h2>

                    <form class="search" method="GET" action="/moradores">
                        <input type="text" name="search" placeholder="Buscar por nome ou CPF" value="${search}">
                        <button type="submit">Buscar</button>
                    </form>

                    <table class="tables" border="1">
                        <tr>
                            <th>ID</th>
                            <th>CPF</th>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Apartamento</th>
                            <th>bloco</th>
                            <th colspan="2">Ações</th>
                        </tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID_Morador}</td>
                                <td>${row.cpf}</td>
                                <td>${row.nome}</td>
                                <td>${row.telefone}</td>
                                <td>${row.numero_apartamento}</td>
                                <td>${row.bloco_nome}</td>  
                                <td><a href="/confirmarDeletarMorador/${row.ID_Morador}">Deletar</a></td>
                                <td><a href="/atualizarMorador/${row.ID_Morador}">Atualizar</a></td>
                            </tr>    
                        `).join('')}
                    </table>    
                    <a class="selections" href="http://localhost:3000/cadastroMorador">Cadastrar Morador</a>
                    <a class="selections" href="/">Voltar</a>
                `)
            }
        });
    });
    
    router.get('/cadastroMorador', (req, res) => {
        const apartamentoSelect = `SELECT A.numero_apartamento , A.ID_Apartamento, B.descricao
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
                    res.status(400).send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <p>Nenhum apartamento cadastrado. Cadastre um apartamento antes de cadastrar um morador.</p> 
                        <br> 
                        <a class="selections" href="/apartamentos">Ir para apartamentos</a>`);
                    return;
                }
                else {
                    res.send(`
                        <link rel="stylesheet" href="/css/style.css">
                        <title>Cadastro de Morador</title>

                        <h1 class="title">Condomínio</h1>

                    <form class="cadastro" action="/cadastrarMorador" method="POST">
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
                            <br>
                            <select id="apartamento" name="apartamentoID" required>
                                <option value="" disabled selected>Selecione um Apartamento</option>
                                ${apartamentosOptions}
                            </select>
                            <br>

                            <label for="bloco">Bloco:</label>
                            <input type="text" id="bloco" name="bloco" autocomplete="on" readonly>

                            <br>
                            <label for="responsavel">Responsável pelo apartamento?</label>
                            <br>
                            <input type="radio" id="simResponsavel" name="responsavel" value="Sim" required>
                            <label for="simResponsavel">Sim</label>
                            <input type="radio" id="naoResponsavel" name="responsavel" value="Não" required>
                            <label for="naoResponsavel">Não</label>
                            
                            <br>
                            <label for="proprietario">Proprietário do apartamento?</label>
                            <br>
                            <input type="radio" id="simProprietario" name="proprietario" value="Sim" required>
                            <label for="simProprietario">Sim</label>
                            <input type="radio" id="naoProprietario" name="proprietario" value="Não" required>
                            <label for="naoProprietario">Não</label>
                            <br>

                            <label for="veiculo">Possui veículo?</label>
                            <br>
                            <input type="radio" id="simVeiculo" name="veiculo" value="Sim" onClick="showCarInfo()" required>
                            <label for="simVeiculo">Sim</label>
                            <input type="radio" id="naoVeiculo" name="veiculo" value="Não" onClick="hideCarInfo()" required>
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
                                <input type="text" id="placa" maxLength=8 name="placa">
                                <label for="marca">Marca:</label>
                                <input type="text" id="marca" name="marca">
                                <br>
                                <label for="modelo">Modelo:</label>
                                <input type="text" id="modelo" name="modelo">
                                <br>
                            </fieldset>
                        </div>
                        <input class="submit" type="submit" value="Cadastrar">
                    </form>
                    <p><a class="selections" href="http://localhost:3000/moradores">Voltar</a></p>

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
                res.status(500).send(`
                    <link rel="stylesheet" href="/css/style.css">
                    <p>Erro ao buscar bloco do apartamento</p>
                    <br>
                    <a class="selections" href="/moradores">Voltar</a>`);
                return;
            }
            else {
                const blocoID = blocoRows[0].BlocoID;
                const insert = 'INSERT INTO morador (cpf, nome, telefone, apartamentoID, blocoID, responsavel, proprietario, possui_veiculo) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';

                connection.query(insert, [cpf, nome, telefone, apartamentoID, blocoID, responsavel, proprietario, veiculo], (err, result) => {
                    if(err) {
                        if(err.code === 'ER_DUP_ENTRY') {
                            res.status(400).send(`
                                <link rel="stylesheet" href="/css/style.css">
                                CPF já cadastrado. 
                                <br>
                                <a class="selections" href="http://localhost:3000/cadastroMorador">Voltar</a>`);
                            return;
                        }
                        else {
                            console.error("Erro ao cadastrar morador: ", err);
                            res.status(500).send('Erro ao cadastrar morador');
                            return;
                        }
                        
                    }
                    else {
                        console.log("Morador cadastrado com sucesso");
                        
                    }
                

                const donoID = result.insertId;

                if(veiculo === 'Sim')
                {
                    const {quantidadeVagas, numeroVaga, placa, marca, modelo} = req.body;
                    const insertVeiculo = 'INSERT INTO Veiculos ( donoID, quantidade_vagas, numero_vaga, placa, marca, modelo) VALUES (?, ?, ?, ?, ?, ?);';

                    connection.query(insertVeiculo, [donoID, quantidadeVagas, numeroVaga, placa, marca, modelo], (err, result) => {
                        if(err) {
                            console.error("Erro ao cadastrar veiculo: ", err);
                            res.status(500).send('Erro ao cadastrar veiculo');
                            return;
                        }
                        else {
                            console.log("Veiculo cadastrado com sucesso");
                            res.redirect('/moradores');
                        }
                    });
                }
                else {
                    res.redirect('/moradores');
                }
            });
            }
        });
    });

    router.get('/confirmarDeletarMorador/:ID_Morador', (req, res) => {
        const id = req.params.ID_Morador;

        res.send(`
            <link rel="stylesheet" href="/css/style.css">
            <h1>Confirmar</h1>
            <p>Tem certeza que deseja deletar o morador?</p>
            <form action="/deletarMorador/${id}" method="GET">
                <input class="submit" type="submit" value="Confirmar">
            </form>
            <a class="selections" href="http://localhost:3000/moradores">Cancelar</a>
        `);
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
                            res.status(500).send(`
                                <link rel="stylesheet" href="/css/style.css">
                                <p>Erro ao deletar veículos associados ao morador</p>
                                <br>
                                <a class="selections" href="/moradores">Voltar</a>`);
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
        const selectMorador = `SELECT M.cpf, M.nome, M.telefone, M.responsavel, M.proprietario,
        M.possui_veiculo, V.quantidade_vagas, V.numero_vaga, V.placa, V.marca, V.modelo, M.apartamentoID
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
                            <link rel="stylesheet" href="/css/style.css">
                            
                            <h1 class="title">Condomínio</h1>
                            <form class="cadastro" action="/atualizarMorador/${id}" method="POST">
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
                                    <br>
                                    <select id="apartamento" name="apartamentoID" required>
                                        ${apartamentosOptions}
                                    </select>

                                    <br>
                                    <label for="responsavel">Responsável pelo apartamento?</label>
                                    <br>
                                    <input type="radio" id="simResponsavel" name="responsavel" value="sim" ${morador.responsavel === 'Sim' ? 'checked' : ''} required>
                                    <label for="simResponsavel">Sim</label>
                                    <input type="radio" id="naoResponsavel" name="responsavel" value="nao" ${morador.responsavel === 'Não' ? 'checked' : ''} required>
                                    <label for="naoResponsavel">Não</label>
                                    <br>
                                    <label for="proprietario">Proprietário do apartamento?</label>
                                    <br>
                                    <input type="radio" id="simProprietario" name="proprietario" value="sim" ${morador.proprietario === 'Sim' ? 'checked' : ''} required>
                                    <label for="simProprietario">Sim</label>
                                    <input type="radio" id="naoProprietario" name="proprietario" value="nao" ${morador.proprietario === 'Não' ? 'checked' : ''} required>
                                    <label for="naoProprietario">Não</label>
                                    <br>
                                    <label for="veiculo">Possui veículo?</label>
                                    <br>
                                    <input type="radio" id="simVeiculo" name="veiculo" value="sim" ${morador.possui_veiculo === 'Sim' ? 'checked' : ''} onClick="showCarInfo()" required>
                                    <label for="simVeiculo">Sim</label>
                                    <input type="radio" id="naoVeiculo" name="veiculo" value="nao" ${morador.possui_veiculo === 'Não' ? 'checked' : ''} onClick="hideCarInfo()" required>
                                    <label for="naoVeiculo">Não</label>
                                    <br>
                                </fieldset>
                                <div id="carInfo" style="display:none;">
                                <fieldset>
                                    <legend>Dados do Veículo</legend>                                        <label for="quantidadeVagas">Quantidade de vagas de garagem: </label>
                                    <input type="number" name="quantidadeVagas" id="quantidadeVagas" min="0" value="${morador.quantidade_vagas || 0}">
                                    <br>
                                    <label for="numeroVaga">Número da vaga: </label>
                                    <input type="text" name="numeroVaga" id="numeroVaga" maxLength="20" value="${morador.numero_vaga || ''}">
                                    <br>
                                    <label for="placa">Placa:</label>
                                    <input type="text" id="placa" name="placa" maxLength=8 value="${morador.placa || ''}">
                                    <label for="marca">Marca:</label>
                                    <input type="text" id="marca" name="marca" value="${morador.marca || ''}">
                                    <br>
                                    <label for="modelo">Modelo:</label>
                                    <input type="text" id="modelo" name="modelo" value="${morador.modelo || ''}">
                                    <br>
                                </fieldset>
                                </div>
                                <input class="submit" type="submit" value="Atualizar">
                            </form>
                            
                            <script src="/js/app.js"></script>
                            <script>
                                window.onload = function() {
                                    const possuiVeiculo = "${morador.possui_veiculo}";
                                    if(possuiVeiculo === 'Sim') {
                                        showCarInfo();
                                    } else {
                                        hideCarInfo();
                                    }
                                };
                            </script>
                            <p><a class="selections" href="http://localhost:3000/moradores">Voltar</a></p>
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
                const update = 'UPDATE Morador SET cpf = ?, nome = ?, telefone = ?, apartamentoID = ?, blocoID = ?, responsavel = ?, proprietario = ?, possui_veiculo = ? WHERE ID_Morador = ?';

                connection.query(update, [cpf, nome, telefone, apartamentoID, blocoID, responsavel, proprietario, veiculo, id], (err, result) => {
                    if(err) {
                        if(err.code === 'ER_DUP_ENTRY') {
                            res.status(400).send('CPF já cadastrado. <br> <a href="http://localhost:3000/moradores">Voltar</a>');
                            return;
                        }
                        else {
                            console.error("Erro ao atualizar morador: ", err);
                            res.status(500).send('Erro ao atualizar morador');
                            return;
                        }
                    }
                    else {
                        console.log("Morador atualizado com sucesso");

                        if(veiculo && veiculo.toLowerCase() === 'sim')
                        {
                        const {quantidadeVagas, numeroVaga, placa, marca, modelo} = req.body;
                        
                        const checkVeiculo = 'SELECT * FROM Veiculos WHERE donoID = ?;';
                        connection.query(checkVeiculo, [id], (err, veiculoRows) => {
                            if(err) {
                                console.error("Erro ao verificar veículo: ", err);
                                res.status(500).send('Erro ao verificar veículo');
                                return;
                            }
                            else if(veiculoRows.length > 0) {
                                const updateVeiculo = 'UPDATE Veiculos SET placa = ?, marca = ?, modelo = ?, quantidade_vagas = ?, numero_vaga = ? WHERE donoID = ?;';
                                connection.query(updateVeiculo, [placa, marca, modelo, quantidadeVagas, numeroVaga, id], (err, result) => {
                                    if(err) {
                                        console.error("Erro ao atualizar veículo: ", err);
                                        res.status(500).send('Erro ao atualizar veículo');
                                        return;
                                    }
                                    else {
                                        console.log("Veículo atualizado com sucesso");
                                        return res.redirect('/moradores');
                                    }
                                });
                            }
                            else {
                                const insertVeiculo = 'INSERT INTO Veiculos (donoID, placa, marca, modelo, quantidade_vagas, numero_vaga) VALUES (?, ?, ?, ?, ?, ?);';

                                connection.query(insertVeiculo, [id, placa, marca, modelo, quantidadeVagas, numeroVaga], (err, result) => {
                                    if(err) {
                                        console.error("Erro ao cadastrar veiculo: ", err);
                                        res.status(500).send('Erro ao cadastrar veiculo');
                                        return;
                                    }
                                    else {
                                        console.log("Veiculo cadastrado com sucesso");
                                        return res.redirect('/moradores');   
                                    }
                                });
                            }
                        });

                        }
                        else
                        {
                            const deleteVeiculo = 'DELETE FROM Veiculos WHERE donoID = ?;';
                            connection.query(deleteVeiculo, [id], (err, result) => {
                                if(err) {
                                    console.error("Erro ao deletar veículo: ", err);
                                    res.status(500).send('Erro ao deletar veículo');
                                    return;
                                }
                                else {
                                    console.log("Veículo deletado com sucesso");
                                    return res.redirect('/moradores');
                                }      
                            });
                        }
                    }
                });      
            }
            
        });
    });

    return router;
}

export default moradorRoute;