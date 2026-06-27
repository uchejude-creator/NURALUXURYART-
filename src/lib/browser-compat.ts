export async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback for older browsers or blocked permissions.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function dispatchBrowserEvent(eventName: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof Event === "function") {
    window.dispatchEvent(new Event(eventName));
    return;
  }

  const event = document.createEvent("Event");
  event.initEvent(eventName, true, true);
  window.dispatchEvent(event);
}
