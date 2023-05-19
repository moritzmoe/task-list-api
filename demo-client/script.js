const baseUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  const token = await getToken();

  await loadTasks(token);

  taskForm = document.getElementById('task-form');

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addTask(token);
    taskForm.reset();
  });
});

const loadTasks = async (token) => {
  const response = await fetch(
    `${baseUrl}/api/tasks?` + new URLSearchParams({ take: 50 }),
    {
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const respJson = await response.json();

  list = document.getElementById('tasks');
  list.innerHTML = "";

  respJson.forEach((element) => {
    let task = document.createElement('div');
    task.className = 'task';
    task.innerHTML = `<div class="${
      element.completed ? 'completed' : ''
    }"><div class="task-name">${
      element.name
    }</div><div class="task-description">${element.description}</div></div>`;

    let controls = document.createElement('controls');
    controls.className = 'controls';

    task.appendChild(controls);

    let deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.id = element.id;
    deleteButton.className = 'control-button delete-button delete';
    deleteButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await deleteTask(token, e.target.id);
    });

    let doneButton = document.createElement('button');
    doneButton.innerText = 'Done';
    doneButton.id = element.id;
    doneButton.className = 'control-button done-button done';
    doneButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await markTaskAsDone(token, e.target.id);
    });

    controls.appendChild(doneButton);
    controls.appendChild(deleteButton);

    list.appendChild(task);
  });
};

const addTask = async (token) => {
  const newTask = {
    name: document.getElementById('new-task-name').value,
    description: document.getElementById('new-task-description').value,
  };

  await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    body: JSON.stringify(newTask),
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  await loadTasks(token);
};

const markTaskAsDone = async (token, id) => {
  const completed = {
    completed: true,
  };

  await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: 'PUT',
    mode: 'cors',
    body: JSON.stringify(completed),
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  await loadTasks(token);
};

const deleteTask = async (token, id) => {
  await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await loadTasks(token);
};

const getToken = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    return token;
  }

  const response = await fetch(`${baseUrl}/api/auth`, {
    method: 'POST',
    mode: 'cors',
  });
  const respJson = await response.json();

  localStorage.setItem('token', respJson.token);

  return respJson.token;
};
