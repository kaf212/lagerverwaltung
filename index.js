const pseudoTodos = [{"title":"Chuchi sueche", "camp":"Chlausi 2023"}, {"title":"Lagerhuus zahle", "camp":"PfiLa 2024"}, {"title":"Samichlaus organisiere", "camp":"Chlausi 2023"}, {"title":"Ihladige schicke", "camp":"HeLa 2023"}]
const pseudoAppointments = [["22.07.06", "1. Chlausi Höck"], ["01.05.08", "2. HeLa Höck"], ["24.02.06", "Druck abhole"]]
const pseudoCamps = [{"name":"Chlausi 2023", "title":"Chaos auf der Nostromo"}, {"name":"HeLa 2023", "title":"In einer weit entfernten Galaxis..."}, {"name":"SoLa 2024", "title":"Men in Black"}, {"name":"PfiLa 2024", "title":"The Blues Brothers"}, {"name":"Chlausi 2024", "title":"2001: Ein Weltraumlager"}]




//################################################### local storage #####################################
// test
function initLocalStorage() {
    if (localStorage.length === 0) {
        localStorage.setItem("todos", "[]")
        localStorage.setItem("camps", "[]")
        localStorage.setItem("appointments", "[]")
    }
}

function resetLocalStorage() {
    for (const key in localStorage) {
        localStorage.removeItem(key)
    }
    initLocalStorage()
}

function getTodoFromStorageById(id) {
    for (const item of getAllTodos()) {
        if (item.id === id) {
            return item
        }
    }
}

function editTodoInStorage(id, attribute, value) {
    const todoJson = getAllTodos()
    for (const todo of todoJson) {
        if (todo.id == id) {
            todo[attribute] = value
        }
    }
    localStorage.setItem("todos", JSON.stringify(todoJson))

}

function deleteTodoFromStorage(id) {
    const todoJson = getAllTodos()
    for (const todo of todoJson) {
        if (todo.id == id) {
            todoJson.splice(todoJson.indexOf(todo), 1)
        }
    }
    localStorage.setItem("todos", JSON.stringify(todoJson))

}


initLocalStorage()

//#######################################################################################################

// ############################################### context menu #############################################


function openContextMenu(event) {
    event.preventDefault()
    const targetElement = document.elementFromPoint(event.clientX, event.clientY).closest("tr"); // Get the element at the click position
    console.log(targetElement)
    console.log(targetElement.id)
    const contextMenu = document.getElementById("todoContextMenu")
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    contextMenu.style.display = "block"

    document.addEventListener("click", () => {
        contextMenu.style.display = "none"
    })
    addContextMenuEventListeners(targetElement)
}

function addContextMenuEventListeners(targetElement) {
    // it is essential, that the onclick attribute is used and not the addEventListener method, because else, the
    // old eventListeners persist and delete every element that has been rightclicked!
    for (const option of document.getElementsByClassName("context-menu-option-todo")) {
        if (option.classList.contains("context-menu-option-todo-delete")) {
            option.onclick = () => {
                deleteTodoFromStorage(targetElement.id)
                targetElement.remove()
            }
        }

        else if (option.classList.contains("context-menu-option-todo-edit")) {
            option.onclick = () => {
                addNewTodoUI()
                const todoObj = getTodoFromStorageById(targetElement.id)
                console.log(todoObj)
                document.getElementById("modalFormTodoName").setAttribute("value", todoObj.title)
                document.getElementById("modalFormTodoCamp").setAttribute("value", todoObj.camp)
                const originalId = todoObj.id
                deleteTodoFromStorage(originalId)
                editTodoInStorage(Number(originalId)+1, "id", originalId)
                renderTodoPreview()

            }
        }
    }
}


// ##########################################################################################################


function getAllTodos() {
    return JSON.parse(localStorage.getItem("todos"))
}

function getAllCamps() {
    return pseudoCamps
}
function writeTodo(todo) {
    console.log(`written todo ${todo.title}`)
    const array = JSON.parse(localStorage.getItem("todos"))
    array.push(todo)
    localStorage.setItem("todos", JSON.stringify(array))
}

function readTodo(todo) {
    localStorage.getItem(todo.title)
}
function renderTodoPreview() {
    const todoElements = document.getElementById("main-todo-container").getElementsByTagName("tr")
    Array.from(todoElements).forEach((element) => {
        element.remove()
    })
    for (const todo of getAllTodos()) {
        addNewTodo(todo, false)
    }

}


function renderAppointmentsPreview() {
    const appointmentTable = document.getElementById("appointments")
    pseudoAppointments.forEach((app) => {
        const tr = document.createElement("tr")
        const tdName = document.createElement("td")
        const tdCamp = document.createElement("td")

        tdName.innerText = app[0]
        tdCamp.innerText = app[1]

        tr.append(tdName)
        tr.append(tdCamp)
        appointmentTable.append(tr)

    })
}

function renderCampPreviews() {
    const campContainer = document.getElementById("main-camps-container")
    pseudoCamps.forEach((camp) => {
        const div = document.createElement("div")
        div.setAttribute("class", "camp-container")
        const campName = document.createElement("p")
        const campTitle = document.createElement("p")
        campName.innerText = camp[0]
        campTitle.append(document.createElement("strong"))
        campTitle.firstElementChild.innerText = camp[1]

        div.append(campName)
        div.append(campTitle)
        campContainer.append(div)

    })
}


