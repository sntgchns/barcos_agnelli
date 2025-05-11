document.addEventListener('DOMContentLoaded', () => {
    const searchFiltersContainer = document.getElementById('search-filters-container');
    const addFilterButton = document.getElementById('add-filter-button');
    const searchButton = document.getElementById('search-button');
    const resetButton = document.getElementById('reset-button');
    const migrantesTbody = document.getElementById('migrantes-tbody');
    
    const firstSelect = searchFiltersContainer.querySelector('.search-key');
    const originalSelectOptions = Array.from(firstSelect.options).map(option => {
        return { value: option.value, text: option.textContent };
    });

    function getCurrentlySelectedKeys(excludeSelect = null) {
        const selectedKeys = [];
        searchFiltersContainer.querySelectorAll('.search-key').forEach(select => {
            if (select !== excludeSelect && select.value) {
                selectedKeys.push(select.value);
            }
        });
        return selectedKeys;
    }

    function updateSelectOptions(selectElement) {
        const currentlySelectedInOtherFilters = getCurrentlySelectedKeys(selectElement);
        const currentValue = selectElement.value;

        selectElement.innerHTML = ''; 

        originalSelectOptions.forEach(optionData => {
            if (!currentlySelectedInOtherFilters.includes(optionData.value) || optionData.value === currentValue) {
                const option = document.createElement('option');
                option.value = optionData.value;
                option.textContent = optionData.text;
                selectElement.appendChild(option);
            }
        });
        selectElement.value = currentValue; 
        if (selectElement.selectedIndex === -1 && selectElement.options.length > 0) {
            if (!currentValue) {
                selectElement.value = selectElement.options[0].value;
            }
        }
    }

    function updateAllSelects() {
        searchFiltersContainer.querySelectorAll('.search-key').forEach(select => {
            updateSelectOptions(select);
        });
    }

    function checkAvailableOptionsAndToggleAddButton() {
        if (!addFilterButton) return;

        const selectedKeys = getCurrentlySelectedKeys();
        if (selectedKeys.length >= originalSelectOptions.length) {
            addFilterButton.disabled = true;
            addFilterButton.title = "Todas las opciones de filtro están en uso";
        } else {
            addFilterButton.disabled = false;
            addFilterButton.title = "Añadir nuevo criterio de búsqueda";
        }
    }

    function createFilterRow() {
        const newFilterRow = document.createElement('div');
        newFilterRow.classList.add('search-filter-row');

        const selectElement = document.createElement('select');
        selectElement.classList.add('search-key');

        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.classList.add('search-term');
        inputElement.placeholder = 'Escribe aquí...';

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = '-';
        removeButton.classList.add('remove-filter-button');
        removeButton.addEventListener('click', () => {
            newFilterRow.remove();
            updateAllSelects();
            checkAvailableOptionsAndToggleAddButton();
        });

        newFilterRow.appendChild(selectElement);
        newFilterRow.appendChild(inputElement);
        newFilterRow.appendChild(removeButton);
        searchFiltersContainer.appendChild(newFilterRow);

        updateSelectOptions(selectElement); 
        updateAllSelects();
        checkAvailableOptionsAndToggleAddButton();
    }

    if (addFilterButton) {
        addFilterButton.addEventListener('click', createFilterRow);
    }

    searchFiltersContainer.addEventListener('change', (event) => {
        if (event.target.classList.contains('search-key')) {
            updateAllSelects();
            checkAvailableOptionsAndToggleAddButton();
        }
    });

    function renderTable(migrantes) {
        migrantesTbody.innerHTML = ''; 
        if (!migrantes || migrantes.length === 0) {
            const row = migrantesTbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 13; 
            cell.textContent = 'No se encontraron migrantes o ingrese un término de búsqueda.';
            cell.style.textAlign = 'center';
            return;
        }
        migrantes.forEach(migrante => {
            const row = migrantesTbody.insertRow();
            row.insertCell().textContent = migrante.nombre || '';
            row.insertCell().textContent = migrante.apellido || '';
            row.insertCell().textContent = migrante.edad || '';
            row.insertCell().textContent = migrante.sexo || '';
            row.insertCell().textContent = migrante.estado_civil || '';
            row.insertCell().textContent = migrante.profesion || '';
            row.insertCell().textContent = migrante.religion || '';
            row.insertCell().textContent = migrante.puerto_de_salida || '';
            row.insertCell().textContent = migrante.nombre_del_barco || '';
            row.insertCell().textContent = migrante.fecha_de_arribo || '';
            row.insertCell().textContent = migrante.leer_y_escribir || '';
            row.insertCell().textContent = migrante.clase || '';
            row.insertCell().textContent = migrante.anio || '';
        });
    }

    async function performSearch() {
        const filters = [];
        const filterRows = searchFiltersContainer.querySelectorAll('.search-filter-row');

        filterRows.forEach(row => {
            const keySelect = row.querySelector('.search-key');
            const termInput = row.querySelector('.search-term');
            if (keySelect && termInput) {
                const key = keySelect.value;
                const term = termInput.value.trim();
                if (key && term) { 
                    filters.push({ key, term });
                }
            }
        });

        if (filters.length === 0) {
            renderTable([]);
            return;
        }

        try {
            const queryString = filters.map(f => `filter_key=${encodeURIComponent(f.key)}&filter_term=${encodeURIComponent(f.term)}`).join('&');
            const response = await fetch(`/search?${queryString}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Error en la petición: ${response.statusText}` }));
                throw new Error(errorData.error || `Error en la petición: ${response.statusText}`);
            }
            const filteredMigrantes = await response.json();
            renderTable(filteredMigrantes);
        } catch (error) {
            console.error('Error al realizar la búsqueda:', error);
            migrantesTbody.innerHTML = ''; 
            const row = migrantesTbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 13; 
            cell.textContent = error.message || 'Error al cargar los datos. Intente más tarde.';
            cell.style.textAlign = 'center';
            cell.style.color = 'red';
        }
    }

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    searchFiltersContainer.addEventListener('keypress', (event) => {
        if (event.target.classList.contains('search-term') && event.key === 'Enter') {
            performSearch();
        }
    });

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            const filterRows = searchFiltersContainer.querySelectorAll('.search-filter-row');
            for (let i = filterRows.length - 1; i > 0; i--) {
                filterRows[i].remove();
            }
            if (filterRows.length > 0) {
                const firstSelectToReset = filterRows[0].querySelector('.search-key');
                if (firstSelectToReset) {
                    firstSelectToReset.value = originalSelectOptions[0]?.value || ''; 
                }
                const firstTermToReset = filterRows[0].querySelector('.search-term');
                if (firstTermToReset) {
                    firstTermToReset.value = '';
                }
            }
            updateAllSelects(); 
            checkAvailableOptionsAndToggleAddButton();
            renderTable([]); 
        });
    }

    updateAllSelects();
    checkAvailableOptionsAndToggleAddButton();
    renderTable([]); 
});