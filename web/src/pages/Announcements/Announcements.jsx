import { useState } from 'react';
import { useTheme } from '../../context/useTheme';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import getAnnouncementsStyles from '../../styles/AnnouncementsStyles';

// TODO: replace with API
const INITIAL_ANNOUNCEMENTS = [
  {
    _id: 'ann-1',
    title: 'Scheduled Water Interruption for Tank Cleaning',
    category: 'Maintenance',
    date: '2026-11-05T08:00:00Z',
    message:
      'Please be advised that the main water supply will be temporarily shut off on Saturday, November 8, from 8:00 AM to 1:00 PM for annual overhead water tank cleaning and maintenance. Please store sufficient water for your household needs beforehand.',
  },
  {
    _id: 'ann-2',
    title: 'Q4 General Homeowners Assembly Meeting',
    category: 'Notice',
    date: '2026-11-03T10:00:00Z',
    message:
      'The Board of Directors cordially invites all registered homeowners and residents to the 4th Quarter General Assembly on Saturday, November 22, at 3:00 PM at the Main Clubhouse. Agenda items include the 2027 fiscal budget presentation, community security upgrades, and open forum.',
  },
  {
    _id: 'ann-3',
    title: 'Deadline for Annual HOA Dues Settlement',
    category: 'Fees',
    date: '2026-10-28T09:30:00Z',
    message:
      'A friendly reminder to all unit owners that the deadline for fourth-quarter HOA assessment fees is on November 15. Unsettled accounts after this date will incur the standard 5% late surcharge. Payments may be submitted via online bank transfer or GCash through the dues portal.',
  },
  {
    _id: 'ann-4',
    title: 'Subdivision Speed Limit & Pet Leash Policy Enforcement',
    category: 'Reminder',
    date: '2026-10-20T14:00:00Z',
    message:
      'To ensure the safety of our children and pedestrians, security guards have been instructed to strictly enforce the 20 km/h vehicle speed limit within all village streets. Additionally, all pet owners are reminded to keep dogs on leashes at all times and clean up pet waste.',
  },
];

const CATEGORY_VARIANTS = {
  Notice: 'info',
  Maintenance: 'warning',
  Reminder: 'neutral',
  Fees: 'danger',
};

const CATEGORY_OPTIONS = [
  { value: 'Notice', label: 'Notice' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Reminder', label: 'Reminder' },
  { value: 'Fees', label: 'Fees' },
];

export default function Announcements() {
  const { colors } = useTheme();
  const s = getAnnouncementsStyles(colors);

  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Notice',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      category: 'Notice',
      message: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'Title is required';
    }
    if (!formData.message.trim()) {
      nextErrors.message = 'Message is required';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newAnnouncement = {
      _id: `ann-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      date: new Date().toISOString(),
      message: formData.message.trim(),
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setIsModalOpen(false);
    setFormData({ title: '', category: 'Notice', message: '' });
    setErrors({});
  };

  return (
    <div style={s.container}>
      <PageHeader
        title="Announcements"
        subtitle="Broadcast community updates, advisories, and notices to residents."
        action={
          <Button onClick={handleOpenModal}>New announcement</Button>
        }
      />

      <div style={s.list}>
        {announcements.length === 0 ? (
          <p style={s.emptyMessage}>No announcements posted yet.</p>
        ) : (
          announcements.map((item) => {
            const isExpanded = expandedIds.has(item._id);
            const dateStr = new Date(item.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <Card
                key={item._id}
                title={item.title}
                subtitle={dateStr}
                action={
                  <Badge variant={CATEGORY_VARIANTS[item.category] || 'neutral'}>
                    {item.category}
                  </Badge>
                }
              >
                <div style={s.cardBody}>
                  {isExpanded ? (
                    <p style={s.bodyFull}>{item.message}</p>
                  ) : (
                    <p style={s.bodyPreview}>{item.message}</p>
                  )}
                  <button
                    type="button"
                    style={s.toggleButton}
                    onClick={() => toggleExpand(item._id)}
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal
        open={isModalOpen}
        title="New announcement"
        onClose={handleCloseModal}
      >
        <form onSubmit={handleSubmit} style={s.form}>
          <Input
            label="Title"
            placeholder="e.g. Scheduled Water Interruption"
            value={formData.title}
            error={errors.title}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, title: e.target.value }));
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
          />

          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
          />

          <div style={s.textareaField}>
            <label htmlFor="announcement-message" style={s.textareaLabel}>
              Message
            </label>
            <textarea
              id="announcement-message"
              rows={4}
              style={{
                ...s.textarea,
                ...(errors.message ? s.textareaError : {}),
              }}
              placeholder="Write the full announcement details here..."
              value={formData.message}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, message: e.target.value }));
                if (errors.message) {
                  setErrors((prev) => ({ ...prev, message: undefined }));
                }
              }}
            />
            {errors.message && (
              <span style={s.messageError}>{errors.message}</span>
            )}
          </div>

          <div style={s.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit">Post announcement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