function addNewTodo(todoObject, writeToStorage) {

    if (writeToStorage) {writeTodo(todoObject)}

    let table = document.getElementById("todos")

    let isDone = false
    if (todoObject.done === true) {
        table = document.getElementById("doneTodos")
        isDone = true
    }


    const newTodoElement = createTodoElement(isDone)
    newTodoElement.setAttribute("id", todoObject.id)

    newTodoElement.getElementsByTagName("span")[0].innerText = todoObject.title
    newTodoElement.getElementsByTagName("span")[1].innerText = todoObject.camp


    table.append(newTodoElement)

}

function reOpenTodo(event) {
    const checkbox = event.currentTarget
    const element = checkbox.parentElement.parentElement
    const table = document.getElementById("todos")
    checkbox.removeEventListener("click", reOpenTodo)
    checkbox.checked = false
    checkbox.addEventListener("click", markTodoDone)
    table.append(element)
    editTodoInStorage(element.id, "done", false)

}



function markTodoDone(event) {
    const checkbox = event.currentTarget
    const element = checkbox.parentElement.parentElement
    const doneTable = document.getElementById("doneTodos")

    editTodoInStorage(element.id, "done", true)

    checkbox.removeEventListener("click", markTodoDone)
    checkbox.checked = true
    checkbox.addEventListener("click", reOpenTodo)
    doneTable.append(element)
}

function generateTodoId() {
    const todos = getAllTodos()
    if (todos === 0) {
        return "0"
    }
    let maxIdValue = 0
    for (const key in todos) {
        const currentTodo = todos[key]
        if (Number(currentTodo.id) === maxIdValue) {
            maxIdValue = Number(currentTodo.id) + 1
        }
        if (Number(currentTodo.id) > maxIdValue) {
            maxIdValue = Number(currentTodo.id) + 2
        }

    }
    return String(maxIdValue)
}

function createTodoElement(isDone) {
    const tr = document.createElement("tr")
    const checkBox = document.createElement("input")
    checkBox.setAttribute("type", "checkbox")
    if (isDone) {
        checkBox.checked = true
        checkBox.addEventListener("click", reOpenTodo)
    }
    else {
        checkBox.addEventListener("click", markTodoDone)
    }

    tr.append(document.createElement("td"))
    tr.append(document.createElement("td"))
    const tds = tr.getElementsByTagName("td")
    tds[0].append(checkBox)
    tds[0].append(document.createElement("span"))
    tds[1].append(document.createElement("span"))

    tr.addEventListener("contextmenu", openContextMenu)

    return tr
}

function resetTodoModal() {
    /*
    Array.from(document.getElementById("todoModal").getElementsByTagName("input")).forEach((element) => {
        element.removeAttribute("value")
    })
    Array.from(document.getElementById("todoModal").getElementsByTagName("select")).forEach((element) => {
        element.removeAttribute("value")
    })
    */

    document.forms.todoModalForm.reset()

}

function addNewTodoUI() {
    resetTodoModal()
    document.getElementById("todoModal").classList.remove("hidden")
    document.getElementById("modalFormTodoName").focus()
}

function addMainEventListeners() {
    document.getElementById("newTodo").addEventListener("click", addNewTodoUI)

    }


// ---- main function calls ----

renderTodoPreview()
renderAppointmentsPreview()
renderCampPreviews()
addMainEventListeners()

// ############################################# modal stuff ##############################################
function handleTodoModalSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const todoName = formData.get("todoName")
    const todoCamp = formData.get("todoCamp")
    console.log("test")
    const todoObj = {"id": generateTodoId(), "title": todoName, "camp": todoCamp, "done": false}
    addNewTodo(todoObj, true)

    const modal = form.parentElement.parentElement
    modal.classList.add("hidden")
}

function addModalEventListeners() {
    Array.from(document.getElementsByClassName("modal-form")).forEach((form) => {
        form.addEventListener("submit", handleTodoModalSubmit)
    })

    Array.from(document.getElementsByClassName("modal-abort-button")).forEach((button) => {
        button.addEventListener("click", (event) => {
            const buttonElem = event.currentTarget
            buttonElem.parentElement.parentElement.parentElement.classList.add("hidden")
        })
    })
}


function loadCampsIntoModals() {
    const todoCampsSelectElem = document.getElementById("modalFormTodoCamp")
    getAllCamps().forEach((camp) => {
        const option = document.createElement("option")
        option.setAttribute("value", camp.name)
        option.innerText = camp.name
        todoCampsSelectElem.append(option)
    })
}

// ---- modal function calls ----
addModalEventListeners()
loadCampsIntoModals()

// ##########################################################################################################






//################################################### DEBUGGING #########################################

document.getElementById("debugButtonGetAllTodos").addEventListener("click", () => {
    for (const todo of getAllTodos()) {
        console.log(todo)
    }
    if (getAllTodos().length === 0) {
        console.log("No todos in storage")
    }
})

document.getElementById("debugButtonResetStorage").addEventListener("click", resetLocalStorage)


//#######################################################################################################