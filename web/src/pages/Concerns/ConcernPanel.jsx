import { useState } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Select from '../../components/Select';
import SlidePanel from '../../components/SlidePanel';
import {
  NEXT_STATUS,
  STATUS_META,
  capitalize,
  formatDate,
  formatDateTime,
  residentName,
  ticketId,
} from '../../constants/concerns';
import getConcernPanelStyles from '../../styles/ConcernPanelStyles';

function Section({ title, s, children }) {
  return (
    <section style={s.section}>
      <h3 style={s.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

function buildTimeline(concern) {
  const history = concern.statusHistory || [];
  const label = (status) => STATUS_META[status]?.label || status;
  const events = [
    {
      key: 'submitted',
      status: 'pending',
      label: 'Submitted',
      at: concern.createdAt,
      by: residentName(concern),
    },
  ];
  history.forEach((h, i) =>
    events.push({ key: `h${i}`, status: h.status, label: label(h.status), at: h.at, by: h.by?.name, note: h.note })
  );
  // Concerns updated before the timeline existed have no history, so show their current status
  if (history.length === 0 && concern.status !== 'pending') {
    events.push({ key: 'current', status: concern.status, label: label(concern.status), at: concern.updatedAt });
  }
  return events;
}

export default function ConcernPanel({ concern, open, onClose, onSaved, onNotify }) {
  const { colors } = useTheme();
  const s = getConcernPanelStyles(colors);

  const [loadedId, setLoadedId] = useState(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [preview, setPreview] = useState(null);

  // Load the form when a different concern is opened
  if (concern && concern._id !== loadedId) {
    setLoadedId(concern._id);
    setNewStatus(concern.status);
    setNote(concern.staffNote || '');
    setError('');
    setConfirmDiscard(false);
    setPreview(null);
  }

  const savedNote = concern?.staffNote || '';
  const dirty = !!concern && (newStatus !== concern.status || note.trim() !== savedNote.trim());
  const isFinal = !!concern && NEXT_STATUS[concern.status].length === 0;
  const rejecting = newStatus === 'rejected';

  const statusOptions = concern
    ? [concern.status, ...NEXT_STATUS[concern.status]].map((value) => ({
        value,
        label: STATUS_META[value].label,
      }))
    : [];

  const closeNow = () => {
    if (concern) {
      setNewStatus(concern.status);
      setNote(savedNote);
    }
    setError('');
    setConfirmDiscard(false);
    onClose();
  };

  const requestClose = () => {
    if (preview) return setPreview(null);
    if (dirty) return setConfirmDiscard(true);
    closeNow();
  };

  const handleSave = async () => {
    if (rejecting && !note.trim()) {
      setError('Please give a reason for rejecting this concern.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await api(`/concerns/${concern._id}/status`, {
        method: 'PATCH',
        body: { status: newStatus, staffNote: note },
      });
      onSaved(data.concern);
      onNotify({ kind: 'success', text: 'Changes saved. The resident will see this update.' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const footer = confirmDiscard ? (
    <div style={s.footerRow}>
      <span style={s.footerText}>Discard your unsaved changes?</span>
      <div style={s.footerActions}>
        <Button variant="secondary" size="sm" onClick={() => setConfirmDiscard(false)}>
          Keep editing
        </Button>
        <Button variant="danger" size="sm" onClick={closeNow}>
          Discard
        </Button>
      </div>
    </div>
  ) : (
    <div style={s.footerRow}>
      <span style={dirty ? s.unsaved : s.footerText}>{dirty ? 'You have unsaved changes' : ' '}</span>
      <Button onClick={handleSave} loading={saving} disabled={!dirty}>
        Save changes
      </Button>
    </div>
  );

  return (
    <>
      <SlidePanel
        open={open}
        title={concern ? concern.subject : ''}
        subtitle={concern ? `${ticketId(concern)} · ${capitalize(concern.type)}` : ''}
        onClose={requestClose}
        footer={concern ? footer : null}
      >
        {concern && (
          <>
            <div style={s.badgeRow}>
              <Badge variant={STATUS_META[concern.status].variant}>{STATUS_META[concern.status].label}</Badge>
              <span style={s.muted}>
                {capitalize(concern.category)} · Submitted {formatDate(concern.createdAt)}
              </span>
            </div>

            <Section title="Concern" s={s}>
              <p style={s.description}>{concern.description}</p>
            </Section>

            <Section title="Resident" s={s}>
              <dl style={s.infoGrid}>
                <dt style={s.infoLabel}>Name</dt>
                <dd style={s.infoValue}>{residentName(concern)}</dd>
                <dt style={s.infoLabel}>Unit</dt>
                <dd style={s.infoValue}>{concern.resident?.unit || '—'}</dd>
                <dt style={s.infoLabel}>Email</dt>
                <dd style={s.infoValue}>{concern.resident?.email || '—'}</dd>
              </dl>
            </Section>

            <Section title="Attachments" s={s}>
              {concern.photos?.length ? (
                <div style={s.thumbs}>
                  {concern.photos.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      style={s.thumb}
                      onClick={() => setPreview(url)}
                      aria-label={`Preview attachment ${i + 1}`}
                    >
                      <img src={url} alt={`Attachment ${i + 1}`} style={s.thumbImage} />
                    </button>
                  ))}
                </div>
              ) : (
                <p style={s.muted}>No attachments.</p>
              )}
            </Section>

            <Section title="Status timeline" s={s}>
              <ol style={s.timeline}>
                {buildTimeline(concern).map((event) => (
                  <li key={event.key} style={s.timelineItem}>
                    <span
                      style={{
                        ...s.dot,
                        backgroundColor: s.dotColors[STATUS_META[event.status]?.variant || 'neutral'],
                      }}
                    />
                    <div>
                      <div style={s.eventLabel}>{event.label}</div>
                      <div style={s.muted}>
                        {formatDateTime(event.at)}
                        {event.by ? ` · ${event.by}` : ''}
                      </div>
                      {event.note && <div style={s.eventNote}>{event.note}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Update" s={s}>
              <div style={s.form}>
                <Select
                  label="Status"
                  value={newStatus}
                  options={statusOptions}
                  disabled={isFinal}
                  helperText={isFinal ? 'This concern is closed, so its status can no longer change.' : undefined}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    setError('');
                  }}
                />
                <div>
                  <label htmlFor="admin-response" style={s.fieldLabel}>
                    {rejecting ? 'Reason for rejection (required)' : 'Response to resident (optional)'}
                  </label>
                  <textarea
                    id="admin-response"
                    style={{ ...s.textarea, ...(error && rejecting ? s.textareaError : {}) }}
                    maxLength={1000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={rejecting ? 'Explain why this concern cannot be accepted' : 'Visible to the resident'}
                  />
                </div>
                {error && <div style={s.errorBox}>{error}</div>}
              </div>
            </Section>
          </>
        )}
      </SlidePanel>

      {preview && (
        <div style={s.lightbox} onClick={() => setPreview(null)}>
          <img src={preview} alt="Attachment preview" style={s.lightboxImage} />
        </div>
      )}
    </>
  );
}