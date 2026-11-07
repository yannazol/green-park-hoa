import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import { api } from '../../services/api';
import getAnnouncementsStyles from '../../styles/AnnouncementsStyles';

const CATEGORIES = ['Notice', 'Maintenance', 'Reminder', 'Fees'];
const STATUSES = ['All', 'Draft', 'Scheduled', 'Published', 'Archived'];
const CATEGORY_VARIANTS = {
  Notice: 'info',
  Maintenance: 'warning',
  Reminder: 'neutral',
  Fees: 'danger',
};
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 1024 * 1024;
const EMPTY_FORM = { title: '', category: 'Notice', message: '', publishAt: '' };
const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  ...CATEGORIES.map((category) => ({ value: category, label: category })),
];

function toManilaInput(value) {
  if (!value) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const fields = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${fields.year}-${fields.month}-${fields.day}T${fields.hour}:${fields.minute}`;
}

function fromManilaInput(value) {
  if (!value) return '';
  return new Date(`${value}:00+08:00`).toISOString();
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date(value));
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result.includes(',')) {
        reject(new Error(`Could not read ${file.name}.`));
        return;
      }
      resolve({
        mimeType: file.type,
        data: reader.result.slice(reader.result.indexOf(',') + 1),
        name: file.name,
      });
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function imageUrl(image) {
  return `data:${image.mimeType};base64,${image.data}`;
}

export default function Announcements() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const s = getAnnouncementsStyles(colors);
  const isAdmin = user?.role === 'admin';
  const [announcements, setAnnouncements] = useState([]);
  const [summary, setSummary] = useState({ total: 0, Published: 0, Scheduled: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [tab, setTab] = useState('All');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [history, setHistory] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirm, setConfirm] = useState(null);
  const [moderationAnnouncement, setModerationAnnouncement] = useState(null);
  const [moderationComments, setModerationComments] = useState([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [moderationError, setModerationError] = useState('');
  const [validation, setValidation] = useState({});
  const fileInput = useRef(null);
  const loadRequest = useRef(0);

  const loadAnnouncements = useCallback(async () => {
    const requestId = ++loadRequest.current;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      page: String(page),
      limit: '10',
      status: tab,
    });
    if (category) params.set('category', category);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (search.trim()) params.set('search', search.trim());
    try {
      const result = await api(`/api/announcements?${params.toString()}`);
      if (requestId !== loadRequest.current) return;
      setAnnouncements(result.announcements ?? []);
      setSummary(result.summary ?? { total: 0, Published: 0, Scheduled: 0 });
      setPagination(result.pagination ?? { page: 1, totalPages: 1, total: 0 });
    } catch (loadError) {
      if (requestId !== loadRequest.current) return;
      setError(loadError.message || 'Could not load announcements.');
    } finally {
      if (requestId === loadRequest.current) setLoading(false);
    }
  }, [category, from, page, search, tab, to]);

  useEffect(() => {
    const timer = setTimeout(loadAnnouncements, 250);
    return () => clearTimeout(timer);
  }, [loadAnnouncements]);

  useEffect(() => {
    if (!editorOpen || !dirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const confirmInternalNavigation = (event) => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.origin !== window.location.origin) return;
      if (anchor.pathname === window.location.pathname && anchor.search === window.location.search) {
        return;
      }
      if (!window.confirm('You have unsaved changes. Leave this page and discard them?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    document.addEventListener('click', confirmInternalNavigation, true);
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
      document.removeEventListener('click', confirmInternalNavigation, true);
    };
  }, [dirty, editorOpen]);

  const startNew = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setImages([]);
    setHistory([]);
    setValidation({});
    setError('');
    setDirty(false);
    setEditorOpen(true);
  };

  const startEdit = async (item) => {
    setError('');
    setLoading(true);
    try {
      const { announcement } = await api(`/api/announcements/${item._id}`);
      setEditingId(announcement._id);
      setForm({
        title: announcement.title ?? '',
        category: announcement.category ?? 'Notice',
        message: announcement.message ?? '',
        publishAt: toManilaInput(announcement.publishAt),
      });
      setImages(
        (announcement.images ?? []).map((image) => ({
          mimeType: image.mimeType,
          data: image.data,
          name: image.name ?? '',
        }))
      );
      setHistory(announcement.history ?? []);
      setValidation({});
      setDirty(false);
      setEditorOpen(true);
    } catch (editError) {
      setError(editError.message || 'Could not open this announcement.');
    } finally {
      setLoading(false);
    }
  };

  const requestCloseEditor = () => {
    if (dirty) {
      setConfirm({
        title: 'Discard unsaved changes?',
        message: 'Your edits have not been saved.',
        confirmLabel: 'Discard changes',
        buttonVariant: 'danger',
        onConfirm: closeEditor,
      });
      return;
    }
    closeEditor();
  };

  function closeEditor() {
    setEditorOpen(false);
    setEditingId('');
    setDirty(false);
    setHistory([]);
    setConfirm(null);
  }

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setDirty(true);
    setValidation((previous) => ({ ...previous, [field]: undefined }));
  };

  const addImages = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const nextValidation = {};
    if (images.length + files.length > 3) {
      nextValidation.images = 'You can attach up to 3 images.';
      setValidation((previous) => ({ ...previous, ...nextValidation }));
      return;
    }
    const invalid = files.find((file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES);
    if (invalid) {
      nextValidation.images = ACCEPTED_TYPES.includes(invalid.type)
        ? `${invalid.name} is larger than 1 MB.`
        : `${invalid.name} is not a JPEG, PNG, or WebP image.`;
      setValidation((previous) => ({ ...previous, ...nextValidation }));
      return;
    }
    try {
      const selected = await Promise.all(files.map(readImage));
      setImages((previous) => [...previous, ...selected]);
      setDirty(true);
      setValidation((previous) => ({ ...previous, images: undefined }));
    } catch (imageError) {
      setValidation((previous) => ({ ...previous, images: imageError.message }));
    }
  };

  const removeImage = (index) => {
    setImages((previous) => previous.filter((_, current) => current !== index));
    setDirty(true);
  };

  const validateForm = (status) => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (form.title.trim().length > 160) next.title = 'Title must be 160 characters or fewer.';
    if (!form.message.trim()) next.message = 'Message is required.';
    if (form.message.trim().length > 10000) next.message = 'Message must be 10,000 characters or fewer.';
    if (status === 'Scheduled' && !form.publishAt) next.publishAt = 'Choose a publication date and time.';
    if (status === 'Scheduled' && form.publishAt) {
      const scheduledAt = new Date(`${form.publishAt}:00+08:00`);
      if (Number.isNaN(scheduledAt.valueOf()) || scheduledAt <= new Date()) {
        next.publishAt = 'Choose a future date and time in Asia/Manila.';
      }
    }
    setValidation(next);
    return Object.keys(next).length === 0;
  };

  const saveAnnouncement = async (status) => {
    if (!validateForm(status)) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        category: form.category,
        message: form.message,
        status,
        images: images.map(({ mimeType, data, name }) => ({ mimeType, data, name })),
        ...(status === 'Scheduled' ? { publishAt: fromManilaInput(form.publishAt) } : {}),
      };
      if (editingId) {
        await api(`/api/announcements/${editingId}`, { method: 'PATCH', body: payload });
      } else {
        await api('/api/announcements', { method: 'POST', body: payload });
      }
      setDirty(false);
      closeEditor();
      setPage(1);
      await loadAnnouncements();
    } catch (saveError) {
      setError(saveError.message || 'Could not save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (item, status) => {
    setSaving(true);
    setError('');
    try {
      const payload = { status };
      if (status === 'Scheduled') payload.publishAt = item.publishAt;
      await api(`/api/announcements/${item._id}`, { method: 'PATCH', body: payload });
      setConfirm(null);
      await loadAnnouncements();
    } catch (statusError) {
      setError(statusError.message || 'Could not update announcement status.');
    } finally {
      setSaving(false);
    }
  };

  const requestStatus = (item, status) => {
    const descriptions = {
      Published: 'This announcement will be visible to residents immediately.',
      Archived: 'Archived announcements are hidden from residents.',
      Draft: 'This announcement will be restored as a draft.',
    };
    setConfirm({
      title: `${status} announcement?`,
      message: descriptions[status],
      confirmLabel: status,
      buttonVariant: status === 'Archived' ? 'danger' : 'primary',
      onConfirm: () => updateStatus(item, status),
    });
  };

  const toggleExpand = (id) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const openCommentModeration = async (item) => {
    setModerationAnnouncement(item);
    setModerationComments([]);
    setModerationError('');
    setModerationLoading(true);
    try {
      const result = await api(`/api/announcements/${item._id}/comments`);
      setModerationComments(result.comments ?? []);
    } catch (loadError) {
      setModerationError(loadError.message || 'Could not load announcement comments.');
    } finally {
      setModerationLoading(false);
    }
  };

  const moderateComment = async (comment, status) => {
    if (!moderationAnnouncement) return;
    setModerationError('');
    try {
      const result = await api(
        `/api/announcements/${moderationAnnouncement._id}/comments/${comment._id}`,
        { method: 'PATCH', body: { status } }
      );
      setModerationComments((current) =>
        current.map((entry) => entry._id === result.comment._id ? result.comment : entry)
      );
      setAnnouncements((current) => current.map((item) =>
        item._id === moderationAnnouncement._id
          ? { ...item, commentsCount: result.commentsCount }
          : item
      ));
    } catch (moderationError) {
      setModerationError(moderationError.message || 'Could not update comment visibility.');
    }
  };

  const title = form.title || 'Your announcement title';
  const message = form.message || 'Your announcement message will appear here as residents see it.';
  const editor = editorOpen ? (
    <div style={s.editorPage}>
      <PageHeader
        title={editingId ? 'Edit announcement' : 'Create announcement'}
        subtitle="Compose a community update and preview it before sharing."
        action={
          <Button variant="secondary" onClick={requestCloseEditor}>
            Back to announcements
          </Button>
        }
      />
      {error && <div role="alert" style={s.errorBanner}>{error}</div>}
      <div className="announcement-editor-grid" style={s.editorGrid}>
        <Card title="Announcement details">
          <div style={s.form}>
            <Input
              label="Title"
              maxLength={160}
              value={form.title}
              error={validation.title}
              placeholder="Write a clear, concise title"
              onChange={(event) => updateForm('title', event.target.value)}
            />
            <Select
              label="Category"
              options={CATEGORIES.map((value) => ({ value, label: value }))}
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
            />
            <div style={s.textareaField}>
              <label htmlFor="announcement-message" style={s.label}>Message</label>
              <textarea
                id="announcement-message"
                rows={9}
                maxLength={10000}
                style={s.textarea}
                value={form.message}
                placeholder="Write the full announcement details here..."
                onChange={(event) => updateForm('message', event.target.value)}
              />
              <div style={s.fieldFooter}>
                {validation.message
                  ? <span role="alert" style={s.errorText}>{validation.message}</span>
                  : <span style={s.helperText}>Keep residents informed with clear, helpful details.</span>}
                <span style={s.helperText}>{form.message.length}/10,000</span>
              </div>
            </div>
            <div style={s.imageSection}>
              <div>
                <strong style={s.label}>Photos</strong>
                <p style={s.helperText}>Up to 3 JPEG, PNG, or WebP images, 1 MB each.</p>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={addImages}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={images.length >= 3}
                onClick={() => fileInput.current?.click()}
              >
                Add images
              </Button>
              {validation.images && <span role="alert" style={s.errorText}>{validation.images}</span>}
              {images.length > 0 && (
                <div style={s.imageGrid}>
                  {images.map((image, index) => (
                    <div key={`${image.name}-${index}`} style={s.imageTile}>
                      <img src={imageUrl(image)} alt={image.name || `Announcement photo ${index + 1}`} style={s.imageThumb} />
                      <button type="button" style={s.removeImage} onClick={() => removeImage(index)} aria-label={`Remove ${image.name || `image ${index + 1}`}`}>×</button>
                      <span style={s.imageName}>{image.name || 'Announcement image'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={s.editorActions}>
              <Button variant="secondary" disabled={saving} onClick={() => saveAnnouncement('Draft')}>
                Save draft
              </Button>
              <Button disabled={saving} onClick={() => saveAnnouncement('Published')}>
                Publish now
              </Button>
            </div>
            <div style={s.scheduleRow}>
              <Input
                type="datetime-local"
                label="Schedule in Philippine time"
                value={form.publishAt}
                error={validation.publishAt}
                onChange={(event) => updateForm('publishAt', event.target.value)}
              />
              <Button variant="secondary" disabled={saving} onClick={() => saveAnnouncement('Scheduled')}>
                Schedule
              </Button>
            </div>
          </div>
        </Card>

        <div className="announcement-preview-column" style={s.previewColumn}>
          <div style={s.previewHeading}>
            <span style={s.eyebrow}>RESIDENT PREVIEW</span>
            <span style={s.helperText}>This is how it will appear in the community feed.</span>
          </div>
          <Card>
            <div style={s.previewMeta}>
              <Badge variant={CATEGORY_VARIANTS[form.category] || 'neutral'}>{form.category}</Badge>
              <span style={s.cardDate}>{form.publishAt ? formatDate(fromManilaInput(form.publishAt)) : 'Just now'}</span>
            </div>
            <h2 style={s.previewTitle}>{title}</h2>
            <p style={s.previewMessage}>{message}</p>
            {images.length > 0 && (
              <div style={s.previewImages}>
                {images.map((image, index) => (
                  <img key={`${image.name}-preview-${index}`} src={imageUrl(image)} alt={image.name || `Announcement preview ${index + 1}`} style={s.previewImage} />
                ))}
              </div>
            )}
            <span style={s.readMorePreview}>Read more</span>
          </Card>
          {history.length > 0 && (
            <Card title="Activity history">
              <div style={s.historyList}>
                {[...history].reverse().map((entry, index) => (
                  <div key={`${entry.at}-${index}`} style={s.historyItem}>
                    <strong style={s.historyAction}>{entry.action}</strong>
                    <span style={s.helperText}>{entry.actorName} · {formatDate(entry.at)}</span>
                    {entry.details && <span style={s.helperText}>{entry.details}</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  ) : null;

  if (editorOpen) return (
    <>
      {editor}
      <Modal open={Boolean(confirm)} title={confirm?.title} onClose={() => setConfirm(null)}>
        <div style={s.confirmBody}>
          <p style={s.cardDate}>{confirm?.message}</p>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Keep editing</Button>
            <Button variant={confirm?.buttonVariant ?? 'primary'} onClick={() => confirm?.onConfirm?.()}>{confirm?.confirmLabel}</Button>
          </div>
        </div>
      </Modal>
    </>
  );

  return (
    <div style={s.container}>
      <PageHeader
        title="Announcements"
        subtitle="Share timely community updates, advisories, and notices."
        action={isAdmin ? <Button onClick={startNew}>New announcement</Button> : null}
      />
      {error && <div role="alert" style={s.errorBanner}>{error}</div>}

      <div className="announcement-summary-grid" style={s.summaryGrid}>
        {[
          { label: 'Total announcements', value: summary.total ?? 0, tone: 'primary' },
          { label: 'Published', value: summary.Published ?? 0, tone: 'success' },
          { label: 'Scheduled', value: summary.Scheduled ?? 0, tone: 'warning' },
        ].map((item) => (
          <Card key={item.label}>
            <div style={s.summaryCard}>
              <span style={s.summaryLabel}>{item.label}</span>
              <strong style={{ ...s.summaryValue, color: colors[item.tone] ?? colors.text }}>{item.value}</strong>
            </div>
          </Card>
        ))}
      </div>

      <div style={s.filterPanel}>
        <div className="announcement-tabs" style={s.tabs} role="tablist" aria-label="Announcement status">
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={tab === status}
              style={{ ...s.tab, ...(tab === status ? s.activeTab : {}) }}
              onClick={() => { setTab(status); setPage(1); }}
            >
              {status}
              {status === 'All' && <span style={s.tabCount}>{summary.total ?? 0}</span>}
              {status !== 'All' && <span style={s.tabCount}>{summary[status] ?? 0}</span>}
            </button>
          ))}
        </div>
        <div className="announcement-filter-row" style={s.filters}>
          <Input
            label="Search"
            placeholder="Search title or message"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          />
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(event) => { setCategory(event.target.value); setPage(1); }}
          />
          <Input label="Date from" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} />
          <Input label="Date to" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} />
          <Button variant="secondary" style={s.clearFilters} onClick={resetFilters}>Clear filters</Button>
        </div>
      </div>

      <div style={s.listHeader}>
        <h2 style={s.sectionTitle}>{tab === 'All' ? 'All announcements' : `${tab} announcements`}</h2>
        <span style={s.helperText}>{pagination.total} result{pagination.total === 1 ? '' : 's'}</span>
      </div>
      <div style={s.list}>
        {loading ? (
          <div style={s.emptyMessage}>Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div style={s.emptyMessage}>{error ? 'Announcements could not be loaded.' : 'No announcements match these filters.'}</div>
        ) : announcements.map((item) => {
          const expanded = expandedIds.has(item._id);
          return (
            <Card key={item._id}>
              <div style={s.cardHeader}>
                <div style={s.cardTitleGroup}>
                  <h3 style={s.cardTitle}>{item.title}</h3>
                  <span style={s.cardDate}>{formatDate(item.publishedAt ?? item.publishAt ?? item.date)}</span>
                </div>
                <div style={s.badgeGroup}>
                  <Badge variant={CATEGORY_VARIANTS[item.category] || 'neutral'}>{item.category}</Badge>
                  <Badge variant={item.status === 'Published' ? 'success' : item.status === 'Scheduled' ? 'warning' : 'neutral'}>{item.status ?? 'Published'}</Badge>
                </div>
              </div>
              <div style={s.cardBody}>
                <p style={expanded ? s.bodyFull : s.bodyPreview}>{item.message}</p>
                <button type="button" style={s.toggleButton} onClick={() => toggleExpand(item._id)}>
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              </div>
              {(item.images?.length > 0) && <span style={s.helperText}>{item.images.length} attached photo{item.images.length === 1 ? '' : 's'}</span>}
              {isAdmin && (
                <div style={s.cardActions}>
                  <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>Edit</Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void openCommentModeration(item)}
                  >
                    Moderate comments ({item.commentsCount ?? 0})
                  </Button>
                  {(item.status ?? 'Published') !== 'Archived' && (
                    <Button variant="secondary" size="sm" onClick={() => requestStatus(item, 'Archived')}>Archive</Button>
                  )}
                  {(item.status ?? 'Published') === 'Archived' && (
                    <Button variant="secondary" size="sm" onClick={() => requestStatus(item, 'Draft')}>Restore to draft</Button>
                  )}
                  {item.status !== 'Published' && item.status !== 'Archived' && (
                    <Button size="sm" onClick={() => requestStatus(item, 'Published')}>Publish now</Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <div style={s.pagination}>
        <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button>
        <span style={s.helperText}>Page {pagination.page} of {pagination.totalPages}</span>
        <Button variant="secondary" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</Button>
      </div>

      <Modal open={Boolean(confirm)} title={confirm?.title} onClose={() => setConfirm(null)}>
        <div style={s.confirmBody}>
          <p style={s.cardDate}>{confirm?.message}</p>
          <div style={s.modalActions}>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant={confirm?.buttonVariant ?? 'primary'} loading={saving} onClick={() => confirm?.onConfirm?.()}>{confirm?.confirmLabel}</Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={Boolean(moderationAnnouncement)}
        title={`Comments · ${moderationAnnouncement?.title ?? ''}`}
        onClose={() => setModerationAnnouncement(null)}
      >
        <div style={s.commentModeration}>
          {moderationError && <div role="alert" style={s.errorBanner}>{moderationError}</div>}
          {moderationLoading ? (
            <p style={s.helperText}>Loading comments…</p>
          ) : moderationComments.length === 0 ? (
            <p style={s.helperText}>No resident comments yet.</p>
          ) : moderationComments.map((comment) => (
            <article key={comment._id} style={s.moderationComment}>
              <div style={s.moderationCommentHeader}>
                <strong style={s.moderationAuthor}>{comment.authorName}</strong>
                <span style={s.moderationStatus}>{comment.status}</span>
              </div>
              <p style={s.moderationMessage}>{comment.message}</p>
              <div style={s.moderationActions}>
                {comment.status === 'Visible' ? (
                  <Button variant="secondary" size="sm" onClick={() => void moderateComment(comment, 'Hidden')}>
                    Hide comment
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => void moderateComment(comment, 'Visible')}>
                    Restore comment
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </Modal>
    </div>
  );
}
