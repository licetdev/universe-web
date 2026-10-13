
"use strict";

/* ============================================================
   SIMULACIONWEB — UNIVERSO 3D
   Navegación, catálogo, modelos GLTF, cámara, misión y sonido.
============================================================ */

const THREE_VERSION = "0.170.0";
const MODEL_BASE = new URL("../src/models/", import.meta.url).href;
const MODULE_TIMEOUT = 15000;
const MODEL_TIMEOUT = 30000;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

const app = {
    selectedId: "sol",
    missionIndex: 0,
    autoRotate: true,
    soundEnabled: false,
    soundVolume: 0.16,
    ambientAudio: null,
    viewers: [],
    initialized: false,
    toastTimer: null
};

/* ============================================================
   1. CATÁLOGO DE OBJETOS
   folder debe coincidir exactamente con el nombre de la carpeta.
============================================================ */

const objects = [
    {
        id: "sol",
        name: "El Sol",
        type: "Estrella",
        folder: "sol",
        color: 0xffad43,
        subtitle: "La estrella de nuestro sistema solar",
        facts: [
            ["Tipo", "Enana amarilla"],
            ["Diámetro", "1.392.700 km"],
            ["Edad", "≈ 4.600 millones de años"],
            ["Temperatura", "≈ 5.500 °C en superficie"]
        ],
        description:
            "El Sol es la estrella central del sistema solar. Su gravedad mantiene los planetas en órbita y su energía es fundamental para el clima y la vida en la Tierra."
    },
    {
        id: "mercurio",
        name: "Mercurio",
        type: "Planeta rocoso",
        folder: "mercurio_v1.1",
        color: 0xb9aaa0,
        subtitle: "El planeta más cercano al Sol",
        facts: [
            ["Tipo", "Planeta terrestre"],
            ["Diámetro", "4.879 km"],
            ["Año", "88 días terrestres"],
            ["Satélites", "Ninguno"]
        ],
        description:
            "Mercurio es el planeta más pequeño y el más cercano al Sol. Su superficie rocosa está cubierta de cráteres y experimenta grandes contrastes de temperatura."
    },
    {
        id: "venus",
        name: "Venus",
        type: "Planeta rocoso",
        folder: "venus_v1.1",
        color: 0xe4a86e,
        subtitle: "Un mundo de nubes y volcanes",
        facts: [
            ["Tipo", "Planeta terrestre"],
            ["Diámetro", "12.104 km"],
            ["Año", "224,7 días terrestres"],
            ["Satélites", "Ninguno"]
        ],
        description:
            "Venus posee una atmósfera muy densa, compuesta principalmente de dióxido de carbono, y una superficie extremadamente caliente."
    },
    {
        id: "tierra",
        name: "La Tierra",
        type: "Planeta rocoso",
        folder: "tierra_v1.1",
        color: 0x398cff,
        subtitle: "Nuestro hogar en el cosmos",
        facts: [
            ["Tipo", "Planeta terrestre"],
            ["Diámetro", "12.742 km"],
            ["Año", "365,25 días"],
            ["Satélite", "La Luna"]
        ],
        description:
            "La Tierra es el tercer planeta desde el Sol. Su atmósfera, agua líquida y condiciones ambientales permiten una extraordinaria diversidad de vida."
    },
    {
        id: "luna",
        name: "La Luna",
        type: "Satélite natural",
        folder: "la_luna__viaje_virtual_guiado__3d___vr",
        color: 0xcbd4e4,
        subtitle: "El satélite natural de la Tierra",
        facts: [
            ["Distancia media", "≈ 384.400 km"],
            ["Diámetro", "≈ 3.475 km"],
            ["Órbita", "27,3 días"],
            ["Superficie", "Cráteres y antiguos mares"]
        ],
        description:
            "La Luna es el único satélite natural de la Tierra. Su superficie conserva cráteres de impacto y grandes llanuras basálticas, y su gravedad contribuye a las mareas terrestres."
    },
    {
        id: "marte",
        name: "Marte",
        type: "Planeta rocoso",
        folder: "marte_v1.1",
        color: 0xe46f4a,
        subtitle: "El planeta rojo",
        facts: [
            ["Tipo", "Planeta terrestre"],
            ["Diámetro", "6.779 km"],
            ["Año", "687 días terrestres"],
            ["Satélites", "Fobos y Deimos"]
        ],
        description:
            "Marte presenta una superficie rica en óxidos de hierro, volcanes gigantes y cañones. Su geología conserva indicios de ambientes antiguos con presencia de agua."
    },
    {
        id: "jupiter",
        name: "Júpiter",
        type: "Gigante gaseoso",
        folder: "jupiter",
        color: 0xd6a77b,
        subtitle: "El gigante del sistema solar",
        facts: [
            ["Tipo", "Gigante gaseoso"],
            ["Diámetro", "139.820 km"],
            ["Año", "11,86 años terrestres"],
            ["Característica", "Gran Mancha Roja"]
        ],
        description:
            "Júpiter es el planeta más grande del sistema solar. Su atmósfera posee bandas de nubes, grandes tormentas y un sistema numeroso de satélites."
    },
    {
        id: "saturno",
        name: "Saturno",
        type: "Gigante gaseoso",
        folder: "saturno",
        color: 0xe7ca92,
        subtitle: "El mundo de los anillos",
        facts: [
            ["Tipo", "Gigante gaseoso"],
            ["Diámetro", "116.460 km"],
            ["Año", "29,4 años terrestres"],
            ["Característica", "Sistema de anillos"]
        ],
        description:
            "Saturno destaca por su espectacular sistema de anillos, formado principalmente por fragmentos de hielo, roca y polvo que orbitan alrededor del planeta."
    },
    {
        id: "urano",
        name: "Urano",
        type: "Gigante helado",
        folder: "urano",
        color: 0x77d5dc,
        subtitle: "El gigante de tono azul verdoso",
        facts: [
            ["Tipo", "Gigante helado"],
            ["Diámetro", "≈ 50.724 km"],
            ["Año", "≈ 84 años terrestres"],
            ["Satélites", "27 conocidos"]
        ],
        description:
            "Urano es un gigante helado cuya atmósfera contiene metano. Su eje de rotación está muy inclinado, por lo que parece girar de lado alrededor del Sol."
    },
    {
        id: "neptuno",
        name: "Neptuno",
        type: "Gigante helado",
        folder: "neptuno",
        color: 0x477cff,
        subtitle: "El planeta de los vientos extremos",
        facts: [
            ["Tipo", "Gigante helado"],
            ["Diámetro", "≈ 49.244 km"],
            ["Año", "≈ 165 años terrestres"],
            ["Satélites", "16 conocidos"]
        ],
        description:
            "Neptuno es el planeta más lejano del Sol. Es un gigante helado de color azul intenso donde se han observado algunos de los vientos más rápidos del sistema solar."
    },
    {
        id: "pluton",
        name: "Plutón",
        type: "Planeta enano",
        folder: "pluton",
        color: 0xc9a58c,
        subtitle: "Un pequeño mundo del cinturón de Kuiper",
        facts: [
            ["Tipo", "Planeta enano"],
            ["Diámetro", "≈ 2.377 km"],
            ["Año", "≈ 248 años terrestres"],
            ["Satélites", "5 conocidos"]
        ],
        description:
            "Plutón es un planeta enano del cinturón de Kuiper. Este mundo helado tiene una superficie compleja y comparte su órbita con numerosos objetos transneptunianos."
    },
    {
        id: "andromeda",
        name: "Andrómeda",
        type: "Galaxia",
        folder: "andromeda",
        color: 0xa18cff,
        subtitle: "Una galaxia vecina de la Vía Láctea",
        facts: [
            ["Tipo", "Galaxia espiral"],
            ["Distancia", "≈ 2,5 millones de años luz"],
            ["Grupo", "Grupo Local"],
            ["Característica", "Estructura espiral"]
        ],
        description:
            "Andrómeda es una galaxia espiral cercana a la Vía Láctea. Su estructura permite estudiar poblaciones estelares y la evolución de las galaxias."
    },
    {
        id: "need-some-space",
        name: "Galaxia de Bode",
        type: "Galaxia",
        folder: "need_some_space",
        color: 0x9cbcff,
        subtitle: "M81 · una espiral de gran diseño en la Osa Mayor",
        facts: [
            ["Catálogo", "M81 · NGC 3031"],
            ["Tipo", "Espiral de gran diseño"],
            ["Distancia", "≈ 12 millones de años luz"],
            ["Constelación", "Osa Mayor"]
        ],
        description:
            "La Galaxia de Bode (M81) es una galaxia espiral de gran diseño situada a unos 12 millones de años luz, en la constelación de la Osa Mayor. Johann Elert Bode la descubrió en 1774. Forma parte del Grupo de M81 y su vecina M82 muestra señales de interacción gravitatoria con este grupo. El modelo 3D de esta página es una representación artística, no una reconstrucción científica de M81."
    }
];

