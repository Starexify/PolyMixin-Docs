export class NoteBlock extends HTMLElement {
    connectedCallback() {
        const text = this.innerHTML;
        this.innerHTML = `<note class="bg-slate-900 text-gray-100 p-2.5 border-l-2 rounded"><strong>Note:</strong> ${text}</note>`;
    }
}