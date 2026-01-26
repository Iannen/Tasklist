const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/styles/tasklist.css"/>

    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table id="table">
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    #shadow;
    #statusesList;
    #changeStatusCallback;
    #deletetaskCallback;

    constructor() {
        super();
        this.#shadow=this.attachShadow({mode:"closed"});
        this.#shadow.appendChild(template.content.cloneNode(true));
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        this.#statusesList=allstatuses;
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    changestatusCallback(callback) {
        this.#changeStatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    deletetaskCallback(callback) {
        this.#deletetaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        if (this.#shadow.getElementById("table")===null)
            this.#shadow.getElementById("tasklist")
                .appendChild(tasktable.content.cloneNode(true));

        const table = this.#shadow.getElementById("table");
        const tablerow = taskrow.content.cloneNode(true).firstElementChild;
        tablerow.dataset.id = task.id;

        tablerow.cells[0].textContent = task.title;
        tablerow.cells[1].textContent = task.status;

       this.#statusesList.forEach(status => {
            const option = document.createElement("option");
            option.text = option.value = status;
            tablerow.cells[2].firstElementChild.appendChild(option);
       });
        
        tablerow.cells[2].firstElementChild.addEventListener("change", (event)=>{
            const newStatus = event.target.value;
            if (window.confirm(`Set '${task.title}' to ${newStatus}?`))
                this.#changeStatusCallback(task.id, newStatus)
            tablerow.cells[2].firstElementChild.value="0";
        })
        
        tablerow.cells[3].firstElementChild.addEventListener("click", ()=>{
            if (window.confirm(`Delete task '${task.title}'?`))
                this.#deletetaskCallback(task.id)
        });
        table.tBodies[0].prepend(tablerow);
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        const tr = this.#shadow.getElementById("table").tBodies[0]
            .querySelector(`tr[data-id="${task.id.toString()}"]`);
        tr.cells[1].textContent=task.status;
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        if (this.getNumtasks()===1){
            this.#shadow.textContent="";
            const content = template.content.cloneNode(true);
            this.#shadow.appendChild(content);
        }
        else {
            this.#shadow.getElementById("table").tBodies[0]
                .querySelector(`tr[data-id="${id.toString()}"]`)
                .remove();
        }
    }
    
    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        const tableEl = this.#shadow.getElementById("table");
        return tableEl === null ?
            0:
            tableEl.tBodies[0].rows.length;
    }
}
customElements.define('task-list', TaskList);