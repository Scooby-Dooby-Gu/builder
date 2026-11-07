export {}

declare global {
    interface Window {
        WebFont: any;
    }
}

window.WebFont = window.WebFont || {};