const creatorCollections = {
    william: objects.filter(object =>
        object.type === "Planeta rocoso" ||
        object.type === "Gigante gaseoso" ||
        object.type === "Gigante helado" ||
        object.type === "Planeta enano"
    ),
    licet: objects.filter(object => object.type === "Galaxia")
};

/* ============================================================
   2. ETAPAS DE LA MISIÓN
============================================================ */

const missions = [
    {
        title: "Despegue terrestre",
        location: "La Tierra",
        object: "tierra",
        description:
            "La expedición comienza en nuestro planeta. Observa nuestro hogar antes de iniciar el recorrido por el sistema solar."
    },
    {
        title: "El planeta rojo",
        location: "Marte",
        object: "marte",
        description:
            "Explora un mundo desértico con volcanes gigantes, cañones y señales geológicas de antiguos entornos acuosos."
    },
    {
        title: "El gigante gaseoso",
        location: "Júpiter",
        object: "jupiter",
        description:
            "Acércate al planeta más grande del sistema solar y observa sus bandas atmosféricas y sus enormes tormentas."
    },
    {
        title: "El reino de los anillos",
        location: "Saturno",
        object: "saturno",
        description:
            "Descubre los anillos de Saturno y explora uno de los mundos más reconocibles de nuestro vecindario cósmico."
    },
    {
        title: "Horizontes galácticos",
        location: "Andrómeda",
        object: "andromeda",
        description:
            "Viaja conceptualmente más allá de nuestro sistema solar y contempla una galaxia espiral cercana."
    },
    {
        title: "Regreso a la estrella",
        location: "El Sol",
        object: "sol",
        description:
            "La expedición termina en nuestra estrella. Puedes continuar la exploración seleccionando cualquier objeto del atlas."
    }
];

