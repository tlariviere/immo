const getSelectedText = () => {
  const selection = window.getSelection?.();

  if (selection?.type === "Range") {
    return selection.toString();
  }

  return "";
};

const removeDistBadges = () => {
  const badges = document.getElementsByClassName("dist-badge-selection");
  for (const badge of badges) {
    badge.remove();
  }
};

const fetchDist = async (query) => chrome.runtime.sendMessage({ query });

const appendBadge = (node, data, className = "dist-badge") => {
  if (data && typeof data === "object" && typeof data.distance === "number") {
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.borderRadius = "4px";
    span.style.border = "1px solid #d1d5db";
    span.style.padding = "2px 4px";
    span.style.marginLeft = "2px";
    span.style.color = "#111827";
    span.classList.add(className);
    span.textContent = `${data.distance.toFixed(1)}km (${data.label})`;
    if (data.distance <= 3) {
      span.style.backgroundColor = "#22c55e";
    } else if (data.distance <= 10) {
      span.style.backgroundColor = "#fb923c";
    } else {
      span.style.backgroundColor = "#ef4444";
    }
    const element = node.nodeType === 1 ? node : node.parentElement;
    element?.insertBefore(span, node.nextSibling);
  }
};

const appendSelection = (data) => {
  const selection = window.getSelection?.();

  if (selection?.focusNode) {
    removeDistBadges();
    appendBadge(selection.focusNode, data, "dist-badge-selection");
  }
};

// document.addEventListener("keyup", async (e) => {
//   switch (e.code) {
//     case "ShiftLeft":
//     case "ShiftRight":
//       const text = getSelectedText();
//       if (text !== "") {
//         const res = await fetchDist(text);
//         appendSelection(res);
//       }
//       break;
//   }
// });

let ctrlDown = false;
document.addEventListener("keydown", async (e) => {
  switch (e.code) {
    case "AltLeft":
    case "AltRight":
      ctrlDown = true;
      break;
  }
});
document.addEventListener("keyup", async (e) => {
  switch (e.code) {
    case "AltLeft":
    case "AltRight":
      ctrlDown = false;
      break;
  }
});

document.addEventListener("mouseup", async () => {
  if (ctrlDown) {
    const text = getSelectedText();
    if (text !== "") {
      const res = await fetchDist(text);
      appendSelection(res);
    }
  }
});

const highlightText = (node, matches) => {
  if (node.parentElement) {
    let html = node.parentElement.innerHTML;
    for (const match of matches) {
      html = html.replaceAll(
        match,
        `<span style="display:inline-block;border-radius:4px;color:#f9fafb;padding:1px 2px;background-color:#f43f5e">${match}</span>`
      );
    }
    node.parentElement.innerHTML = html;
  }
};

const highlightSurface = (node, match) => {
  if (node.parentElement) {
    const html = node.parentElement.innerHTML.replace(
      match,
      `<span style="display:inline-block;border-radius:4px;color:#f9fafb;padding:1px 2px;background-color:#22c55e">${match}</span>`
    );
    node.parentElement.innerHTML = html;
  }
};

const regexpAddress =
  /([A-Z][a-zA-Z\-]+\b\s+(?:-\s+)?)?((\(?(28|61|72|53)\d{3}\)?)|((sarthe\b\s*\(72\))|(orne\b\s*\(61\))|(eure-et-loir\b\s*\(28\))))((\s+-)?\s+[A-Z][a-zA-Z\-]+\b)?/;
const regexpHighlight =
  /(?:assainissement|fosse|m[2²]|m[eè]tres?|terrain|surface|chauffage|chaufferie|chaudi[eè]re|fioul|fuel|(?:pompe [aà] chaleur)|PAC|(?:tout [aà] l'[eé]go[uû]t)|chaudi[eè]re|gaz|jardin)/gim;
const regexpSurface = /(\d{4,})\s*m[2²]/;
let nodesAddress = [];
let nodesHighlight = [];
let nodesSurface = [];

const checkAddress = (node) => {
  const matches = node.textContent.match(regexpAddress);
  if (matches) {
    nodesAddress.push({ node, match: matches[0] });
  }
};

const checkHighlight = (node) => {
  if (node.parentElement) {
    const matches = node.textContent.match(regexpHighlight);
    if (matches) {
      const uniq = [...new Set(matches)];
      nodesHighlight.push({ node, matches: uniq });
    }
  }
};

const checkSurface = (node) => {
  if (node.parentElement) {
    const matches = node.textContent.match(regexpSurface);
    if (matches && +(matches[1] ?? "0") > 4000) {
      nodesSurface.push({ node, match: matches[0] });
    }
  }
};

function browseNode(node, options = { address: true, highlight: true }) {
  if (Array.isArray(node)) {
    for (const n of node) {
      browseNode(n, options);
    }
  } else {
    switch (node.nodeType) {
      case 1:
        for (const child of node.childNodes) {
          browseNode(child, options);
        }
        break;
      case 3:
        if (node.textContent) {
          if (options.address) {
            checkAddress(node);
          }
          if (options.highlight) {
            checkHighlight(node);
            checkSurface(node);
          }
        }
        break;
    }
  }
}

const appendBadges = async () => {
  for (const { node, match } of nodesAddress) {
    const res = await fetchDist(match);
    appendBadge(node, res);
  }
  nodesAddress = [];
};

const highlightTexts = () => {
  for (const { node, matches } of nodesHighlight) {
    highlightText(node, matches);
  }
  nodesHighlight = [];
  for (const { node, match } of nodesSurface) {
    highlightSurface(node, match);
  }
  nodesSurface = [];
};

const main = async (node, options = { address: true, highlight: true }) => {
  browseNode(node, options);
  if (options.address) {
    const cities = document.getElementsByClassName("listing-city");
    if (cities.length > 0) {
      for (const city of cities) {
        nodesAddress.push({
          node: city.childNodes[0],
          match: city.textContent,
        });
      }
    }
    await appendBadges();
  }
  if (options.highlight) {
    highlightTexts();
  }
};

const callback = (mutationList) => {
  for (const mutation of mutationList) {
    main(mutation.target, { address: false, highlight: true });
  }
};

const observer = new MutationObserver(callback);

window.addEventListener("load", async () => {
  await main(document.body);

  const paragraphs = document.getElementsByTagName("p");
  for (const p of paragraphs) {
    observer.observe(p, {
      characterData: true,
      attributes: false,
      childList: false,
      subtree: true,
    });
    observer.observe(p, {
      characterData: false,
      attributes: false,
      childList: true,
      subtree: false,
    });
  }
});
