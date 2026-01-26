export default class ApiClient{
    #serviceUrl;

    constructor(serviceUrl){
        this.#serviceUrl=serviceUrl;
    }

    async getTasks(){
        const response = await fetch(`${this.#serviceUrl}/tasklist`);
        const data = await response.json()
        const tasks = data.tasks;
        return tasks;
    }
    async getStatuses(){
        const response = await fetch(`${this.#serviceUrl}/allstatuses`);
        const data = await response.json();
        const statuses=data.allstatuses;
        return statuses;
    }
    async postTask(task){
        const response = await fetch(`${this.#serviceUrl}/task`, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(task)
        })
        const data = await response.json();
        return data.task;
    }
    async putTask(id, newStatus){
        const response = await fetch(`${this.#serviceUrl}/task/${id}`,{
                method: "PUT",
                headers: {"Content-Type": "application/json; charset=utf-8"},
                body: JSON.stringify({"status":newStatus})
        });
        const data = await response.json();
        return { id: data.id, status: data.status };
    }
    async deleteTask(id){
        const response = await fetch(`${this.#serviceUrl}/task/${id}`,{
            method:"DELETE"
        })
        const data = await response.json();
        return data.id;
    }
}