/* ============================================================
   3. UTILIDADES
============================================================ */

function getObject(id) {
    return objects.find(object => object.id === id);
}

function modelURL(object) {
    return new URL(`${object.folder}/scene.gltf`, MODEL_BASE).href;
}

function withTimeout(promise, timeout, message) {
    let timeoutId;

    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(message)), timeout);
        })
    ]).finally(() => clearTimeout(timeoutId));
}

function setText(selector, value) {
    const element = $(selector);
    if (element) element.textContent = value;
}

function notify(message) {
    const toast = $("#toast");

    if (!toast) {
        console.info("[UNIVERSO]", message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(app.toastTimer);

    app.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

function setViewerStatus(message, container) {
    if (container.id === "space-canvas") {
        setText("#viewer-status", message);
    }

    const status = container
        .closest(".viewer-frame")
        ?.querySelector(".viewer-status");

    if (status) {
        status.textContent = message;
    }
}

/* ============================================================
   4. NAVEGACIÓN ENTRE APARTADOS
============================================================ */

function showView(name) {
    const validViews = [
        "inicio",
        "atlas",
        "william",
        "licet",
        "mision",
        "explorar"
    ];

    if (!validViews.includes(name)) {
        name = "inicio";
    }

    const scopedObjects = creatorCollections[name];

    if (
        scopedObjects &&
        !scopedObjects.some(object => object.id === app.selectedId)
    ) {
        app.selectedId = scopedObjects[0].id;
        renderObjectDetails(scopedObjects[0]);
        renderCreatorDetails(scopedObjects[0], name);
    }

    $$(".page-section").forEach(section => {
        section.hidden = section.id !== `view-${name}`;
    });

    $$(".nav-link").forEach(button => {
        const active = button.dataset.view === name;

        button.classList.toggle("active", active);
        button.setAttribute("aria-current", active ? "page" : "false");
    });

    const navigation = $(".navigation");
    const menuButton = $("#menu-toggle");

    if (navigation) navigation.classList.remove("open");

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
    }

    if (location.hash !== `#${name}`) {
        history.replaceState(null, "", `#${name}`);
    }

    /*
     * Algunos visores estaban ocultos y tenían tamaño cero.
     * Al abrir el apartado, recalculamos sus dimensiones.
     */
    requestAnimationFrame(() => {
        app.viewers.forEach(viewer => {
            const section = viewer.container.closest(".page-section");

            if (section?.hidden === false) {
                viewer.resize();

                const object = getObject(viewer.fixedObjectId || app.selectedId);

                if (object && viewer.currentId !== object.id) {
                    viewer.showObject(object);
                }
            }
        });
    });
}

function setupNavigation() {
    $$(".nav-link[data-view]").forEach(button => {
        button.addEventListener("click", () => {
            showView(button.dataset.view);
        });
    });

    $$("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            showView(button.dataset.go);
        });
    });

    const menuButton = $("#menu-toggle");
    const navigation = $(".navigation");

    if (menuButton && navigation) {
        menuButton.addEventListener("click", () => {
            const open = navigation.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const initialView = location.hash.slice(1);

    showView(
        ["inicio", "atlas", "william", "licet", "mision", "explorar"].includes(initialView)
            ? initialView
            : "inicio"
    );
}

/* ============================================================
   5. ATLAS: LISTA DE OBJETOS Y DATOS
============================================================ */

function renderObjectList() {
    const list = $("#object-list");

    if (!list) {
        console.warn("[ATLAS] No existe #object-list en el HTML.");
        return;
    }

    list.replaceChildren();

    objects.forEach(object => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "object-card";
        button.dataset.objectId = object.id;
        button.setAttribute("aria-pressed", "false");

        const dot = document.createElement("span");
        dot.className = "object-card-dot";
        dot.style.backgroundColor =
            `#${object.color.toString(16).padStart(6, "0")}`;

        const name = document.createElement("span");
        name.className = "object-card-name";
        name.textContent = object.name;

        const type = document.createElement("span");
        type.className = "object-card-type";
        type.textContent = object.type;

        button.append(dot, name, type);

        button.addEventListener("click", () => {
            selectObject(object.id);
        });

        list.appendChild(button);
    });

    setText("#object-count", String(objects.length));
}

function renderObjectDetails(object) {
    setText("#object-name", object.name);
    setText("#object-type", object.type.toUpperCase());
    setText("#object-subtitle", object.subtitle);
    setText("#object-description", object.description);

    const factsContainer = $("#object-facts");

    if (factsContainer) {
        factsContainer.replaceChildren();

        object.facts.forEach(([label, value]) => {
            const fact = document.createElement("div");
            fact.className = "object-fact";

            const title = document.createElement("span");
            title.className = "object-fact-label";
            title.textContent = label;

            const content = document.createElement("strong");
            content.className = "object-fact-value";
            content.textContent = value;

            fact.append(title, content);
            factsContainer.appendChild(fact);
        });
    }

    $$(".object-card").forEach(button => {
        const active = button.dataset.objectId === object.id;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    const select = $("#free-object-select");

    if (select) {
        select.value = object.id;
    }
}

function renderCreatorDetails(object, creator) {
    setText(`#${creator}-type`, object.type.toUpperCase());
    setText(`#${creator}-name`, object.name);
    setText(`#${creator}-subtitle`, object.subtitle);
    setText(`#${creator}-description`, object.description);

    const factsContainer = $(`#${creator}-facts`);

    if (!factsContainer) return;

    factsContainer.replaceChildren();

    object.facts.forEach(([label, value]) => {
        const fact = document.createElement("div");
        fact.className = "object-fact";

        const title = document.createElement("span");
        title.className = "object-fact-label";
        title.textContent = label;

        const content = document.createElement("strong");
        content.className = "object-fact-value";
        content.textContent = value;

        fact.append(title, content);
        factsContainer.appendChild(fact);
    });
}

function renderCreatorObjectList(creator) {
    const list = $(`#${creator}-object-list`);
    const collection = creatorCollections[creator];

    if (!list || !collection) return;

    setText(`#${creator}-count`, String(collection.length));
    list.replaceChildren();

    collection.forEach(object => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "object-card";
        button.dataset.objectId = object.id;
        button.setAttribute("aria-pressed", String(object.id === app.selectedId));

        const dot = document.createElement("span");
        dot.className = "object-card-dot";
        dot.style.backgroundColor =
            `#${object.color.toString(16).padStart(6, "0")}`;

        const name = document.createElement("span");
        name.className = "object-card-name";
        name.textContent = object.name;

        const type = document.createElement("span");
        type.className = "object-card-type";
        type.textContent = object.type;

        button.append(dot, name, type);
        button.addEventListener("click", () => selectObject(object.id));
        list.appendChild(button);
    });
}

function selectObject(id) {
    const object = getObject(id);

    if (!object) {
        console.warn("[ATLAS] Objeto desconocido:", id);
        return;
    }

    app.selectedId = object.id;

    renderObjectDetails(object);

    Object.entries(creatorCollections).forEach(([creator, collection]) => {
        if (collection.some(item => item.id === object.id)) {
            renderCreatorDetails(object, creator);
        }
    });

    app.viewers.forEach(viewer => {
        if (
            !viewer.fixedObjectId &&
            viewer.container.closest(".page-section")?.hidden === false
        ) {
            viewer.showObject(object);
        }
    });
}

function setupObjectFilters() {
    const search = $("#object-search");
    const filter = $("#object-filter");

    function applyFilters() {
        const query = search?.value.trim().toLowerCase() || "";
        const type = filter?.value || "all";

        $$(".object-card").forEach(button => {
            const object = getObject(button.dataset.objectId);

            if (!object) return;

            const text = `${object.name} ${object.type}`.toLowerCase();

            const matchesQuery = text.includes(query);
            const matchesType = type === "all" || object.type === type;

            button.hidden = !(matchesQuery && matchesType);
        });
    }

    search?.addEventListener("input", applyFilters);
    filter?.addEventListener("change", applyFilters);
}

function renderFreeObjectSelect() {
    const select = $("#free-object-select");

    if (!select) return;

    select.replaceChildren();

    objects.forEach(object => {
        const option = document.createElement("option");

        option.value = object.id;
        option.textContent = object.name;

        select.appendChild(option);
    });

    select.value = app.selectedId;

}

/* ============================================================
   6. CARGA DE THREE.JS
============================================================ */

async function importThreeModules() {
    const base =
        `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}`;

    const [THREE, gltfModule, controlsModule] = await withTimeout(
        Promise.all([
            import(`${base}/build/three.module.js`),
            import(`${base}/examples/jsm/loaders/GLTFLoader.js`),
            import(`${base}/examples/jsm/controls/OrbitControls.js`)
        ]),
        MODULE_TIMEOUT,
        "La descarga de Three.js superó el tiempo de espera."
    );

    return {
        THREE,
        GLTFLoader: gltfModule.GLTFLoader,
        OrbitControls: controlsModule.OrbitControls
    };
}

/* ============================================================
   7. FONDO ESTELAR
============================================================ */

function createStarField(THREE) {
    const count = 2000;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index++) {
        const radius = 40 + Math.random() * 180;
        const theta = Math.random() * Math.PI * 2;
        const z = Math.random() * 2 - 1;
        const horizontal = Math.sqrt(1 - z * z);

        positions[index * 3] =
            radius * horizontal * Math.cos(theta);

        positions[index * 3 + 1] =
            radius * horizontal * Math.sin(theta);

        positions[index * 3 + 2] = radius * z;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0xd9e7ff,
        size: 0.45,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
}

/* ============================================================
   8. AJUSTE DE ESCALA Y CENTRADO DEL GLTF
============================================================ */

function normalizeModel(THREE, model) {
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);

    if (box.isEmpty()) {
        throw new Error("El archivo GLTF no contiene geometría visible.");
    }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);

    if (!Number.isFinite(maxSize) || maxSize <= 0) {
        throw new Error("El modelo tiene un tamaño inválido.");
    }

    const scale = 3.5 / maxSize;

    model.scale.multiplyScalar(scale);

    /*
     * Centrar después de aplicar la escala.
     * Esto permite encuadrar modelos de distintos tamaños.
     */
    model.position.x -= center.x * scale;
    model.position.y -= center.y * scale;
    model.position.z -= center.z * scale;

    model.updateMatrixWorld(true);
}

