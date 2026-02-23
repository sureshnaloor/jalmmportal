import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import Head from 'next/head';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import VendorFeedbackRatingCard from '../../components/VendorFeedbackRatingCard';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { computeCategoryOverall, computeFeedbackOverall } from '../../lib/vendorFeedbackRatingConfig';

const TIER_OPTIONS = [
  { value: '', label: 'Select tier...' },
  { value: 'top tier', label: 'Top tier' },
  { value: 'middle tier', label: 'Middle tier' },
  { value: 'lower tier', label: 'Lower tier' },
];

export default function MaterialGroupsVendorFeedbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { vendorCode, vendorName, subgroupId } = router.query;

  const [subgroups, setSubgroups] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [tierVotes, setTierVotes] = useState({ top: 0, middle: 0, lower: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tier, setTier] = useState('');
  const [ratingMaterials, setRatingMaterials] = useState({});
  const [ratingServices, setRatingServices] = useState({});
  const [comment, setComment] = useState('');

  const currentUserId = session?.user?.email || session?.user?.id || '';
  const userHasAlreadySubmitted = Boolean(
    currentUserId && feedbacks.some((f) => (f.userId || '').toString() === currentUserId.toString())
  );

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!router.isReady || !vendorCode) return;
    fetchSubgroups();
    fetchFeedback();
  }, [router.isReady, vendorCode]);

  const fetchSubgroups = async () => {
    if (!vendorCode) return;
    try {
      const res = await fetch(`/api/vendorgroupmap/subgroups-by-vendor?vendorCode=${encodeURIComponent(vendorCode)}`);
      if (res.ok) {
        const data = await res.json();
        setSubgroups(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching subgroups:', err);
    }
  };

  const fetchFeedback = async () => {
    if (!vendorCode) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/vendor-feedback/material?vendorCode=${encodeURIComponent(vendorCode)}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        setAverageRating(data.averageRating ?? 0);
        setTierVotes(data.tierVotes || { top: 0, middle: 0, lower: 0 });
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!vendorCode || !session) return;
    setSaving(true);
    try {
      const res = await fetch('/api/vendor-feedback/material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          vendorCode,
          vendorName: vendorName || '',
          tier: tier || undefined,
          ratingMaterials: Object.keys(ratingMaterials).length ? ratingMaterials : undefined,
          ratingServices: Object.keys(ratingServices).length ? ratingServices : undefined,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      setTier('');
      setRatingMaterials({});
      setRatingServices({});
      setComment('');
      toast.success('Feedback saved successfully!', { position: 'top-right', autoClose: 3000 });
      fetchFeedback();
    } catch (err) {
      toast.error(err.message || 'Failed to save feedback', { position: 'top-right', autoClose: 4000 });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <HeaderComponent />
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        <FooterComponent />
      </div>
    );
  }

  if (!session) return null;

  if (router.isReady && !vendorCode) {
    return (
      <>
        <HeaderComponent />
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.headerText}>Vendor feedback</h1>
            <button type="button" className={styles.newButton} onClick={() => router.push('/material-groups')}>
              Back to Material Groups
            </button>
          </div>
          <p style={{ padding: '20px' }}>Vendor not specified. Go back to map vendor and click the feedback icon for a vendor.</p>
        </div>
        <FooterComponent />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Vendor Feedback - {vendorName || vendorCode || 'Material Groups'}</title>
      </Head>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>Vendor feedback</h1>
          <button
            type="button"
            className={styles.newButton}
            onClick={() => router.push(subgroupId ? `/material-groups/map-vendor?subgroupId=${subgroupId}` : '/material-groups')}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
            Back to map vendor
          </button>
        </div>

        <div className={styles.content} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.groupsSection}>
            <h2 style={{ marginBottom: '16px' }}>Vendor details</h2>
            <p><strong>Vendor name:</strong> {vendorName || '—'}</p>
            <p><strong>Vendor code:</strong> {vendorCode || '—'}</p>
            {subgroups.length > 0 && (
              <p style={{ marginTop: '8px' }}>
                <strong>Subgroups mapped:</strong>{' '}
                {subgroups.map((sg) => `${sg.groupName} – ${sg.subgroupName}`).join('; ') || '—'}
              </p>
            )}

            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <h2 style={{ marginBottom: '16px' }}>Your feedback</h2>
            {userHasAlreadySubmitted && (
              <p style={{ marginBottom: '16px', padding: '12px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', color: '#92400e' }}>
                You have already submitted feedback for this vendor. You cannot submit again.
              </p>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label className="block" style={{ marginBottom: '6px', fontWeight: '600' }}>Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                disabled={userHasAlreadySubmitted}
                style={{ width: '100%', maxWidth: '280px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
              >
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="block" style={{ marginBottom: '8px', fontWeight: '600' }}>Rating (1–5 stars per parameter)</label>
              <VendorFeedbackRatingCard
                ratingMaterials={ratingMaterials}
                ratingServices={ratingServices}
                onMaterialsChange={setRatingMaterials}
                onServicesChange={setRatingServices}
                disabled={userHasAlreadySubmitted}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="block" style={{ marginBottom: '6px', fontWeight: '600' }}>Feedback (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Your feedback on the vendor's services..."
                rows={4}
                disabled={userHasAlreadySubmitted}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSave}
              disabled={saving || userHasAlreadySubmitted}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              title={userHasAlreadySubmitted ? 'You have already submitted feedback for this vendor' : ''}
            >
              <FontAwesomeIcon icon={faSave} />
              {saving ? 'Saving...' : userHasAlreadySubmitted ? 'Already submitted' : 'Save feedback'}
            </button>

            <hr style={{ margin: '32px 0 24px', border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <h2 style={{ marginBottom: '16px' }}>Feedback summary</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Average rating:</strong>{' '}
                    {averageRating > 0 ? (
                      <span style={{ color: '#b45309' }}>
                        {averageRating} / 5
                        <span style={{ marginLeft: '8px' }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <FontAwesomeIcon
                              key={n}
                              icon={faStar}
                              style={{
                                color: '#f59e0b',
                                marginRight: '2px',
                                opacity: n <= Math.round(averageRating) ? 1 : 0.35,
                              }}
                            />
                          ))}
                        </span>
                      </span>
                    ) : (
                      'No ratings yet'
                    )}
                    {feedbacks.length > 0 && (
                      <span style={{ marginLeft: '12px', color: '#6b7280', fontSize: '14px' }}>
                        ({feedbacks.length} rating{feedbacks.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Tier votes:</strong>{' '}
                    <span>Top tier: {tierVotes.top}</span>
                    <span style={{ marginLeft: '12px' }}>Middle tier: {tierVotes.middle}</span>
                    <span style={{ marginLeft: '12px' }}>Lower tier: {tierVotes.lower}</span>
                  </p>
                </div>

                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>All feedback</h3>
                {feedbacks.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>No feedback yet. Be the first to submit.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {feedbacks.map((f) => (
                      <div
                        key={f._id}
                        style={{
                          padding: '14px',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600' }}>{f.username || 'Unknown'}</span>
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            {f.createdAt && new Date(f.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {f.tier && (
                          <p style={{ margin: '4px 0', fontSize: '14px', color: '#4b5563' }}>Tier: {f.tier}</p>
                        )}
                        {(() => {
                          const matO = computeCategoryOverall(f.ratingMaterials || {});
                          const srvO = computeCategoryOverall(f.ratingServices || {});
                          const overall = computeFeedbackOverall(matO, srvO) ?? f.starRating;
                          if (overall == null) return null;
                          return (
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#b45309' }}>
                              Rating: {Number(overall).toFixed(1)} / 5
                              {[1, 2, 3, 4, 5].map((n) => (
                                <FontAwesomeIcon
                                  key={n}
                                  icon={faStar}
                                  style={{
                                    color: '#f59e0b',
                                    marginLeft: '2px',
                                    fontSize: '12px',
                                    opacity: n <= Math.round(overall) ? 1 : 0.35,
                                  }}
                                />
                              ))}
                              {(matO != null || srvO != null) && (
                                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>
                                  {matO != null && `Materials: ${matO.toFixed(1)}`}
                                  {matO != null && srvO != null && ' · '}
                                  {srvO != null && `Services: ${srvO.toFixed(1)}`}
                                </span>
                              )}
                            </p>
                          );
                        })()}
                        {f.comment && (
                          <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>{f.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: '/auth/login', permanent: false },
    };
  }
  return { props: {} };
}
