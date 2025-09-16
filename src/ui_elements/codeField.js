export class CodeField extends HTMLElement {
    connectedCallback() {
        const text = this.innerText;
        this.innerHTML = `<code class="bg-slate-900 text-gray-100 p-1 rounded">${text}</code>`;
    }
}