/* ============================================================
   9. ESFERA DE RESPALDO
   Solo se usa si no se puede cargar el archivo GLTF.
============================================================ */

function createFallbackModel(THREE, object) {
    const group = new THREE.Group();

    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 64, 48),
        new THREE.MeshStandardMaterial({
            color: object.color,
            roughness: 0.75,
            metalness: 0.05
        })
    );

    group.add(sphere);

    if (object.id === "saturno") {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.7, 2.5, 96),
            new THREE.MeshStandardMaterial({
                color: 0xd9c29a,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            })
        );

        ring.rotation.x = Math.PI * 0.35;
        group.add(ring);
    }

    return group;
}

/* ============================================================
   10. CÁMARA
============================================================ */

function frameModel(viewer, model) {
    const { THREE, camera, controls } = viewer;

    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z, 1);
    const distance = maxSize * 2.8;

    controls.target.copy(center);

    camera.position.set(
        center.x,
        center.y,
        center.z + distance
    );

    camera.near = 0.01;
    camera.far = Math.max(1000, distance * 100);
    camera.updateProjectionMatrix();

    controls.minDistance = maxSize * 0.4;
    controls.maxDistance = maxSize * 15;

    controls.update();
}

/* ============================================================
   11. VISOR THREE.JS
============================================================ */

