// Variables globales para el manejo de la paginación y ordenamiento
let sortAscending = true;
let currentPage   = 1;
let totalRows     = 0;
let totalPages    = 0;
let itemsPerPage  = 15; // Número de elementos por página
let allData       = []; // Datos cargados desde el servidor 

// Función principal de búsqueda (se invoca al enviar el formulario)
async function search(event) {
    event.preventDefault();

    // Recoger los valores de los campos del formulario
    const comprador    = document.getElementById('comprador').value;
    const descripcion  = document.getElementById('descripcion').value;
    const nomenclatura = document.getElementById('nomenclatura').value;
    const departamento = document.getElementById('departamento').value;
    const fecha_inicio = document.getElementById('fecha_inicio').value;
    const fecha_fin    = document.getElementById('fecha_fin').value;

    // Preparar los datos a enviar usando FormData
    const formData = new FormData();
    formData.append('comprador', comprador);
    formData.append('descripcion', descripcion);
    formData.append('nomenclatura', nomenclatura);
    formData.append('departamento', departamento);
    formData.append('fecha_inicio', fecha_inicio);
    formData.append('fecha_fin', fecha_fin);

    try {
        const response = await fetch('/items/search/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken
            }
            
        });
        const json = await response.json();
        // Se espera que la respuesta tenga la propiedad "data"
        allData = json.data || [];

        // Formatear la fecha de ingreso en cada fila al formato DD/MM/YYYY
        allData = allData.map(row => ({
            ...row,
            fecha_ingreso: formatDate(row.fecha_ingreso)
        }));

        // Reiniciar la paginación
        currentPage = 1;
        initializePagination(allData);
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

// Inicializa la paginación a partir de los datos obtenidos
function initializePagination(data) {
    totalRows  = data.length;
    totalPages = Math.ceil(totalRows / itemsPerPage);
    renderPage();
    renderPagination();
}

// Renderiza los datos de la página actual en la tabla
function renderPage() {
    const tbody = document.querySelector('#results tbody');
    tbody.innerHTML = '';
  
    const start = (currentPage - 1) * itemsPerPage;
    const end   = start + itemsPerPage;
    const pageData = allData.slice(start, end);
  
    pageData.forEach(item => {
        const row = document.createElement('tr');
  
        // Convertir el campo "documentos" en enlaces
        const documentosHTML = item.documentos
            ? item.documentos
                  .split(', ')
                  .map(url => `<a href="${url}" target="_blank">Descargar</a>`)
                  .join(' | ')
            : 'N/A';
  
        // Para cada columna icono de copiar
        row.innerHTML = `
          <td>${createCellContent(item.comprador)}</td>
          <td>${createCellContent(item.nomenclatura)}</td>
          <td>${createCellContent(item.item)}</td>
          <td>${item.cantidad}</td>          <!-- Sin createCellContent -->
          <td>${item.departamento}</td>      <!-- Sin createCellContent -->
          <td>${item.fecha_ingreso}</td>     <!-- Sin createCellContent -->
          <td>${documentosHTML}</td>
        `;
  
        tbody.appendChild(row);
    });
  
    document.getElementById('row-count').innerText = `Total de filas: ${totalRows}`;
  }
  
  // Función auxiliar que devuelve el HTML de la celda 
  // con el texto y el ícono "copiar"
  function createCellContent(value) {
    const safeValue = (value || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return `
      ${safeValue}
      <span class="copy-icon" onclick="copyToClipboard('${safeValue}', event)"
            title="Copiar al portapapeles">
        🗐
      </span>
    `;
  }
  

// Renderiza los botones de paginación
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const maxVisibleButtons = 7;
    let startPage = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
    let endPage   = startPage + maxVisibleButtons - 1;

    if (endPage > totalPages) {
        endPage   = totalPages;
        startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
    }

    if (currentPage > 1) {
        pagination.appendChild(createPaginationButton('«', currentPage - 1));
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPaginationButton(i, i));
    }

    if (currentPage < totalPages) {
        pagination.appendChild(createPaginationButton('»', currentPage + 1));
    }
}

// Crea y devuelve un botón de paginación con su respectivo evento
function createPaginationButton(label, page) {
    const button = document.createElement('button');
    button.innerText = label;

    if (page === currentPage) {
        button.classList.add('active');
    } else {
        button.addEventListener('click', () => {
            currentPage = page;
            renderPage();
            renderPagination();
        });
    }

    return button;
}

// Función para ordenar los datos por la fecha de ingreso
function sortTableByDate() {
    allData.sort((a, b) => {
        const dateA = parseDate(a.fecha_ingreso);
        const dateB = parseDate(b.fecha_ingreso);
        return sortAscending ? dateA - dateB : dateB - dateA;
    });
    sortAscending = !sortAscending;
    renderPage();
}

// Convierte una fecha (en formato ISO o similar) a DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Parsea una fecha en formato DD/MM/YYYY a un objeto Date
function parseDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Limpia los campos del formulario y borra los resultados y la paginación
function clearFields() {
    // Limpiar todos los inputs del formulario
    const inputs = document.querySelectorAll('#search-form input[type="text"], #search-form input[type="date"]');
    inputs.forEach(input => input.value = '');

    // Limpiar la tabla y la paginación
    document.querySelector('#results tbody').innerHTML = '';
    document.getElementById('row-count').textContent = 'Total de filas: 0';
    document.getElementById('pagination').innerHTML = '';
}

function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Crear el tooltip
        const tooltip = document.createElement('div');
        tooltip.innerText = "¡Copiado!";
        
        // Posicionar el tooltip en la parte inferior central de la pantalla
        tooltip.style.position = 'fixed';
        tooltip.style.bottom = '20px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        
        // Estilos del tooltip
        tooltip.style.padding = '10px 20px';
        tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = '#fff';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontSize = '0.9rem';
        tooltip.style.zIndex = 9999;
        tooltip.style.opacity = 1;
        tooltip.style.transition = 'opacity 0.5s ease'; // Transición de fading
        
        document.body.appendChild(tooltip);
        
        // Después de 1.5 segundos, iniciar el fading
        setTimeout(() => {
          tooltip.style.opacity = 0;
          // Remover el tooltip tras finalizar la transición (0.5s)
          setTimeout(() => {
            tooltip.remove();
          }, 500);
        }, 1500);
      })
      .catch(err => {
        console.error("Error al copiar texto: ", err);
      });
  }
  

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Verifica si el cookie empieza con "name="
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
