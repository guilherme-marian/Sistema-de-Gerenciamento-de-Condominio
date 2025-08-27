
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and DOM ready.");

    const select = document.getElementById('apartamentoID');
    const cpfPagInput = document.getElementById('cpfPagamento');
    const nomeInput = document.getElementById('nomePagamento');
    const telefoneInput = document.getElementById('telefonePagamento');
    const blocoInput = document.getElementById('blocoPagamento');

    if (!select || !cpfPagInput || !nomeInput || !telefoneInput || !blocoInput) {
        console.error("One or more input elements were not found in the DOM.");
        return;
    }

    select.addEventListener('change', () => {
        const selectedOption = select.options[select.selectedIndex];

        const cpf = selectedOption.getAttribute('data-cpf');
        const nome = selectedOption.getAttribute('data-nome');
        const telefone = selectedOption.getAttribute('data-telefone');
        const bloco = selectedOption.getAttribute('data-bloco');


        cpfPagInput.value = cpf || '';
        nomeInput.value = nome || '';
        telefoneInput.value = telefone || '';
        blocoInput.value = bloco || '';
    });

    select.dispatchEvent(new Event('change'));
});

