"use strict";

const TABLE_SIZE = 13;
const REQUIRED_COUNT = 15;

const elements = {
    numberInput: document.querySelector("#numberInput"),
    inputCount: document.querySelector("#inputCount"),
    buildButton: document.querySelector("#buildButton"),
    stepButton: document.querySelector("#stepButton"),
    autoButton: document.querySelector("#autoButton"),
    resetButton: document.querySelector("#resetButton"),
    statusBox: document.querySelector("#statusBox"),
    hashTable: document.querySelector("#hashTable"),
    processedStat: document.querySelector("#processedStat"),
    collisionStat: document.querySelector("#collisionStat"),
    loadStat: document.querySelector("#loadStat"),
    progressBar: document.querySelector("#progressBar"),
    searchInput: document.querySelector("#searchInput"),
    searchButton: document.querySelector("#searchButton"),
    searchResult: document.querySelector("#searchResult")
};

let buckets = createEmptyBuckets();
let numbers = [];
let currentIndex = 0;
let collisions = 0;
let activeBucket = null;
let collisionBucket = null;
let foundMatch = null;
let autoTimer = null;

function createEmptyBuckets() {
    return Array.from({ length: TABLE_SIZE }, () => []);
}

function hash(key) {
    return ((key % TABLE_SIZE) + TABLE_SIZE) % TABLE_SIZE;
}

function parseNumbers() {
    const tokens = elements.numberInput.value
        .trim()
        .split(/[\s,，]+/)
        .filter(Boolean);

    if (tokens.length !== REQUIRED_COUNT) {
        return { error: `目前有 ${tokens.length} 個值，請輸入剛好 ${REQUIRED_COUNT} 個整數。` };
    }

    const parsed = tokens.map(Number);
    const invalidPosition = parsed.findIndex((value) => !Number.isSafeInteger(value));

    if (invalidPosition !== -1) {
        return { error: `第 ${invalidPosition + 1} 個值不是有效整數。` };
    }

    return { values: parsed };
}

function updateInputCount() {
    const raw = elements.numberInput.value.trim();
    const count = raw ? raw.split(/[\s,，]+/).filter(Boolean).length : 0;
    elements.inputCount.textContent = `${count} / ${REQUIRED_COUNT}`;
    elements.inputCount.classList.toggle("invalid", count !== REQUIRED_COUNT);
}

function setStatus(message, type = "") {
    elements.statusBox.textContent = message;
    elements.statusBox.className = `status-box${type ? ` ${type}` : ""}`;
}

function stopAutoPlay() {
    if (autoTimer !== null) {
        window.clearInterval(autoTimer);
        autoTimer = null;
    }
    elements.autoButton.textContent = "自動播放";
}

function prepareNumbers() {
    const result = parseNumbers();
    if (result.error) {
        setStatus(result.error, "error");
        return false;
    }

    numbers = result.values;
    return true;
}

function resetTable({ keepMessage = false } = {}) {
    stopAutoPlay();
    buckets = createEmptyBuckets();
    numbers = [];
    currentIndex = 0;
    collisions = 0;
    activeBucket = null;
    collisionBucket = null;
    foundMatch = null;
    elements.searchResult.textContent = "建立雜湊表後即可查找。";
    render();

    if (!keepMessage) {
        setStatus("已重設。請建立完整雜湊表，或逐步加入數字。");
    }
}

function insertNext() {
    if (numbers.length === 0 && !prepareNumbers()) {
        return false;
    }

    if (currentIndex >= numbers.length) {
        stopAutoPlay();
        setStatus("15 個整數都已加入，雜湊表建立完成。", "success");
        return false;
    }

    foundMatch = null;
    const key = numbers[currentIndex];
    const index = hash(key);
    const hasCollision = buckets[index].length > 0;

    if (hasCollision) {
        collisions += 1;
    }

    buckets[index].unshift(key);
    currentIndex += 1;
    activeBucket = index;
    collisionBucket = hasCollision ? index : null;

    const normalizedNote = key < 0 ? `（正規化到 ${index}）` : "";
    const collisionNote = hasCollision ? "，桶內已有資料，發生碰撞並接到鏈的前端。" : "，該桶原本是空的。";
    setStatus(`h(${key}) = ${key} % 13 = ${index}${normalizedNote}${collisionNote}`, hasCollision ? "collision" : "");
    render();

    if (currentIndex === numbers.length) {
        stopAutoPlay();
        window.setTimeout(() => setStatus("15 個整數都已加入，雜湊表建立完成。", "success"), 450);
    }

    return true;
}

