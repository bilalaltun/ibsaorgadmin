export default function EditOrAdd({  }) {
    const hasContent = false; // API'den içerik var mı kontrol edilir
  
    return (
      <button className={hasContent ? 'edit-btn' : 'add-btn'}>
        {hasContent ? '✏️' : '➕'}
      </button>
    );
  }
  