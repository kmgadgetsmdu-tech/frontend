// Currency formatter
export const fmt = price =>
  '₹' + Number(price).toLocaleString('en-IN');

// Discount percentage
export const disc = (price, orig) =>
  orig > price ? Math.round(((orig - price) / orig) * 100) : 0;

// Star string
export const stars = r => {
  const full = Math.floor(r), half = r % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

// Status badge helper
export function statusBadge(s) {
  const map = {
    pending:    { label: 'Pending',    cls: 'badge-warning'  },
    processing: { label: 'Processing', cls: 'badge-info'     },
    shipped:    { label: 'Shipped',    cls: 'badge-primary'  },
    delivered:  { label: 'Delivered',  cls: 'badge-success'  },
    cancelled:  { label: 'Cancelled',  cls: 'badge-danger'   },
  };
  return map[s] || { label: s, cls: 'badge-secondary' };
}

// Compress image to base64 (max 600×600, quality 0.72)
export function compressImage(file, maxW = 600, maxH = 600, quality = 0.72) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
