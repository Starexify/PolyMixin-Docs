export class DocLink extends HTMLElement {
    connectedCallback() {
        const href = this.getAttribute("href");
        const text = this.innerHTML.trim();
        const noTarget = this.hasAttribute("target-off");
        this.innerHTML = `
            <a href="${href}" ${noTarget ? '' : 'target="_blank" rel="noopener noreferrer"'} class="text-blue-500 hover:text-blue-400 transition-colors">
                <span class="hover:underline">${text}</span><span class="select-none"> ↗</span>
            </a>
        `;
    }
}