'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaEdit, FaPen, FaPlus, FaTrash } from 'react-icons/fa';
import langs from '@/data/langs';

export default function SliderTable() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    async function fetchSliders() {
      try {
        const res = await fetch('/api/sliders');
        if (!res.ok) throw new Error('Veri alınamadı');
        const data = await res.json();
        setSliders(data);
      } catch (err) {
        console.error(err);
        setError('Slider verileri alınamadı.');
      } finally {
        setLoading(false);
      }
    }

    fetchSliders();
  }, []);

  const filteredSliders = useMemo(() => {
    return sliders.filter((s) =>
      s.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sliders]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Bu slider silinsin mi?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Silme işlemi başarısız');
      setSliders((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Silme sırasında hata oluştu.');
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="slider-table-wrapper">
      {/* Toolbar */}
      <div className="slider-toolbar">
        <div className="left-controls">
          <label>Sayfada</label>
          <select
            onChange={(e) => setPageSize(Number(e.target.value))}
            value={pageSize}
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <label>kayıt göster</label>
        </div>

        <div className="right-controls">
          <label>Ara:</label>
          <input
            type="text"
            placeholder="Başlığa göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link href="/slider/create">
            <button className="btn-add">YENİ EKLE</button>
          </Link>
        </div>
      </div>

      {/* Tablo */}
      <table className="slider-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Başlık</th>
            {langs.map((lang) => (
              <th key={lang}>İçerik ({lang.toUpperCase()})</th>
            ))}
            <th>Tarih</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {filteredSliders.slice(0, pageSize).map((slider, index) => (
            <tr key={slider.id}>
              <td>{index + 1}</td>
              <td>{slider.title}</td>

              {langs.map((lang) => (
                <td key={lang}>
                  <Link href={`/slider/content-edit/${slider.id}?lang=${lang}`}>
                    <button className="lang-btn" title={`${lang.toUpperCase()} içerik`}>
                      {slider.contents?.[lang] ? <FaPen /> : <FaPlus />}
                    </button>
                  </Link>
                </td>
              ))}

              <td>{slider.date}</td>

              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    defaultChecked={slider.status === 'active'}
                    readOnly
                  />
                  <span className="slider round" />
                </label>
              </td>

              <td style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Tüm dillerde düzenle */}
                <Link href={`/slider/content-edit/${slider.id}?lang=`}>
                  <button className="edit-btn" title="Tüm dillerde düzenle">
                    <FaEdit />
                  </button>
                </Link>


                {/* Sil */}
                <button
                  className="delete-btn"
                  title="Sil"
                  onClick={() => handleDelete(slider.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
