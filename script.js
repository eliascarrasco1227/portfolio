document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DE PROYECTOS DE GITHUB ---

    const username = 'eliascarrasco1227'; // Tu usuario de GitHub
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`;
    const container = document.getElementById('project-container');

    async function fetchGitHubProjects() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error de red: ${response.status}`);
            
            const data = await response.json();
            const projects = data.filter(repo => !repo.fork);
            
            // Limita a los 6 más recientes (opcional)
            const recentProjects = projects.slice(0, 6);

            // Mapea cada proyecto a una promesa que busca su imagen
            const projectPromises = recentProjects.map(async (project) => {
                const contentsUrl = `https://api.github.com/repos/${username}/${project.name}/contents/assets/images/cover`;
                
                try {
                    const imgResponse = await fetch(contentsUrl);
                    if (!imgResponse.ok) {
                        // El directorio no existe o hay un error, devuelve el proyecto sin imagen
                        return { ...project, imageUrl: null };
                    }
                    const contents = await imgResponse.json();
                    
                    // Busca el primer archivo de imagen (ignora subdirectorios)
                    // "la unica imagen que haya allí"
                    const imageFile = Array.isArray(contents) 
                        ? contents.find(item => item.type === 'file' && (item.name.endsWith('.png') || item.name.endsWith('.jpg') || item.name.endsWith('.jpeg') || item.name.endsWith('.gif')))
                        : null; // Si 'contents' no es un array (p.ej. es un solo archivo), lo manejamos
                    
                    const imageUrl = imageFile ? imageFile.download_url : null;
                    
                    return { ...project, imageUrl: imageUrl };

                } catch (error) {
                    console.error(`Error buscando imagen para ${project.name}:`, error);
                    return { ...project, imageUrl: null }; // Devuelve el proyecto sin imagen en caso de fallo
                }
            });

            // Espera a que TODAS las búsquedas de imágenes se resuelvan
            const projectsWithImages = await Promise.all(projectPromises);
            
            displayProjects(projectsWithImages); // Llama a displayProjects con los datos enriquecidos

        } catch (error) {
            console.error('Error al cargar proyectos de GitHub:', error);
            container.innerHTML = '<p>No se pudieron cargar los proyectos. Intenta recargar la página.</p>';
        }
    }

    function displayProjects(projects) {
        container.innerHTML = ''; // Limpia el "Cargando..."

        if (projects.length === 0) {
            container.innerHTML = '<p>No hay proyectos públicos para mostrar.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card';

            // 1. Genera el HTML de la imagen SÓLO si existe la URL
            const imageHtml = project.imageUrl 
                ? `<img src="${project.imageUrl}" alt="Vista previa de ${project.name}" class="project-image">`
                : ''; // Si no hay imagen, esto es un string vacío

            // 2. Construye la tarjeta
            //    Envolvemos el texto en "project-content" para mejor control con CSS
            card.innerHTML = `
                ${imageHtml} 
                <div class="project-content">
                    <h3>${project.name}</h3>
                    <p>${project.description || 'Sin descripción.'}</p>
                    <div class="project-footer">
                        <span>
                            <i class="fas fa-star"></i> ${project.stargazers_count}
                        </span>
                        <a href="${project.html_url}" target="_blank" rel="noopener noreferrer">Ver en GitHub</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Inicia la carga de proyectos
    fetchGitHubProjects();

    // --- 2. LÓGICA DEL MODO OSCURO (sin cambios) ---
    // ... (El resto del código JS sigue igual) ...
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = 'fa-moon';
    const sunIcon = 'fa-sun';
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = `<i class="fas ${sunIcon}"></i>`;
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = `<i class="fas ${moonIcon}"></i>`;
        }
    }

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

});