window.addEventListener('DOMContentLoaded', (event) => {
    const possuiVeiculoSelect = document.getElementById('possuiVeiculo');
    const carInfoDiv = document.getElementById('carInfo');
    const quantidadeVagasInput = document.getElementById('quantidadeVagas');

    if (possuiVeiculoSelect.value === 'Sim') {
        showCarInfo();
        setCarFieldsRequired(true);
    }
    else {
        hideCarInfo();
        setCarFieldsRequired(false);
    }
});

function showCarInfo() {
    document.getElementById('carInfo').style.display = 'block';
}

function hideCarInfo() {
    document.getElementById('carInfo').style.display = 'none';
}

function setCarFieldsRequired(isRequired) {
    const fields = ['quantidadeVagas',
         'numeroVaga', 
         'placa', 
         'marca', 
         'modelo'];  
    fields.forEach(fieldId => {
        document.getElementById(fieldId).required = isRequired;
    });
}

const cpfInput = document.getElementById('cpf');

cpfInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    let formattedValue = '';
    if (value.length > 6) {
        formattedValue = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9);
    } else if (value.length > 3) {
        formattedValue = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
    } else {
        formattedValue = value;
    }
    
    e.target.value = formattedValue;
});

const telefoneInput = document.getElementById('telefone');

telefoneInput.addEventListener('input', () => {
    let value = telefoneInput.value.replace(/\D/g, ''); 

    if (value.length > 10) value = value.slice(0, 10); 

    let formatted = '';

    if (value.length >= 1) formatted += '(' + value.slice(0, 2);
    if (value.length >= 3) formatted += ') ' + value.slice(2, 6);
    if (value.length >= 7) formatted += '-' + value.slice(6, 10);

    telefoneInput.value = formatted;
});
