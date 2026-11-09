/*
 * Builder embed runtime.
 *
 *   <script src="https://builder.gufamily.org/embed.js" async></script>
 *   <builder-component component="4"></builder-component>
 *
 * Renders the latest published version of a component inside a shadow root, so
 * the host page's CSS can't change it and its CSS can't leak out. Optional
 * attributes: variant="Name or id" picks a variant (default: the first one),
 * id="4" works in place of component, but component avoids duplicate ids on a page,
 * and preview (on the Builder site only) shows a visitor's own sandbox publish,
 * origin="https://…" reads from another Builder deployment.
 *
 * State: the element reflects its lifecycle as data-state="loading" | "ready" |
 * "error" (and aria-busy while loading), so pages can style a placeholder, e.g.
 *   builder-component[data-state="loading"] { min-height: 320px; }
 * and scripts or agents can wait for it. Events: builder:load, builder:error.
 *
 * Data bindings follow the builder's editor preview:
 *   data-path-scope="0.store.books.*"   repeat the element once per item
 *   data-path="0.store.books.*.title"   fill the element (or <var>) with a value
 *   data-path-src / data-path-href      set an image's src or a link's href
 *   data-path-hidden                    hide the element when the value is truthy
 */
(function () {
    "use strict";

    var TAG = "builder-component";
    if (!window.customElements || window.customElements.get(TAG)) return;

    var currentScript = document.currentScript;
    var DEFAULT_ORIGIN = currentScript && currentScript.src
        ? new URL(currentScript.src, location.href).origin
        : location.origin;

    // ---------------------------------------------------------------- loading

    var requests = {};
    function loadComponent(origin, id, preview) {
        var key = origin + "|" + id + (preview ? "|preview" : "");
        if (!requests[key]) {
            requests[key] = fetch(origin + "/api/components/" + encodeURIComponent(id) + (preview ? "?preview=1" : ""), {cache: preview ? "no-store" : "default"})
                .then(function (res) {
                    return res.json().catch(function () { return {}; }).then(function (body) {
                        if (!res.ok) throw new Error(body.error || "Request failed (" + res.status + ")");
                        return body;
                    });
                });
            // Allow a retry after a failure.
            requests[key].catch(function () { delete requests[key]; });
        }
        return requests[key];
    }

    function loadLiveData(origin, id, published) {
        if (!published.liveDatasourceIds || !published.liveDatasourceIds.length) return Promise.resolve({});
        return fetch(origin + "/api/components/" + encodeURIComponent(id) + "/data", {mode: "cors", cache: "no-store"})
            .then(function (res) { return res.ok ? res.json() : {}; })
            .then(function (result) { return result.data || {}; })
            .catch(function () { return {}; });
    }

    var fontsAdded = {};
    // Fonts declared inside a shadow root aren't reliably applied, so they go on the page.
    function addFonts(urls) {
        (urls || []).forEach(function (url) {
            if (fontsAdded[url] || !/^https:\/\//.test(url)) return;
            fontsAdded[url] = true;
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
        });
    }

    // ---------------------------------------------------------------- data paths

    function cleanCollectionBit(path) {
        return path.replace(/(\[[^\][]+\]|\.\*)$/g, "");
    }
    function scopeKey(path) {
        return cleanCollectionBit(path) + ".*";
    }

    // A small subset of JSONPath: dot-separated keys, "*" for every item, [n] indexes.
    function query(json, path) {
        var segments = String(path).replace(/\[(\w+|\*)\]/g, ".$1").split(".").filter(Boolean);
        var current = [json];
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i], next = [];
            for (var j = 0; j < current.length; j++) {
                var value = current[j];
                if (value == null) continue;
                if (seg === "*") {
                    if (Array.isArray(value)) next.push.apply(next, value);
                    else if (typeof value === "object") next.push.apply(next, Object.keys(value).map(function (k) { return value[k]; }));
                } else if (Object.prototype.hasOwnProperty.call(Object(value), seg) || (seg === "length" && value.length != null)) {
                    next.push(value[seg]);
                }
            }
            current = next;
        }
        return current;
    }

    // Resolve a path against the closest enclosing scope (the current repeated item),
    // falling back to the data sources themselves.
    function resolve(scopes, datapath, single) {
        var json = null, path = datapath;
        var keys = Object.keys(scopes).sort(function (a, b) { return b.length - a.length; });
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (k === datapath) {
                if (single) return scopes[k];
                continue;
            }
            if (datapath.indexOf(k + ".") === 0) {
                path = datapath.substring(k.length + 1);
                json = scopes[k];
                break;
            }
        }
        if (json === null) return single ? undefined : [];
        var results = query(json, path);
        return single ? results[0] : results;
    }

    // ---------------------------------------------------------------- safety

    var BLOCKED_TAGS = "script,style,iframe,object,embed,link,meta,base,form";
    function safeUrl(value) {
        var url = String(value).trim();
        return /^(https?:|mailto:|tel:|\/|#|\.)/i.test(url) || !/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : null;
    }
    // HTML coming from data is trusted content authored in Builder, but it still goes
    // into someone else's page, so strip anything that could run code.
    function sanitize(root) {
        root.querySelectorAll(BLOCKED_TAGS).forEach(function (el) { el.remove(); });
        root.querySelectorAll("*").forEach(function (el) {
            Array.prototype.slice.call(el.attributes).forEach(function (attr) {
                var name = attr.name.toLowerCase();
                if (name.indexOf("on") === 0) el.removeAttribute(attr.name);
                else if ((name === "href" || name === "src" || name === "xlink:href") && safeUrl(attr.value) === null) el.removeAttribute(attr.name);
            });
        });
        return root;
    }
    function setHTML(target, value) {
        var template = document.createElement("template");
        template.innerHTML = value == null ? "" : String(value);
        sanitize(template.content);
        target.replaceChildren(template.content);
    }

    // ---------------------------------------------------------------- rendering

    function applyBindings(el, scopes) {
        var path;
        if ((path = el.getAttribute("data-path")) !== null) {
            setHTML(el, resolve(scopes, path, true));
        }
        if ((path = el.getAttribute("data-path-src")) !== null) {
            var media = el.matches("img, video") ? el : el.querySelector("img, video");
            var src = resolve(scopes, path, true);
            if (media && src != null && safeUrl(src) !== null) media.setAttribute("src", String(src));
        }
        if ((path = el.getAttribute("data-path-href")) !== null) {
            var link = el.matches("a") ? el : (el.querySelector("a") || el.closest("a"));
            var href = resolve(scopes, path, true);
            if (link && href != null && safeUrl(href) !== null) link.setAttribute("href", String(href));
        }
        if ((path = el.getAttribute("data-path-hidden")) !== null) {
            if (resolve(scopes, path, true)) el.setAttribute("hidden", "");
            else el.removeAttribute("hidden");
        }
        Array.prototype.slice.call(el.children).forEach(function (child) { populate(child, scopes); });
    }

    function populate(el, scopes) {
        var scopePath = el.getAttribute("data-path-scope");
        if (scopePath === null) {
            applyBindings(el, scopes);
            return;
        }
        // Repeat: one copy of the original element per item, each with its own scope.
        var items = resolve(scopes, scopePath, false) || [];
        var template = el.cloneNode(true);
        template.removeAttribute("data-path-scope");
        var key = scopeKey(scopePath);
        var anchor = el;
        items.forEach(function (item) {
            var copy = template.cloneNode(true);
            var itemScopes = Object.assign({}, scopes);
            itemScopes[key] = item;
            anchor.after(copy);
            anchor = copy;
            applyBindings(copy, itemScopes);
        });
        el.remove();
    }

    function render(published, variantName, origin, liveData) {
        var variants = published.variants || [];
        var variant = variants.find(function (v) { return v.name === variantName || v.id === variantName; }) || variants[0];
        var root = document.createElement("div");
        root.className = "builder-root";
        root.setAttribute("part", "root");
        if (!variant) return root;

        var template = document.createElement("template");
        template.innerHTML = variant.html;
        sanitize(template.content);
        root.appendChild(template.content);

        var scopes = Object.assign({}, published.data || {}, liveData || {});
        Array.prototype.slice.call(root.children).forEach(function (child) { populate(child, scopes); });

        // Site-relative images (e.g. /marketing/logo.svg) live on the Builder site,
        // not on the page that embeds the component.
        root.querySelectorAll('img[src^="/"]:not([src^="//"])').forEach(function (img) {
            img.setAttribute("src", origin + img.getAttribute("src"));
        });

        // Leave clean markup behind.
        root.querySelectorAll("[data-path], [data-path-src], [data-path-href], [data-path-hidden], [data-path-placeholder]").forEach(function (el) {
            ["data-path", "data-path-src", "data-path-href", "data-path-hidden", "data-path-placeholder"].forEach(function (a) { el.removeAttribute(a); });
        });
        return root;
    }

    // ---------------------------------------------------------------- element

    var BuilderComponent = function () {
        return Reflect.construct(HTMLElement, [], BuilderComponent);
    };
    BuilderComponent.prototype = Object.create(HTMLElement.prototype);
    BuilderComponent.prototype.constructor = BuilderComponent;
    Object.setPrototypeOf(BuilderComponent, HTMLElement);

    Object.defineProperty(BuilderComponent, "observedAttributes", {
        get: function () { return ["component", "id", "variant", "origin", "preview"]; },
    });

    BuilderComponent.prototype.connectedCallback = function () {
        if (!this.shadowRoot) this.attachShadow({mode: "open"});
        if (!this.style.display) this.style.display = "block";
        this._render();
    };
    BuilderComponent.prototype.attributeChangedCallback = function () {
        if (this.shadowRoot) this._render();
    };
    BuilderComponent.prototype._render = function () {
        var self = this;
        var id = this.getAttribute("component") || this.getAttribute("id");
        var origin = this.getAttribute("origin") || DEFAULT_ORIGIN;
        var token = {};
        this._token = token;
        if (!id) {
            this._showError("Add a component attribute, e.g. <builder-component component=\"4\">.");
            return;
        }
        this._setState("loading");
        loadComponent(origin, id, this.hasAttribute("preview")).then(function (published) {
            return loadLiveData(origin, id, published).then(function (liveData) {
            if (self._token !== token) return;
            addFonts(published.fontUrls);
            var style = document.createElement("style");
            style.textContent = published.css || "";
            self.shadowRoot.replaceChildren(style, render(published, self.getAttribute("variant"), origin, liveData));
            self._setState("ready");
            self.dispatchEvent(new CustomEvent("builder:load", {detail: {id: id, version: published.version}}));
            });
        }).catch(function (error) {
            if (self._token !== token) return;
            self._showError("Couldn't load component " + id + ": " + error.message);
        });
    };
    // loading ──▶ ready | error; an attribute change starts loading again.
    BuilderComponent.prototype._setState = function (state) {
        this.setAttribute("data-state", state);
        if (state === "loading") this.setAttribute("aria-busy", "true");
        else this.removeAttribute("aria-busy");
    };
    Object.defineProperty(BuilderComponent.prototype, "state", {
        get: function () { return this.getAttribute("data-state") || "loading"; },
    });
    BuilderComponent.prototype._showError = function (message) {
        this._setState("error");
        console.warn("[builder] " + message);
        var note = document.createElement("div");
        note.textContent = message;
        note.setAttribute("style", "font: 13px/1.4 system-ui, sans-serif; color: #9b2c2c; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 8px 12px;");
        this.shadowRoot.replaceChildren(note);
        this.dispatchEvent(new CustomEvent("builder:error", {detail: {message: message}}));
    };

    window.customElements.define(TAG, BuilderComponent);
    window.BuilderEmbed = {version: "1.0.0", origin: DEFAULT_ORIGIN};
})();
