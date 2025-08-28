
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded and DOM ready.");

    const select = document.getElementById('apartamento');
    const blocoInput = document.getElementById('bloco');

    if (!select || !blocoInput) {
        console.error("One or more input elements were not found in the DOM.");
        return;
    }

    select.addEventListener('change', () => {
        const selectedOption = select.options[select.selectedIndex];

        const bloco = selectedOption.getAttribute('data-bloco');

        blocoInput.value = bloco || '';
    });

    select.dispatchEvent(new Event('change'));
});
