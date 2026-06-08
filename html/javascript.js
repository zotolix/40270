// Solución para iconos de Leaflet que no cargan
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ================== DATA & STORAGE ==================

let locales = [];
let map;

// 1. Inicializar Mapa
function initMap() {
    if (!map) {
        map = L.map('mapa').setView([19.5411, -96.9272], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
}

// 2. Cargar datos de MySQL
async function cargarDesdeMySQL() {
    try {
        const res = await fetch('http://localhost:3000/api/locales');
        locales = await res.json();
        renderLocales(); // Dibujar a Juan Perro
    } catch (error) {
        console.error("No se pudo conectar al servidor:", error);
    }
}

// 3. Renderizar (Aquí se corrigió el error de 'lista is null')
function renderLocales() {
    const listaDiv = document.getElementById("lista"); // Buscamos el elemento justo cuando lo necesitamos
    if (!listaDiv) return; 

    listaDiv.innerHTML = "";
    locales.forEach(l => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${l.nombre}</h3>
            <p>${l.tipo} | ${l.precio}</p>
        `;
        div.onclick = () => verDetalleLocal(l.id);
        listaDiv.appendChild(div);
    });
}

// 4. Ver Detalle
function verDetalleLocal(id) {
    const local = locales.find(l => String(l.id) === String(id));
    if (!local) return;

    document.getElementById("lista").style.display = "none";
    document.getElementById("detalle-contenedor").style.display = "block";

    setTimeout(() => {
        map.invalidateSize();
        const coords = [local.lat, local.lng];
        map.setView(coords, 16);
        L.marker(coords).addTo(map).bindPopup(local.nombre).openPopup();
    }, 200);
}

// Ejecutar todo cuando la página cargue
window.onload = () => {
    initMap();
    cargarDesdeMySQL();
};
function volverALista() {
    document.getElementById('lista-locales').style.display = 'block';
    document.getElementById('detalle-local').style.display = 'none';
    document.getElementById('btn-volver').style.display = 'none';
}

function mostrarComentarios() {
    async function mostrarComentarios() {
    const contenedor = document.getElementById('lista-comentarios');
    const localActual = locales[actual]; // 'actual' es el índice del local abierto

    try {
        // Pedimos los comentarios usando el ID de MySQL
        const res = await fetch(`http://localhost:3000/api/comentarios/${localActual.id}`);
        const comentarios = await res.json();

        contenedor.innerHTML = comentarios.map(c => `
            <div class="comentario">
                <p><strong>⭐ ${c.estrellas}</strong> - ${c.texto}</p>
                <small>${new Date(c.fecha).toLocaleDateString()}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar comentarios:", error);
    }
}
    comentariosDiv.appendChild(starsDiv);

    // Lista Comentarios
    local.comentarios.forEach(c => {
        const p = document.createElement('p');
        p.textContent = "💬 " + c;
        comentariosDiv.appendChild(p);
    });

    //Nuevo Comentario
    const textarea = document.createElement('textarea');
    const btnEnv = document.createElement('button');
    btnEnv.textContent = "Enviar";
    btnEnv.className = "btn";
    btnEnv.onclick = () => {
        if (!textarea.value) return alert("Escribe algo");
        local.comentarios.push(textarea.value);
        guardarEnStorage();
        mostrarComentarios();
    };
    comentariosDiv.appendChild(textarea);
    comentariosDiv.appendChild(btnEnv);

    // Botón Ruta
    const btnRuta = document.createElement('button');
    btnRuta.textContent = "📍 Ver ruta";
    btnRuta.className = "btn";
    btnRuta.onclick = () => trazarRuta(local.lat, local.lng);
    comentariosDiv.appendChild(btnRuta);
}

// ================== MODAL & ADMIN ==================
function abrirModal() {
    modal.style.display = 'flex';
    document.getElementById('bloquePassword').style.display = "block";
    document.getElementById('bloqueFormulario').style.display = "none";
}

function cerrarModal() { modal.style.display = 'none'; }

function validarPassword() {
    if (document.getElementById('password').value === "1234") {
        document.getElementById('bloquePassword').style.display = "none";
        document.getElementById('bloqueFormulario').style.display = "block";
    } else {
        alert("Incorrecto");
    }
}


function validarPassword() {
    if (document.getElementById('password').value === "1234") {
        document.getElementById('bloquePassword').style.display = "none";
        document.getElementById('bloqueFormulario').style.display = "block";
    } else {
        alert("Incorrecto");
    }
}

// Variable global para limpiar marcadores antiguos
let layerMarcadores = L.layerGroup().addTo(map);

function mostrarMarcadores() {
    if (!layerMarcadores) {
        layerMarcadores = L.layerGroup().addTo(map);
    }
    
    
    layerMarcadores.clearLayers();

    locales.forEach(local => {
        
        const lat = parseFloat(local.lat);
        const lng = parseFloat(local.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng])
                .bindPopup(`<b>${local.nombre}</b><br>${local.tipo}`);
            
            layerMarcadores.addLayer(marker);
        } else {
            console.warn(`Local ${local.nombre} tiene coordenadas inválidas:`, local.lat, local.lng);
        }
    });
}

// ### FUNCIÓN PARA PROCESAR IMÁGENES ### 
function convertirImagenes(files) {
    return new Promise((resolve) => {
        let imagenesBase64 = [];
        let contador = 0;
        if (files.length === 0) return resolve([]);

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Creamos un canvas para redimensionar
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Definimos un tamaño máximo (ej. 500px)
                    const MAX_WIDTH = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertimos a Base64 pero con calidad baja (0.6)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    imagenesBase64.push(dataUrl);
                    
                    contador++;
                    if (contador === files.length) resolve(imagenesBase64);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(files[i]);
        }
    });
}

async function guardarLocal() {
    try {
        const nombre = document.getElementById('nombre').value;
        const tipo = document.getElementById('tipo').value;
        const precio = document.getElementById('precio').value;
        const horario = document.getElementById('horario').value;
        const pago = document.getElementById('pago').value;
        const archivos = document.getElementById('imagenes').files;
        
        // CAPTURAMOS LAS NUEVAS COORDENADAS
        const latInput = document.getElementById('latitud').value;
        const lngInput = document.getElementById('longitud').value;

        if (!nombre || !latInput || !lngInput) {
            alert("El nombre y las coordenadas son obligatorios.");
            return;
        }

        const fotosProcesadas = await convertirImagenes(archivos);

        

        locales.push(nuevoLocal);
        guardarEnStorage();
        renderLocales();
        
        // ACTUALIZAMOS LOS MARCADORES EN EL MAPA
        mostrarMarcadores();

        // Limpiar campos
        document.getElementById('latitud').value = "";
        document.getElementById('longitud').value = "";
        // ... (resto de tus limpiezas)

        cerrarModal();
        alert("¡Local guardado con ubicación real!");
    } catch (error) {
        console.error("Error:", error);
    }
}

// ================== CORRECCIÓN DEL BOTÓN VER FOTOS ==================
btnFotos.onclick = () => {
    const local = locales[actual];
    
    if (!local.fotos || local.fotos.length === 0) {
        alert("Este local no tiene fotos.");
        return;
    }

    
    fotosDiv.style.display = 'block';
    cerrarFotos.style.display = 'inline-block';
    
    
    fotosDiv.innerHTML = "<h3>Fotos de " + local.nombre + "</h3>";
    
    
    const galeria = document.createElement('div');
    galeria.style.display = "flex";
    galeria.style.wrap = "wrap";
    galeria.style.gap = "10px";

   
    local.fotos.forEach(f => {
        const img = document.createElement('img');
        img.src = f;
        img.style.width = "150px"; 
        img.style.height = "150px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #ddd";
        
        // Error de imagen 
        img.onerror = () => { img.src = "https://via.placeholder.com/150?text=Error+Imagen"; };
        
        galeria.appendChild(img);
    });

    fotosDiv.appendChild(galeria);
    
    // Desplazar la pantalla hacia las fotos
    fotosDiv.scrollIntoView({ behavior: 'smooth' });
};

//Cerrar las fotos
cerrarFotos.onclick=()=>{
fotosDiv.style.display='none';
cerrarFotos.style.display='none';
};

// Eventos Volver
volverBtn.onclick = () => {
    lista.style.display = 'grid';
    [mapaDiv, comentariosDiv, fotosDiv, btnFotos, cerrarFotos, volverBtn].forEach(el => el.style.display = 'none');
};

function ejecutarBusqueda(event) {
    // Evita que la página se recargue al presionar Enter
    if (event) event.preventDefault();

    const buscador = document.getElementById('inputBusqueda');
    if (!buscador) return; // Seguridad por si el ID cambia

    const texto = buscador.value.toLowerCase().trim();
    
    // Filtramos el array 'locales' original
    const resultados = locales.filter(local => {
        return local.nombre.toLowerCase().includes(texto) || 
               local.tipo.toLowerCase().includes(texto);
    });

    // Renderizamos solo los que coinciden
    renderLocales(resultados);

    console.log("Resultados encontrados: " + resultados.length);
}

function aplicarFiltros() {
    const distMax = document.getElementById('filtroDistancia').value;
    const estrellasMin = parseFloat(document.getElementById('filtroEstrellas').value);
    const precioFiltro = document.getElementById('filtroPrecio').value;
    const textoBusqueda = document.getElementById('inputBusqueda').value.toLowerCase();

    const resultados = locales.filter(local => {
        // 1. Filtro por nombre/tipo
        const coincideTexto = local.nombre.toLowerCase().includes(textoBusqueda) || 
                             local.tipo.toLowerCase().includes(textoBusqueda);
        
        // 2. Filtro por estrellas
        const coincideEstrellas = local.cal >= estrellasMin;

        // 3. Filtro por precio
        const coincidePrecio = (precioFiltro === "all") || (local.precio === precioFiltro);

        // 4. Filtro por distancia (limpiando el string "1 km" a número 1)
        const kmLocal = parseFloat(local.dist.replace(" km", ""));
        const coincideDist = (distMax === "all") || (kmLocal <= parseFloat(distMax));

        return coincideTexto && coincideEstrellas && coincidePrecio && coincideDist;
    });

    renderLocales(resultados);
    toggleFiltros(); // Cerramos el panel al aplicar
}

// Asegúrate de que tu toggle funcione correctamente
function toggleFiltros() {
    const panel = document.getElementById('panelFiltros');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}
async function cargarDesdeMySQL() {
    try {
        const res = await fetch('http://localhost:3000/api/locales');
        locales = await res.json(); // Aquí entra "Juan Perro" desde MySQL
        renderLocales(); // Esta función dibuja la tarjeta en pantalla
    } catch (error) {
        console.error("No se pudo conectar con el servidor node", error);
    }
}

// Ejecutar al abrir la página
window.onload = cargarDesdeMySQL;

// Iniciar app
renderLocales();
mostrarMarcadores();