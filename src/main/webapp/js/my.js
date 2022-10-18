const urlPlayers = '/rest/players'
const urlCountPlayers = urlPlayers + '/count'

const imgDeletePath = "/img/delete.png";
const imgEditPath = "/img/edit.png";
const imgSavePath = "/img/save.png";

// encoding troubles...
// const NAMES = ["Эндарион", "Морвиел", "Трениган", "Балгор", "Джерис", "Иллинас", "Ардонг", "Эззэссэль", "Айша", "Дмитрий"]
// const TITLES = ["Смертоносный", "Искусительница", "Серый Воин", "Имперский Воин", "Приходящий Без Шума", "Ухастый Летун"]
const NAMES = ["Endarion", "Morviel", "Training", "Balgor", "Jeris", "Illynas", "Ardong", "Ezzessel", "Aisha", "Dmitry"]
const TITLES = ["Deadly", "temptic", "gray warrior", "imperial warrior", "coming without noise", "brittle flying"]
const RACES = ["HUMAN", "DWARF", "ELF", "GIANT", "ORC", "TROLL", "HOBBIT"]
const PROFESSIONS = ["WARRIOR", "ROGUE", "SORCERER", "CLERIC", "PALADIN", "NAZGUL", "WARLOCK", "DRUID"]
const BANNED = ["false", "true"]

// можно заменить на cookies
let PAGE_SIZE = 7
let PAGE_NUMBER = 0
let editNow = false

const getTableId = getQSelector("#tableBody")
const getPagesId = getQSelector("#paginator")
const createPlayerFormId = getQSelector("#createPlayerForm");

const inputNameId = getQSelector("#inputName");
const inputTitleId = getQSelector("#inputTitle");
const inputLevelId = getQSelector("#inputLevel");
const selectProfessionId = getQSelector("#selectProfession");
const selectBannedId = getQSelector("#selectBanned");
const selectRaceId = getQSelector("#selectRace");

const actions = {
    edit: {
        imgUrl: imgEditPath,
        actionText: "edit",
        title: "Edit",
        alt: "Edit",
        action: (id) => editPlayer(id)
    },
    delete: {
        imgUrl: imgDeletePath,
        actionText: "delete",
        title: "Delete",
        alt: "Delete",
        action: (id) => deletePlayer(id)
    }
}

window.onload = function () {
    sendRequest('GET', urlPlayers + '?pageSize=' + PAGE_SIZE)
        .then(players => createTable(players))
        .catch(error => console.log(error))
    updatePaginator(PAGE_SIZE)

    addToSelectOption(selectBannedId, BANNED);
    addToSelectOption(selectRaceId, RACES);
    addToSelectOption(selectProfessionId, PROFESSIONS);

    createPlayerFormId.addEventListener("submit", function (event) {
        event.preventDefault();
        createPlayer()
    }, true);
}

function getRandomValue(id, array) {
    id.value = generateRandomValueFromArray(array)
}

function generateRandomValueFromArray(array) {
    return array[Math.floor((Math.random() * array.length))];
}

function addToSelectOption(qSelector, array) {
    for (const key of array) {
        const option = new Option(key, key);
        qSelector.appendChild(option)
    }
}

function showHideElement(id) {
    let element = document.getElementById(id);
    let display = element.style.display;
    if (display !== "block")
        element.style.display = "block";
    else
        element.style.display = "none";
}

function sendRequest(method, url, params = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(method, url)
        xhr.responseType = 'json'
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.onload = () => {
            if (xhr.status >= 400)
                reject(xhr.response);
            else
                resolve(xhr.response);
        }
        xhr.onerror = () => {
            reject(xhr.response)
        }
        xhr.send(JSON.stringify(params))
    });
}

function getQSelector(idName) {
    return document.querySelector(idName);
}

function replaceDataTd(qSid, type) {
    let create
    let qSelector = getQSelector(qSid)
    if (type === 'text')
        create = createInputField(qSelector, qSid, type);
    else
        create = createSelectOptionField(qSelector, qSid, type);
    qSelector.appendChild(create)
    return create
}

function getPlayersWithParams(pageSize, pageNumber) {
    sendRequest('GET', urlPlayers + "?pageSize=" + pageSize + '&pageNumber=' + pageNumber)
        .then(players => {
            updateTable(players)
        })
        .catch(error => console.log(error));
}

function createInputField(qSelector, id, type) {
    const input = document.createElement('input');
    input.id = id;
    input.type = type
    if (type === 'date') {
        let date = qSelector.textContent.split('.');
        input.value = date.reverse().join('-')
    } else {
        input.value = qSelector.textContent
    }
    qSelector.textContent = ''
    return input
}

function createSelectOptionField(value, id, array) {
    const select = document.createElement('select');
    select.id = id
    for (const key of array) {
        let option = document.createElement("option");
        if (key === value.textContent)
            option.setAttribute('selected', 'selected')
        option.value = key
        option.textContent = key
        select.add(option)
    }
    value.textContent = ''
    return select
}

function isEmpty(str) {
    return (!str || str.length === 0);
}

function removeAllChilds(elem) {
    if (elem.childElementCount > 0) {
        while (elem.lastElementChild) {
            elem.removeChild(elem.lastElementChild);
        }
    }
}

