"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import { checkoutTotals, requestCheckout } from "@/lib/checkout";
import { formatClp } from "@/lib/addons";

export default function StickyATC() {
  const [visible, setVisible] = useState(false);
  const { tienda, photoReady } = useProjectLocal();
  const router = useRouter();
  const total = checkoutTotals(tienda).total;

  useEffect(() => {
    const buyBox = document.getElementById("buy-box");
    if (!buyBox) return;
    const update = () => setVisible(buyBox.getBoundingClientRect().bottom < 0);
    const observer = new IntersectionObserver(update, { threshold: 0 });
    observer.observe(buyBox);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white p-3 transition-transform duration-300 editorial:hidden ${visible ? "translate-y-0" : "translate-y-full"}`}>
      <button
        type="button"
        onClick={() =>
          photoReady
            ? requestCheckout("carrito", (href) => router.push(href))
            : window.dispatchEvent(new Event("relicario:open-photo"))
        }
        className="primary-button w-full px-5"
      >
        {photoReady ? "Comprar este relicario" : "Subir foto y añadir"} · {formatClp(total)}
      </button>
    </div>
  );
}
