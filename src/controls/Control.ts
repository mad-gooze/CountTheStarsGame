/**
 * Represents Game UI Control.
 */
export default class Control {
    protected _node: HTMLElement;
    protected _hiddenClass: string;

    /** Expose node's addEventListener. */
    addEventListener: HTMLElement['addEventListener'];

    constructor(node: HTMLElement) {
        this._node = node;

        this.addEventListener = this._node.addEventListener.bind(this._node);
        this._hiddenClass = 'control_hidden';
    }

    /** Show control. */
    show(): void {
        this._node.classList.remove(this._hiddenClass);
    }

    /** Hide control. */
    hide(): void {
        this._node.classList.add(this._hiddenClass);
    }

    /** Add Control to specified parent. */
    addToDOM(parent: HTMLElement): void {
        parent.appendChild(this._node);
    }

    /** Remove Control from DOM. */
    remove(): void {
        this._node.remove();
    }
}
