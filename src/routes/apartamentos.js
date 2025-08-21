import {Router} from "express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apartamentoRouter = (connection) => {
    const router = Router();

    router.get('/cadastroApartamento', (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/cadastroApartamento.html'));
    });

    router.get('/apartamentos', (req, res) => {
        const select = 'SELECT * FROM apartamento;';
        connection.query(select, (err, rows) => {
            if(err) {
                console.error("Erro ao listar apartamentos: ", err);
                res.status(500).send('Erro ao listar apartamentos');
                return;
            }
            else {
                res.send(`
                    <h1>Lista de Apartamentos</h1>
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Bloco</th>
                            <th>Número do apartamento</th>
                            <th>Ações</th>
                        </tr>
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
                    <a href="/cadastroApartamento">Cadastrar Apartamento</a>
                    <a href="/">Voltar</a>
                `)
            }
        });
    });

    return router;
};

export default apartamentoRouter;