function buildAll() {
    resetTable({ keepMessage: true });
    if (!prepareNumbers()) {
        return;
    }

    while (currentIndex < numbers.length) {
        insertNext();
    }

    activeBucket = null;
    collisionBucket = null;
    render();
    setStatus(`建立完成：共加入 ${currentIndex} 個整數，發生 ${collisions} 次碰撞。`, "success");
}

function toggleAutoPlay() {
    if (autoTimer !== null) {
        stopAutoPlay();
        setStatus("自動播放已暫停。可繼續逐步操作。 ");
        return;
    }

    if (numbers.length === 0) {
        resetTable({ keepMessage: true });
        if (!prepareNumbers()) {
            return;
        }
    }

    if (currentIndex >= numbers.length) {
        resetTable({ keepMessage: true });
        if (!prepareNumbers()) {
            return;
        }
    }

    elements.autoButton.textContent = "暫停播放";
    insertNext();
    autoTimer = window.setInterval(() => {
        if (!insertNext()) {
            stopAutoPlay();
        }
    }, 700);
}

function searchNumber() {
    foundMatch = null;
    activeBucket = null;
    collisionBucket = null;

    const key = Number(elements.searchInput.value);
    if (!Number.isSafeInteger(key) || elements.searchInput.value.trim() === "") {
        elements.searchResult.textContent = "請先輸入一個有效整數。";
        render();
        return;
    }

    const index = hash(key);
    const position = buckets[index].indexOf(key);
    activeBucket = index;

    if (position === -1) {
        elements.searchResult.textContent = `${key} 應在第 ${index} 桶；檢查 ${buckets[index].length} 個節點後，確認不存在。`;
    } else {
        foundMatch = { bucket: index, position };
        elements.searchResult.textContent = `${key} 在第 ${index} 桶，沿著鏈檢查 ${position + 1} 個節點後找到。`;
    }

    render();
}

function render() {
    const fragment = document.createDocumentFragment();

    buckets.forEach((chainValues, bucketIndex) => {
        const bucketElement = document.createElement("div");
        bucketElement.className = "bucket";

        if (bucketIndex === activeBucket) bucketElement.classList.add("active");
        if (bucketIndex === collisionBucket) bucketElement.classList.add("collision");
        if (foundMatch && foundMatch.bucket === bucketIndex) bucketElement.classList.add("found");

        const indexElement = document.createElement("div");
        indexElement.className = "bucket-index";
        indexElement.textContent = bucketIndex;

        const chainElement = document.createElement("div");
        chainElement.className = "chain";

        if (chainValues.length === 0) {
            const emptyElement = document.createElement("span");
            emptyElement.className = "empty-chain";
            emptyElement.textContent = "EMPTY";
            chainElement.append(emptyElement);
        } else {
            chainValues.forEach((key, nodeIndex) => {
                const nodeElement = document.createElement("span");
                nodeElement.className = "node";
                nodeElement.textContent = key;

                if (foundMatch && foundMatch.bucket === bucketIndex && foundMatch.position === nodeIndex) {
                    nodeElement.classList.add("match");
                }

                chainElement.append(nodeElement);

                const arrowElement = document.createElement("span");
                arrowElement.className = "arrow";
                arrowElement.textContent = "→";
                chainElement.append(arrowElement);
            });

            const nullElement = document.createElement("span");
            nullElement.className = "empty-chain";
            nullElement.textContent = "NULL";
            chainElement.append(nullElement);
        }

        bucketElement.append(indexElement, chainElement);
        fragment.append(bucketElement);
    });

    elements.hashTable.replaceChildren(fragment);
    elements.processedStat.textContent = currentIndex;
    elements.collisionStat.textContent = collisions;
    elements.loadStat.textContent = (currentIndex / TABLE_SIZE).toFixed(2);
    elements.progressBar.style.width = `${(currentIndex / REQUIRED_COUNT) * 100}%`;
    elements.stepButton.disabled = currentIndex >= REQUIRED_COUNT;
}

elements.numberInput.addEventListener("input", () => {
    updateInputCount();
    resetTable({ keepMessage: true });
    setStatus("輸入已變更。請重新建立雜湊表。");
});
elements.buildButton.addEventListener("click", buildAll);
elements.stepButton.addEventListener("click", insertNext);
elements.autoButton.addEventListener("click", toggleAutoPlay);
elements.resetButton.addEventListener("click", () => resetTable());
elements.searchButton.addEventListener("click", searchNumber);
elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") searchNumber();
});

updateInputCount();
render();
