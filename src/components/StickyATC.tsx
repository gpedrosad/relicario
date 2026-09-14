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
    const product = document.getElementById("producto");
    const footer = document.querySelector("footer");
    if (!product) return;
    const update = () => {
      const journeyStarted = product.getBoundingClientRect().top < -Math.min(300, window.innerHeight * 0.35);
      const footerReached = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      setVisible(journeyStarted && !footerReached);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 editorial:inset-x-auto editorial:bottom-6 editorial:right-6 editorial:w-[360px] editorial:border editorial:shadow-[0_14px_40px_rgba(0,0,0,0.16)] ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0 editorial:translate-y-4"}`}>
      <button
        type="button"
        onClick={() =>
          photoReady
            ? requestCheckout("carrito", (href) => router.push(href))
            : window.dispatchEvent(new Event("relicario:open-photo"))
        }
        className="primary-button w-full px-5"
      >
        {photoReady
          ? `Comprar este relicario · ${formatClp(total)}`
          : "Simular con tu foto"}
      </button>
    </div>
  );
}
