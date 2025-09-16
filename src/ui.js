import {CodeField} from "./ui_elements/field.js";
import {CodeBlock} from "./ui_elements/codeBlock.js";
import {TipBlock} from "./ui_elements/tipBlock.js";
import {DocLink} from "./ui_elements/docLink.js";
import {NoteBlock} from "./ui_elements/noteBlock.js";

window.customElements.define('tip-block', TipBlock);
window.customElements.define('note-block', NoteBlock);
window.customElements.define('code-field', CodeField);
window.customElements.define('code-block', CodeBlock);
window.customElements.define('doc-link', DocLink);