function createViewer(container, modules) {
    const { THREE, GLTFLoader, OrbitControls } = modules;

    const scene = new THREE.Scene();

    const transparentBackground = container.classList.contains("hero-transparent-canvas");

    scene.background = transparentBackground
        ? null
        : new THREE.Color(0x050816);

    const camera = new THREE.PerspectiveCamera(
        45,
        1,
        0.01,
        5000
    );

    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: transparentBackground,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.replaceChildren(renderer.domElement);

    // Iluminación de la escena.
    const hemisphere = new THREE.HemisphereLight(
        0xffffff,
        0x25203d,
        2.2
    );

    scene.add(hemisphere);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.5);

    mainLight.position.set(5, 7, 10);
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x4c78ff, 25, 100);

    blueLight.position.set(-6, 3, -5);
    scene.add(blueLight);

    scene.add(createStarField(THREE));

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = false;

    const loader = new GLTFLoader();

    const viewer = {
        THREE,
        container,
        fixedObjectId: container.dataset.objectId || null,
        scene,
        camera,
        renderer,
        controls,
        loader,

        currentModel: null,
        currentId: null,
        requestId: 0,
        cache: new Map(),
        failed: new Set(),
        destroyed: false,
        resizeObserver: null,
        animationId: null,

        resize() {
            if (this.destroyed) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            /*
             * No utilizar un aspecto de 1x1 si el apartado está oculto.
             * El siguiente resize se ejecuta al mostrarlo.
             */
            if (width <= 0 || height <= 0) return;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height, false);
        },

        async fetchModel(object) {
            if (this.cache.has(object.id)) {
                return this.cache.get(object.id);
            }

            const url = modelURL(object);

            console.info("[GLTF] Cargando:", url);

            const gltf = await withTimeout(new Promise((resolve, reject) => {
                loader.load(
                    url,
                    resolve,
                    progress => {
                        if (progress.total > 0) {
                            const percent = Math.round(
                                progress.loaded / progress.total * 100
                            );

                            console.info(
                                `[GLTF] ${object.name}: ${percent}%`
                            );
                        }
                    },
                    error => {
                        reject(
                            new Error(
                                `No se pudo cargar ${url}: ${error?.message || error}`
                            )
                        );
                    }
                );
            }), MODEL_TIMEOUT, `La carga de ${object.name} superó el tiempo de espera.`);

            const model = gltf.scene || gltf.scenes?.[0];

            if (!model) {
                throw new Error(
                    `${url} no contiene una escena GLTF utilizable.`
                );
            }

            normalizeModel(THREE, model);

            if (object.id === "andromeda") {
                model.rotation.x += Math.PI / 2;
            }

            model.traverse(node => {
                if (!node.isMesh) return;

                node.visible = true;
                node.frustumCulled = false;

                if (node.material) {
                    const materials = Array.isArray(node.material)
                        ? node.material
                        : [node.material];

                    materials.forEach(material => {
                        if (
                            object.id === "andromeda" &&
                            material.name === "Andromeda" &&
                            material.map
                        ) {
                            material.alphaMap = material.map;
                            material.alphaTest = 0.035;
                            material.transparent = true;
                            material.depthWrite = false;
                        }

                        material.needsUpdate = true;
                    });
                }
            });

            model.updateMatrixWorld(true);

            this.cache.set(object.id, model);

            console.info(
                "[GLTF] Modelo cargado correctamente:",
                object.name
            );

            return model;
        },

        async showObject(object) {
            if (!object || this.destroyed) return;

            const request = ++this.requestId;

            this.currentId = object.id;

            if (this.currentModel) {
                scene.remove(this.currentModel);
                this.currentModel = null;
            }

            setViewerStatus("CARGANDO MODELO 3D...", container);

            try {
                const original = await this.fetchModel(object);

                /*
                 * Si el usuario ya seleccionó otro objeto,
                 * no mostrar la respuesta antigua.
                 */
                if (this.destroyed || request !== this.requestId) {
                    return;
                }

                /*
                 * Cada visor necesita su propia instancia.
                 * El modelo original queda almacenado en caché.
                 */
                const model = original.clone(true);

                const sourceMeshes = [];
                const clonedMeshes = [];

                original.traverse(source => {
                    if (source.isMesh) sourceMeshes.push(source);
                });

                model.traverse(copy => {
                    if (copy.isMesh) clonedMeshes.push(copy);
                });

                clonedMeshes.forEach((copy, index) => {
                    const source = sourceMeshes[index];

                    if (!source?.material) return;

                    copy.material = Array.isArray(source.material)
                        ? source.material.map(material => material.clone())
                        : source.material.clone();
                });

                model.position.copy(original.position);
                model.scale.copy(original.scale);
                model.rotation.copy(original.rotation);
                model.updateMatrixWorld(true);

                this.currentModel = model;

                scene.add(model);
                frameModel(this, model);

                if (
                    container.id === "hero-galaxy-canvas" ||
                    container.id === "hero-andromeda-canvas"
                ) {
                    camera.position
                        .sub(controls.target)
                        .multiplyScalar(
                            container.id === "hero-galaxy-canvas"
                                ? camera.aspect < 0.9 ? 0.85 : 0.4
                                : camera.aspect < 0.9 ? 0.48 : 0.38
                        )
                        .add(controls.target);
                    controls.update();
                }

                setViewerStatus("MODELO 3D ACTIVO", container);

            } catch (error) {
                console.error(
                    `[GLTF] Falló la carga de ${object.name}.`,
                    error
                );

                if (this.destroyed || request !== this.requestId) {
                    return;
                }

                this.failed.add(object.id);

                const fallback = createFallbackModel(THREE, object);

                this.currentModel = fallback;
                scene.add(fallback);
                frameModel(this, fallback);

                setViewerStatus(
                    "MODELO NO DISPONIBLE · MODO ALTERNATIVO",
                    container
                );

                notify(`No se pudo cargar ${object.name}; se muestra un modelo alternativo.`);
            }
        },

        focus() {
            if (this.currentModel) {
                frameModel(this, this.currentModel);
            }
        },

        destroy() {
            if (this.destroyed) return;

            this.destroyed = true;

            if (this.animationId !== null) {
                cancelAnimationFrame(this.animationId);
            }

            this.resizeObserver?.disconnect();
            this.controls.dispose();

            this.cache.forEach(model => {
                model.traverse(node => {
                    if (node.geometry) node.geometry.dispose();

                    if (node.material) {
                        const materials = Array.isArray(node.material)
                            ? node.material
                            : [node.material];

                        materials.forEach(material => material.dispose());
                    }
                });
            });

            this.cache.clear();
            this.renderer.dispose();
        }
    };

    function animate() {
        if (viewer.destroyed) return;

        viewer.animationId = requestAnimationFrame(animate);

        const section = container.closest(".page-section");

        if (section?.hidden === false) {
            if (viewer.currentModel && app.autoRotate) {
                viewer.currentModel.rotation.y += 0.0025;
            }

            controls.update();
            renderer.render(scene, camera);
        }
    }

    viewer.resize();

    if ("ResizeObserver" in window) {
        viewer.resizeObserver = new ResizeObserver(() => {
            viewer.resize();
        });

        viewer.resizeObserver.observe(container);
    } else {
        window.addEventListener("resize", () => viewer.resize());
    }

    animate();

    return viewer;
}

