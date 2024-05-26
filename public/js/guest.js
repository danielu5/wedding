const urlParams = new URLSearchParams(window.location.search);
const idGuest = urlParams.get('id');


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

initGuest = () => {
    const renderGuests = ({ id, name, present, ageGroup, SubGuests }) => {
        const mainGuest = renderGuestForm({ id, name, present, ageGroup });
        console.log(mainGuest);
        if (SubGuests == null || SubGuests.length === 0) {
            return mainGuest;
        } else {
            return mainGuest + SubGuests.map((guest) => renderGuestForm(guest)).join("");
        }
    };

    const renderGuestForm = ({ id, name, present, ageGroup }) => `
        <div class="rounded" style="background-color: transparent;" id="edit-div-${id}">
            <form class="flex-column justify-content-center align-items-center">
                <input type="text" id="add-input-${id}" class="form-control" value="${name}" />
                <label class="d-flex align-items-center"><input class="form-check-input my-2" type="checkbox" value="" ${present ? "checked" : ""} /> Przybędzie</label>
            </form>
        </div>
    `;

    const refreshGuest = () => {
        const doRefresh = async () => {
            console.log(idGuest);
            const resp = await apiFetch("/guests/" + idGuest);
            const guest = await resp.json();
            document.getElementById("guest-div").innerHTML = renderGuests(guest);
        };
        doRefresh().catch(err => console.log("Error refreshing list", err));
    };

    refreshGuest();
}

initGuest();