const apiFetch = async (url, method, body) => {
    method = method || "GET";
    const opts = { method };
    if (body) {
        opts.headers = {
            "Content-Type": "application/json",
        };
        opts.body = JSON.stringify(body);
    }

    const resp = await fetch(url, opts);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Error from API: ${resp.statusText}: ${text}`);
    }
    return resp;
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
        return `<u>${name}</u>`;
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
                return '>11';
            }
            default: {
                return '~';
            }
        }
    };
    const renderItem = ({ id, name, present, ageGroup }) => `
        <li class="list-group-item d-flex align-items-center border-0 mb-2 rounded" style="background-color: #f4f6f7;">
            <div style="flex-grow: 1;">
                ${renderName({ name, present })}
                (${renderAgeGroup(ageGroup)})
            </div>
            <input
                class="form-check-input me-2"
                type="checkbox"
                value=""
                ${present ? "checked" : ""}
                onchange="handleGuestChange(event, '${id}')"
            />
            <a
                style="color: gray; margin: 0 0 0 10px""
                href="#"
                role="button"
                onclick="handleGuestDelete(event, '${id}')"
                >
                <i class="far fa-lg fa-trash-alt"></i>
            </a>
             <a
                style="color: gray; margin: 0 0 0 10px"
                href="/guests/guests.html?id=${id}"
                role="button"
                >
                <i class="far fa-lg fa-edit"></i>
            </a>
        </li>
    `;
    const noItems = `
        <li class="list-group-item d-flex align-items-center border-0 mb-2 rounded" style="background-color: #f4f6f7;">
            <span>Jeszcze nie ma żadnych gości</span>
        </li>
    `;

    const refreshList = () => {
        const doRefresh = async () => {
            const list = document.querySelector("#guest-list");

            const resp = await apiFetch("/guests");
            const guests = await resp.json();
            if (guests.length === 0) {
                list.innerHTML = noItems;
            } else {
                list.innerHTML = guests.map(renderItem).join("");
            }
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

    const handleGuestChange = (ev, id) => {
        const doChange = async () => {
            await apiFetch(`/guests/${id}`, "PATCH", { present: ev.target.checked });

            refreshList();
        }

        doChange().catch(err => console.log("Error changing guest done state", err));
    };
    window.handleGuestChange = handleGuestChange;

    const form = document.querySelector("#guest-form");
    form.onsubmit = (ev) => {
        ev.preventDefault();
        addItem().catch(err => console.log("Error adding item", err));
    };


    refreshList();
}

initGuests();