/* ============================================================
   12. INICIALIZAR LOS DOS VISORES
============================================================ */

async function initializeViewers() {
    const atlasContainer = $("#space-canvas");
    const freeContainer = $("#free-canvas");
    const williamContainer = $("#william-canvas");
    const licetContainer = $("#licet-canvas");
    const heroGalaxyContainer = $("#hero-galaxy-canvas");
    const heroAndromedaContainer = $("#hero-andromeda-canvas");

    const containers = [
        atlasContainer,
        freeContainer,
        williamContainer,
        licetContainer,
        heroGalaxyContainer,
        heroAndromedaContainer
    ].filter(Boolean);

    if (containers.length === 0) {
        console.warn(
            "[UNIVERSO] No se encontraron #space-canvas ni #free-canvas. Revisa el HTML."
        );
        return;
    }

    try {
        const modules = await importThreeModules();

        containers.forEach(container => {
            try {
                const viewer = createViewer(container, modules);
                app.viewers.push(viewer);
            } catch (error) {
                console.error(
                    `[UNIVERSO] Error creando el visor ${container.id}:`,
                    error
                );

                container.innerHTML =
                    '<div class="viewer-fallback"><p>No se pudo crear el visor 3D. Comprueba la compatibilidad con WebGL.</p></div>';
            }
        });

        if (app.viewers.length === 0) {
            throw new Error("No se pudo crear ningún visor.");
        }

        app.viewers.forEach(viewer => {
            const section = viewer.container.closest(".page-section");
            const initialObject = getObject(
                viewer.fixedObjectId || app.selectedId
            );

            if (initialObject && section?.hidden === false) {
                viewer.showObject(initialObject);
            }
        });

        console.info(
            `[UNIVERSO] Visores activos: ${app.viewers.length}`
        );

    } catch (error) {
        console.error(
            "[UNIVERSO] No se pudieron importar los módulos de Three.js:",
            error
        );

        containers.forEach(container => {
            container.innerHTML =
                '<div class="viewer-fallback"><div class="fallback-orb"></div><p>No se pudo iniciar Three.js. Comprueba la conexión a Internet y la compatibilidad con WebGL.</p></div>';
        });

        notify("No se pudo iniciar el sistema 3D. El resto de la web sigue disponible.");
    }
}

