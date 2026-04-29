/**
 * ============================================
 * EJERCICIO DE MANIPULACIÓN DEL DOM
 * ============================================
 * Objetivo: Búsqueda de usuarios y gestión de tareas
 * Autor:
 * ============================================
 */

// ============================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ============================================

const taskIdInput = document.querySelector('#taskId');
const submitTaskBtn = document.querySelector('#submitTaskBtn');
const cancelEditBtn = document.querySelector('#cancelEditBtn');
const systemMessage = document.querySelector('#systemMessage');

const userForm = document.querySelector('#searchUserForm');
const userDocInput = document.querySelector('#searchUserId');
const userDocError = document.querySelector('#searchError');
const userInfoContainer = document.querySelector('#userInfoContainer');

const taskForm = document.querySelector('#taskForm');
const taskFieldset = document.querySelector('#taskFieldset');
const taskTitle = document.querySelector('#taskTitle');
const taskTitleError = document.querySelector('#taskTitleError');
const taskDescription = document.querySelector('#taskDescription');
const taskDescriptionError = document.querySelector('#taskDescriptionError');

const tasksTableBody = document.querySelector('#tasksTableBody');
const taskCount = document.querySelector('#taskCount');

// ============================================
// 2. ESTADO
// ============================================

let usuarioEncontrado = null;

// ============================================
// 3. FUNCIONES AUXILIARES
// ============================================

function isValidInput(value) {
    return value.trim().length > 0;
}

function showError(errorElement, message) {
    errorElement.textContent = message;
}

function clearError(errorElement) {
    errorElement.textContent = '';
}

function clearTaskErrors() {
    clearError(taskTitleError);
    clearError(taskDescriptionError);
}

function updateTaskCount(total) {
    taskCount.textContent = `${total} ${total === 1 ? 'tarea' : 'tareas'}`;
}

function showSystemMessage(message, type = 'success') {
    systemMessage.textContent = message;
    systemMessage.style.display = 'block';

    if (type === 'success') {
        systemMessage.style.backgroundColor = '#d4edda';
        systemMessage.style.color = '#155724';
        systemMessage.style.border = '1px solid #c3e6cb';
    } else {
        systemMessage.style.backgroundColor = '#f8d7da';
        systemMessage.style.color = '#721c24';
        systemMessage.style.border = '1px solid #f5c6cb';
    }
}

function hideSystemMessage() {
    systemMessage.style.display = 'none';
    systemMessage.textContent = '';
}

function resetTaskForm() {
    taskForm.reset();
    taskIdInput.value = '';
    submitTaskBtn.querySelector('.btn__text').textContent = 'Registrar Tarea';
    cancelEditBtn.style.display = 'none';
    clearTaskErrors();
}

function startEditTask(task) {
    taskIdInput.value = task.id;
    taskTitle.value = task.titulo;
    taskDescription.value = task.descripcion;

    submitTaskBtn.querySelector('.btn__text').textContent = 'Actualizar Tarea';
    cancelEditBtn.style.display = 'inline-block';

    clearTaskErrors();
    showSystemMessage('Editando tarea seleccionada', 'success');
}

// ============================================
// 4. RENDER DE TAREAS
// ============================================

function renderTasks(tasks) {
    tasksTableBody.innerHTML = '';

    if (tasks.length === 0) {
        tasksTableBody.innerHTML = `
            <tr id="emptyTasksRow">
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No hay tareas registradas aun.
                </td>
            </tr>
        `;
        updateTaskCount(0);
        return;
    }

    tasks.forEach(task => {
        const fila = document.createElement('tr');
        fila.style.borderBottom = '1px solid #ddd';

        fila.innerHTML = `
            <td style="padding: 12px;">${usuarioEncontrado.nombre}</td>
            <td style="padding: 12px;">${task.titulo}</td>
            <td style="padding: 12px;">${task.descripcion}</td>
            <td style="padding: 12px;">
                <button type="button" class="btn-edit" style="margin-right: 8px; padding: 6px 10px; cursor: pointer;">
                    Editar
                </button>
            </td>
        `;

        const editBtn = fila.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => startEditTask(task));

        tasksTableBody.appendChild(fila);
    });

    updateTaskCount(tasks.length);
}

