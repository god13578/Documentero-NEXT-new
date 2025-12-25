import { useEffect, useRef } from "react";

export default function DocumentPreview({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    function onClick(e) {
      const el = e.target.closest(".doc-field");
      if (!el) return;

      const field = el.getAttribute("data-field");
      if (!field) return;

      const input = document.querySelector(
        `input[name="${field}"]`
      );

      input?.focus();
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    ref.current.addEventListener("click", onClick);
    return () =>
      ref.current.removeEventListener("click", onClick);
  }, [html]);

  return (
    <div
      ref={ref}
      className="w-full h-full overflow-auto p-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
