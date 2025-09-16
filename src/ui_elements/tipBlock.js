export class TipBlock extends HTMLElement {
    connectedCallback() {
        const text = this.innerHTML;
        this.innerHTML = `<div class="bg-slate-900/50 text-gray-100 p-2.5 border-l-2 border-yellow-400 rounded">💡 <strong>Tip:</strong> ${text}</div>`;
    }
}