"use client";

import { useEffect, useState } from "react";
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
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
const convertToArrayFormat = (obj) =>
  Object.entries(obj || {}).map(([langCode, value]) => ({
    langCode,
    value,
  }));

function SortableItem({ id, title }) {
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
      <span className={styles.sliderName}>{title}</span>
    </div>
  );
}

export default function CategorySortPage() {
  const [categories, setCategories] = useState([]);
  const [hasDragged, setHasDragged] = useState(false);
  const [sortedCategories, setSortedCategories] = useState([]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Reduced delay for better mobile experience
        tolerance: 8, // Increased tolerance for touch movement
      },
    })
  );
  useEffect(() => {
    if (!hasDragged) return;

    if (sortedCategories.length > 0 && categories.length > 0) {
      const updateOrder = async () => {
        Swal.fire({
          title: "Sıralama yadda saxlanılır...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          await Promise.all(
            sortedCategories.map(async (categoryId, index) => {
              const fullCategoryData = categories.find(
                (c) => c.id === categoryId
              );
              if (!fullCategoryData) return;

              const payload = {
                title: convertToArrayFormat(fullCategoryData.title),
                order: index + 1,
                isactive: fullCategoryData.isactive,
              };

              const token = Cookies.get("token");
              const res = await fetch(`/api/categories?id=${categoryId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              });

              if (!res.ok)
                throw new Error(`Kateqoriya #${categoryId} yenilənə bilmədi`);
            })
          );

          Swal.fire({
            icon: "success",
            title: "Sıralama yadda saxlandı",
            text: "Kateqoriya sıralaması uğurla yeniləndi.",
          });
        } catch (err) {
          console.error("❌ Sıralama yeniləmə xətası:", err);
          Swal.fire({
            icon: "error",
            title: "Xəta",
            text: "Sıralama yadda saxlanılarkən bir problem baş verdi.",
          });
        }
      };

      updateOrder();
    }
  }, [sortedCategories]);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.data);
      setSortedCategories(data.data.map((c) => c.id));
    }
    fetchCategories();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const newSorted = arrayMove(
        sortedCategories,
        sortedCategories.indexOf(active.id),
        sortedCategories.indexOf(over.id)
      );

      setSortedCategories(newSorted);
      setHasDragged(true);

      const newCategoryOrder = newSorted.map((id) =>
        categories.find((c) => c.id === id)
      );
      setCategories(newCategoryOrder);
    }
  };

  const getCategoryById = (id) => categories.find((c) => c.id === id);

  return (
    <div className={styles.sortWrapper}>
      <div className={styles.column}>
        <h3>MÖVCUD SIRALAMA</h3>
        {categories.map((c, i) => (
          <div key={c.id} className={styles.sortCard}>
            <span>{i + 1}</span>
            <span className={styles.sliderName}>
              {c.title?.en || "Başlıq yoxdur"}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.column}>
        <h3>TƏZƏDƏN SIRALA</h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCategories}
            strategy={verticalListSortingStrategy}
          >
            {sortedCategories.map((id) => {
              const category = getCategoryById(id);
              return (
                <SortableItem
                  key={id}
                  id={id}
                  title={category?.title?.en || "Başlıq yoxdur"}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
