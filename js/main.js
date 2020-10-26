'use strict';

window.addEventListener("dragover", (event) => {
    event.preventDefault();
});

window.addEventListener("drop", (event) => {
    event.preventDefault();
});

var files = [];

const section = document.getElementById("attachments");
section.addEventListener("drop", (event) => {
    event.preventDefault();
    section.style.cursor = "pointer";
    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
            const file = items[i].getAsFile();
            addFileDetails(file);
        }
    }
});

var input = null;
section.addEventListener("click", (event) => {
    if (event.target.classList.contains("close")) return;
    if (input == null) {
        input = document.createElement("input");
        input.type = "file";
        input.style.display = "none";

        input.addEventListener("change", (event) => {
            const file = input.files[0];
            addFileDetails(file);
        });
    }
    input.click();
});

function addFileDetails(file) {
    if (files.length < 10) {
        let mbs = 0;
        files.forEach((singleFile) => {
            mbs +=  singleFile.size;
        })
        mbs += file.size;
        mbs /= 1000000;
        if (mbs <= 10) {
            let fileReader = new FileReader();
            fileReader.addEventListener("load", (event) => {
                const base64 = fileReader.result.split(",");
                files.push({name: file.name, type: file.type, size: file.size, content: base64[1]});
                updateAttachments();
            });
            fileReader.readAsDataURL(file);
        } else {
            showError("Liitetiedosto on liian suuri tai liitteiden yhteenlaskettu koko ylittää 10 Mt.");
        }
    } else {
        showError("Liitteitä voi olla enintään 10.");
    }
}

function updateAttachments() {
    section.innerHTML = "";
    if (files.length > 0) {
        files.forEach((file) => {
            const div = document.createElement("div");
            div.className = "attachment";
            div.innerText = file.name;
            
            const span = document.createElement("span");
            span.className = "close";
            span.innerHTML = "&times;";
            span.addEventListener("click", removeAttachment);
            div.appendChild(span);

            section.appendChild(div);
        });
    } else {
        section.innerText = "Pudota liitetiedostot tähän.";
    }
}

function removeAttachment(event) {
    const closables = section.getElementsByClassName("close");
    for (let i = 0; i < closables.length; i++) {
        if (event.target == closables[i]) {
            files.splice(i, 1);
            break;
        }
    }
    updateAttachments();
}

const messageForm = document.getElementById("messageForm");
messageForm.addEventListener("submit", (event) => {
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            let tiedostoNimi = document.createElement("input");
            tiedostoNimi.type = "hidden";
            tiedostoNimi.name = "TiedostoNimi_" + (i + 1);
            tiedostoNimi.value = files[i].name;
            messageForm.appendChild(tiedostoNimi);
            
            let tiedostoSisalto = document.createElement("input");
            tiedostoSisalto.type = "hidden";
            tiedostoSisalto.name = "TiedostoSisalto_" + (i + 1);
            tiedostoSisalto.value = files[i].content;
            messageForm.appendChild(tiedostoSisalto);

            const tiedostoMuoto = document.createElement("input");
            tiedostoMuoto.type = "hidden";
            tiedostoMuoto.name = "TiedostoMuoto_" + (i + 1);
            tiedostoMuoto.value = files[i].type;
            messageForm.appendChild(tiedostoMuoto)

            const tiedostoPiilotettu = document.createElement("input");
            tiedostoPiilotettu.type = "hidden";
            tiedostoPiilotettu.name = "TiedostoPiilotettu_" + (i + 1);
            tiedostoPiilotettu.value = "0";
            messageForm.appendChild(tiedostoPiilotettu);
        }
    } else {
        event.preventDefault();
        showError("Lisää vähintään yksi liite.");
    }
});

function showError(message) {
    $("#error").text(message).fadeIn().delay(3000).fadeOut();
}