/* ============================================================
   13. EXPLORACIÓN LIBRE Y CONTROLES
============================================================ */

function setupFreeControls() {
    $("#free-reset")?.addEventListener("click", () => {
        app.viewers.forEach(viewer => viewer.focus());
    });

    $("#focus-object")?.addEventListener("click", () => {
        app.viewers.forEach(viewer => viewer.focus());
    });

    $("#reset-focus")?.addEventListener("click", () => {
        app.viewers.forEach(viewer => viewer.focus());
    });

    $("#toggle-rotation")?.addEventListener("click", event => {
        app.autoRotate = !app.autoRotate;

        event.currentTarget.textContent = app.autoRotate
            ? "DESACTIVAR ROTACIÓN"
            : "ACTIVAR ROTACIÓN";
    });

    $("#free-object-select")?.addEventListener("change", event => {
        selectObject(event.target.value);
    });

    $("#william-focus")?.addEventListener("click", () => {
        app.viewers
            .find(viewer => viewer.container.id === "william-canvas")
            ?.focus();
    });

    $("#licet-focus")?.addEventListener("click", () => {
        app.viewers
            .find(viewer => viewer.container.id === "licet-canvas")
            ?.focus();
    });
}

/* ============================================================
   14. MISIÓN ESPACIAL
============================================================ */

function renderMission() {
    const mission = missions[app.missionIndex];

    if (!mission) return;

    setText("#mission-planet", mission.location);

    setText(
        "#mission-stage-code",
        `ETAPA ${String(app.missionIndex + 1).padStart(2, "0")}`
    );

    setText("#mission-stage-title", mission.title);
    setText("#mission-stage-copy", mission.description);

    setText(
        "#mission-distance",
        `${app.missionIndex + 1}/${missions.length}`
    );

    const progressBar = $("#mission-progress-bar");

    if (progressBar) {
        progressBar.style.width =
            `${((app.missionIndex + 1) / missions.length) * 100}%`;
    }

    const steps = $("#mission-steps");

    $$("[data-mission-point]").forEach(point => {
        point.classList.toggle(
            "active",
            Number(point.dataset.missionPoint) === app.missionIndex
        );
    });

    if (steps) {
        steps.replaceChildren();

        missions.forEach((stage, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "mission-step";

            button.textContent =
                `${String(index + 1).padStart(2, "0")} / ${stage.location}`;

            button.classList.toggle(
                "active",
                index === app.missionIndex
            );
            button.setAttribute(
                "aria-pressed",
                String(index === app.missionIndex)
            );

            button.addEventListener("click", () => {
                app.missionIndex = index;
                renderMission();
            });

            steps.appendChild(button);
        });
    }

    const previous = $("#mission-prev");
    const next = $("#mission-next");

    if (previous) previous.disabled = app.missionIndex === 0;

    if (next) {
        next.disabled = app.missionIndex === missions.length - 1;
    }
}

function setupMission() {
    $("#mission-prev")?.addEventListener("click", () => {
        app.missionIndex = Math.max(0, app.missionIndex - 1);
        renderMission();
    });

    $("#mission-next")?.addEventListener("click", () => {
        app.missionIndex = Math.min(
            missions.length - 1,
            app.missionIndex + 1
        );

        renderMission();
    });

    $("#mission-view-object")?.addEventListener("click", () => {
        const mission = missions[app.missionIndex];

        showView("atlas");
        selectObject(mission.object);
    });

    renderMission();
}

/* ============================================================
   15. SONIDO AMBIENTAL EN BUCLE
============================================================ */

function updateSoundControls() {
    const button = $("#toggle-sound");
    const slider = $("#sound-volume");
    const output = $("#sound-volume-value");
    const volume = Math.round(app.soundVolume * 100);

    if (button) {
        button.innerHTML = `<span aria-hidden="true">♪</span> AMBIENTE ${app.soundEnabled ? "ON" : "OFF"}`;
        button.setAttribute("aria-pressed", String(app.soundEnabled));
        button.setAttribute(
            "aria-label",
            app.soundEnabled
                ? "Silenciar ambiente espacial"
                : "Activar ambiente espacial"
        );
    }

    if (slider) slider.value = String(volume);
    if (output) output.value = `${volume}%`;

    if (app.ambientAudio) app.ambientAudio.volume = app.soundVolume;
}

async function toggleSound() {
    const audio = app.ambientAudio;

    if (!audio) {
        notify("No se encontró el archivo de ambiente espacial.");
        return;
    }

    if (app.soundEnabled) {
        audio.pause();
        app.soundEnabled = false;
        updateSoundControls();
        return;
    }

    try {
        await audio.play();
        app.soundEnabled = true;
        updateSoundControls();

    } catch (error) {
        console.error("[AUDIO] No se pudo activar el sonido:", error);
        notify("No se pudo reproducir el ambiente espacial. Inténtalo de nuevo.");
    }
}

