export class NoteBlock extends HTMLElement {
    connectedCallback() {
        const text = this.innerHTML;
        const note = this.getAttribute("text") || "Note";
        this.innerHTML = `
            <div class="bg-slate-900/50 text-gray-100 p-2.5 border-l-2 border-blue-400 rounded">
                <strong>${note}:</strong> ${text}
            </div>`;
    }
}
