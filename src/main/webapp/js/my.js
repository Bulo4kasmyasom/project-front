// Notice for me.
// Can be added/improved to the project:
// - History API
// - Cookies for page size, page number and editNow
// - Multiple deletion of players
// - Separate the JS code and files
// - function updatePaginator() can be improved. If too much pages:
// Example:  [first_Page] 3 4 [current_page] .. 8 9 10 [last_Page]

//But this is not a task of the project...

const PLAYERS_PATH = '/rest/players';
const COUNT_PLAYERS_PATH = PLAYERS_PATH + '/count';
const IMG_DELETE_PATH = "/img/delete.png";
const IMG_EDIT_PATH = "/img/edit.png";
const IMG_SAVE_PATH = "/img/save.png";

const PLAYER_ADDED_SHOW_HIDE_TIMEOUT = 3000;
const checkInputFieldByEmpty = "Empty characters are introduced, check input field: ";
const NOT_FOUND_PLAYERS = "Not found players";
const BAD_REQUEST = "bad request";
const BAD_PARAMETERS = "Bad parameters...";
const PLAYER_WAS_ADDED = "Player was added";
const SO_FAST = "Try to create a new player " + PLAYER_ADDED_SHOW_HIDE_TIMEOUT + " milliseconds after adding the past player";

const NAMES = ["Endarion", "Morviel", "Training", "Balgor", "Jeris", "Illynas", "Ardong", "Ezzessel", "Aisha", "Dmitry"]
const TITLES = ["Deadly", "temptic", "gray warrior", "imperial warrior", "coming without noise", "brittle flying"]
const RACES = ["HUMAN", "DWARF", "ELF", "GIANT", "ORC", "TROLL", "HOBBIT"]
const PROFESSIONS = ["WARRIOR", "ROGUE", "SORCERER", "CLERIC", "PALADIN", "NAZGUL", "WARLOCK", "DRUID"]
const BANNED = ["false", "true"]

const GET_TABLE_ID = getQSelector("#tableBody");
const GET_PAGES_ID = getQSelector("#paginator");
const CREATE_PLAYER_FORM_ID = getQSelector("#createPlayerForm");
const INPUT_NAME_ID = getQSelector("#inputName");
const INPUT_TITLE_ID = getQSelector("#inputTitle");
const INPUT_LEVEL_ID = getQSelector("#inputLevel");
const SET_PROFESSION_ID = getQSelector("#selectProfession");
const SELECT_BANNED_ID = getQSelector("#selectBanned");
const SELECT_RACE_ID = getQSelector("#selectRace");
const PLAYER_ADDED_RESULT_ID = getQSelector("#playerAddedResult");

let player = null;
let idFieldsCreateNewPlayer = new Map();
let arrLevels = []
let page_size = 7
let page_number = 0
let editNow = false

idFieldsCreateNewPlayer.set(INPUT_NAME_ID, NAMES)
idFieldsCreateNewPlayer.set(INPUT_TITLE_ID, TITLES)
idFieldsCreateNewPlayer.set(INPUT_LEVEL_ID, arrLevels)
idFieldsCreateNewPlayer.set(SET_PROFESSION_ID, PROFESSIONS)
idFieldsCreateNewPlayer.set(SELECT_BANNED_ID, BANNED)
idFieldsCreateNewPlayer.set(SELECT_RACE_ID, RACES)

const actions = {
    edit: {
        imgUrl: IMG_EDIT_PATH,
        actionText: "edit",
        title: "Edit",
        alt: "Edit",
        action: (id) => player.editPlayer(id)
    },
    delete: {
        imgUrl: IMG_DELETE_PATH,
        actionText: "delete",
        title: "Delete",
        alt: "Delete",
        action: (id) => player.deletePlayer(id)
    }
}

window.onload = function () {
    onLoadWindow();
}

