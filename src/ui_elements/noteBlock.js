export class NoteBlock extends HTMLElement {
    connectedCallback() {
        const text = this.innerHTML;
        const note = this.getAttribute("text") || "Note";
        this.innerHTML = `<note class="bg-slate-900 text-gray-100 p-2.5 border-l-2 rounded"><strong>${note}:</strong> ${text}</note>`;
    }
}