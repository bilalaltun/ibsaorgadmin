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

  useEffect(() => {
    async function fetchSliders() {
      const res = await fetch("/api/sliders");
      const data = await res.json();
      setSliders(data.data);
      setSortedSliders(data.data.map((s) => s.id));
    }
    fetchSliders();
  }, []);

  useEffect(() => {
    if (!hasDragged || sliders.length === 0 || sortedSliders.length === 0)
      return;

    const updateOrder = async () => {
      Swal.fire({
        title: "Saving order...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await Promise.all(
          sortedSliders.map(async (sliderId, index) => {
            const slider = sliders.find((s) => s.id === sliderId);
            if (!slider) return;

            const payload = {
              image_url: slider.image_url,
              video_url: slider.video_url,
              dynamic_link_title: slider.dynamic_link_title,
              dynamic_link: slider.dynamic_link,
              dynamic_link_alternative: slider.dynamic_link_alternative,
              order: index + 1,
              isactive: slider.isactive,
              title: slider.title,
              description: slider.description,
              content: slider.content,
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
              throw new Error(`Slider #${sliderId} could not be updated`);
          })
        );

        Swal.fire({
          icon: "success",
          title: "Order Saved",
          text: "Slider order updated successfully.",
        });
      } catch (err) {
        console.error("Update failed:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save the new order.",
        });
      }
    };

    updateOrder();
  }, [sortedSliders]);

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
        <h3>CURRENT ORDER</h3>
        {sliders.map((s, i) => (
          <div key={s.id} className={styles.sortCard}>
            <img src={s.image_url} alt="slider" className={styles.sliderImg} />
            <span>{i + 1}</span>
          </div>
        ))}
      </div>

      <div className={styles.column}>
        <h3>REORDER</h3>
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
