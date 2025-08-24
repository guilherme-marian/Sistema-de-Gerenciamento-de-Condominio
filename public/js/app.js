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

