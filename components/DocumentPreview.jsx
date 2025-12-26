import { useEffect, useRef } from "react";

export default function DocumentPreview({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    function onMouseDown(e) {
      const el = e.target.closest(".doc-field");
      if (!el) return;

      e.preventDefault(); // 🔥 สำคัญมาก: กัน blur ก่อนเกิด

      const field = el.getAttribute("data-field");
      if (!field) return;

      const input = document.querySelector(
        `input[name="${field}"]`
      );
      input?.focus();
    }

    ref.current.addEventListener("mousedown", onMouseDown);
    return () =>
      ref.current.removeEventListener("mousedown", onMouseDown);
  }, [html]);

  return (
    <div
      ref={ref}
      className="h-[78vh] overflow-y-auto bg-[#f2f2f2] px-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
