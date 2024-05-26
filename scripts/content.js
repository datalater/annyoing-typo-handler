// console.log("Content Script Loaded");
// dev();

/**
 * 특정 제어 문자들을 URL 인코딩된 값으로 정의한 객체입니다.
 * @see {@link ./docs/control-characters.md}
 */
const filterCharacters = Object.freeze({
  backspace: "%08",
  replacementCharacter: "%EF%BF%BD",
  fileSeparator: "%1C",
  groupSeparator: "%1D",
  unitSeparator: "%1F",
});

const FILTER_CHARACTERS = Object.values(filterCharacters);

main();

function main() {
  bindHandler();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        bindHandler();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function dev() {
  const body = document.querySelector("body");

  body.insertBefore(
    document.createElement("div"),
    body.firstChild
  ).innerHTML = `
    <div style="position: fixed; top: 8px; left: 8px; z-index: 9999; background-color: rgba(10,10,10,0.8); color: #FFD700; padding: 4px; text-align: center; border: 1px solid; border-radius: 15px;">
      <span>Content Script DevTools</span>
    </div>
  `;
}

function bindHandler() {
  document.querySelectorAll("textarea").forEach((input) => {
    if (input.dataset.alreadyBound) return;
    input.dataset.alreadyBound = "true";

    input.addEventListener("blur", function handler(event) {
      let encodedValue = encodeURI(event.target.value);

      if (!containsAny(encodedValue, FILTER_CHARACTERS)) return;

      FILTER_CHARACTERS.forEach((filterChar) => {
        const regex = new RegExp(escapeRegExp(filterChar), "g");
        encodedValue = encodedValue.replace(regex, "");
      });

      event.target.value = decodeURI(encodedValue);
    });
  });
}

function containsAny(str, characters) {
  return characters.some((char) => str.includes(char));
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
