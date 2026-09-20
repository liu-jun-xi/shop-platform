import { useState, useEffect } from 'react';
import { api } from '../api';

const DISMISS_KEY = 'announcement_dismiss';

function shouldShowAnnouncement(announcement) {
  if (!announcement?.enabled) return false;
  if (!announcement.updated_at) return true;
  try {
    const stored = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
    if (stored.version === announcement.updated_at && stored.until > Date.now()) {
      return false;
    }
  } catch { /* show */ }
  return true;
}

export default function AnnouncementModal() {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    api.site.announcement()
      .then(data => {
        setAnnouncement(data);
        if (shouldShowAnnouncement(data)) setVisible(true);
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    if (dontShow && announcement?.updated_at) {
      localStorage.setItem(DISMISS_KEY, JSON.stringify({
        version: announcement.updated_at,
        until: Date.now() + 7 * 24 * 60 * 60 * 1000
      }));
    }
    setVisible(false);
  };

  if (!visible || !announcement?.enabled) return null;

  return (
    <div className="modal-overlay announcement-overlay" onClick={handleClose}>
      <div className="modal announcement-modal" onClick={e => e.stopPropagation()}>
        <h2>{announcement.title || '网站公告'}</h2>
        {announcement.image && (
          <img src={announcement.image} alt="" className="announcement-image" />
        )}
        {announcement.content && (
          <div className="announcement-content">{announcement.content}</div>
        )}
        <label className="announcement-dismiss-check">
          <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
          七天内不再提醒
        </label>
        <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleClose}>
          我知道了
        </button>
      </div>
    </div>
  );
}