function setupSound() {
    const audio = new Audio(
        new URL("../src/Sonido/audioSpace.mp3", import.meta.url).href
    );

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = app.soundVolume;
    app.ambientAudio = audio;

    $("#toggle-sound")?.addEventListener("click", toggleSound);

    $("#sound-volume")?.addEventListener("input", event => {
        app.soundVolume = Number(event.currentTarget.value) / 100;
        updateSoundControls();
    });

    updateSoundControls();
}

function setupInteractiveStarfield() {
    const canvas = $("#hero-starfield");
    const hero = $("#view-inicio");
    const context = canvas?.getContext("2d");

    if (!canvas || !hero || !context) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const stars = [];
    const ripples = [];
    let width = 0;
    let height = 0;
    let lastPointer = null;
    let lastRippleTime = 0;
    let lastFrameTime = 0;

    function smoothstep(value) {
        const clamped = Math.max(0, Math.min(1, value));
        return clamped * clamped * (3 - 2 * clamped);
    }

    function resize() {
        const bounds = hero.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        width = bounds.width;
        height = bounds.height;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const starCount = Math.min(
            560,
            Math.max(180, Math.round(width * height / 2500))
        );

        stars.length = 0;

        for (let index = 0; index < starCount; index++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.25 + 0.35,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 1.5 + 0.4,
                tint: Math.random()
            });
        }

        if (reducedMotion) draw(performance.now());
    }

    function addRipple(event) {
        const bounds = hero.getBoundingClientRect();
        const point = {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top
        };

        if (event.type === "pointermove") {
            const now = performance.now();

            if (
                lastPointer &&
                Math.hypot(point.x - lastPointer.x, point.y - lastPointer.y) < 16
            ) {
                return;
            }

            if (now - lastRippleTime < 95) return;
            lastRippleTime = now;
        }

        lastPointer = point;
        ripples.push({
            x: point.x,
            y: point.y,
            age: 0,
            strength: event.type === "pointerdown" ? 0.85 : 0.48
        });

        if (ripples.length > 6) ripples.shift();
    }

    function draw(timestamp) {
        if (width <= 0 || height <= 0) return;

        const time = timestamp / 1000;
        context.clearRect(0, 0, width, height);

        for (const star of stars) {
            let offsetX = 0;
            let offsetY = 0;

            if (!reducedMotion) {
                for (const ripple of ripples) {
                    const deltaX = star.x - ripple.x;
                    const deltaY = star.y - ripple.y;
                    const distance = Math.hypot(deltaX, deltaY) || 1;
                    const front = ripple.age * 145;
                    const band = distance - front;
                    const fade = 1 - smoothstep(ripple.age / 2.4);
                    const envelope = Math.exp(-Math.pow(band / 74, 2));
                    const wave = Math.sin(band * 0.047) *
                        envelope *
                        fade *
                        ripple.strength *
                        7;

                    offsetX += deltaX / distance * wave;
                    offsetY += deltaY / distance * wave;
                }
            }

            const twinkle = reducedMotion
                ? 0.72
                : 0.48 + Math.sin(time * star.speed + star.phase) * 0.22;
            const x = star.x + offsetX;
            const y = star.y + offsetY;
            const color = star.tint > 0.82
                ? `rgba(174, 151, 255, ${twinkle})`
                : star.tint > 0.58
                    ? `rgba(132, 220, 255, ${twinkle})`
                    : `rgba(235, 243, 255, ${twinkle})`;

            context.beginPath();
            context.fillStyle = color;
            context.shadowColor = color;
            context.shadowBlur = star.radius > 1.15 ? 9 : 3;
            context.arc(x, y, star.radius, 0, Math.PI * 2);
            context.fill();
        }

        context.shadowBlur = 0;

        if (!reducedMotion) {
            const delta = lastFrameTime
                ? Math.min(0.05, (timestamp - lastFrameTime) / 1000)
                : 0;
            lastFrameTime = timestamp;

            for (const ripple of ripples) ripple.age += delta;

            for (let index = ripples.length - 1; index >= 0; index--) {
                if (ripples[index].age >= 2.4) ripples.splice(index, 1);
            }

            requestAnimationFrame(draw);
        }
    }

    hero.addEventListener("pointermove", addRipple, { passive: true });
    hero.addEventListener("pointerdown", addRipple, { passive: true });

    if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(hero);
    } else {
        window.addEventListener("resize", resize);
    }

    resize();
    if (!reducedMotion) requestAnimationFrame(draw);
}

/* ============================================================
   16. INICIALIZACIÓN GENERAL
   No se utiliza una pantalla de carga bloqueante.
============================================================ */

function setupEvents() {
    setupNavigation();
    setupSound();
    setupInteractiveStarfield();
    setupFreeControls();
    setupMission();

    renderObjectList();
    renderCreatorObjectList("william");
    renderCreatorObjectList("licet");
    renderFreeObjectSelect();
    setupObjectFilters();

    const initialObject = getObject(app.selectedId);

    if (initialObject) {
        renderObjectDetails(initialObject);
    }
}

async function initializeApp() {
    if (app.initialized) return;

    app.initialized = true;

    console.info("[UNIVERSO] Página iniciada.");

    /*
     * La navegación y el contenido se preparan primero.
     * La carga 3D ocurre de forma independiente.
     */
    setupEvents();

    initializeViewers();
}

window.addEventListener("pagehide", () => {
    app.viewers.forEach(viewer => viewer.destroy());
    app.ambientAudio?.pause();
});

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp,
        { once: true }
    );
} else {
    initializeApp();
}