function pasteRandomValueInIFields() {
    let arrLevels = []
    for (let i = 0; i <= 100; i++) arrLevels.push(i)
    // можно заменить на мапу и циклом гонять
    getRandomValue(inputNameId, NAMES)
    getRandomValue(inputTitleId, TITLES)
    getRandomValue(inputLevelId, arrLevels)
    getRandomValue(selectProfessionId, PROFESSIONS)
    getRandomValue(selectBannedId, BANNED)
    getRandomValue(selectRaceId, RACES)
}

function createTable(data) {
    for (let key in data) {
        let person = data[key];
        let row = document.createElement("tr");
        for (let key in person) {
            let td = document.createElement("td");
            td.id = key + '-' + person['id']
            if (key === 'birthday')
                person[key] = new Date(person[key]).toLocaleDateString("ru-RU")
            let cellText = document.createTextNode(person[key]);
            td.appendChild(cellText);
            row.appendChild(td);
            if (key === 'level') {
                addActionsInTable(person, row);
            }
        }
        getTableId.appendChild(row);
    }
}

function addActionsInTable(person, row) {
    for (let key in actions) {
        let tdd = document.createElement("td");
        let img = document.createElement("img");
        img.src = actions[key]['imgUrl']
        img.alt = actions[key]['alt']
        img.id = actions[key]['actionText'] + '-' + person['id']
        img.title = actions[key]['title']
        img.addEventListener("click", () => {
            actions[key]['action'](person['id'])
        }, false)
        tdd.appendChild(img);
        row.appendChild(tdd);
    }
}

function deletePlayer(id) {
    sendRequest('DELETE', urlPlayers + '/' + id)
        .then(() => {
            sendRequest('GET', urlPlayers + "?pageNumber=" + PAGE_NUMBER + "&pageSize=" + PAGE_SIZE)
                .then(players => {
                    if (Object.keys(players).length > 0)
                        updateTable(players)
                    else
                        location.reload(); //
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error))
}

function editPlayer(id) {
    if (editNow) return false;

    editNow = true
    let editImgId = getQSelector("#edit-" + id);
    editImgId.setAttribute("src", imgSavePath)
    editImgId.setAttribute("id", "save-" + id)
    let deleteId = getQSelector("#delete-" + id);
    deleteId.style.display = 'none'

    let editFieldName = replaceDataTd("#name-" + id, 'text')
    let editFieldTitle = replaceDataTd("#title-" + id, 'text')
    let editFieldRace = replaceDataTd("#race-" + id, RACES)
    let editFieldProfession = replaceDataTd("#profession-" + id, PROFESSIONS)
    let editFieldBanned = replaceDataTd("#banned-" + id, BANNED)

    editImgId.addEventListener("click", () => {
        let dataParams = {
            name: editFieldName.value.trim().slice(0, 12),
            title: editFieldTitle.value.trim().slice(0, 30),
            race: editFieldRace.value,
            profession: editFieldProfession.value,
            banned: editFieldBanned.value,
        }
        sendRequest('POST', urlPlayers + '/' + id, dataParams)
            .then(() => {
                getPlayersWithParams(PAGE_SIZE, PAGE_NUMBER)
                editNow = false
            })
            .catch(error => console.log(error))
    }, false)
}

function createPlayer() {
    let formData = new FormData(createPlayerFormId);
    let dataParams = {}

    for (let [name, value] of formData) {
        if (!isEmpty(value.trim()))
            dataParams[name] = value; // нужно делать проверку входных данных или проверять их на сервере
        else
            return alert("Empty characters are introduced, check input field: " + name)

        if (name === 'birthday')
            dataParams[name] = Date.parse(value.toString())
    }
    sendRequest('POST', urlPlayers, dataParams)
        .then(() => {
            getPlayersWithParams(PAGE_SIZE, PAGE_NUMBER)
            alert("Player was added")
            pasteRandomValueInIFields();
        })
        .catch(() => alert("Bad parameters..."))
    updatePaginator(PAGE_SIZE)
}

function updatePaginator(playersCountInTableNow = PAGE_SIZE) {
    removeAllChilds(getPagesId)

    sendRequest('GET', urlCountPlayers)
        .then(allPlayersCount => {
            let countPagesInPaginator = Math.ceil(allPlayersCount / playersCountInTableNow);

            for (let pageNumber = 0; pageNumber < countPagesInPaginator; pageNumber++) {
                let link = document.createElement("span");
                link.addEventListener("click", () => {
                    getPlayersWithParams(playersCountInTableNow, pageNumber)
                    PAGE_NUMBER = pageNumber
                    PAGE_SIZE = playersCountInTableNow
                }, false)

                if (PAGE_NUMBER === pageNumber)
                    link.className = 'activePageNumber'
                else
                    link.className = "pageNumber"

                link.textContent = pageNumber.toString()
                getPagesId.appendChild(link)
            }
        })
        .catch(error => console.log(error));
}

function updateTable(players) {
    removeAllChilds(getTableId);
    createTable(players)
    updatePaginator(PAGE_SIZE)
    editNow = false
}

function selectPageSizeForView(pageSize) {
    sendRequest('GET', urlPlayers + "?pageSize=" + pageSize)
        .then(players => {
            PAGE_NUMBER = 0
            PAGE_SIZE = pageSize
            updateTable(players)
        })
        .catch(error => console.log(error));
}