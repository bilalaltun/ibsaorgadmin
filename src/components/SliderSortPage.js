/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./sliderSort.module.css";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

// 👇 Yardımcı format dönüştürücü
const convertToArrayFormat = (obj) =>
  Object.entries(obj || {}).map(([langCode, value]) => ({
    langCode,
    value,
  }));

// 👇 Her bir draggable slider kartı
function SortableItem({ id, image }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.sortCard}
    >
      <img src={image} alt="slider" className={styles.sliderImg} />
    </div>
  );
}

export default function SliderSortPage() {
  const [sliders, setSliders] = useState([]);
  const [hasDragged, setHasDragged] = useState(false);
  const [sortedSliders, setSortedSliders] = useState([]);

  // 🚀 Sıralama güncellemesi
  useEffect(() => {
    if (!hasDragged) return;

    if (sortedSliders.length > 0 && sliders.length > 0) {
      const updateOrder = async () => {
        Swal.fire({
          title: "Sıralama kaydediliyor...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          await Promise.all(
            sortedSliders.map(async (sliderId, index) => {
              const fullSliderData = sliders.find((s) => s.id === sliderId);
              if (!fullSliderData) return;

              const payload = {
                image_url: fullSliderData.image_url,
                video_url: fullSliderData.video_url,
                dynamic_link_title: fullSliderData.dynamic_link_title,
                dynamic_link: fullSliderData.dynamic_link,
                dynamic_link_alternative:
                  fullSliderData.dynamic_link_alternative,
                order: index + 1,
                isactive: fullSliderData.isactive,
                titles: convertToArrayFormat(fullSliderData.titles),
                description: convertToArrayFormat(fullSliderData.descriptions),
                content: convertToArrayFormat(fullSliderData.contents),
              };

              const token = Cookies.get("token");
              const res = await fetch(`/api/sliders?id=${sliderId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });

              if (!res.ok)
                throw new Error(`Slider #${sliderId} güncellenemedi`);
            })
          );

          Swal.fire({
            icon: "success",
            title: "Sıralama Kaydedildi",
            text: "Slider sıralaması başarıyla güncellendi.",
          });
        } catch (err) {
          console.error("❌ Sıralama güncelleme hatası:", err);
          Swal.fire({
            icon: "error",
            title: "Hata",
            text: "Sıralama kaydedilirken bir sorun oluştu.",
          });
        }
      };

      updateOrder();
    }
  }, [sortedSliders]);

  // 📦 Sliders'ı çek
  useEffect(() => {
    async function fetchSliders() {
      const res = await fetch("/api/sliders");
      const data = await res.json();
      setSliders(data.data);
      setSortedSliders(data.data.map((s) => s.id));
    }
    fetchSliders();
  }, []);

  // 🎯 Drag & Drop sonrası sıralamayı güncelle
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const newSorted = arrayMove(
        sortedSliders,
        sortedSliders.indexOf(active.id),
        sortedSliders.indexOf(over.id)
      );

      setSortedSliders(newSorted);
      setHasDragged(true);

      const newSliderOrder = newSorted.map((id) =>
        sliders.find((s) => s.id === id)
      );
      setSliders(newSliderOrder);
    }
  };

  const getSliderById = (id) => sliders.find((s) => s.id === id);

  return (
    <div className={styles.sortWrapper}>
      <div className={styles.column}>
        <h3>MEVCUT SIRALAMA</h3>
        {sliders.map((s, i) => (
          <div key={s.id} className={styles.sortCard}>
            <img src={s.image_url} alt="slider" className={styles.sliderImg} />
            <span>{i + 1}</span>
          </div>
        ))}
      </div>

      <div className={styles.column}>
        <h3>YENİDEN SIRALA</h3>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSliders}
            strategy={verticalListSortingStrategy}
          >
            {sortedSliders.map((id) => {
              const slider = getSliderById(id);
              return (
                <SortableItem
                  key={id}
                  id={id}
                  image={slider?.image_url || ""}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
