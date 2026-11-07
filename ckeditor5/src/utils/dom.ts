export function sanitizeElementContents(domElement: HTMLElement) {
    sanitizeElement(domElement);

    // remove class that makes image plugin embed resizer UI 
    const images : HTMLElement[] = Array.from(domElement.querySelectorAll('figure.image.ck-widget, span.image-inline.ck-widget'));
    for (const image of images) {
        sanitizeElement(image);
    }


    // remove all stateful classes
    ['ck-repeated', 'ck-current', 'ck-symbol', 'ck-widget_selected', 'ck-selected',
    'ck-editor__nested-editable_focused'].map((className) => {
        const statefulUI : Element[] = Array.from(domElement.getElementsByClassName(className));
        for (const widget of statefulUI) {
            widget.classList.remove(className);
        }
    });

    // remove all the unwanted ui that was already there
    const widgets : HTMLElement[] = Array.from(domElement.querySelectorAll('.ck-reset_all'));
    for (const widget of widgets) {
        widget.parentNode.removeChild(widget);
    }
}
export function sanitizeElement(domElement: HTMLElement) {
    if (domElement.classList.contains('ck-widget')) {
        domElement.classList.remove('ck-widget');
    }
}

export function syncElement(
    from: HTMLElement, 
    to: HTMLElement,
    extraClasses = [],
    extraAttributes = {}) {
    if (to.innerHTML != from.innerHTML) {
        to.innerHTML = from.innerHTML
    }
    const f = Array.from(from.attributes);
    const t = Array.from(to.attributes);
    for (const {name, value} of f) {
        if (name == 'class') {
            if (!Array.from(from.classList).every((c) => to.classList.contains(c))
            || !Array.from(to.classList).every((c) => extraClasses.includes(c) || from.classList.contains(c))) {
                to.setAttribute(name, value)
                to.classList.add(...extraClasses);
            }
        } else if (extraAttributes[name] == null && to.getAttribute(name) != value) {
            to.setAttribute(name, value)
        }
    }
    for (const name in extraAttributes) {
        if (to.getAttribute(name) != extraAttributes[name]) {
            to.setAttribute(name, extraAttributes[name])
        }
    }
    for (const {name, value} of t) {
        if (from.getAttribute(name) == null && extraAttributes[name] == null) {
            to.removeAttribute(name);
        }
    }
    sanitizeElementContents(to);
}