// ============================================
// 5. API
// ============================================

async function loadTasksByUser(userId) {
    try {
        const response = await fetch(`http://localhost:3000/tasks?userId=${userId}`);

        if (!response.ok) {
            throw new Error('No se pudieron cargar las tareas');
        }

        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        showSystemMessage('Error al cargar las tareas del usuario', 'error');
    }
}

async function createTask(taskData) {
    try {
        const response = await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('No se pudo registrar la tarea');
        }

        await response.json();
        showSystemMessage('Tarea registrada correctamente', 'success');
        resetTaskForm();
        await loadTasksByUser(usuarioEncontrado.id);
    } catch (error) {
        console.error('Error al crear tarea:', error);
        showSystemMessage('Error al registrar la tarea', 'error');
    }
}

async function updateTask(taskId, updatedData) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error('No se pudo actualizar la tarea');
        }

        await response.json();
        showSystemMessage('Tarea actualizada correctamente', 'success');
        resetTaskForm();
        await loadTasksByUser(usuarioEncontrado.id);
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        showSystemMessage('Error al actualizar la tarea', 'error');
    }
}

// ============================================
// 6. MANEJO DE EVENTOS
// ============================================

async function handleUserSearch(event) {
    event.preventDefault();
    clearError(userDocError);
    hideSystemMessage();

    const documento = userDocInput.value.trim();

    if (!isValidInput(documento)) {
        showError(userDocError, 'Ingresa el documento del usuario');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/users');

        if (!response.ok) {
            throw new Error('No se pudo consultar usuarios');
        }

        const users = await response.json();

        const user = users.find(
            u => String(u.documento).trim() === documento
        );

        if (user) {
            usuarioEncontrado = user;

            userInfoContainer.style.display = 'block';
            userInfoContainer.innerHTML =
                '<strong>Usuario encontrado:</strong><br>' +
                'Nombre: ' + user.nombre + '<br>' +
                'Documento: ' + user.documento;

            taskFieldset.disabled = false;
            resetTaskForm();
            await loadTasksByUser(user.id);
        } else {
            usuarioEncontrado = null;
            userInfoContainer.style.display = 'none';
            taskFieldset.disabled = true;
            renderTasks([]);
            showError(userDocError, 'Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        showError(userDocError, 'Error al conectar con el servidor');
    }
}

function handleUserInput() {
    if (userDocInput.value.trim().length > 0) {
        clearError(userDocError);
    }
}

function handleTaskTitleInput() {
    if (taskTitle.value.trim().length > 0) {
        clearError(taskTitleError);
    }
}

function handleTaskDescriptionInput() {
    if (taskDescription.value.trim().length > 0) {
        clearError(taskDescriptionError);
    }
}

async function handleTaskSubmit(event) {
    event.preventDefault();
    hideSystemMessage();
    clearTaskErrors();

    const titulo = taskTitle.value.trim();
    const descripcion = taskDescription.value.trim();
    const taskId = taskIdInput.value.trim();

    if (!usuarioEncontrado) {
        showSystemMessage('Primero debes buscar un usuario', 'error');
        return;
    }

    if (!isValidInput(titulo)) {
        showError(taskTitleError, 'Ingresa el título de la tarea');
        return;
    }

    if (!isValidInput(descripcion)) {
        showError(taskDescriptionError, 'Ingresa la descripción de la tarea');
        return;
    }

    const taskData = {
        titulo,
        descripcion,
        userId: usuarioEncontrado.id
    };

    if (taskId) {
        await updateTask(taskId, taskData);
    } else {
        await createTask(taskData);
    }
}

// ============================================
// 7. REGISTRO DE EVENTOS
// ============================================

userForm.addEventListener('submit', handleUserSearch);
userDocInput.addEventListener('input', handleUserInput);

taskForm.addEventListener('submit', handleTaskSubmit);
taskTitle.addEventListener('input', handleTaskTitleInput);
taskDescription.addEventListener('input', handleTaskDescriptionInput);
cancelEditBtn.addEventListener('click', resetTaskForm);

// ============================================
// 8. INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    taskFieldset.disabled = true;
    updateTaskCount(0);
    console.log('✅ DOM completamente cargado');
    console.log('📝 Aplicación de gestión de tareas iniciada');
});