function onLoadWindow() {
    player = new Player()

    sendRequest('GET', getUrlWithParamsPageSize())
        .then(players => createTable(players))
        .catch(error => console.log(error))

    updatePaginator(page_size)

    addToSelectOption(SELECT_BANNED_ID, BANNED);
    addToSelectOption(SELECT_RACE_ID, RACES);
    addToSelectOption(SET_PROFESSION_ID, PROFESSIONS);

    CREATE_PLAYER_FORM_ID.addEventListener("submit", function (event) {
        event.preventDefault();
        player.createPlayer()
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
    let element = id;
    if (typeof id === 'string')
        element = getQSelector(id);
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
            if (xhr.status === 400 || xhr.status === 404) {
                window.location = "/html/" + xhr.status + ".html" // only for this project
            }
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

function getPlayersWithParams() {
    sendRequest('GET', getUrlWithParamsPageSizeNumber())
        .then(players => {
            updateTable(players)
        })
        .catch(() => console.log(NOT_FOUND_PLAYERS));
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
    for (let i = 0; i <= 100; i++) arrLevels.push(i)

    idFieldsCreateNewPlayer.forEach((array, id) => {
        getRandomValue(id, array);
    });
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
        GET_TABLE_ID.appendChild(row);
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

function updateTable(players) {
    removeAllChilds(GET_TABLE_ID);
    createTable(players)
    updatePaginator(page_size)
    editNow = false
}

function selectPageSizeForView(pageSize) {
    page_number = 0
    page_size = pageSize
    sendRequest('GET', getUrlWithParamsPageSize())
        .then(players => {
            updateTable(players)
        })
        .catch(() => console.log(NOT_FOUND_PLAYERS));
}

function updatePaginator(playersCountInTableNow = page_size) {
    removeAllChilds(GET_PAGES_ID)

    sendRequest('GET', COUNT_PLAYERS_PATH)
        .then(allPlayersCount => {
            let countPagesInPaginator = Math.ceil(allPlayersCount / playersCountInTableNow);

            for (let pageNumber = 0; pageNumber < countPagesInPaginator; pageNumber++) {
                let link = document.createElement("span");
                link.addEventListener("click", () => {
                    page_number = pageNumber
                    page_size = playersCountInTableNow
                    getPlayersWithParams()
                }, false)

                if (page_number === pageNumber)
                    link.className = 'activePageNumber'
                else
                    link.className = 'pageNumber'

                link.textContent = pageNumber.toString()
                GET_PAGES_ID.appendChild(link)
            }
        })
        .catch(() => console.log(NOT_FOUND_PLAYERS));
}

function getUrlWithParamsPageSize() {
    return PLAYERS_PATH + "?pageSize=" + page_size;
}

function getUrlWithParamsPageSizeNumber() {
    return PLAYERS_PATH + "?pageNumber=" + page_number + "&pageSize=" + page_size;
}


class Player {
    tooFastCreateNewPlayer = false

    createPlayer() {
        let formData = new FormData(CREATE_PLAYER_FORM_ID)
        let dataParams = {}

        for (let [name, value] of formData) {
            if (!isEmpty(value.trim()))
                dataParams[name] = value; // need to check params in server or with js or redirect 400 page
            else
                return alert(checkInputFieldByEmpty + name)

            if (name === 'birthday')
                dataParams[name] = Date.parse(value.toString())
        }
        if (!this.tooFastCreateNewPlayer) {
            this.tooFastCreateNewPlayer = true
            sendRequest('POST', PLAYERS_PATH, dataParams)
                .then(response => {
                    getPlayersWithParams()
                    this.playerWasAddedResult(response);
                    pasteRandomValueInIFields();
                })
                .catch(() => alert(BAD_PARAMETERS))
            updatePaginator(page_size)
        } else {
            alert(SO_FAST)
        }
    }

    playerWasAddedResult(response) {
        let resultElement = document.createElement("span")

        resultElement.innerHTML = "<b>" + PLAYER_WAS_ADDED +
            "<br> Name:</b> " + response.name +
            "<br> <b>Title:</b> " + response.title

        removeAllChilds(PLAYER_ADDED_RESULT_ID)
        PLAYER_ADDED_RESULT_ID.appendChild(resultElement)
        showHideElement(PLAYER_ADDED_RESULT_ID)

        setTimeout(() => {
            showHideElement(PLAYER_ADDED_RESULT_ID)
            this.tooFastCreateNewPlayer = false
        }, PLAYER_ADDED_SHOW_HIDE_TIMEOUT)
    }


    editPlayer(id) {
        if (editNow) return false;
        editNow = true
        let editImgId = getQSelector("#edit-" + id);
        let deleteId = getQSelector("#delete-" + id);

        editImgId.setAttribute("src", IMG_SAVE_PATH)
        editImgId.setAttribute("id", "save-" + id)
        deleteId.style.display = 'none'

        let editFieldName = replaceDataTd("#name-" + id, 'text')
        let editFieldTitle = replaceDataTd("#title-" + id, 'text')
        let editFieldRace = replaceDataTd("#race-" + id, RACES)
        let editFieldProfession = replaceDataTd("#profession-" + id, PROFESSIONS)
        let editFieldBanned = replaceDataTd("#banned-" + id, BANNED)

        this.imageEventListener(editImgId, editFieldName, editFieldTitle, editFieldRace, editFieldProfession, editFieldBanned, id);
    }

    imageEventListener(editImgId, editFieldName, editFieldTitle, editFieldRace, editFieldProfession, editFieldBanned, id) {
        editImgId.addEventListener("click", () => {
            let dataParams = {
                name: editFieldName.value.trim().slice(0, 12),
                title: editFieldTitle.value.trim().slice(0, 30),
                race: editFieldRace.value,
                profession: editFieldProfession.value,
                banned: editFieldBanned.value,
            }

            for (const key in dataParams) {
                if (isEmpty(`${dataParams[key]}`.trim()))
                    return alert(checkInputFieldByEmpty + `${key}`)
            }

            sendRequest('POST', PLAYERS_PATH + '/' + id, dataParams)
                .then(() => {
                    getPlayersWithParams()
                    editNow = false
                })
                .catch(() => console.log(BAD_REQUEST))
        }, false)
    }


    deletePlayer(id) {
        sendRequest('DELETE', PLAYERS_PATH + '/' + id)
            .then(() => {
                sendRequest('GET', getUrlWithParamsPageSizeNumber())
                    .then(players => {
                        if (Object.keys(players).length > 0)
                            updateTable(players)
                        else
                            location.reload()
                    })
                    .catch(() => console.log(NOT_FOUND_PLAYERS));
            })
            .catch(() => console.log(BAD_REQUEST))
    }

}