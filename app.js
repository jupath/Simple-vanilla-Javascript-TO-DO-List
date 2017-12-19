const todoApp = (function() {
    'use strict';

    let sourceElement; // For drag & drop what to drag

    const dateField = document.getElementById('date');
    const itemsLeft = document.getElementById('items-left');
    const todoList = document.getElementById('todo-list');
    const todoValue = document.querySelector('.value');
    const todoValues = document.querySelectorAll('.value');
    const deleteTodo = document.querySelector('.delete-this');
    const saveTodo = document.getElementById('save-todo');
    const removeAll = document.getElementById('remove-all');

    // If 'todo' exists in localstorge get data if not create an empty array
    let todos = JSON.parse(localStorage.getItem('todo')) || [];

    // Add date
    function addDate() {

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const now = new Date();

        const year = now.getFullYear();
        const month = months[now.getMonth()];
        const day = now.getDate();

        dateField.textContent = `${month} ${day}, ${year}`;
    }

    // Add new to-do
    function addTodo(event) {
        event.preventDefault();

        const text = this.querySelector('#todo-text').value;

        // If the input field is empty return
        if ( text === '' ) return;

        // Create an ID for the new item. If the todo array is empty ID is 0, if not find the biggest number and add 1
        const ID = todos.length === 0 ? 0 : Math.max(...todos.map(todo => todo.ID)) + 1;

        // Todo object
        const todo = {
            ID,
            text,
            done: false
        }

        todos.push(todo); // Add the new todo object to the 'todo' array
        populateTodo(todos, todoList); // Populate todo
        localStorage.setItem('todo', JSON.stringify(todos)); // Add new item to localstorage
        updateItemsLeft(); // Update how many items left to be done
        this.reset(); // Clear the input field
    }

    // Populate html
    function populateTodo( todos = [], todoList ) {

        todoList.innerHTML = todos.map((todo) => {
            return `
                <li draggable="true" ondragstart="todoApp.elementDrag(event)" ondragover="todoApp.allowDrop(event)" ondrop="todoApp.elementDrop(event)"><div class="checkbox-wrapper"><input type="checkbox" data-id="${todo.ID}" id="todo-${todo.ID}" ${ todo.done ? 'checked' : '' }><span class="checkmark"></span></div> <label for="todo-${todo.ID}" class="value ${ todo.done ? 'completed' : '' }" data-id="${todo.ID}">${ todo.text }</label> <span class="delete-this" data-id="${todo.ID}">&#10006;</span></li>
            `;
        }).join('');
    }

    // Handle todo event (delete or sign item as completed)
    function handleTodo(event) {

        const el = event.target;
        const listElement = el.closest('li');
        const id = parseInt(el.dataset.id);

        if ( event.target.nodeName === 'INPUT' ) {
            // Sign item as completed
            const obj = todos.find( obj => obj.ID === id );

            obj.done = !obj.done;

            listElement.querySelector('.value').classList.toggle('completed');

        } else if( event.target.classList.contains('delete-this') ) {
            // Delete item
            todos = todos.filter( cur => cur.ID !== id );
            populateTodo( todos, todoList );

        }

        localStorage.setItem('todo', JSON.stringify(todos));
        updateItemsLeft();
    }

    // Remove all to-dos
    function removeAllTodos() {

        todos.length = 0;
        localStorage.setItem('todo', JSON.stringify(todos));
        populateTodo( todos, todoList );
        updateItemsLeft();
    }

    // Update how many items left to be done
    function updateItemsLeft() {

        let numberOfTodos = todos.filter(todo => todo.done === false).length;

        itemsLeft.innerHTML = `${numberOfTodos} item${ numberOfTodos === 1 ? '' : 's' } left`;
    }

    // If drag and drop happens update todo array and localstorage
    function reorderList() {
        const data = Array.from(document.querySelectorAll('.value'));
        const orderOfTodos = data.map( cur => parseInt(cur.dataset.id) );

        todos.sort((a, b) => {

            let keyA = a.ID;
            let keyB = b.ID;

            return orderOfTodos.indexOf(keyA) > orderOfTodos.indexOf(keyB) ? 1 : -1;
        });

        populateTodo( todos, todoList );
        localStorage.setItem('todo', JSON.stringify(todos));
    }

    // Create event listeners
    function setupEventListeners() {
        saveTodo.addEventListener('submit', addTodo);
        todoList.addEventListener('click', handleTodo);
        removeAll.addEventListener('click', removeAllTodos);
    }

    // What to drag
    function elementDrag(event) {
        sourceElement = event.target;
        event.dataTransfer.setData('text', event.target.innerHTML);
    }

    // Allow a drop by preventing the default handling of the element.
    function allowDrop(event) {
        event.preventDefault();
    }

    // Actually do the drop
    function elementDrop(event) {
        event.preventDefault();

        if( event.target.nodeName === 'LI' && event.target.parentNode.id === 'todo-list' ) {
            sourceElement.innerHTML = event.target.innerHTML;
            event.target.innerHTML = event.dataTransfer.getData('text');

            reorderList();
        }
    }

    addDate();
    populateTodo( todos, todoList );
    updateItemsLeft();
    setupEventListeners();

    return {
        // Return 'drag and drop' functions
        elementDrag,
        allowDrop,
        elementDrop
    }

})();
