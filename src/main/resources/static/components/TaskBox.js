const template = document.createElement("template");
template.innerHTML = `
 <link rel="stylesheet" type="text/css"
 href="${import.meta.url.match(/.*\//)[0]}/styles/taskbox.css"/>
 <dialog id="dialogEl">
 <!-- Modal content -->
 <span id='closeEl'>&times;</span>
 <div>
 <div>Title:</div>
 <div>
 <input id = "inputEl" type="text" size="25" maxlength="80"
 placeholder="Task title" autofocus/>
 </div>
 <div>Status:</div><div><select id='selectEl'></select></div>
 </div>
 <p><button disabled type="submit" id="buttonEl">Add task</button></p>
 </dialog>
`;

class TaskBox extends HTMLElement{
    #shadow;
    #statuseslist;
    #newtaskCallback;

    constructor(){
        super();
        this.#shadow = this.attachShadow({mode:"closed"});
        this.#shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback(){
        const inputEl = this.#shadow.getElementById("inputEl");
        const buttonEl = this.#shadow.getElementById("buttonEl");
        const selectEl = this.#shadow.getElementById("selectEl");

        buttonEl.addEventListener("click",()=>{
            this.#newtaskCallback({
                title:inputEl.value, 
                status:selectEl.value
            });
        })
        inputEl.addEventListener("input",()=>{
            buttonEl.disabled = inputEl.value.trim()==="";
        })

        this.#shadow.getElementById('closeEl')
            .addEventListener('click',()=>this.close());
    }

    show(){        
        this.#shadow.getElementById("inputEl").value="";
        this.#shadow.getElementById("selectEl").value="WAITING";
        this.#shadow.getElementById("buttonEl").disabled=true;
        this.#shadow.getElementById("dialogEl").showModal();
    }
    setStatuseslist(list){
        this.#statuseslist=list;
        this.#statuseslist.forEach(status => {
            const option = document.createElement("option");
            option.text = option.value = status;
            this.#shadow.getElementById("selectEl").appendChild(option);
        });
    }
    newtaskCallback(callback){
        this.#newtaskCallback = callback;
    }
    close(){
        this.#shadow.getElementById("dialogEl").close();
    }
}
customElements.define("task-box", TaskBox);