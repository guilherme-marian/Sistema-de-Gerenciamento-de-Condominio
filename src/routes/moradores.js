import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moradorRouter = (connection) => {

    const router = Router();

    router.get('/moradores', (req, res) => {
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
                            <th>bloco</th>
                            <th>Ações</th>
                        <tr>
                        ${rows.map(row => `
                            <tr>
                                <td>${row.ID}</td>
                                <td>${row.cpf}</td>
                                <td>${row.nome}</td>
                                <td>${row.apartamentoID}</td>
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

    return router;
}

export default moradorRouter;