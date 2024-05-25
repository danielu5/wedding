let oppenedEditId;

const apiFetch = async (url, method, body) => {
    method = method || "GET";
    const opts = { method };
    if (body) {
        opts.headers = {
            "Content-Type": "application/json",
        };
        opts.body = JSON.stringify(body);
    }

    const resp = await fetch(`/api` + url, opts);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Error from API: ${resp.statusText}: ${text}`);
    }
    return resp;
};

const renderOptions = ({ id, name, ageGroup }) => {
    const idSuffix = id == null ? '' : ('-' + id);
    return `
        <form class="d-flex justify-content-left align-items-center">
            <input class="form-check-input mx-2" type="radio" id="age1${idSuffix}" name="age" value="30" ${ageGroup == 1 ? 'checked' : ''}>
            <label for="age1">0-5</label><br>
            <input class="form-check-input mx-2" type="radio" id="age2${idSuffix}" name="age" value="60" ${ageGroup == 2 ? 'checked' : ''}>
            <label for="age2">5-10</label><br>
            <input class="form-check-input mx-2" type="radio" id="age3${idSuffix}" name="age" value="100" ${ageGroup == 3 ? 'checked' : ''}>
            <label for="age3">>10</label>
        </form>
        `;
};

const initGuests = () => {

    const handleGuestDelete = (ev, id) => {
        ev.preventDefault();
        const doDelete = async () => {
            await apiFetch(`/guests/${id}`, "DELETE");
            refreshList();
        }
        doDelete().catch(err => console.log("Error deleting guest", err));
    };
    window.handleGuestDelete = handleGuestDelete;

    const renderName = ({ name, present }) => {
        if (!present) return name;
        return `<b>${name}</b>`;
    };
    const renderAgeGroup = (ageGroup) => {
        switch (ageGroup) {
            case 1: {
                return '0-5';
            }
            case 2: {
                return '5-10';
            }
            case 3: {
                return '>10';
            }
            default: {
                return '~';
            }
        }
    };

    const renderSelectorItem = ({ id, name }) => {
        return `<option value="${id}">${name}</option>`;
    };

    const renderSubGuests = ({ id, SubGuests }) => {
        if (SubGuests == null || SubGuests.length === 0) {
            return '';
        } else {
            return SubGuests.map((guest) => renderSubItem(id, guest.id, guest.name, guest.present, guest.ageGroup, guest.SubGuests)).join("");
        }
    };

    const renderSubItem = (ownerId, id, name, present, ageGroup, SubGuests) => `
        <div class="rounded my-1" style="background-color: ${present ? '#e0f0e3' : '#f4f6f7'};">
            <div class=" rounded list-group-item d-flex align-items-center border-0" style="background-color: transparent;">
                <div style="flex-grow: 1;">
                    ${renderName({ name, present })}
                    (${renderAgeGroup(ageGroup)})
                </div>
                <input
                    class="form-check-input me-2"
                    type="checkbox"
                    value=""
                    ${present ? "checked" : ""}
                    onchange="handleGuestPresentChange(event, '${id}')"
                />
                <a
                    style="color: #C46316; margin: 0 0 0 10px""
                    href="#"
                    role="button"
                    onclick="handleSubGuestDeleteChange(event, '${ownerId}', '${id}')"
                    >
                    <i class="far fa-lg fa-trash-alt"></i>
                </a>
                 <a
                    id="edit-a-${id}"
                    style="color: #C46316; margin: 0 0 0 10px"
                    role="button"
                    onclick="handleGuestEditChange('${id}')"
                    >
                    <i class="far fa-lg fa-edit"></i>
                </a>
            </div>
            <div class="rounded" style="display: none; padding: 0.5rem 1.5rem; background-color: transparent;" id="edit-div-${id}">
                <form class="d-flex justify-content-center align-items-center" onsubmit="handleGuestChange(event, '${id}')">
                    <input type="text" id="add-input-${id}" class="form-control" value="${name}" />
                    <button type="submit" class="btn btn-info ms-2">Zapisz</button>
                </form>
                ${renderOptions({ id, name, ageGroup })}
              
            </div>
        </div>
    `;

    const renderItem = ({ id, name, present, ageGroup, SubGuests }) => `
        <div class="my-2" >
            <div class="rounded" style="background-color: ${present ? '#b8d8be' : '#fdf5ee'};">
                <div class="rounded list-group-item d-flex align-items-center border-0" style="background-color: transparent;">
                    <div style="flex-grow: 1;">
                        ${renderName({ name, present })}
                        (${renderAgeGroup(ageGroup)})
                    </div>
                    <input
                        class="form-check-input me-2"
                        type="checkbox"
                        value=""
                        ${present ? "checked" : ""}
                        onchange="handleGuestPresentChange(event, '${id}')"
                    />
                    <a
                        style="color: #C46316; margin: 0 0 0 10px""
                        href="#"
                        role="button"
                        onclick="handleGuestDelete(event, '${id}')"
                        >
                        <i class="far fa-lg fa-trash-alt"></i>
                    </a>
                    <a
                        id="edit-a-${id}"
                        style="color: #C46316; margin: 0 0 0 10px"
                        role="button"
                        onclick="handleGuestEditChange('${id}')"
                        >
                        <i class="far fa-lg fa-edit"></i>
                    </a>
                </div>
                <div class="rounded" style="display: ${oppenedEditId == id ? 'block' : 'none'}; padding: 0.5rem 1.5rem; background-color: ${present ? '#b8d8be' : '#fdf5ee'};" id="edit-div-${id}">
                    <form class="d-flex justify-content-center align-items-center" onsubmit="handleGuestChange(event, '${id}')">
                        <input type="text" id="add-input-${id}" class="form-control" value="${name}" />
                        <button type="submit" class="btn btn-info ms-2">Zapisz</button>
                    </form>
                    ${renderOptions({ id, name, ageGroup })}
                    <form class="d-flex justify-content-center align-items-center" onsubmit="handleSubGuestAddChange(event, '${id}')">
                        <select name="guest-selector" id="guest-selector-${id}" class="form-control" multiple>
                            <option value="volvo">Volvo</option>
                            <option value="saab">Saab</option>
                            <option value="mercedes">Mercedes</option>
                            <option value="audi">Audi</option>
                        </select>
                        <button type="submit" class="btn btn-info ms-2">Dodaj os. tow.</button>
                    </form>
                </div>
            </div>
            ${renderSubGuests({ id, SubGuests })}
        </div>
    `;

    const noItems = `
        <li class="list-group-item d-flex align-items-center border-0 mb-2 rounded" style="background-color: #f4f6f7;">
            <span>Jeszcze nie ma żadnych gości</span>
        </li>
    `;

    const refreshList = () => {
        const doRefresh = async () => {
            const statsLabel = document.querySelector("#stats-label");
            const list = document.querySelector("#guest-list");
            const selectorr = document.getElementsByName("guest-selector");

            const resp = await apiFetch("/guests");
            const allGuests = await resp.json();
            const guests = allGuests.filter(guest => guest.ownerId == null || guest.ownerId == guest.id);

            if (guests.length === 0) {
                list.innerHTML = noItems;
                selectorr.forEach((element) => element.innerHTML = "");
            } else {
                list.innerHTML = guests.map(renderItem).join("");
                selectorr
                    .forEach((element) => element.innerHTML =
                        guests
                            .filter(guest => guest.SubGuests.length == 0)
                            .map(renderSelectorItem).join("")
                    );
            }

            const age1Count = allGuests.filter(guest => guest.ageGroup == 1).length;
            const age2Count = allGuests.filter(guest => guest.ageGroup == 2).length;
            const age3Count = allGuests.filter(guest => guest.ageGroup == 3).length;
            const age1Present = allGuests.filter(guest => guest.ageGroup == 1 && guest.present).length;
            const age2Present = allGuests.filter(guest => guest.ageGroup == 2 && guest.present).length;
            const age3Present = allGuests.filter(guest => guest.ageGroup == 3 && guest.present).length;
            statsLabel.innerHTML = `Dorośli: ${age3Present}/${age3Count}<br/>Dzieci (5-10): ${age2Present}/${age2Count}<br/>Dzieci (0-5): ${age1Present}/${age1Count}`;
        };
        doRefresh().catch(err => console.log("Error refreshing list", err));
    };

    const addItem = async () => {
        const input = document.querySelector("#add-input");
        const name = input.value;
        if (!name) return;

        let ageGroup = 3;

        if (document.getElementById('age1').checked == true) {
            ageGroup = 1;
        } else if (document.getElementById('age2').checked == true) {
            ageGroup = 2;
        } else if (document.getElementById('age3').checked == true) {
            ageGroup = 3;
        }

        await apiFetch("/guests", "POST", { name, present: false, ageGroup });

        input.value = "";
        refreshList();
    };

    const handleGuestPresentChange = (ev, id) => {
        const doChange = async () => {
            await apiFetch(`/guests/${id}`, "PATCH", { present: ev.target.checked });

            refreshList();
        }

        doChange().catch(err => console.log("Error changing guest done state", err));
    };
    window.handleGuestPresentChange = handleGuestPresentChange;

    const handleGuestEditChange = (id) => {
        if (oppenedEditId != null && oppenedEditId != id) {
            var oppenedDiv = document.getElementById('edit-div-' + oppenedEditId);
            oppenedDiv.style.display = "none";
        }

        var editDiv = document.getElementById('edit-div-' + id);
        var editIcon = document.getElementById('edit-a-' + id);
        if (editDiv.style.display === "none") {
            editDiv.style.display = "block";
            editIcon.style.color = 'gray';
            oppenedEditId = id;
        } else {
            editDiv.style.display = "none";
            editIcon.style.color = '#C46316';
            oppenedEditId = undefined;
        }
    };
    window.handleGuestEditChange = handleGuestEditChange;

    const handleGuestChange = (ev, id) => {
        const doChange = async () => {
            const input = document.querySelector("#add-input-" + id);
            const name = input.value;

            let ageGroup = 3;

            if (document.getElementById('age1-' + id).checked == true) {
                ageGroup = 1;
            } else if (document.getElementById('age2-' + id).checked == true) {
                ageGroup = 2;
            } else if (document.getElementById('age3-' + id).checked == true) {
                ageGroup = 3;
            }
            await apiFetch(`/guests/${id}`, "PATCH", { name, ageGroup });

            refreshList();
        }
        ev.preventDefault();
        doChange().catch(err => console.log("Error changing guest done state", err));
    };
    window.handleGuestChange = handleGuestChange;

    const handleSubGuestAddChange = (ev, id) => {
        const doChange = async () => {
            const input = document.querySelector("#guest-selector-" + id);
            const ids = Array.from(input.querySelectorAll("option:checked"), e => e.value).map((value) => {
                return { id: value };
            });
            await apiFetch(`/guests/${id}`, "PATCH", {
                SubGuests: {
                    connect: ids
                }
            });

            refreshList();
        }
        ev.preventDefault();
        doChange().catch(err => console.log("Error changing guest done state", err));
    };
    window.handleSubGuestAddChange = handleSubGuestAddChange;

    const handleSubGuestDeleteChange = (ev, ownerId, id) => {
        const doChange = async () => {
            await apiFetch(`/guests/${ownerId}`, "PATCH", {
                SubGuests: {
                    disconnect: [
                        {
                            id: id
                        }
                    ]
                }
            });

            refreshList();
        }
        ev.preventDefault();
        doChange().catch(err => console.log("Error changing guest done state", err));
    };
    window.handleSubGuestDeleteChange = handleSubGuestDeleteChange;

    const form = document.querySelector("#guest-form");
    form.onsubmit = (ev) => {
        ev.preventDefault();
        addItem().catch(err => console.log("Error adding item", err));
    };

    refreshList();
}

const optionsDiv = document.querySelector("#options-form");

optionsDiv.innerHTML = renderOptions({ name: '', ageGroup: 3 });

initGuests();
