import ApiClient from "../js/ApiClient.js";
import "../components/TaskBox.js";
import "../components/TaskList.js";
const template = document.createElement("template");
template.innerHTML = `
 <link rel="stylesheet" type="text/css"
 href="${import.meta.url.match(/.*\//)[0]}/styles/taskview.css"/>
 <h1>Tasks</h1>
 <div><p id="message">Waiting for server data.</p></div>
 <div>
 <button id="newtaskBtn" type="button" disabled>New task</button>
 </div>
 <!-- The task list -->
 <task-list id="task-list"></task-list>

 <!-- The Modal -->
 <task-box id="task-box"></task-box>
`;
class TaskView extends HTMLElement {
    #shadow;
    #taskList;
    #taskBox;
    #apiClient;

    constructor(){
        super();
        this.#shadow = this.attachShadow({mode:"closed"});
        this.#shadow.appendChild(template.content.cloneNode(true));
        this.#apiClient = new ApiClient(this.dataset.serviceurl);
    }

    async connectedCallback(){
        try {
            const [statuses, tasks] = await Promise.all([
                this.#apiClient.getStatuses(),
                this.#apiClient.getTasks(),
                customElements.whenDefined("task-list"),
                customElements.whenDefined("task-box")
            ]);

            this.#configureTaskList(statuses);
            this.#configureTaskBox(statuses);
            this.#initialize(tasks);           
        } catch (error) {
            this.#showError("Error establishing connection with server",error)
        }
    }
    #initialize(tasks){
        this.#updateHeaderMsg(tasks.length);
        const newtaskBtn = this.#shadow.getElementById("newtaskBtn");
        newtaskBtn.disabled = false;
        newtaskBtn.addEventListener("click",()=>this.#taskBox.show());
        tasks.forEach(task => this.#taskList.showTask(task));
    }
    #configureTaskList(statuses){
        this.#taskList = this.#shadow.getElementById("task-list");
        this.#taskList.setStatuseslist(statuses);
        
        this.#taskList.changestatusCallback(async (id, newStatus)=>{
            try {
                const updatedTask = await this.#apiClient.putTask(id, newStatus);
                this.#taskList.updateTask(updatedTask);
            } catch (error) {
                this.#showError("Error updating status of task", error);
            }

        })

        this.#taskList.deletetaskCallback(async id =>{
            try {
                this.#taskList.removeTask(await this.#apiClient.deleteTask(id));
                this.#updateHeaderMsg(this.#taskList.getNumtasks())
            } catch (error) {
                this.#showError("Error deleting task", error);
            }
        })
    }
    #configureTaskBox(statuses){
        this.#taskBox = this.#shadow.getElementById("task-box");
        this.#taskBox.setStatuseslist(statuses);
        this.#taskBox.newtaskCallback(async (task)=>{
            try {
                const addedTask = await this.#apiClient.postTask(task);
                this.#taskList.showTask(addedTask);
                this.#updateHeaderMsg(this.#taskList.getNumtasks())
                this.#taskBox.close();
            } catch (error) {
                this.#showError("Error creating task",error);
            }
        })
    }

    #updateHeaderMsg(numTasks){
        this.#shadow.getElementById("message").textContent = 
            numTasks>0?
                `Found ${numTasks} tasks.`:
                `No tasks were found.`;
    }
    #showError(msg, error){
        console.error(msg, error);
        this.#shadow.getElementById("message").textContent = msg;
    }
}
customElements.define("task-view", TaskView);